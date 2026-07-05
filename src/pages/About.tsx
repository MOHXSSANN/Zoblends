import { useRef, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import AboutHero  from '../components/about/AboutHero'
import ShopScroll from '../components/about/ShopScroll'
import AboutStats from '../components/about/AboutStats'
import './About.css'

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
    <div className="about-garage">
      <video
        ref={videoRef}
        className="about-garage__video"
        src="/zo3d/Zo3dmap.mp4"
        muted
        loop
        playsInline
        preload="auto"
      />
    </div>
  )
}

export default function About() {
  return (
    <>
      <Helmet>
        <title>The Barber | Zoblends</title>
        <meta name="description" content="The story behind Zoblends. Precision cuts and premium experience in Ottawa, Ontario." />
      </Helmet>

      <AboutHero />

      <GaragePixel />

      <ShopScroll />

      <AboutStats />
    </>
  )
}
