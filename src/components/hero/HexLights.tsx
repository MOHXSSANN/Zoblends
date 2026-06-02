import { motion } from 'framer-motion'
import './HexLights.css'

// ─── Geometry ────────────────────────────────────────
const R        = 52                          // circumradius (px)
const H_STEP   = R * 1.5                     // col-to-col center distance
const V_STEP   = R * Math.sqrt(3)            // row-to-row center distance
const ODD_OFF  = (R * Math.sqrt(3)) / 2     // odd-col vertical offset

// ─── Cluster layout — matches the reference photo ────
// [col, row] — diagonal band from bottom-left to top-right
const CLUSTER: [number, number][] = [
  [2, 0], [3, 0],
  [1, 1], [2, 1], [3, 1], [4, 1],
  [0, 2], [1, 2], [2, 2],
  [0, 3], [1, 3],
]

function hexCenter(col: number, row: number): [number, number] {
  const cx = col * H_STEP + R
  const cy = row * V_STEP + R + (col % 2 === 1 ? ODD_OFF : 0)
  return [cx, cy]
}

// Flat-top hexagon polygon points string
function hexPoints(cx: number, cy: number): string {
  const pts: string[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i) // 0° = right (flat-top)
    pts.push(`${(cx + R * Math.cos(angle)).toFixed(2)},${(cy + R * Math.sin(angle)).toFixed(2)}`)
  }
  return pts.join(' ')
}

// Compute SVG viewBox from cluster
const centers = CLUSTER.map(([c, r]) => hexCenter(c, r))
const xs = centers.map(([x]) => x)
const ys = centers.map(([, y]) => y)
const PAD = R + 20
const minX = Math.min(...xs) - PAD
const minY = Math.min(...ys) - PAD
const maxX = Math.max(...xs) + PAD
const maxY = Math.max(...ys) + PAD
const VB = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`

// Power-on flash animation — each hex flashes then settles
const powerOn = {
  initial: { opacity: 0 },
  animate: {
    opacity: [0, 0, 1.0, 0.45, 0.95, 0.65, 1.0],
  },
}

export default function HexLights() {
  return (
    <div className="hex-lights" aria-hidden="true">
      <svg
        className="hex-lights__svg"
        viewBox={VB}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* LED strip light glow filter */}
          <filter id="led-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Tighter inner glow for the hex edge itself */}
          <filter id="led-edge" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {CLUSTER.map(([col, row], i) => {
          const [cx, cy] = hexCenter(col, row)
          const pts = hexPoints(cx, cy)
          // Delay cascades from top-right to bottom-left (matches image orientation)
          const delay = 0.2 + i * 0.14 + Math.random() * 0.06

          return (
            <motion.g
              key={`${col}-${row}`}
              variants={powerOn}
              initial="initial"
              animate="animate"
              transition={{
                delay,
                duration: 0.9,
                times: [0, 0.45, 0.52, 0.62, 0.70, 0.84, 1],
                ease: 'linear',
              }}
            >
              {/* Outer bloom glow */}
              <polygon
                points={pts}
                fill="none"
                stroke="rgba(255, 252, 245, 0.55)"
                strokeWidth="6"
                filter="url(#led-glow)"
              />
              {/* Crisp inner edge — the actual LED strip line */}
              <polygon
                points={pts}
                fill="none"
                stroke="rgba(255, 255, 255, 0.92)"
                strokeWidth="2"
                filter="url(#led-edge)"
              />
            </motion.g>
          )
        })}
      </svg>
    </div>
  )
}
