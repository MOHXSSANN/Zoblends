import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import BeforeAfter from '../components/gallery/BeforeAfter'
import './Page.css'
import './Gallery.css'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

// ── Before / After pairs ─────────────────────────────────────────────────────
const BEFORE_AFTERS = [
  {
    before: '/B4andAFTER/IMG_1584.jpg',
    after:  '/B4andAFTER/IMG_1587.jpg',
    label: 'Slick Back',
  },
  {
    before: '/B4andAFTER/IMG_1613.jpg',
    after:  '/B4andAFTER/IMG_1615.jpg',
    label: 'Curly Fade',
  },
  {
    before: '/B4andAFTER/IMG_1634.jpg',
    after:  '/B4andAFTER/IMG_1638.jpg',
    label: 'Textured Crop',
  },
]

// ── Photo grid ───────────────────────────────────────────────────────────────
const PHOTOS: { src: string; tag: string }[] = [
  { src: '/B4andAFTER/IMG_0487.jpeg', tag: 'Taper Fade' },
  { src: '/B4andAFTER/IMG_1616.jpg',  tag: 'Curly Fade' },
  { src: '/B4andAFTER/IMG_1639.jpg',  tag: 'Textured Crop' },
  { src: '/B4andAFTER/IMG_6612.png',  tag: 'Fade' },
]

// ── Videos ───────────────────────────────────────────────────────────────────
const VIDEOS: { src: string; poster?: string; label: string }[] = [
  {
    src: 'https://mhhagaztfurgivlspdss.supabase.co/storage/v1/object/public/videos/Zovid.mp4',
    label: 'Taper Process',
  },
  { src: '/B4andAFTER/IMG_1195.mov', label: 'The Process' },
  { src: '/B4andAFTER/IMG_1199.mov', label: 'The Detail' },
  { src: '/B4andAFTER/IMG_6614.MOV', label: 'The Blend' },
  { src: '/B4andAFTER/IMG_6750.MOV', label: 'The Finish' },
]

type Tab = 'photos' | 'before-after' | 'videos'

export default function Gallery() {
  const [tab, setTab] = useState<Tab>('before-after')

  return (
    <>
      <Helmet>
        <title>The Receipts | Zoblends</title>
        <meta name="description" content="See the work. Precision fades, cuts and lineups by Zoblends, Ottawa." />
      </Helmet>

      <div className="page">
        <motion.div
          className="page__header"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="page__eyebrow">01 / Gallery</span>
          <h1 className="page__title">The Receipts</h1>
          <p className="page__sub">Every cut. Documented.</p>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div
          className="gallery__tabs"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5, ease: EASE }}
        >
          {(['before-after', 'photos', 'videos'] as Tab[]).map((t) => (
            <button
              key={t}
              className={`gallery__tab${tab === t ? ' gallery__tab--active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'before-after' ? 'Before / After' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* ── Before / After ── */}
        {tab === 'before-after' && (
          <motion.div
            className="gallery__ba-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {BEFORE_AFTERS.map((item) =>
              item.before && item.after ? (
                <BeforeAfter key={item.label} before={item.before} after={item.after} label={item.label} />
              ) : (
                <div key={item.label} className="gallery__placeholder">
                  <span>{item.label}</span>
                  <p>Coming soon</p>
                </div>
              )
            )}
          </motion.div>
        )}

        {/* ── Photos ── */}
        {tab === 'photos' && (
          <motion.div
            className="gallery__photo-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {PHOTOS.map((p, i) =>
              p.src ? (
                <motion.div
                  key={i}
                  className="gallery__photo-item"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.5, ease: EASE }}
                  whileHover={{ scale: 1.02 }}
                >
                  <img src={p.src} alt={p.tag} />
                  <span className="gallery__photo-tag">{p.tag}</span>
                </motion.div>
              ) : (
                <div key={i} className="gallery__placeholder">
                  <span>{p.tag}</span>
                  <p>Coming soon</p>
                </div>
              )
            )}
          </motion.div>
        )}

        {/* ── Videos ── */}
        {tab === 'videos' && (
          <motion.div
            className="gallery__video-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {VIDEOS.map((v, i) =>
              v.src ? (
                <motion.div
                  key={i}
                  className="gallery__video-item"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: EASE }}
                >
                  <video
                    src={v.src}
                    poster={v.poster}
                    controls
                    playsInline
                    preload="metadata"
                  />
                  <span className="gallery__video-label">{v.label}</span>
                </motion.div>
              ) : (
                <div key={i} className="gallery__placeholder">
                  <span>{v.label}</span>
                  <p>Coming soon</p>
                </div>
              )
            )}
          </motion.div>
        )}
      </div>
    </>
  )
}
