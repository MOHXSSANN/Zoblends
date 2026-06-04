import { useRef, useState, useEffect } from 'react'
import { useScroll, useMotionValueEvent, AnimatePresence, motion } from 'framer-motion'
import './ShopScroll.css'

const SLIDES = [
  { img: '/zo3d/1.png', count: 11237, prefix: '',  suffix: '',  label: 'Total Cuts',            sub: 'and counting',         live: true  },
  { img: '/zo3d/2.png', count: 4,     prefix: '',  suffix: '+', label: 'Years Behind the Chair', sub: 'Ottawa sharpest',      live: false },
  { img: '/zo3d/3.png', count: 50,    prefix: '',  suffix: '+', label: 'Five-Star Reviews',      sub: 'hear it from them',    live: false },
  { img: '/zo3d/4.png', count: 500,   prefix: '',  suffix: '+', label: 'Happy Clients',          sub: 'and growing',          live: false },
  { img: '/zo3d/5.png', count: 5,     prefix: '',  suffix: '★', label: 'Average Rating',         sub: 'across all platforms', live: false },
  { img: '/zo3d/6.png', count: 7,     prefix: '',  suffix: '',  label: 'Days a Week',            sub: 'open every day',       live: false },
  { img: '/zo3d/7.png', count: 1,     prefix: '#', suffix: '',  label: 'Barber in Ottawa',       sub: 'no debate',            live: false },
]

const TOTAL = SLIDES.length
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

function useCountUp(target: number, active: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) { setCount(0); return }
    const duration = target === 1 ? 80 : target > 100 ? 2800 : target > 10 ? 1800 : 1200
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [active, target])
  return count
}

function StatDisplay({ slide, active }: { slide: typeof SLIDES[0]; active: boolean }) {
  const count = useCountUp(slide.count, active)
  return (
    <>
      <div className="shop-scroll__stat-number">
        {slide.prefix}{count.toLocaleString()}{slide.suffix}
        {slide.live && active && <span className="shop-scroll__live-dot" />}
      </div>
      <div className="shop-scroll__stat-info">
        <span className="shop-scroll__stat-label">{slide.label}</span>
        <span className="shop-scroll__stat-sub">{slide.sub}</span>
      </div>
    </>
  )
}

export default function ShopScroll() {
  const containerRef = useRef<HTMLDivElement>(null)
  const stickyRef    = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (isMobile) return
    const idx = Math.min(Math.floor(v * TOTAL), TOTAL - 1)
    setCurrent(idx)
  })

  // Non-passive touch handlers so we can preventDefault on horizontal swipes
  useEffect(() => {
    const el = stickyRef.current
    if (!el) return

    const onStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
    }
    const onMove = (e: TouchEvent) => {
      const dx = Math.abs(e.touches[0].clientX - touchStartX.current)
      const dy = Math.abs(e.touches[0].clientY - touchStartY.current)
      if (dx > dy && dx > 8) e.preventDefault() // horizontal — block page scroll
    }
    const onEnd = (e: TouchEvent) => {
      const delta = touchStartX.current - e.changedTouches[0].clientX
      if (Math.abs(delta) < 40) return
      if (delta > 0) setCurrent(c => Math.min(c + 1, TOTAL - 1))
      else           setCurrent(c => Math.max(c - 1, 0))
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove',  onMove,  { passive: false })
    el.addEventListener('touchend',   onEnd,   { passive: true })
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove',  onMove)
      el.removeEventListener('touchend',   onEnd)
    }
  }, [])

  return (
    <div className="shop-scroll" ref={containerRef}>
      <div className="shop-scroll__sticky" ref={stickyRef}>

        {/* Images */}
        <div className="shop-scroll__images">
          {SLIDES.map(({ img }, i) => (
            <div
              key={img}
              className={`shop-scroll__image${i === current ? ' shop-scroll__image--active' : ''}`}
            >
              <img src={img} alt="" draggable={false} />
            </div>
          ))}
        </div>

        {/* Stat bar */}
        <div className="shop-scroll__stat-wrap">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              className="shop-scroll__stat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <StatDisplay slide={SLIDES[current]} active={true} />
            </motion.div>
          </AnimatePresence>

          {/* Dots + swipe hint + arrow */}
          <div className="shop-scroll__bottom">
            <div className="shop-scroll__dots">
              {SLIDES.map((_, i) => (
                <div
                  key={i}
                  className={`shop-scroll__dot${i === current ? ' shop-scroll__dot--active' : ''}`}
                />
              ))}
            </div>
            <span className="shop-scroll__swipe-hint">← swipe →</span>
            <div className="shop-scroll__arrow">
              <svg viewBox="0 0 24 24">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
