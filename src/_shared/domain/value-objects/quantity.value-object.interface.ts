/**
 * @file IQuantity — contract for the Quantity value object.
 */

// ---------------------------------------------------------------------------
// IQuantity
// ---------------------------------------------------------------------------

/**
 * Describes the instance API of an immutable quantity value object.
 *
 * @remarks
 * Static factory methods are construction concerns and are not part of this
 * interface. `unit` is free-text metadata; unit-compatibility checks are the
 * caller's responsibility.
 */
export interface IQuantity {
  /** Numeric amount; always `≥ 0`. */
  readonly value: number
  /** Optional free-text unit label, e.g. `'g'`, `'ml'`, `'slices'`. */
  readonly unit: string | null

  /**
   * Returns a new quantity with `amount` subtracted, clamped to `0`.
   *
   * @param amount - The amount to subtract; must be `> 0`.
   */
  subtract(amount: number): IQuantity

  /**
   * Returns `true` when consuming `amount` would leave nothing remaining
   * (`amount ≥ this.value`).
   *
   * @param amount - The proposed consumption amount.
   */
  isFullyConsumedBy(amount: number): boolean

  /**
   * Returns `true` when both quantities have the same value and unit.
   *
   * @param other - Another quantity to compare.
   */
  equals(other: IQuantity): boolean

  /** Returns a human-readable string, e.g. `'2.5 kg'` or `'1'`. */
  toString(): string
}
