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
interface AdminProduct {
  id: string; name: string; price_cents: number; cost_price_cents: number
  stock: number; image_url?: string; active: boolean
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
  const [tab, setTab]           = useState<'upcoming'|'past'|'waitlist'|'orders'|'analytics'|'inventory'|'community'>('upcoming')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [orders, setOrders]         = useState<ShopOrder[]>([])
  const [products, setProducts]     = useState<AdminProduct[]>([])
  const [editStock, setEditStock]   = useState<Record<string, number>>({})
  const [editCost, setEditCost]     = useState<Record<string, number>>({})
  const [savingProd, setSavingProd] = useState<string | null>(null)
  const [communityPosts, setCommunityPosts] = useState<{ id: string; user_name: string; user_avatar: string | null; image_url: string; caption: string | null; created_at: string; status: string }[]>([])
  const [postComments, setPostComments] = useState<Record<string, { id: string; user_name: string; body: string; created_at: string }[]>>({})
  const [loadingComments, setLoadingComments] = useState<string | null>(null)
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected] = useState<Booking | null>(null)
  const [updating, setUpdating] = useState(false)
  const [search, setSearch]     = useState('')

  const isAdmin = !!user && user.email === ADMIN_EMAIL

  useEffect(() => {
    if (!isAdmin) return
    Promise.all([
      supabase.from('bookings').select('*').order('starts_at', { ascending: true }),
      supabase.from('waitlist').select('*').order('created_at', { ascending: true }),
      supabase.from('shop_orders').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('*').order('id'),
      supabase.from('community_posts').select('*').order('created_at', { ascending: false }),
    ]).then(([{ data: b }, { data: w }, { data: o }, { data: p }, { data: c }]) => {
      setBookings((b as Booking[]) ?? [])
      setWaitlist((w as WaitlistEntry[]) ?? [])
      setOrders((o as ShopOrder[]) ?? [])
      setProducts((p as AdminProduct[]) ?? [])
      setCommunityPosts(c ?? [])
      setLoading(false)
    })
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin || tab !== 'orders') return
    supabase.from('shop_orders').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setOrders(data as ShopOrder[]) })
  }, [isAdmin, tab])

  if (!user) return <Navigate to="/" replace />
  if (!isAdmin) return <Navigate to="/" replace />

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

  async function reviewPost(id: string, status: 'approved' | 'rejected') {
    await supabase.from('community_posts').update({ status }).eq('id', id)
    setCommunityPosts(prev => prev.map(p => p.id === id ? { ...p, status } : p))
  }

  async function deletePost(id: string) {
    if (!window.confirm('Delete this post permanently?')) return
    await supabase.from('community_posts').delete().eq('id', id)
    setCommunityPosts(prev => prev.filter(p => p.id !== id))
    setPostComments(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  async function toggleComments(postId: string) {
    if (postComments[postId]) {
      setPostComments(prev => { const n = { ...prev }; delete n[postId]; return n })
      return
    }
    setLoadingComments(postId)
    const { data } = await supabase.from('community_comments')
      .select('id,user_name,body,created_at').eq('post_id', postId).order('created_at', { ascending: true })
    setPostComments(prev => ({ ...prev, [postId]: data ?? [] }))
    setLoadingComments(null)
  }

  async function deleteComment(postId: string, commentId: string) {
    await supabase.from('community_comments').delete().eq('id', commentId)
    setPostComments(prev => ({ ...prev, [postId]: prev[postId].filter(c => c.id !== commentId) }))
  }

  async function fulfillOrder(id: string) {
    const { error } = await supabase.from('shop_orders').update({ status: 'fulfilled' }).eq('id', id)
    if (error) { alert(`Couldn't update order: ${error.message}`); return }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'fulfilled' } : o))
  }

  async function saveProduct(id: string) {
    setSavingProd(id)
    const updates: Partial<AdminProduct> = {}
    if (editStock[id] !== undefined) updates.stock            = editStock[id]
    if (editCost[id]  !== undefined) updates.cost_price_cents = editCost[id] * 100
    await supabase.from('products').update(updates).eq('id', id)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
    setEditStock(prev => { const n = { ...prev }; delete n[id]; return n })
    setEditCost(prev  => { const n = { ...prev }; delete n[id]; return n })
    setSavingProd(null)
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
  const bookingRevenue = completed.reduce((sum, b) => sum + parseInt(b.service_price.replace(/\D/g,''), 10), 0)
  const shopRevenue = orders.filter(o => o.status === 'fulfilled' || o.status === 'paid').reduce((s, o) => s + o.total_cents / 100, 0)
  const totalRevenue = bookingRevenue + shopRevenue
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

  function exportXLSX() {
    const statusMap: Record<string, string> = {
      confirmed: 'Confirmed', completed: 'Completed',
      cancelled: 'Cancelled', no_show: 'No Show',
    }
    const svcMap: Record<string, { name: string; price: number; dur: number; w: number }> = {}
    const wbBookings = bookings.map(b => {
      const d   = new Date(b.starts_at)
      const price = parseInt(b.service_price.replace(/\D/g, ''), 10) || 0
      const dur   = parseInt(b.service_duration, 10) || 30
      if (!svcMap[b.service_name]) svcMap[b.service_name] = { name: b.service_name, price, dur, w: 1 }
      const lateExtra = b.late_night_fee ? 10 : 0
      const lmExtra   = b.last_minute_fee ? 8 : 0
      return {
        client: { name: b.name, email: b.email, phone: b.phone },
        svc: { name: b.service_name, price, dur },
        d: d.toISOString().slice(0, 10),
        hour: d.getHours(), minute: d.getMinutes(),
        lateNight: b.late_night_fee ? 'Y' : 'N',
        lastMin:   b.last_minute_fee ? 'Y' : 'N',
        payment:   b.payment_method === 'cash' ? 'Cash' : 'E-Transfer',
        status:    statusMap[b.status] ?? 'Confirmed',
        notes:     b.notes ?? '',
        conf:      b.confirmation_number ?? '',
        total:     price + lateExtra + lmExtra,
      }
    })

    const clientMap: Record<string, { name: string; email: string; phone: string; visits: number; spent: number; svcCount: Record<string, number> }> = {}
    wbBookings.forEach(bk => {
      const key = bk.client.name
      if (!clientMap[key]) clientMap[key] = { ...bk.client, visits: 0, spent: 0, svcCount: {} }
      if (bk.status === 'Completed') {
        clientMap[key].visits++
        clientMap[key].spent += bk.total
        clientMap[key].svcCount[bk.svc.name] = (clientMap[key].svcCount[bk.svc.name] ?? 0) + 1
      }
    })
    const directory = Object.values(clientMap)
      .sort((a, b) => b.visits - a.visits || b.spent - a.spent)
      .map(c => {
        let pref = '', best = -1
        Object.entries(c.svcCount).forEach(([s, n]) => { if (n > best) { best = n; pref = s } })
        return { name: c.name, email: c.email, phone: c.phone, preferred: pref }
      })

    const wbWaitlist = waitlist.map(w => ({
      name: w.name, email: w.email, phone: w.phone,
      desired: w.desired_date,
      added:   w.created_at.slice(0, 10),
      status:  w.status.charAt(0).toUpperCase() + w.status.slice(1),
      notes:   '',
    }))

    const SERVICES = Object.values(svcMap)
    const payload = {
      SERVICES: SERVICES.length ? SERVICES : [
        { name:'Skin Fade',price:45,dur:45,w:1},{ name:'Classic Cut',price:35,dur:30,w:1},
        { name:'Cut & Beard Combo',price:55,dur:60,w:1},{ name:'Beard Trim',price:20,dur:20,w:1},
      ],
      clients: Object.values(clientMap),
      bookings: wbBookings,
      directory,
      agg: {},
      income: [],
      expenses: [],
      waitlist: wbWaitlist,
    }

    sessionStorage.setItem('zbRealData', JSON.stringify(payload))
    window.open('/xlsx/build.html', '_blank')
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
          {(['upcoming','past','waitlist','orders','analytics','inventory','community'] as const).map(t => (
            <button key={t} className={`admin__tab${tab===t?' admin__tab--active':''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
              {t === 'waitlist' && activeWait.length > 0 && (
                <span className="admin__tab-badge">{activeWait.length}</span>
              )}
              {t === 'orders' && orders.length > 0 && (
                <span className="admin__tab-badge">{orders.length}</span>
              )}
              {t === 'community' && communityPosts.filter(p => p.status === 'pending').length > 0 && (
                <span className="admin__tab-badge">{communityPosts.filter(p => p.status === 'pending').length}</span>
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

            <button className="admin__export-btn" style={{ background:'rgba(212,175,55,0.12)', border:'1px solid rgba(212,175,55,0.45)', color:'#d4af37' }} onClick={exportXLSX}>
              ↓ Export Excel (.xlsx)
            </button>
          </div>
        ) : tab === 'inventory' ? (
          <div className="admin__inventory">
            {products.length === 0 ? (
              <p className="admin__empty">No products found. Run the products SQL migration first.</p>
            ) : (
              <>
                <div className="admin__inventory-header">
                  <span>Product</span>
                  <span>Stock</span>
                  <span>Cost</span>
                  <span>Sale</span>
                  <span>Margin</span>
                  <span>Sold</span>
                  <span></span>
                </div>
                {products.map(p => {
                  const unitsSold = orders.reduce((sum, o) => {
                    const found = o.items?.find(i => i.id === p.id)
                    return sum + (found?.qty ?? 0)
                  }, 0)
                  const saleCents   = p.price_cents
                  const costCents   = editCost[p.id] !== undefined ? editCost[p.id] * 100 : p.cost_price_cents
                  const margin      = saleCents > 0 ? Math.round(((saleCents - costCents) / saleCents) * 100) : 0
                  const stockVal    = editStock[p.id] !== undefined ? editStock[p.id] : p.stock
                  const isDirty     = editStock[p.id] !== undefined || editCost[p.id] !== undefined
                  return (
                    <div key={p.id} className="admin__inventory-row">
                      <span className="admin__inventory-name">{p.name}</span>
                      <span className="admin__inventory-cell">
                        <input
                          className="admin__inventory-input"
                          type="number" min={0}
                          value={stockVal}
                          onChange={e => setEditStock(prev => ({ ...prev, [p.id]: parseInt(e.target.value) || 0 }))}
                          style={{ borderColor: stockVal <= 3 ? 'rgba(224,85,85,0.5)' : undefined }}
                        />
                        {stockVal <= 3 && stockVal > 0 && <span className="admin__inventory-low">Low</span>}
                        {stockVal === 0 && <span className="admin__inventory-out">Out</span>}
                      </span>
                      <span className="admin__inventory-cell">
                        $<input
                          className="admin__inventory-input admin__inventory-input--sm"
                          type="number" min={0} step="0.01"
                          value={editCost[p.id] !== undefined ? editCost[p.id] : (p.cost_price_cents / 100).toFixed(2)}
                          onChange={e => setEditCost(prev => ({ ...prev, [p.id]: parseFloat(e.target.value) || 0 }))}
                        />
                      </span>
                      <span className="admin__inventory-val">${(saleCents / 100).toFixed(2)}</span>
                      <span className="admin__inventory-val" style={{ color: margin >= 40 ? '#6bd6a3' : margin >= 20 ? '#d4af37' : '#e05555' }}>
                        {margin}%
                      </span>
                      <span className="admin__inventory-val">{unitsSold}</span>
                      <button
                        className="admin__inventory-save"
                        onClick={() => saveProduct(p.id)}
                        disabled={!isDirty || savingProd === p.id}
                      >
                        {savingProd === p.id ? '…' : 'Save'}
                      </button>
                    </div>
                  )
                })}
              </>
            )}
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
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: 9, fontWeight: 800,
                    letterSpacing: '0.16em', textTransform: 'uppercase', padding: '4px 8px',
                    background: o.status === 'fulfilled' ? 'rgba(107,214,163,0.12)' : 'rgba(212,175,55,0.12)',
                    border: `1px solid ${o.status === 'fulfilled' ? 'rgba(107,214,163,0.4)' : 'rgba(212,175,55,0.4)'}`,
                    color: o.status === 'fulfilled' ? '#6bd6a3' : '#d4af37',
                  }}>
                    {o.status.toUpperCase()}
                  </span>
                  {o.status === 'pending' && (
                    <button className="admin__row-action" onClick={() => fulfillOrder(o.id)}
                      style={{ marginTop: 4 }}>
                      Mark Fulfilled
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : tab === 'community' ? (
          <div className="admin__community">
            {communityPosts.length === 0 ? (
              <p className="admin__empty">No community posts yet.</p>
            ) : (
              <>
                {['pending','approved','rejected'].map(status => {
                  const group = communityPosts.filter(p => p.status === status)
                  if (group.length === 0) return null
                  return (
                    <div key={status} className="admin__community-group">
                      <div className="admin__community-group-label">
                        {status === 'pending' ? '⏳ Pending Review' : status === 'approved' ? '✓ Approved' : '✕ Rejected'}
                        <span style={{ marginLeft: 8, opacity: 0.5 }}>({group.length})</span>
                      </div>
                      <div className="admin__community-grid">
                        {group.map(p => (
                          <div key={p.id} className="admin__community-card">
                            <img src={p.image_url} className="admin__community-img" alt="" />
                            <div className="admin__community-info">
                              <span className="admin__community-name">{p.user_name}</span>
                              {p.caption && <span className="admin__community-caption">{p.caption}</span>}
                              <span className="admin__community-date">
                                {new Date(p.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            <div className="admin__community-actions">
                              {status === 'pending' && <>
                                <button className="admin__community-approve" onClick={() => reviewPost(p.id, 'approved')}>Approve</button>
                                <button className="admin__community-reject" onClick={() => reviewPost(p.id, 'rejected')}>Reject</button>
                              </>}
                              {status !== 'pending' && (
                                <button className="admin__community-toggle" onClick={() => reviewPost(p.id, status === 'approved' ? 'rejected' : 'approved')}>
                                  {status === 'approved' ? 'Unapprove' : 'Approve'}
                                </button>
                              )}
                              <button className="admin__community-comments-btn" onClick={() => toggleComments(p.id)}>
                                {postComments[p.id] ? 'Hide' : loadingComments === p.id ? '…' : 'Comments'}
                              </button>
                              <button className="admin__community-delete" onClick={() => deletePost(p.id)}>Delete</button>
                            </div>
                            {postComments[p.id] && (
                              <div className="admin__community-comments">
                                {postComments[p.id].length === 0 ? (
                                  <p className="admin__community-no-comments">No comments.</p>
                                ) : postComments[p.id].map(c => (
                                  <div key={c.id} className="admin__community-comment">
                                    <div className="admin__community-comment-text">
                                      <strong>{c.user_name.split(' ')[0]}</strong>: {c.body}
                                    </div>
                                    <button className="admin__community-delete" onClick={() => deleteComment(p.id, c.id)}>✕</button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </>
            )}
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
