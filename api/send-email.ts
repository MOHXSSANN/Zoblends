import type { VercelRequest, VercelResponse } from '@vercel/node'

const RESEND_API_KEY = process.env.RESEND_API_KEY!
const FROM          = 'Zoblends <bookings@zoblends.com>'
const ADMIN_EMAIL   = 'mo.hxssan360@gmail.com'

type EmailType =
  | { type: 'booking-confirmation';  to: string; name: string; service: string; date: string; time: string; duration: string; price: string; confirmationNumber: string }
  | { type: 'booking-cancellation';  to: string; name: string; service: string; date: string; time: string; confirmationNumber: string }
  | { type: 'review-request';        to: string; name: string; service: string; date: string }
  | { type: 'no-show-warning';       to: string; name: string; service: string; date: string; time: string }
  | { type: 'waitlist-spot-open';    to: string; name: string; date: string }
  | { type: 'booking-reminder';      to: string; name: string; service: string; date: string; time: string; duration: string; confirmationNumber: string }
  | { type: 'admin-new-booking';     name: string; service: string; date: string; time: string; phone: string; email: string; confirmationNumber: string }

// ─── Shared helpers ──────────────────────────────────────────────────────────

function row(label: string, value: string, gold = false) {
  return `<tr>
    <td style="padding:12px 0;font-size:10px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,244,240,0.3);border-bottom:1px solid rgba(212,175,55,0.06);">${label}</td>
    <td style="padding:12px 0;font-size:14px;color:${gold ? '#d4af37' : 'rgba(245,244,240,0.85)'};font-weight:${gold ? '700' : '400'};text-align:right;border-bottom:1px solid rgba(212,175,55,0.06);">${value}</td>
  </tr>`
}

