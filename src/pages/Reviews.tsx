import { Helmet } from 'react-helmet-async'
import { ClientsSection, type Stat, type Testimonial } from '../components/ui/testimonial-card'
import './Reviews.css'

const stats: Stat[] = [
  { value: '5.0', label: 'Avg Rating' },
  { value: '100+', label: 'Happy Clients' },
  { value: '3+', label: 'Years Running' },
]

const testimonials: Testimonial[] = [
  {
    name: 'Khalid M.',
    title: 'Signature Blend',
    quote: "Zo doesn't miss. Walked in with a faded mess and walked out looking like a whole different person. The attention to detail is on another level.",
    avatarSrc: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop',
    rating: 5.0,
  },
  {
    name: 'Tyler B.',
    title: 'Skin Fade',
    quote: "Best barber in Ottawa no debate. Been going for 6 months straight — every single cut is clean. Wouldn't trust anyone else.",
    avatarSrc: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop',
    rating: 5.0,
  },
  {
    name: 'Marcus J.',
    title: 'Shape Up',
    quote: "The vibe, the precision, the conversation — everything is top tier. You can tell Zo actually cares about the craft.",
    avatarSrc: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop',
    rating: 5.0,
  },
  {
    name: 'Aiden W.',
    title: 'Full Cut & Style',
    quote: "First time going and I was genuinely impressed. Booked my next appointment before I even left the chair.",
    avatarSrc: 'https://images.unsplash.com/photo-1530268729831-4b0b9e170218?w=200&auto=format&fit=crop',
    rating: 5.0,
  },
]

export default function Reviews() {
  return (
    <>
      <Helmet>
        <title>Reviews — Zoblends</title>
        <meta name="description" content="Real clients. Real cuts. See what everyone's saying about Zoblends, Ottawa." />
      </Helmet>

      <div className="reviews-page-outer">
        <ClientsSection
          tagLabel="Real Clients"
          title="Hear It From Them"
          description="Ottawa's go-to for clean fades and sharp cuts. Every client walks out a different person."
          stats={stats}
          testimonials={testimonials}
          primaryActionLabel="Book Now"
          secondaryActionLabel="View Services"
          primaryActionHref="/book"
          secondaryActionHref="/services"
        />
      </div>
    </>
  )
}
