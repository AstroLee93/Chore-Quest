import React, { useState, useMemo } from 'react';
import { Sparkles, Flame, Star, Gift, CheckCircle2, ChevronRight, Filter, Calendar, Award, Trophy, MapPin, Clock, RotateCw, Target, Timer, Home, Sun, Brain, BookOpen } from 'lucide-react';
import { KidProfile, ChoreItem, ChoreCategory, ChoreLog, AppSettings, RewardItem, CalendarEvent, FamilyDatabase } from '../types';
import { ChoreCard } from './ChoreCard';
import { SkipReasonModal } from './SkipReasonModal';
import { ChoreTimerModal } from './ChoreTimerModal';
import { ChoreWheelModal } from './ChoreWheelModal';
import { FamilyGoalBanner } from './FamilyGoalBanner';
import { BadgeModal } from './BadgeModal';
import { BountyBoardModal } from './BountyBoardModal';
import { BrainTeaserModal } from './BrainTeaserModal';
import { ReadingLogModal } from './ReadingLogModal';
import { getDailyTeasersAnsweredToday, getSubjectInfo } from '../utils/brainTeasers';
import {
  isReadingCompletedToday,
  findReadingChore,
  getReadingRewardStars,
  getReadingDailyClaimLimit,
  getReadingClaimsCountForDate,
} from '../utils/reading';
import { GoalTracker } from './KidCoin/GoalTracker';
import { getTodayDateString, formatDateDisplay, isChoreScheduledForDate, isChoreAssignedToKid, getKidLevelInfo, getBountyChores } from '../utils/storage';
import { calculateKidBadges } from '../utils/badges';
import { getSeasonalWeatherForDate, EVENT_CATEGORIES, WEATHER_CONDITIONS } from '../utils/calendar';
import { sound } from '../utils/sound';
import { AppThemeId, APP_THEMES } from '../utils/theme';

