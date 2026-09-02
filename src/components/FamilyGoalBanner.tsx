import React from 'react';
import { Trophy, Sparkles, ChevronRight } from 'lucide-react';
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

  const clampedPercent = Math.min(100, Math.max(0, percent));

  return (
    <div
      id="family-goal-banner"
      onClick={onEditGoal ? () => { sound.playTap(); onEditGoal(); } : undefined}
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border transition-all p-4 sm:p-5 shadow-md w-full max-w-full ${
        onEditGoal ? 'cursor-pointer hover:shadow-lg group' : ''
      } ${
        isReached
          ? 'bg-gradient-to-r from-amber-100/90 via-amber-50/90 to-emerald-100/90 dark:from-amber-950/80 dark:via-slate-900/90 dark:to-emerald-950/80 border-amber-400 ring-2 ring-amber-400/40'
          : `${theme.goalBannerBg} ${theme.goalBannerBorder}`
      }`}
    >
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 sm:gap-4 w-full">
        {/* Left Side: Icon & Title */}
        <div className="flex items-center gap-3 sm:gap-3.5 flex-1 min-w-0">
          <div
            onClick={isReached ? handleCelebrate : undefined}
            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-xs transition-transform ${
              onEditGoal ? 'group-hover:scale-105' : ''
            } ${
              isReached
                ? 'bg-amber-400 text-yellow-950 animate-bounce cursor-pointer'
                : theme.goalBannerIconBg
            }`}
          >
            {goal.icon || '🏆'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-0.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${theme.goalBadge}`}>
                <Trophy className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="truncate">Weekly Family Goal</span>
              </span>
              {isReached ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white animate-pulse shrink-0">
                  <Sparkles className="w-3 h-3" />
                  <span>Achieved!</span>
                </span>
              ) : (
                onEditGoal && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-black/10 dark:bg-white/15 text-current group-hover:bg-black/20 dark:group-hover:bg-white/25 transition-colors shrink-0">
                    <span>Options ⚙️</span>
                  </span>
                )
              )}
            </div>

            <h3 className={`text-sm sm:text-base md:text-lg font-black truncate group-hover:opacity-80 transition-opacity ${theme.goalTitleColor}`}>
              {goal.title}
            </h3>

            <p className={`text-xs font-semibold truncate opacity-85 ${theme.goalTitleColor}`}>
              🎁 Reward: <span className="text-pink-600 dark:text-pink-400 font-extrabold">{goal.reward}</span>
            </p>
          </div>
        </div>

        {/* Right Side: Progress Meter & Stats */}
        <div className="w-full md:w-64 lg:w-72 shrink-0">
          <div className={`flex items-center justify-between text-xs font-black mb-1.5 ${theme.goalTitleColor}`}>
            <span className="opacity-80 truncate mr-2">
              {isReached ? '🎉 Target Smashed!' : `${remaining} more chores to unlock!`}
            </span>
            <span className="font-black shrink-0">
              {completedCount} / {target} ({percent}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3.5 sm:h-4 bg-black/10 dark:bg-white/15 rounded-full overflow-hidden p-0.5 border border-black/10 dark:border-white/20 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isReached
                  ? 'bg-gradient-to-r from-amber-400 via-pink-400 to-emerald-400'
                  : theme.goalBannerProgress
              }`}
              style={{ width: `${clampedPercent}%` }}
            />
          </div>

          {onEditGoal && (
            <div className="mt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playTap();
                  onEditGoal();
                }}
                className={`inline-flex items-center gap-1 text-[11px] font-black hover:opacity-100 ${theme.goalBadge} px-2.5 py-0.5 rounded-full transition-all cursor-pointer shadow-2xs`}
              >
                <span>{isParentMode ? 'Admin Goal Settings' : 'Change Goal'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};