import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useCart } from '../lib/CartContext'
import { PRODUCTS } from '../lib/products'
import './Page.css'
import './Shop.css'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export default function Shop() {
  const { add } = useCart()
  const [added, setAdded] = useState<string | null>(null)

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
    </>
  )
}
