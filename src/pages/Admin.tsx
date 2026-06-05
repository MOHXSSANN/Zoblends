import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Navigate, Link } from 'react-router-dom'
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
  notes?: string | null; late_night_fee?: boolean; last_minute_fee?: boolean
  payment_method?: string | null
}
interface WaitlistEntry {
  id: string; name: string; email: string; phone: string
  desired_date: string; status: string; created_at: string
}
interface ShopOrder {
  id: string; stripe_session_id: string; customer_email: string; customer_name: string | null
  items: { id: string; name: string; price: string; qty: number }[]
  total_cents: number; status: string; created_at: string
}

const MONTH = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const fmt = (iso: string) => { const d = new Date(iso); return `${MONTH[d.getMonth()]} ${d.getDate()} · ${fmtTime(iso)}` }
const fmtTime = (iso: string) => { const d = new Date(iso); const h = d.getHours(); const m = d.getMinutes(); const ap = h>=12?'PM':'AM'; const h12=h>12?h-12:h===0?12:h; return `${h12}:${m===0?'00':String(m).padStart(2,'0')} ${ap}` }
const fmtDate = (s: string) => { const d = new Date(s+'T12:00:00'); return `${MONTH[d.getMonth()]} ${d.getDate()}` }

const STATUS_BADGE: Record<string, { bg: string; border: string; color: string }> = {
  confirmed: { bg: 'rgba(212,175,55,0.15)',  border: 'rgba(212,175,55,0.4)',  color: '#d4af37' },
  completed: { bg: 'rgba(107,214,163,0.12)', border: 'rgba(107,214,163,0.4)', color: '#6bd6a3' },
  cancelled: { bg: 'rgba(224,85,85,0.12)',   border: 'rgba(224,85,85,0.35)',  color: '#e05555' },
  no_show:   { bg: 'rgba(224,85,85,0.12)',   border: 'rgba(224,85,85,0.35)',  color: '#e05555' },
}

