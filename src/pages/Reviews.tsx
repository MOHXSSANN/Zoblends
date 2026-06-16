import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Marquee } from '../components/ui/Marquee'
import { ReviewSummaryCard } from '../components/ui/ReviewSummaryCard'
import './Reviews.css'
import './Page.css'

const EASE_OUT_QUART: [number,number,number,number] = [0.165, 0.84, 0.44, 1]

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Khalid M.',
    handle: '@khalidm',
    body: "Zo doesn't miss. Walked in with a faded mess and walked out looking like a whole different person.",
    img: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: 2,
    name: 'Tyler B.',
    handle: '@tylerb',
    body: "Best barber in Ottawa no debate. Been going 6 months straight — every single cut is clean.",
    img: 'https://randomuser.me/api/portraits/men/44.jpg',
  },
  {
    id: 3,
    name: 'Marcus J.',
    handle: '@marcusj',
    body: "The vibe, the precision, the conversation — everything is top tier. Zo actually cares about the craft.",
    img: 'https://randomuser.me/api/portraits/men/51.jpg',
  },
  {
    id: 4,
    name: 'Aiden W.',
    handle: '@aidenw',
    body: "First time going and I was genuinely impressed. Booked my next appointment before I even left.",
    img: 'https://randomuser.me/api/portraits/men/67.jpg',
  },
  {
    id: 5,
    name: 'Jordan T.',
    handle: '@jordant',
    body: "Came in for a last minute cut before a job interview and Zo came through. Got the job.",
    img: 'https://randomuser.me/api/portraits/men/23.jpg',
  },
  {
    id: 6,
    name: 'Noah P.',
    handle: '@noahp',
    body: "The lineup is so crisp it looks drawn on. Cleanest barber I've found in this city.",
    img: 'https://randomuser.me/api/portraits/men/77.jpg',
  },
  {
    id: 7,
    name: 'Dante R.',
    handle: '@danter',
    body: "Cuts are consistent every time, never rushing, always locked in. The garage setup is lowkey the coolest spot.",
    img: 'https://randomuser.me/api/portraits/men/85.jpg',
  },
  {
    id: 8,
    name: 'Elijah S.',
    handle: '@elijahs',
    body: "My hairline has never looked this good in my life. Zo is easily top 3 I've ever been to.",
    img: 'https://randomuser.me/api/portraits/men/91.jpg',
  },
  {
    id: 9,
    name: 'James O.',
    handle: '@jameso',
    body: "Came for a beard trim, stayed for the whole experience. Five stars isn't enough.",
    img: 'https://randomuser.me/api/portraits/men/55.jpg',
  },
]

function TestimonialCard({ name, handle, body, img }: typeof TESTIMONIALS[number]) {
  return (
    <div className="tcard">
      <div className="tcard__top">
        <img src={img} alt={name} className="tcard__avatar" />
        <div>
          <span className="tcard__name">{name}</span>
          <span className="tcard__handle">{handle}</span>
        </div>
        <div className="tcard__stars">★★★★★</div>
      </div>
      <p className="tcard__body">{body}</p>
    </div>
  )
}

export default function Reviews() {
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

        {/* ── Animated rating card ── */}
        <motion.div
          className="reviews__stat-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT_QUART, delay: 0.15 }}
        >
          <ReviewSummaryCard
            rating={5.0}
            reviewCount={TESTIMONIALS.length}
            summaryText={`Outstanding — rated 5.0 across ${TESTIMONIALS.length} reviews`}
          />
        </motion.div>

        {/* ── Divider ── */}
        <motion.div
          className="reviews__divider"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: EASE_OUT_QUART, delay: 0.3 }}
        />

        {/* ── 3D Marquee ── */}
        <motion.div
          className="reviews__marquee-scene"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: EASE_OUT_QUART, delay: 0.45 }}
        >
          <div className="reviews__marquee-3d">
            <Marquee vertical pauseOnHover repeat={3} style={{ '--duration': '38s' } as React.CSSProperties}>
              {TESTIMONIALS.map(t => <TestimonialCard key={t.id} {...t} />)}
            </Marquee>
            <Marquee vertical pauseOnHover reverse repeat={3} style={{ '--duration': '38s' } as React.CSSProperties}>
              {TESTIMONIALS.map(t => <TestimonialCard key={t.id} {...t} />)}
            </Marquee>
            <Marquee vertical pauseOnHover repeat={3} style={{ '--duration': '42s' } as React.CSSProperties}>
              {TESTIMONIALS.map(t => <TestimonialCard key={t.id} {...t} />)}
            </Marquee>
            <Marquee vertical pauseOnHover reverse repeat={3} style={{ '--duration': '36s' } as React.CSSProperties}>
              {TESTIMONIALS.map(t => <TestimonialCard key={t.id} {...t} />)}
            </Marquee>

            {/* Gradient fade edges */}
            <div className="reviews__fade reviews__fade--top" />
            <div className="reviews__fade reviews__fade--bottom" />
            <div className="reviews__fade reviews__fade--left" />
            <div className="reviews__fade reviews__fade--right" />
          </div>
        </motion.div>

        {/* ── CTA ── */}
        <motion.div
          className="reviews__cta"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE_OUT_QUART, delay: 0.6 }}
        >
          <p className="reviews__cta-text">Ready to get your cut?</p>
          <a href="/book" className="reviews__cta-btn">Book Now →</a>
        </motion.div>

      </div>
    </>
  )
}
