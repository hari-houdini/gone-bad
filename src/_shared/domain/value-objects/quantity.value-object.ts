/**
 * @file Quantity value object — numeric amount with an optional unit label.
 *
 * @remarks
 * Quantity is immutable: mutating operations return a new instance. The value
 * is always `≥ 0`; subtraction clamps at zero rather than throwing.
 */

import type { IQuantity } from './quantity.value-object.interface'

// ---------------------------------------------------------------------------
// Quantity
// ---------------------------------------------------------------------------

/**
 * Immutable value object representing a measurable quantity of a food item.
 *
 * @remarks
 * `unit` is a free-text display string (e.g. `'g'`, `'ml'`, `'slices'`). It is
 * metadata only — unit compatibility is the caller's responsibility and is not
 * enforced here.
 */
export class Quantity implements IQuantity {
  /** Numeric amount; always `≥ 0`. */
  readonly value: number
  /** Optional free-text unit label, e.g. `'g'`, `'ml'`, `'slices'`. */
  readonly unit: string | null

  /**
   * @param value - Non-negative numeric amount.
   * @param unit - Optional free-text unit label. Pass `null` when unitless.
   * @throws {Error} When `value` is negative or `NaN`.
   */
  constructor(value: number, unit: string | null = null) {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`Quantity: value must be a finite non-negative number, got ${value}`)
    }
    this.value = value
    this.unit = unit
  }

  // ---------------------------------------------------------------------------
  // Business logic
  // ---------------------------------------------------------------------------

  /**
   * Returns a new {@link Quantity} with `amount` subtracted from the current
   * value, clamped to a minimum of `0`.
   *
   * @remarks
   * Clamping avoids throwing on slight over-consumption (e.g. the recorded
   * value is stale). The unit is preserved unchanged.
   *
   * @param amount - The amount to subtract; must be `> 0`.
   * @returns A new {@link Quantity} with the reduced value.
   * @throws {Error} When `amount` is not a positive finite number.
   */
  subtract(amount: number): Quantity {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error(`Quantity.subtract: amount must be a positive finite number, got ${amount}`)
    }
    return new Quantity(Math.max(0, this.value - amount), this.unit)
  }

  /**
   * Returns `true` when consuming `amount` would leave nothing remaining.
   *
   * @remarks
   * Used by the item lifecycle machine to decide whether to transition to a
   * terminal `'used'` or `'wasted'` state vs. staying `'active'` after a
   * partial consumption event.
   *
   * @param amount - The proposed consumption amount.
   * @returns `true` if `amount ≥ this.value`.
   */
  isFullyConsumedBy(amount: number): boolean {
    return amount >= this.value
  }

  /**
   * Returns `true` when both quantities have the same numeric value and unit.
   *
   * @param other - Another {@link Quantity} to compare.
   * @returns `true` if `value` and `unit` are equal.
   */
  equals(other: Quantity): boolean {
    return this.value === other.value && this.unit === other.unit
  }

  /** Returns a human-readable string, e.g. `'2.5 kg'` or `'1'`. */
  toString(): string {
    return this.unit != null ? `${this.value} ${this.unit}` : String(this.value)
  }
}
