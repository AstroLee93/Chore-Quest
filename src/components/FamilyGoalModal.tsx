import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Sparkles,
  Target,
  Plus,
  Check,
  RotateCcw,
  Trash2,
  Lock,
  Unlock,
  ChevronRight,
  Gift,
  Flame,
  Award,
  X,
  Edit3,
  CheckCircle2,
  Calendar,
  Compass,
} from 'lucide-react';
import { fireConfetti } from '../utils/confetti';
import { FamilyDatabase, FamilyGoal } from '../types';
import {
  DEFAULT_FAMILY_GOAL_PRESETS,
  getFamilyWeeklyGoalProgress,
  getTodayDateString,
  formatDateDisplay,
} from '../utils/storage';
import { sound } from '../utils/sound';
import { EmojiPicker } from './EmojiPicker';

interface FamilyGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: FamilyDatabase;
  onUpdateDatabase: (updated: FamilyDatabase) => void;
  isParentMode?: boolean;
}

const EMOJI_PALETTE = [
  '🍕', '🍦', '🍨', '🥞', '🍔', '🌮', '🍿', '🍫', '🍩',
  '🎡', '🎢', '🏖️', '🏕️', '🏊', '🎳', '🎲', '🎮', '🎬',
  '🎯', '🎠', '🎪', '🚀', '🏰', '🏆', '🎁', '⭐', '🌟',
  '🎨', '🐾', '🚲', '⛺', '🦖', '🦄', '🏖️', '🎳', '⛸️'
];

