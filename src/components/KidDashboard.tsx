import React, { useState, useMemo } from 'react';
import { Sparkles, Flame, Star, Gift, CheckCircle2, ChevronRight, Filter, Calendar, Award, Trophy, MapPin, Clock, RotateCw, Target, Timer } from 'lucide-react';
import confetti from 'canvas-confetti';
import { KidProfile, ChoreItem, ChoreCategory, ChoreLog, AppSettings, RewardItem, CalendarEvent, FamilyDatabase } from '../types';
import { ChoreCard } from './ChoreCard';
import { SkipReasonModal } from './SkipReasonModal';
import { ChoreTimerModal } from './ChoreTimerModal';
import { ChoreWheelModal } from './ChoreWheelModal';
import { FamilyGoalBanner } from './FamilyGoalBanner';
import { getTodayDateString, formatDateDisplay, isChoreScheduledForDate, isChoreAssignedToKid, getKidLevelInfo, getBountyChores } from '../utils/storage';
import { getSeasonalWeatherForDate, EVENT_CATEGORIES, WEATHER_CONDITIONS } from '../utils/calendar';
import { sound } from '../utils/sound';

interface KidDashboardProps {
  kid: KidProfile;
  categories: ChoreCategory[];
  chores: ChoreItem[];
  logs: ChoreLog[];
  rewards: RewardItem[];
  settings: AppSettings;
  events?: CalendarEvent[];
  database?: FamilyDatabase;
  onToggleCompleteChore: (chore: ChoreItem) => void;
  onSkipChoreWithReason: (choreId: string, category: 'sick' | 'supplies' | 'time' | 'already_done' | 'need_help' | 'other', note: string) => void;
  onUndoChoreStatus: (choreId: string) => void;
  onOpenRewardStore: () => void;
  onOpenCalendar?: () => void;
}

