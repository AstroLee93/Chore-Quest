import React from 'react';
import { Trophy, Target, Sparkles, CheckCircle2, ChevronRight, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FamilyDatabase } from '../types';
import { getFamilyWeeklyGoalProgress } from '../utils/storage';
import { sound } from '../utils/sound';

interface FamilyGoalBannerProps {
  database: FamilyDatabase;
  isParentMode?: boolean;
  onEditGoal?: () => void;
}

export const FamilyGoalBanner: React.FC<FamilyGoalBannerProps> = ({
  database,
  isParentMode = false,
  onEditGoal,
}) => {
  const { goal, completedCount, target, percent, isReached, remaining } =
    getFamilyWeeklyGoalProgress(database);

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
      className={`relative overflow-hidden rounded-3xl border transition-all p-4 sm:p-5 shadow-sm backdrop-blur-md ${
        onEditGoal ? 'cursor-pointer hover:shadow-md hover:border-amber-400 group' : ''
      } ${
        isReached
          ? 'bg-gradient-to-r from-amber-100/90 via-amber-50/90 to-emerald-100/90 dark:from-amber-950/70 dark:via-slate-900/80 dark:to-emerald-950/70 border-amber-400/80 ring-2 ring-amber-400/30'
          : 'bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800'
      }`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Side: Icon & Title */}
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div
            onClick={isReached ? handleCelebrate : undefined}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-2xs transition-transform ${
              onEditGoal ? 'group-hover:scale-105' : ''
            } ${
              isReached
                ? 'bg-amber-400 text-yellow-950 animate-bounce cursor-pointer'
                : 'bg-amber-100/80 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200'
            }`}
          >
            {goal.icon || '🏆'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                <Trophy className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Weekly Family Teamwork Goal</span>
              </span>
              {isReached ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white animate-pulse">
                  <Sparkles className="w-3 h-3" />
                  <span>Goal Achieved!</span>
                </span>
              ) : (
                onEditGoal && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 dark:bg-slate-700 text-white group-hover:bg-slate-700 transition-colors">
                    <span>Change / View Options ⚙️</span>
                  </span>
                )
              )}
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate mt-0.5 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
              {goal.title}
            </h3>

            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
              🎁 Reward: <span className="text-pink-600 dark:text-pink-400 font-extrabold">{goal.reward}</span>
            </p>
          </div>
        </div>

        {/* Right Side: Progress Meter & Stats */}
        <div className="w-full md:w-72 shrink-0">
          <div className="flex items-center justify-between text-xs font-black mb-1.5">
            <span className="text-slate-600 dark:text-slate-400">
              {isReached ? '🎉 Target Smashed!' : `${remaining} more chores to unlock!`}
            </span>
            <span className="text-slate-900 dark:text-white font-black">
              {completedCount} / {target} ({percent}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/80 dark:border-slate-700 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isReached
                  ? 'bg-gradient-to-r from-amber-400 via-pink-400 to-emerald-400'
                  : 'bg-gradient-to-r from-amber-400 to-pink-500'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>

          {onEditGoal && (
            <div className="mt-2 flex items-center justify-end gap-1.5 text-right">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playTap();
                  onEditGoal();
                }}
                className="inline-flex items-center gap-1 text-[11px] font-black text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-0.5 rounded-full transition-all cursor-pointer shadow-2xs border border-slate-200/80 dark:border-slate-700"
              >
                <span>{isParentMode ? 'Admin Goal Settings ⚙️' : 'View / Change Goal 🎯'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
