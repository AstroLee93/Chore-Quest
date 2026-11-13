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
import { ChevronRight, Shield, Crown, Pencil, Bell, Menu } from 'lucide-react';
import { ParentPinModal } from './ParentPinModal';
import { isCq2026Active } from '../utils/themes2026';
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
  const isCq = isCq2026Active();

  // "Needs you" inbox (mockup Main): finished chores waiting for a parent,
  // today's skip requests, and pending kid grocery/snack requests.
  const [pinAction, setPinAction] = useState<null | { kind: 'approve'; logId: string } | { kind: 'open' }>(null);
  const kidName = (id: string) => kids.find((k) => k.id === id)?.name || 'Someone';
  const kidColor = (id: string) => kids.find((k) => k.id === id)?.color || '#5B8CFF';
  const choreTitle = (id: string) => database?.chores.find((c) => c.id === id)?.title || 'a chore';
  const ago = (iso?: string) => {
    if (!iso) return '';
    const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`;
  };
  type InboxItem = { id: string; kidId: string; title: string; sub: string; approveLogId?: string };
  const inbox = useMemo((): InboxItem[] => {
    if (!database) return [];
    const unverified = (database.logs || [])
      .filter((l) => l.status === 'completed' && !l.verifiedByParent)
      .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''))
      .map((l) => ({ id: `v-${l.id}`, kidId: l.kidId, title: `${kidName(l.kidId)} finished “${choreTitle(l.choreId)}”`, sub: ago(l.completedAt) || 'Waiting for a parent', approveLogId: l.id }));
    const skips = (database.logs || [])
      .filter((l) => l.status === 'skipped' && l.date === todayStr)
      .map((l) => ({ id: `s-${l.id}`, kidId: l.kidId, title: `${kidName(l.kidId)} wants to skip “${choreTitle(l.choreId)}”`, sub: l.skippedReason ? `“${l.skippedReason}”` : (l.skippedReasonCategory || '').replace(/_/g, ' ') }));
    const requests = (database.weeklyGroceryList?.requests || [])
      .filter((r) => r.status === 'pending')
      .map((r) => ({ id: `r-${r.id}`, kidId: r.kidId, title: `${r.kidName} asked for ${r.name}`, sub: r.starCost ? `${r.starCost} pts` : 'Grocery request' }));
    return [...unverified, ...skips, ...requests];
  }, [database, todayStr]);

  const approveLog = (logId: string) => {
    if (!database || !onUpdateDatabase) return;
    sound.playStarEarned();
    haptic('success');
    onUpdateDatabase({ ...database, logs: database.logs.map((l) => (l.id === logId ? { ...l, verifiedByParent: true } : l)) });
  };

  return (
    <div className="max-w-2xl mx-auto px-5 pt-[calc(var(--safe-top,0px)+24px)] pb-[calc(2rem+var(--safe-bottom))] w-full flex flex-col gap-6">
      <header className="flex items-end justify-between gap-3 animate-fade-up">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-medium text-label-secondary">{dateLabel}</span>
          <h1 className="text-[34px] leading-tight font-bold tracking-[-0.02em] text-label">Today</h1>
        </div>
        <div className="flex items-center gap-2.5">
        <button
          type="button"
          id="btn-parent-mode-header"
          onClick={() => { sound.playTap(); onOpenParentPin(); }}
          className="relative w-11 h-11 rounded-full cq-card flex items-center justify-center text-label cursor-pointer active:scale-95 transition-transform"
          aria-label="Parent settings"
          title="Parent settings"
        >
          {isCq ? <Bell className="w-5 h-5" strokeWidth={1.8} /> : <Shield className="w-5 h-5" strokeWidth={1.8} />}
          {isCq && inbox.length > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full" style={{ background: 'var(--cq-due)', boxShadow: '0 0 0 2px var(--cq-surface)' }} />
          )}
        </button>
        {isCq && (
          <button
            type="button"
            onClick={() => { sound.playTap(); window.dispatchEvent(new Event('cq-open-menu')); }}
            className="w-11 h-11 rounded-full cq-card flex items-center justify-center text-label cursor-pointer active:scale-95 transition-transform"
            aria-label="Menu"
            title="Menu"
          >
            <Menu className="w-5 h-5" strokeWidth={1.8} />
          </button>
        )}
        </div>
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

      {isCq && inbox.length > 0 && (
        <section aria-labelledby="needs-you-h" className="flex flex-col gap-2 animate-fade-up stagger-3">
          <h2 id="needs-you-h" className="cq-eyebrow px-1">Needs you · {inbox.length}</h2>
          <div className="cq-card p-4 flex flex-col gap-3.5">
            {inbox.slice(0, 3).map((item, i) => (
              <div key={item.id} className={`flex flex-col gap-3 ${i ? 'pt-3.5 border-t border-[var(--cq-line)]' : ''}`}>
                <div className="flex gap-3 items-center">
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                    style={{ color: kidColor(item.kidId), background: `color-mix(in srgb, ${kidColor(item.kidId)} 16%, transparent)` }}>
                    {initials(kidName(item.kidId))}
                  </span>
                  <button type="button" onClick={() => setPinAction({ kind: 'open' })} className="flex-1 min-w-0 flex flex-col text-left cursor-pointer">
                    <span className="text-[15px] font-semibold text-label truncate">{item.title}</span>
                    <span className="text-[13px] text-label-secondary truncate">{item.sub}</span>
                  </button>
                  {!item.approveLogId && <ChevronRight className="w-[18px] h-[18px] text-label-tertiary shrink-0" aria-hidden="true" />}
                </div>
                {item.approveLogId && (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setPinAction({ kind: 'approve', logId: item.approveLogId! })}
                      className="flex-1 min-h-[44px] rounded-xl bg-[var(--cq-accent)] text-[var(--cq-on-accent)] text-[15px] font-semibold cursor-pointer">Approve</button>
                    <button type="button" onClick={() => setPinAction({ kind: 'open' })}
                      className="flex-1 min-h-[44px] rounded-xl bg-[var(--cq-surface-2)] text-label text-[15px] font-semibold cursor-pointer">Review</button>
                  </div>
                )}
              </div>
            ))}
            {inbox.length > 3 && (
              <button type="button" onClick={() => setPinAction({ kind: 'open' })} className="self-start min-h-[36px] text-[15px] text-[var(--cq-accent-text)] cursor-pointer">
                See all {inbox.length}
              </button>
            )}
          </div>
        </section>
      )}

      {database && (
        <ParentPinModal
          isOpen={!!pinAction}
          correctPin={database.settings.parentPin || '1234'}
          isDefaultPin={!database.settings.parentPin || database.settings.parentPin === '1234'}
          onClose={() => setPinAction(null)}
          onSuccess={() => {
            const action = pinAction;
            setPinAction(null);
            if (action?.kind === 'approve') approveLog(action.logId);
            else onOpenParentPin();
          }}
        />
      )}

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
