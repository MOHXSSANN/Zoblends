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
    const onMeta = () => {
      if (video.duration > 4) video.currentTime = video.duration - 4
      video.play().catch(() => {})
    }
    video.addEventListener('loadedmetadata', onMeta)
    return () => video.removeEventListener('loadedmetadata', onMeta)
  }, [])

  return (
    <div className="home-garage">
      <video
        ref={videoRef}
        className="home-garage__video"
        src="/zo3d/Zo3dmap.mp4"
        muted
        loop
        playsInline
        preload="auto"
      />
    </div>
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
