/**
 * Time-zone arithmetic without a date library. Dates are plain `YYYY-MM-DD`
 * strings (a calendar day in a named zone); instants are epoch milliseconds or
 * ISO strings in UTC. Safe to import in the browser and on the server.
 */

export interface ZonedParts {
  year: number
  month: number // 1–12
  day: number
  hour: number
  minute: number
  weekday: number // 0 = Sunday
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const formatters = new Map<string, Intl.DateTimeFormat>()

function partsFormatter(timeZone: string) {
  let f = formatters.get(timeZone)
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      weekday: 'short',
    })
    formatters.set(timeZone, f)
  }
  return f
}

export function isValidTimeZone(timeZone: unknown): timeZone is string {
  if (typeof timeZone !== 'string' || !timeZone || timeZone.length > 64) return false
  try {
    partsFormatter(timeZone)
    return true
  } catch {
    return false
  }
}

/** The wall-clock reading in `timeZone` at `instant`. */
export function zonedParts(instant: number, timeZone: string): ZonedParts {
  const out: Record<string, string> = {}
  for (const p of partsFormatter(timeZone).formatToParts(new Date(instant))) out[p.type] = p.value
  return {
    year: Number(out.year),
    month: Number(out.month),
    day: Number(out.day),
    hour: Number(out.hour) % 24,
    minute: Number(out.minute),
    weekday: WEEKDAYS.indexOf(out.weekday ?? ''),
  }
}

/** Minutes the zone is ahead of UTC at `instant`. */
function offsetMinutes(instant: number, timeZone: string) {
  const p = zonedParts(instant, timeZone)
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute)
  return Math.round((asUtc - Math.floor(instant / 60_000) * 60_000) / 60_000)
}

/** The UTC instant at which the clock in `timeZone` reads the given date and time. */
export function zonedTimeToUtc(date: string, hour: number, minute: number, timeZone: string): number {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number]
  const guess = Date.UTC(y, m - 1, d, hour, minute)
  const first = guess - offsetMinutes(guess, timeZone) * 60_000
  const second = guess - offsetMinutes(first, timeZone) * 60_000
  return second
}

const pad = (n: number) => String(n).padStart(2, '0')

export const toDateKey = (year: number, month: number, day: number) => `${year}-${pad(month)}-${pad(day)}`

/** The calendar day in `timeZone` at `instant`, as YYYY-MM-DD. */
export function dateKeyAt(instant: number, timeZone: string) {
  const p = zonedParts(instant, timeZone)
  return toDateKey(p.year, p.month, p.day)
}

const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/
const MONTH_KEY = /^(\d{4})-(\d{2})$/

export function isDateKey(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const m = DATE_KEY.exec(value)
  if (!m) return false
  const [, y, mo, d] = m.map(Number) as [number, number, number, number]
  const date = new Date(Date.UTC(y, mo - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d
}

export function parseMonthKey(value: unknown): { year: number; month: number } | null {
  if (typeof value !== 'string') return null
  const m = MONTH_KEY.exec(value)
  if (!m) return null
  const year = Number(m[1])
  const month = Number(m[2])
  return month >= 1 && month <= 12 && year >= 2000 && year <= 2200 ? { year, month } : null
}

export const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate()

/** Weekday (0 = Sunday) of a calendar day; independent of time zone. */
export const weekdayOf = (date: string) => new Date(`${date}T12:00:00Z`).getUTCDay()

/** Adds whole days to a YYYY-MM-DD key. */
export function addDays(date: string, days: number) {
  const t = new Date(`${date}T12:00:00Z`)
  t.setUTCDate(t.getUTCDate() + days)
  return toDateKey(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate())
}

/** e.g. "India Standard Time" — falls back to the IANA name. */
export function timeZoneLabel(timeZone: string, locale = 'en-IN') {
  try {
    const part = new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: 'long' })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName')
    return part?.value ?? timeZone
  } catch {
    return timeZone
  }
}

export function formatTime(instant: string | number, timeZone: string, locale = 'en-IN') {
  return new Intl.DateTimeFormat(locale, { timeZone, hour: 'numeric', minute: '2-digit' }).format(new Date(instant))
}

/** A calendar day, e.g. "Friday, 24 October 2026". */
export function formatDate(date: string, locale = 'en-IN') {
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00Z`))
}
