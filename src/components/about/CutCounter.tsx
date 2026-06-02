import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import './CutCounter.css'

const MOCK_COUNT = 1247

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])

  return count
}

export default function CutCounter() {
  const ref     = useRef<HTMLDivElement>(null)
  const inView  = useInView(ref, { once: true, margin: '-80px' })
  const count   = useCountUp(inView ? MOCK_COUNT : 0)

  return (
    <div className="cut-counter" ref={ref}>
      <motion.div
        className="cut-counter__inner"
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="cut-counter__eyebrow">Total Cuts</span>
        <div className="cut-counter__number">
          {count.toLocaleString()}
        </div>
        <span className="cut-counter__sub">cuts and counting</span>
        <span className="cut-counter__live">
          <span className="cut-counter__dot" />
          Live
        </span>
      </motion.div>
    </div>
  )
}
