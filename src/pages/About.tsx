import { Helmet } from 'react-helmet-async'
import AboutHero  from '../components/about/AboutHero'
import ShopScroll from '../components/about/ShopScroll'
import AboutStats from '../components/about/AboutStats'

export default function About() {
  return (
    <>
      <Helmet>
        <title>The Barber — Zoblends</title>
        <meta name="description" content="The story behind Zoblends. Precision cuts and premium experience in Ottawa, Ontario." />
      </Helmet>

      <AboutHero />

      {/* TODO: Zo's bio / story section goes here */}

      <ShopScroll />

      <AboutStats />
    </>
  )
}
