/**
 * Fixed-window rate limiter held in memory.
 *
 * On serverless hosting each instance keeps its own counters, so this is a
 * first line of defence, not a global guarantee. For a hard limit across
 * instances, add a platform firewall rule (e.g. Vercel WAF rate limiting) or
 * back this with a shared store such as Redis.
 */
export interface RateLimiter {
  check(key: string, now?: number): { allowed: boolean; retryAfterSeconds: number }
}

export function createRateLimiter({
  limit,
  windowMs,
  maxKeys = 5000,
}: {
  limit: number
  windowMs: number
  maxKeys?: number
}): RateLimiter {
  const hits = new Map<string, { count: number; resetAt: number }>()

  return {
    check(key, now = Date.now()) {
      const entry = hits.get(key)
      if (!entry || entry.resetAt <= now) {
        if (hits.size >= maxKeys) {
          // Evict expired entries; if still full, drop the oldest.
          for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k)
          if (hits.size >= maxKeys) hits.delete(hits.keys().next().value as string)
        }
        hits.set(key, { count: 1, resetAt: now + windowMs })
        return { allowed: true, retryAfterSeconds: 0 }
      }
      entry.count += 1
      if (entry.count > limit) return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) }
      return { allowed: true, retryAfterSeconds: 0 }
    },
  }
}
