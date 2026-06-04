import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../../lib/CartContext'
import { useAuth } from '../../lib/AuthContext'
import { PRODUCTS } from '../../lib/products'
import './Navbar.css'

const NAV_LINKS = [
  { label: 'The Receipts',  href: '/gallery'  },
  { label: 'The Barber',    href: '/about'    },
  { label: 'Reviews',       href: '/reviews'  },
  { label: 'Shop Products', href: '/shop'     },
  { label: 'Get in Touch',  href: '/contact'  },
]

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export default function Navbar() {
  const [scrolled, setScrolled]         = useState(false)
  const [hidden, setHidden]             = useState(false)
  const [menuOpen, setMenuOpen]         = useState(false)
  const [cartOpen, setCartOpen]         = useState(false)
  const [checkingOut, setCheckingOut]   = useState(false)
  const location = useLocation()
  const { add, items, remove, total, count } = useCart()
  const { user, signInWithGoogle, signOut } = useAuth()

  async function handleCheckout() {
    if (!items.length || checkingOut) return
    setCheckingOut(true)
    try {
      const res = await fetch('/api/create-shop-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customerEmail: user?.email }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      alert('Checkout failed. Please try again.')
    } finally {
      setCheckingOut(false)
    }
  }

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

  useEffect(() => { setMenuOpen(false); setCartOpen(false) }, [location])

  useEffect(() => {
    const locked = menuOpen || cartOpen
    if (locked) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
    } else {
      const top = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      if (top) window.scrollTo(0, -parseInt(top, 10))
    }
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
    }
  }, [menuOpen, cartOpen])

  // Always show navbar when menu or cart is open
  const navHidden = hidden && !menuOpen && !cartOpen

  function handleAdd(p: typeof PRODUCTS[0]) {
    add({ id: p.id, name: p.name, price: p.price })
  }

  return (
    <>
      <motion.header
        className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: navHidden ? '-100%' : 0, opacity: navHidden ? 0 : 1 }}
        transition={{ duration: 0.35, ease: EASE, delay: navHidden ? 0 : 0.2 }}
      >
        <div className="navbar__inner">
        <Link to="/" className="navbar__logo" aria-label="Zoblends home">
          <span className="navbar__logo-text">ZOBLENDS</span>
        </Link>

        <nav className="navbar__links" aria-label="Primary navigation">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} to={link.href} className="navbar__link">{link.label}</Link>
          ))}
        </nav>

        <div className="navbar__actions">
          <Link to="/book" className="navbar__cta heartbeateffect">Book Now</Link>
          <button
            className="navbar__cart-icon"
            aria-label="Open cart"
            onClick={() => setCartOpen(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {count > 0 && <span className="navbar__cart-count">{count}</span>}
          </button>
          <button
            className={`navbar__burger${menuOpen ? ' navbar__burger--open' : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
        </div>
      </motion.header>

      {/* ── Cart drawer — outside header so transform doesn't clip it ── */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              className="navbar__cart-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              className="navbar__cart-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <div className="navbar__cart-header">
                <span>Your Cart</span>
                <button onClick={() => setCartOpen(false)}>✕</button>
              </div>

              {items.length === 0 ? (
                <div className="navbar__cart-empty">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(245,244,240,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                  <p className="navbar__cart-empty-title">Your cart is empty</p>
                  <p className="navbar__cart-empty-sub">Add a product to get started</p>
                  <div className="navbar__cart-recs">
                    <p className="navbar__cart-recs-label">Recommended</p>
                    {PRODUCTS.slice(0, 3).map(p => (
                      <div key={p.id} className="navbar__cart-rec-item">
                        <div className="navbar__cart-rec-info">
                          <span className="navbar__cart-rec-name">{p.name}</span>
                          <span className="navbar__cart-rec-price">{p.price}</span>
                        </div>
                        <button className="navbar__cart-rec-add" onClick={() => handleAdd(p)}>
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="navbar__cart-items">
                    {items.map(item => (
                      <div key={item.id} className="navbar__cart-item">
                        <div>
                          <span className="navbar__cart-item-name">{item.name}</span>
                          <span className="navbar__cart-item-meta">{item.price} × {item.qty}</span>
                        </div>
                        <button className="navbar__cart-remove" onClick={() => remove(item.id)}>✕</button>
                      </div>
                    ))}
                  </div>
                  <div className="navbar__cart-footer">
                    <div className="navbar__cart-total-row">
                      <span className="navbar__cart-total-label">Total</span>
                      <span className="navbar__cart-total">${total.toFixed(2)} CAD</span>
                    </div>
                    <button
                      className="navbar__checkout-btn"
                      onClick={handleCheckout}
                      disabled={checkingOut}
                    >
                      {checkingOut ? (
                        <span className="navbar__checkout-btn-inner">
                          <span className="navbar__checkout-spinner" />
                          Redirecting…
                        </span>
                      ) : (
                        <span className="navbar__checkout-btn-inner" style={{ padding: '16px 20px' }}>
                          PLACE ORDER →
                        </span>
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Full-screen menu — outside header so transform doesn't clip it ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="navbar__overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <nav className="navbar__overlay-links">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.06, duration: 0.35, ease: EASE }}
                >
                  <Link to={link.href} className="navbar__overlay-link">{link.label}</Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + NAV_LINKS.length * 0.06, duration: 0.35, ease: EASE }}
              >
                <Link to="/book" className="navbar__overlay-cta heartbeateffect">Book Now</Link>
              </motion.div>
            </nav>

            <motion.div
              className="navbar__overlay-footer"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.35, ease: EASE }}
            >
              <div className="navbar__overlay-divider" />
              {user ? (
                <div className="navbar__overlay-account">
                  <div className="navbar__overlay-user">
                    {user.user_metadata?.avatar_url && (
                      <img className="navbar__overlay-avatar" src={user.user_metadata.avatar_url} alt="" />
                    )}
                    <span className="navbar__overlay-username">
                      {user.user_metadata?.full_name?.split(' ')[0] ?? 'Account'}
                    </span>
                  </div>
                  <div className="navbar__overlay-account-links">
                    <Link to="/my-bookings" className="navbar__overlay-account-link">My Bookings</Link>
                    {(user.email === 'mo.hxssan360@gmail.com' || user.user_metadata?.email === 'mo.hxssan360@gmail.com') && (
                      <Link to="/admin" className="navbar__overlay-account-link">Admin</Link>
                    )}
                    <button className="navbar__overlay-signout" onClick={signOut}>Sign Out</button>
                  </div>
                </div>
              ) : (
                <button className="navbar__overlay-signin" onClick={signInWithGoogle}>
                  <svg width="16" height="16" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.66l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Sign in with Google
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
