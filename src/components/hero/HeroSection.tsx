import { motion } from 'framer-motion'
import MetallicPaint from '../ui/MetallicPaint'
import { Link } from 'react-router-dom'
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
          seed={42}
          scale={4}
          patternSharpness={1}
          noiseScale={0.5}
          speed={0.3}
          liquid={0.75}
          mouseAnimation={false}
          brightness={2}
          contrast={0.5}
          refraction={0.01}
          blur={0.015}
          chromaticSpread={2}
          fresnel={1}
          angle={0}
          waveAmplitude={1}
          distortion={1}
          contour={0.2}
          lightColor="#b1902a"
          darkColor="#000000"
          tintColor="#ffffff"
        />
      </motion.div>

      {/* ── Tagline ── */}
      <motion.p
        className="hero-section__tagline"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
      >
        Your Barber's Favourite Barber
      </motion.p>

      {/* ── Bottom CTA ── */}
      <motion.div
        className="hero-section__bottom"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.7, ease: EASE }}
      >
        <Link to="/book" className="hero-section__cta">Book Now</Link>
      </motion.div>

    </section>
  )
}
