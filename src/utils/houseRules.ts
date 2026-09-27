import { HouseRule, RuleInfractionLog, FamilyDatabase, KidProfile } from '../types';

export const DEFAULT_HOUSE_RULES: HouseRule[] = [
  {
    id: 'rule-1',
    ruleNumber: 1,
    title: 'Respect & Kindness',
    description: 'Treat every family member with love and respect. No yelling, harsh words, insults, eye-rolling, door slamming, or physical fighting.',
    category: 'respect',
    icon: '❤️',
    consequences: {
      firstOffense: 'Friendly Reminder, Eye Contact & Sincere Apology',
      firstOffenseStars: 0,
      secondOffense: '10-Minute Quiet Reflection Time & Apology Note',
      secondOffenseStars: 2,
      thirdOffense: 'Star Removal (-5 Stars) & Screen Privileges Paused for Day',
      thirdOffenseStars: 5,
      starPenalty: 5,
      autoDeductEnabled: true,
    },
    isActive: true,
  },
  {
    id: 'rule-2',
    ruleNumber: 2,
    title: 'Clean As You Go',
    description: 'Put away toys, art supplies, and games before moving to another activity. Clear your dish, cup, and utensils to the sink after meals.',
    category: 'chores',
    icon: '🧹',
    consequences: {
      firstOffense: 'Direct Prompt to return and clean up immediately',
      firstOffenseStars: 0,
      secondOffense: 'Extra 10-Minute Household Helper Mission',
      secondOffenseStars: 2,
      thirdOffense: 'Star Removal (-5 Stars) deducted from chore payout',
      thirdOffenseStars: 5,
      starPenalty: 5,
      autoDeductEnabled: true,
    },
    isActive: true,
  },
  {
    id: 'rule-3',
    ruleNumber: 3,
    title: 'Honesty First & Always',
    description: 'Always tell the truth, even if you made a mistake or broke something by accident. Owning up with honesty earns double trust and parent respect.',
    category: 'honesty',
    icon: '🤝',
    consequences: {
      firstOffense: 'Heart-to-Heart discussion on courage, integrity, and trust',
      firstOffenseStars: 0,
      secondOffense: 'Loss of next chosen privilege or fun outing',
      secondOffenseStars: 5,
      thirdOffense: 'Star Removal (-10 Stars) & Family Conference',
      thirdOffenseStars: 10,
      starPenalty: 10,
      autoDeductEnabled: true,
    },
    isActive: true,
  },
  {
    id: 'rule-4',
    ruleNumber: 4,
    title: 'Screens & Device Limits',
    description: 'All homework and required daily chores must be verified before requesting screen time. Screens turn off 30 minutes before bedtime.',
    category: 'screens',
    icon: '📱',
    consequences: {
      firstOffense: 'Screen locked until parents verify all required chores',
      firstOffenseStars: 0,
      secondOffense: 'Zero screen time for the remainder of today',
      secondOffenseStars: 5,
      thirdOffense: 'Star Removal (-10 Stars) & 48-Hour Device Suspension',
      thirdOffenseStars: 10,
      starPenalty: 10,
      autoDeductEnabled: true,
    },
    isActive: true,
  },
  {
    id: 'rule-5',
    ruleNumber: 5,
    title: 'Listen the First Time',
    description: 'When Mom, Dad, or Lex give a request or instruction, respond politely ("Yes Mom" / "Okay Lex") and follow through without arguing.',
    category: 'respect',
    icon: '👂',
    consequences: {
      firstOffense: 'Calm verbal redirection with eye-level confirmation',
      firstOffenseStars: 0,
      secondOffense: 'Loss of choice for current activity or toy for 1 hour',
      secondOffenseStars: 2,
      thirdOffense: 'Star Removal (-5 Stars) & Extra Chore Duty',
      thirdOffenseStars: 5,
      starPenalty: 5,
      autoDeductEnabled: true,
    },
    isActive: true,
  },
  {
    id: 'rule-6',
    ruleNumber: 6,
    title: 'Bedtime & Healthy Rest',
    description: 'In pajamas, teeth brushed, and in bed by the scheduled bedtime hour so growing minds and bodies get healthy, full sleep.',
    category: 'bedtime',
    icon: '🌙',
    consequences: {
      firstOffense: 'Immediate reminder to climb into bed now',
      firstOffenseStars: 0,
      secondOffense: 'Bedtime moved 15 minutes earlier tomorrow evening',
      secondOffenseStars: 2,
      thirdOffense: 'Star Removal (-5 Stars) penalty',
      thirdOffenseStars: 5,
      starPenalty: 5,
      autoDeductEnabled: true,
    },
    isActive: true,
  },
  {
    id: 'rule-7',
    ruleNumber: 7,
    title: 'Safety First',
    description: 'Never leave the yard or house without explicit adult permission. Helmets must be worn when riding bicycles, scooters, or skateboards.',
    category: 'safety',
    icon: '🛡️',
    consequences: {
      firstOffense: 'Immediate safety stop & review of boundary guidelines',
      firstOffenseStars: 0,
      secondOffense: 'Outdoor wheels/equipment locked away for 24 hours',
      secondOffenseStars: 5,
      thirdOffense: 'Star Removal (-15 Stars) & Restricted Yard Boundary',
      thirdOffenseStars: 15,
      starPenalty: 15,
      autoDeductEnabled: true,
    },
    isActive: true,
  },
];

