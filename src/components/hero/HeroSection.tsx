import { motion } from 'framer-motion'
import MetallicPaint from '../ui/MetallicPaint'
import BookNowKey from '../ui/BookNowKey'
import './HeroSection.css'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export default function HeroSection() {
  return (
    <section className="hero-section">

      {/* ── Video ── */}
      <div className="hero-section__video-wrap" aria-hidden="true">
        <video
          className="hero-section__video"
          src="https://mhhagaztfurgivlspdss.supabase.co/storage/v1/object/public/videos/Zovid.mp4"
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

      {/* ── Metallic logo ── */}
      <motion.div
        className="hero-section__logo-wrap"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 1.0, ease: EASE }}
      >
        <MetallicPaint
          imageSrc="/zoLogo.png"
          seed={12}
          scale={3}
          liquid={0.6}
          speed={0.25}
          brightness={2.6}
          contrast={0.55}
          fresnel={1.8}
          refraction={0.018}
          blur={0.012}
          chromaticSpread={1.8}
          waveAmplitude={0.9}
          noiseScale={0.45}
          patternSharpness={1.2}
          distortion={0.6}
          contour={0.25}
          lightColor="#ffe97a"
          darkColor="#4a2e00"
          tintColor="#ffffff"
          mouseAnimation
        />
      </motion.div>

      {/* ── Tagline ── */}
      <motion.p
        className="hero-section__tagline"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
      >
        Precision Cuts · Ottawa, Ontario
      </motion.p>

      {/* ── Bottom CTA ── */}
      <motion.div
        className="hero-section__bottom"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.7, ease: EASE }}
      >
        <BookNowKey />
        <a
          href="https://instagram.com/zo_blendz_"
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
