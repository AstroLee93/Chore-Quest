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

export interface CategoryTimeWindow {
  enabled: boolean;
  startTime: string; // "HH:mm" 24-hour format, e.g. "06:00"
  endTime: string;   // "HH:mm" 24-hour format, e.g. "11:00"
}

export interface ChoreCategory {
  id: string;
  name: string;
  icon: string; // Lucide icon name or emoji
  color: string;
  description?: string;
  order: number;
  timeWindow?: CategoryTimeWindow;
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
  | 'custom'
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

export interface CustomCalendarCategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
  color?: string;
  badgeBg?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // e.g. "15:30" or "3:30 PM"
  endTime?: string;
  category: CalendarEventCategory;
  customCategoryName?: string;
  customCategoryIcon?: string;
  customCategoryDescription?: string;
  customCategoryColor?: string;
  assignedKidIds: string[]; // array of kid IDs or ['all']
  location?: string;
  color?: string; // hex color or tailwind accent
  icon?: string; // emoji icon
  weatherNote?: string;
  weatherIcon?: WeatherCondition;
  isImportant?: boolean;
  remindMinutesBefore?: number;
}

export interface SnackStarTiers {
  staple: number; // Healthy/Fresh e.g. 5
  common: number; // Everyday snacks e.g. 12
  treat: number;  // Sweet treats/goodies e.g. 20
  luxury: number; // Gourmet/Specialty e.g. 35
}

export interface AppSettings {
  parentPin: string;
  isDefaultPin?: boolean; // true if default 1234 PIN is still in use, false once changed
  familyName: string;
  soundEnabled: boolean;
  streakBonusStars: number;
  requireParentApprovalForRewards: boolean;
  tempUnit?: 'F' | 'C';
  savedCalendarIcsUrl?: string;
  kioskTheme?: string;
  snackStarTiers?: SnackStarTiers;
  customSnackStarOverrides?: Record<string, number>; // Individual snack item star cost overrides
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

export interface MealRecipe {
  prepTime?: string; // e.g. "15 mins"
  cookTime?: string; // e.g. "25 mins"
  servings?: string; // e.g. "4-6 servings"
  difficulty?: 'Easy' | 'Medium' | 'Quick';
  ingredients: string[]; // e.g. ["1 lb Ground Beef", "1 packet Taco Seasoning", "8 Warm Tortillas"]
  instructions: string[]; // step-by-step numbered steps
  substitutions?: string[]; // notes on swaps (e.g. "Swap ground turkey or black beans for beef", "Gluten-free tortillas")
  notes?: string;
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
  recipe?: MealRecipe;
}

export interface WeeklyDinnerMenu {
  title?: string;
  weekStartDate?: string;
  days: Record<DayOfWeekKey, DailyDinnerPlan>;
  lastUpdated?: string;
}

export type GroceryCategory =
  | 'produce'
  | 'dairy_eggs'
  | 'meat_seafood'
  | 'bakery'
  | 'pantry'
  | 'frozen'
  | 'snacks'
  | 'beverages'
  | 'household'
  | 'other';

export type GroceryImportance = 'staple' | 'common' | 'treat' | 'luxury';

export interface GroceryItem {
  id: string;
  name: string;
  category: GroceryCategory;
  quantity?: string; // e.g. "2 bags", "1 gallon", "3 lbs"
  importance?: GroceryImportance; // 'staple' | 'common' | 'treat' | 'luxury'
  acquired: boolean;
  acquiredAt?: string;
  isDepleted?: boolean; // Track depletion across all groceries
  depletedAt?: string;
  depletedBy?: string;
  addedBy?: string; // e.g. "Mom", "Leo 🦁", "Auto from Dinner Menu", "Replenished from Pantry", "Kid Request (Leo)"
  notes?: string;
  isReplenishItem?: boolean;
  sourceMealDay?: DayOfWeekKey; // If imported from weekly dinner menu
  sourceRecipe?: string;
  createdAt: string;
}

export interface SpiceItem {
  id: string;
  name: string;
  category?: string; // e.g. "Baking", "Herbs", "Peppers & Salts", "Seasoning Blends"
  isEmpty: boolean; // Marked as empty when it runs out
  needsReplenish: boolean; // Triggered when empty to add to replenish/shopping queue
  addedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GroceryRequest {
  id: string;
  name: string;
  itemName?: string;
  quantity?: string;
  category?: GroceryCategory;
  importance?: GroceryImportance;
  starCost?: number; // Stars required/charged as payment for this snack/treat
  starsDeducted?: boolean; // Whether the stars were deducted from kid's balance
  originalStarCost?: number; // Original star cost before admin adjustment
  adminEditedStars?: boolean; // True if admin explicitly edited the star cost
  notes?: string;
  kidId: string;
  kidName: string;
  kidAvatar?: string;
  date?: string;
  createdAt?: string;
  status: 'pending' | 'approved' | 'denied';
  deniedReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface PantryStapleItem {
  id: string;
  name: string;
  category: GroceryCategory;
  defaultQuantity?: string;
  importance?: GroceryImportance;
  icon?: string;
  isDepleted: boolean; // True if "Used Up / Needs Replenish"
  depletedAt?: string;
  depletedBy?: string; // Who marked it as used up (e.g. kid or parent)
  lastRestockedAt?: string;
  notes?: string;
}

export interface WeeklyGroceryList {
  title?: string;
  weekStartDate?: string;
  items: GroceryItem[];
  pantryStaples?: PantryStapleItem[];
  spices?: SpiceItem[];
  requests?: GroceryRequest[];
  lastUpdated?: string;
}

export interface BadgeDefinition {
  id: string;
  title: string;
  icon: string;
  category: 'Milestone' | 'Speed' | 'Dedication' | 'Streak' | 'Savings' | 'Lifetime';
  description: string;
  requirement: string;
  color: string;
  bgGradient: string;
}

export interface KidBadgeProgress {
  badge: BadgeDefinition;
  isUnlocked: boolean;
  currentValue: number;
  targetValue: number;
  progressPercent: number;
  progressText: string;
  unlockedDate?: string;
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
  weeklyGroceryList?: WeeklyGroceryList;
  customCalendarCategories?: CustomCalendarCategory[];
  lastBackupDate?: string;
}

