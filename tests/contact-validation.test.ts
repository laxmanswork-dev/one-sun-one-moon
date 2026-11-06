import { describe, expect, it } from 'vitest'
import { cleanLine, cleanText, validateContact } from '@/lib/validation/contact'

const valid = {
  name: 'Asha Kumar',
  email: 'Asha@Example.com',
  phone: '+91 98765 43210',
  company: 'Example Co',
  service: 'Website Design & Development',
  budget: 'Not sure yet',
  message: 'We need a new website for our cafe with a menu page.',
}

describe('validateContact', () => {
  it('accepts a complete enquiry and normalises it', () => {
    const result = validateContact({ ...valid, name: '  Asha   Kumar ' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.name).toBe('Asha Kumar')
      expect(result.data.email).toBe('asha@example.com')
    }
  })

  it('treats phone, company and budget as optional', () => {
    expect(validateContact({ ...valid, phone: '', company: '', budget: '' }).ok).toBe(true)
  })

  it('requires name, email, service and a meaningful message', () => {
    const result = validateContact({})
    expect(result.ok).toBe(false)
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(['email', 'message', 'name', 'service'])
  })

  it.each(['not-an-email', 'a@b', 'a b@c.com', 'a@b.c'])('rejects invalid email %s', (email) => {
    const result = validateContact({ ...valid, email })
    expect(result.ok).toBe(false)
  })

  it('only accepts services and budgets from the lists', () => {
    expect(validateContact({ ...valid, service: 'Hacking' }).ok).toBe(false)
    expect(validateContact({ ...valid, budget: '₹1' }).ok).toBe(false)
  })

  it('enforces length limits', () => {
    expect(validateContact({ ...valid, name: 'x'.repeat(101) }).ok).toBe(false)
    expect(validateContact({ ...valid, message: 'too short' }).ok).toBe(false)
    expect(validateContact({ ...valid, message: 'x'.repeat(4001) }).ok).toBe(false)
  })

  it('ignores non-string values instead of crashing', () => {
    const result = validateContact({ ...valid, name: { $gt: '' }, email: ['x'] })
    expect(result.ok).toBe(false)
  })
})

describe('cleaning', () => {
  it('strips control characters and header-injection newlines from single-line fields', () => {
    expect(cleanLine('Asha\r\nBcc: evil@example.com')).toBe('Asha Bcc: evil@example.com')
    expect(cleanLine('a\u0000b')).toBe('a b')
  })
  it('keeps paragraphs in the message but collapses runs of blank lines', () => {
    expect(cleanText('one\r\n\r\n\r\n\r\ntwo')).toBe('one\n\ntwo')
  })
})
