import { describe, expect, it } from 'vitest'
import { createRateLimiter } from '@/lib/security/rate-limit'
import { filledByHuman, isAllowedOrigin, MIN_FILL_MS } from '@/lib/security/request'

describe('rate limiter', () => {
  it('allows up to the limit within a window, then blocks with a retry time', () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 60_000 })
    expect(limiter.check('ip', 0).allowed).toBe(true)
    expect(limiter.check('ip', 1).allowed).toBe(true)
    const blocked = limiter.check('ip', 2)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterSeconds).toBe(60)
  })

  it('resets after the window and tracks keys independently', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 })
    expect(limiter.check('a', 0).allowed).toBe(true)
    expect(limiter.check('a', 10).allowed).toBe(false)
    expect(limiter.check('b', 10).allowed).toBe(true)
    expect(limiter.check('a', 1001).allowed).toBe(true)
  })

  it('stays bounded in memory', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000, maxKeys: 3 })
    for (const k of ['a', 'b', 'c', 'd', 'e']) limiter.check(k, 0)
    // "a" was evicted, so it is allowed again
    expect(limiter.check('a', 1).allowed).toBe(true)
  })
})

describe('origin check', () => {
  const h = (init: Record<string, string>) => new Headers(init)
  it('accepts the production origin and same-host requests', () => {
    expect(isAllowedOrigin(h({ origin: 'https://onesunonemoon.in' }), ['https://onesunonemoon.in'])).toBe(true)
    expect(
      isAllowedOrigin(h({ origin: 'http://localhost:3000', host: 'localhost:3000' }), ['https://onesunonemoon.in']),
    ).toBe(true)
  })
  it('rejects missing, foreign or malformed origins', () => {
    expect(isAllowedOrigin(h({}), ['https://onesunonemoon.in'])).toBe(false)
    expect(
      isAllowedOrigin(h({ origin: 'https://evil.example', host: 'onesunonemoon.in' }), ['https://onesunonemoon.in']),
    ).toBe(false)
    expect(isAllowedOrigin(h({ origin: 'null' }), ['https://onesunonemoon.in'])).toBe(false)
  })
})

describe('fill-time check', () => {
  it('rejects instant and missing timestamps, accepts a human pace', () => {
    const now = 1_000_000
    expect(filledByHuman(undefined, now)).toBe(false)
    expect(filledByHuman(now - 500, now)).toBe(false)
    expect(filledByHuman(now - MIN_FILL_MS, now)).toBe(true)
    expect(filledByHuman(now - 1000 * 60 * 60 * 25, now)).toBe(false)
  })
})
