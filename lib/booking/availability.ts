import { addDays, dateKeyAt, daysInMonth, toDateKey, weekdayOf, zonedTimeToUtc } from './time'

/**
 * How the enquiry calendar works, from the most to the least capable:
 *
 *   live      a scheduling provider (Cal.com) supplies real free slots and
 *             creates the booking — only this mode ever confirms a meeting.
 *   request   slots come from the office hours configured in the environment;
 *             the chosen time is sent with the enquiry as a *request*.
 *   date      nothing configured: the visitor picks a preferred day only.
 */
export type BookingMode = 'live' | 'request' | 'date'

/** A window of office hours, minutes after midnight. */
export interface HoursWindow {
  start: number
  end: number
}

export interface OfficeHours {
  /** Weekdays that take meetings, 0 = Sunday. */
  days: number[]
  windows: HoursWindow[]
  slotMinutes: number
}

export interface BookingRules {
  mode: BookingMode
  timeZone: string
  /** Earliest bookable time, in hours from now. */
  leadHours: number
  /** How far ahead visitors may book, in days. */
  horizonDays: number
  hours: OfficeHours | null
}

/** What the browser needs to draw the calendar; returned by GET /api/booking/availability. */
export interface MonthAvailability {
  mode: BookingMode
  timeZone: string
  /** First and last bookable days (inclusive). */
  firstDate: string
  lastDate: string
  /** Free slot start times (UTC ISO) per day. Absent in `date` mode, which has no slots. */
  days?: Record<string, string[]>
}

export function bookableRange(rules: Pick<BookingRules, 'timeZone' | 'leadHours' | 'horizonDays'>, now: number) {
  const firstDate = dateKeyAt(now + rules.leadHours * 3_600_000, rules.timeZone)
  const lastDate = addDays(dateKeyAt(now, rules.timeZone), rules.horizonDays)
  return { firstDate, lastDate }
}

/** Office-hour slots for every day of a month, minus anything inside the lead time or past the horizon. */
export function officeHourSlots(rules: BookingRules, year: number, month: number, now: number) {
  const days: Record<string, string[]> = {}
  const hours = rules.hours
  if (!hours) return days
  const { firstDate, lastDate } = bookableRange(rules, now)
  const earliest = now + rules.leadHours * 3_600_000

  for (let d = 1; d <= daysInMonth(year, month); d++) {
    const date = toDateKey(year, month, d)
    if (date < firstDate || date > lastDate || !hours.days.includes(weekdayOf(date))) continue
    const slots: string[] = []
    for (const w of hours.windows) {
      for (let m = w.start; m + hours.slotMinutes <= w.end; m += hours.slotMinutes) {
        const instant = zonedTimeToUtc(date, Math.floor(m / 60), m % 60, rules.timeZone)
        if (instant >= earliest) slots.push(new Date(instant).toISOString())
      }
    }
    if (slots.length) days[date] = slots
  }
  return days
}

/** True when `slot` is one of the configured office-hour slots and still bookable. */
export function isOfficeHourSlot(rules: BookingRules, slot: string, now: number) {
  const instant = Date.parse(slot)
  if (!Number.isFinite(instant)) return false
  const date = dateKeyAt(instant, rules.timeZone)
  const [y, m] = date.split('-').map(Number) as [number, number]
  return (officeHourSlots(rules, y, m, now)[date] ?? []).some((s) => Date.parse(s) === instant)
}

/** True when `date` is inside the bookable range (used by `date` mode). */
export function isBookableDate(rules: BookingRules, date: string, now: number) {
  const { firstDate, lastDate } = bookableRange(rules, now)
  return date >= firstDate && date <= lastDate
}

const DAY_NAMES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

/** Parses "mon,tue,wed" or "mon-fri" into weekday numbers. Returns null if anything is unreadable. */
export function parseDays(value: string): number[] | null {
  const out = new Set<number>()
  for (const part of value
    .toLowerCase()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)) {
    const [a, b] = part.split('-').map((s) => DAY_NAMES.indexOf(s.trim().slice(0, 3)))
    if (a === undefined || a < 0 || (b !== undefined && b < 0)) return null
    if (b === undefined) out.add(a)
    else
      for (let i = a; ; i = (i + 1) % 7) {
        out.add(i)
        if (i === b) break
      }
  }
  return out.size ? [...out].sort() : null
}

/** Parses "10:00-13:00,14:00-18:00" into minute windows. Returns null if anything is unreadable. */
export function parseWindows(value: string): HoursWindow[] | null {
  const windows: HoursWindow[] = []
  for (const part of value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)) {
    const m = /^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/.exec(part)
    if (!m) return null
    const start = Number(m[1]) * 60 + Number(m[2])
    const end = Number(m[3]) * 60 + Number(m[4])
    if (Number(m[2]) > 59 || Number(m[4]) > 59 || end > 24 * 60 || end <= start) return null
    windows.push({ start, end })
  }
  return windows.length ? windows.sort((a, b) => a.start - b.start) : null
}