function shell(content: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0a0908;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
  <tr><td align="center" style="padding-bottom:32px;">
    <span style="font-family:Georgia,serif;font-size:28px;font-weight:700;letter-spacing:0.12em;color:#d4af37;">ZOBLENDS</span>
  </td></tr>
  <tr><td style="background:#111009;border:1px solid rgba(212,175,55,0.2);padding:32px;">
    ${content}
  </td></tr>
  <tr><td align="center" style="padding-top:24px;">
    <p style="font-size:10px;color:rgba(245,244,240,0.2);letter-spacing:0.1em;margin:0;">© 2026 Zoblends · Nepean, Ottawa, ON</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`
}

function btn(text: string, href: string, style: 'gold' | 'outline' = 'gold') {
  if (style === 'gold') {
    return `<a href="${href}" style="display:block;text-align:center;background:#d4af37;color:#0a0908;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;padding:16px;text-decoration:none;margin-top:24px;">${text}</a>`
  }
  return `<a href="${href}" style="display:block;text-align:center;background:none;border:1px solid rgba(245,244,240,0.15);color:rgba(245,244,240,0.5);font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;padding:14px;text-decoration:none;margin-top:24px;">${text}</a>`
}

// ─── 1. Booking Confirmation ──────────────────────────────────────────────────

function bookingConfirmationHtml(d: Extract<EmailType, { type: 'booking-confirmation' }>) {
  return shell(`
    <p style="font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:rgba(212,175,55,0.6);margin:0 0 8px;">Booking Confirmed</p>
    <h1 style="font-size:24px;font-weight:700;color:#f5f4f0;margin:0 0 24px;">You're booked, ${d.name.split(' ')[0]}.</h1>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(212,175,55,0.1);">
      ${row('Service',  d.service)}
      ${row('Date',     d.date)}
      ${row('Time',     d.time)}
      ${row('Duration', d.duration)}
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(212,175,55,0.1);margin-top:16px;">
      ${row('Total', d.price, true)}
    </table>
    <div style="text-align:center;padding:20px 0 4px;">
      <p style="font-size:9px;letter-spacing:0.24em;text-transform:uppercase;color:rgba(212,175,55,0.4);margin:0 0 4px;">Confirmation Number</p>
      <p style="font-family:Georgia,serif;font-size:26px;font-weight:700;letter-spacing:0.2em;color:#d4af37;margin:0;">${d.confirmationNumber}</p>
    </div>
    <p style="font-size:11px;color:rgba(245,244,240,0.35);text-align:center;margin:20px 0 0;letter-spacing:0.08em;">Payment due in person. If anything changes, DM <a href="https://instagram.com/zo_blendz_" style="color:#d4af37;">@zo_blendz_</a>.</p>
  `)
}

// ─── 2. Booking Cancellation ──────────────────────────────────────────────────

function bookingCancellationHtml(d: Extract<EmailType, { type: 'booking-cancellation' }>) {
  return shell(`
    <p style="font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:rgba(245,244,240,0.3);margin:0 0 8px;">Booking Cancelled</p>
    <h1 style="font-size:24px;font-weight:700;color:#f5f4f0;margin:0 0 24px;">Your appointment has been cancelled.</h1>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(212,175,55,0.1);">
      ${row('Service', d.service)}
      ${row('Date',    d.date)}
      ${row('Time',    d.time)}
      ${row('Ref',     d.confirmationNumber)}
    </table>
    <p style="font-size:13px;color:rgba(245,244,240,0.5);margin:24px 0 0;line-height:1.6;">No worries, spots open up. Rebook whenever you're ready.</p>
    ${btn('Book Again →', 'https://zoblends.com/book')}
  `)
}

// ─── 3. Review Request (after completed) ─────────────────────────────────────

function reviewRequestHtml(d: Extract<EmailType, { type: 'review-request' }>) {
  return shell(`
    <p style="font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:rgba(212,175,55,0.6);margin:0 0 8px;">Thank You</p>
    <h1 style="font-size:24px;font-weight:700;color:#f5f4f0;margin:0 0 16px;">How'd the cut feel, ${d.name.split(' ')[0]}?</h1>
    <p style="font-size:14px;color:rgba(245,244,240,0.55);line-height:1.7;margin:0 0 8px;">
      Hope you're loving it. If you've got a minute, leaving us a Google review goes a long way.
      It helps other people find Zoblends and means a lot to Zowad.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(212,175,55,0.08);margin-top:20px;">
      ${row('Service', d.service)}
      ${row('Date',    d.date)}
    </table>
    ${btn('Leave a Google Review →', 'https://g.page/r/REPLACE_WITH_GOOGLE_REVIEW_LINK/review')}
    <p style="font-size:11px;color:rgba(245,244,240,0.2);text-align:center;margin:12px 0 0;letter-spacing:0.08em;">Takes less than 60 seconds.</p>
  `)
}

// ─── 4. No-Show Warning ───────────────────────────────────────────────────────

function noShowWarningHtml(d: Extract<EmailType, { type: 'no-show-warning' }>) {
  return shell(`
    <p style="font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:rgba(224,85,85,0.7);margin:0 0 8px;">Missed Appointment</p>
    <h1 style="font-size:24px;font-weight:700;color:#f5f4f0;margin:0 0 24px;">You didn't show up, ${d.name.split(' ')[0]}.</h1>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(212,175,55,0.1);">
      ${row('Service', d.service)}
      ${row('Date',    d.date)}
      ${row('Time',    d.time)}
    </table>
    <p style="font-size:13px;color:rgba(245,244,240,0.5);margin:24px 0 0;line-height:1.7;">
      That slot was held for you and turned away other clients.
      Please cancel in advance if your plans change. It keeps the schedule running for everyone.
      Repeated no-shows may result in bookings being restricted.
    </p>
    ${btn('Rebook Your Spot →', 'https://zoblends.com/book', 'outline')}
  `)
}

// ─── 5. Waitlist Spot Available ───────────────────────────────────────────────

function waitlistSpotHtml(d: Extract<EmailType, { type: 'waitlist-spot-open' }>) {
  return shell(`
    <p style="font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#d4af37;margin:0 0 8px;">Spot Available</p>
    <h1 style="font-size:24px;font-weight:700;color:#f5f4f0;margin:0 0 16px;">A spot opened up, ${d.name.split(' ')[0]}.</h1>
    <p style="font-size:14px;color:rgba(245,244,240,0.6);line-height:1.7;margin:0 0 24px;">
      A booking slot on <strong style="color:#f5f4f0;">${d.date}</strong> just opened up. Book now before it's gone.
    </p>
    ${btn('Book Now →', 'https://zoblends.com/book')}
    <p style="font-size:11px;color:rgba(245,244,240,0.2);text-align:center;margin:16px 0 0;letter-spacing:0.08em;">This spot may fill up quickly.</p>
  `)
}

// ─── 6. Booking Reminder (24h before) ────────────────────────────────────────

function bookingReminderHtml(d: Extract<EmailType, { type: 'booking-reminder' }>) {
  return shell(`
    <p style="font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:rgba(212,175,55,0.6);margin:0 0 8px;">Reminder</p>
    <h1 style="font-size:24px;font-weight:700;color:#f5f4f0;margin:0 0 8px;">Your cut is tomorrow, ${d.name.split(' ')[0]}.</h1>
    <p style="font-size:13px;color:rgba(245,244,240,0.4);margin:0 0 24px;letter-spacing:0.04em;">See you at the chair.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(212,175,55,0.1);">
      ${row('Service',  d.service)}
      ${row('Date',     d.date)}
      ${row('Time',     d.time)}
      ${row('Duration', d.duration)}
    </table>
    <div style="text-align:center;padding:16px 0 4px;">
      <p style="font-size:9px;letter-spacing:0.24em;text-transform:uppercase;color:rgba(212,175,55,0.4);margin:0 0 4px;">Confirmation</p>
      <p style="font-family:Georgia,serif;font-size:20px;font-weight:700;letter-spacing:0.2em;color:#d4af37;margin:0;">${d.confirmationNumber}</p>
    </div>
    <p style="font-size:11px;color:rgba(245,244,240,0.25);text-align:center;margin:16px 0 0;letter-spacing:0.08em;">Need to cancel? DM <a href="https://instagram.com/zo_blendz_" style="color:#d4af37;">@zo_blendz_</a> as soon as possible.</p>
  `)
}

// ─── 7. Admin: New Booking Notification ──────────────────────────────────────

function adminNewBookingHtml(d: Extract<EmailType, { type: 'admin-new-booking' }>) {
  return shell(`
    <p style="font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:rgba(212,175,55,0.6);margin:0 0 8px;">New Booking</p>
    <h1 style="font-size:24px;font-weight:700;color:#f5f4f0;margin:0 0 24px;">You've got a new client.</h1>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(212,175,55,0.1);">
      ${row('Client',  d.name)}
      ${row('Service', d.service)}
      ${row('Date',    d.date)}
      ${row('Time',    d.time)}
      ${row('Phone',   d.phone)}
      ${row('Email',   d.email)}
      ${row('Ref',     d.confirmationNumber, true)}
    </table>
    ${btn('View Dashboard →', 'https://zoblends.com/admin')}
  `)
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const data = req.body as EmailType
  let subject = ''
  let html    = ''
  let to      = ''

  switch (data.type) {
    case 'booking-confirmation':
      subject = `Confirmed: ${data.service} on ${data.date} · ${data.confirmationNumber}`
      html    = bookingConfirmationHtml(data)
      to      = data.to
      break
    case 'booking-cancellation':
      subject = `Cancelled: ${data.service} on ${data.date} · ${data.confirmationNumber}`
      html    = bookingCancellationHtml(data)
      to      = data.to
      break
    case 'review-request':
      subject = `How was the cut, ${data.name.split(' ')[0]}? Leave us a review.`
      html    = reviewRequestHtml(data)
      to      = data.to
      break
    case 'no-show-warning':
      subject = `Missed appointment: ${data.date}`
      html    = noShowWarningHtml(data)
      to      = data.to
      break
    case 'waitlist-spot-open':
      subject = `A spot opened up on ${data.date} at Zoblends`
      html    = waitlistSpotHtml(data)
      to      = data.to
      break
    case 'booking-reminder':
      subject = `Reminder: ${data.service} tomorrow at ${data.time} · ${data.confirmationNumber}`
      html    = bookingReminderHtml(data)
      to      = data.to
      break
    case 'admin-new-booking':
      subject = `New booking: ${data.name} · ${data.service} · ${data.date}`
      html    = adminNewBookingHtml(data)
      to      = ADMIN_EMAIL
      break
    default:
      return res.status(400).json({ error: 'unknown type' })
  }

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  })

  const body = await r.json()
  return res.status(r.ok ? 200 : 500).json(body)
}
