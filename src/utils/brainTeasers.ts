import { GradeLevel, KidProfile, BrainTeaserSubject } from '../types';
import { BrainTeaser, BRAIN_TEASERS_CATALOG } from './brainTeasersData';

export type { BrainTeaser, BrainTeaserSubject };
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

export interface BrainTeaserSubjectInfo {
  id: BrainTeaserSubject;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
}

export const BRAIN_TEASER_SUBJECTS: BrainTeaserSubjectInfo[] = [
  {
    id: 'any',
    label: 'All Topics (Mixed)',
    shortLabel: 'All Topics',
    icon: '🌟',
    description: 'Rotates daily across math, science, nature, wordplay, logic, and riddles.',
  },
  {
    id: 'math',
    label: 'Math & Numbers',
    shortLabel: 'Math',
    icon: '🧮',
    description: 'Arithmetic, geometry, counting, word problems, and numerical patterns.',
  },
  {
    id: 'science',
    label: 'Science & Discovery',
    shortLabel: 'Science',
    icon: '🔬',
    description: 'Physics, chemistry, astronomy, earth science, and scientific inquiry.',
  },
  {
    id: 'nature',
    label: 'Nature & Animals',
    shortLabel: 'Nature',
    icon: '🌿',
    description: 'Animal kingdom, habitats, plants, biology, and ecosystems.',
  },
  {
    id: 'wordplay',
    label: 'Wordplay & Language',
    shortLabel: 'Wordplay',
    icon: '🔤',
    description: 'Phonics, vocabulary, spelling, rhyming, analogies, and idioms.',
  },
  {
    id: 'logic',
    label: 'Logic & Reasoning',
    shortLabel: 'Logic',
    icon: '🧩',
    description: 'Deduction, patterns, spatial puzzles, codes, and critical thinking.',
  },
  {
    id: 'riddle',
    label: 'Riddles & Lateral Thinking',
    shortLabel: 'Riddles',
    icon: '💡',
    description: 'Lateral thinking traps, clever clues, and creative problem solving.',
  },
];

export function getSubjectInfo(subject?: BrainTeaserSubject | string): BrainTeaserSubjectInfo {
  const found = BRAIN_TEASER_SUBJECTS.find((s) => s.id === subject);
  return found || BRAIN_TEASER_SUBJECTS[0];
}

export function getGradeLevelInfo(gradeLevel?: GradeLevel): GradeLevelInfo {
  if (!gradeLevel || !GRADE_LEVELS[gradeLevel]) {
    return GRADE_LEVELS['1st_grade'];
  }
  return GRADE_LEVELS[gradeLevel];
}

export function getTeasersForGrade(gradeLevel: GradeLevel, subject?: string): BrainTeaser[] {
  let teasers = BRAIN_TEASERS_CATALOG.filter((t) => t.gradeLevel === gradeLevel);
  if (teasers.length === 0) {
    teasers = BRAIN_TEASERS_CATALOG.filter((t) => t.gradeLevel === '1st_grade');
  }
  if (subject && subject !== 'any') {
    const filtered = teasers.filter((t) => t.subject === subject);
    if (filtered.length >= 3) {
      return filtered;
    }
    // If fewer than 3 questions in this grade for the subject, supplement from all grades for variety
    const otherSubjectTeasers = BRAIN_TEASERS_CATALOG.filter(
      (t) => t.subject === subject && t.gradeLevel !== gradeLevel
    );
    return [...filtered, ...otherSubjectTeasers];
  }
  return teasers;
}

export const DEFAULT_BRAIN_TEASER_DAILY_LIMIT = 1;

/**
 * Deterministically retrieves the Daily Brain Teaser for a kid based on date, assigned grade level, assigned subject, and question index,
 * prioritizing questions the child has not completed yet to prevent repetition.
 */
export function getDailyTeaserForKid(kid: KidProfile, dateStr?: string, questionIndex: number = 0): BrainTeaser {
  const grade = kid.gradeLevel || '1st_grade';
  const targetSubject = kid.brainTeaserSubject || 'any';
  const allTeasers = getTeasersForGrade(grade, targetSubject);
  const targetDate = dateStr || new Date().toISOString().split('T')[0];

  // Prioritize teasers that the child has not completed yet
  const completedIds = new Set(kid.brainTeaserHistory?.completedQuestionIds || []);
  const uncompleted = allTeasers.filter((t) => !completedIds.has(t.id));
  const teasers = uncompleted.length > 0 ? uncompleted : allTeasers;

  // Salt the hash with the kid ID and question index so siblings and repeat visits get fresh variety
  let hash = 0;
  const seed = `${targetDate}-${kid.id || 'default'}-${questionIndex}`;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % teasers.length;
  return teasers[index];
}

/**
 * Cycles to the next available teaser in the grade level for practice mode, avoiding recently answered questions.
 */
export function getNextTeaser(gradeLevel: GradeLevel, currentTeaserId: string, subject?: string, excludeIds?: string[]): BrainTeaser {
  const teasers = getTeasersForGrade(gradeLevel, subject);
  const excludeSet = new Set(excludeIds || []);
  excludeSet.add(currentTeaserId);
  const candidates = teasers.filter((t) => !excludeSet.has(t.id));
  if (candidates.length > 0) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
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

/**
 * Dynamically fetches a fresh AI-generated brain teaser from the backend Gemini API
 * tuned specifically to the child's grade curriculum, with transparent offline fallback.
 */
export async function fetchAiBrainTeaser(params: {
  gradeLevel: GradeLevel;
  kidName?: string;
  excludeQuestionIds?: string[];
  recentQuestions?: string[];
  preferredSubject?: string;
}): Promise<BrainTeaser> {
  try {
    const res = await fetch('/api/brain-teasers/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.teaser && data.teaser.question && Array.isArray(data.teaser.options)) {
        return data.teaser;
      }
    }
  } catch (err) {
    console.warn('[BrainTeasers] AI generation network call failed, using offline bank:', err);
  }

  // Resilient fallback to static catalog
  const gradeTeasers = getTeasersForGrade(params.gradeLevel, params.preferredSubject);
  const exclude = new Set(params.excludeQuestionIds || []);
  const available = gradeTeasers.filter((t) => !exclude.has(t.id));
  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }
  // If all questions in this grade were completed, draw from all uncompleted questions in catalog
  const catalogAvailable = BRAIN_TEASERS_CATALOG.filter((t) => !exclude.has(t.id));
  if (catalogAvailable.length > 0) {
    return catalogAvailable[Math.floor(Math.random() * catalogAvailable.length)];
  }
  return gradeTeasers[Math.floor(Math.random() * gradeTeasers.length)];
}
