import { ReadingLogEntry, KidBookShelfItem, ChoreItem, FamilyDatabase, KidProfile, AppSettings } from '../types';

/**
 * Normalizes a book title for consistent comparison
 */
export function normalizeBookTitle(title?: string): string {
  if (!title) return '';
  return String(title)
    .trim()
    .toLowerCase()
    .replace(/^(the|a|an)\s+/i, '')
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ');
}

/**
 * Normalizes a chapter string for intelligent duplicate comparison
 * Matches "Chapter 4", "Ch. 4", "ch 4", "Chapter 04", "4"
 */
export function normalizeChapter(chapter?: string): string {
  if (!chapter) return '';
  const cleaned = String(chapter)
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/gi, '')
    .replace(/\s+/g, ' ');

  // Extract number if formatted as "chapter X" or "ch X"
  const chapterMatch = cleaned.match(/^(?:chapter|chap|ch)\s*0*(\d+)/i);
  if (chapterMatch) {
    return `chapter-${chapterMatch[1]}`;
  }

  // If just a pure number e.g. "4"
  if (/^\d+$/.test(cleaned)) {
    return `chapter-${parseInt(cleaned, 10)}`;
  }

  return cleaned;
}

/**
 * Checks if a kid has already completed and claimed points for this exact book & chapter
 */
export function findDuplicateChapterLog(
  existingLogs: ReadingLogEntry[],
  kidId: string,
  bookTitle: string,
  chapter: string
): ReadingLogEntry | undefined {
  const normTitle = normalizeBookTitle(bookTitle);
  const normChap = normalizeChapter(chapter);

  if (!normTitle || !normChap) return undefined;

  return existingLogs.find((log) => {
    if (log.kidId !== kidId) return false;
    const logTitleNorm = log.normalizedBookTitle || normalizeBookTitle(log.bookTitle);
    const logChapNorm = log.normalizedChapter || normalizeChapter(log.chapterCompleted);
    return logTitleNorm === normTitle && logChapNorm === normChap;
  });
}

/**
 * Checks whether the kid has completed their reading session for today
 */
export function isReadingCompletedToday(
  database: FamilyDatabase,
  kidId: string,
  todayDateStr: string
): boolean {
  // Check readingLogs first
  const logs = database.readingLogs || [];
  const loggedToday = logs.some((l) => l.kidId === kidId && l.date === todayDateStr);
  if (loggedToday) return true;

  // Also check if chore-6 or reading chore is completed in ChoreLogs
  const readingChore = findReadingChore(database.chores || []);
  if (readingChore) {
    const choreDone = (database.logs || []).some(
      (l) => l.kidId === kidId && l.choreId === readingChore.id && l.date === todayDateStr && l.status === 'completed'
    );
    if (choreDone) return true;
  }

  return false;
}

/**
 * Returns the admin-configured star reward for Reading Adventure
 */
export function getReadingRewardStars(database: FamilyDatabase): number {
  if (database.settings.readingRewardStars !== undefined && database.settings.readingRewardStars > 0) {
    return database.settings.readingRewardStars;
  }
  const readingChore = findReadingChore(database.chores || []);
  return readingChore?.stars ?? 5;
}

/**
 * Returns the admin-determined maximum times stars can be claimed per day
 * 0 = Unlimited claims
 * 1 = Once per day (Default)
 * 2, 3, etc. = Specific times per day
 */
export function getReadingDailyClaimLimit(settings?: AppSettings): number {
  if (settings?.readingDailyClaimLimit !== undefined) {
    return settings.readingDailyClaimLimit;
  }
  return 1;
}

/**
 * Returns the number of times a child has claimed stars for Reading Adventure on a given date
 */
export function getReadingClaimsCountForDate(
  logs: ReadingLogEntry[],
  kidId: string,
  dateStr: string
): number {
  return logs.filter((l) => l.kidId === kidId && l.date === dateStr && (l.starsAwarded || 0) > 0).length;
}

/**
 * Checks if the kid has already claimed the maximum allowed star rewards for Reading Adventure today
 */
export function isReadingClaimLimitReached(
  database: FamilyDatabase,
  kidId: string,
  dateStr: string
): boolean {
  const limit = getReadingDailyClaimLimit(database.settings);
  if (limit === 0) return false; // 0 means unlimited
  const claims = getReadingClaimsCountForDate(database.readingLogs || [], kidId, dateStr);
  return claims >= limit;
}

/**
 * Locates the reading chore in the database
 */
export function findReadingChore(chores: ChoreItem[] = []): ChoreItem | undefined {
  if (!Array.isArray(chores)) return undefined;
  return (
    chores.find((c) => c?.id === 'chore-6') ||
    chores.find((c) => (c?.title || '').toLowerCase().includes('reading')) ||
    chores.find((c) => c?.icon === '📖')
  );
}

