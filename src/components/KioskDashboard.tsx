import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Maximize, Minimize, X, Trophy, Flame, Star, Check, Sparkles, Clock, Calendar as CalendarIcon, Volume2, VolumeX, Shield, Timer, Target, UtensilsCrossed, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FamilyDatabase, KidProfile, ChoreItem, ChoreLog, CalendarEvent } from '../types';
import { getTodayDateString, isChoreScheduledForDate, isChoreAssignedToKid, getKidLevelInfo, getMvpKid } from '../utils/storage';
import { getSeasonalWeatherForDate, WEATHER_CONDITIONS } from '../utils/calendar';
import { getCurrentDayOfWeekKey, DEFAULT_WEEKLY_MENU } from '../utils/menu';
import { sound } from '../utils/sound';
import { AppThemeId, APP_THEMES } from '../utils/theme';
import { FamilyGoalBanner } from './FamilyGoalBanner';
import { ChoreTimerModal } from './ChoreTimerModal';
import { FamilyGoalModal } from './FamilyGoalModal';
import { WeeklyMenuModal } from './WeeklyMenuModal';
import { ThemeSelector } from './ThemeSelector';
import { ParentPinModal } from './ParentPinModal';
import { KidPinModal } from './KidPinModal';

interface KioskDashboardProps {
  database: FamilyDatabase;
  currentTheme?: AppThemeId;
  onThemeChange?: (themeId: AppThemeId) => void;
  onUpdateDatabase: (updated: FamilyDatabase) => void;
  onExitKiosk: () => void;
  onSelectKid?: (kid: KidProfile) => void;
  onOpenCalendar?: () => void;
  onOpenMenu?: () => void;
}

