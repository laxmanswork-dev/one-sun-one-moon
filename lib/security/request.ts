/** Best-effort client IP from proxy headers (the host sets these; never trust them for auth). */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || headers.get('x-real-ip')?.trim() || 'unknown'
}

/**
 * Same-origin check for form posts. Browsers always send Origin on POST
 * fetches; a missing or foreign Origin means the request did not come from
 * this site's pages.
 */
export function isAllowedOrigin(headers: Headers, allowed: string[]): boolean {
  const origin = headers.get('origin')
  if (!origin) return false
  try {
    const { origin: normalised } = new URL(origin)
    if (allowed.includes(normalised)) return true
    // Same host as the request (covers preview deployments and local dev).
    const host = headers.get('x-forwarded-host') ?? headers.get('host')
    return Boolean(host) && new URL(normalised).host === host
  } catch {
    return false
  }
}

export const MIN_FILL_MS = 3000
export const MAX_FORM_AGE_MS = 1000 * 60 * 60 * 24

/** Rejects submissions made implausibly fast after the form was rendered (typical of bots). */
export function filledByHuman(startedAt: unknown, now = Date.now()): boolean {
  const t = typeof startedAt === 'number' ? startedAt : Number(startedAt)
  if (!Number.isFinite(t)) return false
  const elapsed = now - t
  return elapsed >= MIN_FILL_MS && elapsed <= MAX_FORM_AGE_MS
}
