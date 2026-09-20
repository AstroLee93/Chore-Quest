import { GradeLevel, KidProfile } from '../types';
import { BrainTeaser, BRAIN_TEASERS_CATALOG } from './brainTeasersData';

export type { BrainTeaser };
export { BRAIN_TEASERS_CATALOG };
export interface GradeLevelInfo {
  id: GradeLevel;
  label: string;
  shortLabel: string;
  ages: string;
  icon: string;
  color: string;
  description: string;
}

export const GRADE_LEVELS: Record<GradeLevel, GradeLevelInfo> = {
  kindergarten: {
    id: 'kindergarten',
    label: 'Kindergarten & Pre-K',
    shortLabel: 'Kindergarten',
    ages: 'Ages 4–6',
    icon: '🌱',
    color: 'from-emerald-400 to-teal-500',
    description: 'Shapes, colors, counting, baby animal names, rhyming words & simple riddles.',
  },
  '1st_grade': {
    id: '1st_grade',
    label: '1st Grade',
    shortLabel: '1st Grade',
    ages: 'Ages 6–7',
    icon: '✏️',
    color: 'from-sky-400 to-blue-500',
    description: 'Addition & subtraction to 20, telling time, basic phonics, patterns & nature facts.',
  },
  '2nd_grade': {
    id: '2nd_grade',
    label: '2nd Grade',
    shortLabel: '2nd Grade',
    ages: 'Ages 7–8',
    icon: '📚',
    color: 'from-indigo-400 to-violet-500',
    description: 'Two-digit math, coin counting, animal habitats, spelling patterns & fun logic.',
  },
  '3rd_grade': {
    id: '3rd_grade',
    label: '3rd Grade',
    shortLabel: '3rd Grade',
    ages: 'Ages 8–9',
    icon: '🔬',
    color: 'from-purple-400 to-pink-500',
    description: 'Intro to multiplication, basic fractions, solar system, mystery words & word puzzles.',
  },
  '4th_grade': {
    id: '4th_grade',
    label: '4th Grade',
    shortLabel: '4th Grade',
    ages: 'Ages 9–10',
    icon: '🧭',
    color: 'from-amber-400 to-orange-500',
    description: 'Multi-digit arithmetic, US geography, ecosystems, lateral thinking & idioms.',
  },
  '5th_grade': {
    id: '5th_grade',
    label: '5th Grade',
    shortLabel: '5th Grade',
    ages: 'Ages 10–11',
    icon: '🚀',
    color: 'from-rose-400 to-red-500',
    description: 'Decimals, volume & area, planetary science, vocabulary analogies & tricky riddles.',
  },
  middle_school: {
    id: 'middle_school',
    label: 'Middle School (6th–8th)',
    shortLabel: 'Middle School',
    ages: 'Ages 11–14',
    icon: '⚡',
    color: 'from-cyan-500 to-blue-600',
    description: 'Pre-algebra, physical sciences, world history, deduction, logic & cipher codes.',
  },
  high_school: {
    id: 'high_school',
    label: 'High School (9th–12th)',
    shortLabel: 'High School',
    ages: 'Ages 14–18',
    icon: '🎓',
    color: 'from-fuchsia-500 to-purple-700',
    description: 'Algebra & geometry, advanced sciences, literature trivia, logic fallacies & brain teasers.',
  },
};

export const GRADE_LEVEL_LIST: GradeLevelInfo[] = [
  GRADE_LEVELS.kindergarten,
  GRADE_LEVELS['1st_grade'],
  GRADE_LEVELS['2nd_grade'],
  GRADE_LEVELS['3rd_grade'],
  GRADE_LEVELS['4th_grade'],
  GRADE_LEVELS['5th_grade'],
  GRADE_LEVELS.middle_school,
  GRADE_LEVELS.high_school,
];

export const DEFAULT_BRAIN_TEASER_REWARD_STARS = 5;

export function getGradeLevelInfo(gradeLevel?: GradeLevel): GradeLevelInfo {
  if (!gradeLevel || !GRADE_LEVELS[gradeLevel]) {
    return GRADE_LEVELS['1st_grade'];
  }
  return GRADE_LEVELS[gradeLevel];
}

export function getTeasersForGrade(gradeLevel: GradeLevel): BrainTeaser[] {
  const teasers = BRAIN_TEASERS_CATALOG.filter((t) => t.gradeLevel === gradeLevel);
  if (teasers.length === 0) {
    return BRAIN_TEASERS_CATALOG.filter((t) => t.gradeLevel === '1st_grade');
  }
  return teasers;
}

export const DEFAULT_BRAIN_TEASER_DAILY_LIMIT = 1;

/**
 * Deterministically retrieves the Daily Brain Teaser for a kid based on date, assigned grade level, and question index.
 */
export function getDailyTeaserForKid(kid: KidProfile, dateStr?: string, questionIndex: number = 0): BrainTeaser {
  const grade = kid.gradeLevel || '1st_grade';
  const teasers = getTeasersForGrade(grade);
  const targetDate = dateStr || new Date().toISOString().split('T')[0];

  // Hash the date string to select a daily starting index
  let hash = 0;
  for (let i = 0; i < targetDate.length; i++) {
    hash = (hash << 5) - hash + targetDate.charCodeAt(i);
    hash |= 0;
  }
  const baseIndex = Math.abs(hash) % teasers.length;
  const index = (baseIndex + Math.max(0, questionIndex)) % teasers.length;
  return teasers[index];
}

/**
 * Cycles to the next available teaser in the grade level for practice mode.
 */
export function getNextTeaser(gradeLevel: GradeLevel, currentTeaserId: string): BrainTeaser {
  const teasers = getTeasersForGrade(gradeLevel);
  const currentIndex = teasers.findIndex((t) => t.id === currentTeaserId);
  const nextIndex = (currentIndex + 1) % teasers.length;
  return teasers[nextIndex];
}

/**
 * Returns how many brain teaser questions the child has completed today.
 */
export function getDailyTeasersAnsweredToday(kid: KidProfile, dateStr?: string): number {
  const targetDate = dateStr || new Date().toISOString().split('T')[0];
  if (kid.brainTeaserHistory?.lastCompletedDate !== targetDate) {
    return 0;
  }
  return kid.brainTeaserHistory.todayAnsweredCount ?? 1;
}

/**
 * Checks if the kid has already completed today's teaser challenge.
 */
export function hasCompletedDailyTeaser(kid: KidProfile, dateStr?: string): boolean {
  const targetDate = dateStr || new Date().toISOString().split('T')[0];
  return kid.brainTeaserHistory?.lastCompletedDate === targetDate;
}

/**
 * Checks if the kid has reached the admin-configured daily limit for brain teasers.
 */
export function hasReachedDailyTeaserLimit(
  kid: KidProfile,
  dailyLimit: number = DEFAULT_BRAIN_TEASER_DAILY_LIMIT,
  dateStr?: string
): boolean {
  const answeredToday = getDailyTeasersAnsweredToday(kid, dateStr);
  return answeredToday >= dailyLimit;
}
