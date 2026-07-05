import { useRef, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import HeroSection from '../components/hero/HeroSection'
import NewsletterBanner from '../components/layout/NewsletterBanner'
import './Home.css'

function GaragePixel() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    function seek() {
      if (!isFinite(video!.duration) || video!.duration < 4) return
      video!.currentTime = video!.duration - 4
      video!.play().catch(() => {})
    }

    function loopClip() {
      if (!isFinite(video!.duration)) return
      if (video!.currentTime >= video!.duration - 0.15) {
        video!.currentTime = video!.duration - 4
      }
    }

    if (video.readyState >= 1) {
      seek()
    }
    video.addEventListener('loadedmetadata', seek, { once: true })
    video.addEventListener('canplay', seek, { once: true })

    video.addEventListener('timeupdate', loopClip)

    return () => {
      video.removeEventListener('loadedmetadata', seek)
      video.removeEventListener('canplay', seek)
      video.removeEventListener('timeupdate', loopClip)
    }
  }, [])

  return (
    <section className="home-garage">
      <video
        ref={videoRef}
        className="home-garage__video"
        src="https://mhhagaztfurgivlspdss.supabase.co/storage/v1/object/public/videos/zoview.mp4"
        muted
        playsInline
        preload="auto"
      />
      <div className="home-garage__overlay" />
      <div className="home-garage__text">
        <span className="home-garage__label">The Experience</span>
        <h2 className="home-garage__heading">Welcome to<br />the Garage</h2>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Helmet>
        <title>ZOBLENDS | Precision Cuts, Premium Experience</title>
        <meta name="description" content="Book your chair with Zoblends. Precision fades, cuts and lineups in Ottawa." />
      </Helmet>

      <HeroSection />

      <GaragePixel />

      <NewsletterBanner />
    </>
  )
}
