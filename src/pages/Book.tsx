import { useState, useRef, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import './Page.css'
import './Book.css'

const SERVICES = [
  { id: 'kids-cut',      name: 'Kids Cut',             duration: '30 min', durationMin: 30, price: '$30' },
  { id: 'haircut',       name: 'Haircut',              duration: '35 min', durationMin: 35, price: '$40' },
  { id: 'cut-beard',     name: 'Full Haircut + Beard', duration: '40 min', durationMin: 40, price: '$45' },
  { id: 'full-service',  name: 'Full Service',         duration: '1 hr',   durationMin: 60, price: '$50' },
  { id: 'lineup',        name: 'Line Up / Clean Up',   duration: '25 min', durationMin: 25, price: '$25' },
]

type Step = 'service' | 'datetime' | 'details' | 'confirm' | 'done'

interface GuestInfo { name: string; email: string; phone: string }

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function getAvailableDates(): Date[] {
  const dates: Date[] = []
  const d = new Date()
  d.setHours(0,0,0,0)
  d.setDate(d.getDate() + 1)
  while (dates.length < 16) {
    if (d.getDay() !== 0) dates.push(new Date(d)) // no Sundays
    d.setDate(d.getDate() + 1)
  }
  return dates
}

function getTimeSlots(durationMin: number): string[] {
  const slots: string[] = []
  for (let total = 10 * 60; total + durationMin <= 18 * 60; total += durationMin) {
    const h = Math.floor(total / 60)
    const m = total % 60
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
    slots.push(`${h12}:${m === 0 ? '00' : m} ${ampm}`)
  }
  return slots
}

export default function Book() {
  const { user } = useAuth()
  const [step, setStep]             = useState<Step>('service')
  const [service, setService]       = useState<typeof SERVICES[0] | null>(null)
  const [date, setDate]             = useState<Date | null>(null)
  const [time, setTime]             = useState<string | null>(null)
  const [info, setInfo]             = useState<GuestInfo>({ name: '', email: '', phone: '' })
  const [errors, setErrors]         = useState<Partial<GuestInfo>>({})
  const [submitting, setSubmitting]         = useState(false)
  const [confirmationNum, setConfirmationNum] = useState<string | null>(null)
  const datesRef = useRef<HTMLDivElement>(null)

  const dates = getAvailableDates()
  const slots = service ? getTimeSlots(service.durationMin) : []

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

  function chooseDateTime() {
    if (!date || !time) return
    setStep('details')
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

    setSubmitting(false)
    if (!error) {
      setConfirmationNum(confNum)
      setStep('done')
    }
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

      <div className="page">
        <motion.div
          className="page__header"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="page__eyebrow">Book</span>
          <h1 className="page__title">Secure a Spot</h1>
          <p className="page__sub">Pick your service. Lock it in.</p>
        </motion.div>

        {/* ── Step indicator ── */}
        {step !== 'done' && (
          <div className="book__steps">
            {(['service','datetime','details','confirm'] as Step[]).map((s) => (
              <div key={s} className={`book__step-dot${step === s ? ' book__step-dot--active' : ''}`} />
            ))}
          </div>
        )}

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
              <div className="book__section-label">Chosen Service</div>
              <div className="book__chosen-service">
                <span>{service.name}</span>
                <span className="book__chosen-meta">{service.duration} · {service.price}</span>
              </div>

              <div className="book__section-label" style={{ marginTop: 28 }}>Pick a Date</div>
              <div className="book__dates" ref={datesRef}>
                {dates.map(d => (
                  <button
                    key={d.toISOString()}
                    className={`book__date-btn${date?.toDateString() === d.toDateString() ? ' book__date-btn--active' : ''}`}
                    onClick={() => { setDate(d); setTime(null) }}
                  >
                    <span className="book__date-day">{DAY_NAMES[d.getDay()]}</span>
                    <span className="book__date-num">{d.getDate()}</span>
                    <span className="book__date-month">{MONTH_NAMES[d.getMonth()]}</span>
                  </button>
                ))}
              </div>

              {date && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }}>
                  <div className="book__section-label" style={{ marginTop: 28 }}>Pick a Time</div>
                  <div className="book__slots">
                    {slots.map(s => (
                      <button
                        key={s}
                        className={`book__slot${time === s ? ' book__slot--active' : ''}`}
                        onClick={() => setTime(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <button
                className={`book__next-btn${date && time ? '' : ' book__next-btn--disabled'}`}
                onClick={chooseDateTime}
                disabled={!date || !time}
              >
                Continue →
              </button>
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
