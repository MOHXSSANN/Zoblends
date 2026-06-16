import { useEffect, useRef } from 'react'
import { Star } from 'lucide-react'
import { motion, animate } from 'framer-motion'

interface ReviewSummaryCardProps {
  rating: number
  reviewCount: number
  maxRating?: number
  summaryText: string
}

export function ReviewSummaryCard({
  rating,
  reviewCount,
  maxRating = 5,
  summaryText,
}: ReviewSummaryCardProps) {
  const ratingRef = useRef<HTMLSpanElement>(null)
  const countRef  = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const r = animate(0, rating, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate(v) {
        if (ratingRef.current) ratingRef.current.textContent = v.toFixed(1)
      },
    })
    const c = animate(0, reviewCount, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate(v) {
        if (countRef.current)
          countRef.current.textContent = new Intl.NumberFormat('en-US').format(Math.round(v))
      },
    })
    return () => { r.stop(); c.stop() }
  }, [rating, reviewCount])

  const starVariants = {
    hidden: { opacity: 0, scale: 0.4 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: { delay: 0.3 + i * 0.09, duration: 0.4, ease: [0.165, 0.84, 0.44, 1] as [number,number,number,number] },
    }),
  }

  return (
    <motion.div
      className="rsc"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
      aria-label={`${rating} out of ${maxRating} based on ${reviewCount} reviews`}
    >
      {/* Stars */}
      <div className="rsc__stars">
        {Array.from({ length: maxRating }, (_, i) => (
          <motion.div key={i} custom={i} variants={starVariants} initial="hidden" animate="visible">
            <Star
              className="rsc__star"
              fill={rating >= i + 1 ? '#d4af37' : 'transparent'}
              stroke={rating >= i + 1 ? '#d4af37' : 'rgba(212,175,55,0.2)'}
              strokeWidth={1.5}
            />
          </motion.div>
        ))}
      </div>

      {/* Animated score */}
      <h2 className="rsc__score">
        <span ref={ratingRef}>0.0</span>
        <span className="rsc__count"> (<span ref={countRef}>0</span> Reviews)</span>
      </h2>

      <p className="rsc__summary">{summaryText}</p>
    </motion.div>
  )
}
