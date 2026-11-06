import 'server-only'
import type { CalcomConfig } from './config'

/**
 * Cal.com API v2 adapter — the live scheduling provider.
 *   GET  /v2/slots     (cal-api-version 2024-09-04)
 *   POST /v2/bookings  (cal-api-version 2026-02-25)
 * Cal.com sends its own confirmation and calendar invite to both sides.
 */
const API = 'https://api.cal.com/v2'

export class ProviderError extends Error {}

function headers(config: CalcomConfig, version: string) {
  return {
    Authorization: `Bearer ${config.apiKey}`,
    'cal-api-version': version,
    'Content-Type': 'application/json',
  }
}

/** Free slot start times (UTC ISO) per day, for days start..end (YYYY-MM-DD, inclusive) in `timeZone`. */
export async function calcomSlots(config: CalcomConfig, start: string, end: string, timeZone: string) {
  const query = new URLSearchParams({ eventTypeId: String(config.eventTypeId), start, end, timeZone })
  const res = await fetch(`${API}/slots?${query}`, {
    headers: headers(config, '2024-09-04'),
    signal: AbortSignal.timeout(10_000),
    cache: 'no-store',
  })
  if (!res.ok) throw new ProviderError(`Cal.com slots responded ${res.status}`)
  const body = (await res.json()) as { status?: string; data?: Record<string, { start?: string }[]> }
  if (body.status !== 'success' || !body.data || typeof body.data !== 'object')
    throw new ProviderError('Cal.com slots: unexpected response')

  const days: Record<string, string[]> = {}
  for (const [date, slots] of Object.entries(body.data)) {
    if (!Array.isArray(slots)) continue
    const starts = slots
      .map((s) => (typeof s?.start === 'string' ? Date.parse(s.start) : NaN))
      .filter(Number.isFinite)
      .map((t) => new Date(t).toISOString())
    if (starts.length) days[date] = starts
  }
  return days
}

export interface CalcomBookingInput {
  start: string
  name: string
  email: string
  phone: string
  timeZone: string
  notes: string
  metadata: Record<string, string>
}

/** Creates the booking. Resolves only when Cal.com confirms it was created. */
export async function calcomBook(config: CalcomConfig, input: CalcomBookingInput) {
  const res = await fetch(`${API}/bookings`, {
    method: 'POST',
    headers: headers(config, '2026-02-25'),
    body: JSON.stringify({
      start: input.start,
      eventTypeId: config.eventTypeId,
      attendee: { name: input.name, email: input.email, phoneNumber: input.phone, timeZone: input.timeZone },
      bookingFieldsResponses: { notes: input.notes },
      // Metadata values are capped at 500 characters by Cal.com.
      metadata: Object.fromEntries(Object.entries(input.metadata).map(([k, v]) => [k.slice(0, 40), v.slice(0, 500)])),
    }),
    signal: AbortSignal.timeout(15_000),
    cache: 'no-store',
  })
  if (!res.ok) throw new ProviderError(`Cal.com booking responded ${res.status}`)
  const body = (await res.json()) as {
    status?: string
    data?: { uid?: string; start?: string; end?: string; status?: string }
  }
  const booking = body.data
  if (body.status !== 'success' || !booking || typeof booking.start !== 'string')
    throw new ProviderError('Cal.com booking: unexpected response')
  return { uid: booking.uid ?? null, start: booking.start, end: booking.end ?? null, status: booking.status ?? null }
}
