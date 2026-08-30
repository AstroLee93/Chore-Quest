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

  const handleCelebrate = () => {
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
      className={`relative overflow-hidden rounded-3xl border-2 transition-all p-4 sm:p-5 shadow-sm ${
        isReached
          ? 'bg-gradient-to-r from-amber-100 via-yellow-100 to-emerald-100 border-amber-400 ring-2 ring-amber-400/50'
          : 'bg-white border-amber-200'
      }`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Side: Icon & Title */}
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div
            onClick={isReached ? handleCelebrate : undefined}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-2xs ${
              isReached
                ? 'bg-amber-400 text-yellow-950 animate-bounce cursor-pointer'
                : 'bg-amber-100 text-amber-900'
            }`}
          >
            {goal.icon || '🏆'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 border border-amber-300">
                <Trophy className="w-3 h-3 text-amber-700" />
                <span>Weekly Family Teamwork Goal</span>
              </span>
              {isReached && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white animate-pulse">
                  <Sparkles className="w-3 h-3" />
                  <span>Goal Achieved!</span>
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 truncate mt-0.5">
              {goal.title}
            </h3>

            <p className="text-xs font-semibold text-slate-600 truncate">
              🎁 Reward: <span className="text-pink-600 font-extrabold">{goal.reward}</span>
            </p>
          </div>
        </div>

        {/* Right Side: Progress Meter & Stats */}
        <div className="w-full md:w-72 shrink-0">
          <div className="flex items-center justify-between text-xs font-black mb-1.5">
            <span className="text-slate-600">
              {isReached ? '🎉 Target Smashed!' : `${remaining} more chores to unlock!`}
            </span>
            <span className="text-indigo-950 font-black">
              {completedCount} / {target} ({percent}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isReached
                  ? 'bg-gradient-to-r from-amber-400 via-pink-400 to-emerald-400'
                  : 'bg-gradient-to-r from-amber-400 to-pink-500'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>

          {isParentMode && onEditGoal && (
            <div className="mt-2 text-right">
              <button
                onClick={() => {
                  sound.playTap();
                  onEditGoal();
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Edit Family Goal ⚙️
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
