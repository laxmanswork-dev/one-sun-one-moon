'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { MoonGlyph, SunGlyph } from '@/components/brand/Glyphs'
import { useModal } from '@/lib/hooks/useModal'
import { CHARACTER, usesPlaceholderArt } from './character'
import { drawFrame, paintBackdrop } from './draw'
import {
  CONFIG,
  createGame,
  isSuperstar,
  resize,
  startGame,
  step,
  type GameState,
  type Input,
  type Status,
} from './engine'
import styles from './SuperstarGame.module.css'

const BEST_KEY = 'osom-superstar-best'

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}
function writeBest(score: number) {
  try {
    localStorage.setItem(BEST_KEY, String(score))
  } catch {
    /* storage unavailable (private mode) — best score just isn't kept */
  }
}

function loadSprite(src: string | undefined) {
  if (!src) return null
  const img = new Image()
  img.decoding = 'async'
  img.src = src
  return img
}

interface Hud {
  score: number
  time: number
  lives: number
  combo: number
}

interface Result {
  score: number
  best: number
  newBest: boolean
  caught: number
  bestCombo: number
  reason: 'time' | 'lives'
}

export interface SuperstarGameProps {
  onClose: () => void
  /** Called each time a session ends (time up or out of lives). */
  onFinish?: () => void
  /** When given, the result screen offers this as its main action, next to Play again. */
  onContinue?: () => void
  continueLabel?: string
  /** Wording for leaving the game, e.g. “Back to the journey”. */
  closeLabel?: string
}

