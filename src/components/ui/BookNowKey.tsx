import { useNavigate } from 'react-router-dom'
import './BookNowKey.css'

export default function BookNowKey() {
  const navigate = useNavigate()

  return (
    <div className="key-wrap" onClick={() => navigate('/book')}>
      <label className="key-label" htmlFor="book-key">
        <input id="book-key" type="checkbox" aria-label="Book Now" readOnly />
        <button className="key-btn" type="button">
          <div className="key-corner" />
          <div className="key-inner">
            <span className="key-text">BOOK NOW</span>
            <span className="key-sub">Reserve your chair</span>
          </div>
        </button>
        <div className="key-led" />
        <div className="key-bg">
          <div className="key-shine-1" />
          <div className="key-shine-2" />
        </div>
        <div className="key-bg-glow" />
      </label>
      <div className="key-noise" aria-hidden="true">
        <svg height="100%" width="100%">
          <defs>
            <filter id="key-noise-filter">
              <feTurbulence stitchTiles="stitch" numOctaves={3} baseFrequency="0.65" type="fractalNoise" />
              <feBlend mode="screen" />
            </filter>
            <pattern height={500} width={500} patternUnits="userSpaceOnUse" id="key-noise-pattern">
              <rect filter="url(#key-noise-filter)" height={500} width={500} />
            </pattern>
          </defs>
          <rect fill="url(#key-noise-pattern)" height="100%" width="100%" />
        </svg>
      </div>
    </div>
  )
}
