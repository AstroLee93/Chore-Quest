/**
 * KidSelector — the family "Today" home screen.
 *
 * 2026 design (docs/design-2026, mockup `Main`): date + large title, the
 * family goal, then one row per kid with a progress ring in the kid's colour,
 * today's count, anything due soon, and points. Tapping a row opens the
 * passcode sheet; the small pencil edits the avatar and style.
 * Birthday crown, leader badge and upcoming-birthday hints are kept.
 */

import React, { useMemo, useState } from 'react';
import { ChevronRight, Shield, Crown, Pencil } from 'lucide-react';
import { KidProfile, CalendarEvent, FamilyDatabase } from '../types';
import { getTodayDateString } from '../utils/storage';
import { FamilyGoalBanner } from './FamilyGoalBanner';
import { KidPinModal } from './KidPinModal';
import { KidAvatarModal } from './KidAvatarModal';
import { sound } from '../utils/sound';
import { haptic } from '../utils/haptics';
import { AppThemeId, DEFAULT_THEME_ID } from '../utils/theme';
import { isBirthdayToday, getDaysUntilBirthday } from '../utils/birthday';
import { getKidDayProgress, ringDash, initials } from '../utils/progress';

interface KidSelectorProps {
  kids: KidProfile[];
  events?: CalendarEvent[];
  database?: FamilyDatabase;
  currentTheme?: AppThemeId;
  onSelectKid: (kid: KidProfile) => void;
  onOpenParentPin: () => void;
  onOpenGoalManager?: () => void;
  onOpenRewardStore?: () => void;
  onOpenSnackRequest?: (kid: KidProfile) => void;
  onUpdateDatabase?: (updatedDb: FamilyDatabase) => void;
}

const isPhotoAvatar = (avatar?: string) =>
  !!avatar &&
  (avatar.startsWith('http://') ||
    avatar.startsWith('https://') ||
    avatar.startsWith('data:image') ||
    avatar.startsWith('/'));

const RING_R = 21;

