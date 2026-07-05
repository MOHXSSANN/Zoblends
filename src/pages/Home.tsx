import { Helmet } from 'react-helmet-async'
import HeroSection from '../components/hero/HeroSection'
import NewsletterBanner from '../components/layout/NewsletterBanner'
import './Home.css'

function GaragePixel() {
  return (
    <section className="home-garage">
      <video
        className="home-garage__video"
        src="/zo3d/Zo3dmap.mp4"
        autoPlay
        muted
        loop
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
