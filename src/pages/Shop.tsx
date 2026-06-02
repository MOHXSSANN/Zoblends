import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../lib/CartContext'
import { useAuth } from '../lib/AuthContext'
import './Page.css'
import './Shop.css'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const PRODUCTS = [
  { id: 'p1', name: 'Gold Hold Pomade',       price: '$22', desc: 'Medium hold, high shine. All day control.',         image: '' },
  { id: 'p2', name: 'Matte Clay',              price: '$20', desc: 'Strong hold, natural finish. No residue.',          image: '' },
  { id: 'p3', name: 'Beard Oil',               price: '$18', desc: 'Lightweight blend. Conditions and softens.',        image: '' },
  { id: 'p4', name: 'Edge Control',            price: '$16', desc: 'Crisp lines that last. No flaking.',                image: '' },
  { id: 'p5', name: 'Pre-Shave Scrub',         price: '$19', desc: 'Exfoliating prep scrub for a clean shave.',        image: '' },
  { id: 'p6', name: 'Aftershave Balm',         price: '$21', desc: 'Soothes and hydrates. No sting.',                  image: '' },
]

export default function Shop() {
  const { add, items, remove, total, count } = useCart()
  const { user, signInWithGoogle, signOut }  = useAuth()
  const [cartOpen, setCartOpen]              = useState(false)
  const [added, setAdded]                    = useState<string | null>(null)

  function handleAdd(p: typeof PRODUCTS[0]) {
    add({ id: p.id, name: p.name, price: p.price })
    setAdded(p.id)
    setTimeout(() => setAdded(null), 1200)
  }

  return (
    <>
      <Helmet>
        <title>Shop Products | Zoblends</title>
        <meta name="description" content="Premium grooming products by Zoblends." />
      </Helmet>

      <div className="page">
        <motion.div
          className="page__header"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="page__eyebrow">05 / Shop</span>
          <h1 className="page__title">Products</h1>
          <p className="page__sub">Stay fresh between cuts.</p>
        </motion.div>

        {/* ── Auth + Cart bar ── */}
        <div className="shop__topbar">
          {user ? (
            <div className="shop__user">
              <img className="shop__avatar" src={user.user_metadata?.avatar_url} alt="" />
              <span className="shop__user-name">{user.user_metadata?.full_name?.split(' ')[0]}</span>
              <button className="shop__sign-out" onClick={signOut}>Sign out</button>
            </div>
          ) : (
            <button className="shop__google-btn" onClick={signInWithGoogle}>
              <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.66l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Sign in with Google
            </button>
          )}

          <button className="shop__cart-btn" onClick={() => setCartOpen(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            {count > 0 && <span className="shop__cart-count">{count}</span>}
          </button>
        </div>

        {/* ── Product grid ── */}
        <div className="shop__grid">
          {PRODUCTS.map((p, i) => (
            <motion.div
              key={p.id}
              className="shop__card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.5, ease: EASE }}
            >
              <div className="shop__card-img">
                {p.image ? <img src={p.image} alt={p.name} /> : <span className="shop__card-placeholder">ZB</span>}
              </div>
              <div className="shop__card-info">
                <span className="shop__card-name">{p.name}</span>
                <span className="shop__card-desc">{p.desc}</span>
                <div className="shop__card-bottom">
                  <span className="shop__card-price">{p.price}</span>
                  <button
                    className={`shop__add-btn${added === p.id ? ' shop__add-btn--added' : ''}`}
                    onClick={() => handleAdd(p)}
                  >
                    {added === p.id ? 'Added' : '+ Add'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Cart drawer ── */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              className="shop__overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              className="shop__drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <div className="shop__drawer-header">
                <span>Your Cart</span>
                <button onClick={() => setCartOpen(false)}>✕</button>
              </div>

              {items.length === 0 ? (
                <p className="shop__drawer-empty">Nothing here yet.</p>
              ) : (
                <>
                  <div className="shop__drawer-items">
                    {items.map(item => (
                      <div key={item.id} className="shop__drawer-item">
                        <div>
                          <span className="shop__drawer-item-name">{item.name}</span>
                          <span className="shop__drawer-item-meta">{item.price} × {item.qty}</span>
                        </div>
                        <button className="shop__drawer-remove" onClick={() => remove(item.id)}>✕</button>
                      </div>
                    ))}
                  </div>
                  <div className="shop__drawer-footer">
                    <span className="shop__drawer-total">Total: ${total.toFixed(2)}</span>
                    <p className="shop__drawer-note">Pay in person at your appointment.</p>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
