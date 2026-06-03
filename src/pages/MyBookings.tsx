import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import './Page.css'
import './MyBookings.css'

interface Booking {
  id: string
  service_name: string
  service_price: string
  service_duration: string
  starts_at: string
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  created_at: string
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const h = d.getHours()
  const m = d.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${m === 0 ? '00' : String(m).padStart(2, '0')} ${ampm}`
}

function isPast(iso: string) {
  return new Date(iso) < new Date()
}

export default function MyBookings() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase
      .from('bookings')
      .select('*')
      .order('starts_at', { ascending: false })
      .then(({ data }) => {
        setBookings((data as Booking[]) ?? [])
        setLoading(false)
      })
  }, [user])

  async function handleCancel(id: string) {
    setCancelling(id)
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
    setCancelling(null)
  }

  const upcoming = bookings.filter(b => !isPast(b.starts_at) && b.status === 'confirmed')
  const past     = bookings.filter(b => isPast(b.starts_at) || b.status !== 'confirmed')

  return (
    <>
      <Helmet>
        <title>My Bookings | Zoblends</title>
      </Helmet>

      <div className="page">
        <motion.div
          className="page__header"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="page__eyebrow">Account</span>
          <h1 className="page__title">My Bookings</h1>
          <p className="page__sub">Your upcoming and past appointments.</p>
        </motion.div>

        {!user ? (
          <motion.div
            className="mybookings__empty"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="mybookings__empty-text">Sign in to view your bookings.</p>
            <Link to="/book" className="mybookings__cta">Book Now</Link>
          </motion.div>
        ) : loading ? (
          <div className="mybookings__loading">Loading…</div>
        ) : bookings.length === 0 ? (
          <motion.div
            className="mybookings__empty"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="mybookings__empty-text">No bookings yet.</p>
            <Link to="/book" className="mybookings__cta">Book Now</Link>
          </motion.div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <section className="mybookings__section">
                <div className="mybookings__section-label">Upcoming</div>
                {upcoming.map((b, i) => (
                  <motion.div
                    key={b.id}
                    className="mybookings__card"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.45, ease: EASE }}
                  >
                    <div className="mybookings__card-info">
                      <span className="mybookings__service">{b.service_name}</span>
                      <span className="mybookings__datetime">{formatDate(b.starts_at)} · {formatTime(b.starts_at)}</span>
                      <span className="mybookings__meta">{b.service_duration} · {b.service_price}</span>
                    </div>
                    <div className="mybookings__card-right">
                      <span className="mybookings__status mybookings__status--confirmed">Confirmed</span>
                      <button
                        className="mybookings__cancel"
                        onClick={() => handleCancel(b.id)}
                        disabled={cancelling === b.id}
                      >
                        {cancelling === b.id ? 'Cancelling…' : 'Cancel'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </section>
            )}

            {past.length > 0 && (
              <section className="mybookings__section mybookings__section--past">
                <div className="mybookings__section-label">Past</div>
                {past.map((b, i) => (
                  <motion.div
                    key={b.id}
                    className="mybookings__card mybookings__card--past"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.45, ease: EASE }}
                  >
                    <div className="mybookings__card-info">
                      <span className="mybookings__service">{b.service_name}</span>
                      <span className="mybookings__datetime">{formatDate(b.starts_at)} · {formatTime(b.starts_at)}</span>
                      <span className="mybookings__meta">{b.service_duration} · {b.service_price}</span>
                    </div>
                    <div className="mybookings__card-right">
                      <span className={`mybookings__status mybookings__status--${b.status}`}>
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1).replace('_', ' ')}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </>
  )
}
