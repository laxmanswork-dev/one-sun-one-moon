import { NextResponse } from 'next/server'
import { getMailConfig, sendEnquiry } from '@/lib/mail/send-enquiry'
import { createRateLimiter } from '@/lib/security/rate-limit'
import { clientIp, filledByHuman, isAllowedOrigin } from '@/lib/security/request'
import { site } from '@/lib/site'
import { validateContact } from '@/lib/validation/contact'

export const runtime = 'nodejs'

const MAX_BODY_BYTES = 16 * 1024
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 })

/**
 * Response contract (`error` codes are mapped to messages in ContactForm):
 *   200 { ok: true }
 *   400 { error: 'invalid', fields } | { error: 'bad_request' } | { error: 'too_fast' }
 *   403 { error: 'forbidden' }   413 { error: 'too_large' }   429 { error: 'rate_limited' }
 *   503 { error: 'not_configured' }   502 { error: 'delivery_failed' }
 */
function json(body: Record<string, unknown>, status: number, headers?: HeadersInit) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } })
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request.headers, [site.url, site.url.replace('://', '://www.')])) {
    return json({ error: 'forbidden' }, 403)
  }

  const { allowed, retryAfterSeconds } = limiter.check(clientIp(request.headers))
  if (!allowed) return json({ error: 'rate_limited' }, 429, { 'Retry-After': String(retryAfterSeconds) })

  if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: 'bad_request' }, 400)
  const declared = Number(request.headers.get('content-length') ?? 0)
  if (declared > MAX_BODY_BYTES) return json({ error: 'too_large' }, 413)

  let body: Record<string, unknown>
  try {
    const raw = await request.text()
    if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return json({ error: 'too_large' }, 413)
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return json({ error: 'bad_request' }, 400)
    body = parsed as Record<string, unknown>
  } catch {
    return json({ error: 'bad_request' }, 400)
  }

  // Honeypot: real visitors never see or fill this field. Bots get a quiet
  // success so they don't learn to avoid it; nothing is sent.
  if (typeof body.website === 'string' && body.website.trim() !== '') return json({ ok: true }, 200)
  if (!filledByHuman(body.startedAt)) return json({ error: 'too_fast' }, 400)

  const result = validateContact(body)
  if (!result.ok) return json({ error: 'invalid', fields: result.errors }, 400)

  const config = getMailConfig()
  if (!config) return json({ error: 'not_configured' }, 503)

  try {
    await sendEnquiry(config, result.data)
  } catch (error) {
    // Log the failure, never the visitor's details or the API key.
    console.error('[contact] delivery failed:', error instanceof Error ? error.message : 'unknown error')
    return json({ error: 'delivery_failed' }, 502)
  }
  return json({ ok: true }, 200)
}

export function GET() {
  return json({ error: 'method_not_allowed' }, 405, { Allow: 'POST' })
}
