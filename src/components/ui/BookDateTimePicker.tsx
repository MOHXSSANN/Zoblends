import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { supabase } from "@/lib/supabase"

// ── Business rules ──────────────────────────────────────────────────
const BUFFER_MIN             = 10       // minutes between appointments
const MAX_PER_DAY            = 12       // max bookings per day
const REGULAR_NOTICE_MIN     = 60       // regular slots need 1hr advance notice
const DAY_START_MIN          = 10 * 60  // 10:00 AM
const REGULAR_END_MIN        = 19 * 60  // 7:00 PM  — late night starts
const PREMIUM_START_MIN      = 21 * 60  // 9:00 PM  — premium tier (+$20)
const LATE_NIGHT_END_MIN     = 22 * 60  // 10:00 PM

export interface SlotFees { lateNightFee: number }

interface Props {
  durationMin: number
  onConfirm: (date: Date, time: string, fees: SlotFees) => void
  onDateChange?: (date: Date | undefined) => void
}

interface Slot {
  label: string
  startMin: number
  lateNightFee: number
}

const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function minToLabel(m: number): string {
  const h = Math.floor(m / 60), min = m % 60
  const ap = h >= 12 ? 'PM' : 'AM'
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${min === 0 ? '00' : String(min).padStart(2,'0')} ${ap}`
}


function buildSlots(durationMin: number, date: Date): Slot[] {
  const now    = new Date()
  const step   = durationMin + BUFFER_MIN
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const slots: Slot[] = []

  for (let start = DAY_START_MIN; start + durationMin <= LATE_NIGHT_END_MIN; start += step) {
    const isLateNight = start >= REGULAR_END_MIN
    const lateNightFee = start >= PREMIUM_START_MIN ? 20 : isLateNight ? 15 : 0

    const slotDate = new Date(date)
    slotDate.setHours(Math.floor(start / 60), start % 60, 0, 0)
    const minsUntil = (slotDate.getTime() - now.getTime()) / 60_000

    if (minsUntil < 0) continue  // past

    // Regular slots need 1hr notice
    if (!isLateNight && minsUntil < REGULAR_NOTICE_MIN) continue

    slots.push({
      label:      minToLabel(start),
      startMin:   start,
      lateNightFee,
    })
  }
  return slots
}

function isoToLabel(iso: string): string {
  const d = new Date(iso)
  return minToLabel(d.getHours() * 60 + d.getMinutes())
}

// ── Component ───────────────────────────────────────────────────────
export function BookDateTimePicker({ durationMin, onConfirm, onDateChange }: Props) {
  const [date,         setDate]         = React.useState<Date | undefined>()
  const [time,         setTime]         = React.useState<string | null>(null)
  const [takenSlots,   setTakenSlots]   = React.useState<Set<string>>(new Set())
  const [dailyCount,   setDailyCount]   = React.useState(0)
  const [fullDates,    setFullDates]    = React.useState<Set<string>>(new Set())
  const [loading,      setLoading]      = React.useState(false)

  // Pre-load full days for the next 60 days so calendar can grey them out
  React.useEffect(() => {
    const now = new Date()
    const end = new Date(); end.setDate(end.getDate() + 60)
    supabase
      .from('bookings')
      .select('starts_at')
      .eq('status', 'confirmed')
      .gte('starts_at', now.toISOString())
      .lte('starts_at', end.toISOString())
      .then(({ data }) => {
        if (!data) return
        const counts: Record<string, number> = {}
        data.forEach(b => {
          const day = b.starts_at.slice(0, 10)
          counts[day] = (counts[day] ?? 0) + 1
        })
        const full = new Set(Object.entries(counts).filter(([,c]) => c >= MAX_PER_DAY).map(([d]) => d))
        setFullDates(full)
      })
  }, [])

  // Load taken slots + daily count when date changes
  React.useEffect(() => {
    if (!date) return
    const day = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
    setLoading(true)
    setTime(null)
    supabase
      .from('bookings')
      .select('starts_at')
      .eq('status', 'confirmed')
      .gte('starts_at', `${day}T00:00:00`)
      .lte('starts_at', `${day}T23:59:59`)
      .then(({ data, error }) => {
        if (error) console.error('[BookDateTimePicker]', error)
        const rows = data ?? []
        setDailyCount(rows.length)
        setTakenSlots(new Set(rows.map(b => isoToLabel(b.starts_at))))
        setLoading(false)
      }, () => setLoading(false))
  }, [date])

  const isDisabled = (d: Date) => {
    const today = new Date(); today.setHours(0,0,0,0)
    if (d < today) return true
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    return fullDates.has(key)
  }

  function handleDateSelect(d: Date | undefined) {
    setDate(d); setTime(null); onDateChange?.(d)
  }

  const slots      = date ? buildSlots(durationMin, date) : []
  const dayFull    = dailyCount >= MAX_PER_DAY
  const fmtDate    = (d: Date) => `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`

  return (
    <div className="w-full">

      {/* Calendar */}
      <div className="w-full flex justify-center">
        <div style={{ width: '100%', maxWidth: 320, position: 'relative' }}>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={isDisabled}
          />
        </div>
      </div>

      {/* Time slots */}
      {date && (
        <div style={{ marginTop: 56 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(245,244,240,0.3)', textAlign: 'center', marginBottom: 24 }}>
            {fmtDate(date)}
          </p>

          {loading ? (
            <p style={{ fontSize: 11, color: 'rgba(245,244,240,0.3)', textAlign: 'center', padding: '32px 0' }}>
              Checking availability...
            </p>
          ) : dayFull ? (
            <p style={{ fontSize: 12, color: 'rgba(245,244,240,0.4)', textAlign: 'center', padding: '32px 24px', lineHeight: 1.7 }}>
              This day is fully booked.<br />
              <span style={{ color: '#d4af37' }}>Join the waitlist below ↓</span>
            </p>
          ) : slots.length === 0 ? (
            <p style={{ fontSize: 12, color: 'rgba(245,244,240,0.4)', textAlign: 'center', padding: '32px 24px' }}>
              No available slots for this day.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {slots.map((s, idx) => {
                const taken    = takenSlots.has(s.label)
                const selected = time === s.label

                return (
                  <React.Fragment key={s.label}>
                    <button
                      disabled={taken}
                      onClick={() => !taken && setTime(s.label)}
                      style={{
                        width: '100%', padding: '18px 20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        border: 'none',
                        borderBottom: idx < slots.length - 1 ? '1px solid rgba(212,175,55,0.07)' : 'none',
                        background: selected ? 'rgba(212,175,55,0.1)' : 'transparent',
                        cursor: taken ? 'not-allowed' : 'pointer',
                        transition: 'background 0.15s', outline: 'none',
                      }}
                    >
                      {/* Time label */}
                      <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.06em', color: taken ? 'rgba(245,244,240,0.2)' : selected ? '#d4af37' : 'rgba(245,244,240,0.8)' }}>
                        {s.label}
                      </span>

                      {/* Badges */}
                      <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {taken && (
                          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#d4af37', opacity: 0.45 }}>
                            Booked
                          </span>
                        )}
                        {!taken && s.lateNightFee > 0 && (
                          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#d4af37', background: 'rgba(212,175,55,0.1)', padding: '2px 6px' }}>
                            +${s.lateNightFee} Late Night
                          </span>
                        )}
                      </span>
                    </button>

                    {selected && (
                      <button
                        onClick={() => onConfirm(date, time!, { lateNightFee: s.lateNightFee })}
                        style={{ width: '100%', padding: '18px 16px', background: '#d4af37', color: '#000', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', outline: 'none', marginBottom: 2 }}
                      >
                        Continue — {s.label}
                        {s.lateNightFee > 0 && ` (+$${s.lateNightFee})`}
                      </button>
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
