/**
 * KitchenWall — the wall-display kitchen board (mockup `KitchenWall`).
 *
 * Tonight's dinner with cook mode, the family vote (kids confirm with their
 * own PIN), "Ask for an item" / "We ran out of…" requests that go to a parent,
 * and the week along the bottom. Same data as the Kitchen sheet; locked kiosk
 * rules still apply (no adult settings here).
 */
import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChefHat, X } from 'lucide-react';
import { DayOfWeekKey, FamilyDatabase, GroceryRequest, KidProfile, MealRecipe, WeeklyDinnerMenu, WeeklyGroceryList } from '../../types';
import { DEFAULT_WEEKLY_MENU, getCurrentDayOfWeekKey, getRecipeForDish } from '../../utils/menu';
import { DEFAULT_WEEKLY_GROCERY_LIST, detectGroceryCategory } from '../../utils/grocery';
import { getTodayDateString } from '../../utils/storage';
import { sound } from '../../utils/sound';
import { haptic } from '../../utils/haptics';
import { initials } from '../../utils/progress';
import { KidPinModal } from '../KidPinModal';
import { CookMode } from './KitchenSheet';

interface KitchenWallProps {
  database: FamilyDatabase;
  onUpdateDatabase: (db: FamilyDatabase) => void;
  onClose: () => void;
}

const DAYS: DayOfWeekKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type Pending =
  | { kind: 'vote'; optionId: string; kid?: KidProfile }
  | { kind: 'ask'; kid?: KidProfile; text: string }
  | null;

