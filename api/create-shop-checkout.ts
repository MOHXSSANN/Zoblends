import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const SITE   = process.env.VITE_SITE_URL || 'https://zoblends.com'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { items, customerEmail } = req.body as {
    items: { id: string; name: string; price: string; qty: number; image?: string }[]
    customerEmail?: string
  }

  if (!items?.length) return res.status(400).json({ error: 'No items' })

  const line_items = items.map(item => ({
    price_data: {
      currency: 'cad',
      product_data: {
        name: item.name,
        ...(item.image ? { images: [`${SITE}${item.image}`] } : {}),
      },
      unit_amount: Math.round(parseFloat(item.price.replace('$', '')) * 100),
    },
    quantity: item.qty,
  }))

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items,
    customer_email: customerEmail || undefined,
    success_url: `${SITE}/shop?order=success`,
    cancel_url:  `${SITE}/shop?order=cancelled`,
    metadata: {
      items: JSON.stringify(items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty }))),
    },
  })

  res.json({ url: session.url })
}
