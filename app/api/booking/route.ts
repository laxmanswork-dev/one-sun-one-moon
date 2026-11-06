import { NextResponse } from 'next/server'
import { isBookableDate, isOfficeHourSlot } from '@/lib/booking/availability'
import { calcomBook, ProviderError } from '@/lib/booking/calcom'
import { getBookingRules, getCalcomConfig } from '@/lib/booking/config'
import { isLiveSlotFree } from '@/lib/booking/service'
import { dateKeyAt, formatDate, formatTime, timeZoneLabel } from '@/lib/booking/time'
import { getMailConfig, sendBookingEnquiry } from '@/lib/mail/send-enquiry'
import { createRateLimiter } from '@/lib/security/rate-limit'
import { clientIp, filledByHuman, isAllowedOrigin } from '@/lib/security/request'
import { site } from '@/lib/site'
import { validateBooking } from '@/lib/validation/booking'

export const runtime = 'nodejs'

const MAX_BODY_BYTES = 16 * 1024
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 })

/**
 * Response contract (`error` codes are mapped to messages in ProjectBooking):
 *   200 { ok: true, mode: 'live', confirmed, start, end }      — the provider created the booking
 *   200 { ok: true, mode: 'request', start } | { ok: true, mode: 'date', date }
 *                                                              — enquiry delivered; the time is only requested
 *   400 { error: 'invalid', fields } | { error: 'bad_request' } | { error: 'too_fast' }
 *   403 { error: 'forbidden' }   409 { error: 'slot_unavailable' }   413 { error: 'too_large' }
 *   429 { error: 'rate_limited' }   503 { error: 'not_configured' }
 *   502 { error: 'delivery_failed' } | { error: 'booking_failed' }
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

  // Honeypot: a quiet success for bots, nothing booked or sent.
  if (typeof body.website === 'string' && body.website.trim() !== '') return json({ ok: true, mode: 'date' }, 200)
  if (!filledByHuman(body.startedAt)) return json({ error: 'too_fast' }, 400)

  const rules = getBookingRules()
  const result = validateBooking(body, { needsSlot: rules.mode !== 'date' })
  if (!result.ok) return json({ error: 'invalid', fields: result.errors }, 400)
  const data = result.data
  const now = Date.now()
  const zone = `${timeZoneLabel(rules.timeZone)} (${rules.timeZone})`
  const mail = getMailConfig()

  // Preferred day only.
  if (rules.mode === 'date') {
    if (!isBookableDate(rules, data.date, now)) return json({ error: 'slot_unavailable' }, 409)
    if (!mail) return json({ error: 'not_configured' }, 503)
    try {
      await sendBookingEnquiry(mail, {
        data,
        meetingTime: `${formatDate(data.date)} — no time chosen`,
        meetingStatus: 'Preferred day only — not booked. Reply to arrange a time.',
      })
    } catch (error) {
      console.error('[booking] delivery failed:', error instanceof Error ? error.message : 'unknown error')
      return json({ error: 'delivery_failed' }, 502)
    }
    return json({ ok: true, mode: 'date', date: data.date }, 200)
  }

  // A slot must fall on the chosen day, in the agency's zone.
  if (dateKeyAt(Date.parse(data.slot), rules.timeZone) !== data.date) return json({ error: 'slot_unavailable' }, 409)
  const slot = new Date(Date.parse(data.slot)).toISOString()
  const meetingTime = `${formatDate(data.date)}, ${formatTime(slot, rules.timeZone)} ${zone}`

  // Office hours: the time is requested, never confirmed.
  if (rules.mode === 'request') {
    if (!isOfficeHourSlot(rules, slot, now)) return json({ error: 'slot_unavailable' }, 409)
    if (!mail) return json({ error: 'not_configured' }, 503)
    try {
      await sendBookingEnquiry(mail, {
        data,
        meetingTime,
        meetingStatus: 'Requested by the visitor — NOT yet confirmed. Reply to confirm or propose another time.',
      })
    } catch (error) {
      console.error('[booking] delivery failed:', error instanceof Error ? error.message : 'unknown error')
      return json({ error: 'delivery_failed' }, 502)
    }
    return json({ ok: true, mode: 'request', start: slot }, 200)
  }

  // Live: check the slot is still free, then book it with the provider.
  const calcom = getCalcomConfig()
  if (!calcom) return json({ error: 'not_configured' }, 503)
  try {
    if (!(await isLiveSlotFree(rules, slot, now))) return json({ error: 'slot_unavailable' }, 409)
    const booking = await calcomBook(calcom, {
      start: slot,
      name: data.name,
      email: data.email,
      phone: data.phone,
      timeZone: data.visitorTimeZone || rules.timeZone,
      notes: `${data.projectType} — ${data.company}\n\n${data.message}`,
      metadata: { company: data.company, projectType: data.projectType, source: 'brand-journey' },
    })
    // Event types that need the host's approval come back pending, not accepted.
    const confirmed = booking.status?.toLowerCase() === 'accepted'
    if (mail) {
      // The provider already notified everyone; this copy of the brief is a courtesy and may fail quietly.
      await sendBookingEnquiry(mail, {
        data,
        meetingTime,
        meetingStatus: confirmed ? 'Booked in Cal.com' : 'Booked in Cal.com — awaiting your confirmation',
      }).catch(() => console.error('[booking] courtesy email failed'))
    }
    return json({ ok: true, mode: 'live', confirmed, start: booking.start, end: booking.end }, 200)
  } catch (error) {
    console.error('[booking] provider failed:', error instanceof ProviderError ? error.message : 'unknown error')
    return json({ error: 'booking_failed' }, 502)
  }
}

export function GET() {
  return json({ error: 'method_not_allowed' }, 405, { Allow: 'POST' })
}
