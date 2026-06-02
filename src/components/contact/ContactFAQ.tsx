import { useState } from 'react'
import './ContactFAQ.css'

const FAQS = [
  { q: 'Do you take walk-ins?',         a: 'Walk-ins are welcome but booking ahead is recommended. Slots fill up fast.' },
  { q: 'How do I book?',                 a: 'Hit the Secure a Spot button on the site. Pick your service, date and time.' },
  { q: 'How much is a fade?',            a: 'Haircut is $40. Full service is $50. Line up/clean up is $25.' },
  { q: 'Do you cut kids hair?',          a: 'Yes. Kids cuts are $30 and take about 30 minutes.' },
  { q: 'How long does it take?',         a: 'Depends on the service. Line ups are 25 min. Full service is 1 hour.' },
  { q: 'How do I pay?',                  a: 'Cash or card — payment is always in person at the appointment. No online payments.' },
  { q: 'Do you do beard trims?',         a: 'Full haircut + beard is $45. Takes about 40 minutes.' },
  { q: 'How far ahead should I book?',   a: 'At least a day or two. Fridays and Saturdays book out fast.' },
  { q: 'What if I\'m late?',             a: 'Message @zo_blendz_ as soon as possible. Late arrivals may need to reschedule.' },
  { q: 'Where are you located?',         a: 'Nepean, Ottawa. Exact address is sent after your booking is confirmed.' },
  { q: 'What are your hours?',           a: 'Mon–Thu: 11AM–7PM. Fri–Sat: 11AM–8PM. Sun: 11AM–7PM.' },
  { q: 'Can I cancel my booking?',       a: 'Yes. Just message @zo_blendz_ as soon as you know.' },
]

export default function ContactFAQ() {
  const [query, setQuery]   = useState('')
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  const filtered = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(query.toLowerCase()) ||
      f.a.toLowerCase().includes(query.toLowerCase())
  )

  function toggle(idx: number) {
    setOpenIdx((prev) => (prev === idx ? null : idx))
  }

  return (
    <div className="cfaq">
      <div className="cfaq__header">
        <div className="cfaq__title">Quick Answers</div>
        <div className="cfaq__sub">search anything</div>
      </div>

      <div className="cfaq__search-wrap">
        <svg className="cfaq__search-icon" width="14" height="14" viewBox="0 0 14 14" fill="#d4af37">
          <polygon points="2,1 13,7 2,13" />
        </svg>
        <input
          className="cfaq__search"
          type="text"
          placeholder="Type to search..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpenIdx(null) }}
          spellCheck={false}
        />
        {query && (
          <button className="cfaq__clear" onClick={() => { setQuery(''); setOpenIdx(null) }}>✕</button>
        )}
      </div>

      <div className="cfaq__grid">
        {filtered.length === 0 ? (
          <div className="cfaq__empty">No results found.</div>
        ) : (
          filtered.map((f, idx) => (
            <div
              key={f.q}
              className={`cfaq__card${openIdx === idx ? ' cfaq__card--open' : ''}`}
              onClick={() => toggle(idx)}
            >
              <div className="cfaq__row">
                <div className="cfaq__question">{f.q}</div>
                <span className="cfaq__chevron">{openIdx === idx ? '▲' : '▼'}</span>
              </div>
              {openIdx === idx && (
                <div className="cfaq__answer">{f.a}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
