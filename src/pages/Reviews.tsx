import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Carousel, TestimonialCard, type iTestimonial } from '../components/ui/retro-testimonial'
import { ReviewSummaryCard } from '../components/ui/ReviewSummaryCard'
import './Reviews.css'
import './Page.css'

const EASE_OUT_QUART: [number,number,number,number] = [0.165, 0.84, 0.44, 1]

const BG = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop'

const TESTIMONIALS: iTestimonial[] = [
  {
    name: 'Khalid M.',
    designation: 'Signature Blend',
    description: "Zo doesn't miss. Walked in with a faded mess and walked out looking like a whole different person. The attention to detail is on another level.",
    profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop',
  },
  {
    name: 'Tyler B.',
    designation: 'Skin Fade',
    description: "Best barber in Ottawa no debate. Been going for 6 months straight — every single cut is clean. Wouldn't trust anyone else.",
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop',
  },
  {
    name: 'Marcus J.',
    designation: 'Shape Up',
    description: "The vibe, the precision, the conversation — everything is top tier. You can tell Zo actually cares about the craft.",
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop',
  },
  {
    name: 'Aiden W.',
    designation: 'Full Cut & Style',
    description: "First time going and I was genuinely impressed. Booked my next appointment before I even left the chair.",
    profileImage: 'https://images.unsplash.com/photo-1530268729831-4b0b9e170218?w=400&auto=format&fit=crop',
  },
]

const cards = TESTIMONIALS.map((t, i) => (
  <TestimonialCard
    key={t.name}
    testimonial={t}
    index={i}
    backgroundImage={BG}
  />
))

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

        {/* ── Rating summary ── */}
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

        {/* ── Testimonial carousel ── */}
        <Carousel items={cards} />

        {/* ── CTA ── */}
        <div className="reviews__cta">
          <p className="reviews__cta-text">Ready to get your cut?</p>
          <a href="/book" className="reviews__cta-btn">Book Now →</a>
        </div>

      </div>
    </>
  )
}
