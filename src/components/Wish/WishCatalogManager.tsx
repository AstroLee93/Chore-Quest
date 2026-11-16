/**
 * Parent side of the Family Wish Catalog: add (with a verification step), re-check prices,
 * remove (Edit mode + confirmation), answer kids' wishes, and mark reached goals as bought.
 */
import React, { useState } from 'react';
import { FamilyDatabase, KidProfile, KidCoinTransaction, WishCatalogItem } from '../../types';
import { sound } from '../../utils/sound';
import {
  DEFAULT_WISH_LIMIT, STALE_PRICE_DAYS, ParsedLink, daysSince, deleteWishPhoto, goalFromItem, lookupBestBuy, money,
  readProductLink, todayISO, uploadWishPhoto, verifyItem, withPrimaryGoal,
} from '../../utils/wishCatalog';
import { WishSheet, WishPhoto } from './WishSheet';
import '../../styles/wish.css';

interface Props {
  database: FamilyDatabase;
  onUpdateDatabase: (db: FamilyDatabase) => void;
}

interface Draft {
  link: string; parsed: ParsedLink | null; name: string; price: string; photo?: string;
  forKidIds: string[]; wishId?: string; fromBestBuy?: boolean; nameTouched?: boolean;
}
const blankDraft = (): Draft => ({ link: '', parsed: null, name: '', price: '', forKidIds: ['all'] });

type SheetState =
  | { kind: 'add' } | { kind: 'verify' } | { kind: 'item'; id: string } | { kind: 'remove'; id: string }
  | { kind: 'dismiss'; id: string } | { kind: 'bought'; kidId: string } | null;

