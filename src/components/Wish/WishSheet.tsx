/** iOS-style sheet used by the Family Wish Catalog: focus stays inside, Escape closes, focus returns. */
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/wish.css';

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const WishSheet: React.FC<Props> = ({ title, onClose, children, style }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const first = ref.current?.querySelector<HTMLElement>('[autofocus], button, input');
    setTimeout(() => first?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key !== 'Tab' || !ref.current) return;
      const f = [...ref.current.querySelectorAll<HTMLElement>('button:not([disabled]), input, a[href]')].filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); if (prev && document.contains(prev)) prev.focus(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return createPortal(
    <div className="wish wish-scrim" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} className="wish-sheet" role="dialog" aria-modal="true" aria-label={title} style={style}>
        {children}
      </div>
    </div>,
    document.body,
  );
};

export const WishPhoto: React.FC<{ src?: string; alt?: string; className?: string }> = ({ src, alt = '', className = 'wish-photo' }) => {
  const [failed, setFailed] = React.useState(false);
  return (
    <div className={className}>
      {src && !failed ? <img src={src} alt={alt} referrerPolicy="no-referrer" onError={() => setFailed(true)} /> : (
        <svg width="40%" height="40%" style={{ display: 'block', margin: 'auto' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8v13M3 12h18M12 8c-2-4-6-4-6-1s6 1 6 1c2-4 6-4 6-1s-6 1-6 1" />
        </svg>
      )}
    </div>
  );
};

export function ringSvg(pct: number, color: string, size = 120, stroke = 14) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeOpacity={0.22} strokeWidth={stroke} />
      {pct > 0 && (
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${(c * Math.min(100, pct)) / 100} ${c}`} style={{ transition: 'stroke-dasharray .8s cubic-bezier(.2,.9,.3,1)' }} />
      )}
    </svg>
  );
}

export const Sym = {
  plus: (
    <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true" style={{ color: 'var(--kc, var(--w-accent))', flex: 'none' }}>
      <circle cx="15" cy="15" r="15" fill="currentColor" /><path d="M15 9v12M9 15h12" stroke="#0C0E13" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  ),
  chev: (
    <svg width="10" height="16" viewBox="0 0 10 16" aria-hidden="true" style={{ color: 'var(--w-label-3)', flex: 'none' }}>
      <path d="M2 2l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  check: (
    <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true" style={{ verticalAlign: '-1px', marginRight: 3 }}>
      <path d="M2.5 7.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};
