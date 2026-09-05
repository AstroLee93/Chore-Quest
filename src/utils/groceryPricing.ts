import { GroceryItem } from '../types';

export interface EstimatePriceResponse {
  estimatedCost: number;
  currency: string;
  priceSource: 'ai';
  fallback?: boolean;
}

export interface EstimateBatchResponse {
  estimates: Record<string, number>;
  currency: string;
  priceSource: 'ai';
  fallback?: boolean;
}

/**
 * Calls backend Gemini-powered endpoint to estimate typical US grocery store price for an item
 */
export async function estimateGroceryItemPriceApi(
  name: string,
  quantity?: string
): Promise<EstimatePriceResponse> {
  try {
    const res = await fetch('/api/grocery/estimate-price', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, quantity }),
    });

    if (!res.ok) {
      throw new Error(`Estimate API error ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('[GroceryPricing] Failed to estimate price via server, using client fallback:', err);
    // Simple client fallback if offline
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
  items: Array<{ id: string; name: string; quantity?: string }>
): Promise<Record<string, number>> {
  if (!items || items.length === 0) return {};

  try {
    const res = await fetch('/api/grocery/estimate-prices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    if (!res.ok) {
      throw new Error(`Batch Estimate API error ${res.status}`);
    }

    const data: EstimateBatchResponse = await res.json();
    return data.estimates || {};
  } catch (err) {
    console.warn('[GroceryPricing] Batch estimate failed, using client fallbacks:', err);
    const fallbackMap: Record<string, number> = {};
    items.forEach((item) => {
      fallbackMap[item.id] = 3.49;
    });
    return fallbackMap;
  }
}

export interface GroceryBudgetSummary {
  itemsCount: number;
  estimatedTotal: number;
  actualTotal: number;
  hasOverriddenPrices: boolean;
  overriddenCount: number;
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

  items.forEach((item) => {
    const hasActual = item.actualCost !== undefined && item.actualCost !== null && !isNaN(item.actualCost);
    const est = item.estimatedCost ?? 0;
    const act = hasActual ? (item.actualCost as number) : est;

    if (hasActual) {
      overriddenCount++;
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
    effectiveTotal: Number(effectiveSum.toFixed(2)),
    acquiredTotal: Number(acquiredSum.toFixed(2)),
    neededTotal: Number(neededSum.toFixed(2)),
    budgetTarget,
    budgetDiff: budgetDiff !== undefined ? Number(budgetDiff.toFixed(2)) : undefined,
    isOverBudget,
    budgetPercent,
  };
}
