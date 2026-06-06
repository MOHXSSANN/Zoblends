import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import './Community.css'

interface Post {
  id: string
  user_name: string
  user_avatar: string | null
  image_url: string
  caption: string | null
  created_at: string
}

const EASE: [number,number,number,number] = [0.16, 1, 0.3, 1]
const MONTH = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const fmtDate = (iso: string) => { const d = new Date(iso); return `${MONTH[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` }

export default function Community() {
  const { user, signInWithGoogle } = useAuth()
  const [posts, setPosts]         = useState<Post[]>([])
  const [loading, setLoading]     = useState(true)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [preview, setPreview]     = useState<string | null>(null)
  const [file, setFile]           = useState<File | null>(null)
  const [caption, setCaption]     = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [lightbox, setLightbox]   = useState<Post | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.from('community_posts')
      .select('id,user_name,user_avatar,image_url,caption,created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setPosts((data as Post[]) ?? []); setLoading(false) })
  }, [])

  function openUpload() {
    setFile(null); setPreview(null); setCaption(''); setSubmitted(false)
    setUploadOpen(true)
  }

  function handleFile(f: File) {
    setFile(f)
    const url = URL.createObjectURL(f)
    setPreview(url)
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f && f.type.startsWith('image/')) handleFile(f)
  }

  async function handleSubmit() {
    if (!file || !user || uploading) return
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
      <Helmet><title>Community | Zoblends</title></Helmet>

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
                onClick={() => setLightbox(p)}
              >
                <img src={p.image_url} alt={p.caption ?? 'Cut'} className="community__card-img" loading="lazy" />
                <div className="community__card-overlay">
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

                  {/* Drop zone */}
                  <div
                    className={`community__dropzone${preview ? ' community__dropzone--has-img' : ''}`}
                    onDragOver={e => e.preventDefault()}
                    onDrop={onDrop}
                    onClick={() => !preview && fileRef.current?.click()}
                  >
                    {preview ? (
                      <>
                        <img src={preview} className="community__dropzone-img" alt="preview" />
                        <button className="community__dropzone-change" onClick={e => { e.stopPropagation(); fileRef.current?.click() }}>Change photo</button>
                      </>
                    ) : (
                      <div className="community__dropzone-placeholder">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(212,175,55,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <p>Tap to choose a photo</p>
                        <p style={{ opacity: 0.4, fontSize: 10 }}>or drag and drop</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />

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

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox && (
          <>
            <motion.div className="community__backdrop community__backdrop--dark"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setLightbox(null)}
            />
            <motion.div className="community__lightbox"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              <button className="community__modal-close" onClick={() => setLightbox(null)}>✕</button>
              <img src={lightbox.image_url} className="community__lightbox-img" alt="" />
              <div className="community__lightbox-meta">
                <div className="community__card-user" style={{ justifyContent: 'center' }}>
                  {lightbox.user_avatar && <img src={lightbox.user_avatar} className="community__card-avatar" alt="" />}
                  <span>{lightbox.user_name}</span>
                </div>
                {lightbox.caption && <p className="community__lightbox-caption">{lightbox.caption}</p>}
                <p className="community__lightbox-date">{fmtDate(lightbox.created_at)}</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
