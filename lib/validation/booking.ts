import { isDateKey, isValidTimeZone } from '../booking/time'
import { cleanLine, cleanText } from './contact'

export const projectTypes = ['Branding', 'Digital marketing', 'Website development', 'Other'] as const

export const bookingLimits = {
  name: 100,
  company: 120,
  email: 254,
  phone: 20,
  message: { min: 20, max: 2000 },
} as const

export interface BookingInput {
  name: string
  company: string
  email: string
  phone: string
  projectType: string
  message: string
  /** Preferred day, YYYY-MM-DD in the agency's time zone. */
  date: string
  /** Chosen slot start (UTC ISO), or '' when the calendar offers days only. */
  slot: string
  /** The visitor's own time zone, for the provider's invite. */
  visitorTimeZone: string
}

export type BookingField = Exclude<keyof BookingInput, 'visitorTimeZone'>
export type BookingErrors = Partial<Record<BookingField, string>>
export type BookingValidation = { ok: true; data: BookingInput } | { ok: false; errors: BookingErrors }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
// Country code first: "+" then 7–15 digits, spaces, brackets and dashes allowed.
const PHONE = /^\+[1-9][0-9 ()-]{6,19}$/

/**
 * Validates and normalises a project enquiry with a meeting time. Shared by the
 * browser and the server; whether the date and time are actually free is
 * checked on the server against the configured availability.
 */
export function validateBooking(
  raw: Record<string, unknown>,
  { needsSlot }: { needsSlot: boolean },
): BookingValidation {
  const data: BookingInput = {
    name: cleanLine(raw.name),
    company: cleanLine(raw.company),
    email: cleanLine(raw.email).toLowerCase(),
    phone: cleanLine(raw.phone),
    projectType: cleanLine(raw.projectType),
    message: cleanText(raw.message),
    date: cleanLine(raw.date),
    slot: cleanLine(raw.slot),
    visitorTimeZone: isValidTimeZone(raw.visitorTimeZone) ? raw.visitorTimeZone : '',
  }
  const errors: BookingErrors = {}

  if (!data.name) errors.name = 'Please tell us your name.'
  else if (data.name.length > bookingLimits.name)
    errors.name = `Please keep your name under ${bookingLimits.name} characters.`

  if (!data.company) errors.company = 'Please tell us your business or brand name.'
  else if (data.company.length > bookingLimits.company)
    errors.company = `Please keep this under ${bookingLimits.company} characters.`

  if (!data.email) errors.email = 'Please enter your email address.'
  else if (data.email.length > bookingLimits.email || !EMAIL.test(data.email))
    errors.email = 'Please enter a valid email address, like name@company.com.'

  const digits = data.phone.replace(/\D/g, '')
  if (!data.phone) errors.phone = 'Please enter a phone number, starting with your country code.'
  else if (!PHONE.test(data.phone) || digits.length < 8 || digits.length > 15)
    errors.phone = 'Please include your country code, like +91 98765 43210.'

  if (!data.projectType) errors.projectType = 'Please choose a project type.'
  else if (!(projectTypes as readonly string[]).includes(data.projectType))
    errors.projectType = 'Please choose a project type from the list.'

  if (data.message.length < bookingLimits.message.min)
    errors.message = `Please share a little more about your project (at least ${bookingLimits.message.min} characters).`
  else if (data.message.length > bookingLimits.message.max)
    errors.message = `Please keep this under ${bookingLimits.message.max} characters.`

  if (!isDateKey(data.date)) errors.date = 'Please choose a meeting date.'
  else if (needsSlot && (!data.slot || !Number.isFinite(Date.parse(data.slot))))
    errors.slot = 'Please choose a time for the meeting.'
  if (!needsSlot) data.slot = ''

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data }
}
