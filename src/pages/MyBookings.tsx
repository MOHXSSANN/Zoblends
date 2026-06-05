import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import './Page.css'
import './MyBookings.css'

const CANCEL_WINDOW_HRS = 6

interface Booking {
  id: string
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

export default function MyBookings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings]   = useState<Booking[]>([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState<Booking | null>(null)
  const [cancelling, setCancelling]   = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase
      .from('bookings')
      .select('*')
      .order('starts_at', { ascending: false })
      .then(({ data }) => { setBookings((data as Booking[]) ?? []); setLoading(false) })
  }, [user])

  async function handleCancel(b: Booking) {
    setCancelError(null)
    setCancelling(true)
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', b.id)

    // Send cancellation email and notify waitlist (fire-and-forget)
    const d = new Date(b.starts_at)
    const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
    const dateStr = `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`
    const h = d.getHours(), mn = d.getMinutes()
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
    const timeStr = `${h12}:${mn === 0 ? '00' : String(mn).padStart(2,'0')} ${ampm}`
    const isoDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'booking-cancellation',
        to: b.email,
        name: b.name,
        service: b.service_name,
        date: dateStr,
        time: timeStr,
        confirmationNumber: b.confirmation_number ?? '',
      }),
    }).catch(() => {/* non-critical */})

    fetch('/api/notify-waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: isoDate }),
    }).catch(() => {/* non-critical */})

    const updated = { ...b, status: 'cancelled' as const }
    setBookings(prev => prev.map(x => x.id === b.id ? updated : x))
    setSelected(updated)
    setCancelling(false)
  }

  const upcoming = bookings.filter(b => !isPast(b.starts_at) && b.status === 'confirmed')
  const past     = bookings.filter(b => isPast(b.starts_at)  || b.status !== 'confirmed')

  return (
    <>
      <Helmet><title>My Bookings | Zoblends</title></Helmet>

      <div className="page">
        <motion.div
          className="page__header"
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
                  <motion.button
                    key={b.id} className="mybookings__card"
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
                  <motion.button
                    key={b.id} className="mybookings__card mybookings__card--past"
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

      {/* ── Booking detail modal ── */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              className="mybookings__backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            />
            <motion.div
              className="mybookings__modal"
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <button className="mybookings__modal-close" onClick={() => { setSelected(null); setConfirmCancel(false) }}>✕</button>

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
                    onClick={() => { setSelected(null); navigate('/book') }}
                  >
                    Reschedule →
                  </button>

                  {!confirmCancel ? (
                    <button
                      className="mybookings__modal-cancel"
                      onClick={() => setConfirmCancel(true)}
                    >
                      Cancel Appointment
                    </button>
                  ) : (
                    <div className="mybookings__cancel-confirm">
                      {!canCancel(selected.starts_at) && (
                        <p className="mybookings__cancel-warning">
                          ⚠ This booking is within the {CANCEL_WINDOW_HRS}-hour cancellation window. It's not recommended to cancel this close to your appointment.
                        </p>
                      )}
                      <p className="mybookings__cancel-confirm-text">
                        Are you sure you want to cancel your <strong>{selected.service_name}</strong> on {formatDate(selected.starts_at)} at {formatTime(selected.starts_at)}?
                      </p>
                      {cancelError && <p className="mybookings__cancel-error">{cancelError}</p>}
                      <div className="mybookings__cancel-confirm-btns">
                        <button
                          className="mybookings__cancel-confirm-no"
                          onClick={() => setConfirmCancel(false)}
                          disabled={cancelling}
                        >
                          Keep It
                        </button>
                        <button
                          className="mybookings__modal-cancel mybookings__cancel-confirm-yes"
                          onClick={() => handleCancel(selected)}
                          disabled={cancelling}
                        >
                          {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {(selected.status === 'completed' || isPast(selected.starts_at)) && (
                <button
                  className="mybookings__modal-reschedule"
                  onClick={() => { setSelected(null); navigate('/book') }}
                >
                  Book Again →
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
