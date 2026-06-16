import { type ComponentPropsWithoutRef, useMemo, useRef } from 'react'

interface MarqueeProps extends ComponentPropsWithoutRef<'div'> {
  reverse?: boolean
  pauseOnHover?: boolean
  children: React.ReactNode
  vertical?: boolean
  repeat?: number
}

export function Marquee({
  className = '',
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  style,
  ...props
}: MarqueeProps) {
  const ref = useRef<HTMLDivElement>(null)

  const tracks = useMemo(
    () =>
      Array.from({ length: repeat }, (_, i) => (
        <div
          key={i}
          className={[
            'marquee__track',
            vertical ? 'marquee__track--vertical' : 'marquee__track--horizontal',
            reverse ? 'marquee__track--reverse' : '',
            pauseOnHover ? 'marquee__track--pause-hover' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {children}
        </div>
      )),
    [repeat, children, vertical, pauseOnHover, reverse]
  )

  return (
    <div
      ref={ref}
      className={`marquee ${vertical ? 'marquee--vertical' : 'marquee--horizontal'} ${className}`}
      style={style}
      role="marquee"
      {...props}
    >
      {tracks}
    </div>
  )
}
