import { GradeLevel, KidProfile, BrainTeaserSubject, ChoreLog } from '../types';
import { BrainTeaser, BRAIN_TEASERS_CATALOG } from './brainTeasersData';

export type { BrainTeaser, BrainTeaserSubject };
export { BRAIN_TEASERS_CATALOG };

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'about', 'against',
  'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'from', 'up', 'down', 'in', 'out', 'off', 'over', 'under', 'again',
  'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
  'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'what', 'which',
  'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'do', 'does', 'did',
  'doing', 'would', 'could', 'you', 'your', 'my', 'his', 'her', 'their', 'its',
  'we', 'they', 'i', 'me', 'him', 'them', 'us', 'following', 'true', 'false',
]);

/**
 * Extracts salient keywords from a question text for semantic and lexical comparison.
 */
export function cleanKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

/**
 * Checks if two answers/solutions are identical, singular/plural variants,
 * or share core numeric/semantic equivalence.
 */
export function isAnswerTooSimilar(ans1?: string, ans2?: string): boolean {
  if (!ans1 || !ans2) return false;
  const a1 = ans1.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim().replace(/\s+/g, ' ');
  const a2 = ans2.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim().replace(/\s+/g, ' ');
  if (!a1 || !a2) return false;
  if (a1 === a2) return true;

  // Direct singular vs plural forms (e.g. "root" vs "roots", "duckling" vs "ducklings")
  const compact1 = a1.replace(/\s+/g, '');
  const compact2 = a2.replace(/\s+/g, '');
  if (compact1 === compact2) return true;
  if (compact1 + 's' === compact2 || compact2 + 's' === compact1) return true;
  if (compact1 + 'es' === compact2 || compact2 + 'es' === compact1) return true;

  // Substring match for distinct names/terms (e.g. "Jupiter" in "Planet Jupiter")
  if (compact1.length >= 4 && compact2.length >= 4) {
    if (compact1.includes(compact2) || compact2.includes(compact1)) return true;
  }

  return false;
}

/**
 * Robustly tests if two questions share meaningful keyword similarity (>= 33%),
 * identical substrings, or matching n-grams, preventing repeat or rephrased questions.
 */
export function isQuestionTooSimilar(q1: string, q2: string): boolean {
  if (!q1 || !q2) return false;
  const s1 = q1.trim().toLowerCase();
  const s2 = q2.trim().toLowerCase();
  if (s1 === s2) return true;

  // Direct substring check for core riddle premises
  if (s1.length > 15 && s2.length > 15) {
    if (s1.includes(s2) || s2.includes(s1)) return true;
  }

  const k1 = cleanKeywords(q1);
  const k2 = cleanKeywords(q2);
  if (k1.length === 0 || k2.length === 0) return false;

  const set1 = new Set(k1);
  const set2 = new Set(k2);

  let intersectionCount = 0;
  for (const word of set1) {
    if (set2.has(word)) intersectionCount++;
  }

  const unionCount = new Set([...k1, ...k2]).size;
  const jaccard = intersectionCount / Math.max(1, unionCount);

  // If >= 33% keyword overlap, treat as a potential duplicate/rephrase
  if (jaccard >= 0.33) return true;

  // Check 2-word bigrams if there is any shared vocabulary
  if (k1.length >= 2 && k2.length >= 2 && intersectionCount >= 2) {
    const bigrams1 = new Set<string>();
    for (let i = 0; i <= k1.length - 2; i++) {
      bigrams1.add(`${k1[i]}_${k1[i + 1]}`);
    }
    for (let j = 0; j <= k2.length - 2; j++) {
      const bi = `${k2[j]}_${k2[j + 1]}`;
      if (bigrams1.has(bi)) return true;
    }
  }

  // Check 3-word n-gram shingles
  if (k1.length >= 3 && k2.length >= 3) {
    const trigrams1 = new Set<string>();
    for (let i = 0; i <= k1.length - 3; i++) {
      trigrams1.add(`${k1[i]}_${k1[i + 1]}_${k1[i + 2]}`);
    }
    for (let j = 0; j <= k2.length - 3; j++) {
      const tri = `${k2[j]}_${k2[j + 1]}_${k2[j + 2]}`;
      if (trigrams1.has(tri)) return true;
    }
  }

  return false;
}

