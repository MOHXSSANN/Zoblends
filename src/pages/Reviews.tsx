import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Testimonials } from '../components/ui/unique-testimonial'
import './Reviews.css'
import './Page.css'

const EASE_OUT_QUART: [number,number,number,number] = [0.165, 0.84, 0.44, 1]

export default function Reviews() {
  return (
    <>
      <Helmet>
        <title>Reviews — Zoblends</title>
        <meta name="description" content="Real clients. Real cuts. See what everyone's saying about Zoblends, Ottawa." />
      </Helmet>

      <div className="reviews-page">
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

        <motion.div
          className="reviews__divider"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: EASE_OUT_QUART, delay: 0.2 }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT_QUART, delay: 0.3 }}
        >
          <Testimonials />
        </motion.div>

        <div className="reviews__cta">
          <p className="reviews__cta-text">Ready to get your cut?</p>
          <a href="/book" className="reviews__cta-btn">Book Now →</a>
        </div>
      </div>
    </>
  )
}
