/**
 * CelebrateMoment — full-screen "All done for today" (mockup `Celebrate`).
 * The one deliberately celebratory screen in the 2026 design. Shown once per
 * kid per day when their last chore is finished.
 */
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, Award } from 'lucide-react';
import { fireConfetti } from '../utils/confetti';
import { sound } from '../utils/sound';
import { haptic } from '../utils/haptics';

interface CelebrateMomentProps {
  kidName: string;
  done: number;
  pointsToday: number;
  streakDays: number;
  savedToday: number;
  playful: boolean;
  onSeeRewards: () => void;
  onClose: () => void;
}

export const CelebrateMoment: React.FC<CelebrateMomentProps> = ({
  kidName, done, pointsToday, streakDays, savedToday, playful, onSeeRewards, onClose,
}) => {
  useEffect(() => {
    sound.playLevelUp();
    haptic('success');
    fireConfetti({ origin: { y: 0.35 }, mode: playful ? 'celebration' : 'snappy' });
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, playful]);

  const stats = [
    { v: `+${pointsToday}`, l: 'points' },
    { v: String(streakDays), l: 'day streak' },
    ...(savedToday > 0 ? [{ v: `+$${savedToday.toFixed(2)}`, l: 'to savings' }] : []),
  ];

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="All done for today"
      className="fixed inset-0 z-[80] flex flex-col items-center overflow-y-auto text-[var(--cq-label)] animate-fade-in"
      style={{ background: 'radial-gradient(120% 60% at 50% 32%, rgba(255,181,71,0.18) 0%, transparent 62%), var(--cq-ground)' }}>
      <div className="w-full max-w-[440px] flex-1 flex flex-col items-center gap-7 px-6 pt-[calc(var(--safe-top,0px)+72px)] pb-[calc(var(--safe-bottom,0px)+32px)]">
        <div className="relative w-[220px] h-[220px] animate-scale-in">
          <svg aria-hidden="true" viewBox="0 0 220 220" className="absolute inset-0 w-full h-full">
            <circle cx="110" cy="110" r="94" fill="none" stroke="#FFB547" strokeWidth="18" />
            <circle cx="110" cy="110" r="118" fill="none" stroke="rgba(255,181,71,0.18)" strokeWidth="2" strokeDasharray="2 10" />
          </svg>
          <span className="absolute inset-0 m-auto w-[84px] h-[84px] rounded-full bg-[#FFB547] text-[#0C0E13] flex items-center justify-center">
            <Check className="w-11 h-11" strokeWidth={3} />
          </span>
        </div>

        <div className="flex flex-col items-center gap-1.5 text-center">
          <h1 className="m-0 text-[30px] font-bold tracking-[-0.02em]">All done for today</h1>
          <p className="m-0 text-[17px] text-[var(--cq-label-2)]">Nice work, {kidName}. {done} of {done} finished.</p>
        </div>

        <div className="w-full grid gap-2.5" style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}>
          {stats.map((s) => (
            <div key={s.l} className="flex flex-col items-center gap-0.5 py-4 px-2 rounded-[18px] bg-[var(--cq-surface)] border border-[var(--cq-line)]">
              <span className="text-[26px] cq-num">{s.v}</span>
              <span className="text-[12px] text-[var(--cq-label-2)]">{s.l}</span>
            </div>
          ))}
        </div>

        {streakDays > 0 && streakDays % 5 === 0 && (
          <div className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[18px] border"
            style={{ background: 'color-mix(in srgb, var(--cq-done) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--cq-done) 22%, transparent)' }}>
            <Award className="w-[22px] h-[22px]" style={{ color: 'var(--cq-done)' }} />
            <span className="text-[15px]"><span className="font-semibold">Milestone:</span> {streakDays} days straight</span>
          </div>
        )}

        <div className="mt-auto w-full flex flex-col gap-2.5">
          <button type="button" onClick={() => { sound.playTap(); onSeeRewards(); }}
            className="min-h-[52px] rounded-2xl bg-[#FFB547] text-[#0C0E13] text-[17px] font-semibold cursor-pointer">See what you can get</button>
          <button type="button" onClick={() => { sound.playTap(); onClose(); }}
            className="min-h-[52px] rounded-2xl bg-[var(--cq-surface-2)] text-[17px] font-medium cursor-pointer">Close</button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default CelebrateMoment;
