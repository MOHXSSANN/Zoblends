import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export interface CartItem {
  id: string
  name: string
  price: string
  qty: number
  image?: string
}

interface CartCtx {
  items: CartItem[]
  add: (item: Omit<CartItem, 'qty'>) => void
  remove: (id: string) => void
  clear: () => void
  total: number
  count: number
}

const Ctx = createContext<CartCtx>({
  items: [], add: () => {}, remove: () => {}, clear: () => {}, total: 0, count: 0,
})

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  function add(item: Omit<CartItem, 'qty'>) {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...item, qty: 1 }]
    })
  }

  function remove(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function clear() { setItems([]) }

  const total = items.reduce((sum, i) => sum + parseFloat(i.price.replace('$', '')) * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <Ctx.Provider value={{ items, add, remove, clear, total, count }}>
      {children}
    </Ctx.Provider>
  )
}

export const useCart = () => useContext(Ctx)
