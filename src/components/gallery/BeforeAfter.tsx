import { useRef, useState } from 'react'
import './BeforeAfter.css'

interface Props {
  before: string
  after: string
  label?: string
}

export default function BeforeAfter({ before, after, label }: Props) {
  const [pos, setPos]       = useState(50)
  const [goingRight, setGoingRight] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging     = useRef(false)
  const lastClientX  = useRef<number>(0)
  const rafId        = useRef<number | null>(null)

  function getPercent(clientX: number) {
    if (!containerRef.current) return 50
    const rect = containerRef.current.getBoundingClientRect()
    return Math.min(95, Math.max(5, ((clientX - rect.left) / rect.width) * 100))
  }

  function move(clientX: number) {
    if (rafId.current) return // throttle to one update per frame
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null
      const delta = clientX - lastClientX.current
      if (Math.abs(delta) > 2) {
        setGoingRight(delta > 0)
        lastClientX.current = clientX
      }
      setPos(getPercent(clientX))
    })
  }

  return (
    <div
      className="ba"
      ref={containerRef}
      onMouseMove={(e) => { if (dragging.current) move(e.clientX) }}
      onMouseUp={() => { dragging.current = false }}
      onMouseLeave={() => { dragging.current = false }}
      onTouchStart={(e) => { dragging.current = true; lastClientX.current = e.touches[0].clientX }}
      onTouchMove={(e) => { if (dragging.current) { e.preventDefault(); move(e.touches[0].clientX) } }}
      onTouchEnd={() => { dragging.current = false }}
    >
      <img className="ba__img--after" src={after} alt="After" draggable={false} />

      <div className="ba__before-wrap" style={{ width: `${pos}%` }}>
        <img className="ba__img--before" src={before} alt="Before" draggable={false} />
      </div>

      <div className="ba__divider" style={{ left: `${pos}%` }} />

      <div
        className="ba__handle"
        style={{
          left: `${pos}%`,
          '--scissors-scale': Math.max(0.35, pos / 50),
        } as React.CSSProperties}
        onMouseDown={(e) => { e.preventDefault(); dragging.current = true; lastClientX.current = e.clientX }}
        onTouchStart={(e) => { dragging.current = true; lastClientX.current = e.touches[0].clientX }}
        onTouchMove={(e) => { if (dragging.current) { e.preventDefault(); move(e.touches[0].clientX) } }}
      >
        <img
          className="ba__scissors-img"
          src={goingRight ? '/8.png' : '/9.png'}
          alt="scissors"
          draggable={false}
        />
      </div>

      {/* Preload both scissors so direction swap has no flash */}
      <img src="/8.png" style={{ display: 'none' }} alt="" aria-hidden />
      <img src="/9.png" style={{ display: 'none' }} alt="" aria-hidden />

      <span className="ba__tag ba__tag--before">BEFORE</span>
      <span className="ba__tag ba__tag--after">AFTER</span>

      {label && <span className="ba__label">{label}</span>}
    </div>
  )
}
