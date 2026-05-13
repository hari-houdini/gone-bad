import { KitchenRole } from './kitchen-role.value-object'

// ---------------------------------------------------------------------------
// KitchenRole.from
// ---------------------------------------------------------------------------

describe('KitchenRole.from', () => {
  it('constructs from each valid role string', () => {
    expect(KitchenRole.from('owner').value).toBe('owner')
    expect(KitchenRole.from('editor').value).toBe('editor')
    expect(KitchenRole.from('viewer').value).toBe('viewer')
  })
})

// ---------------------------------------------------------------------------
// canWrite
// ---------------------------------------------------------------------------

describe('canWrite', () => {
  it('is true for owner', () => {
    expect(KitchenRole.from('owner').canWrite).toBe(true)
  })

  it('is true for editor', () => {
    expect(KitchenRole.from('editor').canWrite).toBe(true)
  })

  it('is false for viewer', () => {
    expect(KitchenRole.from('viewer').canWrite).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// canAdministrate
// ---------------------------------------------------------------------------

describe('canAdministrate', () => {
  it('is true for owner', () => {
    expect(KitchenRole.from('owner').canAdministrate).toBe(true)
  })

  it('is false for editor', () => {
    expect(KitchenRole.from('editor').canAdministrate).toBe(false)
  })

  it('is false for viewer', () => {
    expect(KitchenRole.from('viewer').canAdministrate).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// satisfies
// ---------------------------------------------------------------------------

describe('satisfies', () => {
  describe('owner', () => {
    const owner = KitchenRole.from('owner')
    it('satisfies owner', () => expect(owner.satisfies('owner')).toBe(true))
    it('satisfies editor', () => expect(owner.satisfies('editor')).toBe(true))
    it('satisfies viewer', () => expect(owner.satisfies('viewer')).toBe(true))
  })

  describe('editor', () => {
    const editor = KitchenRole.from('editor')
    it('does not satisfy owner', () => expect(editor.satisfies('owner')).toBe(false))
    it('satisfies editor', () => expect(editor.satisfies('editor')).toBe(true))
    it('satisfies viewer', () => expect(editor.satisfies('viewer')).toBe(true))
  })

  describe('viewer', () => {
    const viewer = KitchenRole.from('viewer')
    it('does not satisfy owner', () => expect(viewer.satisfies('owner')).toBe(false))
    it('does not satisfy editor', () => expect(viewer.satisfies('editor')).toBe(false))
    it('satisfies viewer', () => expect(viewer.satisfies('viewer')).toBe(true))
  })
})

// ---------------------------------------------------------------------------
// equals
// ---------------------------------------------------------------------------

describe('equals', () => {
  it('returns true for two roles with the same value', () => {
    expect(KitchenRole.from('editor').equals(KitchenRole.from('editor'))).toBe(true)
  })

  it('returns false for different roles', () => {
    expect(KitchenRole.from('owner').equals(KitchenRole.from('editor'))).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// toString
// ---------------------------------------------------------------------------

describe('toString', () => {
  it('returns the role string', () => {
    expect(KitchenRole.from('viewer').toString()).toBe('viewer')
  })
})
