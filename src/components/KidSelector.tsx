import React, { useState } from 'react';
import { KidProfile, CalendarEvent, FamilyDatabase } from '../types';
import { getKidLevelInfo } from '../utils/storage';
import { FamilyGoalBanner } from './FamilyGoalBanner';
import { KidPinModal } from './KidPinModal';
import { KidAvatarModal } from './KidAvatarModal';
import { ActionMenu } from './ActionMenu';
import { sound } from '../utils/sound';
import { AppThemeId, APP_THEMES } from '../utils/theme';

interface KidSelectorProps {
  kids: KidProfile[];
  events?: CalendarEvent[];
  database?: FamilyDatabase;
  currentTheme?: AppThemeId;
  onSelectKid: (kid: KidProfile) => void;
  onOpenParentPin: () => void;
  onOpenCalendar?: () => void;
  onOpenGoalManager?: () => void;
  onOpenMenu?: () => void;
  onOpenRewardStore?: () => void;
  onUpdateDatabase?: (updatedDb: FamilyDatabase) => void;
}

export const KidSelector: React.FC<KidSelectorProps> = ({
  kids,
  database,
  currentTheme = 'coastal-horizon',
  onSelectKid,
  onOpenParentPin,
  onOpenCalendar,
  onOpenGoalManager,
  onOpenMenu,
  onOpenRewardStore,
  onUpdateDatabase,
}) => {
  const [selectedKidForPin, setSelectedKidForPin] = useState<KidProfile | null>(null);
  const [editingAvatarKid, setEditingAvatarKid] = useState<KidProfile | null>(null);
  const theme = APP_THEMES[currentTheme] || APP_THEMES['coastal-horizon'];

  return (
    <div className="max-w-5xl mx-auto px-1 sm:px-4 py-1 sm:py-3 w-full flex flex-col gap-1.5 sm:gap-2.5">
      {/* HERO BANNER: Compact, Rich Gradient, Vivid Emoji Art & Snappy Styling */}
      <div>
        <div
          id="hero-animated-banner"
          className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-4 ${theme.bannerGradient} ${theme.bannerGlow} border ${theme.bannerBorder} text-white shadow-sm select-none`}
        >
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider mb-1 border border-white/30 backdrop-blur-xs">
                <span>✨</span>
                <span>Today's Chore Quest</span>
                <span>🌟</span>
              </div>
              <h1 className="text-base sm:text-xl lg:text-2xl font-black tracking-tight text-white drop-shadow-xs leading-tight flex items-center gap-1.5 flex-wrap">
                <span>Who is completing chores today?</span>
                <span className="text-lg sm:text-xl">🚀</span>
              </h1>
              <p className="text-xs sm:text-sm text-white/95 font-semibold mt-0.5 truncate drop-shadow-xs">
                Select your profile to earn stars ⭐, build streaks 🔥, and unlock rewards 🎁!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Family Goal Progress Banner with Restored Emoji Art */}
      {database && (
        <FamilyGoalBanner
          database={database}
          currentTheme={currentTheme}
          onEditGoal={onOpenGoalManager}
        />
      )}

      {/* Grid of Kid Profiles - Restored Avatars/Profile Pics & Emoji Art */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2.5">
        {kids.map((kid) => {
          const levelInfo = getKidLevelInfo(kid.stars);
          const isCustomPhoto =
            kid.avatar &&
            (kid.avatar.startsWith('http://') ||
              kid.avatar.startsWith('https://') ||
              kid.avatar.startsWith('data:image') ||
              kid.avatar.startsWith('/'));

          return (
            <div
              key={kid.id}
              id={`kid-card-${kid.id}`}
              onClick={() => {
                sound.playTap();
                setSelectedKidForPin(kid);
              }}
              className={`group relative ${theme.kidCardBg} rounded-xl sm:rounded-2xl p-3 sm:p-3.5 border ${theme.kidCardBorder} shadow-xs hover:shadow-md ${theme.kidCardHover} transition-transform transition-shadow duration-150 text-left flex flex-col justify-between overflow-hidden cursor-pointer active:scale-[0.98] select-none`}
            >
              {/* Header: Avatar / Profile Picture, Name, Level info & Menu Drop Down */}
              <div className="flex items-center gap-2.5 mb-2">
                {/* Profile Picture / Avatar */}
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black shadow-xs border-2 ${theme.kidCardAvatarBorder} shrink-0 text-white transition-transform duration-150 group-hover:scale-105 overflow-hidden select-none`}
                  style={{ backgroundColor: kid.color || '#3b82f6' }}
                  onClick={(e) => {
                    if (database && onUpdateDatabase) {
                      e.stopPropagation();
                      sound.playTap();
                      setEditingAvatarKid(kid);
                    }
                  }}
                  title="Click to customize avatar"
                >
                  {isCustomPhoto ? (
                    <img
                      src={kid.avatar}
                      alt={kid.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl sm:text-3xl leading-none filter drop-shadow-xs select-none">
                      {kid.avatar || '🦁'}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <h2 className={`text-base sm:text-lg font-black ${theme.kidCardNameColor} group-hover:opacity-85 transition-opacity truncate`}>
                      {kid.name}
                    </h2>

                    {/* ONLY icon on the kid card profile: The Menu Drop Down Icon */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <ActionMenu
                        id={`menu-kid-card-${kid.id}`}
                        label="Menu"
                        items={[
                          {
                            id: 'enter',
                            label: '🎮 Enter Profile & Play',
                            variant: 'primary',
                            onClick: () => {
                              setSelectedKidForPin(kid);
                            },
                          },
                          ...(database && onUpdateDatabase
                            ? [
                                {
                                  id: 'avatar',
                                  label: '🎨 Change Avatar & Color',
                                  onClick: () => setEditingAvatarKid(kid),
                                },
                              ]
                            : []),
                          ...(onOpenRewardStore
                            ? [
                                {
                                  id: 'rewards',
                                  label: '🎁 Rewards Store',
                                  onClick: () => {
                                    onSelectKid(kid);
                                    onOpenRewardStore();
                                  },
                                },
                              ]
                            : []),
                          ...(onOpenCalendar
                            ? [
                                {
                                  id: 'calendar',
                                  label: '📅 Family Calendar',
                                  onClick: () => onOpenCalendar(),
                                },
                              ]
                            : []),
                          ...(onOpenMenu
                            ? [
                                {
                                  id: 'dinner',
                                  label: '🍽️ Weekly Dinner Menu',
                                  onClick: () => onOpenMenu(),
                                },
                              ]
                            : []),
                          ...(onOpenGoalManager
                            ? [
                                {
                                  id: 'goal',
                                  label: '🏆 Family Team Goal',
                                  onClick: () => onOpenGoalManager(),
                                },
                              ]
                            : []),
                          {
                            id: 'parent',
                            label: '🛡️ Parent PIN / Admin',
                            onClick: () => onOpenParentPin(),
                          },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${theme.accentPill}`}>
                      🎖️ Lvl {levelInfo.level}
                    </span>
                    <span className={`text-[11px] font-bold truncate ${theme.kidCardSubtextColor}`}>
                      • {levelInfo.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Bar: Clean Typography Tiles with Restored Emoji Art */}
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                <div className={`p-2 rounded-lg ${theme.kidCardStatsBg} border border-black/5 dark:border-white/5`}>
                  <div className={`text-[9px] font-black uppercase tracking-wider opacity-80 ${theme.kidCardSubtextColor} flex items-center gap-1`}>
                    <span>⭐</span>
                    <span>Points</span>
                  </div>
                  <div className={`text-base sm:text-lg font-black ${theme.kidCardNameColor} leading-tight mt-0.5 flex items-baseline gap-1`}>
                    <span>{kid.stars}</span>
                    <span className="text-[10px] font-bold opacity-70">pts</span>
                  </div>
                </div>

                <div className={`p-2 rounded-lg ${theme.kidCardStatsBg} border border-black/5 dark:border-white/5`}>
                  <div className={`text-[9px] font-black uppercase tracking-wider opacity-80 ${theme.kidCardSubtextColor} flex items-center gap-1`}>
                    <span>🔥</span>
                    <span>Streak</span>
                  </div>
                  <div className={`text-base sm:text-lg font-black ${theme.kidCardNameColor} leading-tight mt-0.5 flex items-baseline gap-1`}>
                    <span>{kid.streakDays}</span>
                    <span className="text-[10px] font-bold opacity-70">{kid.streakDays === 1 ? 'day' : 'days'}</span>
                  </div>
                </div>
              </div>

              {/* Progress to next level with rocket emoji */}
              <div>
                <div className={`flex justify-between text-[10px] font-black mb-1 ${theme.kidCardSubtextColor}`}>
                  <span className="flex items-center gap-1">
                    <span>🚀</span>
                    <span>Level Progress</span>
                  </span>
                  <span className={`font-black ${theme.kidCardNameColor}`}>{levelInfo.progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full ${theme.kidCardProgress} transition-all duration-300`}
                    style={{ width: `${levelInfo.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Bottom footer text with emoji art */}
              <div className={`mt-2 pt-1.5 border-t border-black/10 dark:border-white/15 flex items-center justify-between text-[10px] font-bold opacity-85 ${theme.kidCardNameColor}`}>
                <span className="flex items-center gap-1">
                  <span>✨</span>
                  <span>Tap to open</span>
                </span>
                <span className="uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[9px] flex items-center gap-1">
                  <span>🔒</span>
                  <span>PIN Protected</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Setup helper for parents with emoji art */}
      <div className="mt-1 sm:mt-1.5 text-center">
        <button
          id="btn-parent-mode-footer"
          onClick={() => {
            sound.playTap();
            onOpenParentPin();
          }}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl ${theme.kidCardBg} hover:opacity-90 ${theme.kidCardNameColor} text-[11px] sm:text-xs font-black transition-transform duration-150 border ${theme.kidCardBorder} shadow-2xs cursor-pointer active:scale-95`}
        >
          <span>🛡️</span>
          <span>Parents: Manage kids, chores & schedules</span>
          <span>⚙️</span>
        </button>
      </div>

      {/* Kid Individual PIN Passcode Modal */}
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

      {/* Kid Avatar Customization Modal */}
      {database && onUpdateDatabase && editingAvatarKid && (
        <KidAvatarModal
          isOpen={!!editingAvatarKid}
          kid={editingAvatarKid}
          database={database}
          onUpdateDatabase={onUpdateDatabase}
          onClose={() => setEditingAvatarKid(null)}
        />
      )}
    </div>
  );
};
