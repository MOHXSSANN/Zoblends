import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import ZoMap from '../components/contact/ZoMap'
import ContactInfo8bit from '../components/contact/ContactInfo8bit'
import ContactFAQ from '../components/contact/ContactFAQ'
import './Page.css'
import './Contact.css'

const HOURS = [
  { day: 'Sunday',    open: '11 AM', close: '7 PM' },
  { day: 'Monday',    open: '11 AM', close: '7 PM' },
  { day: 'Tuesday',   open: '11 AM', close: '7 PM' },
  { day: 'Wednesday', open: '11 AM', close: '7 PM' },
  { day: 'Thursday',  open: '11 AM', close: '7 PM' },
  { day: 'Friday',    open: '11 AM', close: '8 PM' },
  { day: 'Saturday',  open: '11 AM', close: '8 PM' },
]

const TODAY = new Date().toLocaleDateString('en-US', { weekday: 'long' })
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export default function Contact() {
  return (
    <>
      <Helmet>
        <title>Get in Touch — Zoblends</title>
        <meta name="description" content="Find Zoblends in Ottawa. Hours, location, Instagram and direct contact." />
      </Helmet>

      {/* ── Garage / Map section ── */}
      <section className="contact__garage-section">
        <motion.div
          className="contact__garage-header"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="page__eyebrow">04 — Contact</span>
          <h1 className="page__title">Get in Touch</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <ZoMap />
        </motion.div>

        <motion.div
          className="contact__garage-address"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Nepean, Ottawa
        </motion.div>
      </section>

      {/* ── Bounce arrow ── */}
      <div className="contact__arrow-wrap">
        <motion.div
          className="contact__arrow"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.div>
      </div>

      {/* ── Contact info + FAQ ── */}
      <div className="contact__info-section">
        <ContactInfo8bit />
        <ContactFAQ />
      </div>
    </>
  )
}
