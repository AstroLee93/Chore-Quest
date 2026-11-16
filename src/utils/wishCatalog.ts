/** Family Wish Catalog helpers: link reading, verification, photos and turning an item into a goal. */
import { FamilyDatabase, KidProfile, SavingsGoal, WishCatalogItem } from '../types';
import { generateDefaultMilestones } from './kidCoin';

export const DEFAULT_WISH_LIMIT = 150;
export const STALE_PRICE_DAYS = 30;

export const money = (n: number) => `$${(Number(n) || 0).toFixed(2)}`;
export const todayISO = () => new Date().toISOString().slice(0, 10);
export const daysSince = (isoDate: string) =>
  Math.max(0, Math.round((Date.now() - new Date(`${isoDate}T12:00:00`).getTime()) / 864e5));

export interface ParsedLink { store: string; code: string; name: string }

/** Read the store, item number and (when present) product name straight from a product link. */
export function readProductLink(url: string): ParsedLink | null {
  const title = (slug: string) =>
    decodeURIComponent(slug).replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b([a-z])/g, (m) => m.toUpperCase());
  let m: RegExpMatchArray | null;
  if ((m = url.match(/bestbuy\.com\/site\/(?:([^/?#]+)\/)?(\d{6,8})\.p/i))) return { store: 'Best Buy', code: m[2], name: m[1] ? title(m[1]) : '' };
  if ((m = url.match(/[?&]skuId=(\d{6,8})/i)) && /bestbuy\.com/i.test(url)) return { store: 'Best Buy', code: m[1], name: '' };
  if ((m = url.match(/amazon\.com\/(?:([^/?#]+)\/)?(?:dp|gp\/product)\/(B0[A-Z0-9]{8})/i)))
    return { store: 'Amazon', code: m[2].toUpperCase(), name: m[1] && !/^(dp|gp)$/i.test(m[1]) ? title(m[1]) : '' };
  if ((m = url.match(/target\.com\/p\/([^/?#]+)\/-\/A-(\d+)/i))) return { store: 'Target', code: m[2], name: title(m[1]) };
  if ((m = url.match(/walmart\.com\/ip\/(?:([^/?#]+)\/)?(\d{5,})/i))) return { store: 'Walmart', code: m[2], name: m[1] ? title(m[1]) : '' };
  return null;
}

export type CheckState = 'ok' | 'warn' | 'stop';
export interface Check { state: CheckState; text: string }

/** Everything a parent confirms before an item reaches the kids. 'stop' blocks adding. */
export function verifyItem(
  draft: { link: string; parsed: ParsedLink | null; name: string; price: number; photo?: string; fromBestBuy?: boolean },
  catalog: WishCatalogItem[],
  limit: number,
): Check[] {
  const { parsed, name, price, photo, fromBestBuy } = draft;
  const words = (s: string) => new Set(s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2));
  const linkWords = parsed?.name ? words(parsed.name) : null;
  const overlap = linkWords && name ? [...words(name)].filter((w) => linkWords.has(w)).length : 0;
  const dup = parsed && catalog.find((i) => i.store === parsed.store && i.code === parsed.code);
  const checks: Check[] = [];
  checks.push(parsed
    ? { state: 'ok', text: `Real ${parsed.store} product link (item ${parsed.code})` }
    : { state: 'stop', text: 'Needs a Best Buy, Amazon, Target or Walmart product link' });
  if (parsed) {
    checks.push(dup ? { state: 'stop', text: `Already in the catalog as "${dup.name}"` } : { state: 'ok', text: 'Not already in the catalog' });
    checks.push(fromBestBuy
      ? { state: 'ok', text: "Matches Best Buy's listing for this item" }
      : linkWords
        ? overlap > 0
          ? { state: 'ok', text: 'Name matches the product named in the link' }
          : { state: 'warn', text: `The link is for "${parsed.name}". Check the name you typed.` }
        : { state: 'warn', text: 'This link has no product name to compare. Check it on the store page.' });
  }
  checks.push(name.trim().length > 2 ? { state: 'ok', text: 'Has a name kids will recognise' } : { state: 'stop', text: 'Add a name' });
  checks.push(price > 0
    ? { state: 'ok', text: `Price ${money(price)}${fromBestBuy ? ' from Best Buy' : ' typed from the store page'}` }
    : { state: 'stop', text: 'Add the price from the store page' });
  if (price > 0) {
    checks.push(price > limit
      ? { state: 'warn', text: `${money(price)} is over your ${money(limit)} limit for kid goals` }
      : { state: 'ok', text: `Within your ${money(limit)} limit for kid goals` });
  }
  checks.push(photo ? { state: 'ok', text: 'Has a photo' } : { state: 'warn', text: 'No photo yet. Kids choose by picture, so add one.' });
  return checks;
}

export const itemsForKid = (db: FamilyDatabase, kid: KidProfile) =>
  (db.wishCatalog || [])
    .filter((i) => i.forKidIds.includes('all') || i.forKidIds.includes(kid.id))
    .sort((a, b) => a.price - b.price);

/** Same rule the old importer used: money already saved moves to the new goal. */
export const savedForNewGoal = (kid: KidProfile) =>
  kid.totalSaved && kid.totalSaved > 0
    ? kid.totalSaved
    : kid.goals?.find((g) => g.priority === 'primary')?.currentSaved || kid.goals?.[0]?.currentSaved || 0;

export const primaryGoalOf = (kid: KidProfile) => kid.goals?.find((g) => g.priority === 'primary') || kid.goals?.[0];

export function goalFromItem(item: WishCatalogItem, kid: KidProfile): SavingsGoal {
  const cost = Number(item.price.toFixed(2));
  const saved = Math.min(cost, savedForNewGoal(kid));
  return {
    id: `goal-wish-${item.id}-${Date.now()}`,
    title: item.name,
    category: 'Wish List',
    targetCost: cost,
    isVerified: true,
    verifiedSource: `${item.store} (item ${item.code})`,
    currentSaved: saved,
    priority: 'primary',
    icon: 'Gift',
    createdAt: todayISO(),
    retailer: item.store,
    sku: item.code,
    itemNumber: item.code,
    productUrl: item.url,
    imageUrl: item.photo,
    catalogItemId: item.id,
    confidence: item.autoPrice ? 'verified' : 'high',
    milestones: generateDefaultMilestones(cost, saved),
  };
}

/** Make `goal` the kid's primary goal (the others stay, as secondary). */
export function withPrimaryGoal(kid: KidProfile, goal: SavingsGoal): KidProfile {
  const others = (kid.goals || []).filter((g) => g.id !== goal.id).map((g) => ({ ...g, priority: 'secondary' as const }));
  return { ...kid, goals: [{ ...goal, priority: 'primary' }, ...others] };
}

/** Shrink to ≤1600px JPEG in the browser, then upload (parent PIN required by the server). */
export async function uploadWishPhoto(file: File, pin: string): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  const r = await fetch('/api/wish-photos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataUrl: c.toDataURL('image/jpeg', 0.86), pin }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'Upload failed');
  return j.url as string;
}

export async function deleteWishPhoto(url: string | undefined, pin: string) {
  if (!url || !url.startsWith('/api/wish-photos/')) return;
  await fetch(url, { method: 'DELETE', headers: { 'x-parent-pin': pin } }).catch(() => {});
}

export async function lookupBestBuy(sku: string): Promise<{ name: string; price: number; photo?: string; url?: string } | null> {
  try {
    const r = await fetch(`/api/bestbuy/${encodeURIComponent(sku)}`);
    const j = await r.json();
    return j.found ? j : null;
  } catch {
    return null;
  }
}
