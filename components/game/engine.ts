/**
 * CATCH THE SUPERSTAR SHADES — game rules and simulation.
 *
 * Pure logic, no DOM: the component feeds it elapsed time and input, then
 * draws the returned state. Coordinates are CSS pixels of the play area.
 */

export const CONFIG = {
  duration: 45, // seconds
  lives: 3,
  superstarScore: 800,
  maxCombo: 5,
  points: { shades: 10, token: 50 },
  tokenTimeBonus: 3, // seconds added by a sun token
  invulnerableFor: 0.9, // seconds after a hit
  spawn: { slowest: 0.85, fastest: 0.32 }, // seconds between items
  fall: { slowest: 170, fastest: 360 }, // px/s at a 640px-tall play area
  obstacleShare: { start: 0.18, end: 0.38 },
  tokenShare: 0.12,
} as const

export type ItemKind = 'shades' | 'sun' | 'moon' | 'rock' | 'reel'
export type Status = 'ready' | 'playing' | 'paused' | 'over'

export interface Item {
  id: number
  kind: ItemKind
  x: number
  y: number
  vx: number
  vy: number
  r: number
  angle: number
  spin: number
  phase: number
}

export interface Pop {
  id: number
  x: number
  y: number
  text: string
  age: number
  good: boolean
}

export interface Player {
  x: number // centre
  y: number // top
  w: number
  h: number
  facing: -1 | 1
}

export interface GameState {
  status: Status
  width: number
  height: number
  elapsed: number
  timeLeft: number
  score: number
  lives: number
  combo: number
  bestCombo: number
  caught: number
  invulnerable: number
  wearingShades: number // seconds left showing the "shades on" pose
  player: Player
  items: Item[]
  pops: Pop[]
  spawnIn: number
  nextId: number
}

export interface Input {
  /** -1 left, 1 right, 0 none (keyboard / on-screen buttons). */
  dir: -1 | 0 | 1
  /** Pointer x to follow, or null. */
  targetX: number | null
}

export type GameEvent =
  | { type: 'catch'; kind: ItemKind; points: number }
  | { type: 'hit' }
  | { type: 'miss' }
  | { type: 'over'; reason: 'time' | 'lives' }

export type Rng = () => number

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export const isObstacle = (kind: ItemKind) => kind === 'rock' || kind === 'reel'
export const isSuperstar = (score: number) => score >= CONFIG.superstarScore

function makePlayer(width: number, height: number, x = width / 2): Player {
  const w = clamp(width * 0.16, 64, 120)
  const h = w * 1.25
  return { x: clamp(x, w / 2, width - w / 2), y: height - h - Math.max(10, height * 0.025), w, h, facing: 1 }
}

export function createGame(width: number, height: number): GameState {
  return {
    status: 'ready',
    width,
    height,
    elapsed: 0,
    timeLeft: CONFIG.duration,
    score: 0,
    lives: CONFIG.lives,
    combo: 0,
    bestCombo: 0,
    caught: 0,
    invulnerable: 0,
    wearingShades: 0,
    player: makePlayer(width, height),
    items: [],
    pops: [],
    spawnIn: 0.6,
    nextId: 1,
  }
}

/** A fresh round in the same play area. */
export function startGame(state: GameState): GameState {
  return { ...createGame(state.width, state.height), status: 'playing' }
}

export function resize(state: GameState, width: number, height: number): GameState {
  const sx = width / state.width
  const sy = height / state.height
  return {
    ...state,
    width,
    height,
    player: makePlayer(width, height, state.player.x * sx),
    items: state.items.map((it) => ({ ...it, x: it.x * sx, y: it.y * sy })),
  }
}

/** 0 → 1 over the round; drives speed, spawn rate and obstacle share. */
export const difficulty = (elapsed: number) => clamp(elapsed / CONFIG.duration, 0, 1)

function pickKind(d: number, rng: Rng): ItemKind {
  const roll = rng()
  const obstacle = lerp(CONFIG.obstacleShare.start, CONFIG.obstacleShare.end, d)
  if (roll < obstacle) return rng() < 0.55 ? 'rock' : 'reel'
  if (roll < obstacle + CONFIG.tokenShare) return rng() < 0.5 ? 'sun' : 'moon'
  return 'shades'
}

function spawn(state: GameState, rng: Rng): Item {
  const d = difficulty(state.elapsed)
  const kind = pickKind(d, rng)
  const scale = state.height / 640
  const r = clamp(state.width * 0.035, 16, 28) * (kind === 'shades' ? 1.15 : 1)
  let vy = lerp(CONFIG.fall.slowest, CONFIG.fall.fastest, d) * scale * lerp(0.85, 1.15, rng())
  let vx = 0
  if (kind === 'shades') vx = (rng() < 0.5 ? -1 : 1) * lerp(40, 150, rng()) * scale // they fly, not just fall
  if (kind === 'sun' || kind === 'moon') vy *= 0.75
  if (isObstacle(kind)) vy *= 1.12
  return {
    id: state.nextId,
    kind,
    x: lerp(r, state.width - r, rng()),
    y: -r,
    vx,
    vy,
    r,
    angle: rng() * Math.PI * 2,
    spin: kind === 'shades' ? lerp(-4, 4, rng()) : isObstacle(kind) ? lerp(-2, 2, rng()) : 0,
    phase: rng() * Math.PI * 2,
  }
}

