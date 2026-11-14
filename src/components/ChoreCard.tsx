/**
 * ChoreCard — iOS (Reminders-style) chore row.
 *
 * Glass card, circular completion check, one quiet metadata row instead of a
 * wall of badges, and a single clear state: default / done / skipped /
 * expiring / locked. Colors come from the adaptive tokens in
 * src/styles/ios.css, so the card reads on light and dark themes alike.
 * Behavior (time-window lock, bounty claims, reading log, skip passes,
 * subtasks, confetti + sounds) is unchanged.
 */

import React, { useEffect, useState } from 'react';
import {
  Check, Clock, AlertTriangle, Undo2, Star, Lock,
  Hourglass, Timer, Sparkles, MoreHorizontal,
} from 'lucide-react';
import { fireConfetti } from '../utils/confetti';
import { ChoreItem, ChoreLog, ChoreCategory } from '../types';
import { sound } from '../utils/sound';
import { haptic } from '../utils/haptics';
import { ActionMenu } from './ActionMenu';
import { checkChoreTimeWindow } from '../utils/timeWindow';

interface ChoreCardProps {
  chore: ChoreItem;
  category?: ChoreCategory;
  log?: ChoreLog;
  isBirthdayPassAvailable?: boolean;
  onToggleComplete: (chore: ChoreItem) => void;
  onOpenSkipModal: (chore: ChoreItem) => void;
  onUndo: (choreId: string) => void;
  onStartTimer?: (chore: ChoreItem) => void;
  claimedByOtherKidName?: string;
  onOpenReadingLog?: () => void;
  /** 2026 design: compact row inside a grouped list ('row'), or the large wall row ('wall'). */
  variant?: 'card' | 'row' | 'wall';
  /** Row variant: draw the hairline above this row */
  divider?: boolean;
}

