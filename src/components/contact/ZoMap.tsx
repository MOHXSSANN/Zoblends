import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './ZoMap.css'

export default function ZoMap() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [ended, setEnded] = useState(false)

  return (
    <div className="zo-map">
      <video
        ref={videoRef}
        className="zo-map__video"
        src="https://mhhagaztfurgivlspdss.supabase.co/storage/v1/object/public/videos/zo3d/Zo3dmap.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={() => setEnded(true)}
      />

      <AnimatePresence>
        {ended && (
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
              onClick={() => {
                // garage video goes here
              }}
            >
              Click to view the garage
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
