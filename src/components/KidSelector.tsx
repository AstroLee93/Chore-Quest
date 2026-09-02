import React, { useState } from 'react';
import { Sparkles, Flame, Trophy, Plus, Calendar, Lock, ChevronRight } from 'lucide-react';
import { KidProfile, CalendarEvent, FamilyDatabase } from '../types';
import { getKidLevelInfo, getTodayDateString } from '../utils/storage';
import { getSeasonalWeatherForDate, WEATHER_CONDITIONS } from '../utils/calendar';
import { FamilyGoalBanner } from './FamilyGoalBanner';
import { KidPinModal } from './KidPinModal';
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
}

export const KidSelector: React.FC<KidSelectorProps> = ({
  kids = [],
  events = [],
  database,
  currentTheme = 'coastal-horizon',
  onSelectKid,
  onOpenParentPin,
  onOpenCalendar,
  onOpenGoalManager,
}) => {
  const [selectedKidForPin, setSelectedKidForPin] = useState<KidProfile | null>(null);
  const todayStr = getTodayDateString();
  const todayWeather = getSeasonalWeatherForDate(todayStr);
  const todayEvents = events.filter((e) => e.date === todayStr);
  const theme = APP_THEMES[currentTheme] || APP_THEMES['coastal-horizon'];

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-10">
      {/* ANIMATED HERO BANNER */}
      <div className="mb-6 sm:mb-8 w-full">
        <div
          id="hero-animated-banner"
          className={`relative overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-5 sm:p-8 lg:p-10 ${theme.bannerGradient} ${theme.bannerGlow} border-2 ${theme.bannerBorder} text-white shadow-xl transition-all duration-500 animate-banner-pulse w-full`}
        >
          {/* Animated Background Shimmer Sweep */}
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>

          {/* Floating Ambient Glow Circles */}
          <div className="absolute -top-12 -right-12 w-36 sm:w-48 h-36 sm:h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-36 sm:w-48 h-36 sm:h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-[11px] sm:text-xs font-black mb-3 sm:mb-4 border border-white/40 shadow-sm backdrop-blur-md transition-colors max-w-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin shrink-0" style={{ animationDuration: '6s' }} />
              <span className="tracking-wide uppercase truncate">Ready for Today's Chores!</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin shrink-0" style={{ animationDuration: '6s' }} />
            </div>

            {/* Main Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] leading-tight sm:leading-tight break-words">
              Who is completing chores today?
            </h1>

            {/* Subtext */}
            <p className="text-xs sm:text-sm md:text-base text-white/95 font-bold mt-2 sm:mt-3 max-w-lg mx-auto drop-shadow-sm leading-relaxed px-1">
              Tap your character below to view your missions, check off tasks, and earn stars for rewards!
            </p>
          </div>
        </div>
      </div>

      {/* Shared Family Goal Progress Banner */}
      {database && (
        <div className="mb-6 sm:mb-8 w-full">
          <FamilyGoalBanner
            database={database}
            currentTheme={currentTheme}
            onEditGoal={onOpenGoalManager}
          />
        </div>
      )}

      {/* Today's Schedule & Practice Highlights Banner */}
      {todayEvents.length > 0 && onOpenCalendar && (
        <div className={`mb-6 sm:mb-8 p-4 sm:p-5 rounded-2xl sm:rounded-3xl ${theme.kidCardBg} border ${theme.kidCardBorder} shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 w-full`}>
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${theme.primaryBtn} flex items-center justify-center text-xl sm:text-2xl shadow-md shrink-0`}>
              📅
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`font-black text-sm sm:text-base ${theme.kidCardNameColor} truncate`}>
                  Today's Schedule ({todayEvents.length} {todayEvents.length === 1 ? 'event' : 'events'})
                </h3>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-black flex items-center gap-1 ${theme.accentPill} shrink-0`}>
                  <span>{WEATHER_CONDITIONS[todayWeather.condition]?.icon || '☀️'}</span>
                  <span>{todayWeather.tempHigh}°F</span>
                </span>
              </div>
              <div className={`flex items-center gap-2 sm:gap-3 text-xs font-bold mt-1.5 flex-wrap ${theme.kidCardSubtextColor}`}>
                {todayEvents.slice(0, 2).map((evt) => (
                  <span key={evt.id} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border ${theme.kidCardStatsBg} max-w-full min-w-0`}>
                    <span className="shrink-0">{evt.icon || '⭐'}</span>
                    <span className={`font-extrabold truncate max-w-[130px] sm:max-w-[180px] ${theme.kidCardNameColor}`}>{evt.title}</span>
                    {evt.time && <span className="font-semibold opacity-80 shrink-0">({evt.time})</span>}
                  </span>
                ))}
                {todayEvents.length > 2 && (
                  <span className="font-black shrink-0">+{todayEvents.length - 2} more</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              onOpenCalendar();
            }}
            className={`px-4 py-2.5 rounded-xl ${theme.primaryBtn} text-xs font-black shadow-xs active:scale-95 transition-all cursor-pointer shrink-0 text-center flex items-center justify-center gap-1.5`}
          >
            <span>Open Calendar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Grid of Kid Profiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full">
        {kids.map((kid) => {
          const levelInfo = getKidLevelInfo(kid.stars ?? 0);
          return (
            <div
              key={kid.id}
              id={`kid-card-${kid.id}`}
              onClick={() => {
                sound.playTap();
                setSelectedKidForPin(kid);
              }}
              className={`group relative ${theme.kidCardBg} rounded-2xl sm:rounded-3xl lg:rounded-[2.25rem] p-5 sm:p-6 border-2 ${theme.kidCardBorder} shadow-md hover:shadow-xl ${theme.kidCardHover} transition-all duration-300 text-left flex flex-col justify-between overflow-hidden cursor-pointer active:scale-[0.98] w-full min-w-0`}
            >
              {/* Avatar & Header */}
              <div className="flex items-center gap-3.5 sm:gap-4 mb-4 sm:mb-5 min-w-0">
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center text-3xl sm:text-4xl shadow-sm border-2 ${theme.kidCardAvatarBorder} shrink-0 transition-transform group-hover:scale-105 duration-200`}
                  style={{ backgroundColor: `${kid.color || '#3b82f6'}25` }}
                >
                  {kid.avatar || '⭐'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h2 className={`text-xl sm:text-2xl font-black ${theme.kidCardNameColor} truncate group-hover:opacity-85 transition-opacity`}>
                      {kid.name}
                    </h2>
                    <span className="p-1.5 rounded-lg bg-black/5 dark:bg-white/10 text-xs text-slate-500 dark:text-slate-300 flex items-center shrink-0" title="PIN Protected Profile">
                      <Lock className="w-3 h-3 text-indigo-500" />
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${theme.accentPill}`}>
                      <span>{levelInfo.icon}</span>
                      <span>Level {levelInfo.level}</span>
                    </span>
                  </div>
                  <span className={`text-xs font-bold block mt-0.5 ${theme.kidCardSubtextColor} truncate`}>
                    {levelInfo.title}
                  </span>
                </div>
              </div>

              {/* Stats Bar */}
              <div className={`grid grid-cols-2 gap-2 sm:gap-2.5 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl ${theme.kidCardStatsBg} mb-4 min-w-0`}>
                {/* Star Balance */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300 flex items-center justify-center font-black text-sm sm:text-base shrink-0">
                    ⭐
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-[10px] sm:text-[11px] font-bold uppercase opacity-75 ${theme.kidCardSubtextColor} truncate`}>Points</div>
                    <div className={`text-sm sm:text-base font-black leading-tight ${theme.kidCardNameColor} truncate`}>
                      {kid.stars ?? 0}
                    </div>
                  </div>
                </div>

                {/* Streak */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-sm sm:text-base shrink-0">
                    <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 fill-orange-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-[10px] sm:text-[11px] font-bold uppercase opacity-75 ${theme.kidCardSubtextColor} truncate`}>Streak</div>
                    <div className="text-sm sm:text-base font-black text-orange-600 dark:text-orange-400 leading-tight truncate">
                      {kid.streakDays ?? 0} {kid.streakDays === 1 ? 'day' : 'days'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Level Progress Meter */}
              <div className="w-full">
                <div className={`flex justify-between text-xs font-black mb-1.5 ${theme.kidCardSubtextColor}`}>
                  <span>Level Progress</span>
                  <span className={`font-black ${theme.kidCardNameColor}`}>{levelInfo.progressPercent}%</span>
                </div>
                <div className="w-full h-2.5 sm:h-3 rounded-full bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full ${theme.kidCardProgress} transition-all duration-500`}
                    style={{ width: `${Math.min(100, Math.max(0, levelInfo.progressPercent))}%` }}
                  />
                </div>
              </div>

              {/* Tap to enter action row */}
              <div className={`mt-4 pt-2.5 sm:mt-5 sm:pt-3 border-t border-black/10 dark:border-white/15 flex items-center justify-between text-xs sm:text-sm font-black group-hover:translate-x-1 transition-transform ${theme.kidCardNameColor}`}>
                <span className="flex items-center gap-1.5 truncate">
                  <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">Enter 4-Digit PIN</span>
                </span>
                <span className="text-sm sm:text-base shrink-0">➔</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Setup Helper for Parents */}
      <div className="mt-8 sm:mt-10 text-center px-2">
        <button
          id="btn-parent-mode-footer"
          onClick={() => {
            sound.playTap();
            onOpenParentPin();
          }}
          className={`inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl ${theme.kidCardBg} hover:opacity-90 ${theme.kidCardNameColor} text-xs sm:text-sm font-black transition-all border-2 ${theme.kidCardBorder} shadow-sm backdrop-blur-md cursor-pointer active:scale-95 min-h-[44px] max-w-full text-center flex-wrap`}
        >
          <Plus className="w-4 h-4 text-amber-500 stroke-[3] shrink-0" />
          <span className="break-words">Parents: Manage kids, add categories, or change chore schedules</span>
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