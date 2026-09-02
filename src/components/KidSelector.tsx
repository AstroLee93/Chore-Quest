import React, { useState } from 'react';
import { Sparkles, Flame, Trophy, Plus, Award, Calendar, CloudSun, Clock, MapPin, Star, Lock } from 'lucide-react';
import { KidProfile, CalendarEvent, FamilyDatabase } from '../types';
import { getKidLevelInfo, getTodayDateString } from '../utils/storage';
import { getSeasonalWeatherForDate, EVENT_CATEGORIES, WEATHER_CONDITIONS } from '../utils/calendar';
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
  kids,
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-black mb-4 border border-white/40 shadow-sm backdrop-blur-md transition-colors">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="tracking-wide uppercase text-[11px] sm:text-xs">Ready for Today's Chores!</span>
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
            </div>

            {/* Main Animated Title: Crisp Pure White & Same Full Brightness */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] leading-tight sm:leading-tight">
              Who is completing chores today?
            </h1>

            {/* Subtext: Crisp Pure White */}
            <p className="text-sm sm:text-base text-white/95 font-extrabold mt-3 max-w-lg mx-auto drop-shadow-sm leading-relaxed">
              Tap your character below to view your daily missions, check off completed tasks, and earn stars for awesome rewards!
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

      {/* Today's Schedule & Practice Highlights Banner */}
      {todayEvents.length > 0 && onOpenCalendar && (
        <div className={`mb-8 p-4 sm:p-5 rounded-3xl ${theme.kidCardBg} border ${theme.kidCardBorder} shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl ${theme.primaryBtn} flex items-center justify-center text-2xl shadow-md shrink-0`}>
              📅
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`font-black text-base ${theme.kidCardNameColor}`}>
                  Today's Family Schedule ({todayEvents.length} {todayEvents.length === 1 ? 'event' : 'events'})
                </h3>
                <span className={`px-2 py-0.5 rounded-md text-xs font-black flex items-center gap-1 ${theme.accentPill}`}>
                  <span>{WEATHER_CONDITIONS[todayWeather.condition]?.icon || '☀️'}</span>
                  <span>{todayWeather.tempHigh}°F</span>
                </span>
              </div>
              <div className={`flex items-center gap-3 text-xs font-bold mt-1 flex-wrap ${theme.kidCardSubtextColor}`}>
                {todayEvents.slice(0, 2).map((evt) => (
                  <span key={evt.id} className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border ${theme.kidCardStatsBg}`}>
                    <span>{evt.icon || '⭐'}</span>
                    <span className={`font-extrabold ${theme.kidCardNameColor}`}>{evt.title}</span>
                    {evt.time && <span className="font-semibold opacity-80">({evt.time})</span>}
                  </span>
                ))}
                {todayEvents.length > 2 && (
                  <span className="font-black">+{todayEvents.length - 2} more</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              onOpenCalendar();
            }}
            className={`px-4 py-2 rounded-xl ${theme.primaryBtn} text-xs shadow-xs active:scale-95 transition-all cursor-pointer shrink-0`}
          >
            Open Family Calendar →
          </button>
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
              {/* Avatar & Header */}
              <div className="flex items-center gap-4 mb-5">
                <div
                  className={`w-18 h-18 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl shadow-md border-2 ${theme.kidCardAvatarBorder} shrink-0 transition-transform group-hover:scale-105 duration-200`}
                  style={{ backgroundColor: `${kid.color || '#3b82f6'}25` }}
                >
                  {kid.avatar || '⭐'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className={`text-2xl sm:text-3xl font-black ${theme.kidCardNameColor} group-hover:opacity-85 transition-opacity`}>
                      {kid.name}
                    </h2>
                    <span className="p-1.5 rounded-xl bg-black/5 dark:bg-white/10 text-xs text-slate-500 dark:text-slate-300 flex items-center gap-1 font-black" title="PIN Protected Profile">
                      <Lock className="w-3.5 h-3.5 text-indigo-500" />
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${theme.accentPill}`}>
                      <span>{levelInfo.icon}</span>
                      <span>Level {levelInfo.level}</span>
                    </span>
                  </div>
                  <span className={`text-xs font-bold block mt-0.5 ${theme.kidCardSubtextColor}`}>
                    {levelInfo.title}
                  </span>
                </div>
              </div>

              {/* Stats Bar */}
              <div className={`grid grid-cols-2 gap-2.5 p-3 rounded-2xl ${theme.kidCardStatsBg} mb-4`}>
                {/* Star Balance */}
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300 flex items-center justify-center font-black text-base shadow-2xs">
                    ⭐
                  </div>
                  <div>
                    <div className={`text-[11px] font-bold uppercase opacity-75 ${theme.kidCardSubtextColor}`}>Points</div>
                    <div className={`text-base font-black leading-tight ${theme.kidCardNameColor}`}>
                      {kid.stars}
                    </div>
                  </div>
                </div>

                {/* Streak */}
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-base shadow-2xs">
                    <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                  </div>
                  <div>
                    <div className={`text-[11px] font-bold uppercase opacity-75 ${theme.kidCardSubtextColor}`}>Streak</div>
                    <div className="text-base font-black text-orange-600 dark:text-orange-400 leading-tight">
                      {kid.streakDays} {kid.streakDays === 1 ? 'day' : 'days'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress to next level */}
              <div>
                <div className={`flex justify-between text-xs font-black mb-1.5 ${theme.kidCardSubtextColor}`}>
                  <span>Level Progress</span>
                  <span className={`font-black ${theme.kidCardNameColor}`}>{levelInfo.progressPercent}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full ${theme.kidCardProgress} transition-all duration-500`}
                    style={{ width: `${levelInfo.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Tap to enter prompt */}
              <div className={`mt-5 pt-3 border-t border-black/10 dark:border-white/15 flex items-center justify-between text-xs sm:text-sm font-black group-hover:translate-x-1 transition-transform ${theme.kidCardNameColor}`}>
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Enter 4-Digit PIN to Play</span>
                </span>
                <span className="text-base">➔</span>
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
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl ${theme.kidCardBg} hover:opacity-90 ${theme.kidCardNameColor} text-xs sm:text-sm font-black transition-all border-2 ${theme.kidCardBorder} shadow-sm backdrop-blur-md cursor-pointer active:scale-95 min-h-[44px]`}
        >
          <Plus className="w-4 h-4 text-amber-500 stroke-[3]" />
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
