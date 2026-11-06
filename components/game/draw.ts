import type { GameState, Item, Player } from './engine'

const C = {
  cream: '#F4EBDD',
  gold: '#E7A52E',
  sienna: '#B94A24',
  blood: '#8E241B',
  espresso: '#261714',
}

/** Paints the static desert backdrop once per resize into an offscreen canvas. */
export function paintBackdrop(width: number, height: number, dpr: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)

  const horizon = height * 0.7
  const sky = ctx.createLinearGradient(0, 0, 0, horizon)
  sky.addColorStop(0, '#F7EBD6')
  sky.addColorStop(0.65, '#F2CF98')
  sky.addColorStop(1, '#E9A866')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, width, horizon)

  // Sun on the horizon
  const sx = width * 0.7
  const sr = Math.min(width, height) * 0.16
  const glow = ctx.createRadialGradient(sx, horizon, 0, sx, horizon, sr * 2.6)
  glow.addColorStop(0, 'rgba(246,194,90,0.55)')
  glow.addColorStop(1, 'rgba(246,194,90,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, horizon)
  const disk = ctx.createRadialGradient(sx, horizon - sr * 0.4, sr * 0.1, sx, horizon, sr)
  disk.addColorStop(0, '#FFF1C9')
  disk.addColorStop(0.5, '#F6C25A')
  disk.addColorStop(1, C.gold)
  ctx.fillStyle = disk
  ctx.beginPath()
  ctx.arc(sx, horizon, sr, Math.PI, 0)
  ctx.fill()

  // Crescent moon, high and to the left
  ctx.save()
  ctx.translate(width * 0.18, height * 0.16)
  ctx.rotate(-0.35)
  crescent(ctx, Math.min(width, height) * 0.05, 'rgba(244,235,221,0.95)')
  ctx.restore()

  // Mesas
  ctx.fillStyle = C.sienna
  mesa(ctx, 0, horizon, width * 0.32, height * 0.22)
  mesa(ctx, width * 0.78, horizon, width * 0.24, height * 0.17)
  ctx.fillStyle = C.blood
  mesa(ctx, -width * 0.04, horizon + 4, width * 0.2, height * 0.12)
  mesa(ctx, width * 0.86, horizon + 4, width * 0.2, height * 0.1)

  // Ground
  const ground = ctx.createLinearGradient(0, horizon, 0, height)
  ground.addColorStop(0, '#D79A62')
  ground.addColorStop(0.4, '#B8703F')
  ground.addColorStop(1, '#3B1F18')
  ctx.fillStyle = ground
  ctx.fillRect(0, horizon, width, height - horizon)
  return canvas
}

function mesa(ctx: CanvasRenderingContext2D, x: number, base: number, w: number, h: number) {
  ctx.beginPath()
  ctx.moveTo(x, base)
  ctx.lineTo(x + w * 0.08, base - h * 0.55)
  ctx.lineTo(x + w * 0.16, base - h * 0.62)
  ctx.lineTo(x + w * 0.2, base - h)
  ctx.lineTo(x + w * 0.62, base - h)
  ctx.lineTo(x + w * 0.68, base - h * 0.7)
  ctx.lineTo(x + w * 0.86, base - h * 0.64)
  ctx.lineTo(x + w, base)
  ctx.closePath()
  ctx.fill()
}

function crescent(ctx: CanvasRenderingContext2D, r: number, color: string) {
  // Inside the outer disk, minus the offset inner disk.
  ctx.save()
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.clip()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.rect(-r, -r, r * 2, r * 2)
  ctx.arc(r * 0.45, -r * 0.2, r * 0.85, 0, Math.PI * 2)
  ctx.fill('evenodd')
  ctx.restore()
}

function shadesShape(ctx: CanvasRenderingContext2D, w: number) {
  // A bold pair of shades: two lenses + bridge, centred on the origin.
  const lw = w * 0.42
  const lh = w * 0.26
  ctx.beginPath()
  ctx.roundRect(-w / 2, -lh / 2, lw, lh, [lh * 0.2, lh * 0.2, lh * 0.55, lh * 0.55])
  ctx.roundRect(w / 2 - lw, -lh / 2, lw, lh, [lh * 0.2, lh * 0.2, lh * 0.55, lh * 0.55])
  ctx.fill()
  ctx.fillRect(-w * 0.09, -lh / 2, w * 0.18, lh * 0.18)
}

