import { KidProfile, BrainTeaserSubject, BrainTeaserSubjectStat } from '../types';
import { BRAIN_TEASER_SUBJECTS, getSubjectInfo } from './brainTeasers';
import { BRAIN_TEASERS_CATALOG } from './brainTeasersData';

export const TRACKABLE_SUBJECTS: Array<Exclude<BrainTeaserSubject, 'any'>> = [
  'math',
  'science',
  'logic',
  'riddle',
  'nature',
  'wordplay',
];

export interface SubjectMetric {
  subject: Exclude<BrainTeaserSubject, 'any'>;
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  barColor: string;
  correct: number;
  wrong: number;
  total: number;
  percentage: number; // 0-100
  starsEarned: number;
  lastAttemptedDate?: string;
  proficiencyTier: 'Master' | 'Proficient' | 'Developing' | 'Needs Practice' | 'Not Started';
}

export interface KidSubjectProgress {
  kidId: string;
  kidName: string;
  avatar: string;
  color: string;
  gradeLevel: string;
  totalAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  overallPercentage: number;
  totalStarsEarned: number;
  strongestSubject: SubjectMetric | null;
  challengingSubject: SubjectMetric | null;
  mostPracticedSubject: SubjectMetric | null;
  subjects: SubjectMetric[];
}

export const SUBJECT_THEMES: Record<
  Exclude<BrainTeaserSubject, 'any'>,
  { color: string; bgColor: string; borderColor: string; barColor: string }
> = {
  math: {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    borderColor: 'border-blue-200 dark:border-blue-800',
    barColor: 'from-blue-500 to-indigo-600',
  },
  science: {
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    barColor: 'from-emerald-500 to-teal-600',
  },
  logic: {
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/40',
    borderColor: 'border-purple-200 dark:border-purple-800',
    barColor: 'from-purple-500 to-violet-600',
  },
  riddle: {
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    borderColor: 'border-amber-200 dark:border-amber-800',
    barColor: 'from-amber-500 to-yellow-600',
  },
  nature: {
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-950/40',
    borderColor: 'border-teal-200 dark:border-teal-800',
    barColor: 'from-teal-500 to-cyan-600',
  },
  wordplay: {
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/40',
    borderColor: 'border-rose-200 dark:border-rose-800',
    barColor: 'from-rose-500 to-pink-600',
  },
};

export function getProficiencyTier(
  percentage: number,
  total: number
): 'Master' | 'Proficient' | 'Developing' | 'Needs Practice' | 'Not Started' {
  if (total === 0) return 'Not Started';
  if (percentage >= 85) return 'Master';
  if (percentage >= 70) return 'Proficient';
  if (percentage >= 50) return 'Developing';
  return 'Needs Practice';
}

/**
 * Computes unified subject metrics for a single kid.
 * Backfills from completed question IDs if subjectStats is not yet populated.
 */
