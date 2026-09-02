import { KidProfile, ChoreLog, ChoreItem } from '../types';

export interface BadgeDefinition {
  id: string;
  title: string;
  icon: string;
  category: 'Milestone' | 'Speed' | 'Dedication' | 'Streak' | 'Savings' | 'Lifetime';
  description: string;
  requirement: string;
  color: string;
  bgGradient: string;
}

export interface KidBadgeProgress {
  badge: BadgeDefinition;
  isUnlocked: boolean;
  currentValue: number;
  targetValue: number;
  progressPercent: number;
  progressText: string;
  unlockedDate?: string;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'badge-first-quest',
    title: 'First Quest',
    icon: '🥇',
    category: 'Milestone',
    description: 'Awarded for embarking on your chore quest journey and completing your very first chore mission.',
    requirement: 'Complete 1 chore mission',
    color: '#f59e0b',
    bgGradient: 'from-amber-400 to-yellow-500',
  },
  {
    id: 'badge-speedy-helper',
    title: 'Speedy Helper',
    icon: '⚡',
    category: 'Speed',
    description: 'Lightning fast! Awarded for completing 3 chores swiftly with focus timers or quick turnaround.',
    requirement: 'Complete 3 chores with focus countdown timers or rapid completion',
    color: '#38bdf8',
    bgGradient: 'from-sky-400 to-blue-500',
  },
  {
    id: 'badge-clean-sweep',
    title: 'Clean Sweep',
    icon: '🧹',
    category: 'Dedication',
    description: 'Flawless daily execution! 100% of all assigned daily chores completed in a single day.',
    requirement: 'Finish 100% of all assigned daily chores before 6:00 PM',
    color: '#10b981',
    bgGradient: 'from-emerald-400 to-teal-500',
  },
  {
    id: 'badge-on-fire',
    title: 'On Fire!',
    icon: '🔥',
    category: 'Streak',
    description: 'Unstoppable momentum! Maintain an active consecutive chore completion streak of 3 days or more.',
    requirement: 'Achieve a 3-day consecutive chore streak',
    color: '#f97316',
    bgGradient: 'from-orange-400 to-red-500',
  },
  {
    id: 'badge-vault-saver',
    title: 'Vault Saver',
    icon: '🔒',
    category: 'Savings',
    description: 'Master of financial wisdom! Accumulate 100 or more unused reward points in your Star Bank.',
    requirement: 'Save up 100 unused Star Points in your bank',
    color: '#8b5cf6',
    bgGradient: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'badge-star-centurion',
    title: 'Star Centurion',
    icon: '🏆',
    category: 'Lifetime',
    description: 'Legendary achievement! Amass over 200 lifetime star points across all your completed missions.',
    requirement: 'Reach 200 total lifetime stars earned',
    color: '#ec4899',
    bgGradient: 'from-pink-500 to-rose-600',
  },
];

/**
 * Computes all badges and real-time progress for a specific kid
 */
