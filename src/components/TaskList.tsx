import React from 'react';
import { Star, CheckCircle2, Circle, Clock, Check } from 'lucide-react';
import { ChoreItem, ChoreLog, ChoreCategory } from '../types';

export interface TaskListProps {
  chores?: ChoreItem[];
  logs?: ChoreLog[];
  categories?: ChoreCategory[];
  onToggleComplete?: (chore: ChoreItem) => void;
  onSelectTask?: (chore: ChoreItem) => void;
  selectedTaskId?: string;
  showCategoryBadge?: boolean;
  emptyMessage?: string;
}

/**
 * TaskList: Renders only the raw list of chore tasks.
 * Avoids any nested page headers, iframes, or full view layouts.
 */
export const TaskList: React.FC<TaskListProps> = ({
  chores = [],
  logs = [],
  categories = [],
  onToggleComplete,
  onSelectTask,
  selectedTaskId,
  showCategoryBadge = true,
  emptyMessage = 'No tasks found.',
}) => {
  const logMap = React.useMemo(() => {
    const map = new Map<string, ChoreLog>();
    logs.forEach((l) => map.set(l.choreId, l));
    return map;
  }, [logs]);

  if (!chores || chores.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 dark:text-slate-400">
        <p className="font-bold text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2.5 divide-y-0" role="list">
      {chores.map((chore) => {
        const isCompleted = logMap.get(chore.id)?.status === 'completed';
        const isSelected = selectedTaskId === chore.id;
        const category = categories.find((c) => c.id === chore.categoryId);
        const starTotal = (Number(chore.stars) || 0) + (Number(chore.bountyBonusStars) || 0);

        return (
          <li
            key={chore.id}
            onClick={() => onSelectTask?.(chore)}
            className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
              isSelected
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 shadow-xs ring-2 ring-amber-300/60'
                : isCompleted
                ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 opacity-80'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-300'
            } ${onSelectTask ? 'cursor-pointer' : ''}`}
          >
            {/* Task Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="text-xl sm:text-2xl shrink-0 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600">
                {chore.icon || '⭐'}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4
                    className={`font-black text-xs sm:text-sm truncate ${
                      isCompleted
                        ? 'line-through text-slate-500 dark:text-slate-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {chore.title}
                  </h4>

                  {/* Star Points Badge */}
                  {starTotal === 0 ? (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                      0 ⭐ (Routine)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-yellow-400 text-slate-950 border border-yellow-300 shadow-2xs">
                      <Star className="w-2.5 h-2.5 fill-current text-slate-950" />
                      +{starTotal} pts
                    </span>
                  )}

                  {showCategoryBadge && category && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {category.name}
                    </span>
                  )}

                  {chore.timerMinutes && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {chore.timerMinutes}m
                    </span>
                  )}
                </div>

                {chore.description && (
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {chore.description}
                  </p>
                )}

                {/* Subtask count if present */}
                {chore.subtasks && chore.subtasks.length > 0 && (
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                    {chore.subtasks.length} checklist steps
                  </p>
                )}
              </div>
            </div>

            {/* Checkbox / Action Button */}
            {onToggleComplete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete(chore);
                }}
                className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                  isCompleted
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-slate-400 hover:text-emerald-600'
                }`}
                title={isCompleted ? 'Mark task incomplete' : 'Mark task complete'}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <Circle className="w-4 h-4 stroke-[2]" />
                )}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
};
