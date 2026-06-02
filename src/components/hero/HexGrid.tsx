import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import './HexGrid.css'

// ─── Grid constants ─────────────────────────────────
const HEX_W   = 50          // element width  (px)
const HEX_H   = 58          // element height (px) — keeps ~correct aspect
const H_STEP  = 52          // center-to-center horizontal (2px gap)
const V_STEP  = 44          // center-to-center vertical   (2px gap)
const COLS    = 28
const ROWS    = 8
const CENTER  = (COLS - 1) / 2

interface HexDatum {
  id: string
  col: number
  row: number
  x: number
  y: number
  delay: number
  intensity: number  // 0–1, final brightness
}

// Precompute once — stable across renders
const HEX_DATA: HexDatum[] = (() => {
  const data: HexDatum[] = []
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const x = col * H_STEP
      const y = row * V_STEP + (col % 2 === 1 ? V_STEP / 2 : 0)
      const dist = Math.abs(col - CENTER)

      // Stage-light cone: gets wider as rows increase downward
      const coneHalf = 0.8 + (row / ROWS) * 3.5
      const inCone   = dist < coneHalf

      // Intensity: bright cone, dim outer fringe, random scatter
      let base: number
      if (inCone) {
        base = 0.55 + (1 - dist / (coneHalf + 1)) * 0.45
      } else {
        base = Math.max(0.04, 0.3 - (dist - coneHalf) * 0.12)
      }
      // salt-and-pepper flicker variation
      const jitter = (Math.random() - 0.5) * 0.18
      const intensity = Math.min(1, Math.max(0.04, base + jitter))

      // Power-on delay: center-top first, ripples outward + downward
      const delay = 0.35 + row * 0.055 + dist * 0.038 + Math.random() * 0.07

      data.push({ id: `h${col}-${row}`, col, row, x, y, delay, intensity })
    }
  }
  return data
})()

const GRID_W = (COLS - 1) * H_STEP + HEX_W
const GRID_H = (ROWS - 1) * V_STEP + HEX_H + V_STEP / 2 /* odd-col offset */

export default function HexGrid() {
  const [powered, setPowered] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => setPowered(true), 100)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  return (
    <div
      className="hex-grid"
      style={{ width: GRID_W, height: GRID_H }}
      aria-hidden="true"
    >
      {HEX_DATA.map((h) => (
        <HexCell key={h.id} datum={h} powered={powered} />
      ))}

      {/* spotlight beam — gradient that bleeds down below the grid */}
      <div className="hex-grid__beam" />
    </div>
  )
}

// ─── Single hex cell ─────────────────────────────────
interface HexCellProps {
  datum: HexDatum
  powered: boolean
}

function HexCell({ datum, powered }: HexCellProps) {
  const { x, y, delay, intensity } = datum

  // Compute glow params from intensity
  const alpha1 = (0.5 + intensity * 0.5).toFixed(2)
  const alpha2 = (intensity * 0.3).toFixed(2)
  const alpha3 = (intensity * 0.12).toFixed(2)
  const blur1  = Math.round(6 + intensity * 10)
  const blur2  = Math.round(16 + intensity * 24)
  const blur3  = Math.round(32 + intensity * 40)

  const glowFilter = powered
    ? `drop-shadow(0 0 ${blur1}px rgba(212,175,55,${alpha1})) drop-shadow(0 0 ${blur2}px rgba(212,175,55,${alpha2})) drop-shadow(0 0 ${blur3}px rgba(212,175,55,${alpha3}))`
    : 'none'

  const fillColor = powered
    ? `rgba(212, 175, 55, ${(intensity * 0.18).toFixed(2)})`
    : 'rgba(255,255,255,0.025)'

  const borderColor = powered
    ? `rgba(212, 175, 55, ${(0.15 + intensity * 0.55).toFixed(2)})`
    : 'rgba(255,255,255,0.055)'

  // Brighter spots pulse slightly
  const isHot = intensity > 0.82

  return (
    <motion.div
      className={`hex-cell${isHot ? ' hex-cell--hot' : ''}`}
      style={{
        left: x,
        top: y,
        width: HEX_W,
        height: HEX_H,
      }}
      animate={powered ? { filter: glowFilter } : { filter: 'none' }}
      transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
    >
      <motion.div
        className="hex-cell__shape"
        animate={powered
          ? { background: fillColor, borderColor }
          : { background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.055)' }
        }
        transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      />
      {isHot && powered && (
        <motion.div
          className="hex-cell__core"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0.4, 0.7, 0.5] }}
          transition={{
            delay: delay + 0.3,
            duration: 3,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  )
}
