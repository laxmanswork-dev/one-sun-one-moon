import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'

export const alt = 'ONE SUN ONE MOON — Ideas. Stories. Brands. Beyond Borders.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Default social card for every page without its own image.
export default async function OpengraphImage() {
  const font = await readFile(path.join(process.cwd(), 'assets/fonts/ArchivoBlack-Regular.ttf'))
  const fire = 'linear-gradient(180deg, #EAA632 0%, #D4702A 45%, #A8391F 75%, #7A1E16 100%)'

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(120% 90% at 50% 0%, #FAF2E4 0%, #F4EBDD 55%, #EBD6B8 100%)',
        fontFamily: 'Archivo Black',
        position: 'relative',
      }}
    >
      {/* sun on the horizon */}
      <div
        style={{
          position: 'absolute',
          right: 70,
          bottom: 30,
          width: 220,
          height: 220,
          borderRadius: 999,
          background: 'radial-gradient(circle at 50% 40%, #FFF1C9 0%, #F6C25A 45%, #E7A52E 75%)',
          opacity: 0.85,
        }}
      />
      {/* desert floor */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 140,
          background: 'linear-gradient(180deg, #B94A24 0%, #8E241B 55%, #261714 100%)',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: -60 }}>
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 999,
            boxShadow: 'inset 14px -4px 0 0 #B94A24',
            transform: 'rotate(-18deg)',
          }}
        />
        <div
          style={{ fontSize: 120, lineHeight: 1, backgroundImage: fire, backgroundClip: 'text', color: 'transparent' }}
        >
          ONE SUN
        </div>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 999,
            background: '#E7A52E',
            boxShadow: '0 0 0 10px rgba(231,165,46,0.25)',
          }}
        />
      </div>
      <div
        style={{ fontSize: 120, lineHeight: 1, backgroundImage: fire, backgroundClip: 'text', color: 'transparent' }}
      >
        ONE MOON
      </div>
      <div style={{ marginTop: 34, fontSize: 24, letterSpacing: 10, color: '#261714' }}>
        IDEAS · STORIES · BRANDS · BEYOND BORDERS
      </div>
    </div>,
    { ...size, fonts: [{ name: 'Archivo Black', data: font, style: 'normal', weight: 400 }] },
  )
}
