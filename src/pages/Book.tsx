import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { BookDateTimePicker } from '../components/ui/BookDateTimePicker'
import './Page.css'
import './Book.css'

const SERVICES = [
  { id: 'kids-cut',      name: 'Kids Cut',             duration: '30 min', durationMin: 30, price: '$30' },
  { id: 'haircut',       name: 'Haircut',              duration: '35 min', durationMin: 35, price: '$40' },
  { id: 'cut-beard',     name: 'Full Haircut + Beard', duration: '40 min', durationMin: 40, price: '$45' },
  { id: 'full-service',  name: 'Full Service',         duration: '1 hr',   durationMin: 60, price: '$50' },
  { id: 'lineup',        name: 'Line Up / Clean Up',   duration: '25 min', durationMin: 25, price: '$25' },
]

type Step = 'service' | 'datetime' | 'details' | 'confirm' | 'done' | 'waitlist' | 'waitlist-done'

interface GuestInfo { name: string; email: string; phone: string }

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']


export default function Book() {
  const { user } = useAuth()
  const [step, setStep]             = useState<Step>('service')
  const [service, setService]       = useState<typeof SERVICES[0] | null>(null)
  const [date, setDate]             = useState<Date | null>(null)
  const [time, setTime]             = useState<string | null>(null)
  const [pickerDate, setPickerDate] = useState<Date | undefined>()
  const [info, setInfo]             = useState<GuestInfo>({ name: '', email: '', phone: '' })
  const [errors, setErrors]         = useState<Partial<GuestInfo>>({})
  const [submitting, setSubmitting]         = useState(false)
  const [confirmationNum, setConfirmationNum] = useState<string | null>(null)



  // Pre-fill from Google account
  useEffect(() => {
    if (user && step === 'details') {
      setInfo(prev => ({
        name:  prev.name  || user.user_metadata?.full_name  || '',
        email: prev.email || user.email                      || '',
        phone: prev.phone,
      }))
    }
  }, [user, step])

  function chooseService(s: typeof SERVICES[0]) {
    setService(s)
    setDate(null)
    setTime(null)
    setStep('datetime')
  }

  function validate(): boolean {
    const e: Partial<GuestInfo> = {}
    if (!info.name.trim())                          e.name  = 'Name is required'
    if (!/\S+@\S+\.\S+/.test(info.email))           e.email = 'Valid email required'
    if (!/^\+?[\d\s\-()]{7,}$/.test(info.phone))   e.phone = 'Valid phone required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleConfirm() {
    if (!validate()) return
    setStep('confirm')
  }

  function genConfirmationNumber() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = 'ZB'
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
    return code
  }

  async function handleSubmit() {
    if (!service || !date || !time) return
    setSubmitting(true)

    const [timePart, period] = time.split(' ')
    const [h, m] = timePart.split(':').map(Number)
    let hours = h
    if (period === 'PM' && h !== 12) hours += 12
    if (period === 'AM' && h === 12) hours = 0
    const startsAt = new Date(date)
    startsAt.setHours(hours, m, 0, 0)

    const confNum = genConfirmationNumber()

    const { error } = await supabase.from('bookings').insert({
      user_id: user?.id ?? null,
      name: info.name,
      email: info.email,
      phone: info.phone,
      service_id: service.id,
      service_name: service.name,
      service_price: service.price,
      service_duration: service.duration,
      starts_at: startsAt.toISOString(),
      status: 'confirmed',
      confirmation_number: confNum,
    })

    if (!error) {
      // Send confirmation email to client
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'booking-confirmation',
          to: info.email,
          name: info.name,
          service: service.name,
          date: formatDate(date),
          time,
          duration: service.duration,
          price: service.price,
          confirmationNumber: confNum,
        }),
      }).catch(() => {})

      // Notify admin
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'admin-new-booking',
          name: info.name,
          service: service.name,
          date: formatDate(date),
          time,
          phone: info.phone,
          email: info.email,
          confirmationNumber: confNum,
        }),
      }).catch(() => {})

      setConfirmationNum(confNum)
      setStep('done')
    }
    setSubmitting(false)
  }

  async function handleWaitlistSubmit() {
    if (!date) return
    setSubmitting(true)
    const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
    const { error } = await supabase.from('waitlist').insert({
      name: info.name,
      email: info.email,
      phone: info.phone,
      desired_date: dateStr,
      status: 'waiting',
    })
    setSubmitting(false)
    if (!error) setStep('waitlist-done')
  }

  function reset() {
    setStep('service')
    setService(null)
    setDate(null)
    setTime(null)
    setInfo({ name: '', email: '', phone: '' })
    setErrors({})
    setConfirmationNum(null)
  }

  const formatDate = (d: Date) =>
    `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`

  return (
    <>
      <Helmet>
        <title>Secure a Spot | Zoblends</title>
        <meta name="description" content="Book your chair with Zoblends." />
      </Helmet>

      <div className="book__hero">
        <video
          className="book__hero-video"
          src="/ZobOOKING.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="book__hero-overlay" />
        <motion.div
          className="book__hero-text"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="page__eyebrow">Book</span>
          <h1 className="page__title">Secure a Spot</h1>
          <p className="page__sub">Pick your service. Lock it in.</p>
        </motion.div>
      </div>

      <div className="page page--no-header">


        <AnimatePresence mode="wait">

          {/* ── Step 1: Service ── */}
          {step === 'service' && (
            <motion.div key="service"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <div className="book__policy">
                <span className="book__policy-label">Booking Policy</span>
                <p>If there are any changes, message <a href="https://instagram.com/zo_blendz_" target="_blank" rel="noopener noreferrer">@zo_blendz_</a> as soon as possible.</p>
              </div>
              <div className="book__services">
                {SERVICES.map((s, i) => (
                  <motion.div key={s.id} className="book__service"
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.07, duration: 0.5, ease: EASE }}
                  >
                    <div className="book__service-info">
                      <span className="book__service-name">{s.name}</span>
                      <span className="book__service-meta">{s.duration}</span>
                    </div>
                    <div className="book__service-right">
                      <span className="book__service-price">{s.price}</span>
                      <button className="book__service-btn" onClick={() => chooseService(s)}>Book</button>
                    </div>
                  </motion.div>
                ))}
              </div>
              <p className="book__footer-note">Payment due in person at the appointment.</p>
            </motion.div>
          )}

          {/* ── Step 2: Date & Time ── */}
          {step === 'datetime' && service && (
            <motion.div key="datetime"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <button className="book__back" onClick={() => setStep('service')}>← Back</button>
              <div className="book__chosen-service" style={{ marginBottom: 20, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, textAlign: 'center' }}>
                <span>{service.name}</span>
                <span className="book__chosen-meta">{service.duration} · {service.price}</span>
              </div>

              <BookDateTimePicker
                durationMin={service.durationMin}
                onConfirm={(d, t) => { setDate(d); setTime(t); setStep('details'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                onDateChange={(d) => setPickerDate(d)}
              />

              {pickerDate && (
                <div className="book__waitlist-alt">
                  <span className="book__waitlist-alt-text">All times taken or none work?</span>
                  <button className="book__waitlist-link" onClick={() => setStep('waitlist')}>
                    Join the waitlist for {DAY_NAMES[pickerDate.getDay()]}, {MONTH_NAMES[pickerDate.getMonth()]} {pickerDate.getDate()} →
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Step 3: Guest Details ── */}
          {step === 'details' && (
            <motion.div key="details"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <button className="book__back" onClick={() => setStep('datetime')}>← Back</button>
              <div className="book__section-label">Your Details</div>
              {user && (
                <p className="book__google-note">Signed in as {user.email} — fields pre-filled.</p>
              )}

              <div className="book__form">
                <div className="book__field">
                  <label className="book__label">Full Name</label>
                  <input
                    className={`book__input${errors.name ? ' book__input--error' : ''}`}
                    placeholder="Your name"
                    value={info.name}
                    onChange={e => setInfo(p => ({ ...p, name: e.target.value }))}
                  />
                  {errors.name && <span className="book__error">{errors.name}</span>}
                </div>
                <div className="book__field">
                  <label className="book__label">Email</label>
                  <input
                    className={`book__input${errors.email ? ' book__input--error' : ''}`}
                    type="email"
                    placeholder="your@email.com"
                    value={info.email}
                    onChange={e => setInfo(p => ({ ...p, email: e.target.value }))}
                  />
                  {errors.email && <span className="book__error">{errors.email}</span>}
                </div>
                <div className="book__field">
                  <label className="book__label">Phone</label>
                  <input
                    className={`book__input${errors.phone ? ' book__input--error' : ''}`}
                    type="tel"
                    placeholder="+1 (613) 000-0000"
                    value={info.phone}
                    onChange={e => setInfo(p => ({ ...p, phone: e.target.value }))}
                  />
                  {errors.phone && <span className="book__error">{errors.phone}</span>}
                </div>
              </div>

              <button className="book__next-btn" onClick={handleConfirm}>
                Review Booking →
              </button>
            </motion.div>
          )}

          {/* ── Step 4: Confirm ── */}
          {step === 'confirm' && service && date && time && (
            <motion.div key="confirm"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <button className="book__back" onClick={() => setStep('details')}>← Back</button>
              <div className="book__section-label">Review Your Booking</div>

              <div className="book__summary">
                <div className="book__summary-row">
                  <span className="book__summary-key">Service</span>
                  <span className="book__summary-val">{service.name}</span>
                </div>
                <div className="book__summary-row">
                  <span className="book__summary-key">Date</span>
                  <span className="book__summary-val">{formatDate(date)}</span>
                </div>
                <div className="book__summary-row">
                  <span className="book__summary-key">Time</span>
                  <span className="book__summary-val">{time}</span>
                </div>
                <div className="book__summary-row">
                  <span className="book__summary-key">Duration</span>
                  <span className="book__summary-val">{service.duration}</span>
                </div>
                <div className="book__summary-divider" />
                <div className="book__summary-row">
                  <span className="book__summary-key">Name</span>
                  <span className="book__summary-val">{info.name}</span>
                </div>
                <div className="book__summary-row">
                  <span className="book__summary-key">Email</span>
                  <span className="book__summary-val">{info.email}</span>
                </div>
                <div className="book__summary-row">
                  <span className="book__summary-key">Phone</span>
                  <span className="book__summary-val">{info.phone}</span>
                </div>
                <div className="book__summary-divider" />
                <div className="book__summary-row">
                  <span className="book__summary-key">Total</span>
                  <span className="book__summary-val book__summary-price">{service.price}</span>
                </div>
                <p className="book__summary-note">Payment due in person at the appointment.</p>
              </div>

              <button className="book__next-btn book__confirm-btn" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Confirming…' : 'Confirm Booking'}
              </button>
            </motion.div>
          )}

          {/* ── Step: Waitlist Form ── */}
          {step === 'waitlist' && date && (
            <motion.div key="waitlist"
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <button className="book__back" onClick={() => setStep('datetime')}>← Back</button>
              <div className="book__waitlist-header">
                <div className="book__section-label">Join Waitlist</div>
                <p className="book__waitlist-desc">
                  We'll email you if a spot opens up on{' '}
                  <strong>{DAY_NAMES[date.getDay()]}, {MONTH_NAMES[date.getMonth()]} {date.getDate()}</strong>.
                </p>
              </div>

              <div className="book__form">
                <div className="book__field">
                  <label className="book__label">Full Name</label>
                  <input
                    className={`book__input${errors.name ? ' book__input--error' : ''}`}
                    placeholder="Your name"
                    value={info.name}
                    onChange={e => setInfo(p => ({ ...p, name: e.target.value }))}
                  />
                  {errors.name && <span className="book__error">{errors.name}</span>}
                </div>
                <div className="book__field">
                  <label className="book__label">Email</label>
                  <input
                    className={`book__input${errors.email ? ' book__input--error' : ''}`}
                    type="email"
                    placeholder="your@email.com"
                    value={info.email}
                    onChange={e => setInfo(p => ({ ...p, email: e.target.value }))}
                  />
                  {errors.email && <span className="book__error">{errors.email}</span>}
                </div>
                <div className="book__field">
                  <label className="book__label">Phone</label>
                  <input
                    className={`book__input${errors.phone ? ' book__input--error' : ''}`}
                    type="tel"
                    placeholder="+1 (613) 000-0000"
                    value={info.phone}
                    onChange={e => setInfo(p => ({ ...p, phone: e.target.value }))}
                  />
                  {errors.phone && <span className="book__error">{errors.phone}</span>}
                </div>
              </div>

              <button
                className="book__next-btn"
                onClick={() => { if (validate()) handleWaitlistSubmit() }}
                disabled={submitting}
              >
                {submitting ? 'Joining…' : 'Join Waitlist'}
              </button>
            </motion.div>
          )}

          {/* ── Step: Waitlist Done ── */}
          {step === 'waitlist-done' && date && (
            <motion.div key="waitlist-done"
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="book__done"
            >
              <img src="/zowaitlistletter.png" alt="" className="book__waitlist-img" />
              <h2 className="book__done-title">You're on the list.</h2>
              <p className="book__done-sub">
                We'll email <strong>{info.email}</strong> if a spot opens up on{' '}
                {DAY_NAMES[date.getDay()]}, {MONTH_NAMES[date.getMonth()]} {date.getDate()}.
              </p>
              <p className="book__done-note">Keep an eye on your inbox.</p>
              <button className="book__next-btn" style={{ marginTop: 32 }} onClick={reset}>
                Back to Services
              </button>
            </motion.div>
          )}

          {/* ── Step 5: Done ── */}
          {step === 'done' && service && date && time && (
            <motion.div key="done"
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="book__done"
            >
              <div className="book__done-icon">✦</div>
              <h2 className="book__done-title">You're booked.</h2>
              {confirmationNum && (
                <div className="book__done-conf">
                  <span className="book__done-conf-label">Confirmation</span>
                  <span className="book__done-conf-num">{confirmationNum}</span>
                </div>
              )}
              <p className="book__done-sub">
                {service.name} on {formatDate(date)} at {time}.<br />
                A confirmation will be sent to {info.email}.
              </p>
              <p className="book__done-note">Payment due in person. See you there.</p>
              <button className="book__next-btn" style={{ marginTop: 32 }} onClick={reset}>
                Book Another
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </>
  )
}
