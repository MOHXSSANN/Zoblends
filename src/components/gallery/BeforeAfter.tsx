import { useRef, useState, useCallback } from 'react'
import './BeforeAfter.css'

interface Props {
  before: string
  after: string
  label?: string
}

export default function BeforeAfter({ before, after, label }: Props) {
  const [pos, setPos]       = useState(50)
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const getPercent = useCallback((clientX: number) => {
    const rect = containerRef.current!.getBoundingClientRect()
    return Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return
    setPos(getPercent(e.clientX))
  }, [dragging, getPercent])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setPos(getPercent(e.touches[0].clientX))
  }, [getPercent])

  return (
    <div
      className="ba"
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => setDragging(false)}
    >
      {/* After (full width underneath) */}
      <img className="ba__img ba__img--after" src={after} alt="After" draggable={false} />

      {/* Before (clipped to left of handle) */}
      <div className="ba__before-wrap" style={{ width: `${pos}%` }}>
        <img className="ba__img ba__img--before" src={before} alt="Before" draggable={false} />
      </div>

      {/* Divider line */}
      <div className="ba__divider" style={{ left: `${pos}%` }} />

      {/* Handle */}
      <div
        className="ba__handle"
        style={{ left: `${pos}%` }}
        onMouseDown={() => setDragging(true)}
        onTouchMove={onTouchMove}
        onTouchStart={() => {}}
      >
        <div className="ba__handle-circle">
          <span>‹</span><span>›</span>
        </div>
      </div>

      {/* Labels */}
      <span className="ba__tag ba__tag--before">BEFORE</span>
      <span className="ba__tag ba__tag--after">AFTER</span>

      {label && <span className="ba__label">{label}</span>}
    </div>
  )
}