export default function SuperstarGame({
  onClose,
  onFinish,
  onContinue,
  continueLabel = 'Continue',
  closeLabel = 'Back to the website',
}: SuperstarGameProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<GameState>(createGame(800, 600))
  const inputRef = useRef<Input>({ dir: 0, targetX: null })
  const keysRef = useRef({ left: false, right: false })
  const backdropRef = useRef<HTMLCanvasElement | null>(null)
  const dprRef = useRef(1)
  const spritesRef = useRef<{ base: HTMLImageElement | null; shades: HTMLImageElement | null }>({
    base: null,
    shades: null,
  })
  const reducedRef = useRef(false)
  // Read inside the game loop without restarting it when the parent re-renders.
  const onFinishRef = useRef(onFinish)
  useEffect(() => {
    onFinishRef.current = onFinish
  }, [onFinish])

  const [status, setStatus] = useState<Status>('ready')
  const [hud, setHud] = useState<Hud>({ score: 0, time: CONFIG.duration, lives: CONFIG.lives, combo: 0 })
  const [result, setResult] = useState<Result | null>(null)
  const [announcement, setAnnouncement] = useState('')

  useModal(true, dialogRef, onClose)

  // Move focus to each screen's main action as it appears.
  useEffect(() => {
    if (status === 'playing') return
    dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus({ preventScroll: true })
  }, [status, result])

  const draw = useCallback((t = performance.now() / 1000) => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    drawFrame(ctx, stateRef.current, backdropRef.current, {
      t,
      dpr: dprRef.current,
      reducedMotion: reducedRef.current,
      sprite: spritesRef.current.base,
      spriteWithShades: spritesRef.current.shades,
    })
  }, [])

  // Sprites (only when authorised artwork has been configured) + motion preference.
  useEffect(() => {
    spritesRef.current = {
      base: loadSprite(CHARACTER.sprite?.src),
      shades: loadSprite(CHARACTER.spriteWithShades?.src),
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedRef.current = mq.matches
    const onChange = () => (reducedRef.current = mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Size the canvas to its box at device resolution.
  useEffect(() => {
    const stage = stageRef.current
    const canvas = canvasRef.current
    if (!stage || !canvas) return
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      const { width, height } = entry.contentRect
      if (width < 10 || height < 10) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      dprRef.current = dpr
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      stateRef.current = resize(stateRef.current, width, height)
      backdropRef.current = paintBackdrop(width, height, dpr)
      draw()
    })
    observer.observe(stage)
    return () => observer.disconnect()
  }, [draw])

  const pause = useCallback(() => {
    if (stateRef.current.status !== 'playing') return
    stateRef.current = { ...stateRef.current, status: 'paused' }
    setStatus('paused')
    setAnnouncement('Paused.')
  }, [])

  const resume = useCallback(() => {
    if (stateRef.current.status !== 'paused') return
    stateRef.current = { ...stateRef.current, status: 'playing' }
    setStatus('playing')
    setAnnouncement('Resumed.')
    stageRef.current?.focus({ preventScroll: true })
  }, [])

  const start = useCallback(() => {
    stateRef.current = startGame(stateRef.current)
    inputRef.current = { dir: 0, targetX: null }
    setResult(null)
    setHud({ score: 0, time: CONFIG.duration, lives: CONFIG.lives, combo: 0 })
    setStatus('playing')
    setAnnouncement(`Game started. ${CONFIG.duration} seconds on the clock.`)
    stageRef.current?.focus({ preventScroll: true })
  }, [])

  // The loop runs only while playing.
  useEffect(() => {
    if (status !== 'playing') {
      draw()
      return
    }
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      const keys = keysRef.current
      const input = inputRef.current
      input.dir = keys.left === keys.right ? 0 : keys.left ? -1 : 1
      const { state, events } = step(stateRef.current, dt, input)
      stateRef.current = state
      draw(now / 1000)

      setHud((h) => {
        const next = { score: state.score, time: Math.ceil(state.timeLeft), lives: state.lives, combo: state.combo }
        return h.score === next.score && h.time === next.time && h.lives === next.lives && h.combo === next.combo
          ? h
          : next
      })

      for (const event of events) {
        if (event.type === 'hit' && !reducedRef.current) {
          stageRef.current?.animate(
            [
              { transform: 'translateX(0)' },
              { transform: 'translateX(-8px)' },
              { transform: 'translateX(6px)' },
              { transform: 'translateX(0)' },
            ],
            { duration: 260, easing: 'ease-out' },
          )
        }
        if (event.type === 'over') {
          const previous = readBest()
          const newBest = state.score > previous
          if (newBest) writeBest(state.score)
          setResult({
            score: state.score,
            best: Math.max(previous, state.score),
            newBest,
            caught: state.caught,
            bestCombo: state.bestCombo,
            reason: event.reason,
          })
          setStatus('over')
          setAnnouncement(
            isSuperstar(state.score)
              ? `Superstar level unlocked! Final score ${state.score}.`
              : `${event.reason === 'time' ? 'Time is up' : 'Out of lives'}. Final score ${state.score}.`,
          )
          onFinishRef.current?.()
          return
        }
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [status, draw])

  // Keyboard, and auto-pause when the tab or window loses focus.
  useEffect(() => {
    const setKey = (event: KeyboardEvent, down: boolean) => {
      const k = event.key
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') keysRef.current.left = down
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') keysRef.current.right = down
      else return false
      inputRef.current.targetX = null
      return true
    }
    const onKeyDown = (event: KeyboardEvent) => {
      const playing = stateRef.current.status === 'playing'
      if (setKey(event, true) && playing) event.preventDefault()
      if (
        (event.key === 'p' || event.key === 'P' || event.key === ' ') &&
        (playing || stateRef.current.status === 'paused')
      ) {
        // Space on a focused button should press the button, not pause.
        if (event.key === ' ' && event.target instanceof HTMLButtonElement) return
        event.preventDefault()
        if (playing) pause()
        else resume()
      }
    }
    const onKeyUp = (event: KeyboardEvent) => void setKey(event, false)
    const onHidden = () => {
      keysRef.current = { left: false, right: false }
      pause()
    }
    const onVisibility = () => document.hidden && onHidden()
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onHidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onHidden)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [pause, resume])

  const follow = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (event.pointerType === 'mouse' || event.buttons || event.type === 'pointerdown') {
      const rect = event.currentTarget.getBoundingClientRect()
      inputRef.current.targetX = event.clientX - rect.left
    }
  }
  // On-screen arrows: held down = moving. The direction comes from data-dir.
  const hold = (event: React.PointerEvent<HTMLButtonElement>) => {
    const dir = event.currentTarget.dataset.dir === 'left' ? 'left' : 'right'
    keysRef.current[dir] = event.type === 'pointerdown'
    inputRef.current.targetX = null
  }

  const superstar = result ? isSuperstar(result.score) : false

  return (
    <div
      ref={dialogRef}
      className={`${styles.overlay} on-dark`}
      role="dialog"
      aria-modal="true"
      aria-label="Catch the Superstar Shades — mini-game"
      tabIndex={-1}
    >
      <div className={styles.letterbox} aria-hidden="true" />
      <div className={styles.frame}>
        <header className={styles.bar}>
          <p className={styles.presents}>
            <MoonGlyph className={styles.glyph} /> ONE SUN ONE MOON presents
          </p>
          <div className={styles.hud} aria-hidden={status === 'ready'}>
            {status !== 'ready' && (
              <>
                <span className={styles.stat}>
                  <span className={styles.statLabel}>Score</span>
                  <span className={styles.statValue}>{hud.score}</span>
                </span>
                <span className={styles.stat}>
                  <span className={styles.statLabel}>Time</span>
                  <span className={styles.statValue}>{hud.time}s</span>
                </span>
                <span className={styles.stat}>
                  <span className={styles.statLabel}>Lives</span>
                  <span className={styles.statValue} aria-label={`${hud.lives} of ${CONFIG.lives}`}>
                    {Array.from({ length: CONFIG.lives }, (_, i) => (
                      <span key={i} className={i < hud.lives ? styles.lifeOn : styles.lifeOff} aria-hidden="true">
                        ●
                      </span>
                    ))}
                  </span>
                </span>
                {hud.combo > 1 && <span className={styles.combo}>×{hud.combo}</span>}
              </>
            )}
          </div>
          <div className={styles.barActions}>
            {status === 'playing' && (
              <button type="button" className={styles.iconButton} onClick={pause}>
                <span aria-hidden="true">❚❚</span>
                <span className="visually-hidden">Pause</span>
              </button>
            )}
            <button type="button" className={styles.iconButton} onClick={onClose}>
              <span aria-hidden="true">×</span>
              <span className="visually-hidden">Close game — {closeLabel.toLowerCase()}</span>
            </button>
          </div>
        </header>

        <div ref={stageRef} className={styles.stage} tabIndex={-1}>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            role="img"
            aria-label="Game area: catch the falling sunglasses and tokens, dodge the rocks and film reels."
            onPointerMove={follow}
            onPointerDown={follow}
          />

          {status === 'ready' && (
            <div className={`${styles.card} ${styles.intro}`}>
              <p className={styles.cardKicker}>A secret brand experience</p>
              <h2 className={`display ${styles.cardTitle}`}>
                Catch the <span className={styles.gold}>Superstar</span> Shades
              </h2>
              <ul className={styles.rules}>
                <li>Catch the flying shades — chain catches for up to ×{CONFIG.maxCombo} points.</li>
                <li>
                  <span>
                    <SunGlyph className={styles.ruleGlyph} /> Sun tokens add {CONFIG.tokenTimeBonus} seconds.
                  </span>
                  <span>
                    <MoonGlyph className={styles.ruleGlyph} /> Moon tokens restore a life.
                  </span>
                </li>
                <li>Dodge rocks and film reels. Score {CONFIG.superstarScore} to unlock the Superstar level.</li>
              </ul>
              <p className={styles.controls}>
                Move with your mouse, finger, or ← → / A D. P or Space pauses. Esc closes.
              </p>
              <button type="button" className={styles.play} onClick={start} data-autofocus>
                Play — {CONFIG.duration} seconds
              </button>
              {usesPlaceholderArt && <p className={styles.note}>Character artwork coming soon.</p>}
              {CHARACTER.credit && <p className={styles.note}>{CHARACTER.credit}</p>}
            </div>
          )}

          {status === 'paused' && (
            <div className={styles.card}>
              <h2 className={`display ${styles.cardTitle}`}>Paused</h2>
              <div className={styles.cardActions}>
                <button type="button" className={styles.play} onClick={resume} data-autofocus>
                  Resume
                </button>
                <button type="button" className={styles.secondary} onClick={onClose}>
                  {closeLabel}
                </button>
              </div>
            </div>
          )}

          {status === 'over' && result && (
            <div className={`${styles.card} ${superstar ? styles.superstar : ''}`}>
              {superstar ? (
                <>
                  <div className={styles.burst} aria-hidden="true" />
                  <p className={styles.cardKicker}>High score · {result.score}</p>
                  <h2 className={`display ${styles.cardTitle} ${styles.unlocked}`}>
                    Superstar
                    <br />
                    level unlocked
                  </h2>
                </>
              ) : (
                <>
                  <p className={styles.cardKicker}>{result.reason === 'time' ? 'Time’s up' : 'Out of lives'}</p>
                  <h2 className={`display ${styles.cardTitle}`}>Game over</h2>
                </>
              )}
              <dl className={styles.results}>
                <div>
                  <dt>Score</dt>
                  <dd>{result.score}</dd>
                </div>
                <div>
                  <dt>Best</dt>
                  <dd>
                    {result.best}
                    {result.newBest && <span className={styles.newBest}> New!</span>}
                  </dd>
                </div>
                <div>
                  <dt>Shades</dt>
                  <dd>{result.caught}</dd>
                </div>
                <div>
                  <dt>Best combo</dt>
                  <dd>×{result.bestCombo}</dd>
                </div>
              </dl>
              {!superstar && (
                <p className={styles.controls}>
                  {CONFIG.superstarScore - result.score} more points to reach the Superstar level.
                </p>
              )}
              <div className={styles.cardActions}>
                {onContinue ? (
                  <>
                    <button type="button" className={styles.play} onClick={onContinue} data-autofocus>
                      {continueLabel} <span aria-hidden="true">→</span>
                    </button>
                    <button type="button" className={styles.secondary} onClick={start}>
                      Play again
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className={styles.play} onClick={start} data-autofocus>
                      Play again
                    </button>
                    <button type="button" className={styles.secondary} onClick={onClose}>
                      {closeLabel}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Touch screens: a control bar below the play area, so thumbs never cover the character. */}
        <div className={styles.touchControls}>
          {(['left', 'right'] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              className={styles.touchButton}
              data-dir={dir}
              disabled={status !== 'playing'}
              onPointerDown={hold}
              onPointerUp={hold}
              onPointerCancel={hold}
              onPointerLeave={hold}
              onContextMenu={(e) => e.preventDefault()}
            >
              <span aria-hidden="true">{dir === 'left' ? '◀' : '▶'}</span>
              <span className="visually-hidden">Move {dir}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
    </div>
  )
}