const STORAGE_KEY = 'chorequest_house_rules_v1';
const INFRACTIONS_STORAGE_KEY = 'chorequest_rule_infractions_v1';

export function getHouseRules(database: FamilyDatabase): HouseRule[] {
  if (database.houseRules && database.houseRules.length > 0) {
    return database.houseRules;
  }
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
  }
  return DEFAULT_HOUSE_RULES;
}

export function saveHouseRulesToStorage(rules: HouseRule[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
    } catch (e) {
      console.warn('Failed to save house rules to storage:', e);
    }
  }
}

export function getRuleInfractions(database: FamilyDatabase): RuleInfractionLog[] {
  if (database.ruleInfractions && database.ruleInfractions.length > 0) {
    return database.ruleInfractions;
  }
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(INFRACTIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
  }
  return [];
}

export function saveRuleInfractionsToStorage(infractions: RuleInfractionLog[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(INFRACTIONS_STORAGE_KEY, JSON.stringify(infractions));
    } catch (e) {
      console.warn('Failed to save rule infractions to storage:', e);
    }
  }
}

/**
 * Calculates the linked automatic star deduction amount for a specific rule and offense level.
 */
export function getLinkedStarDeduction(rule: HouseRule, offenseLevel: 1 | 2 | 3): number {
  if (!rule || !rule.consequences) return 0;
  if (offenseLevel === 1) {
    return rule.consequences.firstOffenseStars ?? 0;
  }
  if (offenseLevel === 2) {
    return rule.consequences.secondOffenseStars ?? 0;
  }
  return (
    rule.consequences.thirdOffenseStars ??
    rule.consequences.starPenalty ??
    5
  );
}

export interface IssueInfractionPayload {
  rule: HouseRule;
  kid: KidProfile;
  offenseLevel: 1 | 2 | 3;
  deductStars: boolean;
  starsToDeduct: number;
  notes?: string;
  incidentDate?: string;
  loggedBy?: string;
}

/**
 * Returns how many active (non-pardoned) strikes a child has for a specific rule.
 */
export function getChildRuleInfractionCount(
  infractions: RuleInfractionLog[],
  kidId: string,
  ruleId: string
): number {
  if (!infractions || infractions.length === 0) return 0;
  return infractions.filter((inf) => inf.kidId === kidId && inf.ruleId === ruleId && !inf.isPardoned).length;
}

/**
 * Recommends the next progressive offense level (1, 2, or 3) for a child on a specific rule.
 */
export function getRecommendedOffenseLevel(
  infractions: RuleInfractionLog[],
  kidId: string,
  ruleId: string
): 1 | 2 | 3 {
  const previousCount = getChildRuleInfractionCount(infractions, kidId, ruleId);
  if (previousCount === 0) return 1;
  if (previousCount === 1) return 2;
  return 3;
}