function caughtBy(player: Player, item: Item): boolean {
  // The catch zone is the upper half of the character (hands and head).
  const left = player.x - player.w / 2 - item.r * 0.6
  const right = player.x + player.w / 2 + item.r * 0.6
  const top = player.y - item.r * 0.6
  const bottom = player.y + player.h * 0.55
  return item.x >= left && item.x <= right && item.y >= top && item.y <= bottom
}

/** Advances the simulation by dt seconds. Returns the next state and what happened. */
export function step(
  state: GameState,
  dt: number,
  input: Input,
  rng: Rng = Math.random,
): { state: GameState; events: GameEvent[] } {
  if (state.status !== 'playing') return { state, events: [] }
  const events: GameEvent[] = []
  dt = Math.min(dt, 0.05) // never jump more than 50 ms (tab switches, slow frames)

  const s: GameState = { ...state, player: { ...state.player }, items: [], pops: [] }
  s.elapsed += dt
  s.timeLeft = Math.max(0, s.timeLeft - dt)
  s.invulnerable = Math.max(0, s.invulnerable - dt)
  s.wearingShades = Math.max(0, s.wearingShades - dt)

  // Player movement
  const p = s.player
  const before = p.x
  if (input.targetX !== null) p.x += (input.targetX - p.x) * Math.min(1, dt * 14)
  else if (input.dir !== 0) p.x += input.dir * s.width * 0.95 * dt
  p.x = clamp(p.x, p.w / 2, s.width - p.w / 2)
  if (Math.abs(p.x - before) > 0.5) p.facing = p.x > before ? 1 : -1

  // Spawning
  s.spawnIn -= dt
  let nextId = s.nextId
  const spawned: Item[] = []
  while (s.spawnIn <= 0) {
    const d = difficulty(s.elapsed)
    spawned.push(spawn({ ...s, nextId: nextId++ }, rng))
    s.spawnIn += lerp(CONFIG.spawn.slowest, CONFIG.spawn.fastest, d) * lerp(0.8, 1.2, rng())
  }

  // Items
  for (const prev of [...state.items, ...spawned]) {
    const it = { ...prev }
    it.y += it.vy * dt
    it.x += it.vx * dt
    if (it.kind === 'sun' || it.kind === 'moon') it.x += Math.sin(s.elapsed * 2.4 + it.phase) * 30 * dt
    if (it.x < it.r || it.x > s.width - it.r) {
      it.vx *= -1
      it.x = clamp(it.x, it.r, s.width - it.r)
    }
    it.angle += it.spin * dt

    if (caughtBy(p, it)) {
      if (isObstacle(it.kind)) {
        if (s.invulnerable > 0) continue // shrugged off
        s.lives -= 1
        s.combo = 0
        s.invulnerable = CONFIG.invulnerableFor
        s.pops.push({ id: it.id, x: it.x, y: it.y, text: '−1 life', age: 0, good: false })
        events.push({ type: 'hit' })
        continue
      }
      let points: number
      if (it.kind === 'shades') {
        s.combo = Math.min(CONFIG.maxCombo, s.combo + 1)
        s.bestCombo = Math.max(s.bestCombo, s.combo)
        points = CONFIG.points.shades * s.combo
        s.caught += 1
        s.wearingShades = 0.7
      } else {
        points = CONFIG.points.token
        if (it.kind === 'sun') s.timeLeft += CONFIG.tokenTimeBonus
        if (it.kind === 'moon') {
          if (s.lives < CONFIG.lives) s.lives += 1
          else points += CONFIG.points.token
        }
      }
      s.score += points
      const label =
        it.kind === 'sun'
          ? `+${points} · +${CONFIG.tokenTimeBonus}s`
          : it.kind === 'moon'
            ? `+${points} · life`
            : `+${points}`
      s.pops.push({ id: it.id, x: it.x, y: it.y, text: label, age: 0, good: true })
      events.push({ type: 'catch', kind: it.kind, points })
      continue
    }

    if (it.y - it.r > s.height) {
      if (it.kind === 'shades') {
        s.combo = 0
        events.push({ type: 'miss' })
      }
      continue
    }
    s.items.push(it)
  }
  s.nextId = nextId

  // Floating score labels
  for (const pop of state.pops) if (pop.age + dt < 0.9) s.pops.push({ ...pop, age: pop.age + dt })

  if (s.lives <= 0 || s.timeLeft <= 0) {
    s.status = 'over'
    events.push({ type: 'over', reason: s.lives <= 0 ? 'lives' : 'time' })
  }
  return { state: s, events }
}

/** Deterministic RNG for tests and replays (mulberry32). */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