/**
 * Validates a candidate BrainTeaser against both recent questions AND recent answers.
 */
export function isBrainTeaserDuplicate(
  candidate: { question: string; options?: string[]; correctAnswerIndex?: number },
  recentQuestions: string[],
  recentAnswers: string[] = []
): boolean {
  if (!candidate || !candidate.question) return false;

  // 1. Question similarity check
  if (recentQuestions.some((rq) => isQuestionTooSimilar(candidate.question, rq))) {
    return true;
  }

  // 2. Answer duplicate check (prevents repeating the same punchline/fact)
  if (
    Array.isArray(candidate.options) &&
    typeof candidate.correctAnswerIndex === 'number' &&
    candidate.options[candidate.correctAnswerIndex]
  ) {
    const candidateAnswer = candidate.options[candidate.correctAnswerIndex];
    if (recentAnswers.some((ra) => isAnswerTooSimilar(candidateAnswer, ra))) {
      return true;
    }
  }

  return false;
}

/**
 * Comprehensive historical extractor that collects all questions previously encountered
 * by a child, pulling from both the profile's recentQuestionTexts and historical logs.
 */
export function getKidRecentQuestions(kid: KidProfile, logs: ChoreLog[] = []): string[] {
  const set = new Set<string>();

  // 1. From kid's stored brainTeaserHistory.recentQuestionTexts
  if (Array.isArray(kid.brainTeaserHistory?.recentQuestionTexts)) {
    kid.brainTeaserHistory.recentQuestionTexts.forEach((q) => {
      if (q && q.trim()) set.add(q.trim());
    });
  }

  // 2. From database.logs for this kid (backfills past completed teasers seamlessly)
  if (Array.isArray(logs)) {
    logs.forEach((log) => {
      if (log.kidId === kid.id && log.choreId?.startsWith('brain-teaser')) {
        if (Array.isArray(log.completedSubtasks)) {
          log.completedSubtasks.forEach((sub) => {
            const match = sub.match(/Brain Teaser[^:]*:\s*(.+)$/i);
            if (match && match[1]) {
              set.add(match[1].trim());
            }
          });
        }
        if (log.choreTitle && log.choreTitle.startsWith('🧠 Brain Teaser:')) {
          const raw = log.choreTitle.replace(/^🧠 Brain Teaser:\s*/, '').replace(/\.\.\.$/, '').trim();
          if (raw.length > 10) set.add(raw);
        }
      }
    });
  }

  // 3. Map completed catalog IDs back to their question texts
  const completedIds = new Set(kid.brainTeaserHistory?.completedQuestionIds || []);
  BRAIN_TEASERS_CATALOG.forEach((catItem) => {
    if (completedIds.has(catItem.id)) {
      set.add(catItem.question.trim());
    }
  });

  return Array.from(set).slice(-75);
}

/**
 * Extracts recent answers achieved by the child to prevent repeating questions with identical answers.
 */
export function getKidRecentAnswers(kid: KidProfile, logs: ChoreLog[] = []): string[] {
  const set = new Set<string>();

  // 1. From kid's stored brainTeaserHistory.recentAnswers
  if (Array.isArray(kid.brainTeaserHistory?.recentAnswers)) {
    kid.brainTeaserHistory.recentAnswers.forEach((a) => {
      if (a && a.trim()) set.add(a.trim());
    });
  }

  // 2. From database.logs
  if (Array.isArray(logs)) {
    logs.forEach((log) => {
      if (log.kidId === kid.id && log.choreId?.startsWith('brain-teaser')) {
        if (Array.isArray(log.completedSubtasks)) {
          log.completedSubtasks.forEach((sub) => {
            const match = sub.match(/^Answer:\s*(.+)$/i);
            if (match && match[1]) {
              set.add(match[1].trim());
            }
          });
        }
      }
    });
  }

  // 3. Map completed catalog IDs to answers
  const completedIds = new Set(kid.brainTeaserHistory?.completedQuestionIds || []);
  BRAIN_TEASERS_CATALOG.forEach((catItem) => {
    if (completedIds.has(catItem.id) && Array.isArray(catItem.options) && catItem.options[catItem.correctAnswerIndex]) {
      set.add(catItem.options[catItem.correctAnswerIndex].trim());
    }
  });

  return Array.from(set).slice(-40);
}

