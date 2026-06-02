import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../../lib/CartContext'
import './Navbar.css'

const NAV_LINKS = [
  { label: 'The Receipts', href: '/gallery' },
  { label: 'The Barber',   href: '/about'   },
  { label: 'Reviews',      href: '/reviews' },
  { label: 'Shop',         href: '/shop'    },
  { label: 'Get in Touch', href: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [hidden, setHidden]       = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const location = useLocation()
  const { count } = useCart()

  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 40)
      if (y < 80) { setHidden(false) }
      else if (y > lastY + 4) { setHidden(true); setMenuOpen(false) }
      else if (y < lastY - 4) { setHidden(false) }
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  return (
    <motion.header
      className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: hidden ? '-100%' : 0, opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: hidden ? 0 : 0.2 }}
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
        <Link to="/shop" className="navbar__cart-icon" aria-label="Cart">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          {count > 0 && <span className="navbar__cart-count">{count}</span>}
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