export const KidDashboard: React.FC<KidDashboardProps> = ({
  kid,
  categories,
  chores,
  logs,
  rewards,
  settings,
  events = [],
  database,
  onToggleCompleteChore,
  onSkipChoreWithReason,
  onUndoChoreStatus,
  onOpenRewardStore,
  onOpenCalendar,
}) => {
  const todayStr = getTodayDateString();
  const todayWeather = getSeasonalWeatherForDate(todayStr);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<string>('all');
  const [skipModalChore, setSkipModalChore] = useState<ChoreItem | null>(null);
  const [activeTimerChore, setActiveTimerChore] = useState<ChoreItem | null>(null);
  const [isWheelOpen, setIsWheelOpen] = useState<boolean>(false);

  // Filter events relevant to this kid for today
  const kidTodayEvents = useMemo(() => {
    return events.filter((e) => {
      if (e.date !== todayStr) return false;
      return e.assignedKidIds?.includes('all') || e.assignedKidIds?.includes(kid.id);
    });
  }, [events, todayStr, kid.id]);

  // Filter chores relevant to this kid for today
  const todaysChores = useMemo(() => {
    return chores
      .filter((c) => c.isActive)
      .filter((c) => isChoreAssignedToKid(c, kid.id))
      .filter((c) => isChoreScheduledForDate(c, todayStr))
      .sort((a, b) => a.order - b.order);
  }, [chores, kid.id, todayStr]);

  // Bonus bounty chores available
  const bountyChores = useMemo(() => {
    return chores
      .filter((c) => c.isActive && c.isBounty)
      .filter((c) => isChoreAssignedToKid(c, kid.id) || !c.assignedKidId);
  }, [chores, kid.id]);

  // Find chore logs for today
  const todaysLogs = useMemo(() => {
    return logs.filter((l) => l.kidId === kid.id && l.date === todayStr);
  }, [logs, kid.id, todayStr]);

  // Map choreId -> log
  const logMap = useMemo(() => {
    const map = new Map<string, ChoreLog>();
    todaysLogs.forEach((l) => map.set(l.choreId, l));
    return map;
  }, [todaysLogs]);

  // Progress metrics
  const totalTasksCount = todaysChores.length;
  const completedTasksCount = todaysChores.filter((c) => logMap.get(c.id)?.status === 'completed').length;
  const skippedTasksCount = todaysChores.filter((c) => logMap.get(c.id)?.status === 'skipped').length;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
  const isAllComplete = totalTasksCount > 0 && completedTasksCount === totalTasksCount;

  // Filtered view
  const visibleChores = useMemo(() => {
    return todaysChores.filter((c) => {
      if (selectedCategory !== 'all' && c.categoryId !== selectedCategory) return false;
      if (selectedTimeOfDay !== 'all' && c.timeOfDay !== selectedTimeOfDay) return false;
      return true;
    });
  }, [todaysChores, selectedCategory, selectedTimeOfDay]);

  const levelInfo = getKidLevelInfo(kid.lifetimeStars);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 animate-fade-in">
      {/* Left / Main Column (col-span-8) */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Family Goal Banner if database is provided */}
        {database && (
          <FamilyGoalBanner database={database} />
        )}

        {/* Kid Greeting & Live Progress Header */}
        <div
          style={{
            borderColor: kid.color || '#3b82f6',
          }}
          className="bg-white rounded-3xl p-6 sm:p-7 border-b-8 border-r-4 border-t-2 border-l-2 border-t-slate-100 border-l-slate-100 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div
              style={{ backgroundColor: `${kid.color}20` }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl shrink-0 shadow-inner"
            >
              {kid.avatar || '⭐'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  {formatDateDisplay(todayStr)}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  <span>{WEATHER_CONDITIONS[todayWeather.condition]?.icon || '☀️'}</span>
                  <span>{todayWeather.tempHigh}°{settings.tempUnit || 'F'}</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Hey, {kid.name}! 👋
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
                {isAllComplete
                  ? "You're a superstar! All missions done today! 🚀"
                  : `You have ${todaysChores.length - completedTasksCount} mission${todaysChores.length - completedTasksCount === 1 ? '' : 's'} waiting for you today.`}
              </p>
            </div>
          </div>

          {/* Mini Action Badges: Chore Roulette Button & Progress Count */}
          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              onClick={() => {
                sound.playTap();
                setIsWheelOpen(true);
              }}
              className="px-3.5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-pink-500 hover:from-amber-500 hover:to-pink-600 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              title="Spin the Chore Wheel for a surprise mission!"
            >
              <RotateCw className="w-4 h-4" />
              <span>Chore Roulette 🎡</span>
            </button>

            <div className="text-right pl-2">
              <div className="text-2xl sm:text-3xl font-black text-indigo-950">
                {completedTasksCount}/{totalTasksCount}
              </div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                Completed
              </div>
            </div>
          </div>
        </div>

        {/* Events Ticker (if kid has activities today) */}
        {kidTodayEvents.length > 0 && (
          <div className="p-4 rounded-3xl bg-indigo-50 border-2 border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shrink-0 shadow-xs">
                {kidTodayEvents[0]?.icon || '📌'}
              </div>
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-indigo-600">
                  Today's Event Reminder
                </div>
                <h4 className="text-sm font-black text-indigo-950">
                  {kidTodayEvents[0]?.title}
                </h4>
                <div className="flex items-center gap-3 text-xs text-indigo-800 font-semibold mt-0.5">
                  {kidTodayEvents[0]?.time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      {kidTodayEvents[0]?.time}
                    </span>
                  )}
                  {kidTodayEvents[0]?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      {kidTodayEvents[0]?.location}
                    </span>
                  )}
                  {kidTodayEvents.length > 1 && (
                    <span className="text-indigo-700 font-black">
                      +{kidTodayEvents.length - 1} more event
                    </span>
                  )}
                </div>
              </div>
            </div>

            {onOpenCalendar && (
              <button
                onClick={() => {
                  sound.playTap();
                  onOpenCalendar();
                }}
                className="px-3.5 py-2 rounded-xl bg-yellow-100 hover:bg-yellow-200 text-indigo-950 font-black text-xs border border-yellow-300 transition-colors shrink-0 cursor-pointer self-end sm:self-center shadow-2xs active:scale-95"
              >
                Family Calendar 📅
              </button>
            )}
          </div>
        )}

        {/* All Complete Celebration Banner */}
        {isAllComplete && totalTasksCount > 0 && (
          <div className="p-4 sm:p-5 rounded-3xl bg-emerald-500 text-white border-b-8 border-emerald-700 shadow-lg flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3.5">
              <span className="text-3xl">🎉</span>
              <div>
                <h3 className="font-black text-base sm:text-lg">Mission Accomplished!</h3>
                <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                  You finished all of your chores today and earned all your star points!
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playTap();
                onOpenRewardStore();
              }}
              className="px-4 py-2 rounded-xl bg-white text-emerald-800 font-black text-xs sm:text-sm hover:bg-emerald-50 active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer hidden sm:block"
            >
              Store 🎁
            </button>
          </div>
        )}

        {/* Filters: Categories and Time of Day */}
        <div className="flex flex-col gap-3">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              id="filter-cat-all"
              onClick={() => {
                sound.playTap();
                setSelectedCategory('all');
              }}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-2 border-slate-200'
              }`}
            >
              All Categories ({todaysChores.length})
            </button>
            {categories.map((cat) => {
              const count = todaysChores.filter((c) => c.categoryId === cat.id).length;
              if (count === 0) return null;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  id={`filter-cat-${cat.id}`}
                  onClick={() => {
                    sound.playTap();
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border-2 border-slate-200'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md font-black ${
                      isSelected ? 'bg-indigo-800 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Time of Day Pills */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider pl-1 hidden sm:inline">
              Time:
            </span>
            {[
              { id: 'all', label: 'All Times' },
              { id: 'morning', label: '🌅 Morning' },
              { id: 'afternoon', label: '☀️ Afternoon' },
              { id: 'evening', label: '🌙 Bedtime' },
            ].map((t) => (
              <button
                key={t.id}
                id={`filter-time-${t.id}`}
                onClick={() => {
                  sound.playTap();
                  setSelectedTimeOfDay(t.id);
                }}
                className={`px-3.5 py-1.5 rounded-xl font-black transition-colors cursor-pointer ${
                  selectedTimeOfDay === t.id
                    ? 'bg-yellow-200 text-slate-900 border-2 border-yellow-400'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border-2 border-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chores Cards Grid */}
        <div className="grid grid-cols-1 gap-4">
          {visibleChores.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-b-8 border-r-4 border-slate-200 border-t-2 border-l-2 border-t-slate-100 border-l-slate-100 shadow-sm">
              <div className="text-5xl mb-3">🌴</div>
              <h3 className="font-black text-slate-800 text-xl">No missions found here!</h3>
              <p className="text-sm text-slate-500 font-medium mt-1 max-w-sm mx-auto">
                There are no tasks scheduled for this category right now. Check other categories or enjoy your break!
              </p>
            </div>
          ) : (
            visibleChores.map((chore) => {
              const category = categories.find((c) => c.id === chore.categoryId);
              const log = logMap.get(chore.id);

              return (
                <ChoreCard
                  key={chore.id}
                  chore={chore}
                  category={category}
                  log={log}
                  onToggleComplete={onToggleCompleteChore}
                  onOpenSkipModal={(c) => setSkipModalChore(c)}
                  onUndo={onUndoChoreStatus}
                  onStartTimer={(c) => setActiveTimerChore(c)}
                />
              );
            })
          )}
        </div>

        {/* Bonus Bounty Board (Extra Credit Missions) */}
        {bountyChores.length > 0 && (
          <div className="mt-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🎯</span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-amber-950">
                    Bonus Bounty Board
                  </h3>
                  <p className="text-xs font-medium text-amber-800">
                    Extra credit missions! Complete these for bonus star points anytime.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-200 text-amber-900 font-black text-xs">
                {bountyChores.length} Available
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {bountyChores.map((bounty) => {
                const category = categories.find((c) => c.id === bounty.categoryId);
                const log = logMap.get(bounty.id);

                return (
                  <ChoreCard
                    key={bounty.id}
                    chore={bounty}
                    category={category}
                    log={log}
                    onToggleComplete={onToggleCompleteChore}
                    onOpenSkipModal={(c) => setSkipModalChore(c)}
                    onUndo={onUndoChoreStatus}
                    onStartTimer={(c) => setActiveTimerChore(c)}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Hero Aside Level Card & Pi Privacy Shield (col-span-4) */}
      <aside className="lg:col-span-4 flex flex-col gap-6">
        {/* Indigo Level & Rank Hero Card */}
        <div className="bg-indigo-900 rounded-[2.5rem] p-6 sm:p-8 text-white relative overflow-hidden flex-1 shadow-2xl flex flex-col justify-between">
          <div className="relative z-10">
            {/* Top avatar & level */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black italic tracking-tight">
                  Level {levelInfo.level}
                </h2>
                <p className="text-indigo-300 font-extrabold uppercase tracking-wider text-xs sm:text-sm mt-0.5">
                  {levelInfo.title}
                </p>
              </div>
              <div
                className="w-14 h-14 rounded-2xl bg-indigo-800/80 border-2 border-indigo-400/40 flex items-center justify-center text-3xl shadow-lg"
              >
                {kid.avatar || '⭐'}
              </div>
            </div>

            {/* Streak & Current Stars Overview */}
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              <div className="bg-indigo-950/60 p-3 rounded-2xl border border-indigo-800 flex items-center gap-2.5">
                <span className="text-2xl">⭐</span>
                <div>
                  <div className="text-[10px] uppercase font-bold text-indigo-300">Star Bank</div>
                  <div className="text-lg font-black text-yellow-400 leading-tight">{kid.stars}</div>
                </div>
              </div>
              <div className="bg-indigo-950/60 p-3 rounded-2xl border border-indigo-800 flex items-center gap-2.5">
                <Flame className="w-6 h-6 text-orange-400 fill-orange-400" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-indigo-300">Streak</div>
                  <div className="text-lg font-black text-orange-400 leading-tight">{kid.streakDays} Days</div>
                </div>
              </div>
            </div>

            {/* Next Reward Progress Bar */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs sm:text-sm font-black mb-2">
                  <span className="uppercase tracking-wider text-indigo-200">
                    {levelInfo.isMaxLevel ? 'MAX LEVEL REACHED' : 'Next Rank Progress'}
                  </span>
                  <span className="text-yellow-400">{levelInfo.progressPercent}%</span>
                </div>
                <div className="w-full bg-indigo-950 h-5 rounded-full overflow-hidden border-2 border-indigo-700 p-1">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${levelInfo.progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-indigo-300 mt-2 text-center font-medium">
                  {levelInfo.isMaxLevel ? 'Chore Legend Status Unlocked!' : `Only ${levelInfo.starsNeededForNextLevel} points to Level ${levelInfo.level + 1}!`}
                </p>
              </div>

              {/* Unlocked Badges Box */}
              <div className="bg-indigo-800/50 p-4 rounded-2xl border border-indigo-700">
                <h4 className="font-black text-yellow-400 mb-2.5 text-xs sm:text-sm uppercase tracking-wider">
                  Unlocked Badges
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  <div className="w-11 h-11 bg-yellow-500 rounded-xl flex items-center justify-center text-2xl shadow-md transform hover:scale-110 transition-transform" title="Helper Gold Star">
                    🥇
                  </div>
                  <div className="w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center text-2xl shadow-md transform hover:scale-110 transition-transform" title="Lightning Helper">
                    ⚡
                  </div>
                  <div className="w-11 h-11 bg-rose-500 rounded-xl flex items-center justify-center text-2xl shadow-md transform hover:scale-110 transition-transform" title="Tidy Cadet">
                    🧹
                  </div>
                  <div className="w-11 h-11 bg-blue-500 rounded-xl flex items-center justify-center text-2xl shadow-md transform hover:scale-110 transition-transform" title="Streak Champion">
                    🔥
                  </div>
                  <div className="w-11 h-11 bg-indigo-700 border-2 border-dashed border-indigo-500 rounded-xl flex items-center justify-center text-indigo-300 text-xs font-bold" title="Next Mystery Badge">
                    🔒
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Reward Store Button */}
            <button
              id="btn-open-rewards-aside"
              onClick={() => {
                sound.playTap();
                onOpenRewardStore();
              }}
              className="mt-6 w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 active:scale-95 text-slate-900 font-black text-sm sm:text-base shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Gift className="w-5 h-5 text-slate-900" />
              <span>Open Reward Store 🎁</span>
            </button>
          </div>

          {/* Decorative glow in card corner */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Local Host Privacy Banner */}
        <div className="bg-emerald-500 rounded-3xl p-5 sm:p-6 text-white flex items-center gap-4 shadow-lg border-b-8 border-emerald-700">
          <div className="text-4xl shrink-0">🛡️</div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider opacity-90">Privacy Mode Active</p>
            <p className="font-extrabold text-sm sm:text-base leading-tight">Local Raspberry Pi 5 Connection</p>
            <p className="text-[11px] opacity-80 mt-0.5">Safe, encrypted offline family network</p>
          </div>
        </div>
      </aside>

      {/* Focus Timer Modal */}
      {activeTimerChore && (
        <ChoreTimerModal
          chore={activeTimerChore}
          isOpen={!!activeTimerChore}
          onClose={() => setActiveTimerChore(null)}
          onCompleteChore={(chore) => {
            onToggleCompleteChore(chore);
            setActiveTimerChore(null);
          }}
        />
      )}

      {/* Chore Roulette Wheel Modal */}
      <ChoreWheelModal
        isOpen={isWheelOpen}
        chores={todaysChores.length > 0 ? todaysChores : chores}
        activeKid={kid}
        onClose={() => setIsWheelOpen(false)}
        onStartTimer={(chore) => {
          setIsWheelOpen(false);
          setActiveTimerChore(chore);
        }}
        onSelectChore={(chore) => {
          setIsWheelOpen(false);
          if (chore.timerMinutes) {
            setActiveTimerChore(chore);
          }
        }}
      />

      {/* Skip Reason Modal */}
      <SkipReasonModal
        isOpen={!!skipModalChore}
        chore={skipModalChore}
        onConfirmSkip={(choreId, reasonCat, note) => {
          onSkipChoreWithReason(choreId, reasonCat, note);
          setSkipModalChore(null);
        }}
        onClose={() => setSkipModalChore(null)}
      />
    </div>
  );
};
