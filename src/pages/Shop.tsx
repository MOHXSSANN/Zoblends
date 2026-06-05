import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useCart } from '../lib/CartContext'
import { PRODUCTS, type Product } from '../lib/products'
import { supabase } from '../lib/supabase'
import ShelfDisplay from '../components/ui/ShelfDisplay'
import './Page.css'
import './Shop.css'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export default function Shop() {
  const { add } = useCart()
  const [added, setAdded]       = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>(PRODUCTS)

  useEffect(() => {
    supabase
      .from('products')
      .select('id, name, price_cents, cost_price_cents, stock, description, image_url')
      .eq('active', true)
      .order('id')
      .then(({ data }) => {
        if (!data?.length) return
        setProducts(data.map(p => ({
          id:               p.id,
          name:             p.name,
          price:            `$${p.price_cents / 100}`,
          desc:             p.description ?? '',
          image:            p.image_url   ?? '',
          stock:            p.stock,
          cost_price_cents: p.cost_price_cents,
        })))
      }, () => {})
  }, [])

  function handleAdd(p: Product) {
    if (p.stock === 0) return
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

        <ShelfDisplay
          products={products}
          onAdd={handleAdd}
          added={added}
        />
      </div>
    </>
  )
}
