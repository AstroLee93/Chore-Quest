/**
 * "Ask a grown-up": on the wall (kiosk kid session) grown-up actions such as adding
 * money ask for the parent PIN right where they happen. Everywhere else the action
 * runs straight away, as before.
 */
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { sound } from '../utils/sound';

type Require = (what: string, action: () => void) => void;
const ParentGateContext = createContext<Require>((_what, action) => action());

/** Wrap a grown-up action: `requireParent('Adding money', () => deposit())`. */
export const useParentGate = () => useContext(ParentGateContext);

interface Props {
  enabled: boolean; // true on the wall (kiosk kid session)
  parentPin: string;
  children: React.ReactNode;
}

export const ParentGateProvider: React.FC<Props> = ({ enabled, parentPin, children }) => {
  const [pending, setPending] = useState<{ what: string; action: () => void } | null>(null);
  const requireParent = useCallback<Require>(
    (what, action) => (enabled ? setPending({ what, action }) : action()),
    [enabled],
  );
  return (
    <ParentGateContext.Provider value={requireParent}>
      {children}
      {pending && (
        <PinSheet
          what={pending.what}
          parentPin={parentPin}
          onCancel={() => setPending(null)}
          onApproved={() => { const a = pending.action; setPending(null); a(); }}
        />
      )}
    </ParentGateContext.Provider>
  );
};

const PinSheet: React.FC<{ what: string; parentPin: string; onCancel: () => void; onApproved: () => void }> = ({ what, parentPin, onCancel, onApproved }) => {
  const [digits, setDigits] = useState('');
  const [wrong, setWrong] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const len = Math.max(4, String(parentPin || '').length);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      else if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') setDigits((d) => d.slice(0, -1));
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prev?.focus?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const press = (d: string) => {
    setWrong(false);
    setDigits((cur) => {
      const next = (cur + d).slice(0, len);
      if (next.length === len) {
        if (next === String(parentPin)) { sound.playUnlock?.(); setTimeout(onApproved, 120); }
        else { sound.playError?.(); setWrong(true); return ''; }
      }
      return next;
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-5 bg-black/55 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="pg-title"
        className="w-full max-w-[360px] rounded-[26px] p-6 flex flex-col gap-4 text-center bg-[var(--cq-surface-2,#1E222C)] text-[var(--cq-label,#F2F3F5)] border border-[var(--cq-line,rgba(255,255,255,0.08))] shadow-2xl">
        <h2 id="pg-title" className="m-0 text-[20px] font-bold">Ask a grown-up</h2>
        <p className="m-0 text-[15px] text-[var(--cq-label-2,#9BA1AD)]">{what} needs the parent PIN.</p>
        <div className="flex justify-center gap-3" aria-label={`${digits.length} of ${len} digits entered`}>
          {Array.from({ length: len }).map((_, i) => (
            <span key={i} className="w-3.5 h-3.5 rounded-full" style={{ background: i < digits.length ? 'var(--cq-label,#F2F3F5)' : 'transparent', boxShadow: 'inset 0 0 0 2px var(--cq-label-3,#6E7480)' }} />
          ))}
        </div>
        <p className="m-0 min-h-[20px] text-[14px] font-semibold" style={{ color: '#FF453A' }} role="alert">{wrong ? "That PIN didn't match. Try again." : ''}</p>
        <div className="grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((d, i) => d === '' ? <span key={i} /> : (
            <button key={i} type="button" aria-label={d === '⌫' ? 'Delete' : d}
              onClick={() => (d === '⌫' ? setDigits((x) => x.slice(0, -1)) : press(d))}
              className="min-h-[52px] rounded-2xl bg-[rgba(118,118,128,0.24)] text-[20px] cursor-pointer active:scale-95 transition-transform">{d}</button>
          ))}
        </div>
        <button type="button" onClick={onCancel} className="min-h-[48px] rounded-2xl text-[16px] font-semibold text-[var(--cq-accent,#5B8CFF)] cursor-pointer">Cancel</button>
      </div>
    </div>,
    document.body,
  );
};
