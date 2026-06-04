import { useRef, useState } from 'react'
import './BeforeAfter.css'

interface Props {
  before: string
  after: string
  label?: string
}

export default function BeforeAfter({ before, after, label }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const beforeRef     = useRef<HTMLDivElement>(null)
  const dividerRef    = useRef<HTMLDivElement>(null)
  const handleRef     = useRef<HTMLDivElement>(null)
  const dragging      = useRef(false)
  const lastClientX   = useRef(0)
  const rafId         = useRef<number | null>(null)
  const [goingRight, setGoingRight] = useState(true)

  function getPercent(clientX: number) {
    if (!containerRef.current) return 50
    const rect = containerRef.current.getBoundingClientRect()
    return Math.min(95, Math.max(5, ((clientX - rect.left) / rect.width) * 100))
  }

  function move(clientX: number) {
    if (rafId.current) return
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null
      const pos = getPercent(clientX)
      // Direct DOM — zero React re-renders during drag
      if (beforeRef.current)  beforeRef.current.style.width   = `${pos}%`
      if (dividerRef.current) dividerRef.current.style.left   = `${pos}%`
      if (handleRef.current)  handleRef.current.style.left    = `${pos}%`
      const delta = clientX - lastClientX.current
      if (Math.abs(delta) > 3) {
        setGoingRight(delta > 0)
        lastClientX.current = clientX
      }
    })
  }

  return (
    <div
      className="ba"
      ref={containerRef}
      onMouseMove={e  => { if (dragging.current) move(e.clientX) }}
      onMouseUp={()   => { dragging.current = false }}
      onMouseLeave={() => { dragging.current = false }}
      onTouchStart={e  => { dragging.current = true; lastClientX.current = e.touches[0].clientX }}
      onTouchMove={e   => { if (dragging.current) { e.preventDefault(); move(e.touches[0].clientX) } }}
      onTouchEnd={() => { dragging.current = false }}
    >
      <img className="ba__img--after" src={after} alt="After" draggable={false} />

      <div className="ba__before-wrap" ref={beforeRef} style={{ width: '50%' }}>
        <img className="ba__img--before" src={before} alt="Before" draggable={false} />
      </div>

      <div className="ba__divider" ref={dividerRef} style={{ left: '50%' }} />

      <div
        className="ba__handle"
        ref={handleRef}
        style={{ left: '50%' }}
        onMouseDown={e  => { e.preventDefault(); dragging.current = true; lastClientX.current = e.clientX }}
        onTouchStart={e => { dragging.current = true; lastClientX.current = e.touches[0].clientX }}
        onTouchMove={e  => { if (dragging.current) { e.preventDefault(); move(e.touches[0].clientX) } }}
      >
        <img
          className="ba__scissors-img"
          src={goingRight ? '/8.png' : '/9.png'}
          alt="scissors"
          draggable={false}
        />
      </div>

      <img src="/8.png" style={{ display: 'none' }} alt="" aria-hidden />
      <img src="/9.png" style={{ display: 'none' }} alt="" aria-hidden />

      <span className="ba__tag ba__tag--before">BEFORE</span>
      <span className="ba__tag ba__tag--after">AFTER</span>

      {label && <span className="ba__label">{label}</span>}
    </div>
  )
}