export const ChoreCard: React.FC<ChoreCardProps> = React.memo(({
  chore,
  category,
  log,
  isBirthdayPassAvailable = false,
  onToggleComplete,
  onOpenSkipModal,
  onUndo,
  onStartTimer,
  claimedByOtherKidName,
  onOpenReadingLog,
  variant = 'card',
  divider = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const isCompleted = log?.status === 'completed';
  const isSkipped = log?.status === 'skipped';

  const isReadingChore =
    chore?.id === 'chore-6' ||
    (chore?.title || '').toLowerCase().includes('reading') ||
    chore?.icon === '📖';

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showTimeLockAlert, setShowTimeLockAlert] = useState(false);

  // Auto-dismiss the "locked" alert; cleared if the card unmounts first.
  useEffect(() => {
    if (!showTimeLockAlert) return;
    const t = setTimeout(() => setShowTimeLockAlert(false), 5000);
    return () => clearTimeout(t);
  }, [showTimeLockAlert]);

  const timeWindowStatus = checkChoreTimeWindow(chore, category);
  const isTimeLocked = timeWindowStatus.hasRestriction && !timeWindowStatus.isAllowed;
  const isExpiringSoon = !isCompleted && !isSkipped && !isTimeLocked &&
    timeWindowStatus.hasRestriction && timeWindowStatus.isAllowed && timeWindowStatus.isNearingExpiration;
  const isUrgent = isExpiringSoon && !!timeWindowStatus.isUrgentExpiration;
  const isActionable = !isCompleted && !isSkipped;

  const totalSubtasks = chore.subtasks?.length || 0;
  const subtasksDone = isCompleted ? totalSubtasks : completedSteps.length;

  const pts = (Number(chore?.stars) || 0) + (Number(chore?.bountyBonusStars) || 0);

  const handleToggleSubtask = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playTap();
    haptic('selection');
    setCompletedSteps(prev => {
      if (prev.includes(index)) return prev.filter(i => i !== index);
      const next = [...prev, index];
      if (chore.subtasks && next.length === chore.subtasks.length) sound.playStarEarned();
      return next;
    });
  };

  const handleCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompleted) return;
    if (claimedByOtherKidName) { sound.playWarning(); haptic('warning'); return; }
    if (isTimeLocked) {
      sound.playWarning();
      haptic('warning');
      setShowTimeLockAlert(true);
      return;
    }
    if (isReadingChore && onOpenReadingLog) { sound.playTap(); onOpenReadingLog(); return; }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    fireConfetti({
      origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight },
      spread: 50, mode: 'snappy',
    });
    sound.playChoreComplete();
    sound.playStarEarned();
    haptic('success');
    onToggleComplete(chore);
  };

  const cardState = isCompleted
    ? 'opacity-60'
    : isUrgent
    ? 'ring-1 ring-ios-red/50'
    : isExpiringSoon
    ? 'ring-1 ring-ios-orange/45'
    : chore.isBounty
    ? 'ring-1 ring-ios-orange/35'
    : '';

  // Overflow (…) menu — timer, birthday pass, skip.
  const menuItems = [
    ...(onStartTimer ? [{
      id: 'timer',
      label: chore.timerMinutes ? `Start ${chore.timerMinutes}m timer` : 'Start timer',
      icon: <Timer className="w-3.5 h-3.5" />,
      onClick: () => onStartTimer(chore),
    }] : []),
    ...(isBirthdayPassAvailable ? [{
      id: 'birthday-pass',
      label: '🎟️ Use birthday skip pass',
      icon: <Sparkles className="w-3.5 h-3.5" />,
      onClick: () => onOpenSkipModal(chore),
    }] : []),
    {
      id: 'skip',
      label: "Can't do it right now",
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      variant: 'warning' as const,
      onClick: () => onOpenSkipModal(chore),
    },
  ];

  // ── 2026 compact row (mockups KidToday / KioskKid) ──────────────────────
  if (variant !== 'card') {
    const big = variant === 'wall';
    const circle = big ? 44 : 28;
    const metaParts = [
      pts > 0 ? `+${pts} pts` : 'Routine',
      totalSubtasks > 0 ? `${subtasksDone}/${totalSubtasks} steps` : '',
      chore.timerMinutes ? `${chore.timerMinutes} min timer` : '',
      timeWindowStatus.hasRestriction && !isTimeLocked && !isExpiringSoon ? `until ${(timeWindowStatus.formattedRange || '').split(/[–-]/).pop()?.trim()}` : '',
      isReadingChore ? 'log your book' : '',
    ].filter(Boolean);
    const hasDetail = totalSubtasks > 0 || isSkipped || claimedByOtherKidName || (isCompleted && log?.verifiedByLeader) || showTimeLockAlert || isTimeLocked;

    return (
      <div id={`chore-card-${chore.id}`} className={divider ? 'border-t border-[var(--cq-line,var(--separator))]' : ''}>
        <div className={`flex items-center gap-3 ${big ? 'px-5 min-h-[80px] gap-4' : 'px-3.5 min-h-[60px]'} py-2.5`} style={{ opacity: isCompleted ? 0.55 : 1 }}>
          {/* Leading check */}
          {isCompleted ? (
            <button type="button" onClick={(e) => { e.stopPropagation(); sound.playUndo(); onUndo(chore.id); }}
              aria-label={`${chore.title} done. Undo`} title="Undo"
              className="rounded-full flex items-center justify-center shrink-0 cursor-pointer" style={{ width: circle, height: circle, background: 'var(--cq-done, #30D158)', color: 'var(--cq-ground, #0C0E13)' }}>
              <Check className={big ? 'w-6 h-6' : 'w-4 h-4'} strokeWidth={3} />
            </button>
          ) : isTimeLocked || claimedByOtherKidName ? (
            <button type="button" onClick={handleCompleteClick} aria-label={claimedByOtherKidName ? `Claimed by ${claimedByOtherKidName}` : `Locked — opens ${timeWindowStatus.formattedRange}`}
              className="rounded-full flex items-center justify-center shrink-0 cursor-pointer" style={{ width: circle, height: circle, border: '2px solid var(--cq-label-3, #7C8290)', opacity: 0.6 }}>
              <Lock className={big ? 'w-5 h-5' : 'w-3.5 h-3.5'} />
            </button>
          ) : (
            <button type="button" id={`btn-complete-${chore.id}`} onClick={handleCompleteClick}
              aria-label={isReadingChore && onOpenReadingLog ? `Log reading for ${chore.title}` : `Mark ${chore.title} done`}
              className="rounded-full shrink-0 cursor-pointer transition-colors hover:border-[var(--cq-done,#30D158)]"
              style={{ width: circle, height: circle, border: `${big ? 2.5 : 2}px solid var(--cq-label-3, #7C8290)` }} />
          )}

          {/* Title + meta */}
          <button type="button" onClick={() => hasDetail && setExpanded((x) => !x)} aria-expanded={hasDetail ? expanded : undefined}
            className={`flex-1 min-w-0 flex flex-col gap-0.5 text-left ${hasDetail ? 'cursor-pointer' : 'cursor-default'}`}>
            <span className={`${big ? 'text-[22px]' : 'text-[16px]'} font-medium leading-snug ${isCompleted ? 'line-through' : ''} flex items-center gap-2`}>
              {variant === 'row' && <span className="cq-emoji cq-playful-extra text-[18px] leading-none" aria-hidden="true">{chore.icon}</span>}
              <span className="truncate">{chore.title}</span>
            </span>
            <span className={`${big ? 'text-[15px]' : 'text-[13px]'} text-[var(--cq-label-2,var(--label-secondary))] truncate`}>
              {isCompleted ? `Done${pts > 0 ? ` · +${pts} pts` : ''}${log?.verifiedByLeader ? ' · verified' : ''}` : isSkipped ? `Skipped · ${(log?.skippedReasonCategory || '').replace(/_/g, ' ')}` : isTimeLocked ? `Available ${timeWindowStatus.formattedRange}` : claimedByOtherKidName ? `Claimed by ${claimedByOtherKidName}` : metaParts.join(' · ')}
            </span>
          </button>

          {/* Trailing: due pill, timer, birthday pass, more */}
          {isExpiringSoon && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold whitespace-nowrap"
              style={{ background: 'color-mix(in srgb, var(--cq-due, #FFB547) 15%, transparent)', color: isUrgent ? 'var(--cq-danger, #FF6B5E)' : 'var(--cq-due, #FFB547)' }}
              title={`Closes at ${timeWindowStatus.endTimeFormatted}`}>
              <Clock className="w-3 h-3" /> {timeWindowStatus.expirationBadgeText}
            </span>
          )}
          {big && onStartTimer && !isCompleted && !isTimeLocked && (chore.timerMinutes || 0) > 0 && (
            <button type="button" onClick={(e) => { e.stopPropagation(); sound.playTap(); onStartTimer(chore); }}
              className="min-h-[48px] px-4 rounded-full text-[16px] font-semibold flex items-center gap-2 cursor-pointer"
              style={{ background: 'var(--cq-accent-soft, rgba(91,140,255,0.14))', color: 'var(--cq-accent-text, #7FA6FF)' }}>
              <Timer className="w-[18px] h-[18px]" /> Start {chore.timerMinutes} min
            </button>
          )}
          {isBirthdayPassAvailable && isActionable && (
            <button type="button" onClick={(e) => { e.stopPropagation(); sound.playTap(); onOpenSkipModal(chore); }}
              className="ios-tag ios-tag-birthday cursor-pointer" title="Use your birthday skip pass">Skip pass</button>
          )}
          {!isCompleted && (
            <ActionMenu id={`menu-${chore.id}`} label="More" icon={<MoreHorizontal className="w-4 h-4" />} items={menuItems} />
          )}
        </div>

        {/* Details (expand) */}
        {(expanded || showTimeLockAlert) && hasDetail && (
          <div className={`${big ? 'pl-[84px] pr-5' : 'pl-[56px] pr-3.5'} pb-3 flex flex-col gap-1.5`}>
            {showTimeLockAlert && (
              <span role="alert" className="text-[13px]" style={{ color: 'var(--cq-due, #FFB547)' }}>Not yet — this opens {timeWindowStatus.formattedRange}.</span>
            )}
            {isSkipped && log?.skippedReason && <span className="text-[13px] italic text-[var(--cq-label-2)]">“{log.skippedReason}”</span>}
            {isCompleted && log?.verifiedByLeader && <span className="text-[13px] text-[var(--cq-label-2)]">Verified by the family leader{log.leaderNotes ? ` · “${log.leaderNotes}”` : ''}</span>}
            {totalSubtasks > 0 && chore.subtasks!.map((step, idx) => {
              const done = isCompleted || completedSteps.includes(idx);
              return (
                <button key={idx} type="button" role="checkbox" aria-checked={done} disabled={isCompleted}
                  onClick={(e) => handleToggleSubtask(idx, e)}
                  className="flex items-center gap-2.5 min-h-[36px] text-left text-[14px] cursor-pointer disabled:cursor-default">
                  <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0"
                    style={done ? { background: 'var(--cq-done, #30D158)', color: 'var(--cq-ground, #0C0E13)' } : { border: '1.5px solid var(--cq-label-3, #7C8290)' }}>
                    {done && <Check className="w-3 h-3" strokeWidth={3} />}
                  </span>
                  <span className={done ? 'line-through text-[var(--cq-label-3)]' : ''}>{step}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      id={`chore-card-${chore.id}`}
      className={`glass rounded-[20px] p-4 transition-[opacity,box-shadow] duration-300 ${cardState}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          aria-hidden="true"
          className={`cq-emoji w-11 h-11 rounded-[12px] flex items-center justify-center text-2xl shrink-0 ${
            isCompleted ? 'bg-ios-green/12 grayscale-[40%]' : chore.isBounty ? 'bg-ios-orange/15' : 'bg-fill'
          }`}
        >
          {chore.icon || '⭐'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-[17px] font-semibold leading-[22px] tracking-[-0.41px] ${
            isCompleted ? 'text-label-tertiary line-through decoration-label-tertiary' : 'text-label'
          }`}>
            {chore.title}
          </p>

          {chore.description && (
            <p className={`text-[15px] leading-5 tracking-[-0.24px] mt-0.5 ${
              isCompleted ? 'text-label-tertiary' : 'text-label-secondary'
            }`}>
              {chore.description}
            </p>
          )}

          {/* Metadata row */}
          {!isCompleted && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {chore.isBounty && <span className="ios-tag ios-tag-bounty">🤠 Bounty</span>}
              {pts > 0 ? (
                <span className="ios-tag">
                  <Star className="w-3 h-3 fill-ios-yellow text-ios-yellow" aria-hidden="true" />
                  +{pts} pts
                </span>
              ) : (
                <span className="ios-tag">Routine · 0 pts</span>
              )}
              {category?.name && <span className="ios-tag">{category.name}</span>}
              {timeWindowStatus.hasRestriction && !isTimeLocked && !isExpiringSoon && (
                <span className="ios-tag ios-tag-green" title={timeWindowStatus.message}>
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  {timeWindowStatus.formattedRange}
                </span>
              )}
              {onStartTimer && isActionable && (
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); sound.playTap(); onStartTimer(chore); }}
                  className="ios-tag ios-tag-blue cursor-pointer hover:opacity-80 active:scale-95 transition"
                  title="Start countdown timer"
                >
                  <Timer className="w-3 h-3" aria-hidden="true" />
                  {chore.timerMinutes ? `${chore.timerMinutes}m` : 'Timer'}
                </button>
              )}
              {isBirthdayPassAvailable && isActionable && (
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); sound.playTap(); onOpenSkipModal(chore); }}
                  className="ios-tag ios-tag-birthday cursor-pointer active:scale-95 transition"
                  title="Use your 1-time free birthday chore skip pass"
                >
                  🎟️ Birthday skip pass
                </button>
              )}
            </div>
          )}

          {isCompleted && (
            <p className="text-[13px] text-ios-green mt-1 font-medium">
              Done{pts > 0 ? ` · +${pts} pts` : ' · routine'}
            </p>
          )}

          {isSkipped && log?.skippedReasonCategory && (
            <div className="ios-callout ios-callout-yellow flex-col items-start gap-0.5">
              <span>Skipped · {log.skippedReasonCategory.replace(/_/g, ' ')}</span>
              {log.skippedReason && (
                <span className="text-[12px] text-label-secondary italic font-normal">"{log.skippedReason}"</span>
              )}
            </div>
          )}

          {isTimeLocked && !isCompleted && !showTimeLockAlert && (
            <div className="ios-callout ios-callout-orange">
              <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Available {timeWindowStatus.formattedRange}</span>
            </div>
          )}

          {isExpiringSoon && (
            <div
              className={`ios-callout ${isUrgent ? 'ios-callout-red' : 'ios-callout-orange'}`}
              title={`Closes at ${timeWindowStatus.endTimeFormatted} (${timeWindowStatus.minutesRemaining}m remaining)`}
            >
              <Hourglass className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{isUrgent ? 'Closing soon' : 'Expiring soon'} · {timeWindowStatus.expirationBadgeText}</span>
            </div>
          )}

          {showTimeLockAlert && (
            <div role="alert" className="ios-callout ios-callout-orange justify-between">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                Not yet! Available {timeWindowStatus.formattedRange}
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowTimeLockAlert(false); }}
                className="text-[13px] font-semibold px-2.5 py-1 rounded-full bg-ios-orange/15 cursor-pointer"
              >
                OK
              </button>
            </div>
          )}

          {claimedByOtherKidName && (
            <div className="ios-callout ios-callout-orange">
              <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Claimed by {claimedByOtherKidName}</span>
            </div>
          )}

          {isCompleted && log?.verifiedByLeader && (
            <div className="ios-callout ios-callout-yellow">
              <span aria-hidden="true">🎖️</span>
              <span>Verified by family leader</span>
              {log.leaderNotes && (
                <span className="text-[12px] text-label-secondary italic font-normal truncate ml-auto max-w-[160px]">"{log.leaderNotes}"</span>
              )}
            </div>
          )}
        </div>

        {/* Trailing actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isCompleted ? (
            <>
              <ActionMenu
                id={`menu-done-${chore.id}`}
                label="More"
                icon={<MoreHorizontal className="w-4 h-4" />}
                items={[{ id: 'undo', label: 'Undo', icon: <Undo2 className="w-3.5 h-3.5" />, variant: 'warning' as const, onClick: () => onUndo(chore.id) }]}
              />
              <div className="check-circle check-circle-done" role="img" aria-label="Completed">
                <Check className="w-4 h-4 text-white stroke-[3]" />
              </div>
            </>
          ) : (
            <>
              <ActionMenu
                id={`menu-${chore.id}`}
                label="More"
                icon={<MoreHorizontal className="w-4 h-4" />}
                items={menuItems}
              />
              {isSkipped ? (
                <button
                  type="button"
                  onClick={handleCompleteClick}
                  className={`btn-ios btn-ios-sm ${isTimeLocked ? 'bg-ios-orange/15 text-ios-orange' : 'btn-ios-tinted'}`}
                >
                  {isTimeLocked ? <Lock className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{isTimeLocked ? 'Locked' : 'Do it'}</span>
                </button>
              ) : claimedByOtherKidName ? (
                <button
                  type="button"
                  onClick={handleCompleteClick}
                  aria-label={`Claimed by ${claimedByOtherKidName}`}
                  className="check-circle check-circle-empty opacity-40 cursor-not-allowed"
                >
                  <Lock className="w-3.5 h-3.5 text-label-secondary" />
                </button>
              ) : isTimeLocked ? (
                <button
                  type="button"
                  onClick={handleCompleteClick}
                  aria-label={`Locked — available ${timeWindowStatus.formattedRange}`}
                  className="check-circle bg-ios-orange/15"
                >
                  <Lock className="w-3.5 h-3.5 text-ios-orange" />
                </button>
              ) : isReadingChore && onOpenReadingLog ? (
                <button
                  type="button"
                  onClick={handleCompleteClick}
                  className="btn-ios btn-ios-sm bg-ios-orange text-white"
                >
                  Log 📖
                </button>
              ) : (
                <button
                  type="button"
                  id={`btn-complete-${chore.id}`}
                  onClick={handleCompleteClick}
                  className="check-circle check-circle-empty"
                  aria-label={`Mark "${chore.title}" complete`}
                  title="Mark complete"
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Subtasks */}
      {totalSubtasks > 0 && (
        <div className="mt-3 pt-3 border-t border-separator">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[13px] text-label-secondary uppercase tracking-[-0.08px]">Steps</span>
            <span className={`text-[13px] font-semibold tabular-nums ${subtasksDone === totalSubtasks ? 'text-ios-green' : 'text-label-secondary'}`}>
              {subtasksDone} of {totalSubtasks}
            </span>
          </div>
          <ul className="space-y-0.5">
            {chore.subtasks!.map((step, idx) => {
              const done = isCompleted || completedSteps.includes(idx);
              return (
                <li key={idx}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={done}
                    onClick={e => handleToggleSubtask(idx, e)}
                    disabled={isCompleted}
                    className="w-full min-h-[44px] text-left flex items-center gap-3 px-2 py-2 rounded-[10px] transition-colors text-[15px] cursor-pointer hover:bg-fill disabled:cursor-default disabled:hover:bg-transparent"
                  >
                    <span
                      aria-hidden="true"
                      className={`w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        done ? 'bg-ios-green' : 'border-[1.5px] border-label-tertiary'
                      }`}
                    >
                      {done && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </span>
                    <span className={done ? 'text-label-tertiary line-through' : 'text-label'}>{step}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Reading log entries */}
      {isReadingChore && isCompleted && log?.completedSubtasks && log.completedSubtasks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-separator">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[13px] text-label-secondary uppercase">📖 Reading log</span>
            {onOpenReadingLog && (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onOpenReadingLog(); }}
                className="text-[15px] text-ios-blue font-medium cursor-pointer min-h-[44px] -my-3"
              >
                View journal
              </button>
            )}
          </div>
          {log.completedSubtasks.map((s, i) => (
            <p key={i} className="text-[15px] text-label-secondary">{s}</p>
          ))}
        </div>
      )}
    </div>
  );
});
