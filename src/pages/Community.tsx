import { useEffect, useRef, useState, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter } from 'bad-words'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import './Community.css'

const profanity = new Filter()

interface Post {
  id: string
  user_name: string
  user_avatar: string | null
  image_url: string
  caption: string | null
  created_at: string
  like_count?: number
  comment_count?: number
}

interface Comment {
  id: string
  user_name: string
  user_avatar: string | null
  body: string
  created_at: string
}

const EASE: [number,number,number,number] = [0.16, 1, 0.3, 1]
const MONTH = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const fmtDate = (iso: string) => { const d = new Date(iso); return `${MONTH[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` }
const isVideo = (url: string) => /\.(mp4|mov|webm|ogg)(\?|$)/i.test(url)

export default function Community() {
  const { user, signInWithGoogle } = useAuth()
  const [posts, setPosts]           = useState<Post[]>([])
  const [loading, setLoading]       = useState(true)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [preview, setPreview]       = useState<string | null>(null)
  const [file, setFile]             = useState<File | null>(null)
  const [caption, setCaption]       = useState('')
  const [uploading, setUploading]   = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [activePost, setActivePost] = useState<Post | null>(null)
  const [comments, setComments]     = useState<Comment[]>([])
  const [likedIds, setLikedIds]     = useState<Set<string>>(new Set())
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const [commentBody, setCommentBody] = useState('')
  const [postingComment, setPostingComment] = useState(false)
  const [loadingPost, setLoadingPost] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const commentRef = useRef<HTMLTextAreaElement>(null)

  const fetchPosts = useCallback(async () => {
    const { data } = await supabase
      .from('community_posts')
      .select('id,user_name,user_avatar,image_url,caption,created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (!data) { setLoading(false); return }

    // Fetch like + comment counts for all posts
    const ids = data.map(p => p.id)
    const [{ data: likes }, { data: comms }] = await Promise.all([
      supabase.from('community_likes').select('post_id').in('post_id', ids),
      supabase.from('community_comments').select('post_id').in('post_id', ids),
    ])

    const lc: Record<string, number> = {}
    const cc: Record<string, number> = {}
    likes?.forEach(l => { lc[l.post_id] = (lc[l.post_id] ?? 0) + 1 })
    comms?.forEach(c => { cc[c.post_id] = (cc[c.post_id] ?? 0) + 1 })

    setPosts(data.map(p => ({ ...p, like_count: lc[p.id] ?? 0, comment_count: cc[p.id] ?? 0 })))
    setLikeCounts(lc)

    // If signed in, fetch which posts user liked
    if (user) {
      const { data: myLikes } = await supabase
        .from('community_likes').select('post_id')
        .in('post_id', ids).eq('user_id', user.id)
      setLikedIds(new Set(myLikes?.map(l => l.post_id) ?? []))
    }
    setLoading(false)
  }, [user])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  async function openPost(p: Post) {
    setActivePost(p)
    setCommentBody('')
    setLoadingPost(true)
    const { data } = await supabase
      .from('community_comments')
      .select('id,user_name,user_avatar,body,created_at')
      .eq('post_id', p.id)
      .order('created_at', { ascending: true })
    setComments((data as Comment[]) ?? [])
    setLoadingPost(false)
  }

  async function toggleLike(postId: string) {
    if (!user) return
    const liked = likedIds.has(postId)
    if (liked) {
      await supabase.from('community_likes').delete().eq('post_id', postId).eq('user_id', user.id)
      setLikedIds(prev => { const s = new Set(prev); s.delete(postId); return s })
      setLikeCounts(prev => ({ ...prev, [postId]: Math.max(0, (prev[postId] ?? 1) - 1) }))
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, like_count: Math.max(0, (p.like_count ?? 1) - 1) } : p))
      if (activePost?.id === postId) setActivePost(prev => prev ? { ...prev, like_count: Math.max(0, (prev.like_count ?? 1) - 1) } : null)
    } else {
      await supabase.from('community_likes').insert({ post_id: postId, user_id: user.id })
      setLikedIds(prev => new Set([...prev, postId]))
      setLikeCounts(prev => ({ ...prev, [postId]: (prev[postId] ?? 0) + 1 }))
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, like_count: (p.like_count ?? 0) + 1 } : p))
      if (activePost?.id === postId) setActivePost(prev => prev ? { ...prev, like_count: (prev.like_count ?? 0) + 1 } : null)
    }
  }

  async function postComment() {
    if (!user || !activePost || !commentBody.trim() || postingComment) return
    if (profanity.isProfane(commentBody)) {
      alert('Your comment contains inappropriate language. Please keep it clean.')
      return
    }
    setPostingComment(true)
    const { data, error } = await supabase.from('community_comments').insert({
      post_id:    activePost.id,
      user_id:    user.id,
      user_name:  user.user_metadata?.full_name || 'Anonymous',
      user_avatar: user.user_metadata?.avatar_url || null,
      body:       commentBody.trim(),
    }).select().single()
    if (!error && data) {
      setComments(prev => [...prev, data as Comment])
      setPosts(prev => prev.map(p => p.id === activePost.id ? { ...p, comment_count: (p.comment_count ?? 0) + 1 } : p))
      setActivePost(prev => prev ? { ...prev, comment_count: (prev.comment_count ?? 0) + 1 } : null)
      setCommentBody('')
    }
    setPostingComment(false)
  }

  function openUpload() {
    setFile(null); setPreview(null); setCaption(''); setSubmitted(false)
    setUploadOpen(true)
  }

  function handleFile(f: File) {
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f && (f.type.startsWith('image/') || f.type.startsWith('video/'))) handleFile(f)
  }

  async function handleSubmit() {
    if (!file || !user || uploading) return
    if (caption.trim() && profanity.isProfane(caption)) {
      alert('Your caption contains inappropriate language. Please keep it clean.')
      return
    }
    setUploading(true)
    const ext  = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error: uploadErr } = await supabase.storage.from('community').upload(path, file)
    if (uploadErr) { alert('Upload failed: ' + uploadErr.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('community').getPublicUrl(path)
    const { error: insertErr } = await supabase.from('community_posts').insert({
      user_id:     user.id,
      user_name:   user.user_metadata?.full_name || 'Anonymous',
      user_avatar: user.user_metadata?.avatar_url || null,
      image_url:   publicUrl,
      caption:     caption.trim() || null,
      status:      'pending',
    })
    if (insertErr) { alert('Post failed: ' + insertErr.message); setUploading(false); return }
    setUploading(false)
    setSubmitted(true)
  }

  return (
    <>
      <Helmet><title>The Wall | Zoblends</title></Helmet>

      <div className="community">
        <motion.div className="community__header"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="community__eyebrow">The Community</span>
          <h1 className="community__title">The Wall</h1>
          <p className="community__sub">Fresh cuts from the chair. Post yours.</p>
          {user ? (
            <button className="community__upload-btn" onClick={openUpload}>+ Post Your Cut</button>
          ) : (
            <button className="community__upload-btn community__upload-btn--ghost" onClick={signInWithGoogle}>
              Sign in to post
            </button>
          )}
        </motion.div>

        {loading ? (
          <p className="community__loading">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="community__empty">No posts yet. Be the first.</p>
        ) : (
          <div className="community__grid">
            {posts.map((p, i) => (
              <motion.button key={p.id} className="community__card"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.45, ease: EASE }}
                onClick={() => openPost(p)}
              >
                {isVideo(p.image_url) ? (
                  <video src={p.image_url} className="community__card-img" muted playsInline />
                ) : (
                  <img src={p.image_url} alt={p.caption ?? 'Cut'} className="community__card-img" loading="lazy" />
                )}
                <div className="community__card-overlay">
                  <div className="community__card-stats">
                    {(p.like_count ?? 0) > 0 && <span>♥ {p.like_count}</span>}
                    {(p.comment_count ?? 0) > 0 && <span>💬 {p.comment_count}</span>}
                  </div>
                  <div className="community__card-user">
                    {p.user_avatar && <img src={p.user_avatar} className="community__card-avatar" alt="" />}
                    <span>{p.user_name.split(' ')[0]}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* ── Upload modal ── */}
      <AnimatePresence>
        {uploadOpen && (
          <>
            <motion.div className="community__backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !uploading && setUploadOpen(false)}
            />
            <motion.div className="community__modal"
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <button className="community__modal-close" onClick={() => !uploading && setUploadOpen(false)}>✕</button>
              {submitted ? (
                <div className="community__submitted">
                  <div className="community__submitted-icon">✓</div>
                  <p className="community__submitted-title">Post submitted!</p>
                  <p className="community__submitted-sub">Zo will review it before it goes live.</p>
                  <button className="community__upload-btn" style={{ marginTop: 24 }} onClick={() => setUploadOpen(false)}>Done</button>
                </div>
              ) : (
                <>
                  <span className="community__modal-eyebrow">Post Your Cut</span>
                  <h2 className="community__modal-title">Show the world</h2>
                  <div
                    className={`community__dropzone${preview ? ' community__dropzone--has-img' : ''}`}
                    onDragOver={e => e.preventDefault()}
                    onDrop={onDrop}
                    onClick={() => !preview && fileRef.current?.click()}
                  >
                    {preview ? (
                      <>
                        {file?.type.startsWith('video/') ? (
                          <video src={preview} className="community__dropzone-img" muted playsInline controls />
                        ) : (
                          <img src={preview} className="community__dropzone-img" alt="preview" />
                        )}
                        <button className="community__dropzone-change" onClick={e => { e.stopPropagation(); fileRef.current?.click() }}>Change</button>
                      </>
                    ) : (
                      <div className="community__dropzone-placeholder">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(212,175,55,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <p>Photo or video</p>
                        <p style={{ opacity: 0.4, fontSize: 10 }}>tap to choose · drag and drop</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={onFileChange} />
                  <textarea
                    className="community__caption"
                    placeholder="Add a caption (optional)…"
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    rows={2}
                    maxLength={200}
                  />
                  <button
                    className="community__upload-btn"
                    style={{ width: '100%', marginTop: 8 }}
                    disabled={!file || uploading}
                    onClick={handleSubmit}
                  >
                    {uploading ? 'Uploading…' : 'Submit for Review →'}
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Post detail modal ── */}
      <AnimatePresence>
        {activePost && (
          <>
            <motion.div className="community__backdrop community__backdrop--dark"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActivePost(null)}
            />
            <motion.div className="community__post-modal"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              <button className="community__modal-close" onClick={() => setActivePost(null)}>✕</button>

              {/* Media */}
              <div className="community__post-media">
                {isVideo(activePost.image_url) ? (
                  <video src={activePost.image_url} className="community__post-img" controls playsInline />
                ) : (
                  <img src={activePost.image_url} className="community__post-img" alt="" />
                )}
              </div>

              {/* Post body */}
              <div className="community__post-body">
                {/* User + date */}
                <div className="community__post-user">
                  {activePost.user_avatar && <img src={activePost.user_avatar} className="community__post-avatar" alt="" />}
                  <div>
                    <span className="community__post-name">{activePost.user_name}</span>
                    <span className="community__post-date">{fmtDate(activePost.created_at)}</span>
                  </div>
                </div>

                {activePost.caption && <p className="community__post-caption">{activePost.caption}</p>}

                {/* Like button */}
                <div className="community__post-actions">
                  <button
                    className={`community__like-btn${likedIds.has(activePost.id) ? ' community__like-btn--liked' : ''}`}
                    onClick={() => user ? toggleLike(activePost.id) : signInWithGoogle()}
                  >
                    {likedIds.has(activePost.id) ? '♥' : '♡'}
                    <span>{likeCounts[activePost.id] ?? activePost.like_count ?? 0}</span>
                  </button>
                  <span className="community__post-comment-count">
                    💬 {comments.length}
                  </span>
                </div>

                {/* Comments */}
                <div className="community__comments">
                  {loadingPost ? (
                    <p className="community__comments-loading">Loading…</p>
                  ) : comments.length === 0 ? (
                    <p className="community__comments-empty">No comments yet.</p>
                  ) : (
                    comments.map(c => (
                      <div key={c.id} className="community__comment">
                        {c.user_avatar ? (
                          <img src={c.user_avatar} className="community__comment-avatar" alt="" />
                        ) : (
                          <div className="community__comment-avatar community__comment-avatar--placeholder" />
                        )}
                        <div className="community__comment-body">
                          <span className="community__comment-name">{c.user_name.split(' ')[0]}</span>
                          <span className="community__comment-text">{c.body}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add comment */}
                {user ? (
                  <div className="community__add-comment">
                    <textarea
                      ref={commentRef}
                      className="community__comment-input"
                      placeholder="Add a comment…"
                      value={commentBody}
                      onChange={e => setCommentBody(e.target.value)}
                      rows={1}
                      maxLength={300}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); postComment() } }}
                    />
                    <button
                      className="community__comment-post"
                      disabled={!commentBody.trim() || postingComment}
                      onClick={postComment}
                    >
                      {postingComment ? '…' : '↑'}
                    </button>
                  </div>
                ) : (
                  <button className="community__upload-btn community__upload-btn--ghost" style={{ width: '100%', marginTop: 16 }} onClick={signInWithGoogle}>
                    Sign in to comment
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