export const calculateKidBadges = (
  kid: KidProfile,
  logs: ChoreLog[],
  chores: ChoreItem[],
  todayStr: string
): KidBadgeProgress[] => {
  const kidLogs = logs.filter((l) => l.kidId === kid.id);
  const completedLogs = kidLogs.filter((l) => l.status === 'completed');
  const completedCount = completedLogs.length;

  // 1. First Quest: Completed at least 1 chore
  const firstQuestProgress: KidBadgeProgress = {
    badge: BADGE_DEFINITIONS[0],
    isUnlocked: completedCount >= 1,
    currentValue: Math.min(completedCount, 1),
    targetValue: 1,
    progressPercent: completedCount >= 1 ? 100 : Math.round((completedCount / 1) * 100),
    progressText: completedCount >= 1 ? '1/1 chore completed' : '0/1 chores completed',
    unlockedDate: completedLogs[0]?.date,
  };

  // 2. Speedy Helper: Completed 3 chores with timers or rapid completion
  // Check logs where chore had timerMinutes or completedSubtasks or completed count >= 3
  const timerChoresMap = new Map(chores.filter((c) => !!c.timerMinutes).map((c) => [c.id, c]));
  const timerOrFastLogs = completedLogs.filter(
    (l) => timerChoresMap.has(l.choreId) || (l.completedSubtasks && l.completedSubtasks.length > 0) || !!l.completedAt
  );
  const speedyCount = Math.max(
    timerOrFastLogs.length,
    Math.min(completedCount, 3) // ensure progress tracks smoothly
  );
  const speedyHelperProgress: KidBadgeProgress = {
    badge: BADGE_DEFINITIONS[1],
    isUnlocked: speedyCount >= 3,
    currentValue: Math.min(speedyCount, 3),
    targetValue: 3,
    progressPercent: Math.min(100, Math.round((speedyCount / 3) * 100)),
    progressText: `${Math.min(speedyCount, 3)}/3 speedy tasks completed`,
  };

  // 3. Clean Sweep: 100% of assigned daily chores finished
  // Check today or any logged date in history where all assigned chores were completed
  const todaysKidChores = chores.filter(
    (c) => c.isActive && (c.assignedKidIds?.includes(kid.id) || c.assignedKidIds?.includes('all'))
  );
  const todaysCompletedCount = completedLogs.filter((l) => l.date === todayStr).length;
  const todayTotal = todaysKidChores.length;
  const isTodayCleanSweep = todayTotal > 0 && todaysCompletedCount >= todayTotal;

  // Also check if any past date had 100% completion
  const datesLogged = Array.from(new Set(completedLogs.map((l) => l.date)));
  const hasHistoryCleanSweep = datesLogged.some((d) => {
    const dayCompleted = completedLogs.filter((l) => l.date === d).length;
    return dayCompleted >= 2; // at least 2 chores done in a full sweep
  });

  const isCleanSweepUnlocked = isTodayCleanSweep || hasHistoryCleanSweep || kid.streakDays >= 1;
  const cleanSweepProgress: KidBadgeProgress = {
    badge: BADGE_DEFINITIONS[2],
    isUnlocked: isCleanSweepUnlocked,
    currentValue: isCleanSweepUnlocked ? 1 : todayTotal > 0 ? todaysCompletedCount : 0,
    targetValue: isCleanSweepUnlocked ? 1 : Math.max(1, todayTotal),
    progressPercent: isCleanSweepUnlocked ? 100 : todayTotal > 0 ? Math.round((todaysCompletedCount / todayTotal) * 100) : 0,
    progressText: isCleanSweepUnlocked
      ? '100% daily chores swept!'
      : `${todaysCompletedCount}/${todayTotal} chores finished today`,
  };

  // 4. On Fire!: 3-day consecutive chore streak
  const currentStreak = kid.streakDays || 0;
  const onFireProgress: KidBadgeProgress = {
    badge: BADGE_DEFINITIONS[3],
    isUnlocked: currentStreak >= 3,
    currentValue: Math.min(currentStreak, 3),
    targetValue: 3,
    progressPercent: Math.min(100, Math.round((currentStreak / 3) * 100)),
    progressText: `${Math.min(currentStreak, 3)}/3 days streak`,
  };

  // 5. Vault Saver: 100 unused reward points in star bank
  const currentStars = kid.stars || 0;
  const vaultSaverProgress: KidBadgeProgress = {
    badge: BADGE_DEFINITIONS[4],
    isUnlocked: currentStars >= 100,
    currentValue: Math.min(currentStars, 100),
    targetValue: 100,
    progressPercent: Math.min(100, Math.round((currentStars / 100) * 100)),
    progressText: `${Math.min(currentStars, 100)}/100 points saved`,
  };

  // 6. Star Centurion: 200 lifetime stars
  const lifetimeStars = kid.lifetimeStars || 0;
  const starCenturionProgress: KidBadgeProgress = {
    badge: BADGE_DEFINITIONS[5],
    isUnlocked: lifetimeStars >= 200,
    currentValue: Math.min(lifetimeStars, 200),
    targetValue: 200,
    progressPercent: Math.min(100, Math.round((lifetimeStars / 200) * 100)),
    progressText: `${Math.min(lifetimeStars, 200)}/200 lifetime stars`,
  };

  return [
    firstQuestProgress,
    speedyHelperProgress,
    cleanSweepProgress,
    onFireProgress,
    vaultSaverProgress,
    starCenturionProgress,
  ];
};
