import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Star,
  Award,
  Brain,
  Trophy,
  Target,
  Sparkles,
  ArrowLeft,
  X,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { KidProfile, FamilyDatabase, BrainTeaserSubject } from '../types';
import {
  getKidSubjectProgress,
  getHouseholdBrainTeaserAnalytics,
  KidSubjectProgress,
  SubjectMetric,
  TRACKABLE_SUBJECTS,
} from '../utils/brainTeaserStats';
import { getGradeLevelInfo } from '../utils/brainTeasers';
import { sound } from '../utils/sound';

interface BrainTeaserProgressModalProps {
  database: FamilyDatabase;
  currentKidId?: string;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onUpdateKidFocusSubject?: (kidId: string, subject: BrainTeaserSubject) => void;
}

export const BrainTeaserProgressModal: React.FC<BrainTeaserProgressModalProps> = ({
  database,
  currentKidId,
  isOpen,
  onClose,
  isAdmin = false,
  onUpdateKidFocusSubject,
}) => {
  const kids = database.kids || [];
  // Default selected kid to currentKidId or first kid
  const initialKidId = currentKidId || (kids.length > 0 ? kids[0].id : '');
  const [selectedKidId, setSelectedKidId] = useState<string>(initialKidId);
  // View mode: 'simplified' (kid-friendly) or 'thorough' (admin in-depth)
  const [viewMode, setViewMode] = useState<'simplified' | 'thorough'>(
    isAdmin ? 'thorough' : 'simplified'
  );
  // In thorough mode, allow selecting "all" for household overview
  const [adminHouseholdView, setAdminHouseholdView] = useState<boolean>(false);
  const [focusedSubject, setFocusedSubject] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentKid = kids.find((k) => k.id === selectedKidId) || kids[0];
  const kidProgress: KidSubjectProgress | null = currentKid
    ? getKidSubjectProgress(currentKid)
    : null;
  const householdAnalytics = getHouseholdBrainTeaserAnalytics(kids);

  const gradeInfo = currentKid ? getGradeLevelInfo(currentKid.gradeLevel) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4 sm:p-5 text-white shrink-0 overflow-hidden shadow-md">
          {/* Decorative blur elements */}
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/15 blur-xl pointer-events-none" />
          <div className="absolute -left-6 -bottom-6 w-32 h-32 rounded-full bg-purple-400/20 blur-xl pointer-events-none" />

          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3 min-w-0">
              <button
                id="btn-back-from-progress"
                onClick={() => {
                  sound.playTap();
                  onClose();
                }}
                className="p-2 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 border border-white/25 text-white transition-all cursor-pointer shrink-0"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-sm flex items-center justify-center text-xl sm:text-2xl shadow-inner shrink-0">
                📊
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg sm:text-xl font-black tracking-tight text-white truncate">
                    Brain Teaser Subject Progress
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-extrabold text-[11px] inline-flex items-center gap-1 border border-white/20">
                    <BarChart3 className="w-3 h-3 text-amber-300" />
                    Subject Bar Graphs
                  </span>
                </div>
                <p className="text-xs text-purple-100 font-semibold truncate mt-0.5">
                  {viewMode === 'thorough'
                    ? 'Comprehensive Subject Metrics & Household Analysis'
                    : `Track Right vs. Wrong questions by subject for ${currentKid?.name || 'you'}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Admin toggle between thorough & simplified */}
              {isAdmin && (
                <button
                  id="btn-toggle-view-mode"
                  onClick={() => {
                    sound.playTap();
                    setViewMode((prev) => (prev === 'simplified' ? 'thorough' : 'simplified'));
                  }}
                  className="px-2.5 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white font-black text-xs border border-white/30 transition-all cursor-pointer hidden sm:flex items-center gap-1"
                  title="Switch between simplified and thorough analytics"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span>{viewMode === 'thorough' ? 'Kids View' : 'Admin View'}</span>
                </button>
              )}

              <button
                id="btn-close-progress-modal"
                onClick={() => {
                  sound.playTap();
                  onClose();
                }}
                className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer shrink-0"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subheader Kid Selector / Grade Pill */}
          <div className="mt-3.5 pt-3 border-t border-white/20 flex items-center justify-between gap-2 flex-wrap text-xs">
            {/* Kid Selector (if multiple kids or admin) */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
              {kids.map((k) => {
                const isSelected = !adminHouseholdView && k.id === selectedKidId;
                return (
                  <button
                    key={k.id}
                    id={`btn-select-kid-progress-${k.id}`}
                    onClick={() => {
                      sound.playTap();
                      setSelectedKidId(k.id);
                      setAdminHouseholdView(false);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                      isSelected
                        ? 'bg-white text-indigo-950 shadow-sm border-white'
                        : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
                    }`}
                  >
                    <span>{k.avatar}</span>
                    <span className="truncate max-w-[90px]">{k.name}</span>
                  </button>
                );
              })}

              {/* In admin mode, also allow household aggregate */}
              {isAdmin && (
                <button
                  id="btn-select-household-overview"
                  onClick={() => {
                    sound.playTap();
                    setAdminHouseholdView(true);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                    adminHouseholdView
                      ? 'bg-amber-400 text-slate-950 shadow-sm border-amber-300'
                      : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
                  }`}
                >
                  <span>🏠</span>
                  <span>All Kids</span>
                </button>
              )}
            </div>

            {/* Grade level indicator of currently active kid */}
            {!adminHouseholdView && gradeInfo && (
              <span className="px-2 py-0.5 rounded-lg bg-white/20 text-white font-bold text-[11px] inline-flex items-center gap-1 border border-white/20 shrink-0">
                <GraduationCap className="w-3 h-3 text-amber-200" />
                <span>{gradeInfo.label}</span>
              </span>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Admin Household View */}
          {adminHouseholdView && isAdmin ? (
            <AdminHouseholdView
              analytics={householdAnalytics}
              kids={kids}
              onSelectKid={(id) => {
                setSelectedKidId(id);
                setAdminHouseholdView(false);
              }}
            />
          ) : kidProgress ? (
            viewMode === 'thorough' && isAdmin ? (
              <AdminKidThoroughView
                progress={kidProgress}
                database={database}
                onUpdateKidFocusSubject={onUpdateKidFocusSubject}
                focusedSubject={focusedSubject}
                onToggleSubjectFocus={(s) =>
                  setFocusedSubject((prev) => (prev === s ? null : s))
                }
              />
            ) : (
              <SimplifiedKidView
                progress={kidProgress}
                gradeInfo={gradeInfo}
              />
            )
          ) : (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              No profile selected.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
            <Target className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>
              {viewMode === 'thorough'
                ? 'Single-attempt integrity: Metrics calculated from 1st-try submissions.'
                : 'Keep solving daily teasers on your 1st try to boost your subject bars!'}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {isAdmin && (
              <button
                id="btn-toggle-view-mode-footer"
                onClick={() => {
                  sound.playTap();
                  setViewMode((prev) => (prev === 'simplified' ? 'thorough' : 'simplified'));
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-black text-xs transition-all cursor-pointer"
              >
                {viewMode === 'thorough' ? 'Switch to Simplified (Kid View)' : 'Switch to Thorough (Admin)'}
              </button>
            )}

            <button
              id="btn-done-progress"
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm transition-all cursor-pointer shadow-sm active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   1. SIMPLIFIED KID VIEW (Bar Graphs, Right vs Wrong, Fun Celebratory Badges)
   ========================================================================= */
interface SimplifiedKidViewProps {
  progress: KidSubjectProgress;
  gradeInfo: any;
}

const SimplifiedKidView: React.FC<SimplifiedKidViewProps> = ({ progress, gradeInfo }) => {
  const hasAnswered = progress.totalAnswered > 0;

  return (
    <div className="space-y-4">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Total Questions Bar / Card */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/80">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400 block">
            Questions
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-indigo-950 dark:text-indigo-100">
              {progress.totalAnswered}
            </span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">Total</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-bold">
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
              ✓ {progress.totalCorrect} Right
            </span>
            <span>•</span>
            <span className="text-rose-600 dark:text-rose-400 font-extrabold">
              ✗ {progress.totalWrong} Wrong
            </span>
          </div>
        </div>

        {/* Overall Accuracy */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
            Accuracy Score
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-100">
              {progress.overallPercentage}%
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Score</span>
          </div>
          {/* Mini progress bar */}
          <div className="w-full bg-emerald-200 dark:bg-emerald-900 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress.overallPercentage}%` }}
            />
          </div>
        </div>

        {/* Superpower Subject */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 block truncate">
            Top Strength ⚡
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-lg">
              {progress.strongestSubject ? progress.strongestSubject.icon : '🌟'}
            </span>
            <span className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-100 truncate">
              {progress.strongestSubject ? progress.strongestSubject.shortLabel : 'Starting Out'}
            </span>
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold mt-1 block">
            {progress.strongestSubject
              ? `${progress.strongestSubject.percentage}% Accuracy`
              : 'Answer teasers to find!'}
          </span>
        </div>

        {/* Bonus Stars Earned */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/80">
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 block">
            Bonus Points 🌟
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-purple-950 dark:text-purple-100">
              +{progress.totalStarsEarned}
            </span>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">Stars</span>
          </div>
          <span className="text-[10px] text-purple-700 dark:text-purple-400 font-bold mt-1 block">
            1st-Try Rewards
          </span>
        </div>
      </div>

      {/* Bar Graphs Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>📊 Subject Progress Bar Graphs</span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              See how many questions you got right (green) vs. wrong (red) in each topic
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Right
            </span>
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              Wrong
            </span>
          </div>
        </div>

        {/* List of Subjects with Visual Bar Graphs */}
        <div className="space-y-2.5">
          {progress.subjects.map((s, idx) => {
            const hasData = s.total > 0;
            const rightWidthPercent = hasData ? (s.correct / s.total) * 100 : 0;
            const wrongWidthPercent = hasData ? (s.wrong / s.total) * 100 : 0;

            return (
              <motion.div
                key={s.subject}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2"
              >
                {/* Subject Header */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl p-1.5 rounded-xl bg-slate-100 dark:bg-slate-700">
                      {s.icon}
                    </span>
                    <div>
                      <span className="font-black text-sm text-slate-900 dark:text-white">
                        {s.label}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                        <span>{s.total} questions answered</span>
                        {s.starsEarned > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-amber-600 dark:text-amber-400 font-extrabold flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400" />
                              +{s.starsEarned}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Percentage & Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-xl text-xs font-black border ${
                        s.percentage >= 80
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-300'
                          : s.percentage >= 60
                          ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 border-indigo-300'
                          : hasData
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500 border-slate-200'
                      }`}
                    >
                      {hasData ? `${s.percentage}% Right` : '0% (New)'}
                    </span>

                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 hidden sm:inline">
                      {s.proficiencyTier === 'Master' && '🏆 Master'}
                      {s.proficiencyTier === 'Proficient' && '⭐ Great'}
                      {s.proficiencyTier === 'Developing' && '🌱 Growing'}
                      {s.proficiencyTier === 'Needs Practice' && '🎯 Practice'}
                      {s.proficiencyTier === 'Not Started' && '✨ Ready'}
                    </span>
                  </div>
                </div>

                {/* VISUAL BAR GRAPH: Stacked Right vs Wrong with Percentage Indicator */}
                <div className="space-y-1">
                  <div className="h-4 sm:h-5 w-full bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden flex shadow-inner relative border border-slate-200/70 dark:border-slate-600">
                    {hasData ? (
                      <>
                        {/* Right Segment (Emerald Green) */}
                        {s.correct > 0 && (
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full flex items-center justify-center text-white text-[10px] font-black transition-all duration-500 px-1 overflow-hidden"
                            style={{ width: `${rightWidthPercent}%` }}
                            title={`${s.correct} Correct (${Math.round(rightWidthPercent)}%)`}
                          >
                            {rightWidthPercent > 15 && `✓ ${s.correct}`}
                          </div>
                        )}
                        {/* Wrong Segment (Rose / Coral Red) */}
                        {s.wrong > 0 && (
                          <div
                            className="bg-gradient-to-r from-rose-500 to-red-600 h-full flex items-center justify-center text-white text-[10px] font-black transition-all duration-500 px-1 overflow-hidden"
                            style={{ width: `${wrongWidthPercent}%` }}
                            title={`${s.wrong} Wrong (${Math.round(wrongWidthPercent)}%)`}
                          >
                            {wrongWidthPercent > 15 && `✗ ${s.wrong}`}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400 italic">
                        No questions in this topic yet
                      </div>
                    )}
                  </div>

                  {/* Sub-bar numbers breakdown */}
                  <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500 dark:text-slate-400 px-1">
                    <span className="text-emerald-700 dark:text-emerald-400">
                      {s.correct} Correct {hasData ? `(${s.percentage}%)` : ''}
                    </span>
                    <span className="text-rose-700 dark:text-rose-400">
                      {s.wrong} Incorrect {hasData ? `(${100 - s.percentage}%)` : ''}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {!hasAnswered && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center space-y-1">
          <span className="text-2xl">🌱</span>
          <h5 className="font-black text-amber-950 dark:text-amber-200 text-sm">
            Your Brain Teaser Journey Starts Today!
          </h5>
          <p className="text-xs text-amber-900/80 dark:text-amber-300/80 font-medium">
            Answer daily questions to see your subject progress bars grow across Math, Science, Logic, Nature, Wordplay, and Riddles!
          </p>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   2. ADMIN THOROUGH VIEW (Detailed Analytics, Diagnostics & Target Focus)
   ========================================================================= */
interface AdminKidThoroughViewProps {
  progress: KidSubjectProgress;
  database: FamilyDatabase;
  onUpdateKidFocusSubject?: (kidId: string, subject: BrainTeaserSubject) => void;
  focusedSubject: string | null;
  onToggleSubjectFocus: (subject: string) => void;
}

const AdminKidThoroughView: React.FC<AdminKidThoroughViewProps> = ({
  progress,
  database,
  onUpdateKidFocusSubject,
  focusedSubject,
  onToggleSubjectFocus,
}) => {
  const kid = database.kids.find((k) => k.id === progress.kidId);
  const currentAssignedFocus = kid?.brainTeaserSubject || 'any';

  return (
    <div className="space-y-4">
      {/* Admin Executive Summary Banner */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-black/10 shrink-0"
              style={{ backgroundColor: progress.color }}
            >
              {progress.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-black text-base text-slate-900 dark:text-white">
                  {progress.kidName}'s Academic Profile
                </h4>
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-extrabold text-[10px]">
                  {progress.gradeLevel.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Current Assigned Focus: <strong className="text-purple-600 dark:text-purple-400">{currentAssignedFocus.toUpperCase()}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Overall Accuracy
              </span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {progress.overallPercentage}%
              </span>
            </div>
            <div className="text-right pl-3 border-l border-slate-300 dark:border-slate-700">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Total Solved
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {progress.totalAnswered}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Diagnostic Insights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block text-[11px]">
              Strongest Subject 🏆
            </span>
            <div className="font-black text-slate-800 dark:text-slate-200 mt-0.5">
              {progress.strongestSubject
                ? `${progress.strongestSubject.icon} ${progress.strongestSubject.label} (${progress.strongestSubject.percentage}%)`
                : 'Insufficient data'}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <span className="font-extrabold text-amber-600 dark:text-amber-400 block text-[11px]">
              Recommended Focus Area 🎯
            </span>
            <div className="font-black text-slate-800 dark:text-slate-200 mt-0.5">
              {progress.challengingSubject
                ? `${progress.challengingSubject.icon} ${progress.challengingSubject.label} (${progress.challengingSubject.percentage}%)`
                : 'Balanced proficiency'}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <span className="font-extrabold text-purple-600 dark:text-purple-400 block text-[11px]">
              Single-Attempt Rule 🎯
            </span>
            <div className="font-black text-slate-800 dark:text-slate-200 mt-0.5">
              Enforced (1 Try / No Retries)
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Subject Matrix & Comparative Bar Graphs */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>Detailed Subject Breakdown (Right vs. Wrong)</span>
          </h4>
          <span className="text-[11px] text-slate-400 font-bold">
            Click any row to view actions
          </span>
        </div>

        {/* Subject cards with rich metrics */}
        <div className="space-y-2.5">
          {progress.subjects.map((s) => {
            const isAssigned = currentAssignedFocus === s.subject;
            const hasData = s.total > 0;
            const rightPct = hasData ? Math.round((s.correct / s.total) * 100) : 0;
            const wrongPct = hasData ? Math.round((s.wrong / s.total) * 100) : 0;

            return (
              <div
                key={s.subject}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                  isAssigned
                    ? 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700 shadow-xs'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-1.5 rounded-xl bg-slate-100 dark:bg-slate-700">
                      {s.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-sm text-slate-900 dark:text-white">
                          {s.label}
                        </span>
                        {isAssigned && (
                          <span className="px-2 py-0.2 rounded-full bg-purple-600 text-white font-black text-[10px]">
                            ACTIVE TARGET
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {s.correct} Right • {s.wrong} Wrong • {s.total} Total Questions
                      </span>
                    </div>
                  </div>

                  {/* Percentage + Admin Quick Focus Button */}
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {hasData ? `${s.percentage}%` : '0%'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 block">
                        Accuracy
                      </span>
                    </div>

                    {onUpdateKidFocusSubject && !isAssigned && (
                      <button
                        id={`btn-set-focus-${s.subject}`}
                        onClick={() => {
                          sound.playUnlock();
                          onUpdateKidFocusSubject(progress.kidId, s.subject);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 cursor-pointer transition-all active:scale-95"
                        title="Set this subject as the daily challenge focus for this child"
                      >
                        Set as Focus 🎯
                      </button>
                    )}
                  </div>
                </div>

                {/* Thorough Stacked Horizontal Bar Graph */}
                <div className="mt-2.5 space-y-1">
                  <div className="h-5 w-full bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden flex border border-slate-200/70 dark:border-slate-600 shadow-inner relative">
                    {hasData ? (
                      <>
                        {s.correct > 0 && (
                          <div
                            className="bg-emerald-500 hover:bg-emerald-600 h-full flex items-center justify-center text-white text-[10px] font-black transition-all px-1.5"
                            style={{ width: `${rightPct}%` }}
                            title={`${s.correct} Right (${rightPct}%)`}
                          >
                            {rightPct > 12 && `Right: ${s.correct} (${rightPct}%)`}
                          </div>
                        )}
                        {s.wrong > 0 && (
                          <div
                            className="bg-rose-500 hover:bg-rose-600 h-full flex items-center justify-center text-white text-[10px] font-black transition-all px-1.5"
                            style={{ width: `${wrongPct}%` }}
                            title={`${s.wrong} Wrong (${wrongPct}%)`}
                          >
                            {wrongPct > 12 && `Wrong: ${s.wrong} (${wrongPct}%)`}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-bold italic">
                        No attempts recorded in this subject yet
                      </div>
                    )}
                  </div>

                  {/* Benchmark scale indicators */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                    <span>0%</span>
                    <span>25%</span>
                    <span className="text-amber-500 font-bold">50% (Passing)</span>
                    <span className="text-emerald-500 font-bold">75% (Proficient)</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   3. ADMIN HOUSEHOLD VIEW (Cross-Kid Comparison & Household Subject Matrix)
   ========================================================================= */
interface AdminHouseholdViewProps {
  analytics: ReturnType<typeof getHouseholdBrainTeaserAnalytics>;
  kids: KidProfile[];
  onSelectKid: (id: string) => void;
}

const AdminHouseholdView: React.FC<AdminHouseholdViewProps> = ({
  analytics,
  kids,
  onSelectKid,
}) => {
  return (
    <div className="space-y-4">
      {/* Household High-Level Numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400 block">
            Total Solved
          </span>
          <span className="text-xl sm:text-2xl font-black text-indigo-950 dark:text-indigo-100">
            {analytics.totalHouseholdAnswered}
          </span>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block mt-0.5">
            Household Questions
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
            Household Accuracy
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-100">
            {analytics.householdPercentage}%
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
            Overall Right Answers
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
          <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 block">
            Incorrect Tries
          </span>
          <span className="text-xl sm:text-2xl font-black text-rose-950 dark:text-rose-100">
            {analytics.totalHouseholdWrong}
          </span>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold block mt-0.5">
            Opportunities to Learn
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
            Total Points Won
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-950 dark:text-amber-100">
            +{analytics.totalStarsAwarded}
          </span>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block mt-0.5">
            Stars Distributed
          </span>
        </div>
      </div>

      {/* Household Subject Comparison Bar Graphs */}
      <div className="space-y-3">
        <h4 className="font-black text-sm text-slate-900 dark:text-white">
          Household Subject Proficiency (All Kids Combined)
        </h4>

        <div className="space-y-2.5">
          {analytics.householdSubjectMetrics.map((hm) => {
            const hasData = hm.total > 0;
            const rightPct = hasData ? Math.round((hm.correct / hm.total) * 100) : 0;
            const wrongPct = hasData ? Math.round((hm.wrong / hm.total) * 100) : 0;

            return (
              <div
                key={hm.subject}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{hm.icon}</span>
                    <span className="font-black text-sm text-slate-900 dark:text-white">
                      {hm.label}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">
                      ({hm.correct} Right / {hm.wrong} Wrong)
                    </span>
                  </div>
                  <span className="font-black text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                    {hasData ? `${hm.percentage}% Accuracy` : 'No Data'}
                  </span>
                </div>

                <div className="h-4 w-full bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden flex">
                  {hasData ? (
                    <>
                      <div
                        className="bg-emerald-500 h-full transition-all"
                        style={{ width: `${rightPct}%` }}
                      />
                      <div
                        className="bg-rose-500 h-full transition-all"
                        style={{ width: `${wrongPct}%` }}
                      />
                    </>
                  ) : (
                    <div className="w-full h-full bg-slate-200 dark:bg-slate-700 opacity-40" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-Kid Comparison Cards */}
      <div className="space-y-2.5 pt-2">
        <h4 className="font-black text-sm text-slate-900 dark:text-white">
          Children Side-by-Side Comparison
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {analytics.kidProgresses.map((kp) => (
            <div
              key={kp.kidId}
              onClick={() => onSelectKid(kp.kidId)}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer shadow-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-xs"
                    style={{ backgroundColor: kp.color }}
                  >
                    {kp.avatar}
                  </div>
                  <div>
                    <h5 className="font-black text-sm text-slate-900 dark:text-white">
                      {kp.kidName}
                    </h5>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {kp.totalAnswered} Questions • {kp.overallPercentage}% Accuracy
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              {/* Mini visual summary */}
              <div className="mt-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${kp.overallPercentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
