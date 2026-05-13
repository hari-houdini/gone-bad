/**
 * @file IDueForNotificationSpec — contract for the notification eligibility specification.
 */

import type { ItemRow } from '@/shared/types'
import type { ISpecification } from './specification.interface'

// ---------------------------------------------------------------------------
// IDueForNotificationSpec
// ---------------------------------------------------------------------------

/**
 * Contract for a specification that returns `true` when an item should receive
 * a push notification on the evaluation date.
 *
 * @remarks
 * Implementations must check `status === 'active'`, a non-null `expiry_date`,
 * and whether the expiry falls within the per-item or default notification window.
 */
export interface IDueForNotificationSpec extends ISpecification<ItemRow> {}
