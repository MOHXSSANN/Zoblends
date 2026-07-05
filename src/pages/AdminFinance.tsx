import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import './AdminFinance.css'

const ADMIN_EMAILS = ['mo.hxssan360@gmail.com', 'zawadsamin@gmail.com']

interface Booking {
  service_name: string
  service_price: string
  starts_at: string
  status: string
  payment_method: string | null
}
interface Expense {
  id: string
  description: string
  amount: number
  category: string
  purchased_at: string
}
interface ShopOrder {
  total_cents: number
  status: string
  created_at: string
}

const GOLD    = '#d4af37'
const GREEN   = '#6bd6a3'
const RED     = '#e05555'

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function parsePrice(p: string) { return parseInt(p.replace(/\D/g,''), 10) || 0 }

export default function AdminFinance() {
  const { user } = useAuth()
  const [bookings,  setBookings]  = useState<Booking[]>([])
  const [expenses,  setExpenses]  = useState<Expense[]>([])
  const [shopOrders, setShopOrders] = useState<ShopOrder[]>([])
  const [loading,   setLoading]   = useState(true)
  const [newDesc,   setNewDesc]   = useState('')
  const [newAmt,    setNewAmt]    = useState('')
  const [newDate,   setNewDate]   = useState(new Date().toISOString().slice(0,10))
  const [newCat,    setNewCat]    = useState('products')
  const [adding,    setAdding]    = useState(false)
  const [showForm,  setShowForm]  = useState(false)

  const isAdmin = !!user && ADMIN_EMAILS.includes(user.email ?? '')

  function fetchAll() {
    if (!isAdmin) return
    setLoading(true)
    Promise.all([
      supabase.from('bookings').select('service_name,service_price,starts_at,status,payment_method'),
      supabase.from('product_expenses').select('*').order('purchased_at', { ascending: false }),
      supabase.from('shop_orders').select('total_cents,status,created_at'),
    ]).then(([{ data: b }, { data: e }, { data: o }]) => {
      setBookings((b as Booking[]) ?? [])
      setExpenses((e as Expense[]) ?? [])
      setShopOrders((o as ShopOrder[]) ?? [])
      setLoading(false)
    })
  }

  useEffect(() => { fetchAll() }, [isAdmin])

  if (!user || !isAdmin) return <Navigate to="/" replace />

  // ── Revenue calcs ─────────────────────────────────────────────────
  const completed    = bookings.filter(b => b.status === 'completed')
  const bookingRev   = completed.reduce((s, b) => s + parsePrice(b.service_price), 0)
  const shopRev      = shopOrders.filter(o => o.status === 'fulfilled' || o.status === 'paid').reduce((s, o) => s + o.total_cents / 100, 0)
  const totalRev     = bookingRev + shopRev
  const etRev        = completed.filter(b => !b.payment_method || b.payment_method === 'etransfer').reduce((s,b) => s + parsePrice(b.service_price), 0)
  const cashRev      = completed.filter(b => b.payment_method === 'cash').reduce((s,b) => s + parsePrice(b.service_price), 0)
  const totalExp     = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const netProfit    = totalRev - totalExp

  // Payment method donut
  const paymentData = [
    { name: 'E-Transfer', value: etRev,   color: GOLD  },
    { name: 'Cash',       value: cashRev, color: GREEN },
  ].filter(d => d.value > 0)

  // Service breakdown donut
  const svcMap: Record<string,number> = {}
  completed.forEach(b => { svcMap[b.service_name] = (svcMap[b.service_name]??0) + parsePrice(b.service_price) })
  const SVC_COLORS = [GOLD, GREEN, '#7b8cf7', '#f7a97b', '#e05555', '#c1d4af']
  const serviceData = Object.entries(svcMap).map(([name, value], i) => ({ name, value, color: SVC_COLORS[i % SVC_COLORS.length] }))

  // Monthly revenue bar chart
  const monthMap: Record<string,number> = {}
  completed.forEach(b => {
    const d = new Date(b.starts_at)
    const key = `${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`
    monthMap[key] = (monthMap[key]??0) + parsePrice(b.service_price)
  })
  shopOrders.filter(o => o.status === 'fulfilled' || o.status === 'paid').forEach(o => {
    const d = new Date(o.created_at)
    const key = `${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`
    monthMap[key] = (monthMap[key]??0) + o.total_cents / 100
  })
  const monthData = Object.entries(monthMap).slice(-6).map(([month, revenue]) => ({ month, revenue }))

  // Expense by category
  const catMap: Record<string,number> = {}
  expenses.forEach(e => { catMap[e.category] = (catMap[e.category]??0) + Number(e.amount) })

  async function addExpense() {
    if (!newDesc.trim() || !newAmt) return
    setAdding(true)
    const { data } = await supabase.from('product_expenses').insert({
      description: newDesc.trim(),
      amount: parseFloat(newAmt),
      category: newCat,
      purchased_at: newDate,
    }).select().single()
    if (data) setExpenses(prev => [data as Expense, ...prev])
    setNewDesc(''); setNewAmt(''); setShowForm(false)
    setAdding(false)
  }

  async function deleteExpense(id: string) {
    await supabase.from('product_expenses').delete().eq('id', id)
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: {name:string;value:number}[] }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background:'#0f0e0c', border:'1px solid rgba(212,175,55,0.2)', padding:'10px 14px', fontSize:12 }}>
        <p style={{ color: GOLD, margin:0, fontWeight:700 }}>{payload[0].name}</p>
        <p style={{ color:'#f5f4f0', margin:'4px 0 0', fontWeight:600 }}>${payload[0].value.toLocaleString()}</p>
      </div>
    )
  }

  if (loading) return <div className="af__loading">Loading…</div>
  // DEBUG — remove after confirming
  console.log('[Finance] shopOrders:', shopOrders, 'shopRev:', shopRev, 'bookingRev:', bookingRev)

  return (
    <>
      <Helmet><title>Finance | Zoblends</title></Helmet>
      <div className="af">

        <div className="af__header">
          <h1 className="af__title">Finance</h1>
          <p className="af__sub">Revenue · Expenses · Profit</p>
          <button className="af__refresh-btn" onClick={fetchAll}>↺ Refresh</button>
        </div>

        {/* ── KPI row ── */}
        <div className="af__kpis">
          <div className="af__kpi">
            <span className="af__kpi-val" style={{ color: GOLD }}>${totalRev.toLocaleString()}</span>
            <span className="af__kpi-label">Total Revenue</span>
          </div>
          <div className="af__kpi">
            <span className="af__kpi-val" style={{ color: 'rgba(245,244,240,0.55)', fontSize: 18 }}>
              ${bookingRev.toLocaleString()} + ${shopRev.toLocaleString()}
            </span>
            <span className="af__kpi-label">Bookings + Shop</span>
          </div>
          <div className="af__kpi">
            <span className="af__kpi-val" style={{ color: RED }}>-${totalExp.toLocaleString()}</span>
            <span className="af__kpi-label">Product Costs</span>
          </div>
          <div className="af__kpi af__kpi--profit">
            <span className="af__kpi-val" style={{ color: netProfit >= 0 ? GREEN : RED }}>${netProfit.toLocaleString()}</span>
            <span className="af__kpi-label">Net Profit</span>
          </div>
        </div>

        {/* ── Monthly revenue bar ── */}
        {monthData.length > 0 && (
          <div className="af__card">
            <div className="af__card-title">Revenue by Month</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.08)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(245,244,240,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(245,244,240,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(212,175,55,0.05)' }} />
                <Bar dataKey="revenue" fill={GOLD} radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Donut charts row ── */}
        <div className="af__donuts">
          {paymentData.length > 0 && (
            <div className="af__card af__card--half">
              <div className="af__card-title">By Payment</div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={paymentData} cx="50%" cy="50%" innerRadius={44} outerRadius={66} paddingAngle={3} dataKey="value">
                    {paymentData.map((d,i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="af__legend">
                {paymentData.map(d => (
                  <div key={d.name} className="af__legend-item">
                    <span className="af__legend-dot" style={{ background: d.color }} />
                    <span>{d.name}</span>
                    <span className="af__legend-val">${d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {serviceData.length > 0 && (
            <div className="af__card af__card--half">
              <div className="af__card-title">By Service</div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={serviceData} cx="50%" cy="50%" innerRadius={44} outerRadius={66} paddingAngle={3} dataKey="value">
                    {serviceData.map((d,i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="af__legend">
                {serviceData.map(d => (
                  <div key={d.name} className="af__legend-item">
                    <span className="af__legend-dot" style={{ background: d.color }} />
                    <span>{d.name.split(' ')[0]}</span>
                    <span className="af__legend-val">${d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Product expenses ── */}
        <div className="af__card">
          <div className="af__expenses-header">
            <div className="af__card-title">Product Expenses</div>
            <button className="af__add-btn" onClick={() => setShowForm(v => !v)}>
              {showForm ? '✕ Cancel' : '+ Add'}
            </button>
          </div>

          {showForm && (
            <div className="af__form">
              <input className="af__input" placeholder="What did you buy?" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
              <div className="af__form-row">
                <input className="af__input" type="number" placeholder="Amount $" value={newAmt} onChange={e => setNewAmt(e.target.value)} />
                <input className="af__input" type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
              </div>
              <select className="af__input af__select" value={newCat} onChange={e => setNewCat(e.target.value)}>
                <option value="products">Products</option>
                <option value="tools">Tools / Equipment</option>
                <option value="supplies">Supplies</option>
                <option value="other">Other</option>
              </select>
              <button className="af__save-btn" onClick={addExpense} disabled={adding}>
                {adding ? 'Saving…' : 'Save Expense'}
              </button>
            </div>
          )}

          {expenses.length === 0 ? (
            <p className="af__empty">No expenses logged yet. Add your product costs to track profit.</p>
          ) : (
            <div className="af__expense-list">
              {expenses.map(e => (
                <div key={e.id} className="af__expense-row">
                  <div className="af__expense-info">
                    <span className="af__expense-desc">{e.description}</span>
                    <span className="af__expense-meta">{e.category} · {e.purchased_at}</span>
                  </div>
                  <div className="af__expense-right">
                    <span className="af__expense-amt">-${Number(e.amount).toFixed(2)}</span>
                    <button className="af__expense-del" onClick={() => deleteExpense(e.id)}>✕</button>
                  </div>
                </div>
              ))}
              <div className="af__expense-total">
                <span>Total Spent</span>
                <span>-${totalExp.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  )
}
