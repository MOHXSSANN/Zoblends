import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import './AboutStats.css'

const MOCK_CUTS = 11237

const STATS = [
  { count: 4,   suffix: '+', label: 'Years Cutting'  },
  { count: 50,  suffix: '+', label: '5-Star Reviews' },
  { count: 500, suffix: '+', label: 'Happy Clients'  },
]

function useCountUp(target: number, active: boolean, duration = 1400) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) { setCount(0); return }
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [active, target, duration])
  return count
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

function StatItem({ count, suffix, label, active, delay }: {
  count: number; suffix: string; label: string; active: boolean; delay: number
}) {
  const val = useCountUp(count, active)
  return (
    <motion.div
      className="about-stats__stat"
      initial={{ opacity: 0, y: 16 }}
      animate={active ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.6, ease: EASE }}
    >
      <span className="about-stats__stat-value">{val.toLocaleString()}{suffix}</span>
      <span className="about-stats__stat-label">{label}</span>
    </motion.div>
  )
}

export default function AboutStats() {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: false, margin: '-60px' })
  const cuts   = useCountUp(MOCK_CUTS, inView)

  return (
    <div className="about-stats" ref={ref}>

      <motion.div
        className="about-stats__counter"
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <span className="about-stats__eyebrow">Total Cuts</span>
        <div className="about-stats__number">{cuts.toLocaleString()}</div>
        <div className="about-stats__counter-meta">
          <span className="about-stats__sub">cuts and counting</span>
          <span className="about-stats__live">
            <span className="about-stats__dot" />
            Live
          </span>
        </div>
      </motion.div>

      <div className="about-stats__divider" />

      <div className="about-stats__row">
        {STATS.map((s, i) => (
          <StatItem
            key={s.label}
            count={s.count}
            suffix={s.suffix}
            label={s.label}
            active={inView}
            delay={0.2 + i * 0.12}
          />
        ))}
      </div>

    </div>
  )
}
