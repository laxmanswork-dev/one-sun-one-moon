import 'server-only'
import { parseDays, parseWindows, type BookingRules } from './availability'
import { isValidTimeZone } from './time'

export interface CalcomConfig {
  apiKey: string
  eventTypeId: number
}

const DEFAULT_TIME_ZONE = 'Asia/Kolkata'

const env = (name: string) => process.env[name]?.trim() || undefined

function intEnv(name: string, fallback: number, min: number, max: number) {
  const n = Number(env(name))
  return Number.isInteger(n) && n >= min && n <= max ? n : fallback
}

/** Cal.com credentials, or null unless both are set. */
export function getCalcomConfig(): CalcomConfig | null {
  const apiKey = env('CALCOM_API_KEY')
  const eventTypeId = Number(env('CALCOM_EVENT_TYPE_ID'))
  return apiKey && Number.isInteger(eventTypeId) && eventTypeId > 0 ? { apiKey, eventTypeId } : null
}

/**
 * Booking rules from the environment. Office hours are only ever the ones the
 * agency configured: with none set (and no provider) the calendar offers dates
 * without times rather than inventing availability.
 */
export function getBookingRules(): BookingRules {
  const tz = env('BOOKING_TIMEZONE')
  const timeZone = tz && isValidTimeZone(tz) ? tz : DEFAULT_TIME_ZONE
  const leadHours = intEnv('BOOKING_LEAD_HOURS', 24, 0, 24 * 30)
  const horizonDays = intEnv('BOOKING_HORIZON_DAYS', 60, 1, 365)

  if (getCalcomConfig()) return { mode: 'live', timeZone, leadHours, horizonDays, hours: null }

  const windows = env('BOOKING_HOURS') ? parseWindows(env('BOOKING_HOURS')!) : null
  if (windows) {
    const days = parseDays(env('BOOKING_DAYS') ?? 'mon-fri') ?? [1, 2, 3, 4, 5]
    const slotMinutes = intEnv('BOOKING_SLOT_MINUTES', 30, 10, 240)
    return { mode: 'request', timeZone, leadHours, horizonDays, hours: { days, windows, slotMinutes } }
  }
  return { mode: 'date', timeZone, leadHours, horizonDays, hours: null }
}
