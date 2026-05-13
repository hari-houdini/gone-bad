import { KitchenPermissionService } from './kitchen-permission.service'
import { PermissionError } from '@/shared/errors'
import type { KitchenAction } from './kitchen-permission.service'

// ---------------------------------------------------------------------------
// canPerformAction
// ---------------------------------------------------------------------------

describe('KitchenPermissionService.canPerformAction', () => {
  const writeActions: KitchenAction[] = ['add_item', 'edit_item', 'delete_item', 'generate_invite']
  const adminActions: KitchenAction[] = ['remove_member', 'rename_kitchen', 'delete_kitchen']

  describe('owner', () => {
    writeActions.forEach((action) => {
      it(`can ${action}`, () => {
        expect(KitchenPermissionService.canPerformAction('owner', action)).toBe(true)
      })
    })
    adminActions.forEach((action) => {
      it(`can ${action}`, () => {
        expect(KitchenPermissionService.canPerformAction('owner', action)).toBe(true)
      })
    })
  })

  describe('editor', () => {
    writeActions.forEach((action) => {
      it(`can ${action}`, () => {
        expect(KitchenPermissionService.canPerformAction('editor', action)).toBe(true)
      })
    })
    adminActions.forEach((action) => {
      it(`cannot ${action}`, () => {
        expect(KitchenPermissionService.canPerformAction('editor', action)).toBe(false)
      })
    })
  })

  describe('viewer', () => {
    writeActions.forEach((action) => {
      it(`cannot ${action}`, () => {
        expect(KitchenPermissionService.canPerformAction('viewer', action)).toBe(false)
      })
    })
    adminActions.forEach((action) => {
      it(`cannot ${action}`, () => {
        expect(KitchenPermissionService.canPerformAction('viewer', action)).toBe(false)
      })
    })
  })
})

// ---------------------------------------------------------------------------
// assertCan — happy path (no throw)
// ---------------------------------------------------------------------------

describe('KitchenPermissionService.assertCan — allowed', () => {
  it('does not throw when owner performs a write action', () => {
    expect(() => KitchenPermissionService.assertCan('owner', 'add_item')).not.toThrow()
  })

  it('does not throw when owner performs an admin action', () => {
    expect(() => KitchenPermissionService.assertCan('owner', 'delete_kitchen')).not.toThrow()
  })

  it('does not throw when editor performs a write action', () => {
    expect(() => KitchenPermissionService.assertCan('editor', 'edit_item')).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// assertCan — throws PermissionError
// ---------------------------------------------------------------------------

describe('KitchenPermissionService.assertCan — denied', () => {
  it('throws PermissionError when viewer tries to add an item', () => {
    expect(() => KitchenPermissionService.assertCan('viewer', 'add_item')).toThrow(PermissionError)
  })

  it('throws PermissionError when editor tries to remove a member', () => {
    expect(() =>
      KitchenPermissionService.assertCan('editor', 'remove_member'),
    ).toThrow(PermissionError)
  })

  it('carries the action on the thrown error', () => {
    try {
      KitchenPermissionService.assertCan('viewer', 'delete_kitchen')
    } catch (e) {
      expect(e).toBeInstanceOf(PermissionError)
      const err = e as PermissionError
      expect(err.action).toBe('delete_kitchen')
      expect(err.requiredRole).toBe('owner')
    }
  })

  it('has the correct _tag on the thrown error', () => {
    try {
      KitchenPermissionService.assertCan('viewer', 'rename_kitchen')
    } catch (e) {
      expect((e as PermissionError)._tag).toBe('PermissionError')
    }
  })
})
