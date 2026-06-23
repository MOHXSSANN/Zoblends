import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Quote, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ===== Types =====
export interface iTestimonial {
  name: string
  designation: string
  description: string
  profileImage: string
}

interface iCarouselProps {
  items: React.ReactElement<{
    testimonial: iTestimonial
    index: number
    layout?: boolean
    onCardClose: () => void
  }>[]
  initialScroll?: number
}

// ===== Hook =====
const useOutsideClick = (
  ref: React.RefObject<HTMLDivElement | null>,
  onOutsideClick: () => void
) => {
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return
      onOutsideClick()
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [ref, onOutsideClick])
}

// ===== Carousel =====
export const Carousel = ({ items, initialScroll = 0 }: iCarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const check = () => {
    if (!carouselRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth)
  }

  const isMobile = () => window.innerWidth < 768

  const handleCardClose = (index: number) => {
    if (!carouselRef.current) return
    const w = isMobile() ? 230 : 384
    const gap = isMobile() ? 4 : 8
    carouselRef.current.scrollTo({ left: (w + gap) * (index + 1), behavior: 'smooth' })
  }

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll
      check()
    }
  }, [initialScroll])

  return (
    <div className="relative w-full mt-10">
      <div
        ref={carouselRef}
        className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth [scrollbar-width:none] py-5"
        onScroll={check}
      >
        <div className={cn('flex flex-row justify-start gap-4 pl-3', 'max-w-5xl mx-auto')}>
          {items.map((item, index) => (
            <motion.div
              key={`card-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 * index, ease: 'easeOut' } }}
              className="last:pr-[5%] md:last:pr-[33%] rounded-3xl"
            >
              {React.cloneElement(item, { onCardClose: () => handleCardClose(index) })}
            </motion.div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => carouselRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
          disabled={!canScrollLeft}
          className="relative z-40 h-10 w-10 rounded-full bg-[#4b3f33] flex items-center justify-center disabled:opacity-50 hover:bg-[#4b3f33]/80 transition-colors duration-200"
        >
          <ArrowLeft className="h-6 w-6 text-[#f2f0eb]" />
        </button>
        <button
          onClick={() => carouselRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
          disabled={!canScrollRight}
          className="relative z-40 h-10 w-10 rounded-full bg-[#4b3f33] flex items-center justify-center disabled:opacity-50 hover:bg-[#4b3f33]/80 transition-colors duration-200"
        >
          <ArrowRight className="h-6 w-6 text-[#f2f0eb]" />
        </button>
      </div>
    </div>
  )
}

// ===== TestimonialCard =====
export const TestimonialCard = ({
  testimonial,
  index: _index,
  layout = false,
  onCardClose = () => {},
  backgroundImage = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop',
}: {
  testimonial: iTestimonial
  index: number
  layout?: boolean
  onCardClose?: () => void
  backgroundImage?: string
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleCollapse = () => {
    setIsExpanded(false)
    onCardClose()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleCollapse() }

    if (isExpanded) {
      const y = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${y}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
      document.body.dataset.scrollY = y.toString()
    } else {
      const y = parseInt(document.body.dataset.scrollY || '0', 10)
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior })
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isExpanded])

  useOutsideClick(containerRef, handleCollapse)

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 h-screen overflow-hidden z-50">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-black/60 backdrop-blur-lg h-full w-full fixed inset-0"
            />
            <motion.div
              ref={containerRef}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              layoutId={layout ? `card-${testimonial.name}` : undefined}
              className="max-w-5xl mx-auto bg-gradient-to-b from-[#f2f0eb] to-[#fff9eb] h-full z-[60] p-4 md:p-10 rounded-3xl relative md:mt-10 overflow-y-auto"
            >
              <button
                onClick={handleCollapse}
                className="sticky top-4 h-8 w-8 right-0 ml-auto rounded-full flex items-center justify-center bg-[#4b3f33]"
              >
                <X className="h-6 w-6 text-white absolute" />
              </button>
              <p className="px-0 md:px-20 text-[rgba(31,27,29,0.7)] text-lg font-thin underline underline-offset-8 mt-4">
                {testimonial.designation}
              </p>
              <p className="px-0 md:px-20 text-2xl md:text-4xl font-normal italic text-[rgba(31,27,29,0.7)] mt-4 lowercase font-serif">
                {testimonial.name}
              </p>
              <div className="py-8 text-[rgba(31,27,29,0.7)] px-0 md:px-20 text-2xl md:text-3xl lowercase font-thin leading-snug tracking-wide font-serif">
                <Quote className="h-6 w-6 mb-4 text-[rgba(31,27,29,0.5)]" />
                {testimonial.description}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.button
        layoutId={layout ? `card-${testimonial.name}` : undefined}
        onClick={() => setIsExpanded(true)}
        whileHover={{ rotateX: 2, rotateY: 2, rotate: 3, scale: 1.02, transition: { duration: 0.3, ease: 'easeOut' } }}
      >
        <div className="rounded-3xl bg-gradient-to-b from-[#f2f0eb] to-[#fff9eb] h-[500px] md:h-[550px] w-80 md:w-96 overflow-hidden flex flex-col items-center justify-center relative z-10 shadow-md">
          {/* Background texture */}
          <div className="absolute inset-0 opacity-20">
            <img src={backgroundImage} alt="" className="w-full h-full object-cover object-center" />
          </div>

          <ProfileImage src={testimonial.profileImage} alt={testimonial.name} />

          <p className="text-[rgba(31,27,29,0.7)] text-xl md:text-2xl font-normal text-center font-serif mt-4 lowercase px-6 relative z-10">
            {testimonial.description.length > 100
              ? `${testimonial.description.slice(0, 100)}...`
              : testimonial.description}
          </p>
          <p className="text-[rgba(31,27,29,0.7)] text-xl font-thin italic text-center mt-5 lowercase font-serif relative z-10">
            {testimonial.name}.
          </p>
          <p className="text-[rgba(31,27,29,0.7)] text-sm font-thin italic text-center mt-1 lowercase underline underline-offset-8 decoration-1 relative z-10">
            {testimonial.designation}
          </p>
        </div>
      </motion.button>
    </>
  )
}

// ===== ProfileImage =====
interface ProfileImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
}

export const ProfileImage = ({ src, alt, className, ...rest }: ProfileImageProps) => {
  const [isLoading, setLoading] = useState(true)

  return (
    <div className="w-[90px] h-[90px] md:w-[150px] md:h-[150px] opacity-80 overflow-hidden rounded-full border-[3px] border-[rgba(59,59,59,0.6)] flex-none relative z-10" style={{ filter: 'saturate(0.2) sepia(0.46)' }}>
      <img
        src={src}
        alt={alt}
        width={150}
        height={150}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoading(false)}
        className={cn(
          'transition duration-300 absolute inset-0 w-full h-full object-cover',
          isLoading ? 'blur-sm' : 'blur-0',
          className
        )}
        {...rest}
      />
    </div>
  )
}
