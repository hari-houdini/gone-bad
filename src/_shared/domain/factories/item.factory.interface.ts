/**
 * @file IItemFactory — contract for constructing ItemInsert records from various input sources.
 */

import type { CheckItForm, ItemInsert, GeminiAnalyseSuccess } from '@/shared/types'

// ---------------------------------------------------------------------------
// IItemFactory
// ---------------------------------------------------------------------------

/**
 * Contract for constructing {@link ItemInsert} records from user-facing input sources.
 *
 * @remarks
 * Three factory methods cover the three entry paths:
 * - {@link IItemFactory.fromManualEntry} — user-typed form data (Phase 3).
 * - {@link IItemFactory.fromGeminiResponse} — AI image analysis result (Phase 4).
 * - {@link IItemFactory.fromBarcodeResponse} — Open Food Facts barcode lookup (Phase 4).
 *
 * All methods return a plain object that satisfies `ItemInsertSchema`. The
 * caller is responsible for persisting it via Supabase.
 */
export interface IItemFactory {
  /**
   * Builds an {@link ItemInsert} from validated Check It form data.
   *
   * @param form - Validated form data from `CheckItFormSchema`.
   * @param kitchenId - UUID of the kitchen the item belongs to.
   */
  fromManualEntry(form: CheckItForm, kitchenId: string): ItemInsert

  /**
   * Builds an {@link ItemInsert} from a successful Gemini `analyse-image` response.
   *
   * @param response - The successful Gemini analysis response.
   * @param kitchenId - UUID of the destination kitchen.
   */
  fromGeminiResponse(response: GeminiAnalyseSuccess, kitchenId: string): ItemInsert

  /**
   * Builds an {@link ItemInsert} from an Open Food Facts barcode lookup response.
   *
   * @param product - Raw product data from the Open Food Facts API.
   * @param kitchenId - UUID of the destination kitchen.
   */
  fromBarcodeResponse(product: unknown, kitchenId: string): ItemInsert
}
