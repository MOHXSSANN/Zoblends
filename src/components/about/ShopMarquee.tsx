import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import './ShopMarquee.css'

const IMAGES = [
  '/Zopicsd/3Dpix/160256eb-a1d2-4d41-86cb-6effe079da25.png',
  '/Zopicsd/3Dpix/2c3ed6d4-821a-45a8-9151-cd281e6d41fb.png',
  '/Zopicsd/3Dpix/2d7d27a2-b92d-42a7-bd2b-04c76bc8fce0.png',
  '/Zopicsd/3Dpix/35f02c15-3b2c-4003-8e81-2b337f375a10.png',
  '/Zopicsd/3Dpix/3774cfc0-ea8e-4201-90f5-c6378bd54576.png',
  '/Zopicsd/3Dpix/53a4f7a0-7818-4c4d-847b-44c5b6fb44fe.png',
  '/Zopicsd/3Dpix/6d6b61a6-4060-443d-bb6f-9a495605bd4f.png',
]

const ROW_A = [...IMAGES, ...IMAGES]
const ROW_B = [...IMAGES].reverse().concat([...IMAGES].reverse())

export default function ShopMarquee() {
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const xLeft  = useTransform(scrollYProgress, [0, 1], ['0%',   '-18%'])
  const xRight = useTransform(scrollYProgress, [0, 1], ['-18%', '0%'])

  return (
    <div className="shop-marquee" ref={ref}>
      <motion.div className="shop-marquee__row" style={{ x: xLeft }}>
        {ROW_A.map((src, i) => (
          <div className="shop-marquee__card" key={i}>
            <img src={src} alt="" draggable={false} />
          </div>
        ))}
      </motion.div>

      <motion.div className="shop-marquee__row" style={{ x: xRight }}>
        {ROW_B.map((src, i) => (
          <div className="shop-marquee__card" key={i}>
            <img src={src} alt="" draggable={false} />
          </div>
        ))}
      </motion.div>
    </div>
  )
}
