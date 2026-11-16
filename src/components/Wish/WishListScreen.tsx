/**
 * Kids' Wish List (Family Wish Catalog). Replaces the old "Goal Selection & AI Retail
 * Importer": kids pick from items their family added and verified, or ask for something else.
 */
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FamilyDatabase, KidProfile, SavingsGoal, WishCatalogItem } from '../../types';
import { sound } from '../../utils/sound';
import { haptic } from '../../utils/haptics';
import { goalFromItem, itemsForKid, money, primaryGoalOf, savedForNewGoal } from '../../utils/wishCatalog';
import { KioskWallpaper } from '../KioskWallpaper';
import { isCq2026Active } from '../../utils/themes2026';
import { WishSheet, WishPhoto, ringSvg, Sym } from './WishSheet';
import '../../styles/wish.css';

interface Props {
  kid: KidProfile;
  database: FamilyDatabase;
  onClose: () => void;
  onSaveGoal: (goal: SavingsGoal) => void;
  onAskWish: (name: string) => void;
}

export const WishListScreen: React.FC<Props> = ({ kid, database, onClose, onSaveGoal, onAskWish }) => {
  const [picking, setPicking] = useState<WishCatalogItem | null>(null);
  const [asking, setAsking] = useState(false);
  const [wishText, setWishText] = useState('');
  const [toast, setToast] = useState('');
  const color = kid.color || '#5B8CFF';
  const items = itemsForKid(database, kid);
  const goal = primaryGoalOf(kid);
  const saved = savedForNewGoal(kid);
  const pending = (database.wishRequests || []).filter((w) => w.kidId === kid.id);
  const wallpaper = isCq2026Active() ? database.settings.kioskWallpaper : '';

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2600); };

  const goalCard = () => {
    if (!goal) {
      return (
        <div className="wish-goal wish-material">
          <div className="wish-ring">{ringSvg(0, color)}<div className="inner" /></div>
          <div><span className="wish-eyebrow">No goal yet</span><h3>Pick something to save for</h3>
            <div className="wish-stat" style={{ marginTop: 8 }}><span style={{ fontSize: 15 }}>Tap Save on anything below.</span></div></div>
        </div>
      );
    }
    const pct = goal.targetCost > 0 ? Math.min(100, Math.round((goal.currentSaved / goal.targetCost) * 100)) : 0;
    const done = goal.currentSaved >= goal.targetCost && goal.targetCost > 0;
    return (
      <div className="wish-goal wish-material">
        <div className="wish-ring">{ringSvg(pct, color)}<WishPhoto src={goal.imageUrl} className="inner" /></div>
        <div style={{ minWidth: 0 }}>
          <span className="wish-eyebrow">Saving for</span>
          <h3>{goal.title}</h3>
          <div className="wish-stats">
            <div className="wish-stat"><b style={{ color }}>{pct}%</b><span>there</span></div>
            <div className="wish-stat"><b>{money(Math.min(goal.currentSaved, goal.targetCost))}</b><span>of {money(goal.targetCost)}</span></div>
            {!done && <div className="wish-stat"><b>{money(goal.targetCost - goal.currentSaved)}</b><span>to go</span></div>}
          </div>
          {done && <div className="wish-state">{Sym.check} Goal reached. A grown-up will get it for you.</div>}
        </div>
      </div>
    );
  };

  return createPortal(
    <div className="wish wish-screen" role="dialog" aria-modal="true" aria-label={`${kid.name}'s Wish List`} style={{ ['--kc' as any]: color }}>
      {wallpaper && (
        <KioskWallpaper value={wallpaper} dim={database.settings.kioskWallpaperDim ?? 25} slideshowMins={database.settings.kioskWallpaperSlideshowMins ?? 10} />
      )}
      <div className="wish-inner">
        <div className="wish-head">
          <div>
            <div className="wish-eyebrow num">{kid.name} · {money(saved)} saved</div>
            <h1 className="wish-large-title">Wish List</h1>
          </div>
          <button type="button" className="wish-done" onClick={() => { sound.playTap(); onClose(); }}>Done</button>
        </div>

        {goalCard()}

        <div className="wish-section"><h2>Save for Something</h2><span>Cheapest first</span></div>
        {items.length === 0 ? (
          <div className="wish-empty wish-material">Nothing here yet. Ask for something below and a grown-up will add it.</div>
        ) : (
          <div className="wish-grid">
            {items.map((i) => {
              const on = goal?.catalogItemId === i.id;
              const enough = saved >= i.price;
              return (
                <article key={i.id} className="wish-tile">
                  <WishPhoto src={i.photo} alt={i.name} />
                  <div className="wish-tile-info">
                    <h3>{i.name}</h3>
                    <div style={{ minWidth: 0 }}>
                      <div className="wish-sub">{money(i.price)} · {i.store}</div>
                      <div className={`wish-sub ${enough ? 'ok' : ''}`}>{enough ? 'You have enough' : `${money(i.price - saved)} to go`}</div>
                    </div>
                    <button type="button" className={`wish-capsule ${on ? 'on' : ''}`} aria-disabled={on}
                      aria-label={on ? `${i.name} is your goal` : `Save for ${i.name}`}
                      onClick={() => { if (on) return; sound.playStarEarned(); haptic('light'); setPicking(i); }}>
                      {on ? <>{Sym.check}GOAL</> : 'SAVE'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {pending.length > 0 && (
          <div className="wish-group wish-material">
            {pending.map((w) => (
              <div key={w.id} className="wish-cell"><span className="v" style={{ color: 'var(--w-label)' }}>{w.name}</span><span className="wish-pill due">A grown-up is checking it</span></div>
            ))}
          </div>
        )}

        <button type="button" className="wish-row wish-material" onClick={() => { sound.playTap(); setAsking(true); }}>
          {Sym.plus}<span className="t">Ask for Something Else<small>A grown-up checks it and adds it for you.</small></span>{Sym.chev}
        </button>
      </div>

      {picking && (
        <WishSheet title="Make it your goal" onClose={() => setPicking(null)} style={{ ['--kc' as any]: color }}>
          <div className="wish-preview"><WishPhoto src={picking.photo} /><div style={{ minWidth: 0 }}><b>{picking.name}</b><div className="wish-price">{money(picking.price)}</div><div className="wish-sub">{picking.store}</div></div></div>
          <p>
            {saved >= picking.price ? 'You already have enough saved!' : `You need ${money(picking.price - saved)} more.`}
            {goal && goal.catalogItemId !== picking.id ? ` This replaces ${goal.title}. Your savings come with you.` : ''}
          </p>
          <div className="wish-btns">
            <button type="button" className="wish-btn kid" autoFocus onClick={() => {
              onSaveGoal(goalFromItem(picking, kid));
              sound.playCoinSound(); haptic('success');
              flash(`You're saving for ${picking.name}!`);
              setPicking(null);
            }}>Make it my goal!</button>
            <button type="button" className="wish-btn" onClick={() => setPicking(null)}>Not yet</button>
          </div>
        </WishSheet>
      )}

      {asking && (
        <WishSheet title="Ask for something else" onClose={() => setAsking(false)}>
          <h2>I wish for…</h2>
          <p>Say what it is. A grown-up checks it, adds a photo and price, and it shows up here for you.</p>
          <div className="wish-group"><div className="wish-cell">
            <input type="text" value={wishText} maxLength={80} autoFocus placeholder="Like: purple roller skates" aria-label="What do you wish for?"
              onChange={(e) => setWishText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') (e.currentTarget.closest('.wish-sheet')?.querySelector('.wish-btn.primary') as HTMLButtonElement)?.click(); }} />
          </div></div>
          <div className="wish-btns">
            <button type="button" className="wish-btn primary" disabled={!wishText.trim()} onClick={() => {
              const n = wishText.trim(); if (!n) return;
              onAskWish(n); sound.playStarEarned();
              setWishText(''); setAsking(false); flash(`Wish sent! A grown-up will add "${n}".`);
            }}>Send my wish</button>
            <button type="button" className="wish-btn" onClick={() => setAsking(false)}>Cancel</button>
          </div>
        </WishSheet>
      )}

      {toast && (
        <div role="status" style={{ position: 'fixed', left: '50%', bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))', transform: 'translateX(-50%)', zIndex: 90, padding: '11px 18px', borderRadius: 999, fontWeight: 600, fontSize: 15, maxWidth: 'calc(100% - 32px)' }} className="wish-material">{toast}</div>
      )}
    </div>,
    document.body,
  );
};

export default WishListScreen;
