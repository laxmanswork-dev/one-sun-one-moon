'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { buttonClass } from '@/components/ui/Button'
import type { BookingMode, MonthAvailability } from '@/lib/booking/availability'
import {
  addDays,
  dateKeyAt,
  daysInMonth,
  formatDate,
  formatTime,
  timeZoneLabel,
  toDateKey,
  weekdayOf,
} from '@/lib/booking/time'
import {
  bookingLimits,
  projectTypes,
  validateBooking,
  type BookingErrors,
  type BookingField,
  type BookingInput,
} from '@/lib/validation/booking'
import styles from './ProjectBooking.module.css'

type Outcome =
  | { mode: 'live'; confirmed: boolean; start: string; email: string }
  | { mode: 'request'; start: string; email: string }
  | { mode: 'date'; date: string; email: string }

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; outcome: Outcome }
  | { kind: 'error'; message: string; offline?: boolean }

const serverMessages: Record<string, string> = {
  invalid: 'Some details need another look — see the highlighted fields.',
  too_fast: 'That was quick! Please take a moment to check your details, then send again.',
  rate_limited: 'We have received several requests from you in a short time. Please wait a few minutes and try again.',
  too_large: 'Your message is too long. Please shorten it and try again.',
  forbidden: 'This form can only be sent from onesunonemoon.in. Please reload the page and try again.',
  slot_unavailable: 'That time is no longer available. Please choose another — the calendar has been refreshed.',
  not_configured: 'Online enquiries are not connected yet, so nothing has been sent or booked.',
  delivery_failed: 'We could not deliver your enquiry just now. Nothing was sent — please try again shortly.',
  booking_failed: 'The calendar could not create your booking just now. Nothing was booked — please try again shortly.',
}

