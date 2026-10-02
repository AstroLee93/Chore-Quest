import { FamilyDatabase, KidProfile, ChoreItem, ChoreLog, LeaderRoleConfig, ChoreCategory } from '../types';
import { getTodayDateString, isChoreScheduledForDate, isChoreAssignedToKid } from './storage';

export const DEFAULT_LEADER_CONFIG: LeaderRoleConfig = {
  enabled: true,
  leaderKidId: 'kid-2', // Maya is appointed leader by default in seed data
  title: 'Chore Quest Leader',
  badgeIcon: '🎖️',
  description:
    'As our Family Chore Leader and Manager, your mission is to guide your team, assign daily chore duties fairly, verify that tasks are done thoroughly (checking corners, under beds, and counters!), and encourage everyone with high-fives and positive feedback.',
  checklistGuidelines: [
    'Morning Check-In: Review scheduled chore missions with your siblings.',
    'Inspect in Person: Physically check completed chores before stamping sign-off.',
    'Care for Pets: Confirm food and water bowls are fresh and full.',
    'Common Areas: Ensure living room and hallway floors are free of clutter before dinner.',
    'Team Building: Give at least one genuine high-five or compliment to each sibling today.',
  ],
  canAssignChores: true,
  canSignOffChores: true,
  bonusLeaderStars: 5,
  assignedDate: '2026-10-01',
};

export const PRESET_LEADER_DUTIES = [
  'Morning Check-In: Review scheduled chore missions with your siblings.',
  'Inspect in Person: Physically check completed chores before stamping sign-off.',
  'Pet Patrol: Confirm pets have fresh water and clean feeding areas.',
  'Tidy Common Spaces: Ensure living room, hallway, and entryway are clutter-free.',
  'Dishes & Kitchen: Check that dishwasher is loaded and sink is clear.',
  'Trash & Recycling: Verify bins are emptied and new liners are inserted.',
  'Bedrooms Inspection: Check that beds are neatly made and clothes are in hampers.',
  'Team Building: Give at least one genuine high-five or compliment to each sibling.',
  'Evening Wrap-Up: Sign off all verified missions on your Leader Clipboard.',
];

/**
 * Returns the active Leader role configuration, falling back to defaults if not set.
 */
export function getLeaderConfig(database: FamilyDatabase): LeaderRoleConfig {
  if (database.settings && database.settings.leaderRole) {
    return {
      ...DEFAULT_LEADER_CONFIG,
      ...database.settings.leaderRole,
      checklistGuidelines:
        database.settings.leaderRole.checklistGuidelines &&
        database.settings.leaderRole.checklistGuidelines.length > 0
          ? database.settings.leaderRole.checklistGuidelines
          : DEFAULT_LEADER_CONFIG.checklistGuidelines,
    };
  }
  return DEFAULT_LEADER_CONFIG;
}

/**
 * Returns the currently designated Leader KidProfile, or null if unassigned/disabled.
 */
export function getLeaderKid(database: FamilyDatabase): KidProfile | null {
  const config = getLeaderConfig(database);
  if (!config.enabled || !config.leaderKidId) return null;
  return (database.kids || []).find((k) => k.id === config.leaderKidId) || null;
}

/**
 * Checks if a specific kid is currently designated as the Leader.
 */
export function isKidLeader(
  kidOrId: string | KidProfile | null | undefined,
  database: FamilyDatabase
): boolean {
  if (!kidOrId) return false;
  const kidId = typeof kidOrId === 'string' ? kidOrId : kidOrId.id;
  const config = getLeaderConfig(database);
  if (!config.enabled) return false;
  return config.leaderKidId === kidId;
}

/**
 * Appoints a kid as the new Leader, updating their isLeader flag and clearing others.
 */
export function assignKidAsLeader(
  database: FamilyDatabase,
  kidId: string,
  assignedDate = getTodayDateString()
): FamilyDatabase {
  const currentConfig = getLeaderConfig(database);
  const updatedConfig: LeaderRoleConfig = {
    ...currentConfig,
    enabled: true,
    leaderKidId: kidId,
    assignedDate,
  };

  const updatedKids = (database.kids || []).map((k) => ({
    ...k,
    isLeader: k.id === kidId,
  }));

  return {
    ...database,
    settings: {
      ...database.settings,
      leaderRole: updatedConfig,
    },
    kids: updatedKids,
  };
}

/**
 * Unassigns the Leader role (sets to None).
 */
