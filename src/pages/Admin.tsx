import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import './Admin.css'

const ADMIN_EMAIL = 'mo.hxssan360@gmail.com'
const EASE: [number,number,number,number] = [0.16,1,0.3,1]

interface Booking {
  id: string; confirmation_number: string | null; name: string; email: string; phone: string
  service_name: string; service_price: string; service_duration: string
  starts_at: string; status: string; created_at: string
}
interface WaitlistEntry {
  id: string; name: string; email: string; phone: string
  desired_date: string; status: string; created_at: string
}

const MONTH = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const fmt = (iso: string) => { const d = new Date(iso); return `${MONTH[d.getMonth()]} ${d.getDate()} · ${fmtTime(iso)}` }
const fmtTime = (iso: string) => { const d = new Date(iso); const h = d.getHours(); const m = d.getMinutes(); const ap = h>=12?'PM':'AM'; const h12=h>12?h-12:h===0?12:h; return `${h12}:${m===0?'00':String(m).padStart(2,'0')} ${ap}` }
const fmtDate = (s: string) => { const d = new Date(s+'T12:00:00'); return `${MONTH[d.getMonth()]} ${d.getDate()}` }

const STATUS_COLORS: Record<string,string> = {
  confirmed: '#d4af37', cancelled: 'rgba(245,244,240,0.25)',
  completed: 'rgba(245,244,240,0.4)', no_show: '#e05555'
}

