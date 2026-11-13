/**
 * KidSelector — "Who's doing chores?" home screen, iOS Settings-style.
 *
 * Large title + time-of-day greeting, family goal banner, then an inset
 * grouped list of kids (avatar, level, streak, points, chevron). Tapping a
 * row opens the passcode sheet; the small pencil on the avatar edits it.
 * Birthday crown/VIP, leader badge and upcoming-birthday hints are kept.
 */

import React, { useState } from 'react';
import { ChevronRight, Shield, Crown, Pencil } from 'lucide-react';
import { KidProfile, CalendarEvent, FamilyDatabase } from '../types';
import { getKidLevelInfo, getTodayDateString } from '../utils/storage';
import { FamilyGoalBanner } from './FamilyGoalBanner';
import { KidPinModal } from './KidPinModal';
import { KidAvatarModal } from './KidAvatarModal';
import { sound } from '../utils/sound';
import { haptic } from '../utils/haptics';
import { AppThemeId, APP_THEMES, DEFAULT_THEME_ID } from '../utils/theme';
import { isBirthdayToday, getDaysUntilBirthday } from '../utils/birthday';

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
  const theme = APP_THEMES[currentTheme] || APP_THEMES[DEFAULT_THEME_ID];
  const todayStr = getTodayDateString();
  const canEditAvatars = !!(database && onUpdateDatabase);
  const leaderRole = database?.settings?.leaderRole;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-[calc(2rem+var(--safe-bottom))] w-full flex flex-col gap-6">
      {/* Large title */}
      <header className="px-1 animate-fade-up">
        <p className="text-[15px] text-label-secondary font-medium">{greeting}{database?.settings?.familyName ? `, ${database.settings.familyName}` : ''}</p>
        <h1 className="type-largetitle text-label">Who's doing chores?</h1>
      </header>

      {database && (
        <div className="animate-fade-up stagger-1">
          <FamilyGoalBanner database={database} currentTheme={currentTheme} onEditGoal={onOpenGoalManager} />
        </div>
      )}

      <section className="flex flex-col gap-2 animate-fade-up stagger-2" aria-labelledby="kids-section-header">
        <h2 id="kids-section-header" className="section-header">Kids</h2>
        <ul className="ios-list glass flex flex-col">
          {kids.map((kid) => {
            const levelInfo = getKidLevelInfo(kid.stars);
            const isLeader = kid.isLeader || (leaderRole?.enabled && leaderRole?.leaderKidId === kid.id);
            const isBday = !!kid.birthdate && isBirthdayToday(kid.birthdate, todayStr);
            const daysUntilBday = kid.birthdate && !isBday ? getDaysUntilBirthday(kid.birthdate, todayStr) : null;

            return (
              <li key={kid.id} className="ios-list-item !p-0 !min-h-0">
                {/* Avatar (+ edit affordance) */}
                <div className="relative shrink-0 pl-4 py-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden shadow-sm"
                    style={{ backgroundColor: kid.color || 'var(--ios-blue)' }}
                    aria-hidden="true"
                  >
                    {isPhotoAvatar(kid.avatar) ? (
                      <img src={kid.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl leading-none">{kid.avatar || '🦁'}</span>
                    )}
                  </div>
                  {isBday && (
                    <Crown className="w-4 h-4 text-ios-yellow fill-ios-yellow absolute top-1.5 -right-1 drop-shadow" aria-hidden="true" />
                  )}
                  {canEditAvatars && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playTap();
                        setEditingAvatarKid(kid);
                      }}
                      className="absolute bottom-2 -right-1.5 w-6 h-6 rounded-full glass-strong flex items-center justify-center text-label-secondary cursor-pointer active:scale-90 transition-transform before:absolute before:-inset-2.5 before:content-['']"
                      title={`Customize ${kid.name}'s avatar`}
                      aria-label={`Customize ${kid.name}'s avatar`}
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Row body: opens the passcode sheet */}
                <button
                  type="button"
                  id={`kid-card-${kid.id}`}
                  onClick={() => { sound.playTap(); haptic('selection'); setSelectedKidForPin(kid); }}
                  className="flex-1 min-w-0 flex items-center gap-3 py-3 pr-4 pl-1 min-h-[72px] text-left cursor-pointer"
                  aria-label={`${kid.name}, level ${levelInfo.level} ${levelInfo.title}, ${kid.stars} points. Enter passcode`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[17px] font-semibold tracking-[-0.41px] text-label truncate">{kid.name}</span>
                      {isLeader && (
                        <span className="ios-tag ios-tag-sm ios-tag-purple">
                          {leaderRole?.badgeIcon || '🎖️'} {leaderRole?.title || 'Leader'}
                        </span>
                      )}
                      {isBday && <span className="ios-tag ios-tag-sm ios-tag-birthday">🎉 Birthday VIP</span>}
                      {!isBday && daysUntilBday !== null && daysUntilBday <= 3 && (
                        <span className="text-[12px] text-label-secondary">🎂 in {daysUntilBday}d</span>
                      )}
                    </div>
                    <p className="text-[13px] text-label-secondary mt-0.5 truncate">
                      Lvl {levelInfo.level} · {levelInfo.title}
                      {kid.streakDays > 0 && <> · 🔥 {kid.streakDays}</>}
                    </p>
                    <div
                      className="ios-progress mt-2 max-w-[160px]"
                      role="progressbar"
                      aria-valuenow={Math.round(levelInfo.progressPercent)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Progress to next level"
                    >
                      <div className={`bg-gradient-to-r ${theme.progressGradient}`} style={{ width: `${levelInfo.progressPercent}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[17px] text-label-secondary tabular-nums">⭐ {kid.stars.toLocaleString()}</span>
                    <ChevronRight className="w-5 h-5 text-label-tertiary" aria-hidden="true" />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex justify-center animate-fade-up stagger-3">
        <button
          type="button"
          id="btn-parent-mode-footer"
          onClick={() => { sound.playTap(); onOpenParentPin(); }}
          className="btn-ios btn-ios-glass btn-ios-sm"
        >
          <Shield className="w-4 h-4 text-ios-blue" />
          <span>Parent Settings</span>
        </button>
      </div>

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