/**
 * Extracts recent concepts and topics to rotate away from in subsequent challenges.
 */
export function getKidRecentConcepts(kid: KidProfile, logs: ChoreLog[] = []): string[] {
  const set = new Set<string>();

  if (Array.isArray(kid.brainTeaserHistory?.recentConcepts)) {
    kid.brainTeaserHistory.recentConcepts.forEach((c) => {
      if (c && c.trim()) set.add(c.trim());
    });
  }

  if (Array.isArray(logs)) {
    logs.forEach((log) => {
      if (log.kidId === kid.id && log.choreId?.startsWith('brain-teaser')) {
        if (Array.isArray(log.completedSubtasks)) {
          log.completedSubtasks.forEach((sub) => {
            const match = sub.match(/Brain Teaser \(([^)]+)\):/i);
            if (match && match[1]) {
              set.add(match[1].trim());
            }
          });
        }
      }
    });
  }

  const completedIds = new Set(kid.brainTeaserHistory?.completedQuestionIds || []);
  BRAIN_TEASERS_CATALOG.forEach((catItem) => {
    if (completedIds.has(catItem.id) && (catItem.conceptTag || catItem.subjectLabel)) {
      set.add((catItem.conceptTag || catItem.subjectLabel).trim());
    }
  });

  return Array.from(set).slice(-30);
}
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
 * prioritizing questions the child has not completed and checking lexical/semantic similarity against recent questions and answers to prevent repetition.
 */
export function getDailyTeaserForKid(
  kid: KidProfile,
  dateStr?: string,
  questionIndex: number = 0,
  recentQuestions: string[] = [],
  recentAnswers: string[] = []
): BrainTeaser {
  const grade = kid.gradeLevel || '1st_grade';
  const targetSubject = kid.brainTeaserSubject || 'any';
  const allTeasers = getTeasersForGrade(grade, targetSubject);
  const targetDate = dateStr || new Date().toISOString().split('T')[0];

  // Combine kid's history with any passed recent questions and answers
  const completedIds = new Set(kid.brainTeaserHistory?.completedQuestionIds || []);
  const combinedRecentQuestions = Array.from(
    new Set([...(kid.brainTeaserHistory?.recentQuestionTexts || []), ...recentQuestions])
  );
  const combinedRecentAnswers = Array.from(
    new Set([...(kid.brainTeaserHistory?.recentAnswers || []), ...recentAnswers])
  );

  // Filter grade-level teasers that are neither completed nor similar to recent questions/answers
  const uncompleted = allTeasers.filter((t) => {
    if (completedIds.has(t.id)) return false;
    if (isBrainTeaserDuplicate(t, combinedRecentQuestions, combinedRecentAnswers)) return false;
    return true;
  });

  // If all grade-level teasers were completed or too similar, draw from uncompleted teasers across other grades
  let candidatePool = uncompleted;
  if (candidatePool.length === 0) {
    const catalogUncompleted = BRAIN_TEASERS_CATALOG.filter((t) => {
      if (completedIds.has(t.id)) return false;
      if (isBrainTeaserDuplicate(t, combinedRecentQuestions, combinedRecentAnswers)) return false;
      return true;
    });
    candidatePool = catalogUncompleted.length > 0 ? catalogUncompleted : allTeasers;
  }

  // Salt the hash with the kid ID and question index so siblings and repeat visits get fresh variety
  let hash = 0;
  const seed = `${targetDate}-${kid.id || 'default'}-${questionIndex}`;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % candidatePool.length;
  return candidatePool[index];
}

