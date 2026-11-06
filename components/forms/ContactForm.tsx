'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { buttonClass } from '@/components/ui/Button'
import {
  budgetOptions,
  limits,
  serviceChoices,
  validateContact,
  type ContactErrors,
  type ContactField,
} from '@/lib/validation/contact'
import styles from './ContactForm.module.css'

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | {
      kind: 'error'
      message: string
      offline?: boolean
      /** Field errors take focus instead of the summary. */ fieldErrors?: boolean
    }

const serverMessages: Record<string, string> = {
  invalid: 'Some details need another look — see the highlighted fields.',
  too_fast: 'That was quick! Please take a moment to check your details, then send again.',
  rate_limited: 'We have received several messages from you in a short time. Please wait a few minutes and try again.',
  too_large: 'Your message is too long. Please shorten it and try again.',
  forbidden: 'This form can only be sent from onesunonemoon.in. Please reload the page and try again.',
  not_configured: 'Online enquiries are not connected yet, so your message has not been sent.',
  delivery_failed: 'We could not deliver your message just now. Nothing was sent — please try again shortly.',
}

export function ContactForm({
  defaultService,
  fallbackEmail,
}: {
  defaultService?: string
  /** Shown when online delivery is unavailable. Only a verified address. */
  fallbackEmail?: string | null
}) {
  const id = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)
  const startedAt = useRef(0)
  const [errors, setErrors] = useState<ContactErrors>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [messageLength, setMessageLength] = useState(0)

  const serviceRef = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    startedAt.current = Date.now()
    // Pre-select the service when arriving from a "Enquire about …" link (?service=…).
    const requested = new URLSearchParams(window.location.search).get('service')
    if (requested && serviceRef.current && (serviceChoices as readonly string[]).includes(requested)) {
      serviceRef.current.value = requested
    }
  }, [])

  const fieldId = (name: ContactField) => `${id}-${name}`
  const errorId = (name: ContactField) => `${id}-${name}-error`
  const describe = (name: ContactField, hint?: string) =>
    [errors[name] ? errorId(name) : null, hint].filter(Boolean).join(' ') || undefined

  function focusFirstError(next: ContactErrors) {
    const first = (Object.keys(next) as ContactField[])[0]
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status.kind === 'submitting') return
    const form = event.currentTarget
    const raw = Object.fromEntries(new FormData(form)) as Record<string, string>

    const check = validateContact(raw)
    if (!check.ok) {
      setErrors(check.errors)
      setStatus({
        kind: 'error',
        message: 'Some details need another look — see the highlighted fields.',
        fieldErrors: true,
      })
      focusFirstError(check.errors)
      return
    }
    setErrors({})
    setStatus({ kind: 'submitting' })

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...check.data, website: raw.website ?? '', startedAt: startedAt.current }),
      })
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: ContactErrors }
      if (res.ok && body.ok) {
        setStatus({ kind: 'success' })
        form.reset()
        setMessageLength(0)
      } else {
        if (body.fields) {
          setErrors(body.fields)
          focusFirstError(body.fields)
        }
        setStatus({
          kind: 'error',
          message:
            serverMessages[body.error ?? ''] ?? 'Something went wrong and your message was not sent. Please try again.',
          offline: body.error === 'not_configured' || body.error === 'delivery_failed',
          fieldErrors: Boolean(body.fields),
        })
      }
    } catch {
      setStatus({
        kind: 'error',
        message: 'We could not reach the server — check your connection. Your message has not been sent.',
        offline: true,
      })
    }
  }

  useEffect(() => {
    if (status.kind === 'success' || (status.kind === 'error' && !status.fieldErrors)) statusRef.current?.focus()
  }, [status])

  if (status.kind === 'success') {
    return (
      <div ref={statusRef} className={styles.success} role="status" tabIndex={-1}>
        <p className={`display ${styles.successTitle}`}>Message received.</p>
        <p>
          Thank you — your enquiry has been delivered to our team. We read every message and will reply to the email
          address you gave us.
        </p>
        <button type="button" className={buttonClass('secondary')} onClick={() => setStatus({ kind: 'idle' })}>
          Send another enquiry
        </button>
      </div>
    )
  }

  const submitting = status.kind === 'submitting'

  return (
    <form ref={formRef} className={styles.form} onSubmit={onSubmit} noValidate aria-describedby={`${id}-required`}>
      <p id={`${id}-required`} className={styles.required}>
        Fields marked <span aria-hidden="true">*</span>
        <span className="visually-hidden">with an asterisk</span> are required.
      </p>

      <div className={styles.row}>
        <Field
          label="Your name"
          name="name"
          required
          error={errors.name}
          id={fieldId('name')}
          errorId={errorId('name')}
        >
          <input
            id={fieldId('name')}
            name="name"
            type="text"
            autoComplete="name"
            maxLength={limits.name}
            required
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describe('name')}
          />
        </Field>
        <Field
          label="Business email"
          name="email"
          required
          error={errors.email}
          id={fieldId('email')}
          errorId={errorId('email')}
        >
          <input
            id={fieldId('email')}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={limits.email}
            required
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describe('email')}
          />
        </Field>
      </div>

      <div className={styles.row}>
        <Field
          label="Phone"
          name="phone"
          optional
          error={errors.phone}
          id={fieldId('phone')}
          errorId={errorId('phone')}
        >
          <input
            id={fieldId('phone')}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={limits.phone}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describe('phone')}
          />
        </Field>
        <Field
          label="Company or brand"
          name="company"
          optional
          error={errors.company}
          id={fieldId('company')}
          errorId={errorId('company')}
        >
          <input
            id={fieldId('company')}
            name="company"
            type="text"
            autoComplete="organization"
            maxLength={limits.company}
            aria-invalid={Boolean(errors.company)}
            aria-describedby={describe('company')}
          />
        </Field>
      </div>

      <div className={styles.row}>
        <Field
          label="Service of interest"
          name="service"
          required
          error={errors.service}
          id={fieldId('service')}
          errorId={errorId('service')}
        >
          <select
            id={fieldId('service')}
            ref={serviceRef}
            name="service"
            required
            defaultValue={
              defaultService && (serviceChoices as readonly string[]).includes(defaultService) ? defaultService : ''
            }
            aria-invalid={Boolean(errors.service)}
            aria-describedby={describe('service')}
          >
            <option value="" disabled>
              Choose a service
            </option>
            {serviceChoices.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Project budget"
          name="budget"
          optional
          error={errors.budget}
          id={fieldId('budget')}
          errorId={errorId('budget')}
        >
          <select
            id={fieldId('budget')}
            name="budget"
            defaultValue=""
            aria-invalid={Boolean(errors.budget)}
            aria-describedby={describe('budget')}
          >
            <option value="">Prefer not to say</option>
            {budgetOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        label="About your project"
        name="message"
        required
        error={errors.message}
        id={fieldId('message')}
        errorId={errorId('message')}
      >
        <textarea
          id={fieldId('message')}
          name="message"
          rows={6}
          required
          minLength={limits.message.min}
          maxLength={limits.message.max}
          placeholder="What are you working on, what would you like to achieve, and is there a timeline?"
          onChange={(e) => setMessageLength(e.currentTarget.value.length)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describe('message', `${id}-count`)}
        />
        <span id={`${id}-count`} className={styles.count} aria-live="off">
          {messageLength} / {limits.message.max}
        </span>
      </Field>

      {/* Honeypot: hidden from people and assistive tech; bots fill it in. */}
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor={`${id}-website`}>Leave this field empty</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={styles.actions}>
        <button type="submit" className={buttonClass('primary')} disabled={submitting} aria-disabled={submitting}>
          {submitting ? (
            <>
              <span className={styles.spinner} aria-hidden="true" /> Sending…
            </>
          ) : (
            'Send enquiry'
          )}
        </button>
        <p className={styles.privacy}>
          We use your details only to reply to this enquiry. See our <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </div>

      <div ref={statusRef} tabIndex={-1} className={styles.statusRegion} aria-live="assertive" role="alert">
        {status.kind === 'error' && (
          <div className={styles.error}>
            <p>{status.message}</p>
            {status.offline && fallbackEmail && (
              <p>
                You can also email us directly at <a href={`mailto:${fallbackEmail}`}>{fallbackEmail}</a>.
              </p>
            )}
          </div>
        )}
      </div>
    </form>
  )
}

function Field({
  label,
  name,
  id,
  errorId,
  error,
  required,
  optional,
  children,
}: {
  label: string
  name: ContactField
  id: string
  errorId: string
  error?: string
  required?: boolean
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={styles.field} data-invalid={error ? '' : undefined} data-field={name}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && (
          <span className={styles.star} aria-hidden="true">
            {' '}
            *
          </span>
        )}
        {optional && <span className={styles.optional}> (optional)</span>}
      </label>
      {children}
      {error && (
        <p id={errorId} className={styles.fieldError}>
          {error}
        </p>
      )}
    </div>
  )
}
