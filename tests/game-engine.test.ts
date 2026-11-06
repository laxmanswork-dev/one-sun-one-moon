import { describe, expect, it } from 'vitest'
import {
  CONFIG,
  createGame,
  difficulty,
  isSuperstar,
  resize,
  seededRng,
  startGame,
  step,
  type GameState,
  type Item,
} from '@/components/game/engine'

const idle = { dir: 0 as const, targetX: null }

function itemAbovePlayer(state: GameState, kind: Item['kind']): Item {
  return { id: 999, kind, x: state.player.x, y: state.player.y + 4, vx: 0, vy: 0, r: 20, angle: 0, spin: 0, phase: 0 }
}

describe('game engine', () => {
  it('does nothing until started', () => {
    const s = createGame(800, 600)
    expect(step(s, 0.016, idle).state).toBe(s)
  })

  it('counts down and ends with a time-up event', () => {
    let s = startGame(createGame(800, 600))
    const rng = seededRng(1)
    let reason: string | undefined
    // keep the player far right and drop every item so nothing interferes
    for (let i = 0; i < 5000 && s.status === 'playing'; i++) {
      const res = step({ ...s, items: [] }, 0.05, idle, rng)
      s = res.state
      for (const e of res.events) if (e.type === 'over') reason = e.reason
    }
    expect(s.status).toBe('over')
    expect(reason).toBe('time')
    expect(s.elapsed).toBeCloseTo(CONFIG.duration, 0)
  })

  it('caps the time step so a background tab cannot skip the game', () => {
    const s = startGame(createGame(800, 600))
    const { state } = step(s, 10, idle)
    expect(CONFIG.duration - state.timeLeft).toBeCloseTo(0.05)
  })

  it('scores shades with a growing combo, capped', () => {
    let s = startGame(createGame(800, 600))
    const scores: number[] = []
    for (let i = 0; i < 7; i++) {
      const before = s.score
      s = step({ ...s, items: [itemAbovePlayer(s, 'shades')], spawnIn: 99 }, 0.001, idle).state
      scores.push(s.score - before)
    }
    expect(scores).toEqual([10, 20, 30, 40, 50, 50, 50])
    expect(s.caught).toBe(7)
    expect(s.bestCombo).toBe(CONFIG.maxCombo)
  })

  it('sun tokens add time, moon tokens restore a life', () => {
    let s = startGame(createGame(800, 600))
    const t0 = s.timeLeft
    s = step({ ...s, items: [itemAbovePlayer(s, 'sun')], spawnIn: 99 }, 0.001, idle).state
    expect(s.timeLeft).toBeGreaterThan(t0 + CONFIG.tokenTimeBonus - 0.01)
    s = step({ ...s, lives: 1, items: [itemAbovePlayer(s, 'moon')], spawnIn: 99 }, 0.001, idle).state
    expect(s.lives).toBe(2)
  })

  it('obstacles cost a life, reset the combo, and grant brief invulnerability', () => {
    let s = startGame(createGame(800, 600))
    s = { ...s, combo: 3 }
    let res = step({ ...s, items: [itemAbovePlayer(s, 'rock')], spawnIn: 99 }, 0.001, idle)
    s = res.state
    expect(s.lives).toBe(CONFIG.lives - 1)
    expect(s.combo).toBe(0)
    expect(res.events).toContainEqual({ type: 'hit' })
    res = step({ ...s, items: [itemAbovePlayer(s, 'reel')], spawnIn: 99 }, 0.001, idle)
    expect(res.state.lives).toBe(CONFIG.lives - 1) // still invulnerable
  })

  it('ends the game when lives run out', () => {
    let s = startGame(createGame(800, 600))
    s = { ...s, lives: 1 }
    const { state, events } = step({ ...s, items: [itemAbovePlayer(s, 'rock')], spawnIn: 99 }, 0.001, idle)
    expect(state.status).toBe('over')
    expect(events).toContainEqual({ type: 'over', reason: 'lives' })
  })

  it('missing a pair of shades breaks the combo', () => {
    let s = startGame(createGame(800, 600))
    const falling: Item = { ...itemAbovePlayer(s, 'shades'), x: 20, y: 700 }
    s = { ...s, combo: 4, player: { ...s.player, x: 700 } }
    const { state, events } = step({ ...s, items: [falling], spawnIn: 99 }, 0.016, idle)
    expect(state.combo).toBe(0)
    expect(events).toContainEqual({ type: 'miss' })
  })

  it('moves with keyboard and pointer, staying inside the play area', () => {
    let s = startGame(createGame(800, 600))
    for (let i = 0; i < 100; i++) s = step({ ...s, items: [], spawnIn: 99 }, 0.05, { dir: 1, targetX: null }).state
    expect(s.player.x).toBe(800 - s.player.w / 2)
    for (let i = 0; i < 100; i++) s = step({ ...s, items: [], spawnIn: 99 }, 0.05, { dir: 0, targetX: -500 }).state
    expect(s.player.x).toBe(s.player.w / 2)
  })

  it('gets harder over time', () => {
    expect(difficulty(0)).toBe(0)
    expect(difficulty(CONFIG.duration / 2)).toBeCloseTo(0.5)
    expect(difficulty(CONFIG.duration * 2)).toBe(1)
  })

  it('keeps the player in bounds after a resize', () => {
    const s = resize(
      { ...startGame(createGame(1000, 700)), player: { ...createGame(1000, 700).player, x: 990 } },
      360,
      640,
    )
    expect(s.player.x).toBeLessThanOrEqual(360 - s.player.w / 2)
    expect(s.player.y + s.player.h).toBeLessThan(640)
  })

  it('unlocks the superstar level at the threshold', () => {
    expect(isSuperstar(CONFIG.superstarScore - 1)).toBe(false)
    expect(isSuperstar(CONFIG.superstarScore)).toBe(true)
  })

  it('a skilled player can reach the superstar level (playability check)', () => {
    // Bot: chase the lowest catchable item, avoid obstacles directly overhead.
    const rng = seededRng(42)
    let s = startGame(createGame(800, 600))
    while (s.status === 'playing') {
      const p = s.player
      const good = s.items.filter((i) => i.kind !== 'rock' && i.kind !== 'reel').sort((a, b) => b.y - a.y)[0]
      const danger = s.items.find(
        (i) => (i.kind === 'rock' || i.kind === 'reel') && i.y > p.y - 160 && Math.abs(i.x - p.x) < p.w,
      )
      let targetX = good ? good.x : p.x
      if (danger) targetX = danger.x > p.x ? danger.x - p.w * 1.6 : danger.x + p.w * 1.6
      s = step(s, 1 / 60, { dir: 0, targetX }, rng).state
    }
    expect(s.score).toBeGreaterThanOrEqual(CONFIG.superstarScore)
  })
})