export const KioskDashboard: React.FC<KioskDashboardProps> = ({
  database,
  currentTheme = 'coastal-horizon',
  onThemeChange,
  onUpdateDatabase,
  onExitKiosk,
  onSelectKid,
  onOpenCalendar,
  onOpenMenu,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeTimerChore, setActiveTimerChore] = useState<ChoreItem | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState<boolean>(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState<boolean>(false);
  const [isExitPinOpen, setIsExitPinOpen] = useState<boolean>(false);
  const [selectedKidForPin, setSelectedKidForPin] = useState<KidProfile | null>(null);

  const theme = APP_THEMES[currentTheme] || APP_THEMES['coastal-horizon'];
  const todayStr = useMemo(() => getTodayDateString(), []);
  const todayWeather = useMemo(() => getSeasonalWeatherForDate(todayStr), [todayStr]);
  const todayDayKey = useMemo(() => getCurrentDayOfWeekKey(), []);
  const todayMenuPlan = (database.weeklyMenu?.days || DEFAULT_WEEKLY_MENU.days)[todayDayKey] || DEFAULT_WEEKLY_MENU.days[todayDayKey];

  // Live clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Track fullscreen changes
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    sound.playTap();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const handleQuickCompleteChore = useCallback((chore: ChoreItem, kid: KidProfile) => {
    sound.playChoreComplete();
    sound.playStarEarned();

    confetti({
      particleCount: 50,
      spread: 65,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981'],
    });

    const existingLogIndex = (database.logs || []).findIndex(
      (l) => l.choreId === chore.id && l.kidId === kid.id && l.date === todayStr
    );

    const starsEarned = chore.stars + (chore.bountyBonusStars || 0);
    let updatedLogs: ChoreLog[];

    if (existingLogIndex >= 0) {
      updatedLogs = [...database.logs];
      updatedLogs[existingLogIndex] = {
        ...updatedLogs[existingLogIndex],
        status: 'completed',
        completedAt: new Date().toISOString(),
        starsAwarded: starsEarned,
      };
    } else {
      const newLog: ChoreLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        choreId: chore.id,
        kidId: kid.id,
        date: todayStr,
        status: 'completed',
        completedAt: new Date().toISOString(),
        starsAwarded: starsEarned,
      };
      updatedLogs = [...(database.logs || []), newLog];
    }

    const updatedKids = database.kids.map((k) =>
      k.id === kid.id
        ? {
            ...k,
            stars: k.stars + starsEarned,
            lifetimeStars: k.lifetimeStars + starsEarned,
            lastActiveDate: todayStr,
          }
        : k
    );

    onUpdateDatabase({ ...database, kids: updatedKids, logs: updatedLogs });
  }, [database, todayStr, onUpdateDatabase]);

  // Memoized stats & calculations (prevents re-filtering hundreds of items on every 1-second clock tick)
  const todayEvents = useMemo(
    () => (database.events || []).filter((e) => e.date === todayStr),
    [database.events, todayStr]
  );

  const bountyChores = useMemo(
    () => (database.chores || []).filter((c) => c.isActive && c.isBounty),
    [database.chores]
  );

  const mvpKid = useMemo(
    () => getMvpKid(database.kids, database.logs || []),
    [database.kids, database.logs]
  );

  const mvpLevel = useMemo(
    () => (mvpKid ? getKidLevelInfo(mvpKid.lifetimeStars) : null),
    [mvpKid]
  );

  // Per-kid mission summary calculations
  const kidStats = useMemo(() => {
    return database.kids.map((kid) => {
      const kidChores = (database.chores || []).filter(
        (c) => c.isActive && isChoreScheduledForDate(c, todayStr) && isChoreAssignedToKid(c, kid.id)
      );
      const completedCount = kidChores.filter((c) =>
        (database.logs || []).some(
          (l) => l.choreId === c.id && l.kidId === kid.id && l.date === todayStr && l.status === 'completed'
        )
      ).length;
      const totalChores = kidChores.length;
      const percent = totalChores > 0 ? Math.round((completedCount / totalChores) * 100) : 100;
      const isAllDone = totalChores > 0 && completedCount === totalChores;
      const isMvp = !!mvpKid && kid.id === mvpKid.id;
      const level = getKidLevelInfo(kid.lifetimeStars);

      return {
        kid,
        kidChores,
        completedCount,
        totalChores,
        percent,
        isAllDone,
        isMvp,
        level,
      };
    });
  }, [database.kids, database.chores, database.logs, todayStr, mvpKid]);

  const { totalFamilyChoresToday, totalFamilyCompletedToday } = useMemo(() => {
    let scheduled = 0;
    let completed = 0;
    kidStats.forEach((stat) => {
      scheduled += stat.totalChores;
      completed += stat.completedCount;
    });
    return { totalFamilyChoresToday: scheduled, totalFamilyCompletedToday: completed };
  }, [kidStats]);

  const handleCheerMvp = useCallback(() => {
    sound.playStarEarned();
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#fbbf24', '#f59e0b', '#ec4899', '#3b82f6', '#10b981'],
    });
  }, []);

  return (
    <div className={`min-h-screen ${theme.kioskBg} flex flex-col p-4 sm:p-6 select-none overflow-x-hidden font-sans transition-colors duration-300`}>
      {/* THEMED KIOSK HEADER: Clock, Weather, Family Name, Theme Switcher & Controls */}
      <header className={`relative z-40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl ${theme.kioskHeaderBg} border ${theme.kioskHeaderBorder} shadow-xl mb-4`}>
        {/* Left: Branding & Family Title */}
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl ${theme.kioskHeaderLogoBg} ${theme.kioskHeaderLogoText} flex items-center justify-center text-2xl shadow-md shrink-0`}>
            🏰
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${theme.accentPill}`}>
                Ambient Kiosk Display
              </span>
              <span className="text-xs font-bold opacity-80 text-white">
                {database.settings.familyName} Command Center
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              ChoreQuest Live Dashboard
            </h1>
          </div>
        </div>

        {/* Center: Themed Clock & Live Weather */}
        <div className={`flex items-center gap-4 sm:gap-6 px-5 py-2.5 rounded-2xl ${theme.kioskClockBg} self-stretch sm:self-auto justify-center`}>
          <div className="text-left">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight font-mono ${theme.kioskClockText}`}>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[11px] font-bold opacity-80 text-white">
              {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          <div className="h-8 w-px bg-white/20" />

          {/* Live Weather */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">{WEATHER_CONDITIONS[todayWeather.condition]?.icon || '☀️'}</span>
            <div>
              <div className="text-sm font-black text-white">
                {todayWeather.tempHigh}°{database.settings.tempUnit || 'F'}
              </div>
              <div className="text-[10px] font-semibold opacity-80 text-white capitalize">
                {todayWeather.condition.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions, Theme Switcher, Menu, Calendar, Fullscreen & Exit */}
        <div className="flex items-center gap-2 flex-wrap self-end lg:self-center relative z-50">
          {onThemeChange && (
            <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />
          )}

          {/* Dinner Menu Button */}
          <button
            id="btn-kiosk-dinner-menu"
            onClick={() => {
              sound.playTap();
              if (onOpenMenu) onOpenMenu();
              else setIsMenuModalOpen(true);
            }}
            className={`p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl ${theme.kioskFooterPillSecondaryBg} ${theme.kioskFooterPillSecondaryText} font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-xs`}
            title="Open Weekly Dinner Menu & Kids' Choice Voting"
          >
            <span className="text-sm">{todayMenuPlan.icon || '🍽️'}</span>
            <span className="hidden sm:inline">Dinner Menu</span>
            {todayMenuPlan.votingEnabled && (
              <span className="px-1.5 py-0.2 rounded-full bg-pink-600 text-white text-[10px] font-black animate-pulse">
                Vote
              </span>
            )}
          </button>

          {onOpenCalendar && (
            <button
              onClick={() => {
                sound.playTap();
                onOpenCalendar();
              }}
              className={`p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl ${theme.kioskClockBg} text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95`}
            >
              <CalendarIcon className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Calendar</span>
              {todayEvents.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-black">
                  {todayEvents.length}
                </span>
              )}
            </button>
          )}

          <button
            onClick={handleToggleFullscreen}
            className={`p-2.5 rounded-xl ${theme.kioskClockBg} text-white hover:opacity-90 transition-all cursor-pointer`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Kiosk'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setIsExitPinOpen(true);
            }}
            className="p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            title="Exit Kiosk Mode (Parent PIN Required)"
          >
            <Lock className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">Exit Kiosk</span>
          </button>
        </div>
      </header>

      {/* Shared Family Goal Bar */}
      <div className="mb-4 relative z-10">
        <FamilyGoalBanner
          database={database}
          currentTheme={currentTheme}
          isParentMode={false}
          onEditGoal={() => {
            sound.playTap();
            setIsGoalModalOpen(true);
          }}
        />
      </div>

      {/* Main Kiosk Content Area: MVP Spotlight + Kids Missions Grid */}
      <div className="flex-1 flex flex-col gap-4 mb-4">
        {/* MVP Spotlight Banner */}
        {mvpKid && (
          <div
            id="kiosk-mvp-spotlight-bar"
            className={`relative overflow-hidden rounded-3xl p-4 sm:p-5 ${theme.kioskMvpSpotlightBg} border-2 ${theme.kioskMvpSpotlightBorder} flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in`}
          >
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-4 text-center md:text-left z-10">
              <div className="relative shrink-0">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.9)] animate-bounce select-none">
                  👑
                </div>
                <div
                  style={{ backgroundColor: `${mvpKid.color || '#3b82f6'}40`, borderColor: '#fbbf24' }}
                  className="w-16 h-16 rounded-2xl border-2 border-amber-300 ring-4 ring-amber-400/40 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30"
                >
                  {mvpKid.avatar}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[11px] uppercase tracking-widest shadow-xs">
                    👑 Household MVP
                  </span>
                  <span className="text-xs font-black text-amber-300">
                    {mvpLevel?.icon} {mvpLevel?.title}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                  {mvpKid.name} is Leading with{' '}
                  <span className="text-amber-300 font-extrabold">{mvpKid.stars} Points</span>!
                </h2>
                <p className="text-xs font-bold text-white/80">
                  🔥 {mvpKid.streakDays} Day Streak • Exemplary Dedication & Chore Mastery!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 z-10 w-full md:w-auto justify-center">
              <div className={`hidden lg:flex items-center gap-2 ${theme.kioskClockBg} px-3.5 py-2 rounded-2xl`}>
                <div className="text-center px-2">
                  <div className="text-xs font-black text-amber-400">⭐ {mvpKid.stars}</div>
                  <div className="text-[10px] text-white/70 font-bold">Stars Earned</div>
                </div>
                <div className="w-px h-6 bg-white/20" />
                <div className="text-center px-2">
                  <div className="text-xs font-black text-amber-400">🔥 {mvpKid.streakDays}d</div>
                  <div className="text-[10px] text-white/70 font-bold">Streak</div>
                </div>
              </div>

              <button
                id="btn-cheer-mvp"
                onClick={handleCheerMvp}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>🎉 Cheer MVP!</span>
              </button>
            </div>
          </div>
        )}

        {/* Kids Mission Cards Grid */}
        <div
          className={`flex-1 grid gap-4 sm:gap-6 ${
            database.kids.length === 1
              ? 'grid-cols-1 max-w-3xl mx-auto w-full'
              : database.kids.length === 2
                ? 'grid-cols-1 md:grid-cols-2 w-full'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full'
          }`}
        >
          {kidStats.map(({ kid, kidChores, completedCount, totalChores, percent, isAllDone, isMvp, level }) => (
            <div
              key={kid.id}
              id={`kiosk-kid-card-${kid.id}`}
              className={`rounded-3xl border-2 p-4 sm:p-6 flex flex-col justify-between transition-all relative overflow-hidden min-h-[420px] ${
                isMvp
                  ? `${theme.kioskCardMvpBg} ${theme.kioskCardMvpBorder}`
                  : isAllDone
                    ? `${theme.kioskCardBg} border-emerald-500 shadow-xl shadow-emerald-500/10`
                    : `${theme.kioskCardBg} ${theme.kioskCardBorder}`
              }`}
            >
              {/* MVP Top Ribbon */}
              {isMvp && (
                <div className="flex items-center justify-between bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 px-4 py-1.5 -mt-2 -mx-2 mb-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg">
                  <span className="flex items-center gap-1.5 font-black">
                    <span className="text-base animate-pulse">👑</span>
                    <span className="font-extrabold text-sm tracking-widest">MVP LEADER</span>
                    <span className="text-[10px] font-black opacity-80 hidden sm:inline">• MOST POINTS</span>
                  </span>
                  <span className="text-xs font-black bg-amber-950/20 px-2.5 py-0.5 rounded-full">
                    ⭐ {kid.stars} Pts
                  </span>
                </div>
              )}

              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/15">
                  <div
                    onClick={() => {
                      sound.playTap();
                      setSelectedKidForPin(kid);
                    }}
                    className="flex items-center gap-3 cursor-pointer group/header p-1 -m-1 rounded-2xl hover:bg-white/10 transition-colors"
                    title={`Tap to unlock ${kid.name}'s Profile Dashboard (PIN required)`}
                  >
                    <div className="relative">
                      {isMvp && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 text-2xl filter drop-shadow-[0_3px_6px_rgba(245,158,11,0.9)] animate-bounce select-none pointer-events-none">
                          👑
                        </div>
                      )}
                      <div
                        style={{
                          backgroundColor: isMvp ? `${kid.color || '#3b82f6'}40` : `${kid.color || '#3b82f6'}25`,
                          borderColor: isMvp ? '#fbbf24' : (kid.color || '#3b82f6'),
                        }}
                        className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-3xl shrink-0 shadow-inner group-hover/header:scale-105 transition-transform ${
                          isMvp ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900' : ''
                        }`}
                      >
                        {kid.avatar}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-xl font-black text-white flex items-center gap-2 flex-wrap group-hover/header:text-amber-200 transition-colors">
                        <span>{kid.name}</span>
                        <Lock className="w-3.5 h-3.5 text-white/50 group-hover/header:text-amber-300" />
                        {isMvp && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs shadow-md tracking-wider uppercase border border-amber-300">
                            👑 MVP
                          </span>
                        )}
                        {isAllDone && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-extrabold animate-bounce">
                            All Done! 🎉
                          </span>
                        )}
                      </h2>
                      <div className="flex items-center gap-2 text-xs font-bold text-white/80 mt-0.5">
                        <span>{level.icon} {level.title}</span>
                        <span className="text-[10px] text-amber-300 font-extrabold underline opacity-0 group-hover/header:opacity-100 transition-opacity">
                          Enter PIN
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black ${
                        isMvp
                          ? 'bg-amber-400 text-slate-950 shadow-md ring-1 ring-amber-300'
                          : `${theme.kioskFooterPillSecondaryBg} ${theme.kioskFooterPillSecondaryText}`
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${isMvp ? 'fill-slate-950 text-slate-950' : 'fill-amber-400 text-amber-400'}`} />
                      <span>{kid.stars} Pts</span>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-[11px] font-black text-amber-400 mt-1">
                      <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{kid.streakDays} Day Streak</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="my-3">
                  <div className="flex items-center justify-between text-xs font-black text-white/80 mb-1.5">
                    <span>Today's Missions</span>
                    <span className={isAllDone ? 'text-emerald-400 font-extrabold' : 'text-white'}>
                      {completedCount} / {totalChores} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-3.5 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isAllDone ? 'bg-gradient-to-r from-emerald-400 to-teal-300' : theme.kidCardProgress
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Chores List */}
                <div className="space-y-2 mt-3 max-h-72 overflow-y-auto pr-1">
                  {kidChores.length === 0 ? (
                    <div className="text-center py-8 text-white/60 text-xs font-bold">
                      No missions scheduled for today! 🏖️
                    </div>
                  ) : (
                    kidChores.map((chore) => {
                      const log = (database.logs || []).find(
                        (l) => l.choreId === chore.id && l.kidId === kid.id && l.date === todayStr
                      );
                      const isDone = log?.status === 'completed';

                      return (
                        <div
                          key={chore.id}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            isDone ? theme.kioskCardItemDone : theme.kioskCardItemBg
                          }`}
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <span className="text-2xl shrink-0">{chore.icon || '⭐'}</span>
                            <div className="min-w-0">
                              <div className={`text-xs sm:text-sm font-black truncate ${isDone ? 'line-through opacity-70 text-white' : 'text-white'}`}>
                                {chore.title}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-white/70">
                                <span className="text-amber-300 font-extrabold">
                                  +{chore.stars + (chore.bountyBonusStars || 0)} pts
                                </span>
                                {chore.timerMinutes && (
                                  <span className="text-sky-300 flex items-center gap-0.5">
                                    <Timer className="w-3 h-3" />
                                    <span>{chore.timerMinutes}m timer</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {!isDone && (
                              <button
                                onClick={() => {
                                  sound.playTap();
                                  setActiveTimerChore(chore);
                                }}
                                className={`p-2 rounded-xl ${theme.kioskClockBg} text-white hover:opacity-90 transition-all cursor-pointer`}
                                title="Start Focus Timer"
                              >
                                <Timer className="w-4 h-4" />
                              </button>
                            )}

                            {isDone ? (
                              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                                <Check className="w-4 h-4 stroke-[3]" />
                              </div>
                            ) : (
                              <button
                                onClick={() => handleQuickCompleteChore(chore, kid)}
                                className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center shadow-md transition-all cursor-pointer"
                                title="Mark Completed"
                              >
                                <Check className="w-4 h-4 stroke-[3]" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Household Summary Card if 1 or 2 kids */}
          {database.kids.length <= 2 && (
            <div className={`rounded-3xl border-2 ${theme.kioskSummaryCardBorder} ${theme.kioskSummaryCardBg} p-5 flex flex-col justify-between min-h-[420px]`}>
              <div>
                <div className="flex items-center gap-3 pb-3 border-b border-white/15">
                  <div className={`w-12 h-12 rounded-2xl ${theme.kioskHeaderLogoBg} ${theme.kioskHeaderLogoText} flex items-center justify-center text-2xl`}>
                    🏰
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Daily Household Quest Hub</h3>
                    <p className="text-xs text-white/80 font-bold">Family Teamwork & Milestones</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className={`p-3 rounded-2xl ${theme.kioskCardItemBg} text-center`}>
                    <div className="text-xl font-black text-emerald-400">
                      {totalFamilyCompletedToday} / {totalFamilyChoresToday}
                    </div>
                    <div className="text-[10px] font-bold text-white/70 uppercase mt-0.5">
                      Chores Done Today
                    </div>
                  </div>
                  <div className={`p-3 rounded-2xl ${theme.kioskCardItemBg} text-center`}>
                    <div className="text-xl font-black text-amber-300">
                      ⭐ {database.kids.reduce((a, k) => a + k.stars, 0)}
                    </div>
                    <div className="text-[10px] font-bold text-white/70 uppercase mt-0.5">
                      Total Family Stars
                    </div>
                  </div>
                </div>

                {/* Schedule Quick Peek */}
                <div className="mt-2">
                  <div className="text-xs font-black text-white mb-2 flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-amber-300" />
                    <span>Today's Family Schedule</span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {todayEvents.length === 0 ? (
                      <div className="text-xs text-white/60 italic py-2">
                        No special practices or events scheduled for today.
                      </div>
                    ) : (
                      todayEvents.map((e) => (
                        <div
                          key={e.id}
                          className={`p-2 rounded-xl ${theme.kioskCardItemBg} flex items-center justify-between text-xs`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{e.icon || '📌'}</span>
                            <span className="font-bold text-white truncate">{e.title}</span>
                          </div>
                          {e.time && (
                            <span className={`text-[10px] font-mono ${theme.kioskClockText} px-2 py-0.5 rounded-md bg-black/40`}>
                              {e.time}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/15 text-[11px] text-amber-200 font-bold italic text-center">
                "Every completed mission brings the whole family closer to the Friday Reward! 🚀"
              </div>
            </div>
          )}
        </div>
      </div>

      {/* THEMED BORDER SLATES: Dinner, Schedule & Bonus Bounties */}
      <footer className={`grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 ${theme.kioskFooterBorder} text-xs`}>
        {/* Dinner Slate */}
        <div
          onClick={() => {
            sound.playTap();
            if (onOpenMenu) onOpenMenu();
            else setIsMenuModalOpen(true);
          }}
          className={`p-3 rounded-2xl ${theme.kioskFooterSlateBg} ${theme.kioskFooterSlateBorder} flex items-center gap-3 cursor-pointer transition-all active:scale-98 shadow-md`}
        >
          <div className={`p-2 rounded-xl ${theme.kioskFooterPillSecondaryBg} ${theme.kioskFooterPillSecondaryText} font-bold shrink-0 flex items-center gap-1.5`}>
            <span className="text-base">{todayMenuPlan.icon || '🍽️'}</span>
            <span>Tonight's Dinner</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-white truncate text-xs">{todayMenuPlan.mainDish}</div>
            <div className="text-[10px] text-amber-300 font-semibold truncate">
              {todayMenuPlan.votingEnabled ? '🗳️ Kids Vote Open — Tap to Vote!' : `👨‍🍳 ${todayMenuPlan.preparedBy || 'Family'}`}
            </div>
          </div>
        </div>

        {/* Schedule Slate */}
        <div
          onClick={() => {
            if (onOpenCalendar) {
              sound.playTap();
              onOpenCalendar();
            }
          }}
          className={`p-3 rounded-2xl ${theme.kioskFooterSlateBg} ${theme.kioskFooterSlateBorder} flex items-center gap-3 ${onOpenCalendar ? 'cursor-pointer' : ''} shadow-md`}
        >
          <div className={`p-2 rounded-xl ${theme.kioskFooterPillBg} ${theme.kioskFooterPillText} font-bold shrink-0`}>
            📅 Today's Schedule
          </div>
          <div className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-2">
            {todayEvents.length === 0 ? (
              <span className="text-white/60 italic">No practices or appointments today.</span>
            ) : (
              todayEvents.map((evt) => (
                <span
                  key={evt.id}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl ${theme.kioskCardItemBg} text-white font-bold`}
                >
                  <span>{evt.icon || '📌'}</span>
                  <span className="truncate max-w-[120px]">{evt.title}</span>
                  {evt.time && <span className={`font-mono ${theme.kioskClockText}`}>({evt.time})</span>}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Bonus Bounties Slate */}
        <div className={`p-3 rounded-2xl ${theme.kioskFooterSlateBg} ${theme.kioskFooterSlateBorder} flex items-center gap-3 shadow-md`}>
          <div className={`p-2 rounded-xl ${theme.kioskFooterPillSecondaryBg} ${theme.kioskFooterPillSecondaryText} font-bold shrink-0 flex items-center gap-1`}>
            <Target className="w-3.5 h-3.5" />
            <span>Bonus Bounties</span>
          </div>
          <div className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-2">
            {bountyChores.length === 0 ? (
              <span className="text-white/60 italic">No extra bounties active.</span>
            ) : (
              bountyChores.map((bounty) => (
                <span
                  key={bounty.id}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl ${theme.kioskCardItemBg} text-white font-bold`}
                >
                  <span>{bounty.icon || '⭐'}</span>
                  <span className="truncate max-w-[120px]">{bounty.title}</span>
                  <span className="text-amber-300 font-black">+{bounty.stars + (bounty.bountyBonusStars || 0)} Pts</span>
                </span>
              ))
            )}
          </div>
        </div>
      </footer>

      {/* Focus Timer Modal in Kiosk */}
      {activeTimerChore && (
        <ChoreTimerModal
          chore={activeTimerChore}
          isOpen={!!activeTimerChore}
          onClose={() => setActiveTimerChore(null)}
          onCompleteChore={(chore) => {
            const targetKid = database.kids.find((k) => isChoreAssignedToKid(chore, k.id)) || database.kids[0];
            if (targetKid) handleQuickCompleteChore(chore, targetKid);
          }}
        />
      )}

      {/* Family Goal Manager Modal */}
      {isGoalModalOpen && (
        <FamilyGoalModal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          database={database}
          onUpdateDatabase={onUpdateDatabase}
          isParentMode={false}
        />
      )}

      {/* Weekly Dinner Menu Modal */}
      {isMenuModalOpen && (
        <WeeklyMenuModal
          isOpen={isMenuModalOpen}
          onClose={() => setIsMenuModalOpen(false)}
          database={database}
          onUpdateDatabase={onUpdateDatabase}
          isParentMode={false}
        />
      )}

      {/* Parent PIN Guard for exiting Kiosk mode */}
      <ParentPinModal
        isOpen={isExitPinOpen}
        correctPin={database.settings.parentPin || '1234'}
        isDefaultPin={!database.settings.parentPin || database.settings.parentPin === '1234'}
        onSuccess={() => {
          setIsExitPinOpen(false);
          onExitKiosk();
        }}
        onClose={() => setIsExitPinOpen(false)}
      />

      {/* Child PIN Entry for Kiosk Mode */}
      <KidPinModal
        isOpen={!!selectedKidForPin}
        kid={selectedKidForPin}
        onClose={() => setSelectedKidForPin(null)}
        onSuccess={() => {
          if (selectedKidForPin && onSelectKid) {
            const chosen = selectedKidForPin;
            setSelectedKidForPin(null);
            onSelectKid(chosen);
          } else {
            setSelectedKidForPin(null);
          }
        }}
      />
    </div>
  );
};
