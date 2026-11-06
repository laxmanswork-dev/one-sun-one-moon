import 'server-only'
import type { BookingInput } from '../validation/booking'
import type { ContactInput } from '../validation/contact'

export interface MailConfig {
  apiKey: string
  to: string
  from: string
}

/** Resend configuration from the environment, or null when any part is missing. */
export function getMailConfig(): MailConfig | null {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const to = process.env.CONTACT_TO_EMAIL?.trim()
  const from = process.env.CONTACT_FROM_EMAIL?.trim()
  return apiKey && to && from ? { apiKey, to, from } : null
}

export function formatEnquiry(data: ContactInput) {
  const subject = `New enquiry: ${data.service} — ${data.company || data.name}`.slice(0, 180)
  // Plain text only: user input is never interpreted as HTML.
  const text = [
    'New project enquiry from onesunonemoon.in',
    '',
    `Name:     ${data.name}`,
    `Email:    ${data.email}`,
    `Phone:    ${data.phone || '—'}`,
    `Company:  ${data.company || '—'}`,
    `Service:  ${data.service}`,
    `Budget:   ${data.budget || '—'}`,
    '',
    'Project:',
    data.message,
  ].join('\n')
  return { subject, text }
}

/** Sends via the Resend REST API. Throws on any non-2xx response. */
export async function sendEnquiry(config: MailConfig, data: ContactInput): Promise<void> {
  await sendPlainText(config, { ...formatEnquiry(data), replyTo: data.email })
}

export interface BookingMailDetails {
  data: BookingInput
  /** Where the meeting stands, in words for the team, e.g. "Requested — not yet confirmed". */
  meetingStatus: string
  /** The meeting day/time in the agency's time zone, already formatted. */
  meetingTime: string
}

export function formatBookingEnquiry({ data, meetingStatus, meetingTime }: BookingMailDetails) {
  const subject = `New enquiry + meeting: ${data.projectType} — ${data.company}`.slice(0, 180)
  const text = [
    'New project enquiry from the ONE SUN ONE MOON brand journey',
    '',
    `Name:          ${data.name}`,
    `Business:      ${data.company}`,
    `Email:         ${data.email}`,
    `Phone:         ${data.phone}`,
    `Project type:  ${data.projectType}`,
    '',
    `Meeting:       ${meetingTime}`,
    `Status:        ${meetingStatus}`,
    `Visitor zone:  ${data.visitorTimeZone || 'not given'}`,
    '',
    'Project:',
    data.message,
  ].join('\n')
  return { subject, text }
}

export async function sendBookingEnquiry(config: MailConfig, details: BookingMailDetails): Promise<void> {
  await sendPlainText(config, { ...formatBookingEnquiry(details), replyTo: details.data.email })
}

async function sendPlainText(config: MailConfig, mail: { subject: string; text: string; replyTo: string }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: config.from,
      to: [config.to],
      reply_to: mail.replyTo,
      subject: mail.subject,
      text: mail.text,
    }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) throw new Error(`Email provider responded ${res.status}`)
}
