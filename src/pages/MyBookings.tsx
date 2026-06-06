import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { BookDateTimePicker, type SlotFees } from '../components/ui/BookDateTimePicker'
import './Page.css'
import './MyBookings.css'

const CANCEL_WINDOW_HRS = 6

const BASE_PRICES: Record<string, number> = {
  'Kids Cut': 30, 'Haircut': 40, 'Full Haircut + Beard': 45,
  'Full Service': 50, 'Line Up / Clean Up': 25,
}

function genConfirmationNumber() {
  return 'ZB' + Math.random().toString(36).slice(2, 7).toUpperCase()
}

function parseDurationMin(dur: string): number {
  if (dur.includes('hr')) return Math.round(parseFloat(dur) * 60)
  return parseInt(dur) || 30
}

interface Booking {
  id: string
  service_id?: string | null
  service_name: string
  service_price: string
  service_duration: string
  starts_at: string
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  name: string
  email: string
  phone: string
  confirmation_number: string | null
  created_at: string
  notes?: string | null
  late_night_fee?: boolean
  last_minute_fee?: boolean
  addons?: string | null
  google_event_id?: string | null
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]
const DAY_NAMES   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const h = d.getHours(), mn = d.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${mn === 0 ? '00' : String(mn).padStart(2,'0')} ${ampm}`
}

function isPast(iso: string) { return new Date(iso) < new Date() }
function hoursUntil(iso: string) { return (new Date(iso).getTime() - Date.now()) / 3_600_000 }
function canCancel(iso: string) { return hoursUntil(iso) >= CANCEL_WINDOW_HRS }

function parseBasePrice(price: string) {
  return parseInt(price.replace(/\D/g,''), 10) || 0
}

export default function MyBookings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings]         = useState<Booking[]>([])
  const [loading, setLoading]           = useState(true)
  const [selected, setSelected]         = useState<Booking | null>(null)
  const [cancelling, setCancelling]           = useState(false)
  const [cancelError, setCancelError]         = useState<string | null>(null)
  const [confirmCancel, setConfirmCancel]     = useState(false)
  const [rescheduleTarget, setRescheduleTarget] = useState<Booking | null>(null)
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false)
  const [rescheduleConfirmed, setRescheduleConfirmed] = useState<{ date: string; time: string; confNum: string } | null>(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase
      .from('bookings')
      .select('*')
      .order('starts_at', { ascending: false })
      .then(({ data }) => { setBookings((data as Booking[]) ?? []); setLoading(false) })
  }, [user])

  function fireCalendarDelete(eventId: string | null | undefined) {
    if (!eventId) return
    fetch('/api/google-calendar', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', eventId }),
    }).catch(() => {})
  }

  function fireCalendarCreate(bookingId: string, b: {
    service: string; name: string; email: string; phone: string
    starts_at: string; durationMin: number; price: string
    confirmationNumber?: string | null; addons?: string | null; notes?: string | null
  }) {
    fetch('/api/google-calendar', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', bookingId, booking: b }),
    }).catch(() => {})
  }

  async function sendCancellationEmails(b: Booking) {
    const d = new Date(b.starts_at)
    const dateStr = `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`
    const h = d.getHours(), mn = d.getMinutes()
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
    const timeStr = `${h12}:${mn === 0 ? '00' : String(mn).padStart(2,'0')} ${ampm}`
    const isoDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

    fetch('/api/send-email', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'booking-cancellation', to: b.email, name: b.name,
        service: b.service_name, date: dateStr, time: timeStr,
        confirmationNumber: b.confirmation_number ?? '',
      }),
    }).catch(() => {})

    fetch('/api/notify-waitlist', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: isoDate }),
    }).catch(() => {})
  }

  async function handleCancel(b: Booking) {
    setCancelError(null)
    setCancelling(true)
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', b.id)
    await sendCancellationEmails(b)
    fireCalendarDelete(b.google_event_id)
    const updated = { ...b, status: 'cancelled' as const }
    setBookings(prev => prev.map(x => x.id === b.id ? updated : x))
    setSelected(updated)
    setCancelling(false)
  }

  async function handleRescheduleConfirm(newDate: Date, newTime: string, fees: SlotFees) {
    const b = rescheduleTarget
    if (!b) return
    setRescheduleSubmitting(true)

    // Parse new time → Date
    const [tp, period] = newTime.split(' ')
    const [hh, mm] = tp.split(':').map(Number)
    let hrs = hh
    if (period === 'PM' && hh !== 12) hrs += 12
    if (period === 'AM' && hh === 12) hrs = 0
    const startsAt = new Date(newDate)
    startsAt.setHours(hrs, mm, 0, 0)

    // Calculate new price
    const base     = BASE_PRICES[b.service_name] ?? (parseInt(b.service_price.replace(/\D/g,''), 10) || 0)
    const extra    = fees.lateNightFee
    const newPrice = extra > 0 ? `$${base + extra}` : `$${base}`
    const confNum  = genConfirmationNumber()

    // Create new booking
    const { data: inserted, error } = await supabase.from('bookings').insert({
      user_id:          user?.id ?? null,
      name:             b.name,
      email:            b.email,
      phone:            b.phone,
      service_id:       b.service_id ?? b.service_name.toLowerCase().replace(/\s+/g,'-'),
      service_name:     b.service_name,
      service_price:    newPrice,
      service_duration: b.service_duration,
      starts_at:        startsAt.toISOString(),
      status:           'confirmed',
      confirmation_number: confNum,
      notes:            b.notes ?? null,
      late_night_fee:   fees.lateNightFee > 0,
      last_minute_fee:  false,
      addons:           b.addons ?? null,
    }).select('id').single()

    if (error) { console.error('[reschedule insert error]', error); setRescheduleSubmitting(false); return }

    // Cancel old booking
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', b.id)

    // Fire emails
    sendCancellationEmails(b)
    const d = startsAt
    const dateStr = `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`
    const h12 = hrs > 12 ? hrs - 12 : hrs === 0 ? 12 : hrs
    const timeStr = `${h12}:${mm === 0 ? '00' : String(mm).padStart(2,'0')} ${hrs >= 12 ? 'PM' : 'AM'}`
    fetch('/api/send-email', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'booking-confirmation', to: b.email, name: b.name,
        service: b.service_name, date: dateStr, time: timeStr,
        duration: b.service_duration, price: newPrice, confirmationNumber: confNum,
      }),
    }).catch(() => {})

    // Google Calendar: delete old, create new
    fireCalendarDelete(b.google_event_id)
    if (inserted?.id) {
      fireCalendarCreate(inserted.id, {
        service: b.service_name, name: b.name, email: b.email, phone: b.phone,
        starts_at: startsAt.toISOString(), durationMin: parseDurationMin(b.service_duration),
        price: newPrice, confirmationNumber: confNum, addons: b.addons, notes: b.notes,
      })
    }

    // Update local state
    const newBooking: Booking = {
      ...b,
      id: inserted!.id,
      starts_at: startsAt.toISOString(),
      status: 'confirmed',
      confirmation_number: confNum,
      service_price: newPrice,
      late_night_fee: fees.lateNightFee > 0,
      last_minute_fee: false,
      google_event_id: null,
    }
    setBookings(prev => [
      newBooking,
      ...prev.map(x => x.id === b.id ? { ...x, status: 'cancelled' as const } : x),
    ])
    setRescheduleConfirmed({ date: dateStr, time: timeStr, confNum })
    setRescheduleTarget(null)
    setRescheduleSubmitting(false)
  }

  const upcoming = bookings.filter(b => !isPast(b.starts_at) && b.status === 'confirmed')
  const past     = bookings.filter(b => isPast(b.starts_at)  || b.status !== 'confirmed')

  return (
    <>
      <Helmet><title>My Bookings | Zoblends</title></Helmet>

      <div className="page">
        <motion.div className="page__header"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="page__eyebrow">Account</span>
          <h1 className="page__title">My Bookings</h1>
          <p className="page__sub">Your upcoming and past appointments.</p>
        </motion.div>

        {!user ? (
          <div className="mybookings__empty">
            <p className="mybookings__empty-text">Sign in to view your bookings.</p>
            <Link to="/book" className="mybookings__cta">Book Now</Link>
          </div>
        ) : loading ? (
          <div className="mybookings__loading">Loading…</div>
        ) : bookings.length === 0 ? (
          <div className="mybookings__empty">
            <p className="mybookings__empty-text">No bookings yet.</p>
            <Link to="/book" className="mybookings__cta">Book Now</Link>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <section className="mybookings__section">
                <div className="mybookings__section-label">Upcoming</div>
                {upcoming.map((b, i) => (
                  <motion.button key={b.id} className="mybookings__card"
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.45, ease: EASE }}
                    onClick={() => setSelected(b)}
                  >
                    <div className="mybookings__card-info">
                      <span className="mybookings__service">{b.service_name}</span>
                      <span className="mybookings__datetime">{formatDate(b.starts_at)} · {formatTime(b.starts_at)}</span>
                      <span className="mybookings__meta">{b.service_duration} · {b.service_price}</span>
                    </div>
                    <div className="mybookings__card-right">
                      <span className="mybookings__status mybookings__status--confirmed">Confirmed</span>
                      <span className="mybookings__view-link">View →</span>
                    </div>
                  </motion.button>
                ))}
              </section>
            )}

            {past.length > 0 && (
              <section className="mybookings__section mybookings__section--past">
                <div className="mybookings__section-label">Past</div>
                {past.map((b, i) => (
                  <motion.button key={b.id} className="mybookings__card mybookings__card--past"
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.45, ease: EASE }}
                    onClick={() => setSelected(b)}
                  >
                    <div className="mybookings__card-info">
                      <span className="mybookings__service">{b.service_name}</span>
                      <span className="mybookings__datetime">{formatDate(b.starts_at)} · {formatTime(b.starts_at)}</span>
                      <span className="mybookings__meta">{b.service_duration} · {b.service_price}</span>
                    </div>
                    <div className="mybookings__card-right">
                      <span className={`mybookings__status mybookings__status--${isPast(b.starts_at) && b.status === 'confirmed' ? 'past' : b.status}`}>
                        {isPast(b.starts_at) && b.status === 'confirmed' ? 'Passed' : b.status.charAt(0).toUpperCase() + b.status.slice(1).replace('_',' ')}
                      </span>
                      <span className="mybookings__view-link">View →</span>
                    </div>
                  </motion.button>
                ))}
              </section>
            )}
          </>
        )}
      </div>

      {/* ── Inline reschedule modal ── */}
      <AnimatePresence>
        {rescheduleTarget && (
          <>
            <motion.div className="mybookings__backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !rescheduleSubmitting && setRescheduleTarget(null)}
            />
            <motion.div className="mybookings__modal mybookings__reschedule-modal"
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <button className="mybookings__modal-close"
                onClick={() => !rescheduleSubmitting && setRescheduleTarget(null)}>✕</button>

              <div className="mybookings__reschedule-header">
                <span className="mybookings__modal-eyebrow">Reschedule</span>
                <div className="mybookings__reschedule-service">{rescheduleTarget.service_name}</div>
                <p className="mybookings__reschedule-sub">Pick a new date and time below.</p>
              </div>

              {rescheduleSubmitting ? (
                <p style={{ textAlign: 'center', padding: '40px 0', fontSize: 13, color: 'rgba(245,244,240,0.4)', letterSpacing: '0.08em' }}>
                  Booking your new slot…
                </p>
              ) : (
                <BookDateTimePicker
                  durationMin={parseDurationMin(rescheduleTarget.service_duration)}
                  onConfirm={handleRescheduleConfirm}
                />
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Reschedule confirmed modal ── */}
      <AnimatePresence>
        {rescheduleConfirmed && (
          <>
            <motion.div className="mybookings__backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setRescheduleConfirmed(null)}
            />
            <motion.div className="mybookings__modal mybookings__reschedule-confirm-modal"
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <button className="mybookings__modal-close" onClick={() => setRescheduleConfirmed(null)}>✕</button>

              <motion.div className="mybookings__reschedule-confirm-img-wrap"
                animate={{ y: [0, -9, 0] }}
                transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }}
              >
                <img src="/ZORESCHEDULE.png" alt="Rebooking confirmed" className="mybookings__reschedule-confirm-img" />
              </motion.div>

              <div className="mybookings__reschedule-confirm-body">
                <div className="mybookings__reschedule-confirm-conf">
                  <span className="mybookings__modal-eyebrow">Confirmation</span>
                  <span className="mybookings__reschedule-confirm-num">{rescheduleConfirmed.confNum}</span>
                </div>
                <p className="mybookings__reschedule-confirm-date">{rescheduleConfirmed.date}</p>
                <p className="mybookings__reschedule-confirm-time">{rescheduleConfirmed.time}</p>
              </div>

              <button className="mybookings__reschedule-confirm-btn" onClick={() => setRescheduleConfirmed(null)}>
                Done
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Booking detail / receipt modal ── */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div className="mybookings__backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setSelected(null); setConfirmCancel(false) }}
            />
            <motion.div className="mybookings__modal"
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <button className="mybookings__modal-close"
                onClick={() => { setSelected(null); setConfirmCancel(false) }}>✕</button>

              {/* ── Receipt view for completed bookings ── */}
              {selected.status === 'completed' ? (
                <div className="mybookings__receipt">
                  <div className="mybookings__receipt-header">
                    <span className="mybookings__receipt-eyebrow">Receipt</span>
                    {selected.confirmation_number && (
                      <div className="mybookings__modal-confnum">{selected.confirmation_number}</div>
                    )}
                  </div>

                  <div className="mybookings__receipt-body">
                    <div className="mybookings__receipt-service">{selected.service_name}</div>
                    <div className="mybookings__receipt-datetime">
                      {formatDate(selected.starts_at)} · {formatTime(selected.starts_at)}
                    </div>
                  </div>

                  <div className="mybookings__receipt-lines">
                    {(() => {
                      const total = parseBasePrice(selected.service_price)
                      const lnFee = selected.late_night_fee ? 15 : 0
                      const lmFee = selected.last_minute_fee ? 25 : 0
                      const addonFees = selected.addons
                        ? selected.addons.split(',').reduce((sum, a) => {
                            const n = a.trim()
                            if (n === 'Hot Towel') return sum + 5
                            if (n === 'Face Wash & Massage') return sum + 5
                            return sum
                          }, 0)
                        : 0
                      const base = total - lnFee - lmFee - addonFees

                      return (
                        <>
                          <div className="mybookings__receipt-line">
                            <span>{selected.service_name}</span>
                            <span>${base}</span>
                          </div>
                          {selected.addons && selected.addons.split(',').map(a => {
                            const name = a.trim()
                            const price = name === 'Hot Towel' ? 5 : name === 'Face Wash & Massage' ? 5 : 0
                            return (
                              <div key={name} className="mybookings__receipt-line mybookings__receipt-line--addon">
                                <span>{name}</span>
                                <span>+${price}</span>
                              </div>
                            )
                          })}
                          {selected.late_night_fee && (
                            <div className="mybookings__receipt-line mybookings__receipt-line--addon">
                              <span>Late Night</span><span>+$15</span>
                            </div>
                          )}
                          {selected.last_minute_fee && (
                            <div className="mybookings__receipt-line mybookings__receipt-line--addon">
                              <span>Last Minute</span><span>+$25</span>
                            </div>
                          )}
                          <div className="mybookings__receipt-total">
                            <span>Total</span>
                            <span>${total}</span>
                          </div>
                        </>
                      )
                    })()}
                  </div>

                  <div className="mybookings__receipt-footer">
                    <p>Paid in person · Thank you</p>
                    <p style={{ marginTop: 4, opacity: 0.5 }}>340 Claridge Dr, Nepean · @zo_blendz_</p>
                  </div>

                  <button className="mybookings__modal-reschedule" style={{ marginTop: 24 }}
                    onClick={() => { setSelected(null); navigate('/book', { state: { preselectedService: selected.service_name } }) }}>
                    Book Same Service Again →
                  </button>
                </div>
              ) : (
                /* ── Standard detail view ── */
                <>
                  <div className="mybookings__modal-header">
                    <span className="mybookings__modal-eyebrow">Booking Confirmation</span>
                    {selected.confirmation_number && (
                      <div className="mybookings__modal-confnum">{selected.confirmation_number}</div>
                    )}
                    <span className={`mybookings__status mybookings__status--${selected.status}`} style={{ marginTop: 8 }}>
                      {selected.status.charAt(0).toUpperCase() + selected.status.slice(1).replace('_',' ')}
                    </span>
                  </div>

                  <div className="mybookings__modal-rows">
                    <div className="mybookings__modal-row"><span>Service</span><span>{selected.service_name}</span></div>
                    <div className="mybookings__modal-row"><span>Date</span><span>{formatDate(selected.starts_at)}</span></div>
                    <div className="mybookings__modal-row"><span>Time</span><span>{formatTime(selected.starts_at)}</span></div>
                    <div className="mybookings__modal-row"><span>Duration</span><span>{selected.service_duration}</span></div>
                    {selected.addons && (
                      <div className="mybookings__modal-row"><span>Add-ons</span><span style={{ color: '#d4af37' }}>{selected.addons}</span></div>
                    )}
                    <div className="mybookings__modal-divider" />
                    <div className="mybookings__modal-row"><span>Name</span><span>{selected.name}</span></div>
                    <div className="mybookings__modal-row"><span>Email</span><span>{selected.email}</span></div>
                    <div className="mybookings__modal-row"><span>Phone</span><span>{selected.phone}</span></div>
                    <div className="mybookings__modal-divider" />
                    <div className="mybookings__modal-row mybookings__modal-total">
                      <span>Total</span><span>{selected.service_price}</span>
                    </div>
                    <p className="mybookings__modal-note">Payment due in person at the appointment.</p>
                  </div>

                  {selected.status === 'confirmed' && !isPast(selected.starts_at) && (
                    <div className="mybookings__modal-actions">
                      <button
                        className="mybookings__modal-reschedule"
                        onClick={() => { setSelected(null); setRescheduleTarget(selected) }}
                      >
                        Reschedule →
                      </button>

                      {!confirmCancel ? (
                        <button className="mybookings__modal-cancel" onClick={() => setConfirmCancel(true)}>
                          Cancel Appointment
                        </button>
                      ) : (
                        <div className="mybookings__cancel-confirm">
                          {!canCancel(selected.starts_at) && (
                            <p className="mybookings__cancel-warning">
                              ⚠ This booking is within the {CANCEL_WINDOW_HRS}-hour window. Consider rescheduling instead.
                            </p>
                          )}
                          <p className="mybookings__cancel-confirm-text">
                            Cancel <strong>{selected.service_name}</strong> on {formatDate(selected.starts_at)} at {formatTime(selected.starts_at)}?
                          </p>
                          {cancelError && <p className="mybookings__cancel-error">{cancelError}</p>}
                          <div className="mybookings__cancel-confirm-btns">
                            <button className="mybookings__cancel-confirm-no"
                              onClick={() => setConfirmCancel(false)} disabled={cancelling}>
                              Keep It
                            </button>
                            <button className="mybookings__modal-cancel mybookings__cancel-confirm-yes"
                              onClick={() => handleCancel(selected)} disabled={cancelling}>
                              {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {(selected.status === 'cancelled' || selected.status === 'no_show' || (isPast(selected.starts_at) && selected.status === 'confirmed')) && (
                    <button className="mybookings__modal-reschedule" style={{ marginTop: 24 }}
                      onClick={() => { setSelected(null); navigate('/book', { state: { preselectedService: selected.service_name } }) }}>
                      Book Same Service Again →
                    </button>
                  )}
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