/**
 * Formats an ISO timestamp nicely for kids and parents
 */
export function formatReadingTimestamp(isoString: string): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    if (isToday) {
      return `Today at ${timeStr}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate();

    if (isYesterday) {
      return `Yesterday at ${timeStr}`;
    }

    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
  } catch {
    return isoString;
  }
}

/**
 * Calculates reading stats for a kid
 */
export function getKidReadingStats(
  logs: ReadingLogEntry[],
  shelf: KidBookShelfItem[] | undefined,
  kidId: string,
  todayStr: string
) {
  const kidLogs = logs.filter((l) => l.kidId === kidId);
  const totalMinutes = kidLogs.reduce((acc, curr) => acc + (curr.minutesRead || 20), 0);
  const totalChapters = kidLogs.length;

  const kidShelf = shelf || [];
  const booksFinished = kidShelf.filter((b) => b.isFinished).length;
  const activeBook = kidShelf.find((b) => !b.isFinished) || kidShelf[0];

  const readToday = kidLogs.some((l) => l.date === todayStr);

  // Calculate streak of consecutive days read
  const uniqueDates = Array.from(new Set(kidLogs.map((l) => l.date))).sort().reverse();
  let streak = 0;
  if (uniqueDates.length > 0) {
    const checkDate = new Date();
    const todayISO = todayStr;
    const yesterdayDate = new Date(checkDate);
    yesterdayDate.setDate(checkDate.getDate() - 1);
    const yesterdayISO = yesterdayDate.toISOString().split('T')[0];

    // Did they read today or yesterday?
    if (uniqueDates.includes(todayISO) || uniqueDates.includes(yesterdayISO)) {
      let currentCheck = uniqueDates.includes(todayISO) ? checkDate : yesterdayDate;
      while (true) {
        const dStr = currentCheck.toISOString().split('T')[0];
        if (uniqueDates.includes(dStr)) {
          streak++;
          currentCheck.setDate(currentCheck.getDate() - 1);
        } else {
          break;
        }
      }
    }
  }

  return {
    totalMinutes,
    totalChapters,
    booksFinished,
    activeBook,
    readToday,
    streak: Math.max(streak, readToday ? 1 : 0),
    recentLogs: kidLogs.slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
  };
}

/**
 * Suggested starter books for kids to pick from if their shelf is empty
 */
export const STARTER_BOOK_IDEAS: Array<{
  title: string;
  author: string;
  coverEmoji: string;
  coverColor: string;
  gradeLevels: string[];
}> = [
  {
    title: 'The Wild Robot',
    author: 'Peter Brown',
    coverEmoji: '🤖',
    coverColor: 'bg-emerald-600',
    gradeLevels: ['3rd_grade', '4th_grade', '5th_grade'],
  },
  {
    title: 'Magic Tree House: Dinosaurs Before Dark',
    author: 'Mary Pope Osborne',
    coverEmoji: '🦖',
    coverColor: 'bg-amber-600',
    gradeLevels: ['1st_grade', '2nd_grade', '3rd_grade'],
  },
  {
    title: 'Percy Jackson & The Olympians',
    author: 'Rick Riordan',
    coverEmoji: '⚡',
    coverColor: 'bg-cyan-600',
    gradeLevels: ['4th_grade', '5th_grade', 'middle_school'],
  },
  {
    title: 'Dog Man: Twenty Thousand Fleas Under the Sea',
    author: 'Dav Pilkey',
    coverEmoji: '🐶',
    coverColor: 'bg-blue-600',
    gradeLevels: ['1st_grade', '2nd_grade', '3rd_grade', '4th_grade'],
  },
  {
    title: 'Charlotte’s Web',
    author: 'E.B. White',
    coverEmoji: '🕸️',
    coverColor: 'bg-rose-600',
    gradeLevels: ['2nd_grade', '3rd_grade', '4th_grade'],
  },
  {
    title: 'Harry Potter and the Sorcerer’s Stone',
    author: 'J.K. Rowling',
    coverEmoji: '🧙‍♂️',
    coverColor: 'bg-indigo-600',
    gradeLevels: ['3rd_grade', '4th_grade', '5th_grade'],
  },
  {
    title: 'Diary of a Wimpy Kid',
    author: 'Jeff Kinney',
    coverEmoji: '🧀',
    coverColor: 'bg-yellow-600',
    gradeLevels: ['3rd_grade', '4th_grade', '5th_grade'],
  },
  {
    title: 'Zoey and Sassafras: Dragons and Marshmallows',
    author: 'Asia Citro',
    coverEmoji: '🐉',
    coverColor: 'bg-purple-600',
    gradeLevels: ['kindergarten', '1st_grade', '2nd_grade'],
  },
];
