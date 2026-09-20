import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain,
  Sparkles,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  X,
  Star,
  GraduationCap,
  Award,
  BookOpen,
  Lock,
  Shield,
  Check,
} from 'lucide-react';
import { KidProfile, FamilyDatabase, GradeLevel } from '../types';
import {
  BrainTeaser,
  GRADE_LEVELS,
  GRADE_LEVEL_LIST,
  getGradeLevelInfo,
  getDailyTeaserForKid,
  getNextTeaser,
  getTeasersForGrade,
  hasCompletedDailyTeaser,
  DEFAULT_BRAIN_TEASER_REWARD_STARS,
  DEFAULT_BRAIN_TEASER_DAILY_LIMIT,
  getDailyTeasersAnsweredToday,
  hasReachedDailyTeaserLimit,
} from '../utils/brainTeasers';
import { sound } from '../utils/sound';
import { getTodayDateString } from '../utils/storage';

interface BrainTeaserModalProps {
  isOpen: boolean;
  onClose: () => void;
  kid: KidProfile | null;
  database: FamilyDatabase;
  onUpdateDatabase: (newDb: FamilyDatabase) => void;
  isAdminPreview?: boolean;
}

export const BrainTeaserModal: React.FC<BrainTeaserModalProps> = ({
  isOpen,
  onClose,
  kid,
  database,
  onUpdateDatabase,
  isAdminPreview = false,
}) => {
  const currentKid = kid || database.kids[0] || null;
  const currentGrade: GradeLevel = currentKid?.gradeLevel || '1st_grade';

  const [activeGrade, setActiveGrade] = useState<GradeLevel>(currentGrade);
  const [currentTeaser, setCurrentTeaser] = useState<BrainTeaser>(() => {
    if (currentKid) {
      return getDailyTeaserForKid(currentKid);
    }
    return getTeasersForGrade('1st_grade')[0];
  });

  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [earnedStarsToast, setEarnedStarsToast] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  const dailyLimit = database.settings.brainTeaserDailyLimit ?? DEFAULT_BRAIN_TEASER_DAILY_LIMIT;
  const rewardStars = database.settings.brainTeaserRewardStars ?? DEFAULT_BRAIN_TEASER_REWARD_STARS;
  const todayStr = getTodayDateString();
  const answeredToday = currentKid ? getDailyTeasersAnsweredToday(currentKid, todayStr) : 0;
  const isLimitReachedInitially = !isAdminPreview && answeredToday >= dailyLimit;

  // Sync with kid's grade and question index whenever kid changes or modal opens
  useEffect(() => {
    if (isOpen && currentKid) {
      // Kids are locked to their assigned grade level
      const grade = currentKid.gradeLevel || '1st_grade';
      setActiveGrade(grade);
      const answered = getDailyTeasersAnsweredToday(currentKid, todayStr);
      // Serve the next unanswered daily challenge index
      setCurrentTeaser(getDailyTeaserForKid(currentKid, todayStr, answered));
      resetQuestionState();
    }
  }, [isOpen, currentKid?.id]);

  const resetQuestionState = () => {
    setSelectedOptionIndex(null);
    setIsAnswerSubmitted(false);
    setIsCorrect(false);
    setShowHint(false);
    setEarnedStarsToast(null);
    setShowConfetti(false);
  };

  const gradeInfo = getGradeLevelInfo(activeGrade);

  const handleSelectGrade = (newGrade: GradeLevel) => {
    // Prevent kids from changing their grade level to ensure educational appropriateness
    if (!isAdminPreview) return;
    sound.playTap();
    setActiveGrade(newGrade);
    const available = getTeasersForGrade(newGrade);
    setCurrentTeaser(available[0]);
    resetQuestionState();
  };

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted && isCorrect) return;
    sound.playTap();
    setSelectedOptionIndex(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOptionIndex === null) return;

    const correct = selectedOptionIndex === currentTeaser.correctAnswerIndex;
    setIsAnswerSubmitted(true);
    setIsCorrect(correct);

    if (correct) {
      sound.playRewardRedeemed();
      setShowConfetti(true);

      // Award stars if this is a real kid and within daily limit
      if (currentKid && !isAdminPreview) {
        const isWithinDailyLimit = answeredToday < dailyLimit;
        const starsToAward = isWithinDailyLimit ? rewardStars : 0;
        const newAnsweredCount = answeredToday + 1;
        setEarnedStarsToast(starsToAward);

        const updatedKids = database.kids.map((k) => {
          if (k.id === currentKid.id) {
            const history = k.brainTeaserHistory || {
              totalAnswered: 0,
              totalCorrect: 0,
              totalStarsEarned: 0,
              completedQuestionIds: [],
            };

            const updatedHistory = {
              ...history,
              lastCompletedDate: todayStr,
              todayAnsweredCount: newAnsweredCount,
              totalAnswered: (history.totalAnswered || 0) + 1,
              totalCorrect: (history.totalCorrect || 0) + 1,
              totalStarsEarned: (history.totalStarsEarned || 0) + starsToAward,
              completedQuestionIds: Array.from(new Set([...(history.completedQuestionIds || []), currentTeaser.id])),
            };

            return {
              ...k,
              stars: k.stars + starsToAward,
              lifetimeStars: k.lifetimeStars + starsToAward,
              brainTeaserHistory: updatedHistory,
            };
          }
          return k;
        });

        // Add a log entry for transparency only if stars were awarded
        const newLogs =
          starsToAward > 0
            ? [
                {
                  id: `log-teaser-${Date.now()}`,
                  choreId: `brain-teaser-${currentTeaser.id}`,
                  kidId: currentKid.id,
                  date: todayStr,
                  status: 'completed' as const,
                  completedAt: new Date().toISOString(),
                  starsAwarded: starsToAward,
                  completedSubtasks: [`Brain Teaser (${gradeInfo.shortLabel}): ${currentTeaser.question.slice(0, 40)}...`],
                },
                ...(database.logs || []),
              ]
            : database.logs || [];

        onUpdateDatabase({
          ...database,
          kids: updatedKids,
          logs: newLogs,
        });
      }
    } else {
      sound.playTap();
    }
  };

  const handleNextTeaser = () => {
    sound.playTap();
    const next = getNextTeaser(activeGrade, currentTeaser.id);
    setCurrentTeaser(next);
    resetQuestionState();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[92vh]"
        >
          {/* Top Decorative Header */}
          <div className="relative bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 p-4 sm:p-6 text-white overflow-hidden shrink-0">
            {/* Ambient Background Circles */}
            <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-purple-400/20 blur-xl pointer-events-none" />

            <div className="flex items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-sm flex items-center justify-center text-2xl shadow-md shrink-0">
                  🧠
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-black tracking-tight text-white truncate">
                      Daily Brain Teaser
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs inline-flex items-center gap-1 shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                      +{rewardStars} Points
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-purple-100 font-medium truncate mt-0.5">
                    Exercise your brain & earn reward stars!
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                id="btn-close-brain-teaser"
                onClick={() => {
                  sound.playTap();
                  onClose();
                }}
                className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer shrink-0"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Kid & Level Info Pill Bar */}
            {currentKid && (
              <div className="mt-3.5 pt-3 border-t border-white/15 flex items-center justify-between gap-2 flex-wrap text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-sm shadow-2xs border border-white/30 shrink-0"
                    style={{ backgroundColor: currentKid.color || '#3b82f6' }}
                  >
                    {currentKid.avatar}
                  </div>
                  <span className="font-black text-white truncate">{currentKid.name}'s Challenge</span>
                  <span className="opacity-60">•</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/20 font-bold text-white/95 text-[11px] inline-flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    {gradeInfo.label} ({gradeInfo.ages})
                  </span>
                </div>

                <div className="text-[11px] font-bold text-amber-200 flex items-center gap-1 shrink-0">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>Balance: {currentKid.stars} pts</span>
                </div>
              </div>
            )}
          </div>

          {/* Grade Level Display: Admin Switcher vs Kid Locked Level */}
          {isAdminPreview ? (
            <div className="bg-slate-100 dark:bg-slate-800/80 px-3 py-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto flex items-center gap-1.5 scrollbar-none shrink-0">
              <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                Admin Grade Preview:
              </span>
              {GRADE_LEVEL_LIST.map((gl) => {
                const isSelected = gl.id === activeGrade;
                const isAssigned = currentKid?.gradeLevel === gl.id;
                return (
                  <button
                    key={gl.id}
                    id={`btn-grade-${gl.id}`}
                    onClick={() => handleSelectGrade(gl.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-xs font-black'
                        : 'bg-white dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                    title={`${gl.label} (${gl.ages})`}
                  >
                    <span>{gl.icon}</span>
                    <span>{gl.shortLabel}</span>
                    {isAssigned && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Assigned Level" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-purple-50/70 dark:bg-purple-950/30 px-4 py-2 border-b border-purple-200/60 dark:border-purple-800/50 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="p-1 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 shrink-0">
                  <Lock className="w-3.5 h-3.5" />
                </span>
                <span className="font-bold text-slate-600 dark:text-slate-300 shrink-0">
                  Assigned Level:
                </span>
                <span className="font-black text-purple-800 dark:text-purple-200 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-700 shadow-2xs truncate">
                  {gradeInfo.icon} {gradeInfo.label} ({gradeInfo.ages})
                </span>
              </div>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-400 flex items-center gap-1 shrink-0">
                <Shield className="w-3 h-3 text-indigo-500" />
                Locked by Parent
              </span>
            </div>
          )}

          {/* Main Content Body */}
          {isLimitReachedInitially ? (
            /* Daily Limit Reached Screen: Refocuses on chores */
            <div className="p-6 sm:p-8 flex-1 flex flex-col items-center justify-center text-center space-y-5 overflow-y-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-purple-100 dark:bg-purple-950/80 border-2 border-purple-300 dark:border-purple-700 flex items-center justify-center text-3xl sm:text-4xl shadow-md animate-bounce">
                🌟
              </div>

              <div className="space-y-2 max-w-md">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs border border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Daily Limit Reached ({answeredToday} of {dailyLimit} Completed)
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Awesome Brain Work, {currentKid?.name || 'Champ'}!
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                  You've completed your daily limit of{' '}
                  <span className="text-purple-600 dark:text-purple-400 font-black">
                    {dailyLimit} {dailyLimit === 1 ? 'question' : 'questions'}
                  </span>{' '}
                  for bonus points today.
                </p>
              </div>

              {/* Focus on Chores Prompt */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/80 text-left max-w-md w-full space-y-2">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-black text-xs sm:text-sm">
                  <span className="text-base">🧹</span>
                  <span>Time for Your Daily Chores!</span>
                </div>
                <p className="text-xs text-amber-800/90 dark:text-amber-300/90 font-medium leading-normal">
                  Brain teasers are capped each day so you can focus on helping out and knocking out your daily chore missions. Head back to complete your chores and earn more stars!
                </p>
              </div>

              <button
                id="btn-return-chores-limit-reached"
                onClick={() => {
                  sound.playTap();
                  onClose();
                }}
                className="w-full max-w-md py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
              >
                <span>Back to Chore Missions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Active Question Body */
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-5">
              {/* Subject Badge & Teaser Counter */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-extrabold text-xs border border-purple-200 dark:border-purple-800/60">
                  <span>{currentTeaser.subjectIcon}</span>
                  <span>{currentTeaser.subjectLabel}</span>
                </span>

                <div className="flex items-center gap-2">
                  {!isAdminPreview ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                      Daily Question {Math.min(answeredToday + 1, dailyLimit)} of {dailyLimit}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                      Level: {gradeInfo.shortLabel}
                    </span>
                  )}
                </div>
              </div>

              {/* Question Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-600/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-sm shrink-0 mt-0.5">
                    Q
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                    {currentTeaser.question}
                  </h3>
                </div>
              </div>

              {/* Multiple Choice Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {currentTeaser.options.map((optionText, idx) => {
                  const isSelected = selectedOptionIndex === idx;
                  const isThisCorrect = currentTeaser.correctAnswerIndex === idx;

                  let buttonStyles =
                    'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700/80 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-slate-800';
                  let optionLetterBg =
                    'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200';

                  if (isAnswerSubmitted) {
                    if (isThisCorrect) {
                      buttonStyles =
                        'bg-emerald-500/15 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/30';
                      optionLetterBg = 'bg-emerald-500 text-white';
                    } else if (isSelected && !isCorrect) {
                      buttonStyles =
                        'bg-rose-500/15 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 border-rose-400 dark:border-rose-500';
                      optionLetterBg = 'bg-rose-500 text-white';
                    }
                  } else if (isSelected) {
                    buttonStyles =
                      'bg-purple-50 dark:bg-purple-950/40 text-purple-950 dark:text-purple-100 border-purple-500 ring-2 ring-purple-500/30';
                    optionLetterBg = 'bg-purple-600 text-white';
                  }

                  const optionLetters = ['A', 'B', 'C', 'D'];

                  return (
                    <button
                      key={idx}
                      id={`btn-teaser-opt-${idx}`}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerSubmitted && isCorrect}
                      className={`p-3 sm:p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.99] ${buttonStyles}`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${optionLetterBg}`}
                      >
                        {optionLetters[idx]}
                      </span>
                      <span className="font-bold text-sm sm:text-base flex-1">
                        {optionText}
                      </span>
                      {isAnswerSubmitted && isThisCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      )}
                      {isAnswerSubmitted && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Hint Accordion */}
              <div>
                {!showHint ? (
                  <button
                    id="btn-show-hint"
                    onClick={() => {
                      sound.playTap();
                      setShowHint(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer py-1"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Need a thinking prompt? Tap for a clue! 💡</span>
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 text-xs flex flex-col gap-2"
                  >
                    <div className="flex items-start gap-2.5">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-black">Thinking Clue: </span>
                        <span>{currentTeaser.hint}</span>
                      </div>
                    </div>
                    {currentTeaser.thinkingAngle && (
                      <div className="pl-6 border-t border-amber-200/60 dark:border-amber-800/40 pt-2 flex items-start gap-1.5 text-amber-800/90 dark:text-amber-300/90">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Think Outside the Box: </span>
                          <span className="italic">{currentTeaser.thinkingAngle}</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Answer Result Feedback Card */}
              {isAnswerSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 sm:p-5 rounded-2xl border shadow-sm ${
                    isCorrect
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl shrink-0">
                      {isCorrect ? '🎉' : '🤔'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-black">
                          {isCorrect ? 'Outstanding Job! Correct!' : 'Not quite, but nice try!'}
                        </h4>
                        {isCorrect && earnedStarsToast && earnedStarsToast > 0 && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs inline-flex items-center gap-1 shadow-xs">
                            <Sparkles className="w-3 h-3 fill-slate-950 text-slate-950" />
                            +{earnedStarsToast} Stars Earned!
                          </span>
                        )}
                      </div>

                      {/* Educational Explanation / Fun Fact */}
                      <div className="mt-2 text-xs sm:text-sm font-medium leading-relaxed opacity-95">
                        <p className="font-bold mb-1 text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <span>💡</span>
                          <span>Learning Breakdown & Fun Fact:</span>
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-black/5 dark:border-white/5">
                          {currentTeaser.funFactExplanation}
                        </p>
                      </div>

                      {!isCorrect && (
                        <p className="text-xs text-rose-700 dark:text-rose-300 mt-2 font-semibold">
                          Give it another thought or tap "Try Again" to select a different answer!
                        </p>
                      )}

                      {/* Daily Limit Reached Note */}
                      {isCorrect && !isAdminPreview && answeredToday + 1 >= dailyLimit && (
                        <div className="mt-3 p-2.5 rounded-xl bg-purple-100/80 dark:bg-purple-900/40 border border-purple-300/80 dark:border-purple-700 text-purple-950 dark:text-purple-200 text-xs font-bold flex items-center gap-2">
                          <span className="text-base">🌟</span>
                          <span>
                            Daily brain teaser goal reached ({dailyLimit}/{dailyLimit})! Now head over to your chores to earn even more stars!
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Bottom Action Footer */}
          {!isLimitReachedInitially && (
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 flex-wrap">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>
                  Admin Setting: {dailyLimit} {dailyLimit === 1 ? 'Q' : 'Qs'}/day • +{rewardStars} Stars each
                </span>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {!isAnswerSubmitted ? (
                  <button
                    id="btn-submit-teaser-answer"
                    onClick={handleSubmitAnswer}
                    disabled={selectedOptionIndex === null}
                    className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm ${
                      selectedOptionIndex !== null
                        ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer active:scale-95 shadow-purple-600/30'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Submit Answer</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : isCorrect ? (
                  <div className="flex items-center gap-2">
                    {!isAdminPreview ? (
                      answeredToday + 1 < dailyLimit ? (
                        <>
                          <button
                            id="btn-next-daily-teaser"
                            onClick={() => {
                              sound.playTap();
                              const nextTeaser = getDailyTeaserForKid(currentKid!, todayStr, answeredToday + 1);
                              setCurrentTeaser(nextTeaser);
                              resetQuestionState();
                            }}
                            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                          >
                            <span>Next Question ({answeredToday + 2} of {dailyLimit})</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                          <button
                            id="btn-done-teaser"
                            onClick={() => {
                              sound.playTap();
                              onClose();
                            }}
                            className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600 font-black text-xs sm:text-sm transition-all cursor-pointer"
                          >
                            Done
                          </button>
                        </>
                      ) : (
                        <button
                          id="btn-finish-and-go-to-chores"
                          onClick={() => {
                            sound.playTap();
                            onClose();
                          }}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
                        >
                          <span>Goal Done! Go to Chores 🧹</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )
                    ) : (
                      <>
                        <button
                          id="btn-next-teaser"
                          onClick={handleNextTeaser}
                          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                        >
                          <span>Practice Next Question</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          id="btn-done-teaser-admin"
                          onClick={() => {
                            sound.playTap();
                            onClose();
                          }}
                          className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600 font-black text-xs sm:text-sm transition-all cursor-pointer"
                        >
                          Done
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-retry-teaser"
                      onClick={() => {
                        sound.playTap();
                        setIsAnswerSubmitted(false);
                        setSelectedOptionIndex(null);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Try Again</span>
                    </button>
                    {isAdminPreview && (
                      <button
                        id="btn-skip-teaser"
                        onClick={handleNextTeaser}
                        className="px-3.5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-600 transition-all cursor-pointer"
                      >
                        Skip Question
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
