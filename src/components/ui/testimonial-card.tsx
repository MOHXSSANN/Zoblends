import * as React from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// ── Types ──
export interface Stat {
  value: string
  label: string
}

export interface Testimonial {
  name: string
  title: string
  quote?: string
  avatarSrc: string
  rating: number
}

export interface ClientsSectionProps {
  tagLabel: string
  title: string
  description: string
  stats: Stat[]
  testimonials: Testimonial[]
  primaryActionLabel: string
  secondaryActionLabel: string
  primaryActionHref?: string
  secondaryActionHref?: string
  className?: string
}

// ── StatCard ──
const StatCard = ({ value, label }: Stat) => (
  <Card className="text-center rounded-xl border-[rgba(212,175,55,0.15)] bg-[rgba(255,255,255,0.02)]">
    <CardContent className="p-4">
      <p className="text-3xl font-bold text-[#d4af37]">{value}</p>
      <p className="text-xs text-[rgba(245,244,240,0.4)] mt-1 uppercase tracking-wider">{label}</p>
    </CardContent>
  </Card>
)

// ── StickyTestimonialCard ──
const StickyTestimonialCard = ({ testimonial, index }: { testimonial: Testimonial; index: number }) => (
  <motion.div
    className="sticky w-full"
    style={{ top: `${80 + index * 28}px` }}
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.55, ease: [0.165, 0.84, 0.44, 1], delay: index * 0.08 }}
  >
    <div className={cn(
      'p-6 rounded-2xl flex flex-col h-auto w-full',
      'bg-[rgba(15,14,12,0.92)] border border-[rgba(212,175,55,0.15)]',
      'backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
    )}>
      {/* Avatar + Author */}
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-xl bg-cover bg-center flex-shrink-0 border border-[rgba(212,175,55,0.2)]"
          style={{ backgroundImage: `url(${testimonial.avatarSrc})` }}
          aria-label={`Photo of ${testimonial.name}`}
        />
        <div>
          <p className="font-semibold text-base text-[rgba(245,244,240,0.95)] tracking-wide">
            {testimonial.name}
          </p>
          <p className="text-xs text-[rgba(212,175,55,0.6)] uppercase tracking-widest mt-0.5">
            {testimonial.title}
          </p>
        </div>
      </div>

      {/* Stars */}
      <div className="flex items-center gap-2 my-4">
        <span className="font-bold text-sm text-[rgba(245,244,240,0.7)]">
          {testimonial.rating.toFixed(1)}
        </span>
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-4 w-4',
                i < Math.floor(testimonial.rating)
                  ? 'text-[#d4af37] fill-[#d4af37]'
                  : 'text-[rgba(212,175,55,0.15)]'
              )}
            />
          ))}
        </div>
      </div>

      {/* Quote */}
      {testimonial.quote && (
        <p className="text-sm text-[rgba(245,244,240,0.55)] leading-relaxed">
          &ldquo;{testimonial.quote}&rdquo;
        </p>
      )}
    </div>
  </motion.div>
)

// ── Main Export ──
export const ClientsSection = ({
  tagLabel,
  title,
  description,
  stats,
  testimonials,
  primaryActionLabel,
  secondaryActionLabel,
  primaryActionHref = '/book',
  secondaryActionHref,
  className,
}: ClientsSectionProps) => {
  const scrollContainerHeight = `calc(100vh + ${testimonials.length * 120}px)`

  return (
    <section className={cn('w-full py-20 md:py-28', className)}>
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start px-6">

        {/* Left: sticky copy */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-24">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.05)] px-3 py-1 text-xs">
            <div className="h-2 w-2 rounded-full bg-[#d4af37]" />
            <span className="text-[rgba(245,244,240,0.5)] uppercase tracking-widest">{tagLabel}</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[rgba(245,244,240,0.95)]">
            {title}
          </h2>

          <p className="text-base text-[rgba(245,244,240,0.45)] leading-relaxed">
            {description}
          </p>

          <div className="grid grid-cols-3 gap-4 mt-2">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="flex items-center gap-4 mt-4">
            <Button variant="outline" size="lg" className="rounded-full" asChild>
              <a href={secondaryActionHref}>{secondaryActionLabel}</a>
            </Button>
            <Button size="lg" className="rounded-full" asChild>
              <a href={primaryActionHref}>{primaryActionLabel}</a>
            </Button>
          </div>
        </div>

        {/* Right: stacking cards */}
        <div className="relative flex flex-col gap-4" style={{ height: scrollContainerHeight }}>
          {testimonials.map((testimonial, index) => (
            <StickyTestimonialCard
              key={testimonial.name}
              index={index}
              testimonial={testimonial}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
