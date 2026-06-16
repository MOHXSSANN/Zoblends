import { useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import './Reviews.css'
import './Page.css'

const EASE_OUT_QUART: [number,number,number,number] = [0.165, 0.84, 0.44, 1]

const REVIEWS = [
  {
    id: 1,
    name: 'Khalid M.',
    rating: 5,
    date: 'May 2026',
    text: 'Zo doesn\'t miss. Walked in with a faded mess and walked out looking like a whole different person. The attention to detail is on another level.',
    service: 'Signature Blend',
  },
  {
    id: 2,
    name: 'Tyler B.',
    rating: 5,
    date: 'Apr 2026',
    text: 'Best barber in Ottawa no debate. Been going for 6 months straight — every single cut is clean. Wouldn\'t trust anyone else.',
    service: 'Skin Fade',
  },
  {
    id: 3,
    name: 'Marcus J.',
    rating: 5,
    date: 'Apr 2026',
    text: 'The vibe, the precision, the conversation — everything is top tier. You can tell Zo actually cares about the craft.',
    service: 'Shape Up',
  },
  {
    id: 4,
    name: 'Aiden W.',
    rating: 5,
    date: 'Mar 2026',
    text: 'First time going and I was genuinely impressed. Zo took his time and made sure everything was exactly how I wanted it. Booked my next appointment before I even left.',
    service: 'Full Cut & Style',
  },
  {
    id: 5,
    name: 'Jordan T.',
    rating: 5,
    date: 'Mar 2026',
    text: 'Came in for a last minute cut before a job interview and Zo came through. Got the job. Coincidence? I think not.',
    service: 'Signature Blend',
  },
  {
    id: 6,
    name: 'Noah P.',
    rating: 5,
    date: 'Feb 2026',
    text: 'The lineup is so crisp it looks drawn on. Genuinely the cleanest barber I\'ve found in this city after trying like 8 different spots.',
    service: 'Line Up',
  },
  {
    id: 7,
    name: 'Dante R.',
    rating: 5,
    date: 'Feb 2026',
    text: 'Zo is a real one. Cuts are consistent every time, never rushing, always locked in. The garage setup is lowkey the coolest spot to get a cut.',
    service: 'Skin Fade',
  },
  {
    id: 8,
    name: 'Elijah S.',
    rating: 5,
    date: 'Jan 2026',
    text: 'My hairline has never looked this good in my life. Been getting cuts since I was a kid and Zo is easily top 3 I\'ve ever been to.',
    service: 'Full Cut & Style',
  },
  {
    id: 9,
    name: 'James O.',
    rating: 5,
    date: 'Jan 2026',
    text: 'Came for a beard trim, stayed for the whole experience. The blends are immaculate, the fade is surgical. Five stars isn\'t enough.',
    service: 'Beard Trim',
  },
]

function StarRow({ animate = false }: { rating: number; animate?: boolean }) {
  return (
    <div className={`reviews__stars${animate ? ' reviews__stars--animate' : ''}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="reviews__star"
          style={{ '--i': i } as React.CSSProperties}
        >★</span>
      ))}
    </div>
  )
}

export default function Reviews() {
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cards = cardsRef.current?.querySelectorAll('.reviews__card')
    if (!cards) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reviews__card--visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    cards.forEach(card => observer.observe(card))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Helmet>
        <title>Reviews — Zoblends</title>
        <meta name="description" content="Real clients. Real cuts. See what everyone's saying about Zoblends, Ottawa." />
      </Helmet>

      <div className="reviews-page">

        {/* ── Header ── */}
        <motion.div
          className="reviews__header"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT_QUART }}
        >
          <span className="page__eyebrow">03 / Reviews</span>
          <h1 className="page__title">Hear It From Them</h1>
          <p className="reviews__sub">Real clients. No filter.</p>
        </motion.div>

        {/* ── Rating stat ── */}
        <motion.div
          className="reviews__stat"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT_QUART, delay: 0.2 }}
        >
          <div className="reviews__stat-score">5.0</div>
          <div className="reviews__stat-right">
            <StarRow rating={5} animate />
            <span className="reviews__stat-count">{REVIEWS.length} reviews · Google</span>
          </div>
        </motion.div>

        {/* ── Divider ── */}
        <motion.div
          className="reviews__divider"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: EASE_OUT_QUART, delay: 0.35 }}
        />

        {/* ── Grid ── */}
        <div className="reviews__grid" ref={cardsRef}>
          {REVIEWS.map((r, i) => (
            <article
              key={r.id}
              className="reviews__card"
              style={{ '--delay': `${i * 60}ms` } as React.CSSProperties}
            >
              <div className="reviews__card-top">
                <div className="reviews__avatar">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <span className="reviews__name">{r.name}</span>
                  <span className="reviews__date">{r.date}</span>
                </div>
                <div className="reviews__card-stars">
                  <StarRow rating={r.rating} />
                </div>
              </div>

              <p className="reviews__text">
                <span className="reviews__quote">"</span>
                {r.text}
              </p>

              <div className="reviews__service-tag">{r.service}</div>
            </article>
          ))}
        </div>

        {/* ── CTA ── */}
        <motion.div
          className="reviews__cta"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE_OUT_QUART, delay: 0.5 }}
        >
          <p className="reviews__cta-text">Ready to get your cut?</p>
          <a href="/book" className="reviews__cta-btn">Book Now →</a>
        </motion.div>

      </div>
    </>
  )
}