interface KidDashboardProps {
  kid: KidProfile;
  categories: ChoreCategory[];
  chores: ChoreItem[];
  logs: ChoreLog[];
  rewards: RewardItem[];
  settings: AppSettings;
  events?: CalendarEvent[];
  database?: FamilyDatabase;
  onUpdateDatabase?: (updated: FamilyDatabase) => void;
  currentTheme?: AppThemeId;
  isKioskKidSession?: boolean;
  onReturnToKiosk?: () => void;
  onToggleCompleteChore: (chore: ChoreItem) => void;
  onSkipChoreWithReason: (choreId: string, category: 'sick' | 'supplies' | 'time' | 'already_done' | 'need_help' | 'other', note: string) => void;
  onUndoChoreStatus: (choreId: string) => void;
  onOpenRewardStore: () => void;
  onOpenCalendar?: () => void;
  onOpenGoalManager?: () => void;
  onOpenSnackRequest?: (kid: KidProfile) => void;
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
  onUpdateDatabase,
  currentTheme = 'coastal-horizon',
  isKioskKidSession = false,
  onReturnToKiosk,
  onToggleCompleteChore,
  onSkipChoreWithReason,
  onUndoChoreStatus,
  onOpenRewardStore,
  onOpenCalendar,
  onOpenGoalManager,
  onOpenSnackRequest,
}) => {
  const theme = APP_THEMES[currentTheme] || APP_THEMES['coastal-horizon'];
  const todayStr = getTodayDateString();
  const todayWeather = getSeasonalWeatherForDate(todayStr);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<string>('all');
  const [skipModalChore, setSkipModalChore] = useState<ChoreItem | null>(null);
  const [activeTimerChore, setActiveTimerChore] = useState<ChoreItem | null>(null);
  const [isWheelOpen, setIsWheelOpen] = useState<boolean>(false);
  const [isBountyBoardOpen, setIsBountyBoardOpen] = useState<boolean>(false);
  const [selectedBadgeModalId, setSelectedBadgeModalId] = useState<string | null>(null);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState<boolean>(false);
  const [isBrainTeaserOpen, setIsBrainTeaserOpen] = useState<boolean>(false);
  const [isReadingLogOpen, setIsReadingLogOpen] = useState<boolean>(false);

  // Dynamic badges progress calculation
  const kidBadges = useMemo(() => {
    return calculateKidBadges(kid, logs, chores, todayStr);
  }, [kid, logs, chores, todayStr]);

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
      .filter((c) => c.isActive && !c.isBounty)
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

  // Total stars earned today from completed chores and reading logs
  const starsEarnedToday = useMemo(() => {
    const choreStars = todaysLogs
      .filter((l) => l.status === 'completed')
      .reduce((sum, l) => {
        const chore = chores.find((c) => c.id === l.choreId);
        return sum + (l.starsAwarded !== undefined ? l.starsAwarded : (chore?.stars || 0));
      }, 0);

    const readingStars = (database?.readingLogs || [])
      .filter((rl) => rl.kidId === kid.id && rl.date === todayStr)
      .reduce((sum, rl) => sum + (rl.starsAwarded || 0), 0);

    return choreStars + readingStars;
  }, [todaysLogs, chores, database?.readingLogs, kid.id, todayStr]);

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
    <div className="max-w-7xl mx-auto px-1 sm:px-8 py-1.5 sm:py-8 flex flex-col gap-4 sm:gap-6 animate-fade-in w-full">
      {/* Family Goal Banner if database is provided */}
      {database && (
        <FamilyGoalBanner
          database={database}
          currentTheme={currentTheme}
          onEditGoal={onOpenGoalManager}
        />
      )}

      {/* Kid Greeting & Live Progress Header (Redesigned Profile Card) */}
      <div
        id="kid-profile-card"
        className="bg-white dark:bg-slate-900 rounded-[30px] sm:rounded-[36px] p-4 sm:p-7 border-2 sm:border-[2.5px] border-[#ffd5e2] dark:border-pink-900/50 shadow-md shadow-pink-100/30 dark:shadow-none space-y-4 sm:space-y-6 relative overflow-hidden"
      >
          {/* Top Header Row: Date | Weather | Streak */}
          <div className="flex items-center justify-between gap-2 border-b border-pink-100/70 dark:border-pink-900/30 pb-3 sm:pb-4">
            {/* Left: Date */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 stroke-[2.5]" />
              <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                {formatDateDisplay(todayStr).toUpperCase()}
              </span>
            </div>

            {/* Center: Weather */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-base">☀️</span>
              <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-white">
                {todayWeather.tempHigh}°{settings.tempUnit || 'F'}
              </span>
            </div>

            {/* Right: Streak */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-base">🔥</span>
              <span className="text-xs sm:text-sm font-black text-[#e11d48]">
                {kid.streakDays || 1}-day streak
              </span>
            </div>
          </div>

          {/* Middle Row: Circular Avatar + Greeting & Live Stats */}
          <div className="flex items-center gap-4 sm:gap-6 pt-0.5 sm:pt-1">
            {/* Circular Avatar */}
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#fce7f3] dark:bg-pink-950/40 border-2 border-[#fbcfe8] dark:border-pink-900/50 flex items-center justify-center text-4xl sm:text-5xl shrink-0 shadow-inner overflow-hidden"
            >
              {kid.avatar && (kid.avatar.startsWith('http') || kid.avatar.startsWith('data:image') || kid.avatar.startsWith('/')) ? (
                <img src={kid.avatar} alt={kid.name} className="w-full h-full object-cover" />
              ) : (
                <span className="leading-none select-none">{kid.avatar || '⭐'}</span>
              )}
            </div>

            {/* Greeting & Subtitle */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Hey, {kid.name}! <span className="inline-block">👋</span>
              </h1>
              <div className="flex items-center gap-2 mt-1 sm:mt-1.5 text-sm sm:text-base flex-wrap">
                <span className="font-extrabold text-[#f43f5e] tracking-tight">
                  {isAllComplete
                    ? 'All missions done! 🚀'
                    : `${todaysChores.length - completedTasksCount} mission${todaysChores.length - completedTasksCount === 1 ? '' : 's'}`}
                </span>
                <span className="text-slate-300 dark:text-slate-600 font-bold">•</span>
                <span className="font-extrabold flex items-center gap-1.5">
                  <span className="text-amber-500 font-black">
                    {starsEarnedToday > 0 ? starsEarnedToday : kid.stars}
                  </span>
                  <span>⭐</span>
                  <span className="text-slate-800 dark:text-slate-200 font-extrabold">
                    {starsEarnedToday > 0 ? 'today' : 'balance'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Row: 3 Action Cards (Snacks, Brain Teaser, Reading Log) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-1 sm:pt-2">
            {/* Card 1: Snacks */}
            {onOpenSnackRequest && (
              <button
                id="btn-kid-snacks"
                onClick={() => {
                  sound.playTap();
                  onOpenSnackRequest(kid);
                }}
                className="p-3 sm:p-3.5 rounded-2xl sm:rounded-[22px] bg-[#edf8f1] dark:bg-emerald-950/30 hover:bg-[#e2f5e8] dark:hover:bg-emerald-950/50 border border-[#c4ebd1] dark:border-emerald-800/40 flex items-center gap-3 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98] text-left group"
                title={settings?.pauseSnackRequests ? 'Snack requests currently paused by parents' : 'Spend your stars to request delicious snacks & treats!'}
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#5bb87a] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 stroke-[2.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
                    <path d="M10 2c1 .5 2 2 2 5" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-black text-sm sm:text-base text-[#1b4d2b] dark:text-emerald-200 leading-tight">
                    Snacks
                  </div>
                  <div className="font-extrabold text-xs sm:text-sm text-[#276e40] dark:text-emerald-300 flex items-center gap-1 mt-0.5">
                    {settings?.pauseSnackRequests ? (
                      <span className="text-amber-700 dark:text-amber-400">Paused ⏸️</span>
                    ) : (
                      <>
                        <span>{kid.stars}</span>
                        <span>⭐</span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            )}

            {/* Card 2: Brain Teaser */}
            {database && onUpdateDatabase && (() => {
              const todayDateStr = getTodayDateString();
              const answeredCount = getDailyTeasersAnsweredToday(kid, todayDateStr);
              const dailyLimit = settings?.brainTeaserDailyLimit ?? 1;
              const isDone = answeredCount >= dailyLimit;
              const rewardStars = settings?.brainTeaserRewardStars ?? 5;

              return (
                <button
                  id="btn-kid-brain-teaser"
                  onClick={() => {
                    sound.playTap();
                    setIsBrainTeaserOpen(true);
                    setIsReadingLogOpen(false);
                    setIsBadgeModalOpen(false);
                  }}
                  className="p-3 sm:p-3.5 rounded-2xl sm:rounded-[22px] bg-[#f4effc] dark:bg-purple-950/30 hover:bg-[#eae0fa] dark:hover:bg-purple-950/50 border border-[#decff7] dark:border-purple-800/40 flex items-center gap-3 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98] text-left group"
                  title="Answer your grade-level brain teaser for bonus points!"
                >
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#825ec7] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <Brain className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-black text-sm sm:text-base text-[#382260] dark:text-purple-200 leading-tight flex items-center justify-between gap-1">
                      <span>Brain Teaser</span>
                      {kid.brainTeaserSubject && kid.brainTeaserSubject !== 'any' && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-purple-200/80 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 shrink-0">
                          {getSubjectInfo(kid.brainTeaserSubject).icon} {getSubjectInfo(kid.brainTeaserSubject).shortLabel}
                        </span>
                      )}
                    </div>
                    <div className="font-extrabold text-xs sm:text-sm text-[#6442a5] dark:text-purple-300 flex items-center gap-1 mt-0.5">
                      {isDone ? (
                        <span className="text-purple-700 dark:text-purple-300">
                          {answeredCount}/{dailyLimit} ✓ Done
                        </span>
                      ) : (
                        <>
                          <span>{answeredCount}/{dailyLimit}</span>
                          <span>•</span>
                          <span>+{rewardStars}</span>
                          <span>⭐</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })()}

            {/* Card 3: Reading Log */}
            {database && onUpdateDatabase && (() => {
              const rStars = getReadingRewardStars(database);
              const dailyLimit = getReadingDailyClaimLimit(database.settings);
              const claimsCount = getReadingClaimsCountForDate(database.readingLogs || [], kid.id, todayStr);
              const isLimitReached = dailyLimit > 0 && claimsCount >= dailyLimit;

              return (
                <button
                  id="btn-kid-reading-log"
                  onClick={() => {
                    sound.playTap();
                    setIsReadingLogOpen(true);
                    setIsBrainTeaserOpen(false);
                    setIsBadgeModalOpen(false);
                  }}
                  className="p-3 sm:p-3.5 rounded-2xl sm:rounded-[22px] bg-[#fcf3e8] dark:bg-amber-950/30 hover:bg-[#f7ebd8] dark:hover:bg-amber-950/50 border border-[#f1d7ba] dark:border-amber-800/40 flex items-center gap-3 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98] text-left group"
                  title="Log your book and chapter to earn reading stars!"
                >
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#c99554] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <BookOpen className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-black text-sm sm:text-base text-[#5c3713] dark:text-amber-200 leading-tight">
                      Reading Log
                    </div>
                    <div className="font-extrabold text-xs sm:text-sm text-[#8c5a2b] dark:text-amber-300 flex items-center gap-1 mt-0.5">
                      {dailyLimit === 0 ? (
                        claimsCount > 0 ? (
                          <span>{claimsCount} read • +{rStars} ⭐</span>
                        ) : (
                          <span>+{rStars} ⭐ per chapter</span>
                        )
                      ) : isLimitReached ? (
                        <span className="text-amber-800 dark:text-amber-300">
                          {claimsCount}/{dailyLimit} Done ✓
                        </span>
                      ) : claimsCount > 0 ? (
                        <span>{claimsCount}/{dailyLimit} • +{rStars} ⭐</span>
                      ) : (
                        <span>+{rStars} ⭐ per chapter</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })()}
          </div>
        </div>

      {/* Level, Badges & Rewards Hub (Balanced 2-Card Layout - Zero Dead Space) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Card 1: Level, Star Bank, Next Rank & Reward Store (7 cols on desktop) */}
        <div className="lg:col-span-7 bg-indigo-900 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-7 text-white relative overflow-hidden shadow-xl flex flex-col justify-between">
          <div className="relative z-10 space-y-4">
            {/* Top avatar & level */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black italic tracking-tight">
                  Level {levelInfo.level}
                </h2>
                <p className="text-indigo-300 font-extrabold uppercase tracking-wider text-xs sm:text-sm mt-0.5">
                  {levelInfo.title}
                </p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-800/80 border-2 border-indigo-400/40 flex items-center justify-center text-2xl sm:text-3xl shadow-lg overflow-hidden shrink-0">
                {kid.avatar && (kid.avatar.startsWith('http') || kid.avatar.startsWith('data:image') || kid.avatar.startsWith('/')) ? (
                  <img src={kid.avatar} alt={kid.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="leading-none">{kid.avatar || '⭐'}</span>
                )}
              </div>
            </div>

            {/* Star Bank & Streak */}
            <div className="grid grid-cols-2 gap-2.5">
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
            <div>
              <div className="flex justify-between text-xs sm:text-sm font-black mb-1.5">
                <span className="uppercase tracking-wider text-indigo-200">
                  {levelInfo.isMaxLevel ? 'MAX LEVEL REACHED' : 'Next Rank Progress'}
                </span>
                <span className="text-yellow-400">{levelInfo.progressPercent}%</span>
              </div>
              <div className="w-full bg-indigo-950 h-4 sm:h-5 rounded-full overflow-hidden border-2 border-indigo-700 p-0.5 sm:p-1">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${levelInfo.progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] sm:text-xs text-indigo-300 mt-1.5 text-center font-medium">
                {levelInfo.isMaxLevel ? 'Chore Legend Status Unlocked!' : `Only ${levelInfo.starsNeededForNextLevel} points to Level ${levelInfo.level + 1}!`}
              </p>
            </div>

            {/* Launch Reward Store Button */}
            <button
              id="btn-open-rewards-aside"
              onClick={() => {
                sound.playTap();
                onOpenRewardStore();
              }}
              className={`w-full py-3 px-4 rounded-2xl active:scale-95 text-slate-900 font-black text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                settings?.pauseRewardStore
                  ? 'bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-200 hover:to-amber-300 shadow-amber-500/25'
                  : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 shadow-orange-500/25'
              }`}
            >
              <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900" />
              <span>{settings?.pauseRewardStore ? 'Reward Store (Paused ⏸️)' : 'Open Reward Store 🎁'}</span>
            </button>
          </div>

          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Card 2: Quest Badges Showcase & Privacy Shield (5 cols on desktop) */}
        <div className="lg:col-span-5 bg-indigo-900 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-7 text-white relative overflow-hidden shadow-xl flex flex-col justify-between space-y-4">
          <div className="relative z-10 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-black text-yellow-400 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>Quest Badges ({kidBadges.filter((b) => b.isUnlocked).length}/{kidBadges.length})</span>
                </h4>
                <button
                  onClick={() => {
                    sound.playTap();
                    setSelectedBadgeModalId(kidBadges[0]?.badge.id || null);
                    setIsBadgeModalOpen(true);
                    setIsBrainTeaserOpen(false);
                    setIsReadingLogOpen(false);
                  }}
                  className="text-xs font-black text-amber-300 hover:text-amber-200 underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {kidBadges.map(({ badge, isUnlocked, progressText }) => (
                  <button
                    key={badge.id}
                    id={`btn-badge-${badge.id}`}
                    onClick={() => {
                      sound.playTap();
                      setSelectedBadgeModalId(badge.id);
                      setIsBadgeModalOpen(true);
                      setIsBrainTeaserOpen(false);
                      setIsReadingLogOpen(false);
                    }}
                    className={`relative rounded-xl p-2 flex flex-col items-center justify-center transition-all cursor-pointer group active:scale-95 border-2 ${
                      isUnlocked
                        ? `bg-gradient-to-br ${badge.bgGradient} border-amber-300 text-slate-950 shadow-md shadow-amber-500/20 hover:scale-105`
                        : 'bg-indigo-950/60 border-indigo-700/80 text-indigo-300 opacity-60 hover:opacity-90 grayscale hover:grayscale-0'
                    }`}
                    title={`${badge.title} (${isUnlocked ? 'UNLOCKED' : 'LOCKED: ' + progressText}) - Tap to inspect`}
                  >
                    <span className="text-2xl filter drop-shadow-sm select-none">{badge.icon}</span>
                    <span className="text-[10px] font-black leading-tight mt-1 truncate max-w-full text-center">
                      {badge.title}
                    </span>
                    {!isUnlocked && (
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-900 border border-slate-700 text-white flex items-center justify-center text-[9px]">
                        🔒
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="text-[11px] font-bold text-indigo-200/80 mt-2.5 text-center">
                ✨ Tap any badge to check criteria & unlock requirements!
              </div>
            </div>

            {/* Local Host Privacy Banner */}
            <div className="mt-4 bg-emerald-600/90 rounded-2xl p-3 sm:p-3.5 text-white flex items-center gap-3 border border-emerald-400/40 shadow-xs">
              <div className="text-2xl shrink-0">🛡️</div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-200 leading-tight">Privacy Mode Active</p>
                <p className="font-extrabold text-xs sm:text-sm text-white truncate leading-tight">Local Raspberry Pi 5 Connection</p>
              </div>
            </div>
          </div>

          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
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
              {settings?.pauseRewardStore ? 'Store (Paused ⏸️)' : 'Store 🎁'}
            </button>
          </div>
        )}

        {/* Active Embedded Subscreen: Brain Teaser, Reading Log, or Quest Badges */}
        {isBrainTeaserOpen && database && onUpdateDatabase ? (
          <div className="w-full pt-1">
            <BrainTeaserModal
              isOpen={true}
              embedded={true}
              kid={kid}
              database={database}
              onUpdateDatabase={onUpdateDatabase}
              onClose={() => setIsBrainTeaserOpen(false)}
            />
          </div>
        ) : isReadingLogOpen && database && onUpdateDatabase ? (
          <div className="w-full pt-1">
            <ReadingLogModal
              isOpen={true}
              embedded={true}
              kid={kid}
              database={database}
              onUpdateDatabase={onUpdateDatabase}
              onClose={() => setIsReadingLogOpen(false)}
            />
          </div>
        ) : isBadgeModalOpen ? (
          <div className="w-full pt-1">
            <BadgeModal
              isOpen={true}
              embedded={true}
              kid={kid}
              badges={kidBadges}
              initialBadgeId={selectedBadgeModalId}
              onClose={() => setIsBadgeModalOpen(false)}
            />
          </div>
        ) : (
          <>
            {/* Kid-Coin Gamified Savings Mission & Cosmic Rocket Goal Track */}
            {settings?.kidCoinEnabled !== false && database && (
              <GoalTracker
                kid={kid}
                database={database}
                onUpdateKid={(updatedKid) => {
                  if (onUpdateDatabase && database) {
                    const updatedKids = database.kids.map((k) => (k.id === updatedKid.id ? updatedKid : k));
                    onUpdateDatabase({ ...database, kids: updatedKids });
                  }
                }}
              />
            )}

        {/* Filters: Categories and Time of Day */}
        <div className="flex flex-col gap-3">
          {/* Category Pills & Chore Roulette */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              id="btn-chore-roulette-spin"
              onClick={() => {
                sound.playTap();
                setIsWheelOpen(true);
              }}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-pink-500 hover:from-amber-500 hover:to-pink-600 text-white font-black text-xs sm:text-sm shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              title="Spin the Chore Wheel for a surprise mission!"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Chore Roulette 🎡</span>
            </button>

            <button
              key="filter-cat-all"
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

        {/* Chores Cards Grid (Responsive 2-column grid utilizing full width) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {visibleChores.length === 0 ? (
            <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border-b-8 border-r-4 border-slate-200 dark:border-slate-700 border-t-2 border-l-2 border-t-slate-100 border-l-slate-100 shadow-sm">
              <div className="text-5xl mb-3">🌴</div>
              <h3 className="font-black text-slate-800 dark:text-white text-xl">No missions found here!</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 max-w-sm mx-auto">
                There are no tasks scheduled for this category right now. Check other categories or enjoy your break!
              </p>
            </div>
          ) : (
            visibleChores.map((chore) => {
              const category = categories.find((c) => c.id === chore.categoryId);
              const log = logMap.get(chore.id);
              const otherKidClaimLog = chore.isBounty
                ? (logs || []).find(
                    (l) => l.choreId === chore.id && l.date === todayStr && l.status === 'completed' && l.kidId !== kid.id
                  )
                : null;
              const otherKidClaimer = otherKidClaimLog
                ? (database?.kids || []).find((k) => k.id === otherKidClaimLog.kidId)
                : null;

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
                  claimedByOtherKidName={otherKidClaimer?.name}
                  onOpenReadingLog={() => {
                    setIsReadingLogOpen(true);
                    setIsBrainTeaserOpen(false);
                    setIsBadgeModalOpen(false);
                  }}
                />
              );
            })
          )}
        </div>

        {/* Western Bounty Board (Extra Credit Missions) */}
        {bountyChores.length > 0 && (
          <div className="mt-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">🤠</span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-amber-950 font-serif">
                    The Bounty Board
                  </h3>
                  <p className="text-xs font-medium text-amber-800">
                    High-reward contracts! Complete these for bonus star points anytime.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {database && onUpdateDatabase && (
                  <button
                    id="btn-kid-open-bounty-board"
                    onClick={() => {
                      sound.playTap();
                      setIsBountyBoardOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs font-serif flex items-center gap-1.5 shadow-sm border border-amber-600 transition-all cursor-pointer"
                  >
                    <span>📜 Wanted Board</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black">
                      {bountyChores.length}
                    </span>
                  </button>
                )}
                <span className="px-3 py-1 rounded-full bg-amber-200 text-amber-900 font-black text-xs">
                  {bountyChores.length} Available
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {bountyChores.map((bounty) => {
                const category = categories.find((c) => c.id === bounty.categoryId);
                const log = logMap.get(bounty.id);

                return (
                  <ChoreCard
                    key={`bounty-${bounty.id}`}
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
          </>
        )}

        {/* Prominent Kiosk Exit Button at Bottom of Tasks */}
        {onReturnToKiosk && (
          <div className="mt-6 flex justify-center pb-2">
            <button
              id="btn-kid-return-to-kiosk-bottom"
              onClick={() => {
                sound.playTap();
                onReturnToKiosk();
              }}
              className="min-h-[52px] w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-sm sm:text-base shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer border-2 border-amber-400"
            >
              <Home className="w-5 h-5 text-slate-950" />
              <span>Done / Return to Kiosk 🏠</span>
            </button>
          </div>
        )}

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

      {/* Western Bounty Board Pop-up Modal */}
      {isBountyBoardOpen && database && onUpdateDatabase && (
        <BountyBoardModal
          isOpen={isBountyBoardOpen}
          onClose={() => setIsBountyBoardOpen(false)}
          database={database}
          onUpdateDatabase={onUpdateDatabase}
          currentKid={kid}
          onStartTimer={(chore) => {
            setIsBountyBoardOpen(false);
            setActiveTimerChore(chore);
          }}
        />
      )}
    </div>
  );
};
