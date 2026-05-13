import { InviteToken } from './invite-token.value-object'

const VALID_32 = 'abcdefghijklmnopqrstuvwxyz123456' // exactly 32 chars (26 letters + 6 digits)
const TOO_LONG = 'abcdefghijklmnopqrstuvwxyz1234567' // 33 chars — too long

// ---------------------------------------------------------------------------
// InviteToken.fromString
// ---------------------------------------------------------------------------

describe('InviteToken.fromString', () => {
  it('constructs from a valid 32-char alphanumeric-dash-underscore string', () => {
    const token = InviteToken.fromString(VALID_32)
    expect(token.value).toBe(VALID_32)
  })

  it('throws when the token is shorter than 32 characters', () => {
    expect(() => InviteToken.fromString('short')).toThrow()
  })

  it('throws when the token is longer than 32 characters', () => {
    expect(() => InviteToken.fromString(TOO_LONG)).toThrow()
  })

  it('throws when the token contains invalid characters', () => {
    const withSpace = 'aB3 aB3_aB3_aB3_aB3_aB3_aB3_aB3'
    expect(() => InviteToken.fromString(withSpace)).toThrow()
  })

  it('throws for an empty string', () => {
    expect(() => InviteToken.fromString('')).toThrow()
  })

  it('accepts tokens with uppercase, lowercase, digits, underscores, and hyphens', () => {
    const allCharTypes = 'ABCDabcd1234_-ABCDabcd1234_-ABCD' // 32 chars, all valid char types
    expect(() => InviteToken.fromString(allCharTypes)).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// InviteToken.generate
// ---------------------------------------------------------------------------

describe('InviteToken.generate', () => {
  it('returns a token with exactly 32 characters', () => {
    const token = InviteToken.generate()
    expect(token.value).toHaveLength(32)
  })

  it('returns a token matching the expected character set', () => {
    const token = InviteToken.generate()
    expect(token.value).toMatch(/^[a-zA-Z0-9_-]{32}$/)
  })

  it('returns different tokens on successive calls', () => {
    const a = InviteToken.generate()
    const b = InviteToken.generate()
    expect(a.value).not.toBe(b.value)
  })

  it('returns a token accepted by fromString', () => {
    const token = InviteToken.generate()
    expect(() => InviteToken.fromString(token.value)).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// toDeepLink
// ---------------------------------------------------------------------------

describe('toDeepLink', () => {
  it('returns a gonebad:// deep-link URL', () => {
    const token = InviteToken.fromString(VALID_32)
    expect(token.toDeepLink()).toBe(`gonebad://kitchen/invite/${VALID_32}`)
  })

  it('includes the token in the path', () => {
    const token = InviteToken.fromString(VALID_32)
    expect(token.toDeepLink()).toContain(VALID_32)
  })
})

// ---------------------------------------------------------------------------
// toString
// ---------------------------------------------------------------------------

describe('toString', () => {
  it('returns the underlying token string', () => {
    const token = InviteToken.fromString(VALID_32)
    expect(token.toString()).toBe(VALID_32)
  })
})
