import { GroceryCategory, GroceryItem, PriceHistoryEntry } from '../types';

export interface EstimatePriceResponse {
  estimatedCost: number;
  currency: string;
  priceSource: 'ai' | 'receipt';
  fallback?: boolean;
}

export interface EstimateBatchResponse {
  estimates: Record<string, number>;
  currency: string;
  priceSource: 'ai' | 'receipt';
  fallback?: boolean;
}

export interface ParsedReceiptItem {
  name: string;
  price: number;
  quantity: string;
  category: GroceryCategory;
  notes?: string;
}

export interface ParsedReceiptResponse {
  success: boolean;
  storeName?: string | null;
  receiptDate?: string | null;
  currency?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  items: ParsedReceiptItem[];
  fallback?: boolean;
  error?: string;
}

/**
 * Normalizes an item name for consistent price history keying
 */
export function normalizeItemKey(name: string): string {
  return (name || '').toLowerCase().trim().replace(/[\s\-_]+/g, ' ');
}

/**
 * Checks price history for a matching item name (exact or substring)
 */
export function findHistoricalPrice(
  name: string,
  priceHistory?: Record<string, PriceHistoryEntry>
): PriceHistoryEntry | undefined {
  if (!priceHistory || !name) return undefined;
  const key = normalizeItemKey(name);
  if (priceHistory[key]) return priceHistory[key];

  // Try partial match
  for (const [histKey, entry] of Object.entries(priceHistory)) {
    if (key.includes(histKey) || histKey.includes(key)) {
      return entry;
    }
  }
  return undefined;
}

/**
 * Calls backend Gemini-powered endpoint to estimate typical US grocery store price for an item
 */
export async function estimateGroceryItemPriceApi(
  name: string,
  quantity?: string,
  priceHistory?: Record<string, PriceHistoryEntry>
): Promise<EstimatePriceResponse> {
  // Check known price history first on the client
  const historical = findHistoricalPrice(name, priceHistory);
  if (historical && historical.price > 0) {
    return {
      estimatedCost: historical.price,
      currency: 'USD',
      priceSource: 'receipt',
    };
  }

  try {
    const knownPricesMap: Record<string, number> = {};
    if (priceHistory) {
      Object.entries(priceHistory).forEach(([k, v]) => {
        knownPricesMap[k] = v.price;
      });
    }

    const res = await fetch('/api/grocery/estimate-price', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, quantity, knownPrices: knownPricesMap }),
    });

    if (!res.ok) {
      throw new Error(`Estimate API error ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('[GroceryPricing] Failed to estimate price via server, using client fallback:', err);
    return {
      estimatedCost: 3.49,
      currency: 'USD',
      priceSource: 'ai',
      fallback: true,
    };
  }
}

/**
 * Calls backend Gemini-powered batch estimation endpoint for multiple items at once
 */
export async function estimateGroceryItemsBatchApi(
  items: Array<{ id: string; name: string; quantity?: string }>,
  priceHistory?: Record<string, PriceHistoryEntry>
): Promise<Record<string, number>> {
  if (!items || items.length === 0) return {};

  const estimates: Record<string, number> = {};
  const itemsToFetch: Array<{ id: string; name: string; quantity?: string }> = [];

  // Check known price history on client
  items.forEach((it) => {
    const hist = findHistoricalPrice(it.name, priceHistory);
    if (hist && hist.price > 0) {
      estimates[it.id] = hist.price;
    } else {
      itemsToFetch.push(it);
    }
  });

  if (itemsToFetch.length === 0) {
    return estimates;
  }

  try {
    const knownPricesMap: Record<string, number> = {};
    if (priceHistory) {
      Object.entries(priceHistory).forEach(([k, v]) => {
        knownPricesMap[k] = v.price;
      });
    }

    const res = await fetch('/api/grocery/estimate-prices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: itemsToFetch, knownPrices: knownPricesMap }),
    });

    if (!res.ok) {
      throw new Error(`Batch Estimate API error ${res.status}`);
    }

    const data: EstimateBatchResponse = await res.json();
    return { ...estimates, ...(data.estimates || {}) };
  } catch (err) {
    console.warn('[GroceryPricing] Batch estimate failed, using client fallbacks:', err);
    itemsToFetch.forEach((item) => {
      estimates[item.id] = 3.49;
    });
    return estimates;
  }
}

/**
 * Calls backend Gemini multimodal receipt OCR endpoint to parse image
 */
export async function parseReceiptImageApi(
  image: string,
  mimeType = 'image/jpeg'
): Promise<ParsedReceiptResponse> {
  const res = await fetch('/api/grocery/parse-receipt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image, mimeType }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server receipt parse failed with HTTP ${res.status}`);
  }

  return await res.json();
}

export interface GroceryBudgetSummary {
  itemsCount: number;
  estimatedTotal: number;
  actualTotal: number;
  hasOverriddenPrices: boolean;
  overriddenCount: number;
  receiptPricesCount: number;
  effectiveTotal: number;
  acquiredTotal: number;
  neededTotal: number;
  budgetTarget?: number;
  budgetDiff?: number;
  isOverBudget: boolean;
  budgetPercent: number;
}

/**
 * Calculates budget summary metrics for the grocery list
 */
export function calculateGroceryBudgetSummary(
  items: GroceryItem[],
  budgetTarget?: number
): GroceryBudgetSummary {
  let pureEstimatedSum = 0;
  let actualSum = 0;
  let effectiveSum = 0;
  let acquiredSum = 0;
  let neededSum = 0;
  let overriddenCount = 0;
  let receiptPricesCount = 0;

  items.forEach((item) => {
    const hasActual = item.actualCost !== undefined && item.actualCost !== null && !isNaN(item.actualCost);
    const est = item.estimatedCost ?? 0;
    const act = hasActual ? (item.actualCost as number) : est;

    if (hasActual) {
      overriddenCount++;
      if (item.priceSource === 'receipt') {
        receiptPricesCount++;
      }
    }

    pureEstimatedSum += est > 0 ? est : (hasActual ? (item.actualCost as number) : 0);
    actualSum += hasActual ? (item.actualCost as number) : 0;
    effectiveSum += act;

    if (item.acquired) {
      acquiredSum += act;
    } else {
      neededSum += act;
    }
  });

  const hasOverriddenPrices = overriddenCount > 0;
  const budgetDiff = budgetTarget !== undefined && budgetTarget > 0 ? budgetTarget - effectiveSum : undefined;
  const isOverBudget = budgetDiff !== undefined && budgetDiff < 0;
  const budgetPercent = budgetTarget && budgetTarget > 0 ? Math.min(999, Math.round((effectiveSum / budgetTarget) * 100)) : 0;

  return {
    itemsCount: items.length,
    estimatedTotal: Number(pureEstimatedSum.toFixed(2)),
    actualTotal: Number(actualSum.toFixed(2)),
    hasOverriddenPrices,
    overriddenCount,
    receiptPricesCount,
    effectiveTotal: Number(effectiveSum.toFixed(2)),
    acquiredTotal: Number(acquiredSum.toFixed(2)),
    neededTotal: Number(neededSum.toFixed(2)),
    budgetTarget,
    budgetDiff: budgetDiff !== undefined ? Number(budgetDiff.toFixed(2)) : undefined,
    isOverBudget,
    budgetPercent,
  };
}
