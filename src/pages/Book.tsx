import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import './Page.css'
import './Book.css'

const SERVICES = [
  { name: 'Kids Cut',              duration: '30 min', price: '$30', desc: null },
  { name: 'Haircut',               duration: '35 min', price: '$40', desc: null },
  { name: 'Full Haircut + Beard',  duration: '40 min', price: '$45', desc: null },
  { name: 'Full Service',          duration: '1 hr',   price: '$50', desc: null },
  { name: 'Line Up / Clean Up',    duration: '25 min', price: '$25', desc: null },
]

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export default function Book() {
  return (
    <>
      <Helmet>
        <title>Secure a Spot | Zoblends</title>
        <meta name="description" content="Book your chair with Zoblends. Precision cuts in Ottawa, Ontario." />
      </Helmet>

      <div className="page">
        <motion.div
          className="page__header"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="page__eyebrow">Book</span>
          <h1 className="page__title">Secure a Spot</h1>
          <p className="page__sub">Pick your service. Lock it in.</p>
        </motion.div>

        <motion.div
          className="book__policy"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
        >
          <span className="book__policy-label">Booking Policy</span>
          <p>If there are any changes to your appointment, let me know as soon as possible by messaging <a href="https://instagram.com/zo_blendz_" target="_blank" rel="noopener noreferrer">@zo_blendz_</a></p>
        </motion.div>

        <div className="book__services">
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.name}
              className="book__service"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.07, duration: 0.6, ease: EASE }}
            >
              <div className="book__service-info">
                <span className="book__service-name">{s.name}</span>
                <span className="book__service-meta">{s.duration}</span>
              </div>
              <div className="book__service-right">
                <span className="book__service-price">{s.price}</span>
                <button className="book__service-btn">Book</button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="book__footer-note"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          Payment due in person at the appointment.
        </motion.p>
      </div>
    </>
  )
}
