import { Helmet } from 'react-helmet-async'
import HeroSection from '../components/hero/HeroSection'
import NewsletterBanner from '../components/layout/NewsletterBanner'
import './Home.css'

export default function Home() {
  return (
    <>
      <Helmet>
        <title>ZOBLENDS | Precision Cuts, Premium Experience</title>
        <meta name="description" content="Book your chair with Zoblends. Precision fades, cuts and lineups in Ottawa." />
      </Helmet>

      <HeroSection />

      <section className="home-section home-section--featured">
        <div className="home-section__label">01 / Featured Work</div>
        <p className="home-section__placeholder">Gallery coming soon</p>
      </section>

      <NewsletterBanner />
    </>
  )
}
