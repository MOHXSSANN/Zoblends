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
    before: '/B4andAFTER/fb7d4da9-eb4f-491e-a10b-f5418ed0b217.png',
    after:  '/B4andAFTER/2bfe1200-2e12-4608-b109-677c7b2efbf8.png',
    label: 'Curly Fade',
    afterScale: 1.2,
  },
  {
    before: '/B4andAFTER/7ef68d33-b64d-433f-a6ed-9a6c4119cf64.png',
    after:  '/B4andAFTER/ab32c5c4-6d5c-49d4-83ae-d297237d4abd.png',
    label: 'Textured Crop',
  },
  {
    before: '/B4andAFTER/za.png',
    after:  '/B4andAFTER/ze.png',
    label: 'Signature Blend',
  },
]

// ── Photo grid ───────────────────────────────────────────────────────────────
const PHOTOS: { src: string; tag: string }[] = [
  { src: '/B4andAFTER/a3865943-2aa4-4a35-bb18-a167327bf574.png', tag: 'Slick Back' },
  { src: '/B4andAFTER/75bfa533-fc0e-43c8-8fe5-fd22e6de403f.png', tag: 'Afro Fade' },
  { src: '/B4andAFTER/a013fd32-0db8-442a-ba1e-4b4107867eb0.png', tag: 'Textured Crop' },
  { src: '/B4andAFTER/9257a01e-ec32-4667-823a-2db67b9054c2.png', tag: 'Curly Fade' },
  { src: '/B4andAFTER/ed12293c-ac90-4bfc-9e9b-4eaffc1e61a3.png', tag: 'Curly Fade' },
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
                <BeforeAfter key={item.label} before={item.before} after={item.after} label={item.label} afterScale={(item as any).afterScale} beforeScale={(item as any).beforeScale} />
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
                    poster={v.poster}
                    controls
                    playsInline
                    preload="metadata"
                  >
                    <source src={v.src} type="video/mp4" />
                    <source src={v.src} type="video/quicktime" />
                  </video>
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