const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const monthKeyOf = (date: string) => date.slice(0, 7)
const monthLabel = (key: string) =>
  new Intl.DateTimeFormat('en-IN', { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(
    new Date(`${key}-15T12:00:00Z`),
  )
function shiftMonth(key: string, by: number) {
  const [y, m] = key.split('-').map(Number) as [number, number]
  const d = new Date(Date.UTC(y, m - 1 + by, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}
const visitorZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return ''
  }
}

export function ProjectBooking({
  mode: configuredMode,
  timeZone,
  deliveryReady,
  fallbackEmail,
}: {
  mode: BookingMode
  timeZone: string
  deliveryReady: boolean
  fallbackEmail: string | null
}) {
  const id = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)
  const reviewRef = useRef<HTMLDivElement>(null)
  const startedAt = useRef(0)
  const submitting = useRef(false)

  const [monthKey, setMonthKey] = useState(() => monthKeyOf(dateKeyAt(Date.now(), timeZone)))
  const [months, setMonths] = useState<Record<string, MonthAvailability | 'error' | 'empty'>>({})
  const [reload, setReload] = useState(0)
  const [date, setDate] = useState('')
  const [slot, setSlot] = useState('')
  const [errors, setErrors] = useState<BookingErrors>({})
  const [review, setReview] = useState<{ data: BookingInput; localZone: string } | null>(null)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [messageLength, setMessageLength] = useState(0)

  useEffect(() => {
    startedAt.current = Date.now()
  }, [])

  // Availability for the month on view. Each month is fetched once (again after a failed booking).
  const current = months[monthKey]
  useEffect(() => {
    if (current !== undefined) return
    const controller = new AbortController()
    fetch(`/api/booking/availability?month=${monthKey}`, { signal: controller.signal, cache: 'no-store' })
      .then(async (res) => {
        if (res.status === 404) return 'empty' as const
        if (!res.ok) throw new Error(String(res.status))
        return (await res.json()) as MonthAvailability
      })
      .then((result) => {
        setMonths((all) => ({ ...all, [monthKey]: result }))
        // The lead time can push the first bookable day into next month: move there on first load.
        if (result !== 'empty' && result.firstDate > toDateKey(...ymd(monthKey), daysInMonth(...ymd(monthKey))))
          setMonthKey(monthKeyOf(result.firstDate))
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        console.warn('[booking] availability unavailable', error)
        setMonths((all) => ({ ...all, [monthKey]: 'error' }))
      })
    return () => controller.abort()
  }, [monthKey, current, reload])

  const info = typeof current === 'object' ? current : null
  // Any loaded month carries the range and mode; use the latest we have.
  const known = info ?? Object.values(months).find((m): m is MonthAvailability => typeof m === 'object') ?? null
  const mode = known?.mode ?? configuredMode
  const needsSlot = mode !== 'date'
  const zoneName = timeZoneLabel(timeZone)
  const daySlots = (d: string) => info?.days?.[d] ?? []
  const isOpen = (d: string) =>
    Boolean(info) && d >= info!.firstDate && d <= info!.lastDate && (mode === 'date' || daySlots(d).length > 0)

  const fieldId = (name: BookingField) => `${id}-${name}`
  const errorId = (name: BookingField) => `${id}-${name}-error`
  const describe = (name: BookingField, hint?: string) =>
    [errors[name] ? errorId(name) : null, hint].filter(Boolean).join(' ') || undefined

  function focusFirstError(next: BookingErrors) {
    const order: BookingField[] = ['name', 'company', 'email', 'phone', 'projectType', 'message', 'date', 'slot']
    const first = order.find((k) => next[k])
    if (!first) return
    const target =
      first === 'date'
        ? formRef.current?.querySelector<HTMLElement>('[data-day][tabindex="0"]')
        : first === 'slot'
          ? formRef.current?.querySelector<HTMLElement>('input[name="slot"]')
          : formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)
    target?.focus()
  }

  function collect() {
    const raw = Object.fromEntries(new FormData(formRef.current!)) as Record<string, string>
    return { raw, check: validateBooking({ ...raw, date, slot, visitorTimeZone: visitorZone() }, { needsSlot }) }
  }

  function chooseDate(next: string) {
    setDate(next)
    setSlot('')
    setReview(null)
    setErrors((all) => omit(all, 'date', 'slot'))
  }

  function chooseSlot(next: string) {
    setSlot(next)
    setReview(null)
    setErrors((all) => omit(all, 'slot'))
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    const { raw, check } = collect()
    if (!check.ok) {
      setErrors(check.errors)
      setReview(null)
      setStatus({ kind: 'error', message: 'Some details need another look — see the highlighted fields.' })
      focusFirstError(check.errors)
      return
    }
    setErrors({})
    // First press: show the summary to review. Second press (from the summary): send.
    if (!review) {
      setStatus({ kind: 'idle' })
      setReview({ data: check.data, localZone: check.data.visitorTimeZone })
      return
    }

    submitting.current = true
    setStatus({ kind: 'submitting' })
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...check.data, website: raw.website ?? '', startedAt: startedAt.current }),
      })
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        error?: string
        fields?: BookingErrors
        mode?: BookingMode
        confirmed?: boolean
        start?: string
        date?: string
      }
      if (res.ok && body.ok) {
        const email = check.data.email
        const outcome: Outcome =
          body.mode === 'live' && body.start
            ? { mode: 'live', confirmed: Boolean(body.confirmed), start: body.start, email }
            : body.mode === 'request' && body.start
              ? { mode: 'request', start: body.start, email }
              : { mode: 'date', date: body.date ?? check.data.date, email }
        setStatus({ kind: 'success', outcome })
        return
      }
      setReview(null)
      if (body.fields) {
        setErrors(body.fields)
        focusFirstError(body.fields)
      }
      if (body.error === 'slot_unavailable') {
        setSlot('')
        if (mode === 'date') setDate('')
        setMonths((all) => omit(all, monthKey))
        setReload((n) => n + 1)
      }
      setStatus({
        kind: 'error',
        message:
          serverMessages[body.error ?? ''] ?? 'Something went wrong and nothing was sent or booked. Please try again.',
        offline: ['not_configured', 'delivery_failed', 'booking_failed'].includes(body.error ?? ''),
      })
    } catch {
      setReview(null)
      setStatus({
        kind: 'error',
        message: 'We could not reach the server — check your connection. Nothing has been sent or booked.',
        offline: true,
      })
    } finally {
      submitting.current = false
    }
  }

  // Move focus to the summary as it opens, and to any outcome that needs reading.
  useEffect(() => {
    if (review) reviewRef.current?.focus()
  }, [review])
  useEffect(() => {
    if (status.kind === 'success' || (status.kind === 'error' && !Object.keys(errors).length))
      statusRef.current?.focus()
  }, [status, errors])

  if (status.kind === 'success') return <Confirmation outcome={status.outcome} timeZone={timeZone} ref={statusRef} />

  const busy = status.kind === 'submitting'
  const confirmLabel = mode === 'live' ? 'Confirm booking' : 'Send enquiry'

  return (
    <form
      ref={formRef}
      className={styles.card}
      onSubmit={onSubmit}
      onChange={() => review && setReview(null)}
      noValidate
      aria-describedby={`${id}-required`}
    >
      {!deliveryReady && (
        <p className={styles.notice} role="note">
          Online enquiries are still being connected. If your enquiry cannot be delivered, this form will say so — it
          never shows a confirmation for something that was not sent.
          {fallbackEmail && (
            <>
              {' '}
              You can always email <a href={`mailto:${fallbackEmail}`}>{fallbackEmail}</a>.
            </>
          )}
        </p>
      )}

      <div className={styles.columns}>
        <fieldset className={styles.details}>
          <legend className={styles.legend}>
            <span className={styles.legendNumber}>01</span> About you and your project
          </legend>
          <p id={`${id}-required`} className={styles.required}>
            All fields are required.
          </p>
          <div className={styles.row}>
            <Field label="Full name" id={fieldId('name')} errorId={errorId('name')} error={errors.name}>
              <input
                id={fieldId('name')}
                name="name"
                type="text"
                autoComplete="name"
                maxLength={bookingLimits.name}
                required
                aria-invalid={Boolean(errors.name)}
                aria-describedby={describe('name')}
              />
            </Field>
            <Field
              label="Business or brand name"
              id={fieldId('company')}
              errorId={errorId('company')}
              error={errors.company}
            >
              <input
                id={fieldId('company')}
                name="company"
                type="text"
                autoComplete="organization"
                maxLength={bookingLimits.company}
                required
                aria-invalid={Boolean(errors.company)}
                aria-describedby={describe('company')}
              />
            </Field>
          </div>
          <div className={styles.row}>
            <Field label="Email address" id={fieldId('email')} errorId={errorId('email')} error={errors.email}>
              <input
                id={fieldId('email')}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                maxLength={bookingLimits.email}
                required
                aria-invalid={Boolean(errors.email)}
                aria-describedby={describe('email')}
              />
            </Field>
            <Field
              label="Phone number"
              hint="With country code, e.g. +91 98765 43210"
              hintId={`${id}-phone-hint`}
              id={fieldId('phone')}
              errorId={errorId('phone')}
              error={errors.phone}
            >
              <input
                id={fieldId('phone')}
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+91"
                maxLength={bookingLimits.phone}
                required
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={describe('phone', `${id}-phone-hint`)}
              />
            </Field>
          </div>
          <fieldset
            className={styles.choices}
            aria-invalid={Boolean(errors.projectType)}
            aria-describedby={describe('projectType')}
          >
            <legend className={styles.label}>Project type</legend>
            <div className={styles.chips}>
              {projectTypes.map((type) => (
                <label key={type} className={styles.chip}>
                  <input type="radio" name="projectType" value={type} required />
                  <span>{type}</span>
                </label>
              ))}
            </div>
            {errors.projectType && (
              <p id={errorId('projectType')} className={styles.fieldError}>
                {errors.projectType}
              </p>
            )}
          </fieldset>
          <Field
            label="Your project, in short"
            id={fieldId('message')}
            errorId={errorId('message')}
            error={errors.message}
          >
            <textarea
              id={fieldId('message')}
              name="message"
              rows={5}
              required
              minLength={bookingLimits.message.min}
              maxLength={bookingLimits.message.max}
              placeholder="What are you building, what should it achieve, and is there a timeline?"
              onChange={(e) => setMessageLength(e.currentTarget.value.length)}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={describe('message', `${id}-count`)}
            />
            <span id={`${id}-count`} className={styles.count}>
              {messageLength} / {bookingLimits.message.max}
            </span>
          </Field>
        </fieldset>

        <fieldset className={styles.calendar} aria-describedby={`${id}-zone`}>
          <legend className={styles.legend}>
            <span className={styles.legendNumber}>02</span> {needsSlot ? 'Pick a time to talk' : 'Pick a day to talk'}
          </legend>
          <p id={`${id}-zone`} className={styles.zone}>
            {needsSlot ? 'Times are shown in ' : 'Days follow '}
            <strong>{zoneName}</strong>
            {zoneName !== timeZone && <> ({timeZone})</>}.
          </p>

          <MonthGrid
            monthKey={monthKey}
            info={info}
            state={current}
            selected={date}
            isOpen={isOpen}
            slotCount={(d) => daySlots(d).length}
            mode={mode}
            onSelect={chooseDate}
            onMonth={setMonthKey}
            onRetry={() => {
              setMonths((all) => omit(all, monthKey))
              setReload((n) => n + 1)
            }}
            labelledBy={`${id}-month`}
            invalid={Boolean(errors.date)}
            describedBy={errors.date ? errorId('date') : undefined}
          />
          {errors.date && (
            <p id={errorId('date')} className={styles.fieldError}>
              {errors.date}
            </p>
          )}

          {needsSlot && (
            <fieldset
              className={styles.slots}
              aria-invalid={Boolean(errors.slot)}
              aria-describedby={describe('slot', `${id}-zone`)}
            >
              <legend className={styles.label}>
                {date ? `Available times · ${formatDate(date)}` : 'Available times'}
              </legend>
              {date ? (
                <div className={styles.slotGrid}>
                  {daySlots(date).map((s) => (
                    <label key={s} className={styles.slot}>
                      <input type="radio" name="slot" value={s} checked={slot === s} onChange={() => chooseSlot(s)} />
                      <span>{formatTime(s, timeZone)}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className={styles.hint}>Choose a day to see open times.</p>
              )}
              {errors.slot && (
                <p id={errorId('slot')} className={styles.fieldError}>
                  {errors.slot}
                </p>
              )}
            </fieldset>
          )}
          {mode === 'request' && (
            <p className={styles.hint}>
              These are our working hours. We&rsquo;ll confirm your chosen time by email — it isn&rsquo;t booked until
              we do.
            </p>
          )}
          {mode === 'date' && (
            <p className={styles.hint}>
              Online scheduling isn&rsquo;t connected yet. Pick the day that suits you and we&rsquo;ll reply with times
              — nothing is booked until we confirm.
            </p>
          )}
        </fieldset>
      </div>

      {/* Honeypot: hidden from people and assistive tech; bots fill it in. */}
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor={`${id}-website`}>Leave this field empty</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {review ? (
        <div ref={reviewRef} className={styles.review} tabIndex={-1} aria-labelledby={`${id}-review`}>
          <h3 id={`${id}-review`} className={styles.reviewTitle}>
            Review before you {mode === 'live' ? 'book' : 'send'}
          </h3>
          <dl className={styles.summary}>
            <div>
              <dt>{needsSlot ? 'Meeting' : 'Preferred day'}</dt>
              <dd>
                {formatDate(review.data.date)}
                {review.data.slot && (
                  <>
                    {' at '}
                    <strong>{formatTime(review.data.slot, timeZone)}</strong> {zoneName}
                    {/* Compare readings, not zone names: browsers may report an alias (Asia/Calcutta). */}
                    {review.localZone &&
                      formatTime(review.data.slot, review.localZone) +
                        dateKeyAt(Date.parse(review.data.slot), review.localZone) !==
                        formatTime(review.data.slot, timeZone) + review.data.date && (
                        <span className={styles.local}>
                          {' '}
                          That&rsquo;s {formatTime(review.data.slot, review.localZone)} on{' '}
                          {formatDate(dateKeyAt(Date.parse(review.data.slot), review.localZone))} where you are (
                          {timeZoneLabel(review.localZone)}).
                        </span>
                      )}
                  </>
                )}
              </dd>
            </div>
            <div>
              <dt>Project</dt>
              <dd>
                {review.data.projectType} · {review.data.company}
              </dd>
            </div>
            <div>
              <dt>Contact</dt>
              <dd>
                {review.data.name} · {review.data.email} · {review.data.phone}
              </dd>
            </div>
          </dl>
          {mode !== 'live' && (
            <p className={styles.hint}>
              {mode === 'request'
                ? 'This sends your enquiry with the time you asked for. The meeting is confirmed only when we reply.'
                : 'This sends your enquiry with your preferred day. We’ll reply to arrange a time.'}
            </p>
          )}
          <div className={styles.actions}>
            <button type="submit" className={buttonClass('primary')} disabled={busy} aria-disabled={busy}>
              {busy ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" /> {mode === 'live' ? 'Booking…' : 'Sending…'}
                </>
              ) : (
                confirmLabel
              )}
            </button>
            <button type="button" className={buttonClass('secondary')} onClick={() => setReview(null)} disabled={busy}>
              Edit details
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.actions}>
          <button type="submit" className={buttonClass('primary')}>
            Review {mode === 'live' ? 'booking' : 'enquiry'}
          </button>
          <p className={styles.privacy}>
            We use your details only to reply to this enquiry. See our <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      )}

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

function ymd(monthKey: string) {
  return monthKey.split('-').map(Number) as [number, number]
}

function MonthGrid({
  monthKey,
  info,
  state,
  selected,
  isOpen,
  slotCount,
  mode,
  onSelect,
  onMonth,
  onRetry,
  labelledBy,
  invalid,
  describedBy,
}: {
  monthKey: string
  info: MonthAvailability | null
  state: MonthAvailability | 'error' | 'empty' | undefined
  selected: string
  isOpen: (date: string) => boolean
  slotCount: (date: string) => number
  mode: BookingMode
  onSelect: (date: string) => void
  onMonth: (key: string) => void
  onRetry: () => void
  labelledBy: string
  invalid: boolean
  describedBy?: string
}) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [year, month] = ymd(monthKey)
  const count = daysInMonth(year, month)
  const first = toDateKey(year, month, 1)
  const lead = (weekdayOf(first) + 6) % 7 // Monday-first grid
  const dates = Array.from({ length: count }, (_, i) => toDateKey(year, month, i + 1))
  const open = dates.filter(isOpen)
  // One day takes Tab focus; arrow keys move between open days.
  const focusable = open.includes(selected) ? selected : open[0]

  const canPrev = Boolean(info) && monthKey > monthKeyOf(info!.firstDate)
  const canNext = Boolean(info) && monthKey < monthKeyOf(info!.lastDate)

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const from = (event.target as HTMLElement).dataset.day
    if (!from) return
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key]
    if (!step) return
    event.preventDefault()
    let next = addDays(from, step)
    // Skip closed days in the step's direction, within this month.
    while (monthKeyOf(next) === monthKey && !isOpen(next)) next = addDays(next, step > 0 ? 1 : -1)
    if (monthKeyOf(next) !== monthKey) return
    gridRef.current?.querySelector<HTMLElement>(`[data-day="${next}"]`)?.focus()
  }

  return (
    <div className={styles.month}>
      <div className={styles.monthHead}>
        <button
          type="button"
          className={styles.monthNav}
          onClick={() => onMonth(shiftMonth(monthKey, -1))}
          disabled={!canPrev}
        >
          <span aria-hidden="true">‹</span>
          <span className="visually-hidden">Previous month</span>
        </button>
        <p id={labelledBy} className={styles.monthName} aria-live="polite">
          {monthLabel(monthKey)}
        </p>
        <button
          type="button"
          className={styles.monthNav}
          onClick={() => onMonth(shiftMonth(monthKey, 1))}
          disabled={!canNext}
        >
          <span aria-hidden="true">›</span>
          <span className="visually-hidden">Next month</span>
        </button>
      </div>

      {state === undefined && <p className={styles.monthState}>Checking availability…</p>}
      {state === 'error' && (
        <div className={styles.monthState}>
          <p>We couldn&rsquo;t load availability just now.</p>
          <button type="button" className={buttonClass('secondary', 'sm')} onClick={onRetry}>
            Try again
          </button>
        </div>
      )}
      {state === 'empty' && <p className={styles.monthState}>No dates can be booked in this month.</p>}

      {info && (
        <div
          ref={gridRef}
          className={styles.days}
          role="group"
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          data-invalid={invalid || undefined}
          onKeyDown={onKeyDown}
        >
          {WEEK.map((d) => (
            <span key={d} className={styles.weekday} aria-hidden="true">
              {d.slice(0, 2)}
            </span>
          ))}
          {Array.from({ length: lead }, (_, i) => (
            <span key={`pad-${i}`} aria-hidden="true" />
          ))}
          {dates.map((d) => {
            const available = isOpen(d)
            const slots = slotCount(d)
            const note = !available
              ? 'unavailable'
              : mode === 'date'
                ? 'available'
                : `${slots} ${slots === 1 ? 'time' : 'times'} available`
            return (
              <button
                key={d}
                type="button"
                data-day={d}
                className={styles.day}
                disabled={!available}
                aria-pressed={d === selected}
                aria-label={`${formatDate(d)}, ${note}`}
                tabIndex={d === focusable ? 0 : -1}
                onClick={() => onSelect(d)}
              >
                {Number(d.slice(8))}
              </button>
            )
          })}
        </div>
      )}
      {info && open.length === 0 && <p className={styles.monthState}>No open dates this month — try the next one.</p>}
    </div>
  )
}

