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
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
      {/* ANIMATED HERO BANNER: Pure Crisp White Lettering & Theme Animated Gradient */}
      <div className="mb-8">
        <div
          id="hero-animated-banner"
          className={`relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 ${theme.bannerGradient} ${theme.bannerGlow} border-2 ${theme.bannerBorder} text-white shadow-2xl transition-all duration-500 animate-banner-pulse`}
        >
          {/* Animated Background Shimmer Sweep */}
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>

          {/* Floating Subtle Ambient Glow Circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-black mb-4 border border-white/40 shadow-sm backdrop-blur-md transition-colors">
              <span className="tracking-wide uppercase text-[11px] sm:text-xs">Ready for Today's Chores!</span>
            </div>

            {/* Main Animated Title: Crisp Pure White */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] leading-tight sm:leading-tight">
              Who is completing chores today?
            </h1>

            {/* Subtext: Crisp Pure White */}
            <p className="text-sm sm:text-base text-white/95 font-extrabold mt-3 max-w-lg mx-auto drop-shadow-sm leading-relaxed">
              Select your profile below or open the menu to view chores, redeem rewards, and check your daily streak!
            </p>
          </div>
        </div>
      </div>

      {/* Shared Family Goal Progress Banner */}
      {database && (
        <div className="mb-6">
          <FamilyGoalBanner
            database={database}
            currentTheme={currentTheme}
            onEditGoal={onOpenGoalManager}
          />
        </div>
      )}

      {/* Grid of Kid Profiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
              className={`group relative ${theme.kidCardBg} rounded-[2.5rem] p-6 sm:p-7 border-2 ${theme.kidCardBorder} shadow-lg hover:shadow-2xl ${theme.kidCardHover} transition-all duration-300 text-left flex flex-col justify-between overflow-hidden cursor-pointer active:scale-[0.98] min-h-[44px]`}
            >
              {/* Header: Avatar, Name, Level info & Menu Drop Down Icon */}
              <div className="flex items-start gap-4 mb-5">
                <div
                  className={`w-16 h-16 sm:w-18 sm:h-18 rounded-3xl flex items-center justify-center font-black text-xl sm:text-2xl shadow-md border-2 ${theme.kidCardAvatarBorder} shrink-0 text-white transition-transform group-hover:scale-105 duration-200`}
                  style={{ backgroundColor: kid.color || '#3b82f6' }}
                >
                  {kid.name.slice(0, 2).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className={`text-2xl sm:text-3xl font-black ${theme.kidCardNameColor} group-hover:opacity-85 transition-opacity truncate`}>
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

                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${theme.accentPill}`}>
                      Level {levelInfo.level}
                    </span>
                    <span className={`text-xs font-bold truncate ${theme.kidCardSubtextColor}`}>
                      • {levelInfo.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Bar: Clean Typography Tiles (NO individual icons) */}
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <div className={`p-3 rounded-2xl ${theme.kidCardStatsBg}`}>
                  <div className={`text-[11px] font-black uppercase tracking-wider opacity-70 ${theme.kidCardSubtextColor}`}>
                    Points
                  </div>
                  <div className={`text-xl sm:text-2xl font-black ${theme.kidCardNameColor} mt-0.5`}>
                    {kid.stars}
                  </div>
                </div>

                <div className={`p-3 rounded-2xl ${theme.kidCardStatsBg}`}>
                  <div className={`text-[11px] font-black uppercase tracking-wider opacity-70 ${theme.kidCardSubtextColor}`}>
                    Streak
                  </div>
                  <div className={`text-xl sm:text-2xl font-black ${theme.kidCardNameColor} mt-0.5`}>
                    {kid.streakDays} {kid.streakDays === 1 ? 'day' : 'days'}
                  </div>
                </div>
              </div>

              {/* Progress to next level */}
              <div>
                <div className={`flex justify-between text-xs font-black mb-1.5 ${theme.kidCardSubtextColor}`}>
                  <span>Level Progress</span>
                  <span className={`font-black ${theme.kidCardNameColor}`}>{levelInfo.progressPercent}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full ${theme.kidCardProgress} transition-all duration-500`}
                    style={{ width: `${levelInfo.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Bottom footer text (NO individual lock or arrow icons) */}
              <div className={`mt-5 pt-3 border-t border-black/10 dark:border-white/15 flex items-center justify-between text-xs font-black opacity-80 ${theme.kidCardNameColor}`}>
                <span>Tap card or use Menu to open</span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10">
                  PIN Protected
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Setup helper for parents */}
      <div className="mt-10 text-center">
        <button
          id="btn-parent-mode-footer"
          onClick={() => {
            sound.playTap();
            onOpenParentPin();
          }}
          className={`inline-flex items-center px-5 py-3 rounded-2xl ${theme.kidCardBg} hover:opacity-90 ${theme.kidCardNameColor} text-xs sm:text-sm font-black transition-all border-2 ${theme.kidCardBorder} shadow-sm backdrop-blur-md cursor-pointer active:scale-95 min-h-[44px]`}
        >
          <span>Parents: Manage kids, add categories, or change chore schedules</span>
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
