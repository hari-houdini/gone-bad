/**
 * @file ISpecification — generic base contract for all specification objects.
 */

// ---------------------------------------------------------------------------
// ISpecification
// ---------------------------------------------------------------------------

/**
 * A specification that evaluates whether a candidate satisfies a business rule.
 *
 * @typeParam T - The domain type the specification evaluates.
 *
 * @remarks
 * Implement this interface for every domain rule that needs to be composed,
 * tested, or injected independently of the objects it evaluates.
 */
export interface ISpecification<T> {
  /**
   * Returns `true` when `candidate` satisfies the encoded business rule.
   *
   * @param candidate - The domain object to evaluate.
   */
  isSatisfiedBy(candidate: T): boolean
}
