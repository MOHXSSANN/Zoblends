import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { google } from 'googleapis'

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || ''
const TZ          = process.env.GOOGLE_TZ || 'America/Toronto'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !CALENDAR_ID) {
    return res.json({ ok: true, skipped: true })
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key:  process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/calendar.events'],
  })
  const cal = google.calendar({ version: 'v3', auth })

  try {
    const { action, bookingId, booking, eventId } = req.body as {
      action: 'create' | 'delete'
      bookingId?: string
      booking?: {
        service: string; name: string; email: string; phone: string
        starts_at: string; durationMin: number; price: string
        confirmationNumber?: string; addons?: string | null; notes?: string | null
      }
      eventId?: string
    }

    if (action === 'create' && booking) {
      const start = new Date(booking.starts_at)
      const end   = new Date(start.getTime() + (booking.durationMin ?? 30) * 60_000)
      const desc  = [
        `📱 ${booking.phone}`,
        `✉️  ${booking.email}`,
        `💰 ${booking.price}`,
        booking.confirmationNumber ? `#${booking.confirmationNumber}` : '',
        booking.addons  ? `Add-ons: ${booking.addons}` : '',
        booking.notes   ? `Notes: ${booking.notes}`   : '',
      ].filter(Boolean).join('\n')

      const { data: event } = await cal.events.insert({
        calendarId:  CALENDAR_ID,
        requestBody: {
          summary:     `${booking.service} — ${booking.name}`,
          description: desc,
          start: { dateTime: start.toISOString(), timeZone: TZ },
          end:   { dateTime: end.toISOString(),   timeZone: TZ },
          colorId: '5',
        },
      })

      if (bookingId && event.id) {
        const sb = createClient(
          process.env.VITE_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
        )
        await sb.from('bookings').update({ google_event_id: event.id }).eq('id', bookingId)
      }

      return res.json({ ok: true, eventId: event.id })
    }

    if (action === 'delete' && eventId) {
      await cal.events.delete({ calendarId: CALENDAR_ID, eventId }).catch(() => {})
      return res.json({ ok: true })
    }

    return res.status(400).json({ error: 'Unknown action or missing params' })
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number; response?: { data?: unknown } }
    console.error('[google-calendar] message:', e?.message)
    console.error('[google-calendar] status:', e?.status)
    console.error('[google-calendar] data:', JSON.stringify(e?.response?.data))
    return res.json({ ok: false, error: e?.message, data: e?.response?.data })
  }
}
