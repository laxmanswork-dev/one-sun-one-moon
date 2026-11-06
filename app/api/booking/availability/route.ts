import { NextResponse } from 'next/server'
import { ProviderError } from '@/lib/booking/calcom'
import { getBookingRules } from '@/lib/booking/config'
import { monthAvailability } from '@/lib/booking/service'
import { parseMonthKey } from '@/lib/booking/time'
import { createRateLimiter } from '@/lib/security/rate-limit'
import { clientIp } from '@/lib/security/request'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const limiter = createRateLimiter({ limit: 60, windowMs: 10 * 60 * 1000 })

/**
 * GET ?month=YYYY-MM
 *   200 MonthAvailability
 *   400 { error: 'bad_request' }   404 { error: 'out_of_range' }   429 { error: 'rate_limited' }
 *   502 { error: 'provider_unavailable' }
 */
function json(body: unknown, status: number, headers?: HeadersInit) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } })
}

export async function GET(request: Request) {
  const { allowed, retryAfterSeconds } = limiter.check(clientIp(request.headers))
  if (!allowed) return json({ error: 'rate_limited' }, 429, { 'Retry-After': String(retryAfterSeconds) })

  const month = parseMonthKey(new URL(request.url).searchParams.get('month'))
  if (!month) return json({ error: 'bad_request' }, 400)

  try {
    const result = await monthAvailability(getBookingRules(), month.year, month.month)
    return result ? json(result, 200) : json({ error: 'out_of_range' }, 404)
  } catch (error) {
    console.error('[booking] availability failed:', error instanceof ProviderError ? error.message : 'unknown error')
    return json({ error: 'provider_unavailable' }, 502)
  }
}