export function issueRuleInfraction(
  database: FamilyDatabase,
  payload: IssueInfractionPayload
): { updatedDatabase: FamilyDatabase; infraction: RuleInfractionLog } {
  const { rule, kid, offenseLevel, deductStars, starsToDeduct, notes, incidentDate, loggedBy } = payload;
  const starsDeducted = deductStars ? Math.max(0, starsToDeduct) : 0;
  const now = new Date();
  const dateStr = incidentDate && incidentDate.trim() ? incidentDate.trim() : now.toISOString().split('T')[0];

  const actionText =
    offenseLevel === 1
      ? `1st Offense Warning: ${rule.consequences.firstOffense}`
      : offenseLevel === 2
      ? `2nd Offense Strike: ${rule.consequences.secondOffense}`
      : `3rd Offense Infraction: ${starsDeducted > 0 ? `-${starsDeducted} Stars Deducted • ` : ''}${rule.consequences.thirdOffense}`;

  const previousBalance = kid.stars;
  const newBalance = Math.max(0, previousBalance - starsDeducted);

  const infraction: RuleInfractionLog = {
    id: `infraction-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    ruleId: rule.id,
    ruleTitle: rule.title,
    ruleNumber: rule.ruleNumber,
    category: rule.category,
    kidId: kid.id,
    kidName: kid.name,
    kidAvatar: kid.avatar,
    date: dateStr,
    timestamp: now.toISOString(),
    offenseLevel,
    actionTaken: actionText,
    starsDeducted,
    previousBalance,
    newBalance,
    isPardoned: false,
    notes: notes || undefined,
    loggedBy: loggedBy || 'Parent Admin',
  };

  const updatedInfractions = [infraction, ...(database.ruleInfractions || [])];
  saveRuleInfractionsToStorage(updatedInfractions);

  // Deduct stars from kid profile if requested
  const updatedKids = database.kids.map((k) => {
    if (k.id === kid.id && starsDeducted > 0) {
      return {
        ...k,
        stars: newBalance,
      };
    }
    return k;
  });

  const updatedDatabase: FamilyDatabase = {
    ...database,
    kids: updatedKids,
    ruleInfractions: updatedInfractions,
  };

  return { updatedDatabase, infraction };
}

/**
 * Pardons an infraction and refunds previously deducted stars back to the child's balance.
 */
export function pardonRuleInfraction(
  database: FamilyDatabase,
  infractionId: string
): { updatedDatabase: FamilyDatabase; refundedStars: number; kidName: string } | null {
  const currentInfractions = database.ruleInfractions || [];
  const target = currentInfractions.find((i) => i.id === infractionId);
  if (!target) return null;

  const refundedStars = target.starsDeducted || 0;
  const kidId = target.kidId;
  const now = new Date();

  // Mark infraction as pardoned
  const updatedInfractions = currentInfractions.map((i) =>
    i.id === infractionId
      ? {
          ...i,
          isPardoned: true,
          pardonedAt: now.toISOString(),
          actionTaken: `${i.actionTaken} (Pardoned / Refunded +${refundedStars} Stars)`,
        }
      : i
  );
  saveRuleInfractionsToStorage(updatedInfractions);

  // Refund stars to kid
  const updatedKids = database.kids.map((k) => {
    if (k.id === kidId && refundedStars > 0 && !target.isPardoned) {
      return {
        ...k,
        stars: k.stars + refundedStars,
      };
    }
    return k;
  });

  const updatedDatabase: FamilyDatabase = {
    ...database,
    kids: updatedKids,
    ruleInfractions: updatedInfractions,
  };

  return { updatedDatabase, refundedStars, kidName: target.kidName };
}

/**
 * Deletes an infraction record permanently from the database.
 */
export function deleteRuleInfraction(
  database: FamilyDatabase,
  infractionId: string
): FamilyDatabase {
  const currentInfractions = database.ruleInfractions || [];
  const updatedInfractions = currentInfractions.filter((i) => i.id !== infractionId);
  saveRuleInfractionsToStorage(updatedInfractions);
  return {
    ...database,
    ruleInfractions: updatedInfractions,
  };
}
