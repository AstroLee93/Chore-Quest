/**
 * "Still there?" — shown for the last 20 seconds before an idle kiosk returns to the
 * wall, so a kid who is about to check off a chore is never kicked out without warning.
 * Any tap anywhere counts as activity and dismisses it (handled in App.tsx).
 */
import React from 'react';
import { createPortal } from 'react-dom';

interface Props {
  seconds: number;
  kidName?: string;
  kidColor?: string;
  onStay: () => void;
}

export const IdleWarningPrompt: React.FC<Props> = ({ seconds, kidName, kidColor = '#5B8CFF', onStay }) =>
  createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm animate-fade-in"
      role="alertdialog" aria-modal="true" aria-labelledby="idle-title" aria-describedby="idle-desc">
      <div className="w-full max-w-[400px] rounded-[28px] p-7 flex flex-col items-center gap-4 text-center bg-[var(--cq-surface,#161922)] text-[var(--cq-label,#F2F3F5)] border border-[var(--cq-line,rgba(255,255,255,0.08))] shadow-2xl">
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 96 96" className="absolute inset-0 -rotate-90" aria-hidden="true">
            <circle cx="48" cy="48" r="42" fill="none" stroke={kidColor} strokeOpacity="0.2" strokeWidth="8" />
            <circle cx="48" cy="48" r="42" fill="none" stroke={kidColor} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${(2 * Math.PI * 42 * seconds) / 20} ${2 * Math.PI * 42}`} style={{ transition: 'stroke-dasharray 1s linear' }} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[34px] font-light tabular-nums">{seconds}</span>
        </div>
        <h2 id="idle-title" className="m-0 text-[24px] font-bold tracking-[-0.01em]">Still there{kidName ? `, ${kidName}` : ''}?</h2>
        <p id="idle-desc" className="m-0 text-[16px] text-[var(--cq-label-2,#9BA1AD)]">Going back to the wall in {seconds} second{seconds === 1 ? '' : 's'}.</p>
        <button type="button" autoFocus onClick={onStay}
          className="w-full min-h-[56px] rounded-2xl text-[18px] font-semibold text-[#0C0E13] cursor-pointer active:scale-[0.98] transition-transform"
          style={{ background: kidColor }}>
          I'm still here
        </button>
      </div>
    </div>,
    document.body,
  );

export default IdleWarningPrompt;
