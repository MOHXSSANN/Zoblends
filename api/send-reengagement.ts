import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const SITE         = 'https://zoblends.com'
const WINDOW_DAYS  = 30

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()

  const cutoff = new Date(Date.now() - WINDOW_DAYS * 24 * 3600 * 1000).toISOString()

  // All clients with at least one completed booking
  const { data: completed } = await supabase
    .from('bookings')
    .select('email, name')
    .eq('status', 'completed')

  if (!completed?.length) return res.json({ sent: 0 })

  // Build unique email → first-seen name map
  const clients = new Map<string, string>()
  completed.forEach(b => { if (!clients.has(b.email)) clients.set(b.email, b.name) })
  const emails = [...clients.keys()]

  // Exclude anyone with a booking in the last 30 days (upcoming or past)
  const { data: recent } = await supabase
    .from('bookings')
    .select('email')
    .in('email', emails)
    .gte('starts_at', cutoff)
  const recentSet = new Set(recent?.map(b => b.email) ?? [])

  // Exclude anyone already nudged in the last 30 days
  const { data: alreadySent } = await supabase
    .from('reengagement_log')
    .select('email')
    .gte('sent_at', cutoff)
    .in('email', emails)
  const sentSet = new Set(alreadySent?.map(x => x.email) ?? [])

  const toNudge = emails.filter(e => !recentSet.has(e) && !sentSet.has(e))

  let sent = 0
  for (const email of toNudge) {
    const name = clients.get(email)!
    const r = await fetch(`${SITE}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 're-engagement', to: email, name }),
    })
    if (r.ok) {
      await supabase.from('reengagement_log').insert({ email, sent_at: new Date().toISOString() })
      sent++
    }
  }

  return res.json({ sent, eligible: toNudge.length })
}
