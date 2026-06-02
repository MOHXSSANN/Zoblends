import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import './HeroNav.css'

const ITEMS = [
  { label: 'Book',    sub: 'Reserve your chair', href: '/book'    },
  { label: 'Gallery', sub: 'See the work',        href: '/gallery' },
  { label: 'Reviews', sub: 'What they say',       href: '/reviews' },
  { label: 'About',   sub: 'The story',           href: '/about'   },
  { label: 'Contact', sub: 'Find us',             href: '/contact' },
]

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 1.4, // after hex lights have mostly powered on
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 28 },
  show:   {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
}

export default function HeroNav() {
  return (
    <motion.nav
      className="hero-nav"
      variants={container}
      initial="hidden"
      animate="show"
      aria-label="Hero navigation"
    >
      {ITEMS.map((nav) => (
        <motion.div key={nav.href} variants={item} className="hero-nav__item-wrap">
          <Link to={nav.href} className="hero-nav__item">
            {/* spotlight cone from the hex grid above */}
            <span className="hero-nav__spotlight" aria-hidden="true" />
            <span className="hero-nav__label">{nav.label}</span>
            <span className="hero-nav__sub">{nav.sub}</span>
            <span className="hero-nav__arrow" aria-hidden="true">→</span>
          </Link>
        </motion.div>
      ))}
    </motion.nav>
  )
}
