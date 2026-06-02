import { Helmet } from 'react-helmet-async'
import HeroSection from '../components/hero/HeroSection'
import './Home.css'

export default function Home() {
  return (
    <>
      <Helmet>
        <title>ZOBLENDS — Precision Cuts, Premium Experience</title>
        <meta name="description" content="Book your chair with Zoblends. Precision fades, cuts and lineups in London." />
      </Helmet>

      <HeroSection />

      {/* Placeholder sections — to be built out */}
      <section className="home-section home-section--featured">
        <div className="home-section__label">01 — Featured Work</div>
        <p className="home-section__placeholder">Gallery coming soon</p>
      </section>

      <section className="home-section home-section--about">
        <div className="home-section__label">02 — About Zoblends</div>
        <p className="home-section__placeholder">About section coming soon</p>
      </section>
    </>
  )
}
