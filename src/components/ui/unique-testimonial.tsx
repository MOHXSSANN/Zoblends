import { useState } from 'react'
import { cn } from '@/lib/utils'

const testimonials = [
  {
    id: 1,
    quote: "Zo doesn't miss. Walked in with a faded mess and walked out looking like a whole different person.",
    author: 'Khalid M.',
    role: 'Signature Blend',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop',
  },
  {
    id: 2,
    quote: "Best barber in Ottawa, no debate. Six months straight and every cut has been clean.",
    author: 'Tyler B.',
    role: 'Skin Fade',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop',
  },
  {
    id: 3,
    quote: "The vibe, the precision, the conversation. Everything is top tier. You can tell Zo cares.",
    author: 'Marcus J.',
    role: 'Shape Up',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop',
  },
  {
    id: 4,
    quote: "First time going and I was genuinely impressed. Booked my next appointment before I left the chair.",
    author: 'Aiden W.',
    role: 'Full Cut & Style',
    avatar: 'https://images.unsplash.com/photo-1530268729831-4b0b9e170218?w=200&auto=format&fit=crop',
  },
]

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [displayedQuote, setDisplayedQuote] = useState(testimonials[0].quote)
  const [displayedRole, setDisplayedRole] = useState(testimonials[0].role)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const handleSelect = (index: number) => {
    if (index === activeIndex || isAnimating) return
    setIsAnimating(true)
    setTimeout(() => {
      setDisplayedQuote(testimonials[index].quote)
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
          {displayedQuote}
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 mt-2">
        {/* Role */}
        <p
          className={cn(
            'text-xs text-[rgba(212,175,55,0.55)] tracking-[0.2em] uppercase',
            'transition-all duration-500 ease-out',
            isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0',
          )}
        >
          {displayedRole}
        </p>

        {/* Avatar switcher */}
        <div className="flex items-center justify-center gap-2">
          {testimonials.map((t, index) => {
            const isActive = activeIndex === index
            const isHovered = hoveredIndex === index && !isActive
            const showName = isActive || isHovered

            return (
              <button
                key={t.id}
                onClick={() => handleSelect(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  'relative flex items-center rounded-full cursor-pointer',
                  'transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
                  isActive
                    ? 'bg-[#d4af37] shadow-[0_0_16px_rgba(212,175,55,0.25)]'
                    : 'bg-transparent hover:bg-[rgba(212,175,55,0.08)]',
                  showName ? 'pr-4 pl-2 py-2' : 'p-0.5',
                )}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={t.avatar}
                    alt={t.author}
                    className={cn(
                      'w-8 h-8 rounded-full object-cover',
                      'transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
                      isActive ? 'ring-2 ring-[rgba(10,9,8,0.3)]' : 'ring-0',
                      !isActive && 'hover:scale-105',
                    )}
                  />
                </div>

                <div
                  className={cn(
                    'grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
                    showName ? 'grid-cols-[1fr] opacity-100 ml-2' : 'grid-cols-[0fr] opacity-0 ml-0',
                  )}
                >
                  <div className="overflow-hidden">
                    <span
                      className={cn(
                        'text-sm font-medium whitespace-nowrap block transition-colors duration-300',
                        isActive ? 'text-[#0a0908]' : 'text-[rgba(245,244,240,0.85)]',
                      )}
                    >
                      {t.author}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
