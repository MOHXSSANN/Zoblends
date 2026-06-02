import './ContactInfo8bit.css'

const HOURS = [
  { day: 'Sun', time: '11AM – 7PM' },
  { day: 'Mon', time: '11AM – 7PM' },
  { day: 'Tue', time: '11AM – 7PM' },
  { day: 'Wed', time: '11AM – 7PM' },
  { day: 'Thu', time: '11AM – 7PM' },
  { day: 'Fri', time: '11AM – 8PM' },
  { day: 'Sat', time: '11AM – 8PM' },
]

const TODAY_IDX = new Date().getDay() // 0=Sun

export default function ContactInfo8bit() {
  return (
    <div className="ci8">

      {/* Hours card */}
      <div className="ci8__card">
        <div className="ci8__card-title">Opening Hours</div>
        <div className="ci8__hours">
          {HOURS.map((h, i) => (
            <div key={h.day} className={`ci8__hour-row${i === TODAY_IDX ? ' ci8__hour-row--today' : ''}`}>
              <span className="ci8__day">{h.day}</span>
              <span className="ci8__dots" />
              <span className="ci8__time">{h.time}</span>
              {i === TODAY_IDX && <span className="ci8__today-tag">◄ TODAY</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Contact card */}
      <div className="ci8__card">
        <div className="ci8__card-title">Contact</div>
        <div className="ci8__links">
          <a href="tel:6132625907" className="ci8__link-row">
            <span className="ci8__link-icon">☎</span>
            <span className="ci8__link-text">(613) 262-5907</span>
          </a>
          <a href="https://instagram.com/zo_blendz_" target="_blank" rel="noopener noreferrer" className="ci8__link-row">
            <span className="ci8__link-icon">◈</span>
            <span className="ci8__link-text">@zo_blendz_</span>
          </a>
        </div>
      </div>

    </div>
  )
}