export function getKidSubjectProgress(kid: KidProfile): KidSubjectProgress {
  const history = kid.brainTeaserHistory || {};
  const storedStats = history.subjectStats || {};

  // Build subject metrics
  const subjects: SubjectMetric[] = TRACKABLE_SUBJECTS.map((subjectKey) => {
    const info = getSubjectInfo(subjectKey);
    const theme = SUBJECT_THEMES[subjectKey];
    const stat = storedStats[subjectKey];

    let correct = stat?.correct ?? 0;
    let wrong = stat?.wrong ?? 0;
    let total = stat?.total ?? 0;
    let starsEarned = stat?.starsEarned ?? 0;
    const lastAttemptedDate = stat?.lastAttemptedDate;

    // Fallback backfill heuristic if history has total answers but no subject stats recorded yet
    if (total === 0 && (history.completedQuestionIds?.length || 0) > 0) {
      const matchedSubjectQuestions = BRAIN_TEASERS_CATALOG.filter(
        (q) => q.subject === subjectKey && history.completedQuestionIds?.includes(q.id)
      );
      if (matchedSubjectQuestions.length > 0) {
        total = matchedSubjectQuestions.length;
        // Distribute proportionally if totalCorrect known
        const kidTotalAnswered = history.totalAnswered || matchedSubjectQuestions.length;
        const kidRatio = (history.totalCorrect || 0) / Math.max(1, kidTotalAnswered);
        correct = Math.round(total * kidRatio);
        wrong = Math.max(0, total - correct);
      }
    }

    // Ensure invariants
    if (total > 0 && correct + wrong !== total) {
      wrong = Math.max(0, total - correct);
    }
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const proficiencyTier = getProficiencyTier(percentage, total);

    return {
      subject: subjectKey,
      label: info.label,
      shortLabel: info.shortLabel,
      icon: info.icon,
      color: theme.color,
      bgColor: theme.bgColor,
      borderColor: theme.borderColor,
      barColor: theme.barColor,
      correct,
      wrong,
      total,
      percentage,
      starsEarned,
      lastAttemptedDate,
      proficiencyTier,
    };
  });

  const totalAnswered = subjects.reduce((sum, s) => sum + s.total, 0) || history.totalAnswered || 0;
  const totalCorrect = subjects.reduce((sum, s) => sum + s.correct, 0) || history.totalCorrect || 0;
  const totalWrong = Math.max(0, totalAnswered - totalCorrect);
  const overallPercentage = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const totalStarsEarned = history.totalStarsEarned || 0;

  // Subjects with at least 1 answer for strength/challenge determination
  const activeSubjects = subjects.filter((s) => s.total > 0);

  const strongestSubject =
    activeSubjects.length > 0
      ? [...activeSubjects].sort((a, b) => {
          if (b.percentage !== a.percentage) return b.percentage - a.percentage;
          return b.correct - a.correct;
        })[0]
      : null;

  const challengingSubject =
    activeSubjects.length > 0
      ? [...activeSubjects].sort((a, b) => {
          if (a.percentage !== b.percentage) return a.percentage - b.percentage;
          return b.wrong - a.wrong;
        })[0]
      : null;

  const mostPracticedSubject =
    activeSubjects.length > 0
      ? [...activeSubjects].sort((a, b) => b.total - a.total)[0]
      : null;

  return {
    kidId: kid.id,
    kidName: kid.name,
    avatar: kid.avatar,
    color: kid.color || '#3b82f6',
    gradeLevel: kid.gradeLevel || '1st_grade',
    totalAnswered,
    totalCorrect,
    totalWrong,
    overallPercentage,
    totalStarsEarned,
    strongestSubject,
    challengingSubject,
    mostPracticedSubject,
    subjects,
  };
}

/**
 * Aggregates analytics across all children for comprehensive Admin view.
 */
export function getHouseholdBrainTeaserAnalytics(kids: KidProfile[]) {
  const kidProgresses = kids.map((k) => getKidSubjectProgress(k));

  const totalHouseholdAnswered = kidProgresses.reduce((sum, kp) => sum + kp.totalAnswered, 0);
  const totalHouseholdCorrect = kidProgresses.reduce((sum, kp) => sum + kp.totalCorrect, 0);
  const totalHouseholdWrong = kidProgresses.reduce((sum, kp) => sum + kp.totalWrong, 0);
  const householdPercentage =
    totalHouseholdAnswered > 0
      ? Math.round((totalHouseholdCorrect / totalHouseholdAnswered) * 100)
      : 0;
  const totalStarsAwarded = kidProgresses.reduce((sum, kp) => sum + kp.totalStarsEarned, 0);

  // Cross-household subject totals
  const householdSubjectMetrics = TRACKABLE_SUBJECTS.map((subjectKey) => {
    const info = getSubjectInfo(subjectKey);
    const theme = SUBJECT_THEMES[subjectKey];

    let correct = 0;
    let wrong = 0;
    let total = 0;
    let starsEarned = 0;

    kidProgresses.forEach((kp) => {
      const s = kp.subjects.find((item) => item.subject === subjectKey);
      if (s) {
        correct += s.correct;
        wrong += s.wrong;
        total += s.total;
        starsEarned += s.starsEarned;
      }
    });

    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    return {
      subject: subjectKey,
      label: info.label,
      shortLabel: info.shortLabel,
      icon: info.icon,
      color: theme.color,
      bgColor: theme.bgColor,
      borderColor: theme.borderColor,
      barColor: theme.barColor,
      correct,
      wrong,
      total,
      percentage,
      starsEarned,
      proficiencyTier: getProficiencyTier(percentage, total),
    };
  });

  return {
    kidProgresses,
    totalHouseholdAnswered,
    totalHouseholdCorrect,
    totalHouseholdWrong,
    householdPercentage,
    totalStarsAwarded,
    householdSubjectMetrics,
  };
}
