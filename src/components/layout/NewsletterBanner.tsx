import { useState } from 'react'
import './NewsletterBanner.css'

export default function NewsletterBanner() {
  const [email, setEmail] = useState('')
  const [sent, setSent]   = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSent(true)
  }

  return (
    <section className="nl">
      <span className="nl__eyebrow">Stay Sharp</span>
      <h2 className="nl__heading">Follow Zoblends</h2>
      <p className="nl__sub">
        First dibs on booking drops, new product arrivals,<br className="nl__br" /> and exclusive offers.
      </p>

      {sent ? (
        <p className="nl__thanks">You&rsquo;re on the list. See you at the chair.</p>
      ) : (
        <form className="nl__form" onSubmit={handleSubmit}>
          <input
            className="nl__input"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button className="nl__btn" type="submit">Notify Me</button>
        </form>
      )}

      <p className="nl__social-label">Or follow us on social</p>
      <div className="nl__socials">
        {/* Pill button: circular avatar + handle — matches the demo style */}
        <a
          className="nl__pill"
          href="https://instagram.com/zo_blendz_"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="nl__pill-avatar">
            {/* Instagram gradient icon in circle */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.975.975 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.975.975-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.975-.975-1.246-2.242-1.308-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.975-.975 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.014 7.052.072 5.197.157 3.355.673 2.014 2.014.673 3.355.157 5.197.072 7.052.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.085 1.855.601 3.697 1.942 5.038 1.341 1.341 3.183 1.857 5.038 1.942C8.332 23.986 8.741 24 12 24s3.668-.014 4.948-.072c1.855-.085 3.697-.601 5.038-1.942 1.341-1.341 1.857-3.183 1.942-5.038.058-1.28.072-1.689.072-4.948 0-3.259-.014-3.668-.072-4.948-.085-1.855-.601-3.697-1.942-5.038C20.645.673 18.803.157 16.948.072 15.668.014 15.259 0 12 0z"/>
              <path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </span>
          <span className="nl__pill-handle">@zo_blendz_</span>
        </a>
      </div>
    </section>
  )
}
