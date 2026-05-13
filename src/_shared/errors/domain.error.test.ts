import {
  NotFoundError,
  PermissionError,
  RateLimitError,
  AIError,
  ModerationError,
  StorageError,
  PushDeliveryError,
  InviteError,
  isDomainError,
} from './domain.error'

// ---------------------------------------------------------------------------
// NotFoundError
// ---------------------------------------------------------------------------

describe('NotFoundError', () => {
  const err = new NotFoundError('Item', 'abc-123')

  it('has the correct _tag', () => {
    expect(err._tag).toBe('NotFoundError')
  })

  it('formats the message with resource and id', () => {
    expect(err.message).toBe('Item not found: abc-123')
  })

  it('exposes resource and id as fields', () => {
    expect(err.resource).toBe('Item')
    expect(err.id).toBe('abc-123')
  })

  it('is an instance of Error', () => {
    expect(err).toBeInstanceOf(Error)
  })
})

// ---------------------------------------------------------------------------
// PermissionError
// ---------------------------------------------------------------------------

describe('PermissionError', () => {
  const err = new PermissionError('delete_kitchen', 'owner')

  it('has the correct _tag', () => {
    expect(err._tag).toBe('PermissionError')
  })

  it('formats the message with action and requiredRole', () => {
    expect(err.message).toBe("Permission denied: 'delete_kitchen' requires role 'owner'")
  })

  it('exposes action and requiredRole as fields', () => {
    expect(err.action).toBe('delete_kitchen')
    expect(err.requiredRole).toBe('owner')
  })

  it('is an instance of Error', () => {
    expect(err).toBeInstanceOf(Error)
  })
})

// ---------------------------------------------------------------------------
// RateLimitError
// ---------------------------------------------------------------------------

describe('RateLimitError', () => {
  const resetAt = new Date('2025-01-15T00:00:00.000Z')
  const err = new RateLimitError(20, resetAt)

  it('has the correct _tag', () => {
    expect(err._tag).toBe('RateLimitError')
  })

  it('formats the message with limit and resetAt', () => {
    expect(err.message).toBe(
      'Rate limit of 20 scans/day exceeded. Resets at 2025-01-15T00:00:00.000Z',
    )
  })

  it('exposes limit and resetAt as fields', () => {
    expect(err.limit).toBe(20)
    expect(err.resetAt).toBe(resetAt)
  })

  it('is an instance of Error', () => {
    expect(err).toBeInstanceOf(Error)
  })
})

// ---------------------------------------------------------------------------
// AIError
// ---------------------------------------------------------------------------

describe('AIError', () => {
  describe('without originalError', () => {
    const err = new AIError('Gemini returned an unexpected shape')

    it('has the correct _tag', () => {
      expect(err._tag).toBe('AIError')
    })

    it('uses the provided message verbatim', () => {
      expect(err.message).toBe('Gemini returned an unexpected shape')
    })

    it('originalError is undefined', () => {
      expect(err.originalError).toBeUndefined()
    })

    it('is an instance of Error', () => {
      expect(err).toBeInstanceOf(Error)
    })
  })

  describe('with originalError', () => {
    const original = new TypeError('fetch failed')
    const err = new AIError('Vision API call failed', original)

    it('stores the original error', () => {
      expect(err.originalError).toBe(original)
    })

    it('sets Error.cause to the original error', () => {
      expect(err.cause).toBe(original)
    })
  })
})

// ---------------------------------------------------------------------------
// ModerationError
// ---------------------------------------------------------------------------

describe('ModerationError', () => {
  it.each([
    ['NOT_FOOD', 'Image failed moderation: NOT_FOOD'],
    ['OBSCENE', 'Image failed moderation: OBSCENE'],
    ['BLURRY', 'Image failed moderation: BLURRY'],
    ['NON_TRACKABLE', 'Image failed moderation: NON_TRACKABLE'],
  ] as const)('reason=%s produces message "%s"', (reason, expectedMessage) => {
    const err = new ModerationError(reason)
    expect(err._tag).toBe('ModerationError')
    expect(err.reason).toBe(reason)
    expect(err.message).toBe(expectedMessage)
    expect(err).toBeInstanceOf(Error)
  })
})

