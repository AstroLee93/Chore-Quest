import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain,
  Sparkles,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  X,
  Star,
  GraduationCap,
  Award,
  BookOpen,
  Lock,
  Shield,
  Check,
  RefreshCw,
  Target,
  Trophy,
  BarChart3,
} from 'lucide-react';
import { KidProfile, FamilyDatabase, GradeLevel, BrainTeaserSubject, BrainTeaserSubjectStat } from '../types';
import { TopBrainsLeaderboard } from './TopBrainsLeaderboard';
import { BrainTeaserProgressModal } from './BrainTeaserProgressModal';
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
  fetchAiBrainTeaser,
  BRAIN_TEASER_SUBJECTS,
  getSubjectInfo,
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
  embedded?: boolean;
}

export const BrainTeaserModal: React.FC<BrainTeaserModalProps> = ({
  isOpen,
  onClose,
  kid,
  database,
  onUpdateDatabase,
  isAdminPreview = false,
  embedded = false,
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

  // AI Dynamic Generator State
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('any');
  const [freePracticeMode, setFreePracticeMode] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showProgressModal, setShowProgressModal] = useState<boolean>(false);

  const dailyLimit = database.settings.brainTeaserDailyLimit ?? DEFAULT_BRAIN_TEASER_DAILY_LIMIT;
  const rewardStars = database.settings.brainTeaserRewardStars ?? DEFAULT_BRAIN_TEASER_REWARD_STARS;
  const todayStr = getTodayDateString();
  const answeredToday = currentKid ? getDailyTeasersAnsweredToday(currentKid, todayStr) : 0;
  const isLimitReachedInitially = !isAdminPreview && answeredToday >= dailyLimit && !freePracticeMode;

  // Strict Per-Kid Subject Assignment:
  // If in kid mode (!isAdminPreview), subject is strictly locked to the kid's assigned brainTeaserSubject (defaulting to 'any').
  const assignedSubject: BrainTeaserSubject = (currentKid?.brainTeaserSubject as BrainTeaserSubject) || 'any';
  const effectiveSubjectFilter: string = isAdminPreview ? selectedSubject : assignedSubject;
  const assignedSubjectInfo = getSubjectInfo(assignedSubject);
  const activeSubjectInfo = getSubjectInfo(effectiveSubjectFilter);

  const resetQuestionState = () => {
    setSelectedOptionIndex(null);
    setIsAnswerSubmitted(false);
    setIsCorrect(false);
    setShowHint(false);
    setEarnedStarsToast(null);
    setShowConfetti(false);
  };

  const loadFreshTeaser = async (
    grade: GradeLevel,
    subjectFilter?: string
  ) => {
    setIsGeneratingAi(true);
    resetQuestionState();

    // Kids strictly use their assigned subject focus; admins can test specific subjects
    const targetSubject = isAdminPreview
      ? (subjectFilter ?? selectedSubject)
      : assignedSubject;

    try {
      const completedIds = currentKid?.brainTeaserHistory?.completedQuestionIds || [];
      const teaser = await fetchAiBrainTeaser({
        gradeLevel: grade,
        kidName: currentKid?.name,
        excludeQuestionIds: completedIds,
        preferredSubject: targetSubject !== 'any' ? targetSubject : undefined,
      });
      setCurrentTeaser(teaser);
    } catch (err) {
      console.warn('[BrainTeaser] AI generation failed, using catalog question:', err);
      const fallback = getDailyTeaserForKid(
        {
          ...(currentKid || (database.kids[0] as KidProfile)),
          gradeLevel: grade,
          brainTeaserSubject: targetSubject as BrainTeaserSubject,
        },
        todayStr,
        answeredToday
      );
      setCurrentTeaser(fallback);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Sync with kid's grade and assigned subject whenever kid changes or modal opens
  useEffect(() => {
    if (isOpen && currentKid) {
      // Kids are locked to their assigned grade level and subject
      const grade = currentKid.gradeLevel || '1st_grade';
      const targetSub = currentKid.brainTeaserSubject || 'any';
      setActiveGrade(grade);
      setSelectedSubject(targetSub);
      setFreePracticeMode(false);
      const answered = getDailyTeasersAnsweredToday(currentKid, todayStr);
      const limitReached = !isAdminPreview && answered >= dailyLimit;
      if (!limitReached) {
        loadFreshTeaser(grade, targetSub);
      } else {
        resetQuestionState();
      }
    }
  }, [isOpen, currentKid?.id, currentKid?.brainTeaserSubject, currentKid?.gradeLevel]);

  const gradeInfo = getGradeLevelInfo(activeGrade);

  const handleSelectGrade = (newGrade: GradeLevel) => {
    // Prevent kids from changing their grade level to ensure educational appropriateness
    if (!isAdminPreview) return;
    sound.playTap();
    setActiveGrade(newGrade);
    loadFreshTeaser(newGrade, selectedSubject);
  };

  const handleSelectSubject = (subjectId: string) => {
    // Only admins can change/test different subjects; kids are locked to their assigned subject
    if (!isAdminPreview) return;
    sound.playTap();
    setSelectedSubject(subjectId);
    loadFreshTeaser(activeGrade, subjectId);
  };

  const handleUpdateKidAssignedSubject = (newSubject: BrainTeaserSubject) => {
    if (!isAdminPreview || !currentKid) return;
    sound.playTap();
    const updatedKids = database.kids.map((k) =>
      k.id === currentKid.id ? { ...k, brainTeaserSubject: newSubject } : k
    );
    onUpdateDatabase({ ...database, kids: updatedKids });
    setSelectedSubject(newSubject);
    loadFreshTeaser(activeGrade, newSubject);
  };

  const handleRefreshQuestion = () => {
    sound.playTap();
    loadFreshTeaser(activeGrade, effectiveSubjectFilter);
  };

  const handleSelectOption = (index: number) => {
    // Single-attempt rule: strictly prevent changing selection once answer is submitted
    if (isAnswerSubmitted) return;
    sound.playTap();
    setSelectedOptionIndex(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOptionIndex === null || isAnswerSubmitted) return;

    // Single-attempt rule: answer is evaluated once and locked permanently
    const correct = selectedOptionIndex === currentTeaser.correctAnswerIndex;
    setIsAnswerSubmitted(true);
    setIsCorrect(correct);

    if (correct) {
      sound.playRewardRedeemed();
      setShowConfetti(true);
    } else {
      sound.playSkipNotice();
    }

    // Award stars ONLY if answered correctly on the very first attempt within daily limit
    if (currentKid && !isAdminPreview) {
      const isWithinDailyLimit = answeredToday < dailyLimit && !freePracticeMode;
      const starsToAward = (correct && isWithinDailyLimit) ? rewardStars : 0;
      const newAnsweredCount = isWithinDailyLimit ? answeredToday + 1 : answeredToday;
      setEarnedStarsToast(starsToAward);

      const updatedKids = database.kids.map((k) => {
        if (k.id === currentKid.id) {
          const history = k.brainTeaserHistory || {
            totalAnswered: 0,
            totalCorrect: 0,
            totalStarsEarned: 0,
            completedQuestionIds: [],
          };

          // Track subject-level metrics (right, wrong, total, percentage, stars)
          const teaserSubject = (currentTeaser.subject || 'logic') as Exclude<BrainTeaserSubject, 'any'>;
          const prevSubjectStats = history.subjectStats || {};
          const prevStat = prevSubjectStats[teaserSubject] || {
            subject: teaserSubject,
            correct: 0,
            wrong: 0,
            total: 0,
            percentage: 0,
            starsEarned: 0,
          };
          const newSubjectCorrect = (prevStat.correct || 0) + (correct ? 1 : 0);
          const newSubjectWrong = (prevStat.wrong || 0) + (correct ? 0 : 1);
          const newSubjectTotal = (prevStat.total || 0) + 1;
          const newSubjectPercentage = Math.round((newSubjectCorrect / newSubjectTotal) * 100);
          const newSubjectStars = (prevStat.starsEarned || 0) + starsToAward;

          const updatedSubjectStats: Partial<Record<BrainTeaserSubject, BrainTeaserSubjectStat>> = {
            ...prevSubjectStats,
            [teaserSubject]: {
              subject: teaserSubject,
              correct: newSubjectCorrect,
              wrong: newSubjectWrong,
              total: newSubjectTotal,
              percentage: newSubjectPercentage,
              starsEarned: newSubjectStars,
              lastAttemptedDate: todayStr,
            },
          };

          const updatedHistory = {
            ...history,
            lastCompletedDate: todayStr,
            todayAnsweredCount: newAnsweredCount,
            totalAnswered: (history.totalAnswered || 0) + 1,
            totalCorrect: (history.totalCorrect || 0) + (correct ? 1 : 0),
            totalStarsEarned: (history.totalStarsEarned || 0) + starsToAward,
            completedQuestionIds: Array.from(new Set([...(history.completedQuestionIds || []), currentTeaser.id])),
            subjectStats: updatedSubjectStats,
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
                completedSubtasks: [
                  `Brain Teaser (${currentTeaser.isAiGenerated ? '✨ AI' : '📚'} • ${gradeInfo.shortLabel}): ${currentTeaser.question.slice(0, 45)}...`,
                ],
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
  };

  const handleNextTeaser = () => {
    sound.playTap();
    loadFreshTeaser(activeGrade, effectiveSubjectFilter);
  };

  if (!isOpen) return null;

  const modalContent = showLeaderboard ? (
    <TopBrainsLeaderboard
      database={database}
      currentKidId={currentKid?.id}
      onClose={() => setShowLeaderboard(false)}
      rewardStars={rewardStars}
    />
  ) : (
    <>
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
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-extrabold text-[11px] inline-flex items-center gap-1 border border-white/20">
                      🎯 1 Try
                    </span>
                    <button
                      id="btn-top-brains-leaderboard"
                      onClick={() => {
                        sound.playFanfare();
                        setShowLeaderboard(true);
                      }}
                      className="px-2.5 py-0.5 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-[11px] inline-flex items-center gap-1 shadow-sm border border-amber-300/80 cursor-pointer transition-all hover:shadow-amber-400/30"
                      title="View Top Brains Leaderboard"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-950 fill-amber-700 shrink-0" />
                      <span>Top Brains</span>
                      <span className="text-[10px] bg-slate-950/20 px-1 py-0.2 rounded-full font-bold">🏆</span>
                    </button>
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

                  {/* Stand Alone Progress Bar Graph Icon Button next to grade level */}
                  <button
                    id="btn-kid-progress-icon-next-to-grade"
                    onClick={() => {
                      sound.playTap();
                      setShowProgressModal(true);
                    }}
                    className="p-1 px-2 rounded-md bg-white/25 hover:bg-white/35 active:scale-95 text-white font-extrabold text-[11px] inline-flex items-center gap-1.5 border border-white/30 cursor-pointer transition-all shadow-2xs"
                    title="View My Brain Teaser Subject Progress & Bar Graphs"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>My Progress 📊</span>
                  </button>
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

          {/* Subject / Topic Focus Selector: Only Admins can change; Kids are locked to their assigned subject */}
          {isAdminPreview ? (
            <div className="px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar shrink-0 border-b border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-900/60 flex-wrap">
              <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1 mr-1">
                  <Target className="w-3.5 h-3.5" />
                  Admin Subject Tester:
                </span>
                {BRAIN_TEASER_SUBJECTS.map((topic) => {
                  const isActive = selectedSubject === topic.id;
                  const isAssigned =
                    currentKid?.brainTeaserSubject === topic.id ||
                    (!currentKid?.brainTeaserSubject && topic.id === 'any');
                  return (
                    <button
                      key={topic.id}
                      id={`btn-subject-${topic.id}`}
                      onClick={() => handleSelectSubject(topic.id)}
                      disabled={isGeneratingAi}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-xs font-black'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200/80 dark:border-slate-700/80'
                      }`}
                      title={`${topic.label} - ${topic.description}`}
                    >
                      <span className="text-xs">{topic.icon}</span>
                      <span>{topic.shortLabel}</span>
                      {isAssigned && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Assigned Target Focus for this child" />
                      )}
                    </button>
                  );
                })}
              </div>

              {currentKid && (
                <div className="flex items-center gap-2 shrink-0 ml-auto bg-white dark:bg-slate-800 px-3 py-1 rounded-xl border border-purple-200 dark:border-purple-800 shadow-2xs">
                  <label htmlFor="select-modal-kid-subject" className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                    <span>🎯</span>
                    <span>Assigned to {currentKid.name}:</span>
                  </label>
                  <select
                    id="select-modal-kid-subject"
                    value={currentKid.brainTeaserSubject || 'any'}
                    onChange={(e) => handleUpdateKidAssignedSubject(e.target.value as BrainTeaserSubject)}
                    className="text-xs font-black text-purple-700 dark:text-purple-300 bg-transparent border-0 focus:ring-0 cursor-pointer py-0.5"
                    title={`Admin per-kid subject assignment for ${currentKid.name}`}
                  >
                    {BRAIN_TEASER_SUBJECTS.map((s) => (
                      <option key={s.id} value={s.id} className="text-slate-900 dark:text-white bg-white dark:bg-slate-800">
                        {s.icon} {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ) : (
            /* Kid View: Strictly Locked to Admin-Assigned Subject (Prevents avoiding weak subjects) */
            <div className="bg-purple-50/70 dark:bg-purple-950/30 px-4 py-2 border-b border-purple-200/60 dark:border-purple-800/50 flex items-center justify-between text-xs shrink-0 flex-wrap gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="p-1 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 shrink-0">
                  <Target className="w-3.5 h-3.5" />
                </span>
                <span className="font-bold text-slate-600 dark:text-slate-300 shrink-0">
                  Target Subject Focus:
                </span>
                <span className="font-black text-purple-900 dark:text-purple-100 bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-purple-200 dark:border-purple-700 shadow-2xs truncate flex items-center gap-1.5">
                  <span>{assignedSubjectInfo.icon}</span>
                  <span>{assignedSubjectInfo.label}</span>
                </span>
                {currentKid?.brainTeaserSubject && currentKid.brainTeaserSubject !== 'any' ? (
                  <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/70 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800 hidden sm:inline-flex items-center gap-1">
                    <span>🎯 Admin Assigned Target</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">
                    (Mixed Daily Curriculum)
                  </span>
                )}
              </div>
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0 ml-auto">
                <Lock className="w-3 h-3 text-purple-500" />
                Subject Locked by Parent
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

              <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-md">
                <button
                  id="btn-return-chores-limit-reached"
                  onClick={() => {
                    sound.playTap();
                    onClose();
                  }}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
                >
                  <span>Back to Chores 🧹</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  id="btn-start-free-practice"
                  onClick={() => {
                    sound.playTap();
                    setFreePracticeMode(true);
                    loadFreshTeaser(activeGrade, selectedSubject);
                  }}
                  className="flex-1 py-3.5 rounded-2xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 text-purple-950 dark:text-purple-200 border border-purple-300 dark:border-purple-700 font-black text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Keep Learning 🧠</span>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full max-w-md">
                <button
                  id="btn-view-leaderboard-limit"
                  onClick={() => {
                    sound.playFanfare();
                    setShowLeaderboard(true);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all shadow-2xs"
                >
                  <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Top Brains 🏆</span>
                </button>

                <button
                  id="btn-view-progress-limit"
                  onClick={() => {
                    sound.playTap();
                    setShowProgressModal(true);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-950 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all shadow-2xs"
                >
                  <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Subject Progress 📊</span>
                </button>
              </div>
            </div>
          ) : (
            /* Active Question Body */
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-5">
              {isGeneratingAi ? (
                <div className="py-12 sm:py-16 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-950/60 border-2 border-purple-300 dark:border-purple-700 flex items-center justify-center text-3xl shadow-md animate-pulse">
                      🧠
                    </div>
                    <Sparkles className="w-6 h-6 text-amber-400 fill-amber-400 absolute -top-2 -right-2 animate-bounce" />
                  </div>
                  <div className="space-y-1.5 max-w-sm">
                    <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      Generating Fresh {gradeInfo.label} Challenge...
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Gemini AI is crafting an original, curriculum-grounded question with fun facts so kids are learning, not memorizing!
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Subject Badge, AI Indicator & Teaser Counter */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-extrabold text-xs border border-purple-200 dark:border-purple-800/60">
                        <span>{currentTeaser.subjectIcon}</span>
                        <span>{currentTeaser.subjectLabel}</span>
                      </span>

                      {currentTeaser.isAiGenerated ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-[11px] shadow-xs">
                          <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
                          Gemini AI Challenge
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] border border-slate-200 dark:border-slate-700">
                          📚 Curriculum Bank
                        </span>
                      )}

                      {currentTeaser.conceptTag && (
                        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-bold text-[10px] border border-amber-200 dark:border-amber-800/60">
                          {currentTeaser.conceptTag}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!isAnswerSubmitted && (
                        <button
                          id="btn-refresh-question"
                          onClick={handleRefreshQuestion}
                          disabled={isGeneratingAi}
                          title="Generate a brand new AI question"
                          className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/60 text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs active:scale-95"
                        >
                          <RefreshCw className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                          <span>New Question</span>
                        </button>
                      )}

                      {!isAdminPreview ? (
                        freePracticeMode ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-black text-xs border border-purple-300 dark:border-purple-700">
                            Practice Mode 🧠
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                            Daily Question {Math.min(answeredToday + 1, dailyLimit)} of {dailyLimit}
                            <span className="text-purple-600 dark:text-purple-400 font-extrabold ml-1">• 1 Try</span>
                          </span>
                        )
                      ) : (
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                          Level: {gradeInfo.shortLabel}
                        </span>
                      )}

                      <button
                        id="btn-top-brains-leaderboard-center"
                        onClick={() => {
                          sound.playFanfare();
                          setShowLeaderboard(true);
                        }}
                        className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/70 text-amber-900 dark:text-amber-200 font-extrabold text-xs border border-amber-300/80 dark:border-amber-700/80 flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs active:scale-95"
                        title="View Top Brains Leaderboard"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" />
                        <span>Top Brains 🏆</span>
                      </button>

                      <button
                        id="btn-brain-progress-center"
                        onClick={() => {
                          sound.playTap();
                          setShowProgressModal(true);
                        }}
                        className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 hover:bg-indigo-200 dark:hover:bg-indigo-900/70 text-indigo-900 dark:text-indigo-200 font-extrabold text-xs border border-indigo-300/80 dark:border-indigo-700/80 flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs active:scale-95"
                        title="View Subject Progress Bar Graph"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span>Progress 📊</span>
                      </button>
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
                        'bg-rose-500/15 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 border-rose-400 dark:border-rose-500 ring-2 ring-rose-500/20';
                      optionLetterBg = 'bg-rose-500 text-white';
                    } else {
                      buttonStyles =
                        'bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 opacity-60';
                      optionLetterBg = 'bg-slate-200 dark:bg-slate-700 text-slate-400';
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
                      disabled={isAnswerSubmitted}
                      className={`p-3 sm:p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all duration-150 ${
                        isAnswerSubmitted ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]'
                      } shadow-xs ${buttonStyles}`}
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
                        <div className="flex items-center gap-1.5 shrink-0">
                          {!isCorrect && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-200 text-[10px] font-black uppercase tracking-wider border border-emerald-300 dark:border-emerald-700">
                              Correct Answer
                            </span>
                          )}
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                      )}
                      {isAnswerSubmitted && isSelected && !isCorrect && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/70 text-rose-800 dark:text-rose-200 text-[10px] font-black uppercase tracking-wider border border-rose-300 dark:border-rose-700">
                            Your Choice
                          </span>
                          <XCircle className="w-5 h-5 text-rose-500" />
                        </div>
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
                    <span>Need a thinking prompt? Tap for a clue before submitting! 💡</span>
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
                      {isCorrect ? '🎉' : '❌'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-black">
                          {isCorrect ? 'Outstanding Job! Correct on First Attempt!' : 'Incorrect on First Attempt'}
                        </h4>
                        {isCorrect && earnedStarsToast && earnedStarsToast > 0 ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs inline-flex items-center gap-1 shadow-xs">
                            <Sparkles className="w-3 h-3 fill-slate-950 text-slate-950" />
                            +{earnedStarsToast} Stars Earned!
                          </span>
                        ) : !isCorrect ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 font-black text-xs inline-flex items-center gap-1 border border-rose-300 dark:border-rose-700">
                            0 Stars • 1 Attempt Used
                          </span>
                        ) : null}
                      </div>

                      {!isCorrect && (
                        <p className="text-xs text-rose-800 dark:text-rose-200 mt-1.5 font-semibold leading-relaxed">
                          Brain teaser points are only awarded if answered correctly on the very first attempt. The correct answer is revealed above so you can learn from it!
                        </p>
                      )}

                      {/* Educational Explanation / Fun Fact */}
                      <div className="mt-2.5 text-xs sm:text-sm font-medium leading-relaxed opacity-95">
                        <p className="font-bold mb-1 text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <span>💡</span>
                          <span>Learning Breakdown & Fun Fact:</span>
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-black/5 dark:border-white/5">
                          {currentTeaser.funFactExplanation}
                        </p>
                      </div>

                      {/* Daily Limit Reached Note */}
                      {!isAdminPreview && !freePracticeMode && answeredToday + 1 >= dailyLimit && (
                        <div className="mt-3 p-2.5 rounded-xl bg-purple-100/80 dark:bg-purple-900/40 border border-purple-300/80 dark:border-purple-700 text-purple-950 dark:text-purple-200 text-xs font-bold flex items-center gap-2">
                          <span className="text-base">🌟</span>
                          <span>
                            Daily brain teaser attempt finished ({dailyLimit}/{dailyLimit})! Head to your daily chores to earn more stars, or tap Practice More to keep exploring!
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
                </>
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
                <span className="text-purple-600 dark:text-purple-400 font-black ml-1.5 hidden sm:inline">
                  • 1 attempt per question
                </span>
              </div>

              <div className="flex items-center gap-2 ml-auto flex-wrap">
                {!isAnswerSubmitted ? (
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-submit-teaser-answer"
                      onClick={handleSubmitAnswer}
                      disabled={selectedOptionIndex === null || isGeneratingAi}
                      className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm ${
                        selectedOptionIndex !== null && !isGeneratingAi
                          ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer active:scale-95 shadow-purple-600/30'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <span>Submit Final Answer</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  /* Progression after the single attempt has been submitted (No retry) */
                  <div className="flex items-center gap-2 flex-wrap">
                    {!isAdminPreview ? (
                      !freePracticeMode && answeredToday + 1 < dailyLimit ? (
                        <>
                          <button
                            id="btn-next-daily-teaser"
                            onClick={() => {
                              sound.playTap();
                              loadFreshTeaser(activeGrade, effectiveSubjectFilter);
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
                      ) : !freePracticeMode && answeredToday + 1 >= dailyLimit ? (
                        <>
                          <button
                            id="btn-continue-practice"
                            onClick={() => {
                              sound.playTap();
                              setFreePracticeMode(true);
                              loadFreshTeaser(activeGrade, effectiveSubjectFilter);
                            }}
                            className="px-4 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/50 dark:hover:bg-purple-900/80 text-purple-950 dark:text-purple-200 font-black text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                            <span>Practice More (0 Stars) 🧠</span>
                          </button>
                          <button
                            id="btn-finish-and-go-to-chores"
                            onClick={() => {
                              sound.playTap();
                              onClose();
                            }}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
                          >
                            <span>{isCorrect ? 'Goal Done! Go to Chores 🧹' : 'Done • Go to Chores 🧹'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        /* In Free Practice Mode */
                        <>
                          <button
                            id="btn-next-practice-challenge"
                            onClick={() => {
                              sound.playTap();
                              loadFreshTeaser(activeGrade, effectiveSubjectFilter);
                            }}
                            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                          >
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <span>Next Practice Challenge</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                          <button
                            id="btn-done-practice"
                            onClick={() => {
                              sound.playTap();
                              onClose();
                            }}
                            className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600 font-black text-xs sm:text-sm transition-all cursor-pointer"
                          >
                            Done
                          </button>
                        </>
                      )
                    ) : (
                      <>
                        <button
                          id="btn-next-teaser"
                          onClick={handleNextTeaser}
                          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Generate Next Question</span>
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
                )}
              </div>
            </div>
          )}
    </>
  );

  if (embedded) {
    return (
      <>
        <div id="brain-teaser-view" className="w-full max-w-4xl mx-auto space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <button
              id="btn-back-teaser"
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-black text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to Missions</span>
            </button>
          </div>

          <div className="relative w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border-2 border-purple-200 dark:border-purple-900/50 overflow-hidden flex flex-col">
            {modalContent}
          </div>
        </div>

        <BrainTeaserProgressModal
          database={database}
          currentKidId={currentKid?.id}
          isOpen={showProgressModal}
          onClose={() => setShowProgressModal(false)}
          isAdmin={isAdminPreview}
          onUpdateKidFocusSubject={(kidId, subject) => {
            const updatedKids = database.kids.map((k) =>
              k.id === kidId ? { ...k, brainTeaserSubject: subject } : k
            );
            onUpdateDatabase({
              ...database,
              kids: updatedKids,
            });
          }}
        />
      </>
    );
  }

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[92vh]"
          >
            {modalContent}
          </motion.div>
        </div>
      </AnimatePresence>

      <BrainTeaserProgressModal
        database={database}
        currentKidId={currentKid?.id}
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        isAdmin={isAdminPreview}
        onUpdateKidFocusSubject={(kidId, subject) => {
          const updatedKids = database.kids.map((k) =>
            k.id === kidId ? { ...k, brainTeaserSubject: subject } : k
          );
          onUpdateDatabase({
            ...database,
            kids: updatedKids,
          });
        }}
      />
    </>
  );
};
