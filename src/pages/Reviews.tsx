import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import './Page.css'

export default function Reviews() {
  return (
    <>
      <Helmet>
        <title>Reviews — Zoblends</title>
        <meta name="description" content="Hear it from them. Real clients, real cuts. Zoblends, Ottawa." />
      </Helmet>

      <div className="page">
        <motion.div
          className="page__header"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="page__eyebrow">03 / Reviews</span>
          <h1 className="page__title">Hear It From Them</h1>
          <p className="page__sub">Real clients. No filter.</p>
        </motion.div>

        <motion.div
          className="page__coming"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <span className="page__coming-line" />
          <p>Testimonials loading in.</p>
          <span className="page__coming-line" />
        </motion.div>
      </div>
    </>
  )
}