export function unassignLeader(database: FamilyDatabase): FamilyDatabase {
  const currentConfig = getLeaderConfig(database);
  const updatedConfig: LeaderRoleConfig = {
    ...currentConfig,
    leaderKidId: undefined,
  };

  const updatedKids = (database.kids || []).map((k) => ({
    ...k,
    isLeader: false,
  }));

  return {
    ...database,
    settings: {
      ...database.settings,
      leaderRole: updatedConfig,
    },
    kids: updatedKids,
  };
}

/**
 * Updates Leader role configuration (description, guidelines, permissions, title).
 */
export function updateLeaderRoleConfig(
  database: FamilyDatabase,
  partialConfig: Partial<LeaderRoleConfig>
): FamilyDatabase {
  const currentConfig = getLeaderConfig(database);
  const updatedConfig: LeaderRoleConfig = {
    ...currentConfig,
    ...partialConfig,
  };

  // If leaderKidId changed, sync kid profiles
  let updatedKids = database.kids;
  if (partialConfig.leaderKidId !== undefined) {
    updatedKids = (database.kids || []).map((k) => ({
      ...k,
      isLeader: k.id === partialConfig.leaderKidId,
    }));
  }

  return {
    ...database,
    settings: {
      ...database.settings,
      leaderRole: updatedConfig,
    },
    kids: updatedKids,
  };
}

export interface LeaderChoreInspectionItem {
  id: string; // unique key `${kid.id}:${chore.id}`
  chore: ChoreItem;
  targetKid: KidProfile;
  log?: ChoreLog;
  isCompleted: boolean;
  isVerifiedByLeader: boolean;
  isVerifiedByParent: boolean;
  leaderSignedAt?: string;
  leaderNotes?: string;
  completedSubtasksCount: number;
  totalSubtasksCount: number;
  category?: ChoreCategory;
}

/**
 * Aggregates all chore assignments across the entire household for a given date,
 * mapping their completion status, subtasks, and Leader verification state for the Leader Clipboard.
 */
export function getHouseholdChoresForLeader(
  database: FamilyDatabase,
  dateStr = getTodayDateString()
): LeaderChoreInspectionItem[] {
  const items: LeaderChoreInspectionItem[] = [];
  const kids = database.kids || [];
  const chores = (database.chores || []).filter((c) => c && c.isActive);
  const logs = (database.logs || []).filter((l) => l && l.date === dateStr);
  const categories = database.categories || [];

  const categoryMap = new Map<string, ChoreCategory>();
  categories.forEach((cat) => categoryMap.set(cat.id, cat));

  const logMap = new Map<string, ChoreLog>();
  logs.forEach((log) => {
    logMap.set(`${log.kidId}:${log.choreId}`, log);
  });

  chores.forEach((chore) => {
    if (!isChoreScheduledForDate(chore, dateStr)) return;

    kids.forEach((kid) => {
      if (!isChoreAssignedToKid(chore, kid.id)) return;

      const log = logMap.get(`${kid.id}:${chore.id}`);
      const isCompleted = log?.status === 'completed';
      const isVerifiedByLeader = !!log?.verifiedByLeader;
      const isVerifiedByParent = !!log?.verifiedByParent;
      const totalSubtasksCount = chore.subtasks ? chore.subtasks.length : 0;
      const completedSubtasksCount = log?.completedSubtasks ? log.completedSubtasks.length : (isCompleted ? totalSubtasksCount : 0);

      items.push({
        id: `${kid.id}:${chore.id}`,
        chore,
        targetKid: kid,
        log,
        isCompleted,
        isVerifiedByLeader,
        isVerifiedByParent,
        leaderSignedAt: log?.leaderSignedAt,
        leaderNotes: log?.leaderNotes,
        completedSubtasksCount,
        totalSubtasksCount,
        category: categoryMap.get(chore.categoryId),
      });
    });
  });

  // Sort: Needs Verification first, then pending, then verified
  return items.sort((a, b) => {
    // Priority: completed but unverified by leader comes first!
    const aNeedsSignOff = a.isCompleted && !a.isVerifiedByLeader;
    const bNeedsSignOff = b.isCompleted && !b.isVerifiedByLeader;
    if (aNeedsSignOff && !bNeedsSignOff) return -1;
    if (!aNeedsSignOff && bNeedsSignOff) return 1;

    // Next: uncompleted chores
    if (!a.isCompleted && b.isCompleted) return -1;
    if (a.isCompleted && !b.isCompleted) return 1;

    // Next: sort by kid name then chore title
    if (a.targetKid.name !== b.targetKid.name) {
      return a.targetKid.name.localeCompare(b.targetKid.name);
    }
    return (a.chore.title || '').localeCompare(b.chore.title || '');
  });
}

