import { BirthdayConfig, FamilyDatabase, KidProfile, KidCoinTransaction } from '../types';
import { getTodayDateString } from './storage';

export const DEFAULT_BIRTHDAY_CONFIG: BirthdayConfig = {
  enabled: true,
  defaultRewardStars: 50,
  reminderDaysAhead: 7,
  freeChorePassEnabled: true,
  doubleStarBonusDay: true,
};

export function getBirthdayConfig(database: FamilyDatabase): BirthdayConfig {
  return {
    ...DEFAULT_BIRTHDAY_CONFIG,
    ...(database.settings?.birthdayConfig || {}),
  };
}

export interface ParsedBirthdate {
  month: number; // 1-12
  day: number;   // 1-31
  year?: number; // e.g. 2017
}

/**
 * Parses a birthdate in "YYYY-MM-DD" or "MM-DD" format.
 */
export function parseBirthdate(birthdate?: string): ParsedBirthdate | null {
  if (!birthdate || typeof birthdate !== 'string') return null;
  const trimmed = birthdate.trim();
  const parts = trimmed.split('-');

  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day) && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { year, month, day };
    }
  } else if (parts.length === 2) {
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    if (!isNaN(month) && !isNaN(day) && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { month, day };
    }
  }

  return null;
}

/**
 * Checks if today is the child's birthday based on month and day.
 */
export function isBirthdayToday(birthdate?: string, referenceDateStr = getTodayDateString()): boolean {
  const parsed = parseBirthdate(birthdate);
  if (!parsed) return false;

  const [refYear, refMonth, refDay] = referenceDateStr.split('-').map((v) => parseInt(v, 10));
  if (!refMonth || !refDay) return false;

  return parsed.month === refMonth && parsed.day === refDay;
}

/**
 * Calculates how many days until the child's next birthday.
 * Returns 0 if today is their birthday.
 */
