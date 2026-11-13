/**
 * Shared "how is each kid doing today?" numbers for the 2026 rings
 * (family home, kiosk, kid dashboard).
 */
import { FamilyDatabase, KidProfile } from '../types';
import { isChoreAssignedToKid, isChoreScheduledForDate } from './storage';
import { checkChoreTimeWindow } from './timeWindow';

export interface KidDayProgress {
  done: number;
  total: number;
  dueSoon: number;
  fraction: number; // 0..1 (1 when there is nothing to do)
}

export function getKidDayProgress(db: FamilyDatabase, kid: KidProfile, todayStr: string): KidDayProgress {
  const chores = (db.chores || []).filter(
    (c) => c.isActive && isChoreScheduledForDate(c, todayStr) && isChoreAssignedToKid(c, kid.id),
  );
  const doneIds = new Set(
    (db.logs || [])
      .filter((l) => l && l.kidId === kid.id && l.date === todayStr && l.status === 'completed')
      .map((l) => l.choreId),
  );
  let done = 0;
  let dueSoon = 0;
  for (const c of chores) {
    if (doneIds.has(c.id)) {
      done++;
      continue;
    }
    const category = (db.categories || []).find((cat) => cat.id === c.categoryId);
    const w = checkChoreTimeWindow(c, category);
    if (w.hasRestriction && w.isAllowed && w.isNearingExpiration) dueSoon++;
  }
  const total = chores.length;
  return { done, total, dueSoon, fraction: total ? done / total : 1 };
}

/** stroke-dasharray for an SVG progress ring of radius r */
export function ringDash(fraction: number, r: number): string {
  const c = 2 * Math.PI * r;
  return `${(c * Math.max(0, Math.min(1, fraction))).toFixed(1)} ${c.toFixed(1)}`;
}

/** Two-letter initials for avatars (2026 design avoids emoji in chrome). */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2)).toUpperCase();
}
