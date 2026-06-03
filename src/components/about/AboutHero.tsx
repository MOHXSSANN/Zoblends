import { motion } from 'framer-motion'
import './AboutHero.css'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export default function AboutHero() {
  return (
    <section className="about-hero">

      {/* Video */}
      <div className="about-hero__video-wrap" aria-hidden="true">
        <video
          className="about-hero__video"
          src="https://mhhagaztfurgivlspdss.supabase.co/storage/v1/object/public/videos/0601.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        <div className="about-hero__overlay" />
        <div className="about-hero__fade-bottom" />
      </div>

      {/* Content */}
      <div className="about-hero__content">
        <motion.span
          className="about-hero__eyebrow"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: EASE }}
        >
          02 / The Barber
        </motion.span>

        <motion.h1
          className="about-hero__name"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: EASE }}
        >
          Zawad
        </motion.h1>

        <motion.p
          className="about-hero__title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          Your Barber's Favourite Barber
        </motion.p>
      </div>

    </section>
  )
}
