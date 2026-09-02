import React, { useState } from 'react';
import { KidProfile, CalendarEvent, FamilyDatabase } from '../types';
import { getKidLevelInfo } from '../utils/storage';
import { FamilyGoalBanner } from './FamilyGoalBanner';
import { KidPinModal } from './KidPinModal';
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
}) => {
  const [selectedKidForPin, setSelectedKidForPin] = useState<KidProfile | null>(null);
  const theme = APP_THEMES[currentTheme] || APP_THEMES['coastal-horizon'];

  return (
    <div className="max-w-5xl mx-auto px-1 sm:px-4 py-1 sm:py-4 w-full flex flex-col gap-1.5 sm:gap-3">
      {/* ANIMATED HERO BANNER: Compact, Rich Gradient & Tight Spacing */}
      <div>
        <div
          id="hero-animated-banner"
          className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-5 ${theme.bannerGradient} ${theme.bannerGlow} border ${theme.bannerBorder} text-white shadow-md transition-all duration-500`}
        >
          {/* Animated Background Shimmer Sweep */}
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider mb-1 border border-white/30 backdrop-blur-xs">
                Today's Chores
              </div>
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight text-white drop-shadow-xs leading-tight">
                Who is completing chores today?
              </h1>
              <p className="text-xs sm:text-sm text-white/90 font-semibold mt-0.5 truncate drop-shadow-xs">
                Select your profile or open the menu to earn rewards and build streaks!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Family Goal Progress Banner */}
      {database && (
        <FamilyGoalBanner
          database={database}
          currentTheme={currentTheme}
          onEditGoal={onOpenGoalManager}
        />
      )}

      {/* Grid of Kid Profiles - Tight Spacing & Compact Card Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-3">
        {kids.map((kid) => {
          const levelInfo = getKidLevelInfo(kid.stars);
          return (
            <div
              key={kid.id}
              id={`kid-card-${kid.id}`}
              onClick={() => {
                sound.playTap();
                setSelectedKidForPin(kid);
              }}
              className={`group relative ${theme.kidCardBg} rounded-xl sm:rounded-2xl p-3 sm:p-4 border ${theme.kidCardBorder} shadow-xs hover:shadow-md ${theme.kidCardHover} transition-all duration-200 text-left flex flex-col justify-between overflow-hidden cursor-pointer active:scale-[0.99]`}
            >
              {/* Header: Avatar, Name, Level info & Menu Drop Down */}
              <div className="flex items-center gap-2.5 mb-2 sm:mb-2.5">
                <div
                  className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl flex items-center justify-center font-black text-base sm:text-lg shadow-xs border ${theme.kidCardAvatarBorder} shrink-0 text-white transition-transform group-hover:scale-105 duration-200`}
                  style={{ backgroundColor: kid.color || '#3b82f6' }}
                >
                  {kid.name.slice(0, 2).toUpperCase()}
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
                            label: 'Enter Profile & Play',
                            variant: 'primary',
                            onClick: () => {
                              setSelectedKidForPin(kid);
                            },
                          },
                          ...(onOpenRewardStore
                            ? [
                                {
                                  id: 'rewards',
                                  label: 'Rewards Store',
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
                                  label: 'Family Calendar',
                                  onClick: () => onOpenCalendar(),
                                },
                              ]
                            : []),
                          ...(onOpenMenu
                            ? [
                                {
                                  id: 'dinner',
                                  label: 'Weekly Dinner Menu',
                                  onClick: () => onOpenMenu(),
                                },
                              ]
                            : []),
                          ...(onOpenGoalManager
                            ? [
                                {
                                  id: 'goal',
                                  label: 'Family Team Goal',
                                  onClick: () => onOpenGoalManager(),
                                },
                              ]
                            : []),
                          {
                            id: 'parent',
                            label: 'Parent PIN / Admin',
                            onClick: () => onOpenParentPin(),
                          },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[10px] font-black px-2 py-0.2 rounded-md ${theme.accentPill}`}>
                      Lvl {levelInfo.level}
                    </span>
                    <span className={`text-[11px] font-bold truncate ${theme.kidCardSubtextColor}`}>
                      • {levelInfo.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Bar: Clean Typography Tiles (Compact & Tight) */}
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                <div className={`p-2 rounded-lg ${theme.kidCardStatsBg}`}>
                  <div className={`text-[9px] font-black uppercase tracking-wider opacity-75 ${theme.kidCardSubtextColor}`}>
                    Points
                  </div>
                  <div className={`text-base sm:text-lg font-black ${theme.kidCardNameColor} leading-tight`}>
                    {kid.stars}
                  </div>
                </div>

                <div className={`p-2 rounded-lg ${theme.kidCardStatsBg}`}>
                  <div className={`text-[9px] font-black uppercase tracking-wider opacity-75 ${theme.kidCardSubtextColor}`}>
                    Streak
                  </div>
                  <div className={`text-base sm:text-lg font-black ${theme.kidCardNameColor} leading-tight`}>
                    {kid.streakDays} {kid.streakDays === 1 ? 'day' : 'days'}
                  </div>
                </div>
              </div>

              {/* Progress to next level */}
              <div>
                <div className={`flex justify-between text-[10px] font-black mb-1 ${theme.kidCardSubtextColor}`}>
                  <span>Level Progress</span>
                  <span className={`font-black ${theme.kidCardNameColor}`}>{levelInfo.progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full ${theme.kidCardProgress} transition-all duration-500`}
                    style={{ width: `${levelInfo.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Bottom footer text */}
              <div className={`mt-2 pt-1.5 border-t border-black/10 dark:border-white/15 flex items-center justify-between text-[10px] font-bold opacity-80 ${theme.kidCardNameColor}`}>
                <span>Tap to open</span>
                <span className="uppercase tracking-wider font-extrabold px-1.5 py-0.2 rounded-md bg-black/5 dark:bg-white/10">
                  PIN Protected
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Setup helper for parents */}
      <div className="mt-1 sm:mt-2 text-center">
        <button
          id="btn-parent-mode-footer"
          onClick={() => {
            sound.playTap();
            onOpenParentPin();
          }}
          className={`inline-flex items-center px-3.5 py-1.5 rounded-xl ${theme.kidCardBg} hover:opacity-90 ${theme.kidCardNameColor} text-[11px] sm:text-xs font-black transition-all border ${theme.kidCardBorder} shadow-2xs cursor-pointer active:scale-95`}
        >
          <span>Parents: Manage kids, chores & schedules</span>
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
    </div>
  );
};
