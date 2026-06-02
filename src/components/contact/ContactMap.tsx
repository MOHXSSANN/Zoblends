import { useRef, useState } from 'react'
// @ts-ignore
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { APIProvider, Map3D } from '@vis.gl/react-google-maps'
import { motion, AnimatePresence } from 'framer-motion'
import './ContactMap.css'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const SHOP = { lat: 45.2653, lng: -75.7418 }
const OTTAWA_COORDS: [number, number] = [-75.7418, 45.2653]

const START_CAMERA = {
  center: { lat: 48, lng: -90, altitude: 3_800_000 },
  range:  3_800_000,
  tilt:   18,
  heading: 0,
}

export default function ContactMap() {
  const map3dRef  = useRef<React.ElementRef<typeof Map3D>>(null)
  const [mode, setMode]       = useState<'svg' | '3d'>('svg')
  const [loading, setLoading] = useState(false)

  const flyIn = () => {
    setMode('3d')
    setLoading(true)
    setTimeout(() => {
      map3dRef.current?.flyCameraTo({
        endCamera: {
          center:  { ...SHOP, altitude: 160 },
          range:   300,
          tilt:    68,
          heading: 20,
        },
        durationMillis: 6000,
      })
      setTimeout(() => setLoading(false), 6200)
    }, 800)
  }

  return (
    <div className="contact-map">
      <div className="contact-map__label-row">
        <span className="contact-map__eyebrow">Location</span>
        <span className="contact-map__city">Nepean, Ottawa</span>
      </div>

      <div className="contact-map__wrap">

        {/* ── Pixel gold world map ── */}
        <AnimatePresence>
          {mode === 'svg' && (
            <motion.div
              className="contact-map__svg-layer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                  <pattern id="gold-px" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
                    <rect x="0.5" y="0.5" width="4" height="4" fill="#d4af37" />
                  </pattern>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="1.5" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
              </svg>

              <ComposableMap
                projectionConfig={{ scale: 147, center: [0, 20] }}
                style={{ width: '100%', height: '100%', background: '#080706' }}
              >
                <Geographies geography={GEO_URL}>
                  {({ geographies }: { geographies: any[] }) =>
                    geographies.map((geo: any) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="url(#gold-px)"
                        stroke="#080706"
                        strokeWidth={0.6}
                        style={{
                          default: { outline: 'none', filter: 'drop-shadow(0 0 3px rgba(212,175,55,0.4))' },
                          hover:   { outline: 'none' },
                          pressed: { outline: 'none' },
                        }}
                      />
                    ))
                  }
                </Geographies>

                {/* Ottawa pin */}
                <Marker coordinates={OTTAWA_COORDS}>
                  <circle r={10} fill="none" stroke="#d4af37" strokeWidth={1} opacity={0}>
                    <animate attributeName="r"       values="5;20;5"     dur="2.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0;0.8"  dur="2.4s" repeatCount="indefinite" />
                  </circle>
                  <circle r={10} fill="none" stroke="#d4af37" strokeWidth={1} opacity={0}>
                    <animate attributeName="r"       values="5;20;5"     dur="2.4s" begin="1.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0;0.8"  dur="2.4s" begin="1.2s" repeatCount="indefinite" />
                  </circle>
                  <circle r={5}  fill="#d4af37" style={{ filter: 'drop-shadow(0 0 6px #d4af37)' }} />
                  <circle r={2}  fill="#080706" />
                  <text
                    y={-12}
                    textAnchor="middle"
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 7,
                      fontWeight: 700,
                      fill: 'rgba(212,175,55,0.9)',
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                    }}
                  >
                    Ottawa
                  </text>
                </Marker>
              </ComposableMap>

              <motion.div
                className="contact-map__tap-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.6 }}
                onClick={flyIn}
              >
                📍 Tap to fly to the shop
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Google Maps 3D ── */}
        <AnimatePresence>
          {mode === '3d' && (
            <motion.div
              className="contact-map__3d-layer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <APIProvider apiKey={API_KEY} libraries={['maps3d']}>
                <Map3D
                  ref={map3dRef}
                  mode="SATELLITE"
                  defaultCenter={START_CAMERA.center}
                  defaultRange={START_CAMERA.range}
                  defaultTilt={START_CAMERA.tilt}
                  defaultHeading={START_CAMERA.heading}
                  style={{ width: '100%', height: '100%' }}
                />
              </APIProvider>

              {loading && (
                <div className="contact-map__flying">Flying to the shop...</div>
              )}

              <button className="contact-map__reset" onClick={() => setMode('svg')}>
                ↩ Back to map
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <div className="contact-map__address">
        340 Claridge Dr, Nepean, ON K2J 5C2
      </div>
    </div>
  )
}