export const WishCatalogManager: React.FC<Props> = ({ database, onUpdateDatabase }) => {
  const catalog = database.wishCatalog || [];
  const wishes = database.wishRequests || [];
  const kids = database.kids || [];
  const limit = database.settings.wishGoalLimit || DEFAULT_WISH_LIMIT;
  const pin = database.settings.parentPin;
  const [tab, setTab] = useState<'catalog' | 'wishes'>('catalog');
  const [editing, setEditing] = useState(false);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [draft, setDraft] = useState<Draft>(blankDraft());
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [recheck, setRecheck] = useState('');

  const kidName = (id: string) => kids.find((k) => k.id === id)?.name || 'A kid';
  const savers = (itemId: string) => kids.filter((k) => (k.goals || []).some((g) => g.priority === 'primary' && g.catalogItemId === itemId));
  const ready = kids.filter((k) => { const g = (k.goals || []).find((x) => x.priority === 'primary'); return g && g.targetCost > 0 && g.currentSaved >= g.targetCost; });
  const stale = catalog.filter((i) => !i.autoPrice && daysSince(i.priceCheckedAt) > STALE_PRICE_DAYS).length;
  const save = (patch: Partial<FamilyDatabase>) => onUpdateDatabase({ ...database, ...patch });

  const onLink = async (value: string) => {
    const parsed = value ? readProductLink(value) : null;
    let next: Draft = { ...draft, link: value, parsed, fromBestBuy: false };
    if (parsed?.name && !draft.nameTouched) next.name = parsed.name;
    setDraft(next);
    if (parsed?.store === 'Best Buy') {
      setBusy('Checking Best Buy…');
      const bb = await lookupBestBuy(parsed.code);
      setBusy('');
      if (bb) setDraft((d) => (d.link === value ? { ...d, name: bb.name, price: String(bb.price ?? ''), photo: bb.photo || d.photo, fromBestBuy: true, nameTouched: true } : d));
    }
  };

  const onPhoto = async (file?: File) => {
    if (!file) return;
    setError(''); setBusy('Uploading photo…');
    try { const url = await uploadWishPhoto(file, pin); setDraft((d) => ({ ...d, photo: url })); }
    catch (e: any) { setError(e?.message === 'Parent PIN required' ? 'Save your new parent PIN first, then try again.' : e?.message || 'Upload failed'); }
    finally { setBusy(''); }
  };

  const addItem = () => {
    const price = parseFloat(draft.price);
    const item: WishCatalogItem = {
      id: `wish-${Date.now()}`,
      name: draft.name.trim(),
      store: draft.parsed!.store,
      code: draft.parsed!.code,
      url: draft.link,
      price: Number(price.toFixed(2)),
      photo: draft.photo,
      forKidIds: draft.forKidIds,
      priceCheckedAt: todayISO(),
      autoPrice: !!draft.fromBestBuy,
      addedAt: todayISO(),
    };
    let nextKids = kids;
    let nextWishes = wishes;
    if (draft.wishId) {
      // Finishing a kid's wish also makes it their goal, so it's waiting for them on the wall.
      const w = wishes.find((x) => x.id === draft.wishId);
      if (w) nextKids = kids.map((k) => (k.id === w.kidId ? withPrimaryGoal(k, goalFromItem(item, k)) : k));
      nextWishes = wishes.filter((x) => x.id !== draft.wishId);
    }
    save({ wishCatalog: [item, ...catalog], wishRequests: nextWishes, kids: nextKids });
    sound.playCoinSound();
    setDraft(blankDraft()); setSheet(null); setConfirmed(false); setTab('catalog');
  };

  const removeItem = (item: WishCatalogItem) => {
    // Kids keep their savings; the goal just stops pointing at a catalog item that no longer exists.
    const nextKids = kids.map((k) => ({ ...k, goals: (k.goals || []).map((g) => (g.catalogItemId === item.id ? { ...g, catalogItemId: undefined } : g)) }));
    save({ wishCatalog: catalog.filter((i) => i.id !== item.id), kids: nextKids });
    deleteWishPhoto(item.photo, pin);
    sound.playUndo?.();
    setSheet(null);
    if (catalog.length <= 1) setEditing(false);
  };

  const markBought = (kid: KidProfile) => {
    const goal = (kid.goals || []).find((g) => g.priority === 'primary')!;
    const tx: KidCoinTransaction = {
      id: `tx-bought-${Date.now()}`, kidId: kid.id, type: 'withdrawal', amount: goal.targetCost, category: 'reward',
      description: `Bought: ${goal.title}`, date: todayISO(), timestamp: Date.now(), goalContribution: goal.id,
    };
    const rest = (kid.goals || []).filter((g) => g.id !== goal.id);
    const updated: KidProfile = {
      ...kid,
      goals: rest.map((g, i) => ({ ...g, priority: i === 0 ? 'primary' : 'secondary' })),
      totalSaved: Math.max(0, Number(((kid.totalSaved || 0) - goal.targetCost).toFixed(2))),
      transactions: [tx, ...(kid.transactions || [])],
    };
    save({ kids: kids.map((k) => (k.id === kid.id ? updated : k)) });
    sound.playCoinSound();
    setSheet(null);
  };

  // ---------- sheets ----------
  const renderSheet = () => {
    if (!sheet) return null;
    if (sheet.kind === 'add') {
      const w = draft.wishId ? wishes.find((x) => x.id === draft.wishId) : null;
      return (
        <WishSheet title={w ? `${kidName(w.kidId)}'s wish` : 'New item'} onClose={() => setSheet(null)}>
          <div className="wish-sheet-nav">
            <button type="button" className="l" onClick={() => setSheet(null)}>Cancel</button>
            <h2>{w ? `${kidName(w.kidId)}'s wish` : 'New item'}</h2>
            <button type="button" className="r" onClick={() => { setConfirmed(false); setSheet({ kind: 'verify' }); }}>Next</button>
          </div>
          {w && <p>{kidName(w.kidId)} asked for <b style={{ color: 'var(--w-label)' }}>{w.name}</b>. Find it in the store app, then tap Share → Copy link.</p>}
          <div>
            <div className="wish-group-label">Store link</div>
            <div className="wish-group">
              <div className="wish-cell"><input type="url" autoFocus value={draft.link} placeholder="Paste from Share → Copy link" aria-label="Store link" onChange={(e) => onLink(e.target.value.trim())} /></div>
              {draft.link && (
                <div className="wish-cell"><span className="v" style={{ overflowWrap: 'anywhere' }}>
                  {draft.parsed ? <><b style={{ color: 'var(--w-label)', fontWeight: 600 }}>{draft.parsed.store} · item {draft.parsed.code}</b><br />{draft.fromBestBuy ? 'Best Buy found it: name, price and photo filled in.' : draft.parsed.name ? 'Name read from the link.' : 'No name in this link. Type it below.'}</> : 'Not a Best Buy, Amazon, Target or Walmart product link.'}
                </span></div>
              )}
            </div>
          </div>
          <div>
            <div className="wish-group-label">What kids will see</div>
            <div className="wish-group">
              <div className="wish-cell"><span className="k">Name</span><span className="v"><input type="text" value={draft.name} placeholder="Kids Bike Helmet, Blue" aria-label="Name" onChange={(e) => setDraft({ ...draft, name: e.target.value, nameTouched: true })} /></span></div>
              <div className="wish-cell"><span className="k">Price</span><span className="v"><input type="number" min="0" step="0.01" inputMode="decimal" value={draft.price} placeholder="0.00" aria-label="Price" onChange={(e) => setDraft({ ...draft, price: e.target.value })} /></span></div>
              <label className="wish-cell" style={{ cursor: 'pointer' }}>
                <span className="k">Photo</span><span className="v" style={{ color: 'var(--w-accent)' }}>{draft.photo ? 'Change photo' : 'Choose photo'}</span>
                {draft.photo && <WishPhoto src={draft.photo} />}
                <input type="file" accept="image/*" hidden onChange={(e) => onPhoto(e.target.files?.[0])} />
              </label>
            </div>
          </div>
          <div>
            <div className="wish-group-label">For</div>
            <div className="wish-group" style={{ padding: '12px 16px' }}><div className="wish-chips" role="group" aria-label="Who is this for?">
              {[['all', 'Everyone'] as const, ...kids.map((k) => [k.id, k.name] as const)].map(([id, n]) => (
                <button key={id} type="button" aria-pressed={draft.forKidIds.includes(id)} onClick={() => {
                  const next = id === 'all' ? ['all'] : draft.forKidIds.includes(id) ? draft.forKidIds.filter((x) => x !== id) : [...draft.forKidIds.filter((x) => x !== 'all'), id];
                  setDraft({ ...draft, forKidIds: next.length ? next : ['all'] });
                }}>{n}</button>
              ))}
            </div></div>
          </div>
          {busy && <p>{busy}</p>}
          {error && <p className="wish-error">{error}</p>}
        </WishSheet>
      );
    }
    if (sheet.kind === 'verify') {
      const price = parseFloat(draft.price) || 0;
      const checks = verifyItem({ ...draft, price }, catalog, limit);
      const blocked = checks.some((c) => c.state === 'stop');
      const forText = draft.forKidIds.includes('all') ? 'everyone' : draft.forKidIds.map(kidName).join(', ');
      return (
        <WishSheet title="Is this the right item?" onClose={() => setSheet(null)}>
          <div className="wish-sheet-nav"><button type="button" className="l" onClick={() => setSheet({ kind: 'add' })}>‹ Back</button><h2>Check it</h2><span /></div>
          <h2 style={{ fontSize: 22 }}>Is this the right item?</h2>
          <div className="wish-preview"><WishPhoto src={draft.photo} /><div style={{ minWidth: 0 }}><b>{draft.name || 'No name yet'}</b><div className="wish-price">{price > 0 ? money(price) : '$—'}</div><div className="wish-sub">{draft.parsed?.store || 'No store'} · for {forText}</div></div></div>
          <ul className="wish-checks">
            {checks.map((c, i) => (
              <li key={i}><span className={`wish-tick ${c.state}`} aria-label={c.state === 'ok' ? 'OK' : c.state === 'stop' ? 'Must fix' : 'Check'}>{c.state === 'ok' ? '✓' : '!'}</span><span>{c.text}</span></li>
            ))}
          </ul>
          {draft.parsed && <a className="wish-link" href={draft.link} target="_blank" rel="noopener noreferrer">Open the store page to compare</a>}
          {blocked ? <p>Fix the items marked in red to continue.</p> : (
            <label className="wish-confirm"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} /><span>I compared this with the store page. The photo, name and price are right.</span></label>
          )}
          <div className="wish-btns">
            {blocked
              ? <button type="button" className="wish-btn primary" onClick={() => setSheet({ kind: 'add' })}>Back to edit</button>
              : <button type="button" className="wish-btn primary" disabled={!confirmed} onClick={addItem}>Add to catalog</button>}
          </div>
        </WishSheet>
      );
    }
    if (sheet.kind === 'item') {
      const item = catalog.find((i) => i.id === sheet.id);
      if (!item) return null;
      const s = savers(item.id);
      const age = daysSince(item.priceCheckedAt);
      return (
        <WishSheet title={item.name} onClose={() => setSheet(null)}>
          <div className="wish-sheet-nav"><span /><h2>Item</h2><button type="button" className="r" onClick={() => setSheet(null)}>Done</button></div>
          <div className="wish-preview"><WishPhoto src={item.photo} /><div style={{ minWidth: 0 }}><b>{item.name}</b><div className="wish-price">{money(item.price)}</div><div className="wish-sub">{item.store} · item {item.code}</div></div></div>
          <div className="wish-group">
            <div className="wish-cell"><span className="k">Price</span><span className="v">{item.autoPrice ? 'From Best Buy' : `Checked ${age === 0 ? 'today' : `${age} days ago`}`}</span></div>
            <div className="wish-cell"><span className="k">For</span><span className="v">{item.forKidIds.includes('all') ? 'Everyone' : item.forKidIds.map(kidName).join(', ')}</span></div>
            <div className="wish-cell"><span className="k">Saving</span><span className="v">{s.length ? s.map((k) => { const g = k.goals!.find((x) => x.catalogItemId === item.id)!; return `${k.name} (${Math.min(100, Math.round((g.currentSaved / g.targetCost) * 100))}%)`; }).join(', ') : 'Nobody yet'}</span></div>
          </div>
          <a className="wish-link" href={item.url} target="_blank" rel="noopener noreferrer">Open on {item.store}</a>
          <div className="wish-group-label">Re-check price</div>
          <div className="wish-group" style={{ padding: '10px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span>$</span>
            <input type="number" step="0.01" inputMode="decimal" aria-label="Price on the store page" value={recheck || item.price.toFixed(2)} onChange={(e) => setRecheck(e.target.value)}
              style={{ flex: 1, minWidth: 0, font: 'inherit', fontSize: 17, color: 'var(--w-label)', background: 'transparent', border: 0 }} />
            <button type="button" className="wish-btn primary" style={{ width: 'auto', minHeight: 36, padding: '6px 14px', fontSize: 15 }} onClick={() => {
              const v = parseFloat(recheck || String(item.price));
              if (!(v > 0)) return;
              // Goals for this item follow the new price.
              const nextKids = kids.map((k) => ({ ...k, goals: (k.goals || []).map((g) => (g.catalogItemId === item.id ? { ...g, targetCost: v } : g)) }));
              save({ wishCatalog: catalog.map((i) => (i.id === item.id ? { ...i, price: v, priceCheckedAt: todayISO() } : i)), kids: nextKids });
              setRecheck(''); sound.playTap(); setSheet(null);
            }}>Save</button>
          </div>
          <div className="wish-btns"><button type="button" className="wish-btn plain red" onClick={() => setSheet({ kind: 'remove', id: item.id })}>Remove from catalog…</button></div>
        </WishSheet>
      );
    }
    if (sheet.kind === 'remove') {
      const item = catalog.find((i) => i.id === sheet.id);
      if (!item) return null;
      const s = savers(item.id);
      return (
        <WishSheet title="Remove from the catalog?" onClose={() => setSheet(null)}>
          <h2>Remove from the catalog?</h2>
          <div className="wish-preview"><WishPhoto src={item.photo} /><div style={{ minWidth: 0 }}><b>{item.name}</b><div className="wish-sub">{money(item.price)} · {item.store}</div></div></div>
          <p>{s.length
            ? <><b style={{ color: 'var(--w-label)' }}>{s.map((k) => k.name).join(' and ')} {s.length > 1 ? 'are' : 'is'} saving for this.</b> Their savings and goal stay; it just won't show in the catalog any more.</>
            : 'Kids will stop seeing it. Nobody is saving for it right now.'}</p>
          <div className="wish-btns">
            <button type="button" className="wish-btn danger" onClick={() => removeItem(item)}>Remove item</button>
            <button type="button" className="wish-btn" autoFocus onClick={() => setSheet(null)}>Cancel</button>
          </div>
        </WishSheet>
      );
    }
    if (sheet.kind === 'dismiss') {
      const w = wishes.find((x) => x.id === sheet.id);
      if (!w) return null;
      return (
        <WishSheet title="Say no to this wish?" onClose={() => setSheet(null)}>
          <h2>Say no to this wish?</h2>
          <p>{kidName(w.kidId)} asked for <b style={{ color: 'var(--w-label)' }}>{w.name}</b>. It comes off their list, and they can pick something from the catalog instead.</p>
          <div className="wish-btns">
            <button type="button" className="wish-btn danger" onClick={() => { save({ wishRequests: wishes.filter((x) => x.id !== w.id) }); setSheet(null); }}>Remove wish</button>
            <button type="button" className="wish-btn" autoFocus onClick={() => setSheet(null)}>Keep it</button>
          </div>
        </WishSheet>
      );
    }
    if (sheet.kind === 'bought') {
      const kid = kids.find((k) => k.id === sheet.kidId);
      const goal = kid?.goals?.find((g) => g.priority === 'primary');
      if (!kid || !goal) return null;
      return (
        <WishSheet title="Mark as bought?" onClose={() => setSheet(null)}>
          <h2>Mark as bought?</h2>
          <div className="wish-preview"><WishPhoto src={goal.imageUrl} /><div style={{ minWidth: 0 }}><b>{goal.title}</b><div className="wish-sub">{money(goal.targetCost)}{goal.retailer ? ` · ${goal.retailer}` : ''}</div></div></div>
          <p>{money(goal.targetCost)} comes out of {kid.name}'s savings ({money(kid.totalSaved || goal.currentSaved)} now). The goal closes and shows in their history.</p>
          <div className="wish-btns">
            <button type="button" className="wish-btn primary" autoFocus onClick={() => markBought(kid)}>Mark as bought</button>
            <button type="button" className="wish-btn" onClick={() => setSheet(null)}>Cancel</button>
          </div>
        </WishSheet>
      );
    }
    return null;
  };

  return (
    <section className="wish wish-admin" aria-label="Family Wish Catalog">
      <div className="wish-admin-nav">
        <button type="button" disabled={tab !== 'catalog' || !catalog.length} onClick={() => setEditing(!editing)}>{editing ? <b>Done</b> : 'Edit'}</button>
        <button type="button" className="add" aria-label="Add an item" onClick={() => { setDraft(blankDraft()); setError(''); setSheet({ kind: 'add' }); }}>+</button>
      </div>
      <h2 className="title">Wish Catalog</h2>
      <div className="wish-seg" role="group" aria-label="Section">
        <button type="button" aria-pressed={tab === 'catalog'} onClick={() => { setTab('catalog'); }}>Catalog</button>
        <button type="button" aria-pressed={tab === 'wishes'} onClick={() => { setTab('wishes'); setEditing(false); }}>Wishes{wishes.length ? ` · ${wishes.length}` : ''}</button>
      </div>

      {tab === 'catalog' ? (
        <>
          {ready.length > 0 && (
            <>
              <div className="wish-group-label">Ready to buy</div>
              <div className="wish-group">
                {ready.map((k) => { const g = k.goals!.find((x) => x.priority === 'primary')!; return (
                  <div key={k.id} className="wish-block">
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><WishPhoto src={g.imageUrl} className="wish-photo" />
                      <div style={{ minWidth: 0 }}><b style={{ fontWeight: 600 }}>{k.name} reached their goal</b><div className="wish-sub">{g.title} · {money(g.targetCost)}{g.retailer ? ` at ${g.retailer}` : ''}</div></div></div>
                    <button type="button" className="wish-btn primary" style={{ minHeight: 40 }} onClick={() => setSheet({ kind: 'bought', kidId: k.id })}>Mark as bought</button>
                  </div>
                ); })}
              </div>
            </>
          )}
          <div className="wish-group-label">{catalog.length} item{catalog.length === 1 ? '' : 's'}{stale ? <> · <span style={{ color: 'var(--w-due)' }}>{stale} price{stale > 1 ? 's' : ''} to re-check</span></> : null}</div>
          <div className="wish-group">
            {catalog.length === 0 && <div className="wish-empty-list">No items yet. Tap + to add the first one.</div>}
            {catalog.map((i) => {
              const old = !i.autoPrice && daysSince(i.priceCheckedAt) > STALE_PRICE_DAYS;
              const s = savers(i.id);
              return (
                <button key={i.id} type="button" className="wish-item" aria-label={`${editing ? 'Remove ' : ''}${i.name}`}
                  onClick={() => { setRecheck(''); setSheet(editing ? { kind: 'remove', id: i.id } : { kind: 'item', id: i.id }); }}>
                  {editing ? <span className="wish-minus" aria-hidden="true">−</span> : <span />}
                  <WishPhoto src={i.photo} />
                  <span style={{ minWidth: 0 }}><b>{i.name}</b><span className="m"><span className="num">{money(i.price)} · {i.store}</span>
                    {old && <span className="wish-pill due">Re-check price</span>}
                    {s.length > 0 && <span className="wish-pill ok">{s.map((k) => k.name).join(', ')}</span>}</span></span>
                  {!editing ? <span aria-hidden="true" style={{ color: 'var(--w-label-3)', fontSize: 20 }}>›</span> : <span />}
                </button>
              );
            })}
          </div>
          <div className="wish-foot">{editing ? "Tap an item to remove it. You'll be asked to confirm." : 'Kids see these on their Wish List and pick their own goal. Removing an item never takes money away.'}</div>
        </>
      ) : (
        <>
          <div className="wish-group-label">From the wall</div>
          <div className="wish-group">
            {wishes.length === 0 && <div className="wish-empty-list">No wishes right now. Kids send them with "Ask for Something Else".</div>}
            {wishes.map((w) => (
              <div key={w.id} className="wish-block">
                <div><b style={{ fontWeight: 600 }}>{kidName(w.kidId)}</b> wishes for <b style={{ fontWeight: 600 }}>{w.name}</b></div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" className="wish-btn primary" style={{ width: 'auto', minHeight: 38, padding: '6px 14px', fontSize: 15 }}
                    onClick={() => { setDraft({ ...blankDraft(), name: w.name, nameTouched: true, forKidIds: [w.kidId], wishId: w.id }); setError(''); setSheet({ kind: 'add' }); }}>Find and add it</button>
                  <button type="button" className="wish-btn" style={{ width: 'auto', minHeight: 38, padding: '6px 14px', fontSize: 15 }} onClick={() => setSheet({ kind: 'dismiss', id: w.id })}>Not this time</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {renderSheet()}
    </section>
  );
};

export default WishCatalogManager;
