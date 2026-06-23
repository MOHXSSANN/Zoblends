import { useState } from 'react'
import { cn } from '@/lib/utils'

const testimonials = [
  {
    id: 1,
    quote: "Zo doesn't miss. Walked in with a faded mess and walked out looking like a whole different person.",
    author: 'Khalid M.',
    role: 'Signature Blend',
  },
  {
    id: 2,
    quote: "Best barber in Ottawa, no debate. Six months straight and every cut has been clean.",
    author: 'Tyler B.',
    role: 'Skin Fade',
  },
  {
    id: 3,
    quote: "The vibe, the precision, the conversation. Everything is top tier. You can tell Zo cares.",
    author: 'Marcus J.',
    role: 'Shape Up',
  },
  {
    id: 4,
    quote: "First time going and I was genuinely impressed. Booked my next appointment before I left the chair.",
    author: 'Aiden W.',
    role: 'Full Cut & Style',
  },
  {
    id: 5,
    quote: "I've been to a lot of barbers and none of them move like Zo. Attention to detail is unreal.",
    author: 'Devin R.',
    role: 'Taper Fade',
  },
  {
    id: 6,
    quote: "Came in for a last-minute appointment and still left looking fresh. The man never rushes.",
    author: 'Jordan T.',
    role: 'Line Up',
  },
  {
    id: 7,
    quote: "My son has been going to Zo for a year now. Every single cut is perfect. Won't go anywhere else.",
    author: 'Hassan A.',
    role: 'Kids Cut',
  },
  {
    id: 8,
    quote: "The shop is clean, the music is right, and the cut speaks for itself. Solid every time.",
    author: 'Chris O.',
    role: 'Skin Fade',
  },
]

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [displayedQuote, setDisplayedQuote] = useState(testimonials[0].quote)
  const [displayedAuthor, setDisplayedAuthor] = useState(testimonials[0].author)
  const [displayedRole, setDisplayedRole] = useState(testimonials[0].role)

  const handleSelect = (index: number) => {
    if (index === activeIndex || isAnimating) return
    setIsAnimating(true)
    setTimeout(() => {
      setDisplayedQuote(testimonials[index].quote)
      setDisplayedAuthor(testimonials[index].author)
      setDisplayedRole(testimonials[index].role)
      setActiveIndex(index)
      setTimeout(() => setIsAnimating(false), 400)
    }, 200)
  }

  return (
    <div className="flex flex-col items-center gap-10 py-16">
      {/* Quote */}
      <div className="px-4">
        <p
          className={cn(
            'text-2xl md:text-3xl font-light text-[rgba(245,244,240,0.88)] text-center max-w-md leading-relaxed tracking-wide',
            'transition-all duration-[400ms] ease-out',
            isAnimating ? 'opacity-0 blur-sm scale-[0.98]' : 'opacity-100 blur-0 scale-100',
          )}
        >
          &ldquo;{displayedQuote}&rdquo;
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 mt-2">
        {/* Author + Role */}
        <div
          className={cn(
            'flex flex-col items-center gap-1 transition-all duration-500 ease-out',
            isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0',
          )}
        >
          <span className="text-sm text-[rgba(245,244,240,0.7)] font-medium tracking-wide">
            {displayedAuthor}
          </span>
          <span className="text-xs text-[rgba(212,175,55,0.55)] tracking-[0.2em] uppercase">
            {displayedRole}
          </span>
        </div>

        {/* Dot switcher */}
        <div className="flex items-center justify-center gap-3 flex-wrap max-w-xs">
          {testimonials.map((t, index) => {
            const isActive = activeIndex === index
            return (
              <button
                key={t.id}
                onClick={() => handleSelect(index)}
                aria-label={t.author}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300 ease-out',
                  isActive
                    ? 'bg-[#d4af37] scale-125 shadow-[0_0_8px_rgba(212,175,55,0.5)]'
                    : 'bg-[rgba(245,244,240,0.2)] hover:bg-[rgba(245,244,240,0.4)]',
                )}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
