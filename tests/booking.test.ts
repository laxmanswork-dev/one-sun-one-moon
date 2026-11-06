import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  bookableRange,
  isOfficeHourSlot,
  officeHourSlots,
  parseDays,
  parseWindows,
  type BookingRules,
} from '@/lib/booking/availability'
import { addDays, dateKeyAt, isDateKey, zonedTimeToUtc } from '@/lib/booking/time'
import { validateBooking } from '@/lib/validation/booking'

const IST = 'Asia/Kolkata'
// Friday 23 October 2026, 10:00 IST.
const NOW = Date.parse('2026-10-23T04:30:00Z')

const rules: BookingRules = {
  mode: 'request',
  timeZone: IST,
  leadHours: 24,
  horizonDays: 30,
  hours: { days: [1, 2, 3, 4, 5], windows: [{ start: 10 * 60, end: 12 * 60 }], slotMinutes: 30 },
}

describe('time-zone arithmetic', () => {
  it('converts wall-clock time in a zone to UTC, including across DST', () => {
    expect(new Date(zonedTimeToUtc('2026-10-24', 10, 0, IST)).toISOString()).toBe('2026-10-24T04:30:00.000Z')
    // New York: EDT (UTC-4) before 1 Nov 2026, EST (UTC-5) after.
    expect(new Date(zonedTimeToUtc('2026-10-30', 9, 0, 'America/New_York')).toISOString()).toBe(
      '2026-10-30T13:00:00.000Z',
    )
    expect(new Date(zonedTimeToUtc('2026-11-02', 9, 0, 'America/New_York')).toISOString()).toBe(
      '2026-11-02T14:00:00.000Z',
    )
  })

  it('reads calendar days in a zone and validates date keys', () => {
    expect(dateKeyAt(Date.parse('2026-10-23T20:00:00Z'), IST)).toBe('2026-10-24')
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(isDateKey('2026-02-29')).toBe(false)
    expect(isDateKey('2028-02-29')).toBe(true)
  })
})

describe('office hours', () => {
  it('parses days and windows, rejecting anything unreadable', () => {
    expect(parseDays('mon-fri')).toEqual([1, 2, 3, 4, 5])
    expect(parseDays('sat, sun')).toEqual([0, 6])
    expect(parseDays('fri-mon')).toEqual([0, 1, 5, 6])
    expect(parseDays('someday')).toBeNull()
    expect(parseWindows('10:00-13:00, 14:00-18:30')).toEqual([
      { start: 600, end: 780 },
      { start: 840, end: 1110 },
    ])
    expect(parseWindows('18:00-10:00')).toBeNull()
    expect(parseWindows('ten to six')).toBeNull()
  })

  it('offers only configured weekdays, after the lead time and within the horizon', () => {
    const days = officeHourSlots(rules, 2026, 10, NOW)
    // Friday 23rd is inside the 24-hour lead time; 24–25 are the weekend.
    expect(days['2026-10-23']).toBeUndefined()
    expect(days['2026-10-24']).toBeUndefined()
    expect(days['2026-10-25']).toBeUndefined()
    expect(days['2026-10-26']).toEqual([
      '2026-10-26T04:30:00.000Z',
      '2026-10-26T05:00:00.000Z',
      '2026-10-26T05:30:00.000Z',
      '2026-10-26T06:00:00.000Z',
    ])
    const { lastDate } = bookableRange(rules, NOW)
    expect(lastDate).toBe('2026-11-22')
    expect(Object.keys(officeHourSlots(rules, 2026, 11, NOW)).every((d) => d <= lastDate)).toBe(true)
  })

  it('recognises only real, still-bookable slots', () => {
    expect(isOfficeHourSlot(rules, '2026-10-26T04:30:00.000Z', NOW)).toBe(true)
    expect(isOfficeHourSlot(rules, '2026-10-26T04:45:00.000Z', NOW)).toBe(false) // off the grid
    expect(isOfficeHourSlot(rules, '2026-10-26T08:30:00.000Z', NOW)).toBe(false) // 14:00, outside hours
    expect(isOfficeHourSlot(rules, '2026-10-22T04:30:00.000Z', NOW)).toBe(false) // past
    expect(isOfficeHourSlot(rules, 'nonsense', NOW)).toBe(false)
  })
})

