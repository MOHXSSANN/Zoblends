import { Helmet } from 'react-helmet-async'
import HeroSection from '../components/hero/HeroSection'
import NewsletterBanner from '../components/layout/NewsletterBanner'
import './Home.css'

function GaragePixel() {
  return (
    <div className="home-garage">
      <video
        className="home-garage__video"
        src="/zo3d/Zo3dmap.mp4"
        autoPlay
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
