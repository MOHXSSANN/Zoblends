import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const SITE = 'https://zoblends.com'

const DAY_NAMES   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`
}
function fmtTime(iso: string) {
  const d = new Date(iso)
  const h = d.getHours(), m = d.getMinutes()
  const ap = h >= 12 ? 'PM' : 'AM'
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${m === 0 ? '00' : String(m).padStart(2,'0')} ${ap}`
}

async function sendEmail(payload: Record<string, unknown>) {
  await fetch(`${SITE}/api/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow GET (from Vercel cron) or POST (manual trigger)
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()

  const now = new Date()

  // Window: bookings starting in 22–26 hours (24h reminder)
  const w24lo = new Date(now.getTime() + 22 * 3_600_000).toISOString()
  const w24hi = new Date(now.getTime() + 26 * 3_600_000).toISOString()

  // Window: bookings starting in 2.5–3.5 hours (3h reminder)
  const w3lo  = new Date(now.getTime() + 2.5 * 3_600_000).toISOString()
  const w3hi  = new Date(now.getTime() + 3.5 * 3_600_000).toISOString()

  const [{ data: due24 }, { data: due3 }] = await Promise.all([
    supabase.from('bookings').select('*')
      .eq('status', 'confirmed')
      .eq('reminder_24h_sent', false)
      .gte('starts_at', w24lo)
      .lte('starts_at', w24hi),
    supabase.from('bookings').select('*')
      .eq('status', 'confirmed')
      .eq('reminder_3h_sent', false)
      .gte('starts_at', w3lo)
      .lte('starts_at', w3hi),
  ])

  const results = { sent24h: 0, sent3h: 0 }

  for (const b of (due24 ?? [])) {
    await sendEmail({
      type: 'booking-reminder',
      to: b.email, name: b.name, service: b.service_name,
      date: fmtDate(b.starts_at), time: fmtTime(b.starts_at),
      duration: b.service_duration, confirmationNumber: b.confirmation_number ?? '',
      hoursUntil: 24,
    })
    await supabase.from('bookings').update({ reminder_24h_sent: true }).eq('id', b.id)
    results.sent24h++
  }

  for (const b of (due3 ?? [])) {
    await sendEmail({
      type: 'booking-reminder',
      to: b.email, name: b.name, service: b.service_name,
      date: fmtDate(b.starts_at), time: fmtTime(b.starts_at),
      duration: b.service_duration, confirmationNumber: b.confirmation_number ?? '',
      hoursUntil: 3,
    })
    await supabase.from('bookings').update({ reminder_3h_sent: true }).eq('id', b.id)
    results.sent3h++
  }

  return res.status(200).json({ ok: true, ...results })
}
