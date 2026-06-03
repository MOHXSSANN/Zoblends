import { useState, useEffect } from 'react'
import MetallicPaint from './MetallicPaint'

function buildTextImage(): Promise<string> {
  return document.fonts.ready.then(() => {
    // Square source — MetallicPaint always renders 800×800.
    // Text is centered vertically so we can crop the canvas down to just the text band via CSS.
    const SIZE = 640
    const canvas = document.createElement('canvas')
    canvas.width  = SIZE
    canvas.height = SIZE
    const ctx = canvas.getContext('2d')!

    // White = background (MetallicPaint ignores white pixels)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, SIZE, SIZE)

    // Black text = metallic surface
    ctx.fillStyle = '#000000'
    ctx.font = `700 78px "Cinzel", "Georgia", serif`
    ;(ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '6px'
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('ZOBLENDS', SIZE / 2, SIZE / 2)

    return canvas.toDataURL('image/png')
  })
}

export default function NavbarLogoText() {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    buildTextImage().then(setSrc)
  }, [])

  if (!src) {
    return (
      <span style={{
        fontFamily: '"Cinzel", serif',
        fontSize: 20,
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#d4af37',
      }}>
        ZoBlends
      </span>
    )
  }

  return (
    <div className="navbar__logo-metallic-text">
      <MetallicPaint
        imageSrc={src}
        seed={42}
        scale={4}
        patternSharpness={1}
        noiseScale={0.5}
        speed={0.3}
        liquid={0.75}
        mouseAnimation={false}
        brightness={2}
        contrast={0.5}
        refraction={0.01}
        blur={0.015}
        chromaticSpread={2}
        fresnel={1}
        angle={0}
        waveAmplitude={1}
        distortion={1}
        contour={0.2}
        lightColor="#b1902a"
        darkColor="#000000"
        tintColor="#ffffff"
      />
    </div>
  )
}
