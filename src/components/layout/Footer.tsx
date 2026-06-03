import { Link } from 'react-router-dom'
import './Footer.css'

const NAV = [
  { label: 'The Receipts', href: '/gallery' },
  { label: 'The Barber',   href: '/about'   },
  { label: 'Reviews',      href: '/reviews' },
  { label: 'Shop',         href: '/shop'    },
  { label: 'Get in Touch', href: '/contact' },
]

const HOURS = [
  { day: 'Sun - Thu', time: '11AM - 7PM' },
  { day: 'Fri - Sat', time: '11AM - 8PM' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">

        {/* Brand */}
        <div className="footer__brand">
          <Link to="/" className="footer__logo">ZoBlends</Link>
          <p className="footer__tagline">Precision cuts and clean fades in Ottawa.<br />Walk in sharp, every time.</p>
        </div>

        {/* Navigate */}
        <div className="footer__col">
          <span className="footer__col-label">Navigate</span>
          {NAV.map(l => (
            <Link key={l.href} to={l.href} className="footer__link">{l.label}</Link>
          ))}
          <Link to="/book" className="footer__link">Book Now</Link>
        </div>

        {/* Info */}
        <div className="footer__col">
          <span className="footer__col-label">Info</span>
          <span className="footer__text">Nepean, Ottawa, ON</span>
          <a href="https://instagram.com/zo_blendz_" target="_blank" rel="noopener noreferrer" className="footer__link">@zo_blendz_</a>
          <span className="footer__text footer__text--dim">Payment in person only</span>
        </div>

        {/* Hours */}
        <div className="footer__col">
          <span className="footer__col-label">Hours</span>
          {HOURS.map(h => (
            <div key={h.day} className="footer__hours-row">
              <span className="footer__text">{h.day}</span>
              <span className="footer__text footer__text--gold">{h.time}</span>
            </div>
          ))}
        </div>

      </div>

      <div className="footer__bottom">
        <span className="footer__copy">© 2026 Zoblends, Ottawa, ON.</span>
        <a href="https://instagram.com/zo_blendz_" target="_blank" rel="noopener noreferrer" className="footer__bottom-ig">Instagram</a>
      </div>
    </footer>
  )
}