function Field({
  label,
  hint,
  hintId,
  id,
  errorId,
  error,
  children,
}: {
  label: string
  hint?: string
  hintId?: string
  id: string
  errorId: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className={styles.field} data-invalid={error ? '' : undefined}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {hint && (
        <span id={hintId} className={styles.fieldHint}>
          {hint}
        </span>
      )}
      {children}
      {error && (
        <p id={errorId} className={styles.fieldError}>
          {error}
        </p>
      )}
    </div>
  )
}

function Confirmation({
  outcome,
  timeZone,
  ref,
}: {
  outcome: Outcome
  timeZone: string
  ref: React.Ref<HTMLDivElement>
}) {
  const zone = timeZoneLabel(timeZone)
  const when =
    outcome.mode === 'date'
      ? formatDate(outcome.date)
      : `${formatDate(dateKeyAt(Date.parse(outcome.start), timeZone))} at ${formatTime(outcome.start, timeZone)} ${zone}`

  return (
    <div ref={ref} className={styles.done} role="status" tabIndex={-1}>
      <p className={styles.doneKicker}>
        {outcome.mode === 'live' && outcome.confirmed ? 'Meeting booked' : 'Enquiry received'}
      </p>
      <h3 className={`display ${styles.doneTitle}`}>
        Your next chapter <span className="fire-text">starts here.</span>
      </h3>
      {outcome.mode === 'live' && outcome.confirmed && (
        <p>
          Your meeting is confirmed for <strong>{when}</strong>. A calendar invitation is on its way to{' '}
          <strong>{outcome.email}</strong>.
        </p>
      )}
      {outcome.mode === 'live' && !outcome.confirmed && (
        <p>
          We&rsquo;ve received your request for <strong>{when}</strong>. It&rsquo;s awaiting confirmation from our team
          — you&rsquo;ll get an email at <strong>{outcome.email}</strong> once it&rsquo;s confirmed.
        </p>
      )}
      {outcome.mode === 'request' && (
        <p>
          Thank you — your enquiry has reached our team. You asked to meet on <strong>{when}</strong>. That time is not
          confirmed yet: we&rsquo;ll reply to <strong>{outcome.email}</strong> to confirm it or suggest another.
        </p>
      )}
      {outcome.mode === 'date' && (
        <p>
          Thank you — your enquiry has reached our team. You&rsquo;d like to meet on <strong>{when}</strong>;
          we&rsquo;ll reply to <strong>{outcome.email}</strong> with times that work.
        </p>
      )}
      <Link href="/" className={buttonClass('primary')}>
        Return to the main website
      </Link>
    </div>
  )
}

function omit<T extends object>(obj: T, ...keys: string[]): T {
  const copy = { ...obj } as Record<string, unknown>
  for (const key of keys) delete copy[key]
  return copy as T
}
