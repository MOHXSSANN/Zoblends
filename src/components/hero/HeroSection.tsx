import { motion } from 'framer-motion'
import './HeroSection.css'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export default function HeroSection() {
  return (
    <section className="hero-section">

      {/* ── Video ── */}
      <div className="hero-section__video-wrap" aria-hidden="true">
        <video
          className="hero-section__video"
          src="/Zovid.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        <div className="hero-section__overlay" />
        <div className="hero-section__fade-top" />
        <div className="hero-section__fade-bottom" />
      </div>

      {/* ── Centred brand ── */}
      <div className="hero-section__center">
        <motion.h1
          className="hero-section__title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
        >
          ZOBLENDS
        </motion.h1>
        <motion.p
          className="hero-section__tagline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          Precision Cuts · Ottawa, Ontario
        </motion.p>
      </div>

      {/* ── Bottom: CTA pinned ── */}
      <motion.div
        className="hero-section__bottom"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.7, ease: EASE }}
      >
        <a href="/book" className="hero-section__cta">
          Secure a Spot
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hero-section__instagram"
        >
          ✦ Instagram
        </a>
      </motion.div>

    </section>
  )
}