export const KidSelector: React.FC<KidSelectorProps> = ({
  kids,
  database,
  currentTheme = DEFAULT_THEME_ID,
  onSelectKid,
  onOpenParentPin,
  onOpenGoalManager,
  onUpdateDatabase,
}) => {
  const [selectedKidForPin, setSelectedKidForPin] = useState<KidProfile | null>(null);
  const [editingAvatarKid, setEditingAvatarKid] = useState<KidProfile | null>(null);
  const todayStr = getTodayDateString();
  const canEditAvatars = !!(database && onUpdateDatabase);
  const leaderRole = database?.settings?.leaderRole;

  const progressByKid = useMemo(() => {
    const map: Record<string, ReturnType<typeof getKidDayProgress>> = {};
    if (database) for (const k of kids) map[k.id] = getKidDayProgress(database, k, todayStr);
    return map;
  }, [database, kids, todayStr]);

  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-2xl mx-auto px-5 pt-6 pb-[calc(2rem+var(--safe-bottom))] w-full flex flex-col gap-6">
      <header className="flex items-end justify-between gap-3 animate-fade-up">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-medium text-label-secondary">{dateLabel}</span>
          <h1 className="text-[34px] leading-tight font-bold tracking-[-0.02em] text-label">Today</h1>
        </div>
        <button
          type="button"
          id="btn-parent-mode-header"
          onClick={() => { sound.playTap(); onOpenParentPin(); }}
          className="w-11 h-11 rounded-full cq-card flex items-center justify-center text-label cursor-pointer active:scale-95 transition-transform"
          aria-label="Parent settings"
          title="Parent settings"
        >
          <Shield className="w-5 h-5" strokeWidth={1.8} />
        </button>
      </header>

      {database && (
        <div className="animate-fade-up stagger-1">
          <FamilyGoalBanner database={database} currentTheme={currentTheme} onEditGoal={onOpenGoalManager} />
        </div>
      )}

      <section className="flex flex-col gap-2 animate-fade-up stagger-2" aria-labelledby="kids-section-header">
        <h2 id="kids-section-header" className="cq-eyebrow px-1">Kids</h2>
        <ul className="cq-card overflow-hidden flex flex-col">
          {kids.map((kid, idx) => {
            const p = progressByKid[kid.id] || { done: 0, total: 0, dueSoon: 0, fraction: 0 };
            const color = kid.color || 'var(--cq-accent, #5B8CFF)';
            const isLeader = kid.isLeader || (leaderRole?.enabled && leaderRole?.leaderKidId === kid.id);
            const isBday = !!kid.birthdate && isBirthdayToday(kid.birthdate, todayStr);
            const daysUntilBday = kid.birthdate && !isBday ? getDaysUntilBirthday(kid.birthdate, todayStr) : null;
            const summary =
              p.total === 0
                ? 'Nothing scheduled today'
                : `${p.done} of ${p.total} done${p.dueSoon ? ` · ${p.dueSoon} due soon` : ''}`;

            return (
              <li
                key={kid.id}
                className={`flex items-center ${idx > 0 ? 'border-t border-[var(--cq-line,var(--separator))]' : ''}`}
              >
                {/* Ring + avatar (+ edit) */}
                <div className="relative shrink-0 pl-4 py-3.5">
                  <div className="relative w-12 h-12">
                    <svg aria-hidden="true" width="48" height="48" viewBox="0 0 48 48" className="absolute inset-0 -rotate-90">
                      <circle cx="24" cy="24" r={RING_R} fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="4" />
                      <circle
                        cx="24" cy="24" r={RING_R} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
                        strokeDasharray={ringDash(p.fraction, RING_R)}
                        style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.16,1,0.3,1)' }}
                      />
                    </svg>
                    <span
                      className="absolute inset-[7px] rounded-full overflow-hidden flex items-center justify-center text-[13px] font-bold"
                      style={{ color, backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)` }}
                    >
                      {isPhotoAvatar(kid.avatar) ? (
                        <img src={kid.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        initials(kid.name)
                      )}
                    </span>
                  </div>
                  {isBday && (
                    <Crown className="w-4 h-4 text-[var(--cq-due,#FFB547)] fill-[var(--cq-due,#FFB547)] absolute top-2 -right-1" aria-hidden="true" />
                  )}
                  {canEditAvatars && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); sound.playTap(); setEditingAvatarKid(kid); }}
                      className="absolute bottom-2.5 -right-1 w-6 h-6 rounded-full cq-card flex items-center justify-center text-label-secondary cursor-pointer active:scale-90 transition-transform before:absolute before:-inset-2.5 before:content-['']"
                      title={`Customize ${kid.name}'s avatar and style`}
                      aria-label={`Customize ${kid.name}'s avatar and style`}
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Row body opens the passcode sheet */}
                <button
                  type="button"
                  id={`kid-card-${kid.id}`}
                  onClick={() => { sound.playTap(); haptic('selection'); setSelectedKidForPin(kid); }}
                  className="flex-1 min-w-0 flex items-center gap-3 py-3.5 pr-4 pl-3 min-h-[76px] text-left cursor-pointer hover:bg-[var(--cq-surface-2,transparent)] transition-colors"
                  aria-label={`${kid.name}: ${summary}, ${kid.stars} points. Enter passcode`}
                >
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[17px] font-semibold text-label truncate">{kid.name}</span>
                      {isLeader && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--cq-accent-soft,rgba(91,140,255,0.14))] text-[var(--cq-accent-text,#7FA6FF)]">
                          {leaderRole?.title || 'Leader'}
                        </span>
                      )}
                      {isBday && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--cq-due,#FFB547)]/15 text-[var(--cq-due,#FFB547)]">Birthday</span>
                      )}
                      {!isBday && daysUntilBday !== null && daysUntilBday <= 3 && (
                        <span className="text-[12px] text-label-secondary">Birthday in {daysUntilBday}d</span>
                      )}
                    </div>
                    <span className="text-[13px] text-label-secondary truncate">{summary}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[17px] font-medium text-label cq-num">{kid.stars.toLocaleString()}</span>
                    <span className="text-[12px] text-label-secondary">pts</span>
                    <ChevronRight className="w-[18px] h-[18px] text-label-tertiary" aria-hidden="true" />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <KidPinModal
        isOpen={!!selectedKidForPin}
        kid={selectedKidForPin}
        onClose={() => setSelectedKidForPin(null)}
        onSuccess={() => {
          if (selectedKidForPin) {
            onSelectKid(selectedKidForPin);
            setSelectedKidForPin(null);
          }
        }}
      />

      {canEditAvatars && editingAvatarKid && (
        <KidAvatarModal
          isOpen={!!editingAvatarKid}
          kid={editingAvatarKid}
          database={database!}
          onUpdateDatabase={onUpdateDatabase!}
          onClose={() => setEditingAvatarKid(null)}
        />
      )}
    </div>
  );
};