export default function Admin() {
  const { user } = useAuth()
  const [tab, setTab]           = useState<'upcoming'|'past'|'waitlist'|'orders'|'analytics'>('upcoming')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [orders, setOrders]     = useState<ShopOrder[]>([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<Booking | null>(null)
  const [updating, setUpdating] = useState(false)
  const [search, setSearch]     = useState('')

  if (!user) return <Navigate to="/" replace />
  if (user.email !== ADMIN_EMAIL) return <Navigate to="/" replace />

  useEffect(() => {
    Promise.all([
      supabase.from('bookings').select('*').order('starts_at', { ascending: true }),
      supabase.from('waitlist').select('*').order('created_at', { ascending: true }),
      supabase.from('shop_orders').select('*').order('created_at', { ascending: false }),
    ]).then(([{ data: b }, { data: w }, { data: o }]) => {
      setBookings((b as Booking[]) ?? [])
      setWaitlist((w as WaitlistEntry[]) ?? [])
      setOrders((o as ShopOrder[]) ?? [])
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
          type: 'receipt-and-review',
          to: booking.email,
          name: booking.name,
          service: booking.service_name,
          date: dateStr,
          time: timeStr,
          price: booking.service_price,
          confirmationNumber: booking.confirmation_number ?? '',
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

  async function markAllComplete() {
    setUpdating(true)
    const toComplete = todayBookings.filter(b => b.status === 'confirmed')
    await Promise.all(toComplete.map(b => supabase.from('bookings').update({ status: 'completed' }).eq('id', b.id)))
    setBookings(prev => prev.map(b => toComplete.find(t => t.id === b.id) ? { ...b, status: 'completed' } : b))
    toComplete.forEach(b => {
      const d = new Date(b.starts_at)
      const DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
      const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December']
      fetch('/api/send-email', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ type:'receipt-and-review', to:b.email, name:b.name, service:b.service_name,
          date:`${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`,
          time: fmtTime(b.starts_at), price:b.service_price, confirmationNumber:b.confirmation_number??'' }),
      }).catch(()=>{})
    })
    setUpdating(false)
  }

  async function updatePaymentMethod(id: string, method: string) {
    await supabase.from('bookings').update({ payment_method: method }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, payment_method: method } : b))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, payment_method: method } : null)
  }

  const now = new Date()
  const upcoming = bookings.filter(b => new Date(b.starts_at) >= now && b.status === 'confirmed')
  const past     = bookings.filter(b => new Date(b.starts_at) <  now || b.status !== 'confirmed')
  const todayStr = now.toISOString().split('T')[0]
  const todayBookings = upcoming.filter(b => b.starts_at.startsWith(todayStr))
  const activeWait = waitlist.filter(w => w.status === 'waiting')

  // Analytics
  const completed = bookings.filter(b => b.status === 'completed')
  const totalRevenue = completed.reduce((sum, b) => sum + parseInt(b.service_price.replace(/\D/g,''), 10), 0)
  const cashRevenue = completed.filter(b => b.payment_method === 'cash').reduce((s,b) => s + parseInt(b.service_price.replace(/\D/g,''),10), 0)
  const etRevenue   = completed.filter(b => !b.payment_method || b.payment_method === 'etransfer').reduce((s,b) => s + parseInt(b.service_price.replace(/\D/g,''),10), 0)
  const revByMonth: Record<string, number> = {}
  completed.forEach(b => {
    const key = b.starts_at.slice(0, 7)
    revByMonth[key] = (revByMonth[key] ?? 0) + parseInt(b.service_price.replace(/\D/g,''), 10)
  })
  const busyDays: Record<string, number> = { Sun:0, Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0 }
  const busyHours: Record<string, number> = {}
  const DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  bookings.forEach(b => {
    busyDays[DAY_SHORT[new Date(b.starts_at).getDay()]]++
    const h = new Date(b.starts_at).getHours()
    const label = h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h-12} PM`
    busyHours[label] = (busyHours[label] ?? 0) + 1
  })
  const topServices: Record<string, number> = {}
  completed.forEach(b => { topServices[b.service_name] = (topServices[b.service_name] ?? 0) + 1 })
  const cashCount     = bookings.filter(b => b.payment_method === 'cash').length
  const etransferCount = bookings.filter(b => !b.payment_method || b.payment_method === 'etransfer').length

  function exportCSV() {
    const rows = [
      ['Confirmation','Name','Email','Phone','Service','Date','Time','Price','Payment','Status','Notes'],
      ...bookings.map(b => {
        const d = new Date(b.starts_at)
        return [
          b.confirmation_number ?? '',
          b.name, b.email, b.phone,
          b.service_name,
          `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
          fmtTime(b.starts_at),
          b.service_price,
          b.payment_method ?? 'etransfer',
          b.status,
          (b.notes ?? '').replace(/,/g, ' '),
        ]
      })
    ]
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `zoblends-bookings-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
  }

  const q = search.toLowerCase().trim()
  const filterBookings = (list: Booking[]) => !q ? list : list.filter(b =>
    b.name.toLowerCase().includes(q) ||
    b.email.toLowerCase().includes(q) ||
    (b.confirmation_number || '').toLowerCase().includes(q)
  )
  const filterWaitlist = (list: WaitlistEntry[]) => !q ? list : list.filter(w =>
    w.name.toLowerCase().includes(q) ||
    w.email.toLowerCase().includes(q)
  )
  const filterOrders = (list: ShopOrder[]) => !q ? list : list.filter(o =>
    (o.customer_name || '').toLowerCase().includes(q) ||
    (o.customer_email || '').toLowerCase().includes(q) ||
    (o.stripe_session_id || '').toLowerCase().includes(q)
  )

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
          <Link to="/admin/finance" className="admin__finance-link">View Finance →</Link>
        </motion.div>

        {/* Stats */}
        <div className="admin__stats">
          {[
            { label: "Today's Bookings", val: todayBookings.length },
            { label: 'Upcoming',         val: upcoming.length      },
            { label: 'Waitlist',         val: activeWait.length    },
            { label: 'Total Revenue',    val: `$${totalRevenue}`   },
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

        {/* Mark all today complete */}
        {todayBookings.filter(b => b.status === 'confirmed').length > 0 && (
          <button className="admin__mark-all" onClick={markAllComplete} disabled={updating}>
            ✓ Mark All Today's Cuts Complete ({todayBookings.filter(b => b.status === 'confirmed').length}) — sends receipts
          </button>
        )}

        {/* Tabs */}
        <div className="admin__tabs">
          {(['upcoming','past','waitlist','orders','analytics'] as const).map(t => (
            <button key={t} className={`admin__tab${tab===t?' admin__tab--active':''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
              {t === 'waitlist' && activeWait.length > 0 && (
                <span className="admin__tab-badge">{activeWait.length}</span>
              )}
              {t === 'orders' && orders.length > 0 && (
                <span className="admin__tab-badge">{orders.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="admin__search">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            className="admin__search-input"
            type="text"
            placeholder="Search by name, email or confirmation #…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="admin__search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        {loading ? (
          <p className="admin__loading">Loading…</p>
        ) : tab === 'analytics' ? (
          <div className="admin__analytics">
            <div className="admin__analytics-section">
              <div className="admin__analytics-title">Revenue by Month</div>
              {Object.entries(revByMonth).sort().reverse().slice(0, 6).map(([month, rev]) => (
                <div key={month} className="admin__analytics-row">
                  <span>{month}</span>
                  <span className="admin__analytics-val">${rev}</span>
                </div>
              ))}
              {Object.keys(revByMonth).length === 0 && <p className="admin__empty">No completed bookings yet.</p>}
            </div>
            <div className="admin__analytics-section">
              <div className="admin__analytics-title">Busiest Days</div>
              {Object.entries(busyDays).sort((a,b) => b[1]-a[1]).map(([day, count]) => (
                <div key={day} className="admin__analytics-row">
                  <span>{day}</span>
                  <div className="admin__analytics-bar-wrap">
                    <div className="admin__analytics-bar" style={{ width: `${Math.max(4, (count / Math.max(...Object.values(busyDays), 1)) * 100)}%` }} />
                    <span className="admin__analytics-val">{count}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="admin__analytics-section">
              <div className="admin__analytics-title">Top Services</div>
              {Object.entries(topServices).sort((a,b)=>b[1]-a[1]).map(([svc, count]) => (
                <div key={svc} className="admin__analytics-row">
                  <span>{svc}</span><span className="admin__analytics-val">{count} cuts</span>
                </div>
              ))}
              {Object.keys(topServices).length === 0 && <p className="admin__empty">No data yet.</p>}
            </div>
            <div className="admin__analytics-section">
              <div className="admin__analytics-title">Revenue by Payment Method</div>
              <div className="admin__analytics-row">
                <span>E-Transfer ({etransferCount} cuts)</span>
                <span className="admin__analytics-val">${etRevenue}</span>
              </div>
              <div className="admin__analytics-row">
                <span>Cash ({cashCount} cuts)</span>
                <span className="admin__analytics-val">${cashRevenue}</span>
              </div>
              <div className="admin__analytics-row" style={{ borderTop: '1px solid rgba(212,175,55,0.15)', marginTop: 4, paddingTop: 12 }}>
                <span style={{ color: '#d4af37', fontWeight: 700 }}>Total Revenue</span>
                <span className="admin__analytics-val" style={{ color: '#d4af37', fontSize: 18 }}>${totalRevenue}</span>
              </div>
            </div>

            <div className="admin__analytics-section">
              <div className="admin__analytics-title">Busiest Times</div>
              {Object.entries(busyHours).sort((a,b) => b[1]-a[1]).slice(0,6).map(([hour, count]) => (
                <div key={hour} className="admin__analytics-row">
                  <span>{hour}</span>
                  <div className="admin__analytics-bar-wrap">
                    <div className="admin__analytics-bar" style={{ width: `${Math.max(4, (count / Math.max(...Object.values(busyHours), 1)) * 100)}%` }} />
                    <span className="admin__analytics-val">{count}</span>
                  </div>
                </div>
              ))}
              {Object.keys(busyHours).length === 0 && <p className="admin__empty">No data yet.</p>}
            </div>

            <button className="admin__export-btn" onClick={exportCSV}>
              ↓ Export All Bookings as CSV
            </button>
          </div>
        ) : tab === 'orders' ? (
          <div className="admin__list">
            {filterOrders(orders).length === 0 ? (
              <p className="admin__empty">{q ? `No results for "${search}"` : 'No shop orders yet.'}</p>
            ) : filterOrders(orders).map(o => (
              <div key={o.id} className="admin__row">
                <div className="admin__row-main">
                  <span className="admin__row-name">{o.customer_name || o.customer_email}</span>
                  <span className="admin__row-meta">{o.customer_email}</span>
                  <span className="admin__row-service">
                    {o.items.map(i => `${i.name} ×${i.qty}`).join(' · ')}
                  </span>
                  <span className="admin__row-meta">{new Date(o.created_at).toLocaleDateString('en-CA',{month:'short',day:'numeric',year:'numeric'})}</span>
                </div>
                <div className="admin__row-right">
                  <span className="admin__row-status" style={{ color: '#6bd6a3' }}>
                    ${(o.total_cents / 100).toFixed(2)}
                  </span>
                  <span className="admin__row-conf" style={{ color: o.status === 'paid' ? '#d4af37' : 'rgba(245,244,240,0.3)' }}>
                    {o.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : tab === 'waitlist' ? (
          <div className="admin__list">
            {filterWaitlist(waitlist).length === 0 ? <p className="admin__empty">{q ? `No results for "${search}"` : 'No waitlist entries.'}</p> : filterWaitlist(waitlist).map(w => (
              <div key={w.id} className={`admin__row admin__row--waitlist${w.status!=='waiting'?' admin__row--dim':''}`}>
                <div className="admin__row-main">
                  <span className="admin__row-name">{w.name}</span>
                  <span className="admin__row-meta">{w.email} · {w.phone}</span>
                  <span className="admin__row-meta">Wants: {fmtDate(w.desired_date)}</span>
                </div>
                <div className="admin__row-right">
                  <span className={`admin__waitlist-badge admin__waitlist-badge--${w.status}`}>
                    {w.status === 'waiting' ? 'WAITING' : 'CANCELLED'}
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
            {filterBookings(tab==='upcoming' ? upcoming : past).length === 0 ? (
              <p className="admin__empty">{q ? `No results for "${search}"` : `No ${tab} bookings.`}</p>
            ) : filterBookings(tab==='upcoming' ? upcoming : past).map(b => (
              <button key={b.id} className="admin__row" onClick={() => setSelected(b)}>
                <div className="admin__row-main">
                  <span className="admin__row-name">{b.name}</span>
                  <span className="admin__row-service">
                    {b.service_name} · {b.service_price}
                    {b.last_minute_fee && <span className="admin__fee-badge admin__fee-badge--lm">+$25</span>}
                    {b.late_night_fee  && <span className="admin__fee-badge admin__fee-badge--ln">🌙</span>}
                  </span>
                  <span className="admin__row-meta">{fmt(b.starts_at)}</span>
                </div>
                <div className="admin__row-right">
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 800,
                    letterSpacing: '0.16em', textTransform: 'uppercase', padding: '4px 8px', borderRadius: 2,
                    background: (STATUS_BADGE[b.status] ?? STATUS_BADGE.confirmed).bg,
                    border: `1px solid ${(STATUS_BADGE[b.status] ?? STATUS_BADGE.confirmed).border}`,
                    color: (STATUS_BADGE[b.status] ?? STATUS_BADGE.confirmed).color,
                  }}>
                    {b.status.replace('_',' ').toUpperCase()}
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
            <button className="admin__panel-close" onClick={() => setSelected(null)}>← Back</button>
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
              {selected.notes && (
                <div className="admin__panel-row admin__panel-notes">
                  <span>Notes</span><span style={{ fontStyle:'italic', opacity:0.7 }}>{selected.notes}</span>
                </div>
              )}
              {(selected.late_night_fee || selected.last_minute_fee) && (
                <div className="admin__panel-row">
                  <span>Fees</span>
                  <span>
                    {selected.late_night_fee && <span style={{color:'#d4af37', marginRight:8}}>Late Night +$15</span>}
                    {selected.last_minute_fee && <span style={{color:'#e05555'}}>Last Minute +$25</span>}
                  </span>
                </div>
              )}
            </div>

            {/* Payment method */}
            <div className="admin__panel-payment">
              <span className="admin__panel-payment-label">Payment</span>
              <div className="admin__panel-payment-btns">
                {['cash','etransfer'].map(m => {
                  const effective = (!selected.payment_method || selected.payment_method === 'unknown') ? 'etransfer' : selected.payment_method
                  return (
                    <button key={m}
                      className={`admin__panel-payment-btn${effective===m?' active':''}`}
                      onClick={() => updatePaymentMethod(selected.id, m)}
                    >
                      {m === 'etransfer' ? 'E-Transfer' : 'Cash'}
                    </button>
                  )
                })}
              </div>
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