export const KitchenWall: React.FC<KitchenWallProps> = ({ database, onUpdateDatabase, onClose }) => {
  const menu: WeeklyDinnerMenu = database.weeklyMenu || DEFAULT_WEEKLY_MENU;
  const list: WeeklyGroceryList = database.weeklyGroceryList || DEFAULT_WEEKLY_GROCERY_LIST;
  const today = getCurrentDayOfWeekKey();
  const todayIdx = DAYS.indexOf(today);
  const tonight = menu.days?.[today];
  const voteDay = useMemo(
    () => DAYS.slice(todayIdx).find((d) => menu.days?.[d]?.votingEnabled && !menu.days?.[d]?.lockedByParent && (menu.days?.[d]?.votingOptions || []).length > 0),
    [menu, todayIdx],
  );
  const votePlan = voteDay ? menu.days[voteDay] : undefined;
  const [pending, setPending] = useState<Pending>(null);
  const [pinKid, setPinKid] = useState<KidProfile | null>(null);
  const [cooking, setCooking] = useState<{ dish: string; recipe: MealRecipe } | null>(null);
  const [outOpen, setOutOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const recipe = useMemo(() => {
    if (!tonight?.mainDish) return null;
    if (tonight.recipe?.instructions?.length) return tonight.recipe;
    const r = getRecipeForDish(tonight.mainDish, tonight.theme);
    return r.instructions?.length ? r : null;
  }, [tonight]);

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  const applyAfterPin = (kid: KidProfile) => {
    if (!pending) return;
    if (pending.kind === 'vote' && voteDay && votePlan) {
      const options = (votePlan.votingOptions || []).map((o) => {
        const has = o.voterKidIds.includes(kid.id);
        return o.id === pending.optionId
          ? { ...o, voterKidIds: has ? o.voterKidIds : [...o.voterKidIds, kid.id] }
          : { ...o, voterKidIds: o.voterKidIds.filter((id) => id !== kid.id) };
      });
      onUpdateDatabase({ ...database, weeklyMenu: { ...menu, days: { ...menu.days, [voteDay]: { ...votePlan, votingOptions: options } }, lastUpdated: new Date().toISOString() } });
      sound.playStarEarned();
      flash(`${kid.name} voted`);
    }
    if (pending.kind === 'ask' && pending.text.trim()) {
      const name = pending.text.trim();
      const req: GroceryRequest = {
        id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name, itemName: name, category: detectGroceryCategory(name), kidId: kid.id, kidName: kid.name, kidAvatar: kid.avatar,
        status: 'pending', createdAt: new Date().toISOString(), date: getTodayDateString(), starCost: 0,
      };
      onUpdateDatabase({ ...database, weeklyGroceryList: { ...list, requests: [req, ...(list.requests || [])], lastUpdated: new Date().toISOString() } });
      sound.playTap();
      flash('Sent to a parent for approval');
    }
    setPending(null);
    setPinKid(null);
  };

  const markOut = (id: string) => {
    const staples = (list.pantryStaples || []).map((s) => (s.id === id ? { ...s, isDepleted: true, depletedAt: new Date().toISOString(), depletedBy: 'Kitchen wall' } : s));
    onUpdateDatabase({ ...database, weeklyGroceryList: { ...list, pantryStaples: staples, lastUpdated: new Date().toISOString() } });
    haptic('selection');
    flash('Marked as out — a parent will add it to the list');
  };

  const kidChooser = (onPick: (k: KidProfile) => void) => (
    <div className="flex flex-wrap gap-2 mt-2" role="group" aria-label="Who are you?">
      {database.kids.map((k) => (
        <button key={k.id} type="button" onClick={() => { sound.playTap(); onPick(k); }}
          className="min-h-[48px] pl-1.5 pr-4 rounded-full bg-[var(--cq-surface-2)] border border-[var(--cq-line)] flex items-center gap-2 cursor-pointer">
          <span className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold" style={{ color: k.color || 'var(--cq-accent)', background: `color-mix(in srgb, ${k.color || '#5B8CFF'} 16%, transparent)` }}>{initials(k.name)}</span>
          <span className="text-[16px] font-medium">{k.name}</span>
        </button>
      ))}
    </div>
  );

  const totalVotes = Math.max(1, (votePlan?.votingOptions || []).reduce((s, o) => s + o.voterKidIds.length, 0));
  const nowLabel = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const staples = (list.pantryStaples || []).filter((s) => !s.isDepleted);

  const board = (
    <div className="fixed inset-0 z-50 cq-ground cq-kiosk-dark dark overflow-y-auto" role="dialog" aria-modal="true" aria-label="Kitchen board">
      <div className="min-h-full max-w-[1400px] mx-auto px-6 sm:px-12 py-8 flex flex-col gap-5">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-4">
            <h1 className="m-0 text-[34px] font-bold tracking-[-0.02em]">Kitchen</h1>
            <span className="text-[18px] text-[var(--cq-label-2)]">{cap(today)} · {nowLabel}</span>
          </div>
          <button type="button" onClick={onClose} className="min-h-[48px] px-5 rounded-full bg-[var(--cq-surface)] border border-[var(--cq-line)] flex items-center gap-2 text-[16px] font-medium cursor-pointer">
            <ChevronLeft className="w-5 h-5" /> Family board
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-5 flex-1">
          <section aria-label="Tonight" className="rounded-[28px] bg-[var(--cq-surface)] border border-[var(--cq-line)] overflow-hidden flex flex-col">
            <div className="min-h-[170px] px-7 pb-5 pt-6 flex flex-col justify-end" style={{ background: 'linear-gradient(135deg, #3A2A1C 0%, #4A2F1E 50%, #2B2230 100%)' }}>
              <span className="text-[14px] font-semibold uppercase tracking-[0.1em] text-[#FFD7B0]">Tonight{tonight?.theme ? ` · ${tonight.theme}` : ''}</span>
              <span className="text-[36px] font-semibold tracking-[-0.02em] leading-tight">{tonight?.mainDish || 'Dinner isn’t planned yet'}</span>
            </div>
            <div className="p-7 flex flex-col gap-5 flex-1">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col"><span className="text-[28px] font-light cq-num">{recipe?.cookTime || recipe?.prepTime || '—'}</span><span className="text-[14px] text-[var(--cq-label-2)]">Cook time</span></div>
                <div className="flex flex-col"><span className="text-[28px] font-light cq-num">{recipe?.instructions?.length || 0}</span><span className="text-[14px] text-[var(--cq-label-2)]">Recipe steps</span></div>
                <div className="flex flex-col"><span className="text-[28px] font-light truncate">{tonight?.preparedBy?.split(' ')[0] || '—'}</span><span className="text-[14px] text-[var(--cq-label-2)]">Cooking</span></div>
              </div>
              {(tonight?.sideDishes || tonight?.dessert || tonight?.notes) && (
                <p className="m-0 text-[17px] text-[var(--cq-label-2)] leading-relaxed">
                  {[tonight?.sideDishes, tonight?.dessert ? `${tonight.dessert} for dessert` : '', tonight?.notes].filter(Boolean).join(' · ')}
                </p>
              )}
              {recipe && tonight?.mainDish && (
                <button type="button" onClick={() => { sound.playTap(); setCooking({ dish: tonight.mainDish, recipe }); }}
                  className="mt-auto self-start min-h-[56px] px-6 rounded-2xl bg-[var(--cq-label)] text-[var(--cq-ground)] text-[17px] font-semibold flex items-center gap-2 cursor-pointer">
                  <ChefHat className="w-5 h-5" /> Start cooking
                </button>
              )}
            </div>
          </section>

          <div className="flex flex-col gap-5">
            <section aria-label="Family vote" className="rounded-[28px] bg-[var(--cq-surface)] border border-[var(--cq-line)] p-6 flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="m-0 text-[20px] font-semibold">{voteDay ? `Vote for ${cap(voteDay)}` : 'No vote open'}</h2>
                <span className="text-[14px] text-[var(--cq-label-2)]">{voteDay ? 'tap, then your PIN' : 'Parents can start one'}</span>
              </div>
              {(votePlan?.votingOptions || []).map((o) => {
                const pct = Math.round((o.voterKidIds.length / totalVotes) * 100);
                return (
                  <button key={o.id} type="button" onClick={() => { sound.playTap(); setPending({ kind: 'vote', optionId: o.id }); }}
                    className="relative min-h-[56px] rounded-2xl border border-[var(--cq-line)] overflow-hidden flex items-center gap-3 px-4 text-left cursor-pointer"
                    style={pending?.kind === 'vote' && pending.optionId === o.id ? { borderColor: 'var(--cq-accent)' } : undefined}>
                    <span aria-hidden="true" className="absolute inset-y-0 left-0" style={{ width: `${pct}%`, background: 'var(--cq-accent-soft)' }} />
                    <span className="relative flex-1 text-[18px] font-medium">{o.title}</span>
                    <span className="relative text-[15px] text-[var(--cq-label-2)]">{o.voterKidIds.length} vote{o.voterKidIds.length === 1 ? '' : 's'}</span>
                  </button>
                );
              })}
              {pending?.kind === 'vote' && kidChooser((k) => { setPending({ ...pending, kid: k }); setPinKid(k); })}
            </section>

            <section aria-label="Need something" className="rounded-[28px] bg-[var(--cq-surface)] border border-[var(--cq-line)] p-6 flex flex-col gap-3 flex-1">
              <div className="flex items-baseline justify-between">
                <h2 className="m-0 text-[20px] font-semibold">Need something?</h2>
                <span className="text-[14px] text-[var(--cq-label-2)]">{(list.items || []).filter((i) => !i.acquired).length} on the list</span>
              </div>
              {pending?.kind === 'ask' ? (
                <form onSubmit={(e) => { e.preventDefault(); }} className="flex flex-col gap-2">
                  <label htmlFor="wall-ask" className="text-[14px] text-[var(--cq-label-2)]">What do you need?</label>
                  <div className="flex gap-2">
                    <input id="wall-ask" autoFocus value={pending.text} onChange={(e) => setPending({ ...pending, text: e.target.value })}
                      className="flex-1 min-h-[52px] px-4 rounded-2xl text-[17px]" placeholder="e.g. strawberry yogurt" />
                    <button type="button" onClick={() => setPending(null)} aria-label="Cancel" className="w-[52px] h-[52px] rounded-2xl bg-[var(--cq-surface-2)] flex items-center justify-center cursor-pointer"><X className="w-5 h-5" /></button>
                  </div>
                  {pending.text.trim() && kidChooser((k) => { setPending({ ...pending, kid: k }); setPinKid(k); })}
                </form>
              ) : outOpen ? (
                <div className="flex flex-col gap-2">
                  <span className="text-[14px] text-[var(--cq-label-2)]">Tap what ran out:</span>
                  <div className="flex flex-wrap gap-2">
                    {staples.length === 0 && <span className="text-[15px] text-[var(--cq-label-2)]">Nothing tracked yet.</span>}
                    {staples.map((s) => (
                      <button key={s.id} type="button" onClick={() => markOut(s.id)} className="min-h-[44px] px-4 rounded-full bg-[var(--cq-surface-2)] border border-[var(--cq-line)] text-[15px] cursor-pointer">{s.name}</button>
                    ))}
                  </div>
                  <button type="button" onClick={() => setOutOpen(false)} className="self-start min-h-[40px] text-[15px] text-[var(--cq-accent-text)] cursor-pointer">Done</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <button type="button" onClick={() => { sound.playTap(); setPending({ kind: 'ask', text: '' }); }} className="min-h-[56px] rounded-2xl bg-[var(--cq-label)] text-[var(--cq-ground)] text-[17px] font-semibold cursor-pointer">Ask for an item</button>
                  <button type="button" onClick={() => { sound.playTap(); setOutOpen(true); }} className="min-h-[56px] rounded-2xl text-[17px] font-semibold cursor-pointer" style={{ background: 'color-mix(in srgb, var(--cq-due) 15%, transparent)', color: 'var(--cq-due)' }}>We ran out of…</button>
                </div>
              )}
              <span className="text-[14px] text-[var(--cq-label-3)] mt-auto">Requests go to a parent for approval before they hit the list.</span>
            </section>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2.5">
          {DAYS.map((d, i) => {
            const p = menu.days?.[d];
            const isToday = d === today;
            const past = i < todayIdx;
            return (
              <div key={d} className="min-h-[68px] rounded-2xl px-3 py-2.5 flex flex-col gap-0.5 border"
                style={{ background: isToday ? 'var(--cq-label)' : past ? 'var(--cq-surface)' : 'transparent', borderColor: isToday ? 'transparent' : 'var(--cq-line)', color: isToday ? 'var(--cq-ground)' : past ? 'var(--cq-label-3)' : 'var(--cq-label)' }}>
                <span className="text-[12px] font-semibold uppercase tracking-[0.08em] opacity-70">{d.slice(0, 3)}</span>
                <span className="text-[15px] font-medium truncate">{p?.votingEnabled && !p.lockedByParent ? 'Voting…' : p?.mainDish || 'Not planned'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {toast && (
        <div role="status" className="fixed left-1/2 -translate-x-1/2 bottom-8 z-[60] px-5 py-3 rounded-full bg-[var(--cq-label)] text-[var(--cq-ground)] text-[16px] font-medium">{toast}</div>
      )}
    </div>
  );

  return (
    <>
      {createPortal(board, document.body)}
      {cooking && createPortal(<div className="cq-kiosk-dark dark"><CookMode dish={cooking.dish} recipe={cooking.recipe} onClose={() => setCooking(null)} /></div>, document.body)}
      <KidPinModal
        isOpen={!!pinKid}
        kid={pinKid}
        onClose={() => setPinKid(null)}
        onSuccess={() => { if (pinKid) applyAfterPin(pinKid); }}
      />
    </>
  );
};

export default KitchenWall;
