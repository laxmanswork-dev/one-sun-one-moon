import { serviceOptions } from '../services'

export const budgetOptions = [
  'Under ₹50,000',
  '₹50,000 – ₹1,50,000',
  '₹1,50,000 – ₹5,00,000',
  'Above ₹5,00,000',
  'Not sure yet',
] as const

export const serviceChoices = [...serviceOptions, 'Something else'] as const

export const limits = {
  name: 100,
  email: 254,
  phone: 20,
  company: 120,
  message: { min: 20, max: 4000 },
} as const

export interface ContactInput {
  name: string
  email: string
  phone: string
  company: string
  service: string
  budget: string
  message: string
}

export type ContactField = keyof ContactInput
export type ContactErrors = Partial<Record<ContactField, string>>

export type ValidationResult = { ok: true; data: ContactInput } | { ok: false; errors: ContactErrors }

// Pragmatic address check: one @, a dot in the domain, no whitespace.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE = /^\+?[0-9 ()-]{7,20}$/

/** Collapse whitespace, strip control characters, trim. */
export function cleanLine(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
    .normalize('NFC')
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Like cleanLine but keeps line breaks (max two in a row). */
export function cleanText(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f]+/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Validates and normalises an enquiry. Used on the server (authoritative) and
 * in the browser (for immediate feedback) so the rules can never drift.
 */
export function validateContact(raw: Record<string, unknown>): ValidationResult {
  const data: ContactInput = {
    name: cleanLine(raw.name),
    email: cleanLine(raw.email).toLowerCase(),
    phone: cleanLine(raw.phone),
    company: cleanLine(raw.company),
    service: cleanLine(raw.service),
    budget: cleanLine(raw.budget),
    message: cleanText(raw.message),
  }
  const errors: ContactErrors = {}

  if (!data.name) errors.name = 'Please tell us your name.'
  else if (data.name.length > limits.name) errors.name = `Please keep your name under ${limits.name} characters.`

  if (!data.email) errors.email = 'Please enter your email address.'
  else if (data.email.length > limits.email || !EMAIL.test(data.email))
    errors.email = 'Please enter a valid email address, like name@company.com.'

  if (data.phone && !PHONE.test(data.phone)) errors.phone = 'Please enter a valid phone number, or leave it blank.'

  if (data.company.length > limits.company) errors.company = `Please keep this under ${limits.company} characters.`

  if (!data.service) errors.service = 'Please choose the service you are interested in.'
  else if (!(serviceChoices as readonly string[]).includes(data.service))
    errors.service = 'Please choose a service from the list.'

  if (data.budget && !(budgetOptions as readonly string[]).includes(data.budget))
    errors.budget = 'Please choose a budget from the list.'

  if (data.message.length < limits.message.min)
    errors.message = `Please share a little more about your project (at least ${limits.message.min} characters).`
  else if (data.message.length > limits.message.max)
    errors.message = `Please keep your message under ${limits.message.max} characters.`

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data }
}