// ---------------------------------------------------------------------------
// StorageError
// ---------------------------------------------------------------------------

describe('StorageError', () => {
  describe('without originalError', () => {
    const err = new StorageError('upload')

    it('has the correct _tag', () => {
      expect(err._tag).toBe('StorageError')
    })

    it('formats the message with the operation', () => {
      expect(err.message).toBe("Storage operation 'upload' failed")
    })

    it('exposes operation as a field', () => {
      expect(err.operation).toBe('upload')
    })

    it('originalError is undefined', () => {
      expect(err.originalError).toBeUndefined()
    })
  })

  describe('with originalError', () => {
    const original = new Error('Bucket not found')
    const err = new StorageError('download', original)

    it('stores the original error', () => {
      expect(err.originalError).toBe(original)
    })

    it('sets Error.cause', () => {
      expect(err.cause).toBe(original)
    })
  })

  it.each(['upload', 'download', 'delete', 'signedUrl'] as const)(
    'accepts operation=%s',
    (op) => {
      const err = new StorageError(op)
      expect(err.operation).toBe(op)
      expect(err._tag).toBe('StorageError')
    },
  )
})

// ---------------------------------------------------------------------------
// PushDeliveryError
// ---------------------------------------------------------------------------

describe('PushDeliveryError', () => {
  const err = new PushDeliveryError('ExponentPushToken[abc]', 'DeviceNotRegistered')

  it('has the correct _tag', () => {
    expect(err._tag).toBe('PushDeliveryError')
  })

  it('formats the message with token and reason', () => {
    expect(err.message).toBe(
      "Push notification delivery failed for token 'ExponentPushToken[abc]': DeviceNotRegistered",
    )
  })

  it('exposes token and reason as fields', () => {
    expect(err.token).toBe('ExponentPushToken[abc]')
    expect(err.reason).toBe('DeviceNotRegistered')
  })

  it('is an instance of Error', () => {
    expect(err).toBeInstanceOf(Error)
  })
})

// ---------------------------------------------------------------------------
// InviteError
// ---------------------------------------------------------------------------

describe('InviteError', () => {
  it.each([
    ['INVALID_TOKEN', 'Invite error: INVALID_TOKEN'],
    ['EXPIRED', 'Invite error: EXPIRED'],
    ['MAX_USES_REACHED', 'Invite error: MAX_USES_REACHED'],
    ['ALREADY_MEMBER', 'Invite error: ALREADY_MEMBER'],
  ] as const)('code=%s produces message "%s"', (code, expectedMessage) => {
    const err = new InviteError(code)
    expect(err._tag).toBe('InviteError')
    expect(err.code).toBe(code)
    expect(err.message).toBe(expectedMessage)
    expect(err).toBeInstanceOf(Error)
  })
})

// ---------------------------------------------------------------------------
// isDomainError type-guard
// ---------------------------------------------------------------------------

describe('isDomainError', () => {
  it('returns true for all 8 domain error classes', () => {
    const errors = [
      new NotFoundError('Item', '1'),
      new PermissionError('add_item', 'editor'),
      new RateLimitError(20, new Date()),
      new AIError('bad response'),
      new ModerationError('BLURRY'),
      new StorageError('upload'),
      new PushDeliveryError('token', 'reason'),
      new InviteError('EXPIRED'),
    ]
    for (const e of errors) {
      expect(isDomainError(e)).toBe(true)
    }
  })

  it('returns false for a plain Error', () => {
    expect(isDomainError(new Error('plain'))).toBe(false)
  })

  it('returns false for a string', () => {
    expect(isDomainError('not an error')).toBe(false)
  })

  it('returns false for null', () => {
    expect(isDomainError(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isDomainError(undefined)).toBe(false)
  })
})
