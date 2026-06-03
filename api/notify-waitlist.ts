import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  return `${days[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { date } = req.body as { date: string } // ISO date string e.g. "2026-06-15"

  // Find the first waiting entry for this date
  const { data: entries } = await supabase
    .from('waitlist')
    .select('*')
    .eq('desired_date', date)
    .eq('status', 'waiting')
    .order('created_at', { ascending: true })
    .limit(1)

  if (!entries || entries.length === 0) return res.status(200).json({ notified: false })

  const entry = entries[0]

  // Mark as notified
  await supabase.from('waitlist').update({ status: 'notified' }).eq('id', entry.id)

  // Send email
  await fetch(`${process.env.VITE_SITE_URL}/api/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'waitlist-spot-open',
      to: entry.email,
      name: entry.name,
      date: formatDate(date),
    }),
  })

  return res.status(200).json({ notified: true, email: entry.email })
}
