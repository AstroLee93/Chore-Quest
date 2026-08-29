export type FrequencyType = 'daily' | 'weekdays' | 'weekends' | 'specific_days' | 'as_needed';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.

export interface KidProfile {
  id: string;
  name: string;
  avatar: string; // emoji or icon id
  color: string; // Tailwind color name / hex
  stars: number; // current balance
  lifetimeStars: number;
  streakDays: number;
  lastActiveDate?: string; // YYYY-MM-DD
  pin?: string; // optional kid pin
}

export interface ChoreCategory {
  id: string;
  name: string;
  icon: string; // Lucide icon name or emoji
  color: string;
  description?: string;
  order: number;
}

export interface ChoreItem {
  id: string;
  categoryId: string;
  title: string;
  description?: string;
  icon: string;
  stars: number;
  assignedKidIds: string[]; // array of kid IDs or ['all']
  frequency: FrequencyType;
  specificDays?: DayOfWeek[]; // [1, 3, 5] for Mon, Wed, Fri
  timeOfDay: TimeOfDay;
  requiresParentVerification?: boolean;
  isActive: boolean;
  order: number;
}

export type TaskStatus = 'pending' | 'completed' | 'skipped';

export interface ChoreLog {
  id: string;
  choreId: string;
  kidId: string;
  date: string; // YYYY-MM-DD
  status: TaskStatus;
  completedAt?: string; // ISO string
  skippedReason?: string;
  skippedReasonCategory?: 'sick' | 'supplies' | 'time' | 'already_done' | 'need_help' | 'other';
  verifiedByParent?: boolean;
  starsAwarded: number;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  starCost: number;
  category: 'screen_time' | 'treat' | 'activity' | 'allowance' | 'privilege' | 'other';
  maxPerWeek?: number;
  isActive: boolean;
}

export interface RewardRedemption {
  id: string;
  rewardId: string;
  rewardTitle: string;
  rewardIcon: string;
  kidId: string;
  starCost: number;
  date: string; // ISO string
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  notes?: string;
}

export interface AppSettings {
  parentPin: string;
  isDefaultPin?: boolean; // true if default 1234 PIN is still in use, false once changed
  familyName: string;
  soundEnabled: boolean;
  streakBonusStars: number;
  requireParentApprovalForRewards: boolean;
}

export interface FamilyDatabase {
  version: number;
  settings: AppSettings;
  kids: KidProfile[];
  categories: ChoreCategory[];
  chores: ChoreItem[];
  logs: ChoreLog[];
  rewards: RewardItem[];
  redemptions: RewardRedemption[];
  lastBackupDate?: string;
}
