/**
 * KitchenSheet — the 2026 Kitchen (docs/design-2026, mockups DinnerWeek,
 * CookMode, GroceryList, Pantry).
 *
 * One full-screen sheet with three tabs — Dinners · Groceries · Pantry — on
 * top of the existing data (database.weeklyMenu / database.weeklyGroceryList).
 * The original WeeklyMenuModal / WeeklyGroceryModal stay available through
 * "More tools" for presets, recipe editing, receipts, prices and printing.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X, ChefHat, ShoppingCart, Check, Plus, ChevronLeft, ChevronRight, Timer, MoreHorizontal, Store, Package, Clock,
} from 'lucide-react';
import {
  DayOfWeekKey, FamilyDatabase, GroceryItem, GroceryRequest, KidProfile, MealRecipe, WeeklyDinnerMenu, WeeklyGroceryList,
} from '../../types';
import { DEFAULT_WEEKLY_MENU, getCurrentDayOfWeekKey, getRecipeForDish } from '../../utils/menu';
import {
  DEFAULT_WEEKLY_GROCERY_LIST, GROCERY_CATEGORY_METADATA, detectGroceryCategory, extractIngredientsFromMenu,
  groupGroceryItemsByCategory, importDepletedItemsToGroceryList, parseIngredientToGroceryItem, getPantryDepletedItems,
} from '../../utils/grocery';
import { getTodayDateString } from '../../utils/storage';
import { sound } from '../../utils/sound';
import { haptic } from '../../utils/haptics';
import { initials } from '../../utils/progress';

export type KitchenTab = 'dinners' | 'groceries' | 'pantry';

interface KitchenSheetProps {
  database: FamilyDatabase;
  onUpdateDatabase: (db: FamilyDatabase) => void;
  activeKid: KidProfile | null;
  isParentMode: boolean;
  tab: KitchenTab;
  onTabChange: (tab: KitchenTab) => void;
  onClose: () => void;
  onOpenMoreTools: (which: 'menu' | 'grocery') => void;
}

const DAYS: DayOfWeekKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_SHORT: Record<DayOfWeekKey, string> = {
  monday: 'M', tuesday: 'T', wednesday: 'W', thursday: 'T', friday: 'F', saturday: 'S', sunday: 'S',
};
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const norm = (s: string) => s.toLowerCase().trim();
const money = (n: number) => '$' + n.toFixed(n >= 100 ? 0 : 2);

/** Date number for each weekday of the current week (Mon-first). */
function weekDates(): Record<DayOfWeekKey, number> {
  const now = new Date();
  const mondayOffset = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);
  const out = {} as Record<DayOfWeekKey, number>;
  DAYS.forEach((d, i) => {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + i);
    out[d] = dt.getDate();
  });
  return out;
}

const Segmented: React.FC<{ value: string; options: [string, string][]; onChange: (v: string) => void; label: string }> = ({ value, options, onChange, label }) => (
  <div className="ios-segmented !max-w-none" role="radiogroup" aria-label={label}>
    {options.map(([v, text]) => (
      <button key={v} type="button" role="radio" aria-checked={value === v} className="ios-segment" onClick={() => { sound.playTap(); onChange(v); }}>
        {text}
      </button>
    ))}
  </div>
);

const Card: React.FC<{ className?: string; children: React.ReactNode; label?: string }> = ({ className = '', children, label }) => (
  <section aria-label={label} className={`rounded-[20px] bg-[var(--cq-surface)] border border-[var(--cq-line)] ${className}`}>{children}</section>
);

const Eyebrow: React.FC<{ children: React.ReactNode; id?: string }> = ({ children, id }) => (
  <h2 id={id} className="m-0 px-1 text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--cq-label-2)]">{children}</h2>
);

const CheckDot: React.FC<{ done: boolean; size?: number }> = ({ done, size = 24 }) => (
  <span
    aria-hidden="true"
    className="rounded-full flex items-center justify-center shrink-0 transition-colors"
    style={{
      width: size, height: size,
      background: done ? 'var(--cq-done)' : 'transparent',
      border: done ? 'none' : '2px solid var(--cq-label-3)',
      color: 'var(--cq-ground)',
    }}
  >
    {done && <Check className="w-3.5 h-3.5" strokeWidth={3.2} />}
  </span>
);

/* ─────────────────────────────── Cook mode ─────────────────────────────── */

