import React from 'react';
import confetti from 'canvas-confetti';
import { FamilyDatabase } from '../types';
import { getFamilyWeeklyGoalProgress } from '../utils/storage';
import { sound } from '../utils/sound';
import { AppThemeId, APP_THEMES } from '../utils/theme';

interface FamilyGoalBannerProps {
  database: FamilyDatabase;
  isParentMode?: boolean;
  currentTheme?: AppThemeId;
  onEditGoal?: () => void;
}

export const FamilyGoalBanner: React.FC<FamilyGoalBannerProps> = ({
  database,
  isParentMode = false,
  currentTheme = 'coastal-horizon',
  onEditGoal,
}) => {
  const { goal, completedCount, target, percent, isReached, remaining } =
    getFamilyWeeklyGoalProgress(database);
  const theme = APP_THEMES[currentTheme] || APP_THEMES['coastal-horizon'];

  if (!goal.isActive) return null;

  const handleCelebrate = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playLevelUp();
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981'],
    });
  };

  return (
    <div
      id="family-goal-banner"
      onClick={onEditGoal ? () => { sound.playTap(); onEditGoal(); } : undefined}
      className={`relative overflow-hidden rounded-xl sm:rounded-2xl border transition-all p-2.5 sm:p-3.5 shadow-xs w-full ${
        onEditGoal ? 'cursor-pointer hover:shadow-md group' : ''
      } ${
        isReached
          ? 'bg-gradient-to-r from-amber-200 via-amber-100 to-emerald-200 dark:from-amber-950/90 dark:via-slate-900 dark:to-emerald-950/90 border-amber-400'
          : `${theme.goalBannerBg} ${theme.goalBannerBorder}`
      }`}
    >
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {/* Top Row: Goal Title & Reward on Left, Change Goal Button on Right */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span
              onClick={isReached ? handleCelebrate : undefined}
              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shrink-0 ${
                isReached
                  ? 'bg-emerald-500 text-white animate-pulse cursor-pointer'
                  : theme.goalBadge
              }`}
            >
              {isReached ? 'Goal Reached!' : 'Family Goal'}
            </span>

            <h3 className={`text-xs sm:text-sm font-black truncate leading-none ${theme.goalTitleColor}`}>
              {goal.title}
            </h3>

            <span className="hidden xs:inline text-[11px] font-bold text-pink-600 dark:text-pink-400 truncate shrink-0">
              Reward: {goal.reward}
            </span>
          </div>

          {/* Change Goal Button */}
          {onEditGoal && (
            <button
              id="btn-change-goal"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                sound.playTap();
                onEditGoal();
              }}
              className={`shrink-0 text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-lg ${theme.goalBadge} hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-2xs`}
            >
              {isParentMode ? 'Goal Settings' : 'Change Goal'}
            </button>
          )}
        </div>

        {/* Progress Bar - Full Width & Sleek */}
        <div className="w-full h-2.5 sm:h-3 bg-black/10 dark:bg-white/15 rounded-full overflow-hidden p-0.5 border border-black/10 dark:border-white/20 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isReached
                ? 'bg-gradient-to-r from-amber-400 via-pink-400 to-emerald-400'
                : theme.goalBannerProgress
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Bottom Row: Progress Text */}
        <div className={`flex items-center justify-between text-[11px] sm:text-xs font-black ${theme.goalTitleColor} leading-none`}>
          <span className="opacity-80 truncate mr-2">
            {isReached ? 'Target Reached!' : `${remaining} more chores to unlock`}
          </span>
          <span className="font-black shrink-0">
            {completedCount} / {target} ({percent}%)
          </span>
        </div>
      </div>
    </div>
  );
};
