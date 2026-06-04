import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './ShelfDisplay.css'

interface Product {
  id: string
  name: string
  price: string
  desc: string
  image: string
}

interface ShelfDisplayProps {
  products: Product[]
  onAdd: (p: Product) => void
  added: string | null
}

export default function ShelfDisplay({ products, onAdd, added }: ShelfDisplayProps) {
  const [active, setActive] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.desc.toLowerCase().includes(query.toLowerCase())
  )

  function toggle(id: string) {
    setActive(prev => prev === id ? null : id)
  }

  return (
    <div className="shelf-section">
      {/* Search bar */}
      <div className="shelf-search">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="shelf-search__input"
        />
        {query && (
          <button className="shelf-search__clear" onClick={() => setQuery('')}>✕</button>
        )}
      </div>

      <div className="shelf-list">
        <AnimatePresence>
          {filtered.length === 0 && (
            <motion.p className="shelf-empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              No products match "{query}"
            </motion.p>
          )}
        </AnimatePresence>

        {filtered.map((p, i) => {
          const isActive = active === p.id
          return (
            <motion.div
              key={p.id}
              className="shelf-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              onClick={() => toggle(p.id)}
            >
              {/* Shelf stand */}
              <div className="shelf-item__stand">
                <img src="/Zoshelf.png" alt="" className="shelf-item__stand-img" draggable={false} />

                {/* Floating product on the base */}
                <div className="shelf-item__product-wrap">
                  <motion.div
                    className="shelf-item__product"
                    animate={{ y: [0, -10, 0], scale: isActive ? 1.08 : 1 }}
                    transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }}
                  >
                    {p.image
                      ? <img src={p.image} alt={p.name} draggable={false} />
                      : <div className="shelf-item__fallback">ZB</div>
                    }
                  </motion.div>
                </div>
              </div>

              {/* Info card slides in BELOW the shelf */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    className="shelf-item__card"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="shelf-item__card-inner">
                      <div className="shelf-item__card-left">
                        <span className="shelf-item__card-name">{p.name}</span>
                        <span className="shelf-item__card-desc">{p.desc}</span>
                      </div>
                      <div className="shelf-item__card-right">
                        <span className="shelf-item__card-price">{p.price}</span>
                        <button
                          className={`shelf-item__card-add${added === p.id ? ' shelf-item__card-add--done' : ''}`}
                          onClick={() => onAdd(p)}
                        >
                          {added === p.id ? '✓ Added' : '+ Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tap hint */}
              {!isActive && (
                <span className="shelf-item__hint">Tap to view</span>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
