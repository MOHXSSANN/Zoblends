import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './Navbar.css'

const NAV_LINKS = [
  { label: 'The Receipts', href: '/gallery' },
  { label: 'The Barber',   href: '/about'   },
  { label: 'Reviews',      href: '/reviews' },
  { label: 'Get in Touch', href: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  return (
    <motion.header
      className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.2 }}
    >
      <Link to="/" className="navbar__logo" aria-label="Zoblends home">
        ZoBlends
      </Link>

      <nav className="navbar__links" aria-label="Primary navigation">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} to={link.href} className="navbar__link">
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="navbar__actions">
        <Link to="/book" className="navbar__cta">
          Book Now
        </Link>
        <button
          className={`navbar__burger${menuOpen ? ' navbar__burger--open' : ''}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="navbar__mobile-menu"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
              >
                <Link to={link.href} className="navbar__mobile-link">{link.label}</Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: NAV_LINKS.length * 0.06, duration: 0.3 }}
            >
              <Link to="/book" className="navbar__mobile-cta">Book Now</Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