describe('booking validation', () => {
  const valid = {
    name: 'Asha Kumar',
    company: 'Kanyakumari Tours',
    email: 'Asha@Example.com ',
    phone: '+91 98765 43210',
    projectType: 'Branding',
    message: 'We are launching a new travel brand and need an identity.',
    date: '2026-10-26',
    slot: '2026-10-26T04:30:00.000Z',
    visitorTimeZone: 'Europe/London',
  }

  it('accepts and normalises a complete enquiry', () => {
    const result = validateBooking(valid, { needsSlot: true })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.email).toBe('asha@example.com')
  })

  it('requires a country code, a known project type, a date and (when slots exist) a time', () => {
    const result = validateBooking(
      { ...valid, phone: '98765 43210', projectType: 'Logo', date: '', slot: '' },
      { needsSlot: true },
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(['date', 'phone', 'projectType'])
    const noSlot = validateBooking({ ...valid, slot: '' }, { needsSlot: true })
    expect(!noSlot.ok && noSlot.errors.slot).toBeTruthy()
  })

  it('drops the slot and ignores an unknown visitor zone when only a day is asked for', () => {
    const result = validateBooking({ ...valid, visitorTimeZone: 'Mars/Olympus' }, { needsSlot: false })
    expect(result.ok && result.data.slot).toBe('')
    expect(result.ok && result.data.visitorTimeZone).toBe('')
  })
})

// ---- API ----------------------------------------------------------------------

const enquiry = {
  name: 'Asha Kumar',
  company: 'Kanyakumari Tours',
  email: 'asha@example.com',
  phone: '+91 98765 43210',
  projectType: 'Website development',
  message: 'We are launching a new travel brand and need a website.',
  visitorTimeZone: 'Asia/Kolkata',
}

function post(body: unknown) {
  return new Request('https://onesunonemoon.in/api/booking', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://onesunonemoon.in',
      host: 'onesunonemoon.in',
      'x-forwarded-for': `203.0.113.${Math.floor(Math.random() * 250)}`,
    },
    body: JSON.stringify(body),
  })
}
const fresh = (extra: Record<string, unknown>) => ({ ...enquiry, ...extra, startedAt: Date.now() - 10_000 })

const ENV = [
  'RESEND_API_KEY',
  'CONTACT_TO_EMAIL',
  'CONTACT_FROM_EMAIL',
  'CALCOM_API_KEY',
  'CALCOM_EVENT_TYPE_ID',
  'BOOKING_HOURS',
  'BOOKING_DAYS',
  'BOOKING_TIMEZONE',
  'BOOKING_LEAD_HOURS',
  'BOOKING_SLOT_MINUTES',
  'BOOKING_HORIZON_DAYS',
]
function mailOn() {
  process.env.RESEND_API_KEY = 're_test'
  process.env.CONTACT_TO_EMAIL = 'inbox@example.com'
  process.env.CONTACT_FROM_EMAIL = 'site@example.com'
}

async function load() {
  vi.resetModules()
  return {
    booking: await import('@/app/api/booking/route'),
    availability: await import('@/app/api/booking/availability/route'),
  }
}

