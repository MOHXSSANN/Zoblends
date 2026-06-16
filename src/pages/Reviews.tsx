import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
  ContainerScroll,
  CardsContainer,
  CardTransformed,
  ReviewStars,
} from '../components/ui/AnimatedCardsStack'
import { ReviewSummaryCard } from '../components/ui/ReviewSummaryCard'
import './Reviews.css'
import './Page.css'

const EASE_OUT_QUART: [number,number,number,number] = [0.165, 0.84, 0.44, 1]

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Khalid M.',
    service: 'Signature Blend',
    rating: 5,
    description: "Zo doesn't miss. Walked in with a faded mess and walked out looking like a whole different person. The attention to detail is on another level.",
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: 2,
    name: 'Tyler B.',
    service: 'Skin Fade',
    rating: 5,
    description: "Best barber in Ottawa no debate. Been going for 6 months straight — every single cut is clean. Wouldn't trust anyone else.",
    avatarUrl: 'https://randomuser.me/api/portraits/men/44.jpg',
  },
  {
    id: 3,
    name: 'Marcus J.',
    service: 'Shape Up',
    rating: 5,
    description: "The vibe, the precision, the conversation — everything is top tier. You can tell Zo actually cares about the craft.",
    avatarUrl: 'https://randomuser.me/api/portraits/men/51.jpg',
  },
  {
    id: 4,
    name: 'Aiden W.',
    service: 'Full Cut & Style',
    rating: 5,
    description: "First time going and I was genuinely impressed. Booked my next appointment before I even left the chair.",
    avatarUrl: 'https://randomuser.me/api/portraits/men/67.jpg',
  },
]

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

        {/* ── Scroll-driven card stack ── */}
        <ContainerScroll className="reviews__scroll-section">
          <div className="reviews__sticky">
            <CardsContainer className="reviews__cards-wrap">
              {TESTIMONIALS.map((t, i) => (
                <CardTransformed
                  key={t.id}
                  arrayLength={TESTIMONIALS.length}
                  index={i + 2}
                  role="article"
                >
                  {/* Stars */}
                  <ReviewStars rating={t.rating} />

                  {/* Quote */}
                  <blockquote className="acs__quote">
                    <span className="acs__quote-mark">"</span>
                    {t.description}
                  </blockquote>

                  {/* Author */}
                  <div className="acs__author">
                    <img
                      src={t.avatarUrl}
                      alt={t.name}
                      className="acs__avatar"
                    />
                    <div>
                      <span className="acs__name">{t.name}</span>
                      <span className="acs__service">{t.service}</span>
                    </div>
                  </div>
                </CardTransformed>
              ))}
            </CardsContainer>
          </div>
        </ContainerScroll>

        {/* ── CTA ── */}
        <div className="reviews__cta">
          <p className="reviews__cta-text">Ready to get your cut?</p>
          <a href="/book" className="reviews__cta-btn">Book Now →</a>
        </div>

      </div>
    </>
  )
}
