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
            <img src="/image.png" alt="Zoblends" width={24} height={24} />
          </span>
          <span className="nl__pill-handle">@zo_blendz_</span>
        </a>
      </div>
    </section>
  )
}