describe('booking API', () => {
  beforeEach(() => {
    for (const key of ENV) delete process.env[key]
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('with nothing configured, offers days without times and never reports success', async () => {
    const { booking, availability } = await load()
    const month = await availability.GET(new Request('https://onesunonemoon.in/api/booking/availability?month=2026-10'))
    expect(month.status).toBe(200)
    const body = await month.json()
    expect(body.mode).toBe('date')
    expect(body.days).toBeUndefined()
    expect(body.firstDate).toBe('2026-10-24')

    const res = await booking.POST(post(fresh({ date: '2026-10-27' })))
    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ error: 'not_configured' })
  })

  it('rejects past dates in day-only mode', async () => {
    mailOn()
    vi.stubGlobal('fetch', vi.fn())
    const { booking } = await load()
    expect((await booking.POST(post(fresh({ date: '2026-10-20' })))).status).toBe(409)
  })

  it('with office hours set, emails a requested (unconfirmed) time and refuses times outside the hours', async () => {
    mailOn()
    process.env.BOOKING_HOURS = '10:00-12:00'
    const fetchSpy = vi.fn().mockResolvedValue(new Response('{"id":"1"}', { status: 200 }))
    vi.stubGlobal('fetch', fetchSpy)
    const { booking, availability } = await load()

    const month = await (
      await availability.GET(new Request('https://onesunonemoon.in/api/booking/availability?month=2026-10'))
    ).json()
    expect(month.mode).toBe('request')
    expect(month.days['2026-10-26']).toHaveLength(4)

    const outside = await booking.POST(post(fresh({ date: '2026-10-26', slot: '2026-10-26T09:30:00.000Z' })))
    expect(outside.status).toBe(409)
    const wrongDay = await booking.POST(post(fresh({ date: '2026-10-27', slot: '2026-10-26T04:30:00.000Z' })))
    expect(wrongDay.status).toBe(409)
    expect(fetchSpy).not.toHaveBeenCalled()

    const res = await booking.POST(post(fresh({ date: '2026-10-26', slot: '2026-10-26T04:30:00.000Z' })))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, mode: 'request', start: '2026-10-26T04:30:00.000Z' })
    const payload = JSON.parse(fetchSpy.mock.calls[0]![1].body)
    expect(payload.text).toContain('NOT yet confirmed')
    expect(payload.text).toContain('10:00')
    expect(payload.reply_to).toBe('asha@example.com')
  })

  it('reports delivery_failed when the enquiry email cannot be sent', async () => {
    mailOn()
    process.env.BOOKING_HOURS = '10:00-12:00'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 500 })))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { booking } = await load()
    const res = await booking.POST(post(fresh({ date: '2026-10-26', slot: '2026-10-26T04:30:00.000Z' })))
    expect(res.status).toBe(502)
    expect(await res.json()).toEqual({ error: 'delivery_failed' })
  })

  describe('with Cal.com connected', () => {
    beforeEach(() => {
      process.env.CALCOM_API_KEY = 'cal_test'
      process.env.CALCOM_EVENT_TYPE_ID = '42'
    })

    const slotsResponse = () =>
      new Response(
        JSON.stringify({
          status: 'success',
          data: {
            '2026-10-26': [{ start: '2026-10-26T10:00:00.000+05:30' }, { start: '2026-10-26T11:00:00.000+05:30' }],
          },
        }),
        { status: 200 },
      )

    it('lists the provider’s free slots for the month', async () => {
      const fetchSpy = vi.fn().mockResolvedValue(slotsResponse())
      vi.stubGlobal('fetch', fetchSpy)
      const { availability } = await load()
      const body = await (
        await availability.GET(new Request('https://onesunonemoon.in/api/booking/availability?month=2026-10'))
      ).json()
      expect(body.mode).toBe('live')
      expect(body.days).toEqual({ '2026-10-26': ['2026-10-26T04:30:00.000Z', '2026-10-26T05:30:00.000Z'] })
      const [url, init] = fetchSpy.mock.calls[0]!
      expect(String(url)).toContain('https://api.cal.com/v2/slots?eventTypeId=42')
      expect(init.headers['cal-api-version']).toBe('2024-09-04')
      expect(init.headers.Authorization).toBe('Bearer cal_test')
    })

    it('books a free slot and reports it confirmed only when Cal.com accepts it', async () => {
      const fetchSpy = vi
        .fn()
        .mockResolvedValueOnce(slotsResponse())
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              status: 'success',
              data: {
                uid: 'abc',
                status: 'accepted',
                start: '2026-10-26T04:30:00.000Z',
                end: '2026-10-26T05:00:00.000Z',
              },
            }),
            { status: 201 },
          ),
        )
      vi.stubGlobal('fetch', fetchSpy)
      const { booking } = await load()
      const res = await booking.POST(post(fresh({ date: '2026-10-26', slot: '2026-10-26T04:30:00.000Z' })))
      expect(res.status).toBe(200)
      expect(await res.json()).toEqual({
        ok: true,
        mode: 'live',
        confirmed: true,
        start: '2026-10-26T04:30:00.000Z',
        end: '2026-10-26T05:00:00.000Z',
      })
      const [url, init] = fetchSpy.mock.calls[1]!
      expect(url).toBe('https://api.cal.com/v2/bookings')
      expect(init.headers['cal-api-version']).toBe('2026-02-25')
      const sent = JSON.parse(init.body)
      expect(sent).toMatchObject({
        start: '2026-10-26T04:30:00.000Z',
        eventTypeId: 42,
        attendee: { name: 'Asha Kumar', email: 'asha@example.com', phoneNumber: '+91 98765 43210' },
      })
    })

    it('refuses a slot the provider no longer lists, without booking', async () => {
      const fetchSpy = vi.fn().mockResolvedValue(slotsResponse())
      vi.stubGlobal('fetch', fetchSpy)
      const { booking } = await load()
      const res = await booking.POST(post(fresh({ date: '2026-10-26', slot: '2026-10-26T06:30:00.000Z' })))
      expect(res.status).toBe(409)
      expect(fetchSpy).toHaveBeenCalledTimes(1)
    })

    it('reports booking_failed (never success) when Cal.com errors', async () => {
      vi.stubGlobal(
        'fetch',
        vi
          .fn()
          .mockResolvedValueOnce(slotsResponse())
          .mockResolvedValueOnce(new Response('{"status":"error"}', { status: 400 })),
      )
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const { booking } = await load()
      const res = await booking.POST(post(fresh({ date: '2026-10-26', slot: '2026-10-26T04:30:00.000Z' })))
      expect(res.status).toBe(502)
      expect(await res.json()).toEqual({ error: 'booking_failed' })
    })
  })
})