/**
 * Cycles to the next available teaser in the grade level for practice mode, avoiding recently answered or similar questions.
 */
export function getNextTeaser(
  gradeLevel: GradeLevel,
  currentTeaserId: string,
  subject?: string,
  excludeIds?: string[],
  recentQuestions?: string[],
  recentAnswers?: string[]
): BrainTeaser {
  const teasers = getTeasersForGrade(gradeLevel, subject);
  const excludeSet = new Set(excludeIds || []);
  excludeSet.add(currentTeaserId);
  const recent = recentQuestions || [];
  const recentAns = recentAnswers || [];

  const candidates = teasers.filter((t) => {
    if (excludeSet.has(t.id)) return false;
    if (isBrainTeaserDuplicate(t, recent, recentAns)) return false;
    return true;
  });

  if (candidates.length > 0) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  // Fallback to any uncompleted catalog teaser across grades that avoids similarity
  const allCandidates = BRAIN_TEASERS_CATALOG.filter((t) => {
    if (excludeSet.has(t.id)) return false;
    if (isBrainTeaserDuplicate(t, recent, recentAns)) return false;
    return true;
  });

  if (allCandidates.length > 0) {
    return allCandidates[Math.floor(Math.random() * allCandidates.length)];
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
 * tuned specifically to the child's grade curriculum, with transparent offline fallback
 * and rigorous client-side anti-repetition verification against recent questions & answers.
 */
export async function fetchAiBrainTeaser(params: {
  gradeLevel: GradeLevel;
  kidName?: string;
  excludeQuestionIds?: string[];
  recentQuestions?: string[];
  recentConcepts?: string[];
  recentAnswers?: string[];
  preferredSubject?: string;
}): Promise<BrainTeaser> {
  const recentList = params.recentQuestions || [];
  const recentAnsList = params.recentAnswers || [];

  try {
    const res = await fetch('/api/brain-teasers/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.teaser && data.teaser.question && Array.isArray(data.teaser.options)) {
        // Client-side verification: guarantee generated question & answer are NOT too similar to recent history
        const isDuplicate = isBrainTeaserDuplicate(data.teaser, recentList, recentAnsList);
        if (!isDuplicate) {
          return data.teaser;
        } else {
          console.info('[BrainTeaser] AI generated question or answer too similar to recent history, seamlessly utilizing distinct fallback.');
        }
      }
    }
  } catch (err) {
    console.warn('[BrainTeasers] AI generation network call failed, using offline bank:', err);
  }

  // Resilient fallback to static catalog with strict anti-similarity
  const gradeTeasers = getTeasersForGrade(params.gradeLevel, params.preferredSubject);
  const exclude = new Set(params.excludeQuestionIds || []);
  const available = gradeTeasers.filter(
    (t) => !exclude.has(t.id) && !isBrainTeaserDuplicate(t, recentList, recentAnsList)
  );
  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }

  // If all questions in this grade were completed, draw from all uncompleted questions in catalog that are not similar
  const catalogAvailable = BRAIN_TEASERS_CATALOG.filter(
    (t) => !exclude.has(t.id) && !isBrainTeaserDuplicate(t, recentList, recentAnsList)
  );
  if (catalogAvailable.length > 0) {
    return catalogAvailable[Math.floor(Math.random() * catalogAvailable.length)];
  }

  // Uncompleted across grade level
  const uncompletedInGrade = gradeTeasers.filter((t) => !exclude.has(t.id));
  if (uncompletedInGrade.length > 0) {
    return uncompletedInGrade[Math.floor(Math.random() * uncompletedInGrade.length)];
  }

  return gradeTeasers[Math.floor(Math.random() * gradeTeasers.length)];
}