export default function Admin() {
  const { user } = useAuth()
  const [tab, setTab]           = useState<'upcoming'|'past'|'waitlist'>('upcoming')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<Booking | null>(null)
  const [updating, setUpdating] = useState(false)

  if (!user) return <Navigate to="/" replace />
  if (user.email !== ADMIN_EMAIL) return <Navigate to="/" replace />

  useEffect(() => {
    Promise.all([
      supabase.from('bookings').select('*').order('starts_at', { ascending: true }),
      supabase.from('waitlist').select('*').order('created_at', { ascending: true }),
    ]).then(([{ data: b }, { data: w }]) => {
      setBookings((b as Booking[]) ?? [])
      setWaitlist((w as WaitlistEntry[]) ?? [])
      setLoading(false)
    })
  }, [])

  async function updateStatus(id: string, status: string) {
    setUpdating(true)
    await supabase.from('bookings').update({ status }).eq('id', id)
    const booking = bookings.find(b => b.id === id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null)
    setUpdating(false)

    if (!booking) return
    const d = new Date(booking.starts_at)
    const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
    const dateStr = `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`
    const h = d.getHours(), mn = d.getMinutes()
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
    const timeStr = `${h12}:${mn === 0 ? '00' : String(mn).padStart(2,'0')} ${ampm}`
    const isoDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

    if (status === 'completed') {
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'review-request',
          to: booking.email,
          name: booking.name,
          service: booking.service_name,
          date: dateStr,
        }),
      }).catch(() => {})
    }

    if (status === 'no_show') {
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'no-show-warning',
          to: booking.email,
          name: booking.name,
          service: booking.service_name,
          date: dateStr,
          time: timeStr,
        }),
      }).catch(() => {})
    }

    if (status === 'cancelled') {
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'booking-cancellation',
          to: booking.email,
          name: booking.name,
          service: booking.service_name,
          date: dateStr,
          time: timeStr,
          confirmationNumber: booking.confirmation_number ?? '',
        }),
      }).catch(() => {})

      fetch('/api/notify-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: isoDate }),
      }).catch(() => {})
    }
  }

  async function dismissWaitlist(id: string) {
    await supabase.from('waitlist').update({ status: 'cancelled' }).eq('id', id)
    setWaitlist(prev => prev.map(w => w.id === id ? { ...w, status: 'cancelled' } : w))
  }

  const now = new Date()
  const upcoming = bookings.filter(b => new Date(b.starts_at) >= now && b.status === 'confirmed')
  const past     = bookings.filter(b => new Date(b.starts_at) <  now || b.status !== 'confirmed')
  const todayStr = now.toISOString().split('T')[0]
  const todayBookings = upcoming.filter(b => b.starts_at.startsWith(todayStr))
  const activeWait = waitlist.filter(w => w.status === 'waiting')

  return (
    <>
      <Helmet><title>Admin | Zoblends</title></Helmet>

      <div className="admin">
        <motion.div className="admin__header"
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.6, ease:EASE }}
        >
          <h1 className="admin__title">Dashboard</h1>
          <p className="admin__sub">Zoblends · {new Date().toLocaleDateString('en-CA',{weekday:'long',month:'long',day:'numeric'})}</p>
        </motion.div>

        {/* Stats */}
        <div className="admin__stats">
          {[
            { label: "Today's Bookings", val: todayBookings.length },
            { label: 'Upcoming',         val: upcoming.length      },
            { label: 'Waitlist',         val: activeWait.length    },
            { label: 'Total All-Time',   val: bookings.length      },
          ].map((s, i) => (
            <motion.div key={s.label} className="admin__stat"
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: i*0.06, duration:0.45, ease:EASE }}
            >
              <span className="admin__stat-val">{s.val}</span>
              <span className="admin__stat-label">{s.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="admin__tabs">
          {(['upcoming','past','waitlist'] as const).map(t => (
            <button key={t} className={`admin__tab${tab===t?' admin__tab--active':''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
              {t === 'waitlist' && activeWait.length > 0 && (
                <span className="admin__tab-badge">{activeWait.length}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="admin__loading">Loading…</p>
        ) : tab === 'waitlist' ? (
          <div className="admin__list">
            {waitlist.length === 0 ? <p className="admin__empty">No waitlist entries.</p> : waitlist.map(w => (
              <div key={w.id} className={`admin__row admin__row--waitlist${w.status!=='waiting'?' admin__row--dim':''}`}>
                <div className="admin__row-main">
                  <span className="admin__row-name">{w.name}</span>
                  <span className="admin__row-meta">{w.email} · {w.phone}</span>
                  <span className="admin__row-meta">Wants: {fmtDate(w.desired_date)}</span>
                </div>
                <div className="admin__row-right">
                  <span className="admin__row-status" style={{ color: w.status==='waiting'?'#d4af37':'rgba(245,244,240,0.25)' }}>
                    {w.status.charAt(0).toUpperCase()+w.status.slice(1)}
                  </span>
                  {w.status === 'waiting' && (
                    <button className="admin__row-action admin__row-action--cancel" onClick={() => dismissWaitlist(w.id)}>
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="admin__list">
            {(tab==='upcoming' ? upcoming : past).length === 0 ? (
              <p className="admin__empty">No {tab} bookings.</p>
            ) : (tab==='upcoming' ? upcoming : past).map(b => (
              <button key={b.id} className="admin__row" onClick={() => setSelected(b)}>
                <div className="admin__row-main">
                  <span className="admin__row-name">{b.name}</span>
                  <span className="admin__row-service">{b.service_name} · {b.service_price}</span>
                  <span className="admin__row-meta">{fmt(b.starts_at)}</span>
                </div>
                <div className="admin__row-right">
                  <span className="admin__row-status" style={{ color: STATUS_COLORS[b.status] ?? 'white' }}>
                    {b.status.charAt(0).toUpperCase()+b.status.slice(1).replace('_',' ')}
                  </span>
                  {b.confirmation_number && (
                    <span className="admin__row-conf">{b.confirmation_number}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="admin__panel-backdrop" onClick={() => setSelected(null)}>
          <div className="admin__panel" onClick={e => e.stopPropagation()}>
            <button className="admin__panel-close" onClick={() => setSelected(null)}>✕</button>
            <p className="admin__panel-eyebrow">Booking Detail</p>
            {selected.confirmation_number && (
              <p className="admin__panel-conf">{selected.confirmation_number}</p>
            )}
            <div className="admin__panel-rows">
              {[
                ['Client',    selected.name],
                ['Email',     selected.email],
                ['Phone',     selected.phone],
                ['Service',   selected.service_name],
                ['Date/Time', fmt(selected.starts_at)],
                ['Duration',  selected.service_duration],
                ['Price',     selected.service_price],
                ['Status',    selected.status],
              ].map(([k,v]) => (
                <div key={k} className="admin__panel-row">
                  <span>{k}</span><span>{v}</span>
                </div>
              ))}
            </div>
            <div className="admin__panel-actions">
              {['confirmed','completed','no_show','cancelled'].map(s => (
                <button
                  key={s}
                  className={`admin__panel-btn${selected.status===s?' admin__panel-btn--active':''}`}
                  onClick={() => updateStatus(selected.id, s)}
                  disabled={updating || selected.status===s}
                >
                  {s.replace('_',' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