function drawItem(ctx: CanvasRenderingContext2D, it: Item, t: number) {
  ctx.save()
  ctx.translate(it.x, it.y)
  ctx.rotate(it.angle)
  switch (it.kind) {
    case 'shades': {
      ctx.fillStyle = C.espresso
      shadesShape(ctx, it.r * 2)
      ctx.fillStyle = 'rgba(231,165,46,0.85)' // glint
      ctx.fillRect(-it.r * 0.82, -it.r * 0.18, it.r * 0.22, it.r * 0.08)
      ctx.fillRect(it.r * 0.22, -it.r * 0.18, it.r * 0.22, it.r * 0.08)
      break
    }
    case 'sun': {
      const pulse = 1 + Math.sin(t * 6 + it.phase) * 0.06
      ctx.scale(pulse, pulse)
      ctx.strokeStyle = C.gold
      ctx.lineWidth = it.r * 0.16
      ctx.lineCap = 'round'
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4
        ctx.beginPath()
        ctx.moveTo(Math.cos(a) * it.r * 0.68, Math.sin(a) * it.r * 0.68)
        ctx.lineTo(Math.cos(a) * it.r, Math.sin(a) * it.r)
        ctx.stroke()
      }
      ctx.fillStyle = C.gold
      ctx.beginPath()
      ctx.arc(0, 0, it.r * 0.5, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'moon': {
      ctx.fillStyle = 'rgba(38,23,20,0.85)'
      ctx.beginPath()
      ctx.arc(0, 0, it.r, 0, Math.PI * 2)
      ctx.fill()
      ctx.rotate(-0.4)
      crescent(ctx, it.r * 0.7, C.cream)
      break
    }
    case 'rock': {
      ctx.fillStyle = '#5A3424'
      ctx.beginPath()
      const pts = 7
      for (let i = 0; i < pts; i++) {
        const a = (i / pts) * Math.PI * 2
        const rr = it.r * (0.78 + ((i * 37) % 10) / 40)
        ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
      }
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = 'rgba(244,235,221,0.18)'
      ctx.beginPath()
      ctx.arc(-it.r * 0.25, -it.r * 0.25, it.r * 0.25, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'reel': {
      ctx.fillStyle = C.blood
      ctx.beginPath()
      ctx.arc(0, 0, it.r, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = C.cream
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2
        ctx.beginPath()
        ctx.arc(Math.cos(a) * it.r * 0.55, Math.sin(a) * it.r * 0.55, it.r * 0.18, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.beginPath()
      ctx.arc(0, 0, it.r * 0.12, 0, Math.PI * 2)
      ctx.fill()
      break
    }
  }
  ctx.restore()
}

/**
 * Original placeholder hero: a sun-disk head with a cool pair of shades and
 * an espresso jacket. Deliberately generic — see character.ts.
 */
function drawPlaceholderCharacter(
  ctx: CanvasRenderingContext2D,
  p: Player,
  wearing: boolean,
  hurt: boolean,
  t: number,
) {
  const { x, y, w, h } = p
  ctx.save()
  if (hurt && Math.floor(t * 16) % 2 === 0) ctx.globalAlpha = 0.45

  // Shadow
  ctx.fillStyle = 'rgba(38,23,20,0.25)'
  ctx.beginPath()
  ctx.ellipse(x, y + h, w * 0.5, w * 0.08, 0, 0, Math.PI * 2)
  ctx.fill()

  // Body (jacket) + raised arms
  ctx.fillStyle = C.espresso
  ctx.beginPath()
  ctx.moveTo(x - w * 0.34, y + h)
  ctx.lineTo(x - w * 0.28, y + h * 0.5)
  ctx.quadraticCurveTo(x, y + h * 0.42, x + w * 0.28, y + h * 0.5)
  ctx.lineTo(x + w * 0.34, y + h)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = C.espresso
  ctx.lineWidth = w * 0.11
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x - w * 0.26, y + h * 0.56)
  ctx.lineTo(x - w * 0.46, y + h * 0.2)
  ctx.moveTo(x + w * 0.26, y + h * 0.56)
  ctx.lineTo(x + w * 0.46, y + h * 0.2)
  ctx.stroke()
  // Collar
  ctx.fillStyle = C.sienna
  ctx.beginPath()
  ctx.moveTo(x - w * 0.12, y + h * 0.47)
  ctx.lineTo(x, y + h * 0.64)
  ctx.lineTo(x + w * 0.12, y + h * 0.47)
  ctx.closePath()
  ctx.fill()

  // Sun head with rays
  const hx = x
  const hy = y + h * 0.28
  const hr = w * 0.24
  ctx.strokeStyle = C.gold
  ctx.lineWidth = w * 0.05
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + t * 0.6
    ctx.beginPath()
    ctx.moveTo(hx + Math.cos(a) * hr * 1.15, hy + Math.sin(a) * hr * 1.15)
    ctx.lineTo(hx + Math.cos(a) * hr * 1.45, hy + Math.sin(a) * hr * 1.45)
    ctx.stroke()
  }
  const g = ctx.createRadialGradient(hx - hr * 0.3, hy - hr * 0.3, hr * 0.1, hx, hy, hr)
  g.addColorStop(0, '#FFE3A1')
  g.addColorStop(1, C.gold)
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(hx, hy, hr, 0, Math.PI * 2)
  ctx.fill()

  // Shades — always on; a quick flip-on flourish after each catch
  ctx.save()
  ctx.translate(hx, hy - hr * 0.08)
  if (wearing) ctx.rotate(Math.sin(t * 30) * 0.08)
  ctx.fillStyle = C.espresso
  shadesShape(ctx, hr * 1.9)
  ctx.restore()
  // Smile
  ctx.strokeStyle = C.espresso
  ctx.lineWidth = w * 0.03
  ctx.beginPath()
  ctx.arc(hx, hy + hr * 0.25, hr * 0.35, 0.15 * Math.PI, 0.85 * Math.PI)
  ctx.stroke()
  ctx.restore()
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  backdrop: HTMLCanvasElement | null,
  options: {
    t: number
    dpr: number
    reducedMotion: boolean
    sprite: HTMLImageElement | null
    spriteWithShades: HTMLImageElement | null
  },
) {
  const { width, height } = state
  ctx.setTransform(options.dpr, 0, 0, options.dpr, 0, 0)
  if (backdrop) ctx.drawImage(backdrop, 0, 0, width, height)
  else {
    ctx.fillStyle = C.cream
    ctx.fillRect(0, 0, width, height)
  }

  for (const it of state.items) drawItem(ctx, it, options.t)

  const hurt = state.invulnerable > 0
  const sprite = state.wearingShades > 0 ? (options.spriteWithShades ?? options.sprite) : options.sprite
  if (sprite?.complete && sprite.naturalWidth) {
    const p = state.player
    ctx.save()
    if (hurt && Math.floor(options.t * 16) % 2 === 0) ctx.globalAlpha = 0.45
    ctx.drawImage(sprite, p.x - p.w / 2, p.y, p.w, p.h)
    ctx.restore()
  } else {
    drawPlaceholderCharacter(ctx, state.player, state.wearingShades > 0, hurt, options.t)
  }

  // Floating score labels
  ctx.textAlign = 'center'
  ctx.font = `800 ${Math.max(14, width * 0.022)}px system-ui, sans-serif`
  for (const pop of state.pops) {
    const rise = options.reducedMotion ? 0 : pop.age * 50
    ctx.globalAlpha = 1 - pop.age / 0.9
    ctx.fillStyle = pop.good ? C.espresso : C.blood
    ctx.fillText(pop.text, pop.x, pop.y - rise)
  }
  ctx.globalAlpha = 1

  // Red flash on hit
  if (state.invulnerable > 0.6 && !options.reducedMotion) {
    ctx.fillStyle = `rgba(142,36,27,${(state.invulnerable - 0.6) * 0.8})`
    ctx.fillRect(0, 0, width, height)
  }
}