export function getDaysUntilBirthday(birthdate?: string, referenceDateStr = getTodayDateString()): number | null {
  const parsed = parseBirthdate(birthdate);
  if (!parsed) return null;

  const [refYear, refMonth, refDay] = referenceDateStr.split('-').map((v) => parseInt(v, 10));
  const refDate = new Date(refYear, refMonth - 1, refDay);

  if (parsed.month === refMonth && parsed.day === refDay) {
    return 0;
  }

  let nextBday = new Date(refYear, parsed.month - 1, parsed.day);
  if (nextBday < refDate) {
    nextBday = new Date(refYear + 1, parsed.month - 1, parsed.day);
  }

  const diffMs = nextBday.getTime() - refDate.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculates the age the child is turning (or turned) on their birthday.
 */
export function getTurningAge(birthdate?: string, referenceYear?: number): number | null {
  const parsed = parseBirthdate(birthdate);
  if (!parsed || !parsed.year) return null;

  const targetYear = referenceYear || new Date().getFullYear();
  const age = targetYear - parsed.year;
  return age > 0 ? age : null;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Formats birthdate for friendly human reading (e.g., "October 12" or "October 12, 2015").
 */
export function formatBirthdateDisplay(birthdate?: string): string {
  const parsed = parseBirthdate(birthdate);
  if (!parsed) return 'Not set';

  const monthName = MONTH_NAMES[parsed.month - 1] || `Month ${parsed.month}`;
  if (parsed.year) {
    return `${monthName} ${parsed.day}, ${parsed.year}`;
  }
  return `${monthName} ${parsed.day}`;
}

export interface UpcomingBirthdayInfo {
  kid: KidProfile;
  daysUntil: number; // 0 = today, 1..N = upcoming
  isToday: boolean;
  turningAge: number | null;
  formattedDate: string;
  starsToAward: number;
}

/**
 * Gets all kids who have a birthday coming up within the configured window (e.g. next 7 days or today).
 * Sorted so "Today" is at the top, followed by ascending days.
 */
export function getUpcomingBirthdays(
  kids: KidProfile[],
  reminderDaysAhead = 7,
  referenceDateStr = getTodayDateString()
): UpcomingBirthdayInfo[] {
  const [refYear] = referenceDateStr.split('-').map((v) => parseInt(v, 10));
  const currentYear = refYear || new Date().getFullYear();

  const results: UpcomingBirthdayInfo[] = [];

  for (const kid of kids || []) {
    if (!kid.birthdate) continue;
    const daysUntil = getDaysUntilBirthday(kid.birthdate, referenceDateStr);
    if (daysUntil === null) continue;

    if (daysUntil <= reminderDaysAhead) {
      const isToday = daysUntil === 0;
      const turningAge = getTurningAge(kid.birthdate, currentYear);
      const formattedDate = formatBirthdateDisplay(kid.birthdate);
      const starsToAward = kid.customBirthdayStars ?? 50;

      results.push({
        kid,
        daysUntil,
        isToday,
        turningAge,
        formattedDate,
        starsToAward,
      });
    }
  }

  // Sort by daysUntil ascending
  return results.sort((a, b) => a.daysUntil - b.daysUntil);
}

/**
 * Checks all kids in the database on app load/day change.
 * If today is a kid's birthday and their bonus stars have not been awarded yet this calendar year,
 * automatically credits the stars, updates their balance, and records a birthday transaction.
 */
export function processAutomaticBirthdayStarGrants(
  database: FamilyDatabase,
  todayStr = getTodayDateString()
): {
  updatedDatabase: FamilyDatabase;
  grantedCelebrations: { kid: KidProfile; starsAwarded: number; isToday: boolean }[];
} {
  const config = getBirthdayConfig(database);
  if (!config.enabled) {
    return { updatedDatabase: database, grantedCelebrations: [] };
  }

  const [refYear] = todayStr.split('-').map((v) => parseInt(v, 10));
  const currentYear = refYear || new Date().getFullYear();
  const grantedCelebrations: { kid: KidProfile; starsAwarded: number; isToday: boolean }[] = [];

  const isKidCoinEnabled = database.settings?.kidCoinEnabled !== false;
  const coinRatio = database.settings?.kidCoinRatio ?? 0.10;

  let anyModified = false;

  const updatedKids = (database.kids || []).map((kid) => {
    if (!kid.birthdate) return kid;

    const isToday = isBirthdayToday(kid.birthdate, todayStr);
    if (!isToday) return kid;

    // Has this kid already received their birthday bonus for this calendar year?
    if (kid.lastCelebratedBirthdayYear === currentYear) {
      return kid;
    }

    // Award birthday bonus stars!
    anyModified = true;
    const bonusStars = kid.customBirthdayStars !== undefined ? kid.customBirthdayStars : config.defaultRewardStars;
    const earnedCoins = isKidCoinEnabled ? Number((bonusStars * coinRatio).toFixed(2)) : 0;

    let updatedTransactions = kid.transactions || [];
    let updatedKidCoinBalance = kid.kidCoinBalance || 0;

    if (earnedCoins > 0) {
      updatedKidCoinBalance = Number((updatedKidCoinBalance + earnedCoins).toFixed(2));
      const bdayTx: KidCoinTransaction = {
        id: `tx-bday-${currentYear}-${kid.id}-${Date.now()}`,
        kidId: kid.id,
        type: 'deposit',
        amount: earnedCoins,
        category: 'bonus',
        description: `🎂 Birthday Star Bonus Gift (${bonusStars} Stars)`,
        date: todayStr,
      };
      updatedTransactions = [bdayTx, ...updatedTransactions];
    }

    const updatedKid: KidProfile = {
      ...kid,
      stars: kid.stars + bonusStars,
      lifetimeStars: (kid.lifetimeStars || kid.stars) + bonusStars,
      lastCelebratedBirthdayYear: currentYear,
      kidCoinBalance: updatedKidCoinBalance,
      transactions: updatedTransactions,
    };

    grantedCelebrations.push({
      kid: updatedKid,
      starsAwarded: bonusStars,
      isToday: true,
    });

    return updatedKid;
  });

  if (!anyModified) {
    return { updatedDatabase: database, grantedCelebrations: [] };
  }

  return {
    updatedDatabase: {
      ...database,
      kids: updatedKids,
    },
    grantedCelebrations,
  };
}
