/**
 * @file Expiry specification interfaces for the Dashboard urgency grid.
 */

import type { ItemRow } from '@/shared/types'
import type { ISpecification } from './specification.interface'

// ---------------------------------------------------------------------------
// IIsExpiredSpec
// ---------------------------------------------------------------------------

/**
 * Contract for a specification that returns `true` when an item's expiry date
 * has passed.
 *
 * @remarks
 * Implementations must return `false` for items with a `null` expiry date.
 */
export interface IIsExpiredSpec extends ISpecification<ItemRow> {}

// ---------------------------------------------------------------------------
// IIsExpiringSoonSpec
// ---------------------------------------------------------------------------

/**
 * Contract for a specification that returns `true` when an item is not yet
 * expired but within the configured alert threshold.
 */
export interface IIsExpiringSoonSpec extends ISpecification<ItemRow> {}

// ---------------------------------------------------------------------------
// IIsFreshSpec
// ---------------------------------------------------------------------------

/**
 * Contract for a specification that returns `true` when an item is outside
 * all urgency thresholds (or has no expiry date).
 */
export interface IIsFreshSpec extends ISpecification<ItemRow> {}
