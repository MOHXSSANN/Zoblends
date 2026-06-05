import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './ZoMap.css'

export default function ZoMap() {
  const mapRef    = useRef<HTMLVideoElement>(null)
  const garageRef = useRef<HTMLVideoElement>(null)
  const [ended,       setEnded]       = useState(false)
  const [showGarage,  setShowGarage]  = useState(false)

  function openGarage() {
    setShowGarage(true)
    setTimeout(() => { garageRef.current?.play() }, 50)
  }

  return (
    <div className="zo-map">
      {/* Map animation */}
      <video
        ref={mapRef}
        className={`zo-map__video${showGarage ? ' zo-map__video--hidden' : ''}`}
        src="https://mhhagaztfurgivlspdss.supabase.co/storage/v1/object/public/videos/zo3d/Zo3dmap.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={() => setEnded(true)}
      />

      {/* Garage video — inline, same container */}
      <AnimatePresence>
        {showGarage && (
          <motion.video
            ref={garageRef}
            className="zo-map__video zo-map__garage-inline"
            src="/zoview.mp4"
            playsInline
            muted
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>

      {/* End overlay — button to view garage */}
      <AnimatePresence>
        {ended && !showGarage && (
          <motion.div
            className="zo-map__end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            <motion.button
              className="zo-map__garage-btn"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              onClick={openGarage}
            >
              Click to view the garage
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
