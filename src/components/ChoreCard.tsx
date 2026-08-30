import React, { useState } from 'react';
import { Check, Clock, AlertTriangle, Undo2, Star, HelpCircle, Sun, Moon, Sparkles, ChevronRight, Play, CheckSquare, Square, Target, Timer } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChoreItem, ChoreLog, ChoreCategory } from '../types';
import { sound } from '../utils/sound';

interface ChoreCardProps {
  chore: ChoreItem;
  category?: ChoreCategory;
  log?: ChoreLog;
  onToggleComplete: (chore: ChoreItem) => void;
  onOpenSkipModal: (chore: ChoreItem) => void;
  onUndo: (choreId: string) => void;
  onStartTimer?: (chore: ChoreItem) => void;
}

export const ChoreCard: React.FC<ChoreCardProps> = ({
  chore,
  category,
  log,
  onToggleComplete,
  onOpenSkipModal,
  onUndo,
  onStartTimer,
}) => {
  const isCompleted = log?.status === 'completed';
  const isSkipped = log?.status === 'skipped';

  // Subtasks local state (synced or tracked per session)
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleToggleSubtask = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playTap();
    setCompletedSteps((prev) => {
      const exists = prev.includes(index);
      if (exists) {
        return prev.filter((i) => i !== index);
      } else {
        const next = [...prev, index];
        // If all subtasks completed, play small reward sound
        if (chore.subtasks && next.length === chore.subtasks.length) {
          sound.playStarEarned();
        }
        return next;
      }
    });
  };

  const handleCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompleted) return;

    // Confetti effect from target position
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { x, y },
      colors: ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'],
      ticks: 180,
    });

    sound.playChoreComplete();
    sound.playStarEarned();
    onToggleComplete(chore);
  };

  const getTimeBadge = (time: string) => {
    switch (time) {
      case 'morning':
        return { label: 'Morning Routine', icon: '🌅', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'afternoon':
        return { label: 'Afternoon Mission', icon: '☀️', color: 'bg-sky-100 text-sky-900 border-sky-300' };
      case 'evening':
        return { label: 'Bedtime Routine', icon: '🌙', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      default:
        return { label: 'Daily Mission', icon: '⚡', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
    }
  };

  // Assign border color from category or fallback vibrant rotation
  const getBorderColorClass = () => {
    if (isCompleted) return 'border-emerald-500';
    if (isSkipped) return 'border-amber-400';
    if (chore.isBounty) return 'border-amber-400 ring-2 ring-amber-300/60';
    
    // Choose vibrant color based on chore id / category
    const catColor = category?.color?.toLowerCase();
    if (catColor?.includes('blue') || catColor?.includes('3b82f6')) return 'border-blue-500';
    if (catColor?.includes('purple') || catColor?.includes('8b5cf6') || catColor?.includes('a855f7')) return 'border-purple-500';
    if (catColor?.includes('orange') || catColor?.includes('f97316') || catColor?.includes('amber')) return 'border-orange-400';
    if (catColor?.includes('emerald') || catColor?.includes('green') || catColor?.includes('10b981')) return 'border-emerald-500';
    if (catColor?.includes('pink') || catColor?.includes('rose') || catColor?.includes('ec4899')) return 'border-pink-500';

    // Hash fallback
    const colors = ['border-blue-500', 'border-orange-400', 'border-purple-500', 'border-emerald-500', 'border-pink-500'];
    const index = Math.abs(chore.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length;
    return colors[index];
  };

  const getIconBgClass = () => {
    if (isCompleted) return 'bg-emerald-100 text-emerald-800';
    if (isSkipped) return 'bg-amber-100 text-amber-800';
    if (chore.isBounty) return 'bg-amber-100 text-amber-900';
    const borderClass = getBorderColorClass();
    if (borderClass.includes('blue')) return 'bg-blue-100 text-blue-900';
    if (borderClass.includes('purple')) return 'bg-purple-100 text-purple-900';
    if (borderClass.includes('orange')) return 'bg-orange-100 text-orange-900';
    if (borderClass.includes('pink')) return 'bg-pink-100 text-pink-900';
    return 'bg-emerald-100 text-emerald-900';
  };

  const timeBadge = getTimeBadge(chore.timeOfDay);
  const borderClass = getBorderColorClass();
  const iconBg = getIconBgClass();

  const totalSubtasks = chore.subtasks?.length || 0;
  const subtasksDone = isCompleted ? totalSubtasks : completedSteps.length;
  const allSubtasksDone = totalSubtasks > 0 && subtasksDone === totalSubtasks;

  return (
    <div
      id={`chore-card-${chore.id}`}
      className={`group relative bg-white p-5 sm:p-6 rounded-3xl border-b-8 border-r-4 ${borderClass} border-t-2 border-l-2 border-t-slate-100 border-l-slate-100 shadow-sm hover:shadow-md transition-all duration-200 ${
        isCompleted ? 'opacity-75' : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left Side: Icon & Info */}
        <div className="flex items-start gap-4 sm:gap-5 flex-1">
          {/* Chore Icon Box */}
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shrink-0 transition-transform ${iconBg} shadow-2xs group-hover:scale-105`}
          >
            {chore.icon || '⭐'}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {chore.isBounty && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-400 text-amber-950 border border-amber-500 animate-pulse">
                  <Target className="w-3 h-3" />
                  <span>BONUS BOUNTY</span>
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${timeBadge.color}`}
              >
                <span>{timeBadge.icon}</span>
                <span>{timeBadge.label}</span>
              </span>

              {category && (
                <span className="text-[11px] font-extrabold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {category.name}
                </span>
              )}

              {/* Star reward badge */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-pink-100 text-pink-700 border border-pink-300">
                <Star className="w-3 h-3 fill-pink-500 text-pink-500" />
                +{chore.stars + (chore.bountyBonusStars || 0)} Points
              </span>

              {/* Focus timer badge shortcut */}
              {onStartTimer && !isCompleted && !isSkipped && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playTap();
                    onStartTimer(chore);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 transition-colors cursor-pointer"
                  title="Start Interactive Countdown Timer"
                >
                  <Timer className="w-3 h-3 text-indigo-600" />
                  <span>{chore.timerMinutes ? `${chore.timerMinutes}m Timer` : 'Timer'}</span>
                </button>
              )}
            </div>

            <h3
              className={`text-lg sm:text-xl font-black tracking-tight ${
                isCompleted ? 'text-slate-400 line-through decoration-slate-400/80' : 'text-slate-800'
              }`}
            >
              {chore.title}
            </h3>

            {chore.description && (
              <p className={`text-xs sm:text-sm mt-0.5 font-medium leading-relaxed ${isCompleted ? 'text-slate-400' : 'text-slate-500'}`}>
                {chore.description}
              </p>
            )}

            {/* Step-by-Step Checklist (Subtasks) */}
            {chore.subtasks && chore.subtasks.length > 0 && (
              <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between text-[11px] font-black text-slate-600 mb-2">
                  <span className="flex items-center gap-1">
                    <span>📋 Step-by-Step Guide</span>
                  </span>
                  <span className={allSubtasksDone ? 'text-emerald-600 font-extrabold' : 'text-slate-500'}>
                    {subtasksDone} of {totalSubtasks} steps done
                  </span>
                </div>

                <div className="space-y-1.5">
                  {chore.subtasks.map((step, idx) => {
                    const stepDone = isCompleted || completedSteps.includes(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => handleToggleSubtask(idx, e)}
                        disabled={isCompleted}
                        className={`w-full text-left flex items-start gap-2 p-1.5 rounded-xl transition-all text-xs font-medium cursor-pointer ${
                          stepDone
                            ? 'bg-emerald-50 text-emerald-800 font-semibold'
                            : 'hover:bg-white text-slate-700'
                        }`}
                      >
                        <span className="mt-0.5 shrink-0">
                          {stepDone ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </span>
                        <span className={stepDone ? 'line-through decoration-emerald-600/60' : ''}>
                          {step}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Skipped Reason preview if applicable */}
            {isSkipped && log?.skippedReasonCategory && (
              <div className="mt-2.5 p-3 rounded-2xl bg-amber-100/90 border border-amber-300 text-xs text-amber-900">
                <div className="font-extrabold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>Reason Logged: {log.skippedReasonCategory.replace('_', ' ').toUpperCase()}</span>
                </div>
                {log.skippedReason && (
                  <p className="mt-1 text-amber-950 font-medium italic">"{log.skippedReason}"</p>
                )}
              </div>
            )}

            {/* Completed badge details */}
            {isCompleted && log?.completedAt && (
              <div className="mt-1.5 text-xs text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Finished today! +{chore.stars + (chore.bountyBonusStars || 0)} points added</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Action Controls */}
        <div className="w-full sm:w-auto flex items-center justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          {isCompleted ? (
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <span className="text-emerald-500 font-black text-lg sm:text-xl italic tracking-wide">
                DONE!
              </span>
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-xs">
                <Check className="w-7 h-7 stroke-[4]" />
              </div>
              <button
                id={`btn-undo-${chore.id}`}
                onClick={() => {
                  sound.playTap();
                  onUndo(chore.id);
                }}
                className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                title="Undo completion"
              >
                <Undo2 className="w-4 h-4" />
              </button>
            </div>
          ) : isSkipped ? (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                id={`btn-retry-${chore.id}`}
                onClick={handleCompleteClick}
                className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Do it now!</span>
              </button>
              <button
                id={`btn-undo-skip-${chore.id}`}
                onClick={() => {
                  sound.playTap();
                  onUndo(chore.id);
                }}
                className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                title="Clear skipped status"
              >
                <Undo2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
              {/* Skip / Can't complete button */}
              <button
                id={`btn-skip-${chore.id}`}
                onClick={() => {
                  sound.playTap();
                  onOpenSkipModal(chore);
                }}
                className="bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 font-bold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-xs sm:text-sm"
              >
                Can't do it...
              </button>

              {/* Complete Big Vibrant Button */}
              <button
                id={`btn-complete-${chore.id}`}
                onClick={handleCompleteClick}
                className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 active:scale-95 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
                title="Complete Task"
              >
                <Check className="w-7 h-7 stroke-[4]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

