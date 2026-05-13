import { ItemTags } from './item-tags.value-object'
import type { ItemTag } from '@/shared/types'

// ---------------------------------------------------------------------------
// ItemTags.from
// ---------------------------------------------------------------------------

describe('ItemTags.from', () => {
  it('constructs from a non-empty array', () => {
    const tags = ItemTags.from(['Dairy', 'Produce'])
    expect(tags.size).toBe(2)
  })

  it('deduplicates repeated tags', () => {
    const tags = ItemTags.from(['Dairy', 'Dairy', 'Produce'])
    expect(tags.size).toBe(2)
    expect(tags.values).toEqual(['Dairy', 'Produce'])
  })

  it('constructs from an empty array', () => {
    const tags = ItemTags.from([])
    expect(tags.size).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// ItemTags.empty
// ---------------------------------------------------------------------------

describe('ItemTags.empty', () => {
  it('returns an instance with zero tags', () => {
    expect(ItemTags.empty().size).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// values
// ---------------------------------------------------------------------------

describe('values', () => {
  it('returns tags in insertion order', () => {
    const tags = ItemTags.from(['Bakery', 'Dairy', 'Meat'])
    expect(tags.values).toEqual(['Bakery', 'Dairy', 'Meat'])
  })
})

// ---------------------------------------------------------------------------
// add
// ---------------------------------------------------------------------------

describe('add', () => {
  it('returns a new instance with the tag appended', () => {
    const original = ItemTags.from(['Dairy'])
    const result = original.add('Produce')
    expect(result.size).toBe(2)
    expect(result.has('Produce')).toBe(true)
  })

  it('does not mutate the original instance', () => {
    const original = ItemTags.from(['Dairy'])
    original.add('Produce')
    expect(original.size).toBe(1)
  })

  it('is idempotent — adding an existing tag does not change size', () => {
    const tags = ItemTags.from(['Dairy'])
    const result = tags.add('Dairy')
    expect(result.size).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// remove
// ---------------------------------------------------------------------------

describe('remove', () => {
  it('returns a new instance without the removed tag', () => {
    const tags = ItemTags.from(['Dairy', 'Produce', 'Meat'])
    const result = tags.remove('Produce')
    expect(result.size).toBe(2)
    expect(result.has('Produce')).toBe(false)
  })

  it('does not mutate the original', () => {
    const original = ItemTags.from(['Dairy', 'Produce'])
    original.remove('Dairy')
    expect(original.size).toBe(2)
  })

  it('is a no-op when the tag is not present', () => {
    const tags = ItemTags.from(['Dairy'])
    const result = tags.remove('Meat' as ItemTag)
    expect(result.size).toBe(1)
    expect(result.has('Dairy')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// has
// ---------------------------------------------------------------------------

describe('has', () => {
  it('returns true for a present tag', () => {
    const tags = ItemTags.from(['Dairy', 'Frozen'])
    expect(tags.has('Frozen')).toBe(true)
  })

  it('returns false for an absent tag', () => {
    const tags = ItemTags.from(['Dairy'])
    expect(tags.has('Meat')).toBe(false)
  })

  it('returns false on an empty instance', () => {
    expect(ItemTags.empty().has('Dairy')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// equals
// ---------------------------------------------------------------------------

describe('equals', () => {
  it('returns true for identical tag sets', () => {
    const a = ItemTags.from(['Dairy', 'Produce'])
    const b = ItemTags.from(['Dairy', 'Produce'])
    expect(a.equals(b)).toBe(true)
  })

  it('returns true regardless of insertion order', () => {
    const a = ItemTags.from(['Dairy', 'Produce'])
    const b = ItemTags.from(['Produce', 'Dairy'])
    expect(a.equals(b)).toBe(true)
  })

  it('returns false when sizes differ', () => {
    const a = ItemTags.from(['Dairy', 'Produce'])
    const b = ItemTags.from(['Dairy'])
    expect(a.equals(b)).toBe(false)
  })

  it('returns false when tag content differs', () => {
    const a = ItemTags.from(['Dairy', 'Meat'])
    const b = ItemTags.from(['Dairy', 'Produce'])
    expect(a.equals(b)).toBe(false)
  })

  it('returns true for two empty instances', () => {
    expect(ItemTags.empty().equals(ItemTags.empty())).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// toArray
// ---------------------------------------------------------------------------

describe('toArray', () => {
  it('returns a mutable copy of the tags', () => {
    const tags = ItemTags.from(['Dairy', 'Produce'])
    const arr = tags.toArray()
    arr.push('Meat' as ItemTag)
    expect(tags.size).toBe(2)
  })
})
