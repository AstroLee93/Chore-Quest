import React, { useState, useEffect } from 'react';
import { Maximize, Minimize, X, Trophy, Flame, Star, Check, Sparkles, Clock, Calendar as CalendarIcon, Volume2, VolumeX, Shield, Timer, Target } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FamilyDatabase, KidProfile, ChoreItem, ChoreLog, CalendarEvent } from '../types';
import { getTodayDateString, isChoreScheduledForDate, isChoreAssignedToKid, getKidLevelInfo, getFamilyWeeklyGoalProgress } from '../utils/storage';
import { getSeasonalWeatherForDate, WEATHER_CONDITIONS } from '../utils/calendar';
import { sound } from '../utils/sound';
import { FamilyGoalBanner } from './FamilyGoalBanner';
import { ChoreTimerModal } from './ChoreTimerModal';

interface KioskDashboardProps {
  database: FamilyDatabase;
  onUpdateDatabase: (updated: FamilyDatabase) => void;
  onExitKiosk: () => void;
  onOpenCalendar?: () => void;
}

export const KioskDashboard: React.FC<KioskDashboardProps> = ({
  database,
  onUpdateDatabase,
  onExitKiosk,
  onOpenCalendar,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeTimerChore, setActiveTimerChore] = useState<ChoreItem | null>(null);

  const todayStr = getTodayDateString();
  const todayWeather = getSeasonalWeatherForDate(todayStr);

  // Live clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Track fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleToggleFullscreen = () => {
    sound.playTap();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleQuickCompleteChore = (chore: ChoreItem, kid: KidProfile) => {
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

    // Update kid stars & check daily streak
    const updatedKids = database.kids.map((k) => {
      if (k.id === kid.id) {
        return {
          ...k,
          stars: k.stars + starsEarned,
          lifetimeStars: k.lifetimeStars + starsEarned,
          lastActiveDate: todayStr,
        };
      }
      return k;
    });

    onUpdateDatabase({
      ...database,
      kids: updatedKids,
      logs: updatedLogs,
    });
  };

  // Today's events
  const todayEvents = (database.events || []).filter((e) => e.date === todayStr);

  // Bonus bounty chores
  const bountyChores = (database.chores || []).filter((c) => c.isActive && c.isBounty);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col p-4 sm:p-6 select-none overflow-x-hidden font-sans">
      {/* Kiosk Top Bar: Clock, Weather, Family Name, Controls */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-900 border-2 border-indigo-700 flex items-center justify-center text-2xl shadow-inner">
            🏰
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-600/60 text-yellow-300 text-[10px] font-black uppercase tracking-wider">
                Ambient Kiosk Display
              </span>
              <span className="text-xs text-slate-400 font-bold">
                {database.settings.familyName} Command Center
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ChoreQuest Live Dashboard
            </h1>
          </div>
        </div>

        {/* Center Clock & Date */}
        <div className="flex items-center gap-4 sm:gap-6 bg-slate-900/90 border border-slate-800 px-5 py-2.5 rounded-2xl shadow-md">
          <div className="text-left">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-yellow-400 font-mono">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[11px] font-bold text-slate-400">
              {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800" />

          {/* Live Weather */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {WEATHER_CONDITIONS[todayWeather.condition]?.icon || '☀️'}
            </span>
            <div>
              <div className="text-sm font-black text-white">
                {todayWeather.tempHigh}°{database.settings.tempUnit || 'F'}
              </div>
              <div className="text-[10px] font-semibold text-slate-400 capitalize">
                {todayWeather.condition.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end md:self-center">
          {onOpenCalendar && (
            <button
              onClick={() => {
                sound.playTap();
                onOpenCalendar();
              }}
              className="p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-yellow-300 border border-slate-700 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <CalendarIcon className="w-4 h-4 text-yellow-400" />
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
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Kiosk'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onExitKiosk();
            }}
            className="p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <X className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">Exit Kiosk</span>
          </button>
        </div>
      </header>

      {/* Shared Family Goal Bar */}
      <div className="my-4">
        <FamilyGoalBanner database={database} />
      </div>

      {/* Main Kiosk Content Area: Live Kids Side-by-Side Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 my-2">
        {database.kids.map((kid) => {
          const level = getKidLevelInfo(kid.lifetimeStars);

          // Get today's scheduled chores for this kid
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

          return (
            <div
              key={kid.id}
              className={`rounded-3xl border-2 p-4 sm:p-5 flex flex-col justify-between transition-all bg-slate-900/90 ${
                isAllDone
                  ? 'border-emerald-500 shadow-lg shadow-emerald-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Kid Header */}
              <div>
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div
                      style={{ backgroundColor: `${kid.color}25`, borderColor: kid.color }}
                      className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-3xl shrink-0 shadow-inner"
                    >
                      {kid.avatar}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <span>{kid.name}</span>
                        {isAllDone && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500 text-white font-extrabold animate-bounce">
                            All Done! 🎉
                          </span>
                        )}
                      </h2>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-0.5">
                        <span>{level.icon} {level.title}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stars & Streak */}
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-pink-950/80 border border-pink-700/60 text-pink-300 text-xs font-black">
                      <Star className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
                      <span>{kid.stars} Pts</span>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-[11px] font-black text-amber-400 mt-1">
                      <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{kid.streakDays} Day Streak</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="my-3">
                  <div className="flex items-center justify-between text-xs font-black text-slate-400 mb-1">
                    <span>Today's Progress</span>
                    <span className={isAllDone ? 'text-emerald-400' : 'text-slate-300'}>
                      {completedCount} / {totalChores} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isAllDone
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-300'
                          : 'bg-gradient-to-r from-amber-400 to-pink-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Chores Quick-Check list */}
                <div className="space-y-2 mt-3 max-h-64 overflow-y-auto pr-1">
                  {kidChores.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs font-bold">
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
                          className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            isDone
                              ? 'bg-emerald-950/40 border-emerald-800/60 text-slate-400'
                              : 'bg-slate-800/80 border-slate-700 text-white hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <span className="text-xl shrink-0">{chore.icon || '⭐'}</span>
                            <div className="min-w-0">
                              <div
                                className={`text-xs font-black truncate ${
                                  isDone ? 'line-through text-slate-400' : 'text-white'
                                }`}
                              >
                                {chore.title}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                <span>+{chore.stars + (chore.bountyBonusStars || 0)} pts</span>
                                {chore.timerMinutes && (
                                  <span className="text-indigo-400 flex items-center gap-0.5">
                                    <Timer className="w-2.5 h-2.5" />
                                    <span>{chore.timerMinutes}m</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Focus Timer Button */}
                            {!isDone && (
                              <button
                                onClick={() => {
                                  sound.playTap();
                                  setActiveTimerChore(chore);
                                }}
                                className="p-2 rounded-xl bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 border border-indigo-700 transition-all cursor-pointer"
                                title="Start Focus Timer"
                              >
                                <Timer className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Complete Button */}
                            {isDone ? (
                              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                                <Check className="w-4 h-4 stroke-[3]" />
                              </div>
                            ) : (
                              <button
                                onClick={() => handleQuickCompleteChore(chore, kid)}
                                className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center shadow-md transition-all cursor-pointer"
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
          );
        })}
      </div>

      {/* Bottom Ticker: Today's Schedule & Bonus Bounties */}
      <footer className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
        {/* Today's Schedule */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-900 text-yellow-300 font-bold shrink-0">
            📅 Today's Schedule
          </div>
          <div className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-2">
            {todayEvents.length === 0 ? (
              <span className="text-slate-500 italic">No practices or appointments scheduled for today.</span>
            ) : (
              todayEvents.map((evt) => (
                <span
                  key={evt.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold"
                >
                  <span>{evt.icon || '📌'}</span>
                  <span>{evt.title}</span>
                  {evt.time && <span className="text-yellow-400 font-mono">({evt.time})</span>}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Bonus Bounties */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-900/80 text-amber-300 font-bold shrink-0 flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span>Bonus Bounty Board</span>
          </div>
          <div className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-2">
            {bountyChores.length === 0 ? (
              <span className="text-slate-500 italic">No extra-credit bounties currently active.</span>
            ) : (
              bountyChores.map((bounty) => (
                <span
                  key={bounty.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-200 font-bold"
                >
                  <span>{bounty.icon || '⭐'}</span>
                  <span>{bounty.title}</span>
                  <span className="text-yellow-400 font-black">+{bounty.stars + (bounty.bountyBonusStars || 0)} Pts</span>
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
            // Complete for first kid who has this chore
            const targetKid = database.kids.find((k) => isChoreAssignedToKid(chore, k.id)) || database.kids[0];
            if (targetKid) {
              handleQuickCompleteChore(chore, targetKid);
            }
          }}
        />
      )}
    </div>
  );
};
