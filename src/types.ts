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
  subtasks?: string[]; // Step-by-step checklist
  timerMinutes?: number; // Optional focus countdown timer in minutes
  isBounty?: boolean; // Bonus bounty chore open to all kids
  bountyBonusStars?: number; // Additional bonus stars
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
  completedSubtasks?: string[]; // subtasks completed for this chore on this date
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

export interface FamilyGoal {
  id?: string;
  title: string;
  reward: string;
  icon: string;
  targetChoreCount: number;
  weekStartDate: string; // YYYY-MM-DD
  isActive: boolean;
}

export type CalendarEventCategory =
  | 'practice'
  | 'school_project'
  | 'field_trip'
  | 'appointment'
  | 'milestone'
  | 'birthday'
  | 'family'
  | 'other';

export type WeatherCondition =
  | 'sunny'
  | 'partly_cloudy'
  | 'cloudy'
  | 'rainy'
  | 'stormy'
  | 'snowy'
  | 'windy';

export interface DayWeather {
  condition: WeatherCondition;
  tempHigh: number;
  tempLow: number;
  note?: string;
  source?: 'auto' | 'custom';
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // e.g. "15:30" or "3:30 PM"
  endTime?: string;
  category: CalendarEventCategory;
  assignedKidIds: string[]; // array of kid IDs or ['all']
  location?: string;
  color?: string; // hex color or tailwind accent
  icon?: string; // emoji icon
  weatherNote?: string;
  weatherIcon?: WeatherCondition;
  isImportant?: boolean;
  remindMinutesBefore?: number;
}

export interface AppSettings {
  parentPin: string;
  isDefaultPin?: boolean; // true if default 1234 PIN is still in use, false once changed
  familyName: string;
  soundEnabled: boolean;
  streakBonusStars: number;
  requireParentApprovalForRewards: boolean;
  tempUnit?: 'F' | 'C';
}

export type DayOfWeekKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface MealVotingOption {
  id: string;
  title: string;
  icon?: string;
  description?: string;
  voterKidIds: string[]; // Kid IDs who voted for this option
}

export interface MealSuggestion {
  id: string;
  dish: string;
  icon?: string;
  kidId: string;
  voterKidIds: string[];
  createdAt: string;
}

export interface DailyDinnerPlan {
  dayOfWeek: DayOfWeekKey;
  theme?: string; // e.g. "Taco Tuesday 🌮", "Pizza Night 🍕", "Chef's Special"
  mainDish: string;
  sideDishes?: string;
  dessert?: string;
  preparedBy?: string; // e.g. "Mom & Maya", "Dad", "Leo (Chef in Training)"
  icon?: string; // Emoji
  notes?: string; // e.g. "5:30 PM before soccer game"
  votingEnabled?: boolean;
  votingQuestion?: string;
  votingOptions?: MealVotingOption[];
  suggestions?: MealSuggestion[];
  lockedByParent?: boolean;
  winningOptionId?: string;
}

export interface WeeklyDinnerMenu {
  title?: string;
  weekStartDate?: string;
  days: Record<DayOfWeekKey, DailyDinnerPlan>;
  lastUpdated?: string;
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
  events?: CalendarEvent[];
  weatherForecasts?: Record<string, DayWeather>; // Keyed by YYYY-MM-DD
  familyGoal?: FamilyGoal;
  savedFamilyGoals?: FamilyGoal[];
  weeklyMenu?: WeeklyDinnerMenu;
  lastBackupDate?: string;
}

