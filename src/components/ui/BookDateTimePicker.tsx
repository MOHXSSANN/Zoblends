import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { supabase } from "@/lib/supabase"

interface Props {
  durationMin: number
  onConfirm: (date: Date, time: string) => void
  onDateChange?: (date: Date | undefined) => void
}

const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function getAvailableDates(): Date[] {
  const dates: Date[] = []
  const d = new Date()
  d.setHours(0,0,0,0)
  d.setDate(d.getDate() + 1)
  while (dates.length < 60) {
    if (d.getDay() !== 0) dates.push(new Date(d))
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
    slots.push(`${h12}:${m === 0 ? '00' : String(m).padStart(2,'0')} ${ampm}`)
  }
  return slots
}

function isoToSlot(iso: string): string {
  const d = new Date(iso)
  const h = d.getHours(), m = d.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${m === 0 ? '00' : String(m).padStart(2,'0')} ${ampm}`
}

export function BookDateTimePicker({ durationMin, onConfirm, onDateChange }: Props) {
  const [date, setDate]             = React.useState<Date | undefined>()
  const [time, setTime]             = React.useState<string | null>(null)
  const [takenSlots, setTakenSlots] = React.useState<Set<string>>(new Set())
  const [loadingSlots, setLoadingSlots] = React.useState(false)

  const availableDates = getAvailableDates()
  const slots          = getTimeSlots(durationMin)

  const disabledDays = (d: Date) => {
    const today = new Date(); today.setHours(0,0,0,0)
    return d < today || d.getDay() === 0
  }

  function handleDateSelect(d: Date | undefined) {
    setDate(d)
    setTime(null)
    onDateChange?.(d)
  }

  React.useEffect(() => {
    if (!date) return
    const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
    setLoadingSlots(true)
    supabase
      .from('bookings')
      .select('starts_at')
      .eq('status', 'confirmed')
      .gte('starts_at', `${dateStr}T00:00:00`)
      .lte('starts_at', `${dateStr}T23:59:59`)
      .then(({ data }: { data: { starts_at: string }[] | null }) => {
        setTakenSlots(new Set((data ?? []).map((b: { starts_at: string }) => isoToSlot(b.starts_at))))
        setLoadingSlots(false)
      })
  }, [date])

  const formatSelectedDate = (d: Date) =>
    `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`

  return (
    <div className="w-full">

      {/* ── Calendar ── */}
      <div className="w-full flex justify-center">
        <div style={{ width: '100%', maxWidth: 320 }}>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={disabledDays}
            defaultMonth={availableDates[0]}
          />
        </div>
      </div>

      {/* ── Time slots ── */}
      {date && (
        <div style={{ marginTop: 56 }}>

          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.24em',
            textTransform: 'uppercase', color: 'rgba(245,244,240,0.3)',
            textAlign: 'center', marginBottom: 24,
          }}>
            {formatSelectedDate(date)}
          </p>

          {loadingSlots ? (
            <p style={{ fontSize: 11, color: 'rgba(245,244,240,0.3)', textAlign: 'center', padding: '32px 0' }}>
              Checking availability...
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {slots.map((s, idx) => {
                const taken = takenSlots.has(s)
                const selected = time === s
                return (
                  <React.Fragment key={s}>
                    <button
                      disabled={taken}
                      onClick={() => !taken && setTime(s)}
                      style={{
                        width: '100%',
                        padding: '20px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                        border: 'none',
                        borderBottom: idx < slots.length - 1 ? '1px solid rgba(212,175,55,0.07)' : 'none',
                        background: selected ? 'rgba(212,175,55,0.1)' : 'transparent',
                        cursor: taken ? 'not-allowed' : 'pointer',
                        transition: 'background 0.15s',
                        outline: 'none',
                      }}
                    >
                      <span style={{
                        fontSize: 15,
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        color: taken
                          ? 'rgba(245,244,240,0.2)'
                          : selected
                          ? '#d4af37'
                          : 'rgba(245,244,240,0.8)',
                      }}>
                        {s}
                      </span>
                      {taken && (
                        <span style={{
                          fontSize: 9, fontWeight: 700, letterSpacing: '0.2em',
                          textTransform: 'uppercase', color: '#d4af37', opacity: 0.5,
                        }}>
                          Booked
                        </span>
                      )}
                    </button>

                    {/* Continue button appears directly below selected time */}
                    {selected && (
                      <button
                        onClick={() => onConfirm(date, time!)}
                        style={{
                          width: '100%',
                          padding: '18px 16px',
                          background: '#d4af37',
                          color: '#000',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.22em',
                          textTransform: 'uppercase',
                          outline: 'none',
                          marginBottom: 2,
                        }}
                      >
                        Continue — {s}
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