export const FamilyGoalModal: React.FC<FamilyGoalModalProps> = ({
  isOpen,
  onClose,
  database,
  onUpdateDatabase,
  isParentMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'presets' | 'saved' | 'custom'>('current');
  const [parentUnlocked, setParentUnlocked] = useState<boolean>(isParentMode);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [showPinPrompt, setShowPinPrompt] = useState<boolean>(false);
  const [pendingGoalAction, setPendingGoalAction] = useState<(() => void) | null>(null);

  // Custom Goal Form State
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customReward, setCustomReward] = useState<string>('');
  const [customIcon, setCustomIcon] = useState<string>('🍕');
  const [customTarget, setCustomTarget] = useState<number>(30);
  const [resetWeekProgress, setResetWeekProgress] = useState<boolean>(false);
  const [saveToLibrary, setSaveToLibrary] = useState<boolean>(true);
  const [formError, setFormError] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string>('');

  const todayStr = getTodayDateString();
  const currentGoal = database.familyGoal || {
    title: 'Friday Family Pizza & Movie Night',
    reward: 'Giant Pepperoni Pizza + Choose Any Movie! 🍕🎬',
    icon: '🍕',
    targetChoreCount: 35,
    weekStartDate: todayStr,
    isActive: true,
  };

  const { completedCount, target, percent, isReached, remaining } =
    getFamilyWeeklyGoalProgress(database);

  // Sync unlocked state if isParentMode changes
  useEffect(() => {
    if (isParentMode) {
      setParentUnlocked(true);
    }
  }, [isParentMode]);

  // Reset errors and forms on open
  useEffect(() => {
    if (isOpen) {
      setFormError('');
      setPinError('');
      setSuccessToast('');
      setShowPinPrompt(false);
      setPendingGoalAction(null);
      // Pre-fill custom form with current goal values
      setCustomTitle(currentGoal.title);
      setCustomReward(currentGoal.reward);
      setCustomIcon(currentGoal.icon || '🍕');
      setCustomTarget(currentGoal.targetChoreCount || 30);
      setResetWeekProgress(false);
    }
  }, [isOpen, currentGoal.title, currentGoal.reward, currentGoal.icon, currentGoal.targetChoreCount]);

  if (!isOpen) return null;

  // PIN check helper
  const requireAdminAction = (action: () => void) => {
    if (parentUnlocked || isParentMode) {
      action();
    } else {
      setPendingGoalAction(() => action);
      setShowPinPrompt(true);
      setPinInput('');
      setPinError('');
    }
  };

  const handleVerifyPin = () => {
    const parentPin = database.settings.parentPin || '1234';
    if (pinInput === parentPin) {
      sound.playUnlock();
      setParentUnlocked(true);
      setShowPinPrompt(false);
      setPinError('');
      if (pendingGoalAction) {
        pendingGoalAction();
        setPendingGoalAction(null);
      }
    } else {
      sound.playSkipNotice();
      setPinError('Incorrect PIN. Please try again.');
      setPinInput('');
    }
  };

  // Switch to a Preset or Saved Goal
  const handleSelectGoal = (
    goalTemplate: { title: string; reward: string; icon: string; targetChoreCount: number; id?: string },
    resetProgress: boolean = false
  ) => {
    requireAdminAction(() => {
      sound.playStarEarned();
      fireConfetti({
        origin: { y: 0.5 },
        mode: 'snappy',
      });

      const updatedGoal: FamilyGoal = {
        id: goalTemplate.id || `goal-${Date.now()}`,
        title: goalTemplate.title,
        reward: goalTemplate.reward,
        icon: goalTemplate.icon,
        targetChoreCount: goalTemplate.targetChoreCount,
        weekStartDate: resetProgress ? todayStr : currentGoal.weekStartDate || todayStr,
        isActive: true,
      };

      onUpdateDatabase({
        ...database,
        familyGoal: updatedGoal,
      });

      setSuccessToast(`🎉 Active Family Goal set to "${goalTemplate.title}"!`);
      setTimeout(() => setSuccessToast(''), 4000);
      setActiveTab('current');
    });
  };

  // Save / Apply Custom Goal
  const handleSaveCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) {
      setFormError('Please enter a goal title.');
      return;
    }
    if (!customReward.trim()) {
      setFormError('Please describe the fun reward your family will earn.');
      return;
    }

    requireAdminAction(() => {
      sound.playStarEarned();
      fireConfetti({
        origin: { y: 0.5 },
        mode: 'snappy',
      });

      const newGoalId = `custom-goal-${Date.now()}`;
      const newGoal: FamilyGoal = {
        id: newGoalId,
        title: customTitle.trim(),
        reward: customReward.trim(),
        icon: customIcon,
        targetChoreCount: Number(customTarget) || 30,
        weekStartDate: resetWeekProgress ? todayStr : currentGoal.weekStartDate || todayStr,
        isActive: true,
      };

      let updatedSaved = [...(database.savedFamilyGoals || [])];
      if (saveToLibrary) {
        // Add if not already matching title
        if (!updatedSaved.some((g) => g.title.toLowerCase() === newGoal.title.toLowerCase())) {
          updatedSaved.push(newGoal);
        }
      }

      onUpdateDatabase({
        ...database,
        familyGoal: newGoal,
        savedFamilyGoals: updatedSaved,
      });

      setSuccessToast(`🎉 Custom Family Goal "${newGoal.title}" activated!`);
      setTimeout(() => setSuccessToast(''), 4000);
      setActiveTab('current');
    });
  };

  // Reset weekly progress to 0 (starts fresh week from today)
  const handleResetWeekProgress = () => {
    requireAdminAction(() => {
      if (confirm('Start a fresh new week for this goal today? Completed chore count will start from 0 for this new period.')) {
        sound.playTap();
        const updatedGoal: FamilyGoal = {
          ...currentGoal,
          weekStartDate: todayStr,
        };
        onUpdateDatabase({
          ...database,
          familyGoal: updatedGoal,
        });
        setSuccessToast('🔄 New week started! Chore count reset to 0.');
        setTimeout(() => setSuccessToast(''), 3000);
      }
    });
  };

  // Adjust target chore count (+ / -)
  const handleAdjustTarget = (delta: number) => {
    requireAdminAction(() => {
      sound.playTap();
      const newTarget = Math.max(5, Math.min(100, (currentGoal.targetChoreCount || 30) + delta));
      const updatedGoal: FamilyGoal = {
        ...currentGoal,
        targetChoreCount: newTarget,
      };
      onUpdateDatabase({
        ...database,
        familyGoal: updatedGoal,
      });
    });
  };

  // Delete saved custom goal
  const handleDeleteSavedGoal = (goalId?: string) => {
    if (!goalId) return;
    requireAdminAction(() => {
      sound.playTap();
      if (confirm('Remove this saved goal from your library?')) {
        const updatedSaved = (database.savedFamilyGoals || []).filter((g) => g.id !== goalId);
        onUpdateDatabase({
          ...database,
          savedFamilyGoals: updatedSaved,
        });
      }
    });
  };

  const handleCelebrate = () => {
    sound.playLevelUp();
    fireConfetti({
      origin: { y: 0.4 },
      mode: 'celebration',
    });
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-70 flex items-center justify-center p-1 sm:p-5 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-yellow-50 rounded-2xl sm:rounded-[2.5rem] p-3 sm:p-7 max-w-3xl w-full shadow-2xl border-2 sm:border-4 border-yellow-300 max-h-[96vh] sm:max-h-[92vh] flex flex-col my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 sm:pb-4 border-b-2 border-yellow-200/80 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-400 border-2 border-amber-300 flex items-center justify-center text-xl sm:text-2xl shadow-inner transform -rotate-3 shrink-0">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 border border-amber-300">
                  Shared Teamwork Mission
                </span>
                {parentUnlocked ? (
                  <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <Unlock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600" />
                    Admin Unlocked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-500" />
                    Parent PIN Protected
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight">
                Weekly Family Teamwork Goal
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-yellow-200/80 hover:bg-yellow-300 border-2 border-yellow-300 flex items-center justify-center text-slate-700 font-bold transition-all active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="mt-2 sm:mt-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-emerald-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-between shadow-md animate-bounce">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>{successToast}</span>
            </div>
            <button
              onClick={() => setSuccessToast('')}
              className="text-white/80 hover:text-white font-bold text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-yellow-200/60 border border-yellow-300 mt-2.5 sm:mt-4 overflow-x-auto shrink-0">
          {[
            { id: 'current', label: 'Active Goal & Progress', icon: Target },
            { id: 'presets', label: 'Alternative Ideas', icon: Compass },
            { id: 'saved', label: `Saved (${(database.savedFamilyGoals || []).length})`, icon: Trophy },
            { id: 'custom', label: 'Custom Goal', icon: Plus },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playTap();
                  setActiveTab(tab.id as typeof activeTab);
                }}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-900 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-yellow-300/60'
                }`}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4 stroke-[2.5]" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-2.5 sm:py-4 space-y-3 sm:space-y-4">
          {/* TAB 1: CURRENT ACTIVE GOAL */}
          {activeTab === 'current' && (
            <div className="space-y-4 animate-fade-in">
              {/* Highlight Hero Card */}
              <div
                className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 border-3 transition-all ${
                  isReached
                    ? 'bg-gradient-to-br from-amber-100 via-yellow-100 to-emerald-100 border-amber-400 shadow-lg ring-2 ring-amber-400/50'
                    : 'bg-white border-amber-200 shadow-md'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      onClick={isReached ? handleCelebrate : undefined}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl shadow-md border-2 border-amber-300 shrink-0 ${
                        isReached
                          ? 'bg-amber-400 text-yellow-950 animate-bounce cursor-pointer'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {currentGoal.icon || '🏆'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-900 text-yellow-300">
                          Active Family Mission
                        </span>
                        {isReached && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white animate-pulse">
                            <Sparkles className="w-3 h-3" />
                            Target Reached!
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg sm:text-2xl font-black text-slate-900 mt-1">
                        {currentGoal.title}
                      </h3>

                      <p className="text-xs sm:text-sm font-bold text-slate-700 mt-0.5">
                        🎁 <span className="text-pink-600 font-extrabold">{currentGoal.reward}</span>
                      </p>
                    </div>
                  </div>

                  {isReached && (
                    <button
                      onClick={handleCelebrate}
                      className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-yellow-950 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Celebrate! 🎉</span>
                    </button>
                  )}
                </div>

                {/* Progress Bar & Stats */}
                <div className="mt-5 pt-4 border-t border-amber-200/80">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-black mb-2">
                    <span className="text-slate-700">
                      {isReached
                        ? '🎉 Target Achieved! Time for the family reward!'
                        : `${remaining} more chores to unlock the reward!`}
                    </span>
                    <span className="text-indigo-950 font-black text-sm sm:text-base">
                      {completedCount} / {target} ({percent}%)
                    </span>
                  </div>

                  <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isReached
                          ? 'bg-gradient-to-r from-amber-400 via-pink-400 to-emerald-400'
                          : 'bg-gradient-to-r from-amber-400 to-pink-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-[11px] font-bold text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Week Tracking Since: {formatDateDisplay(currentGoal.weekStartDate || todayStr)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAdjustTarget(-5)}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                        title="Lower target by 5 chores"
                      >
                        -5 Target
                      </button>
                      <button
                        onClick={() => handleAdjustTarget(5)}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                        title="Increase target by 5 chores"
                      >
                        +5 Target
                      </button>
                      <button
                        onClick={handleResetWeekProgress}
                        className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold flex items-center gap-1 cursor-pointer"
                        title="Start a fresh new week starting today"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Start Fresh Week</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    sound.playTap();
                    setActiveTab('presets');
                  }}
                  className="p-3.5 rounded-2xl bg-white hover:bg-yellow-100/50 border-2 border-yellow-300 text-left transition-all shadow-2xs hover:shadow-sm cursor-pointer"
                >
                  <div className="text-xl mb-1">🧭</div>
                  <div className="text-xs font-black text-slate-900">Explore Alternatives</div>
                  <div className="text-[11px] font-semibold text-slate-500">
                    Choose from 10 popular ideas
                  </div>
                </button>

                <button
                  onClick={() => {
                    sound.playTap();
                    setActiveTab('custom');
                  }}
                  className="p-3.5 rounded-2xl bg-white hover:bg-yellow-100/50 border-2 border-yellow-300 text-left transition-all shadow-2xs hover:shadow-sm cursor-pointer"
                >
                  <div className="text-xl mb-1">✨</div>
                  <div className="text-xs font-black text-slate-900">Create Custom Goal</div>
                  <div className="text-[11px] font-semibold text-slate-500">
                    Set your own reward & target
                  </div>
                </button>

                <button
                  onClick={() => {
                    sound.playTap();
                    setActiveTab('saved');
                  }}
                  className="p-3.5 rounded-2xl bg-white hover:bg-yellow-100/50 border-2 border-yellow-300 text-left transition-all shadow-2xs hover:shadow-sm cursor-pointer"
                >
                  <div className="text-xl mb-1">📚</div>
                  <div className="text-xs font-black text-slate-900">Saved Goals Library</div>
                  <div className="text-[11px] font-semibold text-slate-500">
                    Rotate through saved favorites
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: POPULAR ALTERNATIVE GOAL IDEAS */}
          {activeTab === 'presets' && (
            <div className="space-y-3 animate-fade-in">
              <div className="p-3 rounded-2xl bg-amber-100/70 border border-amber-200 text-xs text-amber-950 font-bold flex items-center justify-between">
                <span>💡 Click <strong>"Select This Goal"</strong> on any option to activate it for your family:</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 px-2 py-0.5 rounded-full">
                  10 Preset Ideas
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DEFAULT_FAMILY_GOAL_PRESETS.map((preset) => {
                  const isCurrent = currentGoal.title.toLowerCase() === preset.title.toLowerCase();
                  return (
                    <div
                      key={preset.id}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 ${
                        isCurrent
                          ? 'bg-amber-100/80 border-amber-400 ring-2 ring-amber-400/40 shadow-sm'
                          : 'bg-white border-yellow-200 hover:border-yellow-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-yellow-100 border border-yellow-300 flex items-center justify-center text-2xl shrink-0">
                          {preset.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-slate-900 text-sm truncate">
                              {preset.title}
                            </h4>
                            {isCurrent && (
                              <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-indigo-900 text-yellow-300 uppercase">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-slate-600 mt-0.5 line-clamp-2">
                            🎁 {preset.reward}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="font-extrabold text-indigo-950 flex items-center gap-1">
                          <Target className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{preset.targetChoreCount} chores target</span>
                        </span>

                        <button
                          onClick={() => handleSelectGoal(preset)}
                          disabled={isCurrent}
                          className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                            isCurrent
                              ? 'bg-emerald-500 text-white cursor-default'
                              : 'bg-indigo-900 hover:bg-indigo-800 text-yellow-300 shadow-2xs active:scale-95'
                          }`}
                        >
                          {isCurrent ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Current Active</span>
                            </>
                          ) : (
                            <>
                              <span>Select Goal</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SAVED CUSTOM GOALS LIBRARY */}
          {activeTab === 'saved' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-yellow-100/70 border border-yellow-200 text-xs font-bold text-slate-700">
                <span>📚 Custom and saved goals created by parents:</span>
                <button
                  onClick={() => {
                    sound.playTap();
                    setActiveTab('custom');
                  }}
                  className="px-3 py-1 rounded-xl bg-indigo-900 text-yellow-300 text-xs font-black flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Custom Goal</span>
                </button>
              </div>

              {(!database.savedFamilyGoals || database.savedFamilyGoals.length === 0) ? (
                <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-yellow-300">
                  <div className="text-4xl mb-2">🎁</div>
                  <h4 className="font-black text-slate-800 text-base">No custom goals saved yet</h4>
                  <p className="text-xs text-slate-500 font-bold mt-1 max-w-sm mx-auto">
                    Create custom family milestones like weekend camping trips, water park passes, or movie nights.
                  </p>
                  <button
                    onClick={() => {
                      sound.playTap();
                      setActiveTab('custom');
                    }}
                    className="mt-4 px-4 py-2 rounded-2xl bg-indigo-900 text-yellow-300 font-black text-xs cursor-pointer shadow-md"
                  >
                    + Create Your First Custom Goal
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {database.savedFamilyGoals.map((saved) => {
                    const isCurrent = currentGoal.title.toLowerCase() === saved.title.toLowerCase();
                    return (
                      <div
                        key={saved.id || saved.title}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 ${
                          isCurrent
                            ? 'bg-amber-100/80 border-amber-400 ring-2 ring-amber-400/40 shadow-sm'
                            : 'bg-white border-yellow-200 hover:border-yellow-300 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-yellow-100 border border-yellow-300 flex items-center justify-center text-2xl shrink-0">
                            {saved.icon || '🏆'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-slate-900 text-sm truncate">
                                {saved.title}
                              </h4>
                              {isCurrent && (
                                <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-indigo-900 text-yellow-300 uppercase">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-slate-600 mt-0.5 line-clamp-2">
                              🎁 {saved.reward}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <span className="font-extrabold text-indigo-950 flex items-center gap-1">
                            <Target className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{saved.targetChoreCount} chores target</span>
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDeleteSavedGoal(saved.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                              title="Delete from saved library"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleSelectGoal(saved)}
                              disabled={isCurrent}
                              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                                isCurrent
                                  ? 'bg-emerald-500 text-white cursor-default'
                                  : 'bg-indigo-900 hover:bg-indigo-800 text-yellow-300 shadow-2xs active:scale-95'
                              }`}
                            >
                              {isCurrent ? (
                                <>
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>Active</span>
                                </>
                              ) : (
                                <>
                                  <span>Activate Goal</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CREATE / EDIT CUSTOM GOAL */}
          {activeTab === 'custom' && (
            <form onSubmit={handleSaveCustomGoal} className="space-y-4 animate-fade-in">
              <div className="bg-white p-5 rounded-3xl border-2 border-yellow-200 shadow-sm space-y-4">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-100 text-rose-900 text-xs font-bold border border-rose-300">
                    ⚠️ {formError}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Goal Mission Title *
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g., Saturday Zoo & Petting Safari Trip"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-yellow-200 focus:border-indigo-500 focus:bg-white text-slate-800 font-bold text-sm outline-hidden transition-all"
                  />
                </div>

                {/* Reward Description */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Family Reward & Treats *
                  </label>
                  <input
                    type="text"
                    value={customReward}
                    onChange={(e) => setCustomReward(e.target.value)}
                    placeholder="e.g., Zoo tickets + animal feeding + giant fruit slushies! 🦁🥤"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-yellow-200 focus:border-indigo-500 focus:bg-white text-slate-800 font-bold text-sm outline-hidden transition-all"
                  />
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Choose an Emoji Icon
                  </label>
                  <EmojiPicker
                    value={customIcon}
                    onChange={(emoji) => setCustomIcon(emoji)}
                    title="Choose Family Goal Icon"
                    categoryFilter="all"
                  />
                </div>

                {/* Target Chore Count */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Target Chores to Complete
                    </label>
                    <span className="text-sm font-black text-indigo-950 bg-yellow-200 px-3 py-0.5 rounded-full">
                      {customTarget} Chores
                    </span>
                  </div>

                  <input
                    type="range"
                    min="5"
                    max="80"
                    step="5"
                    value={customTarget}
                    onChange={(e) => setCustomTarget(Number(e.target.value))}
                    className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />

                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
                    <span>5 (Easy Weekend)</span>
                    <span>30 (Standard Family)</span>
                    <span>50 (Big Quest)</span>
                    <span>80 (Master Squad)</span>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-bold text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resetWeekProgress}
                      onChange={(e) => setResetWeekProgress(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500"
                    />
                    <span>Start fresh count from today (Reset progress to 0)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveToLibrary}
                      onChange={(e) => setSaveToLibrary(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500"
                    />
                    <span>Save to Custom Goals Library for future weeks</span>
                  </label>
                </div>
              </div>

              {/* Submit button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('current')}
                  className="px-4 py-2.5 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-yellow-300 font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Save & Activate Goal</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* PIN Prompt Dialog (if locked) */}
        {showPinPrompt && (
          <div className="fixed inset-0 z-80 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
            <div className="bg-yellow-50 rounded-3xl p-6 max-w-sm w-full border-4 border-yellow-300 shadow-2xl text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
                🔒
              </div>
              <h3 className="text-lg font-black text-slate-900">Parent PIN Required</h3>
              <p className="text-xs font-bold text-slate-600 mt-1 mb-4">
                Please enter your 4-digit Parent PIN to update or customize the Family Teamwork Goal.
              </p>

              {pinError && (
                <div className="p-2 rounded-xl bg-rose-100 text-rose-900 text-xs font-black mb-3 border border-rose-300">
                  {pinError}
                </div>
              )}

              <input
                type="password"
                maxLength={4}
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-36 text-center text-2xl font-mono tracking-widest px-4 py-2.5 rounded-2xl border-2 border-yellow-300 focus:border-indigo-600 bg-white mb-4 outline-hidden"
              />

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    setShowPinPrompt(false);
                    setPendingGoalAction(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyPin}
                  className="px-5 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-yellow-300 font-black text-xs cursor-pointer shadow-md"
                >
                  Unlock & Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
