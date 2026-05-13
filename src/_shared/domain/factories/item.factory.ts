/**
 * @file ItemFactory — constructs `ItemInsert` records from various input sources.
 *
 * @remarks
 * Three factory methods cover the three entry paths:
 * - {@link ItemFactory.fromManualEntry} — user-typed form data (Phase 3).
 * - {@link ItemFactory.fromGeminiResponse} — AI image analysis result (Phase 4).
 * - {@link ItemFactory.fromBarcodeResponse} — Open Food Facts barcode lookup (Phase 4).
 *
 * The last two are stubs in Phase 0. They throw a clear error if called before
 * their implementations land, making accidental early invocations visible
 * immediately rather than producing silent data corruption.
 */

import type { CheckItForm, ItemInsert, GeminiAnalyseSuccess } from '@/shared/types'
import type { IItemFactory } from './item.factory.interface'

// ---------------------------------------------------------------------------
// ItemFactory
// ---------------------------------------------------------------------------

/**
 * Constructs {@link ItemInsert} records from various user-facing input sources.
 *
 * @remarks
 * All methods return a plain object that satisfies `ItemInsertSchema`. The
 * caller is responsible for persisting it via Supabase.
 *
 * Fields managed by the server (image URLs, `added_by`, `status`) are never
 * set here — they are either omitted (relying on DB defaults) or populated by
 * Edge Functions.
 */
export class ItemFactory implements IItemFactory {
  // ---------------------------------------------------------------------------
  // fromManualEntry
  // ---------------------------------------------------------------------------

  /**
   * Builds an {@link ItemInsert} from validated Check It form data.
   *
   * @remarks
   * The following fields are intentionally set to `null` because they are
   * populated exclusively by the scan pipeline (Phase 4):
   * - `image_path` — uploaded and managed by the `process-image` Edge Function.
   * - `barcode` — only present on barcode-scanned items.
   * - `ai_confidence` — only present when Gemini analysed an image.
   *
   * @param form - Validated form data from `CheckItFormSchema`.
   * @param kitchenId - UUID of the kitchen the item belongs to.
   * @returns A complete {@link ItemInsert} ready to persist.
   */
  fromManualEntry(form: CheckItForm, kitchenId: string): ItemInsert {
    return {
      kitchen_id: kitchenId,
      name: form.name,
      description: form.description ?? null,
      tags: form.tags,
      quantity: form.quantity,
      quantity_unit: form.quantity_unit ?? null,
      purchase_date: form.purchase_date ?? null,
      opened_date: form.opened_date ?? null,
      expiry_date: form.expiry_date ?? null,
      expiry_source: form.expiry_source,
      storage_suggestion: form.storage_suggestion ?? null,
      notification_days_before: form.notification_days_before ?? null,
      // Scan-pipeline fields — always null for manual entry.
      image_path: null,
      barcode: null,
      ai_confidence: null,
    }
  }

  // ---------------------------------------------------------------------------
  // fromGeminiResponse (Phase 4 stub)
  // ---------------------------------------------------------------------------

  /**
   * Builds an {@link ItemInsert} from a successful Gemini `analyse-image` response.
   *
   * @remarks
   * **Not implemented until Phase 4.** Calling this method before then throws.
   *
   * When implemented, this method will:
   * - Use {@link ExpiryEstimationService} when `expiry_date_visible_in_image` is `false`.
   * - Map `confidence`, `tags`, `storage_suggestion`, and `description` from the response.
   *
   * @param _response - The successful Gemini analysis response.
   * @param _kitchenId - UUID of the destination kitchen.
   * @throws {Error} Always — implementation pending Phase 4.
   */
  fromGeminiResponse(_response: GeminiAnalyseSuccess, _kitchenId: string): ItemInsert {
    throw new Error(
      'ItemFactory.fromGeminiResponse is not implemented until Phase 4 (analyse-image pipeline)',
    )
  }

  // ---------------------------------------------------------------------------
  // fromBarcodeResponse (Phase 4 stub)
  // ---------------------------------------------------------------------------

  /**
   * Builds an {@link ItemInsert} from an Open Food Facts barcode lookup response.
   *
   * @remarks
   * **Not implemented until Phase 4.** Calling this method before then throws.
   *
   * The `product` parameter will be typed as `OpenFoodFactsProduct` in Phase 4
   * when that type is introduced alongside the barcode scanning service.
   *
   * @param _product - Raw product data from the Open Food Facts API.
   * @param _kitchenId - UUID of the destination kitchen.
   * @throws {Error} Always — implementation pending Phase 4.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fromBarcodeResponse(_product: unknown, _kitchenId: string): ItemInsert {
    throw new Error(
      'ItemFactory.fromBarcodeResponse is not implemented until Phase 4 (barcode scan pipeline)',
    )
  }
}
