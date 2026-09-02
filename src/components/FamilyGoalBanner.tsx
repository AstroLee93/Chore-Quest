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
  className?: string;
}

export const FamilyGoalBanner: React.FC<FamilyGoalBannerProps> = ({
  database,
  isParentMode = false,
  currentTheme = 'coastal-horizon',
  onEditGoal,
  className = '',
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
      className={`relative overflow-hidden rounded-xl sm:rounded-2xl border transition-transform transition-shadow duration-150 p-2.5 sm:p-3 shadow-xs w-full select-none ${className} ${
        onEditGoal ? 'cursor-pointer hover:shadow-md active:scale-[0.99] group' : ''
      } ${
        isReached
          ? 'bg-gradient-to-r from-amber-200 via-amber-100 to-emerald-200 dark:from-amber-950/90 dark:via-slate-900 dark:to-emerald-950/90 border-amber-400'
          : `${theme.goalBannerBg} ${theme.goalBannerBorder}`
      }`}
    >
      <div className="flex flex-col gap-1.5">
        {/* Top Row: Goal Title & Reward on Left, Change Goal Button on Right */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            <span
              onClick={isReached ? handleCelebrate : undefined}
              className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-2xs ${
                isReached
                  ? 'bg-emerald-500 text-white animate-pulse cursor-pointer'
                  : theme.goalBadge
              }`}
            >
              <span className="text-xs sm:text-sm leading-none">{goal.icon || '🏆'}</span>
              <span>{isReached ? '🎉 Reached!' : 'Family Goal'}</span>
            </span>

            <h3 className={`text-xs sm:text-sm font-black truncate leading-none ${theme.goalTitleColor}`}>
              {goal.title}
            </h3>

            <span className="hidden xs:inline-flex items-center gap-1 text-[11px] font-bold text-pink-600 dark:text-pink-400 truncate shrink-0">
              <span>🎁</span>
              <span>Reward: <strong className="font-black">{goal.reward}</strong></span>
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
              className={`shrink-0 text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-lg ${theme.goalBadge} hover:opacity-90 active:scale-95 transition-transform duration-150 cursor-pointer shadow-2xs flex items-center gap-1`}
            >
              <span>{isParentMode ? '⚙️ Settings' : '🎯 Change Goal'}</span>
            </button>
          )}
        </div>

        {/* Progress Bar - Full Width & Sleek */}
        <div className="w-full h-2.5 sm:h-3 bg-black/10 dark:bg-white/15 rounded-full overflow-hidden p-0.5 border border-black/10 dark:border-white/20 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isReached
                ? 'bg-gradient-to-r from-amber-400 via-pink-400 to-emerald-400'
                : theme.goalBannerProgress
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Bottom Row: Progress Text with Emojis */}
        <div className={`flex items-center justify-between text-[11px] sm:text-xs font-black ${theme.goalTitleColor} leading-none`}>
          <span className="opacity-85 truncate mr-2 flex items-center gap-1">
            <span>{isReached ? '🎉 Target Smashed!' : `🎯 ${remaining} more chores to unlock!`}</span>
          </span>
          <span className="font-black shrink-0 flex items-center gap-1">
            <span>⭐ {completedCount} / {target}</span>
            <span className="opacity-75">({percent}%)</span>
          </span>
        </div>
      </div>
    </div>
  );
};
