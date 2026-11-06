import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const enquiry = {
  name: 'Asha Kumar',
  email: 'asha@example.com',
  service: 'Brand Strategy & Identity',
  message: 'We are launching a new travel brand and need an identity.',
}

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://onesunonemoon.in/api/contact', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://onesunonemoon.in',
      host: 'onesunonemoon.in',
      'x-forwarded-for': `203.0.113.${Math.floor(Math.random() * 250)}`,
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

const fresh = () => ({ ...enquiry, startedAt: Date.now() - 10_000 })

async function loadRoute() {
  vi.resetModules() // new module = new rate limiter
  return import('@/app/api/contact/route')
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    delete process.env.RESEND_API_KEY
    delete process.env.CONTACT_TO_EMAIL
    delete process.env.CONTACT_FROM_EMAIL
  })
  afterEach(() => vi.unstubAllGlobals())

  it('reports not_configured (503) — never success — when email delivery is not set up', async () => {
    const { POST } = await loadRoute()
    const res = await POST(post(fresh()))
    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ error: 'not_configured' })
  })

  it('rejects cross-site requests', async () => {
    const { POST } = await loadRoute()
    const res = await POST(post(fresh(), { origin: 'https://evil.example' }))
    expect(res.status).toBe(403)
  })

  it('rejects malformed JSON and oversized bodies', async () => {
    const { POST } = await loadRoute()
    expect((await POST(post('{nope'))).status).toBe(400)
    expect((await POST(post({ ...fresh(), message: 'x'.repeat(20_000) }))).status).toBe(413)
  })

  it('returns field errors for invalid input', async () => {
    const { POST } = await loadRoute()
    const res = await POST(post({ ...fresh(), email: 'nope' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('invalid')
    expect(body.fields.email).toBeTruthy()
  })

  it('rejects submissions made too fast, and silently drops honeypot hits', async () => {
    const { POST } = await loadRoute()
    expect((await POST(post({ ...enquiry, startedAt: Date.now() }))).status).toBe(400)
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    const res = await POST(post({ ...fresh(), website: 'http://spam.example' }))
    expect(res.status).toBe(200)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('rate-limits repeated submissions from one address', async () => {
    const { POST } = await loadRoute()
    const ip = { 'x-forwarded-for': '198.51.100.7' }
    const statuses = []
    for (let i = 0; i < 6; i++) statuses.push((await POST(post(fresh(), ip))).status)
    expect(statuses.slice(0, 5).every((s) => s === 503)).toBe(true)
    expect(statuses[5]).toBe(429)
  })

  it('sends a plain-text email through Resend when configured', async () => {
    process.env.RESEND_API_KEY = 're_test'
    process.env.CONTACT_TO_EMAIL = 'inbox@example.com'
    process.env.CONTACT_FROM_EMAIL = 'Site <site@example.com>'
    const fetchSpy = vi.fn().mockResolvedValue(new Response('{"id":"1"}', { status: 200 }))
    vi.stubGlobal('fetch', fetchSpy)
    const { POST } = await loadRoute()
    const res = await POST(post(fresh()))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    const [url, init] = fetchSpy.mock.calls[0]!
    expect(url).toBe('https://api.resend.com/emails')
    const payload = JSON.parse(init.body)
    expect(payload.reply_to).toBe('asha@example.com')
    expect(payload.text).toContain('We are launching a new travel brand')
    expect(payload.html).toBeUndefined()
  })

  it('reports delivery_failed (502) without leaking provider details when Resend errors', async () => {
    process.env.RESEND_API_KEY = 're_test'
    process.env.CONTACT_TO_EMAIL = 'inbox@example.com'
    process.env.CONTACT_FROM_EMAIL = 'site@example.com'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"message":"secret detail"}', { status: 500 })))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { POST } = await loadRoute()
    const res = await POST(post(fresh()))
    expect(res.status).toBe(502)
    expect(JSON.stringify(await res.json())).not.toContain('secret')
  })
})
