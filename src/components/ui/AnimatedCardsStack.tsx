import * as React from 'react'
import {
  type HTMLMotionProps,
  type MotionValue,
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from 'framer-motion'

/* ── Context ── */
interface ScrollCtx { scrollYProgress: MotionValue<number> }
const ScrollContext = React.createContext<ScrollCtx | undefined>(undefined)
function useScrollCtx() {
  const ctx = React.useContext(ScrollContext)
  if (!ctx) throw new Error('Must be inside ContainerScroll')
  return ctx
}

/* ── ContainerScroll ── */
export const ContainerScroll: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children, style, className = '', ...props
}) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start center', 'end end'],
  })
  return (
    <ScrollContext.Provider value={{ scrollYProgress }}>
      <div
        ref={ref}
        className={`acs__container ${className}`}
        style={{ perspective: '1000px', ...style }}
        {...props}
      >
        {children}
      </div>
    </ScrollContext.Provider>
  )
}

/* ── CardsContainer ── */
export const CardsContainer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children, className = '', style, ...props
}) => (
  <div
    className={`acs__cards ${className}`}
    style={{ perspective: '1000px', ...style }}
    {...props}
  >
    {children}
  </div>
)

/* ── CardTransformed ── */
interface CardTransformedProps extends HTMLMotionProps<'div'> {
  arrayLength: number
  index: number
  incrementY?: number
  incrementZ?: number
  incrementRotation?: number
}

export const CardTransformed = React.forwardRef<HTMLDivElement, CardTransformedProps>(
  ({ arrayLength, index, incrementY = 10, incrementZ = 10, incrementRotation, className = '', style, ...props }, ref) => {
    const { scrollYProgress } = useScrollCtx()
    const rotation = incrementRotation ?? (-index + 90)

    const start = index / (arrayLength + 1)
    const end   = (index + 1) / (arrayLength + 1)
    const range      = React.useMemo(() => [start, end], [start, end])
    const rotateRange = [range[0] - 1.5, range[1] / 1.5]

    const y      = useTransform(scrollYProgress, range, ['0%', '-180%'])
    const rotate = useTransform(scrollYProgress, rotateRange, [rotation, 0])
    const transform = useMotionTemplate`translateZ(${index * incrementZ}px) translateY(${y}) rotate(${rotate}deg)`

    const dx    = useTransform(scrollYProgress, rotateRange, [4, 0])
    const dy    = useTransform(scrollYProgress, rotateRange, [4, 12])
    const blur  = useTransform(scrollYProgress, rotateRange, [2, 24])
    const alpha = useTransform(scrollYProgress, rotateRange, [0.15, 0.2])
    const filter = useMotionTemplate`drop-shadow(${dx}px ${dy}px ${blur}px rgba(0,0,0,${alpha}))`

    return (
      <motion.div
        ref={ref}
        layout="position"
        className={`acs__card ${className}`}
        style={{
          top: index * incrementY,
          transform,
          backfaceVisibility: 'hidden',
          zIndex: (arrayLength - index) * incrementZ,
          filter,
          ...style,
        }}
        {...props}
      />
    )
  }
)
CardTransformed.displayName = 'CardTransformed'

/* ── ReviewStars ── */
interface ReviewStarsProps extends React.HTMLAttributes<HTMLDivElement> {
  rating: number
  maxRating?: number
}

export const ReviewStars = React.forwardRef<HTMLDivElement, ReviewStarsProps>(
  ({ rating, maxRating = 5, className = '', ...props }, ref) => {
    const filled   = Math.floor(rating)
    const frac     = rating - filled
    const empty    = maxRating - filled - (frac > 0 ? 1 : 0)
    const starPath = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z"

    return (
      <div ref={ref} className={`acs__stars ${className}`} {...props}>
        {Array.from({ length: filled }).map((_, i) => (
          <svg key={`f${i}`} className="acs__star acs__star--filled" viewBox="0 0 20 20" fill="currentColor">
            <path d={starPath} />
          </svg>
        ))}
        {frac > 0 && (
          <svg className="acs__star" viewBox="0 0 20 20" fill="currentColor">
            <defs>
              <linearGradient id="frac-star">
                <stop offset={`${frac * 100}%`} stopColor="#d4af37" />
                <stop offset={`${frac * 100}%`} stopColor="rgba(212,175,55,0.15)" />
              </linearGradient>
            </defs>
            <path d={starPath} fill="url(#frac-star)" />
          </svg>
        )}
        {Array.from({ length: empty }).map((_, i) => (
          <svg key={`e${i}`} className="acs__star acs__star--empty" viewBox="0 0 20 20" fill="currentColor">
            <path d={starPath} />
          </svg>
        ))}
        <span className="acs__stars-sr">{rating}</span>
      </div>
    )
  }
)
ReviewStars.displayName = 'ReviewStars'
