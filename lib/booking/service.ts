import 'server-only'
import { bookableRange, officeHourSlots, type BookingRules, type MonthAvailability } from './availability'
import { calcomSlots } from './calcom'
import { getCalcomConfig } from './config'
import { addDays, daysInMonth, toDateKey, dateKeyAt } from './time'

/** Live slots from the provider for days first..last, regrouped by the agency's calendar day. */
async function liveSlots(rules: BookingRules, first: string, last: string, now: number) {
  const config = getCalcomConfig()
  if (!config) return {}
  // Ask for a day either side so no slot is lost to time-zone edges, then keep only first..last.
  const raw = await calcomSlots(config, addDays(first, -1), addDays(last, 1), rules.timeZone)
  const earliest = now + rules.leadHours * 3_600_000
  const days: Record<string, string[]> = {}
  for (const slot of Object.values(raw).flat()) {
    const instant = Date.parse(slot)
    const date = dateKeyAt(instant, rules.timeZone)
    if (date < first || date > last || instant < earliest) continue
    ;(days[date] ??= []).push(slot)
  }
  for (const list of Object.values(days)) list.sort()
  return days
}

/**
 * The calendar data for one month, or null for a month past the booking horizon (or in the past).
 * A month with no bookable days still returns the range, so the calendar can move to the first open day.
 */
export async function monthAvailability(
  rules: BookingRules,
  year: number,
  month: number,
  now = Date.now(),
): Promise<MonthAvailability | null> {
  const { firstDate, lastDate } = bookableRange(rules, now)
  const monthFirst = toDateKey(year, month, 1)
  const monthLast = toDateKey(year, month, daysInMonth(year, month))
  if (monthFirst > lastDate || monthLast < dateKeyAt(now, rules.timeZone)) return null

  const base = { mode: rules.mode, timeZone: rules.timeZone, firstDate, lastDate }
  if (rules.mode === 'date') return base
  if (rules.mode === 'request') return { ...base, days: officeHourSlots(rules, year, month, now) }
  const from = monthFirst < firstDate ? firstDate : monthFirst
  const to = monthLast > lastDate ? lastDate : monthLast
  return { ...base, days: from > to ? {} : await liveSlots(rules, from, to, now) }
}

/** True when the provider still lists `slot` as free. */
export async function isLiveSlotFree(rules: BookingRules, slot: string, now = Date.now()) {
  const instant = Date.parse(slot)
  const date = dateKeyAt(instant, rules.timeZone)
  const days = await liveSlots(rules, date, date, now)
  return (days[date] ?? []).some((s) => Date.parse(s) === instant)
}