export const CookMode: React.FC<{ dish: string; recipe: MealRecipe; onClose: () => void }> = ({ dish, recipe, onClose }) => {
  const steps = recipe.instructions?.length ? recipe.instructions : ['Follow your recipe.'];
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [timerLeft, setTimerLeft] = useState<number | null>(null);
  const minutes = useMemo(() => {
    const m = steps[step].match(/(\d+)\s*(?:-|–|to)?\s*\d*\s*(?:min|minute)/i);
    return m ? Number(m[1]) : null;
  }, [steps, step]);

  // Keep the screen on while cooking (where the browser supports it)
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } };
    nav.wakeLock?.request('screen').then((l) => { lock = l; }).catch(() => {});
    return () => { lock?.release().catch(() => {}); };
  }, []);

  useEffect(() => {
    if (timerLeft === null || timerLeft <= 0) {
      if (timerLeft === 0) { sound.playLevelUp(); haptic('success'); }
      return;
    }
    const t = setTimeout(() => setTimerLeft((s) => (s === null ? null : s - 1)), 1000);
    return () => clearTimeout(t);
  }, [timerLeft]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-[70] cq-ground flex flex-col" role="dialog" aria-modal="true" aria-label={`Cook mode: ${dish}`}>
      <div className="max-w-[640px] w-full mx-auto flex-1 flex flex-col gap-5 px-5 pt-[calc(var(--safe-top,0px)+20px)] pb-[calc(var(--safe-bottom,0px)+20px)] overflow-y-auto">
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={onClose} aria-label="Close cook mode" className="w-11 h-11 rounded-full bg-[var(--cq-surface)] border border-[var(--cq-line)] flex items-center justify-center cursor-pointer">
            <X className="w-[18px] h-[18px]" />
          </button>
          <span className="text-[15px] font-semibold truncate">{dish}</span>
          <span className="text-[13px] text-[var(--cq-label-2)] cq-num min-w-[44px] text-right">{step + 1} of {steps.length}</span>
        </div>
        <div aria-hidden="true" className="grid gap-1" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
          {steps.map((_, i) => (
            <span key={i} className="h-1 rounded-full" style={{ background: i <= step ? 'var(--cq-accent)' : 'var(--cq-line)' }} />
          ))}
        </div>

        <section aria-live="polite" className="flex flex-col gap-3 mt-2">
          <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--cq-label-2)]">Step {step + 1}</span>
          <p className="m-0 text-[26px] sm:text-[30px] font-medium leading-[1.25] tracking-[-0.01em]">{steps[step]}</p>
        </section>

        {minutes !== null && (
          <button
            type="button"
            onClick={() => { sound.playTap(); setTimerLeft(timerLeft && timerLeft > 0 ? null : minutes * 60); }}
            className="flex items-center gap-4 min-h-[72px] px-5 rounded-[20px] border border-[var(--cq-line)] bg-[var(--cq-accent-soft)] cursor-pointer text-left"
          >
            <Timer className="w-7 h-7 text-[var(--cq-accent-text)]" strokeWidth={1.8} />
            <span className="flex-1 flex flex-col">
              <span className="text-[28px] font-light cq-num">{fmt(timerLeft ?? minutes * 60)}</span>
              <span className="text-[13px] text-[var(--cq-label-2)]">{timerLeft === 0 ? 'Time’s up!' : 'Timer for this step'}</span>
            </span>
            <span className="text-[15px] font-semibold text-[var(--cq-accent-text)]">{timerLeft && timerLeft > 0 ? 'Stop' : 'Start'}</span>
          </button>
        )}

        {recipe.ingredients?.length > 0 && (
          <Card className="px-4 py-1.5" label="Ingredients">
            <h2 className="mt-2.5 mb-1 text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--cq-label-2)]">Ingredients</h2>
            {recipe.ingredients.map((ing, i) => (
              <button
                key={i}
                type="button"
                role="checkbox"
                aria-checked={checked.has(i)}
                onClick={() => setChecked((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; })}
                className={`w-full flex items-center gap-3 min-h-[44px] text-left cursor-pointer ${i ? 'border-t border-[var(--cq-line)]' : ''}`}
              >
                <CheckDot done={checked.has(i)} size={22} />
                <span className={`text-[16px] ${checked.has(i) ? 'line-through text-[var(--cq-label-3)]' : ''}`}>{ing}</span>
              </button>
            ))}
          </Card>
        )}

        <div className="sticky bottom-0 mt-auto pt-3 pb-1 grid grid-cols-[1fr_2fr] gap-2.5 bg-[var(--cq-ground)]">
          <button type="button" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))} className="min-h-[56px] rounded-2xl bg-[var(--cq-surface-2)] border border-[var(--cq-line)] text-[17px] font-semibold disabled:opacity-40 cursor-pointer">Back</button>
          <button
            type="button"
            onClick={() => { sound.playTap(); haptic('selection'); if (step < steps.length - 1) { setStep(step + 1); setTimerLeft(null); } else { sound.playLevelUp(); onClose(); } }}
            className="min-h-[56px] rounded-2xl bg-[var(--cq-label)] text-[var(--cq-ground)] text-[17px] font-semibold cursor-pointer"
          >
            {step < steps.length - 1 ? 'Next step' : 'Done — enjoy!'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────── Main sheet ─────────────────────────────── */

export const KitchenSheet: React.FC<KitchenSheetProps> = ({
  database, onUpdateDatabase, activeKid, isParentMode, tab, onTabChange, onClose, onOpenMoreTools,
}) => {
  const dbRef = useRef(database);
  dbRef.current = database;
  const menu: WeeklyDinnerMenu = database.weeklyMenu || DEFAULT_WEEKLY_MENU;
  const list: WeeklyGroceryList = database.weeklyGroceryList || DEFAULT_WEEKLY_GROCERY_LIST;
  const items = list.items || [];
  const today = getCurrentDayOfWeekKey();
  const dates = useMemo(weekDates, []);
  const [day, setDay] = useState<DayOfWeekKey>(today);
  const [cooking, setCooking] = useState<{ dish: string; recipe: MealRecipe } | null>(null);
  const [storeMode, setStoreMode] = useState(false);
  const [pantryTab, setPantryTab] = useState<'staples' | 'spices' | 'budget'>('staples');
  const [draft, setDraft] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const isKidUser = !!activeKid && !isParentMode;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const saveList = (next: WeeklyGroceryList, extra: Partial<FamilyDatabase> = {}) =>
    onUpdateDatabase({ ...dbRef.current, ...extra, weeklyGroceryList: { ...next, lastUpdated: new Date().toISOString() } });
  const saveMenu = (next: WeeklyDinnerMenu) =>
    onUpdateDatabase({ ...dbRef.current, weeklyMenu: { ...next, lastUpdated: new Date().toISOString() } });

  const listNames = useMemo(() => new Set(items.map((i) => norm(i.name))), [items]);

  /* ── Dinners helpers ── */
  const plan = menu.days?.[day];
  const recipeFor = (dish: string, existing?: MealRecipe): MealRecipe | null => {
    if (existing?.instructions?.length || existing?.ingredients?.length) return existing!;
    if (!dish) return null;
    const r = getRecipeForDish(dish, plan?.theme);
    return r.instructions?.length || r.ingredients?.length ? r : null;
  };
  const dayRecipe = plan ? recipeFor(plan.mainDish, plan.recipe) : null;
  const missingForDay = (dayRecipe?.ingredients || [])
    .map((raw) => parseIngredientToGroceryItem(raw, day, plan?.mainDish))
    .filter((it) => !listNames.has(norm(it.name)));

  const addItems = (newItems: GroceryItem[], label: string) => {
    const fresh = newItems.filter((it, idx, arr) => !listNames.has(norm(it.name)) && arr.findIndex((x) => norm(x.name) === norm(it.name)) === idx);
    if (!fresh.length) { setToast('Everything is already on the list'); return; }
    saveList({ ...list, items: [...items, ...fresh] });
    sound.playStarEarned();
    haptic('success');
    setToast(`${fresh.length} ${label} added to groceries`);
  };

  const vote = (optionId: string) => {
    if (!plan || !activeKid) return;
    const kidId = activeKid.id;
    const options = (plan.votingOptions || []).map((o) => {
      const has = o.voterKidIds.includes(kidId);
      return o.id === optionId
        ? { ...o, voterKidIds: has ? o.voterKidIds.filter((id) => id !== kidId) : [...o.voterKidIds, kidId] }
        : { ...o, voterKidIds: o.voterKidIds.filter((id) => id !== kidId) };
    });
    sound.playStarEarned();
    haptic('selection');
    saveMenu({ ...menu, days: { ...menu.days, [day]: { ...plan, votingOptions: options } } });
  };

  const pickWinner = (optionId: string) => {
    if (!plan) return;
    const option = (plan.votingOptions || []).find((o) => o.id === optionId);
    if (!option) return;
    sound.playStarEarned();
    saveMenu({
      ...menu,
      days: {
        ...menu.days,
        [day]: {
          ...plan, mainDish: option.title, icon: option.icon || plan.icon || '🍽️', winningOptionId: option.id, lockedByParent: true,
          notes: `Selected as the family favorite! (${option.voterKidIds.length} votes)`,
        },
      },
    });
  };

  const applySuggestion = (dish: string) => {
    if (!plan) return;
    sound.playTap();
    saveMenu({ ...menu, days: { ...menu.days, [day]: { ...plan, mainDish: dish } } });
  };

  /* ── Grocery helpers ── */
  const toggleItem = (id: string) => {
    haptic('selection');
    saveList({
      ...list,
      items: items.map((it) => (it.id === id ? { ...it, acquired: !it.acquired, acquiredAt: !it.acquired ? new Date().toISOString() : undefined } : it)),
    });
  };

  const submitDraft = (e: React.FormEvent) => {
    e.preventDefault();
    const name = draft.trim();
    if (!name) return;
    setDraft('');
    const category = detectGroceryCategory(name);
    if (isKidUser && activeKid) {
      const req: GroceryRequest = {
        id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name, itemName: name, category, kidId: activeKid.id, kidName: activeKid.name, kidAvatar: activeKid.avatar,
        status: 'pending', createdAt: new Date().toISOString(), date: getTodayDateString(), starCost: 0,
      };
      saveList({ ...list, requests: [req, ...(list.requests || [])] });
      sound.playTap();
      setToast('Sent to a parent for approval');
      return;
    }
    saveList({
      ...list,
      items: [
        { id: `g-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: cap(name), category, acquired: false, addedBy: isParentMode ? 'Parent' : 'Family', createdAt: getTodayDateString() },
        ...items,
      ],
    });
    sound.playTap();
  };

  const approve = (req: GroceryRequest) => {
    const item: GroceryItem = {
      id: `g-req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: req.name, category: req.category || detectGroceryCategory(req.name), quantity: req.quantity, importance: req.importance,
      acquired: false, addedBy: `${req.kidName} (Approved)`, notes: req.notes, createdAt: getTodayDateString(), currency: 'USD',
    };
    const requests = (list.requests || []).map((r) => (r.id === req.id ? { ...r, status: 'approved' as const, reviewedBy: 'Parent', reviewedAt: new Date().toISOString() } : r));
    saveList({ ...list, items: [item, ...items], requests });
    sound.playRewardRedeemed();
  };

  const deny = (req: GroceryRequest) => {
    const refund = req.starsDeducted && (req.starCost || 0) > 0 ? req.starCost || 0 : 0;
    const requests = (list.requests || []).map((r) =>
      r.id === req.id ? { ...r, status: 'denied' as const, reviewedBy: 'Parent', reviewedAt: new Date().toISOString(), deniedReason: 'Not this shopping trip', starsDeducted: false } : r,
    );
    const kids = refund > 0 ? dbRef.current.kids.map((k) => (k.id === req.kidId ? { ...k, stars: k.stars + refund } : k)) : dbRef.current.kids;
    saveList({ ...list, requests }, { kids });
    sound.playTap();
  };

  const pending = (list.requests || []).filter((r) => r.status === 'pending');
  const groups = groupGroceryItemsByCategory(storeMode ? items.filter((i) => !i.acquired) : items);
  const doneCount = items.filter((i) => i.acquired).length;
  const estimate = items.reduce((s, i) => s + (Number(i.actualCost) || Number(i.estimatedCost) || 0), 0);
  const target = list.budgetTarget || 0;

  const sourceOf = (it: GroceryItem): { text: string; color: string } => {
    if (it.sourceMealDay) {
      const dish = menu.days?.[it.sourceMealDay]?.mainDish || it.sourceRecipe || '';
      return { text: `For ${cap(it.sourceMealDay).slice(0, 3)}${dish ? ' · ' + dish : ''}`, color: 'var(--cq-accent-text)' };
    }
    if (it.isReplenishItem) return { text: 'Ran out in the pantry', color: 'var(--cq-due)' };
    if (it.addedBy && /approved|request/i.test(it.addedBy)) return { text: it.addedBy, color: '#FF6FA5' };
    return { text: it.addedBy ? `Added by ${it.addedBy}` : '', color: 'var(--cq-label-2)' };
  };

  /* ── Pantry helpers ── */
  const staples = list.pantryStaples || [];
  const spices = list.spices || [];
  const depleted = getPantryDepletedItems(list);

  const toggleStaple = (id: string) => {
    haptic('selection');
    saveList({
      ...list,
      pantryStaples: staples.map((s) => (s.id === id ? { ...s, isDepleted: !s.isDepleted, depletedAt: !s.isDepleted ? new Date().toISOString() : undefined, depletedBy: !s.isDepleted ? (activeKid?.name || 'Parent') : undefined, lastRestockedAt: s.isDepleted ? new Date().toISOString() : s.lastRestockedAt } : s)),
    });
  };
  const toggleSpice = (id: string) => {
    haptic('selection');
    saveList({ ...list, spices: spices.map((s) => (s.id === id ? { ...s, isEmpty: !s.isEmpty, needsReplenish: !s.isEmpty, updatedAt: new Date().toISOString() } : s)) });
  };
  const addDepleted = () => {
    const { updatedList, importedCount } = importDepletedItemsToGroceryList(list);
    if (!importedCount) { setToast('Those are already on the list'); return; }
    saveList(updatedList);
    sound.playStarEarned();
    setToast(`${importedCount} item${importedCount === 1 ? '' : 's'} added to groceries`);
  };

  const receipts = (list.receipts || []).slice(-4);
  const maxReceipt = Math.max(target || 0, ...receipts.map((r) => r.totalAmount || 0), 1);

  /* ── Render ── */
  const title = tab === 'dinners' ? 'Dinners' : tab === 'groceries' ? 'Groceries' : 'Pantry';

  const body = (
    <div className="fixed inset-0 z-50 cq-ground overflow-y-auto overscroll-contain" role="dialog" aria-modal="true" aria-label={`Kitchen: ${title}`}>
      <div className="max-w-[640px] mx-auto px-5 pt-[calc(var(--safe-top,0px)+20px)] pb-[calc(var(--safe-bottom,0px)+120px)] flex flex-col gap-4">
        <header className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-medium text-[var(--cq-label-2)]">
              {tab === 'groceries' ? `${items.length} items · ${doneCount} done` : tab === 'dinners' ? (menu.title || 'This week') : 'Staples, spices & spending'}
            </span>
            <h1 className="m-0 text-[34px] font-bold tracking-[-0.02em] leading-tight">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {tab === 'groceries' && (
              <div className="flex flex-col items-end mr-1">
                <span className="text-[20px] font-medium cq-num">{money(estimate)}{target ? <span className="text-[var(--cq-label-3)] font-normal"> / {money(target)}</span> : null}</span>
                <span className="text-[12px] text-[var(--cq-label-2)]">estimated</span>
              </div>
            )}
            {!isKidUser && (
              <button type="button" onClick={() => onOpenMoreTools(tab === 'dinners' ? 'menu' : 'grocery')} aria-label="More tools: presets, recipes, receipts, printing" title="More tools" className="w-11 h-11 rounded-full bg-[var(--cq-surface)] border border-[var(--cq-line)] flex items-center justify-center cursor-pointer">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            )}
            <button type="button" onClick={onClose} aria-label="Close kitchen" className="w-11 h-11 rounded-full bg-[var(--cq-surface)] border border-[var(--cq-line)] flex items-center justify-center cursor-pointer">
              <X className="w-[18px] h-[18px]" />
            </button>
          </div>
        </header>

        <Segmented label="Kitchen section" value={tab} onChange={(v) => onTabChange(v as KitchenTab)} options={[['dinners', 'Dinners'], ['groceries', 'Groceries'], ['pantry', 'Pantry']]} />

        {/* ── Dinners ─────────────────────────────────────────────── */}
        {tab === 'dinners' && (
          <>
            <div role="tablist" aria-label="Days" className="grid grid-cols-7 gap-1">
              {DAYS.map((d) => {
                const p = menu.days?.[d];
                const sel = d === day;
                const dot = p?.votingEnabled && !p.lockedByParent ? 'var(--cq-accent)' : p?.mainDish ? 'var(--cq-label-3)' : 'transparent';
                return (
                  <button key={d} type="button" role="tab" aria-selected={sel} aria-label={cap(d)} onClick={() => { sound.playTap(); setDay(d); }}
                    className="min-h-[58px] rounded-[14px] flex flex-col items-center justify-center gap-1 cursor-pointer border border-[var(--cq-line)]"
                    style={{ background: sel ? 'var(--cq-label)' : 'var(--cq-surface)', color: sel ? 'var(--cq-ground)' : 'var(--cq-label)' }}>
                    <span className="text-[11px] font-medium opacity-80">{DAY_SHORT[d]}</span>
                    <span className="text-[17px] font-semibold cq-num">{dates[d]}</span>
                    <span className="w-[5px] h-[5px] rounded-full" style={{ background: sel && dot !== 'transparent' ? 'var(--cq-ground)' : dot }} />
                  </button>
                );
              })}
            </div>

            <Card className="overflow-hidden" label={day === today ? 'Tonight' : cap(day)}>
              <div className="h-[96px] px-4 pb-3 flex items-end" style={{ background: 'linear-gradient(135deg, #3A2A1C 0%, #4A2F1E 50%, #2B2230 100%)' }}>
                <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#FFD7B0]">
                  {day === today ? `Tonight · ${cap(day)}` : cap(day)}{plan?.theme ? ` · ${plan.theme}` : ''}
                </span>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[20px] font-semibold tracking-[-0.01em]">{plan?.mainDish || 'Not planned yet'}</span>
                  <span className="text-[13px] text-[var(--cq-label-2)]">
                    {[dayRecipe?.cookTime || dayRecipe?.prepTime, dayRecipe?.servings, plan?.sideDishes, plan?.dessert ? `${plan.dessert} for dessert` : '', plan?.preparedBy ? `by ${plan.preparedBy}` : '']
                      .filter(Boolean).join(' · ') || 'Add a dish in More tools, or pick from the vote'}
                  </span>
                  {plan?.notes && <span className="text-[13px] text-[var(--cq-label-3)]">{plan.notes}</span>}
                </div>
                {plan?.mainDish && (
                  <div className="flex gap-2">
                    {dayRecipe && (
                      <button type="button" onClick={() => { sound.playTap(); setCooking({ dish: plan.mainDish, recipe: dayRecipe }); }}
                        className="flex-1 min-h-[44px] rounded-xl bg-[var(--cq-accent)] text-[var(--cq-on-accent)] text-[15px] font-semibold flex items-center justify-center gap-2 cursor-pointer">
                        <ChefHat className="w-[18px] h-[18px]" /> Start cooking
                      </button>
                    )}
                    {missingForDay.length > 0 && !isKidUser && (
                      <button type="button" onClick={() => addItems(missingForDay, 'ingredients')}
                        className="flex-1 min-h-[44px] rounded-xl text-[15px] font-semibold cursor-pointer"
                        style={{ background: 'color-mix(in srgb, var(--cq-due) 16%, transparent)', color: 'var(--cq-due)' }}>
                        Add {missingForDay.length} missing
                      </button>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {plan?.votingEnabled && (plan.votingOptions || []).length > 0 && (
              <Card className="p-4 flex flex-col gap-2.5" label="Family vote">
                <div className="flex items-baseline justify-between">
                  <h2 className="m-0 text-[15px] font-semibold">{plan.votingQuestion || `${cap(day)} · family vote`}</h2>
                  <span className="text-[12px] text-[var(--cq-label-2)]">{plan.lockedByParent ? 'Decided' : isKidUser ? 'Tap to vote' : 'Tap Pick to decide'}</span>
                </div>
                {(() => {
                  const total = Math.max(1, (plan.votingOptions || []).reduce((s, o) => s + o.voterKidIds.length, 0));
                  return (plan.votingOptions || []).map((o) => {
                    const pct = Math.round((o.voterKidIds.length / total) * 100);
                    const mine = !!activeKid && o.voterKidIds.includes(activeKid.id);
                    const winner = plan.winningOptionId === o.id;
                    const names = o.voterKidIds.map((id) => database.kids.find((k) => k.id === id)?.name).filter(Boolean).join(', ');
                    return (
                      <div key={o.id} className="relative min-h-[48px] rounded-xl overflow-hidden flex items-center gap-2.5 px-3 border"
                        style={{ borderColor: mine || winner ? 'var(--cq-accent)' : 'var(--cq-line)' }}>
                        <span aria-hidden="true" className="absolute inset-y-0 left-0" style={{ width: `${pct}%`, background: 'var(--cq-accent-soft)' }} />
                        <button type="button" disabled={!isKidUser || plan.lockedByParent} onClick={() => vote(o.id)} aria-pressed={mine}
                          className="relative flex-1 min-h-[44px] text-left text-[15px] font-medium cursor-pointer disabled:cursor-default">
                          {o.title}{winner ? ' · chosen' : ''}
                        </button>
                        <span className="relative text-[12px] text-[var(--cq-label-2)]">{names || 'No votes'}</span>
                        {!isKidUser && !plan.lockedByParent && (
                          <button type="button" onClick={() => pickWinner(o.id)} className="relative min-h-[32px] px-3 rounded-full bg-[var(--cq-surface-2)] border border-[var(--cq-line)] text-[13px] font-semibold cursor-pointer">Pick</button>
                        )}
                      </div>
                    );
                  });
                })()}
              </Card>
            )}

            {(plan?.suggestions || []).length > 0 && (
              <Card className="p-4 flex flex-col gap-2" label="Suggestions">
                <h2 className="m-0 text-[15px] font-semibold">Suggestions</h2>
                {(plan?.suggestions || []).map((s) => (
                  <div key={s.id} className="flex items-center gap-3 min-h-[44px]">
                    <span className="flex-1 text-[15px]">{s.dish} <span className="text-[13px] text-[var(--cq-label-2)]">· {database.kids.find((k) => k.id === s.kidId)?.name || 'Someone'}</span></span>
                    {!isKidUser && (
                      <button type="button" onClick={() => applySuggestion(s.dish)} className="min-h-[34px] px-3.5 rounded-full bg-[var(--cq-surface-2)] border border-[var(--cq-line)] text-[13px] font-semibold cursor-pointer">Use it</button>
                    )}
                  </div>
                ))}
              </Card>
            )}

            {!isKidUser && (
              <button type="button" onClick={() => addItems(extractIngredientsFromMenu(menu), 'items from this week’s dinners')}
                className="flex items-center gap-2.5 min-h-[52px] px-4 rounded-2xl border cursor-pointer text-left"
                style={{ background: 'color-mix(in srgb, var(--cq-done) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--cq-done) 25%, transparent)' }}>
                <ShoppingCart className="w-5 h-5" style={{ color: 'var(--cq-done)' }} />
                <span className="flex-1 text-[15px]">Add the whole week’s ingredients to groceries</span>
                <ChevronRight className="w-[18px] h-[18px]" style={{ color: 'var(--cq-done)' }} />
              </button>
            )}
          </>
        )}

        {/* ── Groceries ───────────────────────────────────────────── */}
        {tab === 'groceries' && (
          <>
            <form onSubmit={submitDraft} className="flex gap-2">
              <label htmlFor="kitchen-quick-add" className="flex-1 flex items-center gap-2 min-h-[44px] px-3.5 rounded-xl bg-[var(--cq-surface)] border border-[var(--cq-line)]">
                <Plus className="w-[18px] h-[18px] text-[var(--cq-label-2)]" />
                <span className="sr-only">{isKidUser ? 'Ask for an item' : 'Add an item'}</span>
                <input id="kitchen-quick-add" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={isKidUser ? 'Ask for something…' : 'Add item — sorted by aisle'}
                  className="cq-bare-input flex-1 min-w-0 bg-transparent border-none outline-none text-[16px]" />
              </label>
              <button type="submit" className="min-h-[44px] px-4 rounded-xl bg-[var(--cq-accent)] text-[var(--cq-on-accent)] text-[15px] font-semibold cursor-pointer">{isKidUser ? 'Ask' : 'Add'}</button>
            </form>

            {pending.length > 0 && (
              <div className="flex flex-col gap-2">
                {pending.map((r) => (
                  <div key={r.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-[14px] border" style={{ background: 'rgb(255 111 165 / 0.08)', borderColor: 'rgb(255 111 165 / 0.2)' }}>
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0" style={{ background: 'rgb(255 111 165 / 0.16)', color: '#FF6FA5' }}>{initials(r.kidName || '?')}</span>
                    <span className="flex-1 text-[14px]">{r.kidName} asked for <span className="font-semibold">{r.name}</span>{r.starCost ? ` · ${r.starCost} pts` : ''}</span>
                    {isKidUser ? (
                      <span className="text-[12px] text-[var(--cq-label-2)]">Waiting</span>
                    ) : (
                      <>
                        <button type="button" onClick={() => approve(r)} className="min-h-[32px] px-3 rounded-full bg-[var(--cq-label)] text-[var(--cq-ground)] text-[13px] font-semibold cursor-pointer">Add</button>
                        <button type="button" onClick={() => deny(r)} aria-label={`Decline ${r.name}`} className="w-8 h-8 rounded-full bg-[var(--cq-surface-2)] flex items-center justify-center cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {items.length === 0 && (
              <Card className="p-8 text-center" label="Empty list">
                <ShoppingCart className="w-9 h-9 mx-auto mb-2 text-[var(--cq-label-3)]" strokeWidth={1.6} />
                <p className="m-0 text-[15px] text-[var(--cq-label-2)]">The list is empty. Add something above, or pull in this week’s dinners.</p>
              </Card>
            )}

            {(Object.keys(groups) as (keyof typeof groups)[]).map((cat) => {
              const rows = groups[cat];
              if (!rows.length) return null;
              return (
                <section key={cat} className="flex flex-col gap-1.5" aria-labelledby={`aisle-${cat}`}>
                  <Eyebrow id={`aisle-${cat}`}>{GROCERY_CATEGORY_METADATA[cat]?.shortLabel || cap(String(cat))}</Eyebrow>
                  <Card className="overflow-hidden">
                    {rows.map((it, i) => {
                      const src = sourceOf(it);
                      const price = Number(it.actualCost) || Number(it.estimatedCost) || 0;
                      return (
                        <button key={it.id} type="button" role="checkbox" aria-checked={it.acquired} onClick={() => toggleItem(it.id)}
                          className={`w-full flex items-center gap-3 px-3.5 text-left cursor-pointer ${storeMode ? 'min-h-[64px]' : 'min-h-[52px]'} ${i ? 'border-t border-[var(--cq-line)]' : ''}`}
                          style={{ opacity: it.acquired ? 0.5 : 1 }}>
                          <CheckDot done={it.acquired} size={storeMode ? 28 : 24} />
                          <span className="flex-1 min-w-0 flex flex-col py-1.5">
                            <span className={`${storeMode ? 'text-[18px]' : 'text-[16px]'} ${it.acquired ? 'line-through' : ''}`}>
                              {it.name} {it.quantity ? <span className="text-[var(--cq-label-2)]">{it.quantity}</span> : null}
                            </span>
                            {src.text && !storeMode && <span className="text-[12px] truncate" style={{ color: src.color }}>{src.text}</span>}
                          </span>
                          {price > 0 && <span className="text-[14px] text-[var(--cq-label-2)] cq-num">{money(price)}</span>}
                        </button>
                      );
                    })}
                  </Card>
                </section>
              );
            })}

            <button type="button" onClick={() => { sound.playTap(); setStoreMode((s) => !s); }}
              className="sticky bottom-[calc(var(--safe-bottom,0px)+96px)] min-h-[52px] rounded-2xl text-[16px] font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              style={{ background: storeMode ? 'var(--cq-accent)' : 'var(--cq-label)', color: storeMode ? 'var(--cq-on-accent)' : 'var(--cq-ground)' }}>
              <Store className="w-[18px] h-[18px]" />
              {storeMode ? `Done shopping · ${items.filter((i) => !i.acquired).length} left` : 'I’m at the store'}
            </button>
          </>
        )}

        {/* ── Pantry ──────────────────────────────────────────────── */}
        {tab === 'pantry' && (
          <>
            <Segmented label="Pantry view" value={pantryTab} onChange={(v) => setPantryTab(v as typeof pantryTab)} options={[['staples', 'Staples'], ['spices', 'Spices'], ['budget', 'Budget']]} />

            {pantryTab !== 'budget' && depleted.length > 0 && (
              <div className="flex items-center gap-3 px-3.5 py-3 rounded-2xl border" style={{ background: 'color-mix(in srgb, var(--cq-due) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--cq-due) 22%, transparent)' }}>
                <span className="flex-1 text-[14px]"><span className="font-semibold">{depleted.length} out</span> · {depleted.slice(0, 3).map((d) => d.name).join(', ')}{depleted.length > 3 ? '…' : ''}</span>
                <button type="button" onClick={addDepleted} className="min-h-[34px] px-3 rounded-full text-[13px] font-semibold cursor-pointer whitespace-nowrap" style={{ background: 'var(--cq-due)', color: 'var(--cq-ground)' }}>Add to list</button>
              </div>
            )}

            {pantryTab === 'staples' && (
              <Card className="px-4 py-1" label="Staples">
                {staples.length === 0 && <p className="py-4 m-0 text-[14px] text-[var(--cq-label-2)]">No staples yet. Add them in More tools.</p>}
                {staples.map((s, i) => (
                  <button key={s.id} type="button" onClick={() => toggleStaple(s.id)} aria-pressed={s.isDepleted}
                    className={`w-full flex items-center gap-3 min-h-[52px] text-left cursor-pointer ${i ? 'border-t border-[var(--cq-line)]' : ''}`}>
                    <Package className="w-[18px] h-[18px] text-[var(--cq-label-3)] shrink-0" />
                    <span className="flex-1 text-[16px]">{s.name}</span>
                    <span className="text-[13px] font-semibold px-2.5 py-1 rounded-full"
                      style={s.isDepleted ? { background: 'color-mix(in srgb, var(--cq-danger) 15%, transparent)', color: 'var(--cq-danger)' } : { background: 'color-mix(in srgb, var(--cq-done) 14%, transparent)', color: 'var(--cq-done)' }}>
                      {s.isDepleted ? 'Out' : 'In stock'}
                    </span>
                  </button>
                ))}
              </Card>
            )}

            {pantryTab === 'spices' && (
              <Card className="px-4 py-1" label="Spices">
                {spices.length === 0 && <p className="py-4 m-0 text-[14px] text-[var(--cq-label-2)]">No spices yet. Add them in More tools.</p>}
                {spices.map((s, i) => (
                  <button key={s.id} type="button" onClick={() => toggleSpice(s.id)} aria-pressed={s.isEmpty}
                    className={`w-full flex items-center gap-3 min-h-[48px] text-left cursor-pointer ${i ? 'border-t border-[var(--cq-line)]' : ''}`}>
                    <span className="flex-1 text-[16px]">{s.name}{s.category ? <span className="text-[13px] text-[var(--cq-label-2)]"> · {s.category}</span> : null}</span>
                    <span className="text-[13px] font-semibold" style={{ color: s.isEmpty ? 'var(--cq-danger)' : 'var(--cq-label-2)' }}>{s.isEmpty ? 'Empty' : 'Have it'}</span>
                  </button>
                ))}
              </Card>
            )}

            {pantryTab === 'budget' && (
              <Card className="p-4 flex flex-col gap-3" label="Grocery spending">
                <div className="flex items-baseline justify-between">
                  <h2 className="m-0 text-[15px] font-semibold">Grocery spending</h2>
                  <span className="text-[13px] text-[var(--cq-label-2)]">{target ? `target ${money(target)} / wk` : 'no target set'}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[34px] font-light cq-num">{money(estimate)}</span>
                  <span className="text-[13px] text-[var(--cq-label-2)]">estimated this week</span>
                </div>
                {receipts.length > 0 ? (
                  <div role="img" aria-label="Recent receipt totals" className="grid gap-3 items-end h-[110px]" style={{ gridTemplateColumns: `repeat(${receipts.length}, minmax(0, 1fr))` }}>
                    {receipts.map((r) => {
                      const amt = r.totalAmount || 0;
                      const over = target > 0 && amt > target;
                      return (
                        <div key={r.id} className="flex flex-col items-center gap-1.5 h-full justify-end">
                          <span className="text-[12px] text-[var(--cq-label-2)] cq-num">{money(amt)}</span>
                          <div className="w-full rounded-md" style={{ height: `${Math.max(6, Math.round((amt / maxReceipt) * 76))}px`, background: over ? 'color-mix(in srgb, var(--cq-due) 60%, transparent)' : 'var(--cq-accent-soft)' }} />
                          <span className="text-[11px] text-[var(--cq-label-3)] truncate max-w-full">{r.storeName || (r.receiptDate || '').slice(5)}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="m-0 text-[13px] text-[var(--cq-label-2)]">Scan receipts in More tools to see spending over time.</p>
                )}
                <span className="flex items-center gap-1.5 text-[13px] text-[var(--cq-label-2)]"><Clock className="w-3.5 h-3.5" /> Prices learned from {(list.receipts || []).length} receipt{(list.receipts || []).length === 1 ? '' : 's'}</span>
              </Card>
            )}
          </>
        )}
      </div>

      {toast && (
        <div role="status" className="fixed left-1/2 -translate-x-1/2 bottom-[calc(var(--safe-bottom,0px)+96px)] z-[60] px-4 py-2.5 rounded-full bg-[var(--cq-label)] text-[var(--cq-ground)] text-[14px] font-medium shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );

  return (
    <>
      {createPortal(body, document.body)}
      {/* Cook mode lives at the top level so it sits above the tab bar */}
      {cooking && createPortal(<CookMode dish={cooking.dish} recipe={cooking.recipe} onClose={() => setCooking(null)} />, document.body)}
    </>
  );
};

export default KitchenSheet;
