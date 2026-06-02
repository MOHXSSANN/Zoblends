import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export interface WishlistItem {
  id: string
  src: string
  label: string
}

interface WishlistCtx {
  items: WishlistItem[]
  toggle: (item: WishlistItem) => void
  has: (id: string) => boolean
  count: number
}

const Ctx = createContext<WishlistCtx>({
  items: [], toggle: () => {}, has: () => false, count: 0,
})

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])

  function toggle(item: WishlistItem) {
    setItems(prev =>
      prev.find(i => i.id === item.id)
        ? prev.filter(i => i.id !== item.id)
        : [...prev, item]
    )
  }

  const has = (id: string) => items.some(i => i.id === id)

  return (
    <Ctx.Provider value={{ items, toggle, has, count: items.length }}>
      {children}
    </Ctx.Provider>
  )
}

export const useWishlist = () => useContext(Ctx)