/**
 * Signs off / verifies a chore on the Leader Clipboard on behalf of the sibling.
 * If the chore was not yet marked complete, marks it complete, awards stars, and stamps Leader approval.
 */
export function signOffChoreAsLeader(params: {
  database: FamilyDatabase;
  chore: ChoreItem;
  targetKidId: string;
  leaderKidId: string;
  notes?: string;
  stampStyle?: string;
  dateStr?: string;
}): { updatedDatabase: FamilyDatabase; starsAwarded: number } {
  const { database, chore, targetKidId, leaderKidId, notes, dateStr = getTodayDateString() } = params;

  const targetKid = (database.kids || []).find((k) => k.id === targetKidId);
  const leaderKid = (database.kids || []).find((k) => k.id === leaderKidId);
  if (!targetKid) return { updatedDatabase: database, starsAwarded: 0 };

  const logs = [...(database.logs || [])];
  const existingIndex = logs.findIndex(
    (l) => l.choreId === chore.id && l.kidId === targetKidId && l.date === dateStr
  );

  const categoryObj = (database.categories || []).find((c) => c.id === chore.categoryId);
  const nowIso = new Date().toISOString();
  let starsEarned = 0;
  const fullStars = chore.stars + (chore.bountyBonusStars || 0);

  if (existingIndex >= 0) {
    const prevLog = logs[existingIndex];
    // If was not completed, award stars now!
    if (prevLog.status !== 'completed') {
      starsEarned = fullStars;
    }
    logs[existingIndex] = {
      ...prevLog,
      status: 'completed',
      completedAt: prevLog.completedAt || nowIso,
      choreTitle: chore.title,
      choreIcon: chore.icon,
      categoryName: categoryObj?.name,
      verifiedByLeader: true,
      verifiedByLeaderKidId: leaderKidId,
      leaderSignedAt: nowIso,
      leaderNotes: notes || `Approved by Leader ${leaderKid?.name || ''} 🎖️`,
      starsAwarded: prevLog.starsAwarded > 0 ? prevLog.starsAwarded : fullStars,
      completedSubtasks: chore.subtasks || prevLog.completedSubtasks,
    };
  } else {
    // Create new log marked completed & leader verified
    starsEarned = fullStars;
    const newLog: ChoreLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      choreId: chore.id,
      choreTitle: chore.title,
      choreIcon: chore.icon,
      categoryName: categoryObj?.name,
      kidId: targetKidId,
      date: dateStr,
      status: 'completed',
      completedAt: nowIso,
      starsAwarded: fullStars,
      verifiedByParent: false,
      verifiedByLeader: true,
      verifiedByLeaderKidId: leaderKidId,
      leaderSignedAt: nowIso,
      leaderNotes: notes || `Verified by Leader ${leaderKid?.name || ''} 🎖️`,
      completedSubtasks: chore.subtasks,
    };
    logs.unshift(newLog);
  }

  // Update target kid stars if newly earned
  const updatedKids = (database.kids || []).map((k) => {
    if (k.id === targetKidId && starsEarned > 0) {
      const isNewActiveDay = k.lastActiveDate !== dateStr;
      return {
        ...k,
        stars: k.stars + starsEarned,
        lifetimeStars: k.lifetimeStars + starsEarned,
        streakDays: isNewActiveDay ? k.streakDays + 1 : Math.max(1, k.streakDays),
        lastActiveDate: dateStr,
      };
    }
    return k;
  });

  return {
    updatedDatabase: {
      ...database,
      kids: updatedKids,
      logs,
    },
    starsAwarded: starsEarned,
  };
}

/**
 * Reassigns or delegates a chore to another kid (or multiple kids) by the Leader.
 */
export function reassignChoreAsLeader(params: {
  database: FamilyDatabase;
  choreId: string;
  newKidIds: string[];
  leaderKidId: string;
}): FamilyDatabase {
  const { database, choreId, newKidIds, leaderKidId } = params;
  const nowIso = new Date().toISOString();

  const updatedChores = (database.chores || []).map((c) => {
    if (c.id === choreId) {
      return {
        ...c,
        assignedKidIds: newKidIds,
        assignedByLeaderKidId: leaderKidId,
        leaderAssignedAt: nowIso,
      };
    }
    return c;
  });

  return {
    ...database,
    chores: updatedChores,
  };
}
