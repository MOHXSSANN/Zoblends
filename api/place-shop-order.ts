import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { items, name, email } = req.body as {
    items: { id: string; name: string; price: string; qty: number }[]
    name?: string
    email?: string
  }

  if (!items?.length) return res.status(400).json({ error: 'No items' })

  const total_cents = items.reduce((sum, i) => {
    return sum + parseInt(i.price.replace(/\D/g, ''), 10) * 100 * i.qty
  }, 0)

  const sb = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: order, error } = await sb.from('shop_orders').insert({
    customer_email: email ?? null,
    customer_name:  name  ?? null,
    items,
    total_cents,
    status: 'pending',
  }).select('id').single()

  if (error) return res.status(500).json({ error: error.message })

  // Decrement stock for each item
  for (const item of items) {
    const { data: prod } = await sb
      .from('products')
      .select('stock')
      .eq('id', item.id)
      .single()
    if (prod) {
      await sb
        .from('products')
        .update({ stock: Math.max(0, prod.stock - item.qty) })
        .eq('id', item.id)
    }
  }

  return res.json({ ok: true, orderId: order.id })
}
