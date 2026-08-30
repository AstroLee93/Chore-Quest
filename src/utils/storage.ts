import { FamilyDatabase, KidProfile, ChoreCategory, ChoreItem, ChoreLog, RewardItem, RewardRedemption, AppSettings, CalendarEvent, DayWeather } from '../types';
import { getInitialSeedEvents } from './calendar';

const STORAGE_KEY = 'chorequest_family_db_v1';

export const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

// Initial default seed database if first time opening app
export const DEFAULT_SEED_DATA: FamilyDatabase = {
  version: 1,
  settings: {
    parentPin: '1234',
    isDefaultPin: true,
    familyName: 'Our Family',
    soundEnabled: true,
    streakBonusStars: 5,
    requireParentApprovalForRewards: false,
  },
  kids: [
    {
      id: 'kid-1',
      name: 'Leo',
      avatar: '🦁',
      color: '#f59e0b', // amber
      stars: 45,
      lifetimeStars: 180,
      streakDays: 4,
      lastActiveDate: getTodayDateString(),
    },
    {
      id: 'kid-2',
      name: 'Maya',
      avatar: '🦄',
      color: '#ec4899', // pink
      stars: 62,
      lifetimeStars: 220,
      streakDays: 6,
      lastActiveDate: getTodayDateString(),
    },
    {
      id: 'kid-3',
      name: 'Sam',
      avatar: '🚀',
      color: '#3b82f6', // blue
      stars: 28,
      lifetimeStars: 95,
      streakDays: 2,
      lastActiveDate: getTodayDateString(),
    }
  ],
  categories: [
    {
      id: 'cat-morning',
      name: 'Morning Routine',
      icon: 'Sun',
      color: '#f59e0b', // amber
      description: 'Start the day strong and ready!',
      order: 1,
    },
    {
      id: 'cat-bedroom',
      name: 'Bedroom & Belongings',
      icon: 'Bed',
      color: '#8b5cf6', // purple
      description: 'Keep personal spaces tidy and clean.',
      order: 2,
    },
    {
      id: 'cat-school',
      name: 'School & Learning',
      icon: 'BookOpen',
      color: '#3b82f6', // blue
      description: 'Homework, reading, and backpack prep.',
      order: 3,
    },
    {
      id: 'cat-household',
      name: 'House & Kitchen',
      icon: 'Home',
      color: '#10b981', // emerald
      description: 'Helping the whole family around the house.',
      order: 4,
    },
    {
      id: 'cat-evening',
      name: 'Evening & Bedtime',
      icon: 'Moon',
      color: '#6366f1', // indigo
      description: 'Winding down and getting ready for tomorrow.',
      order: 5,
    },
    {
      id: 'cat-pets',
      name: 'Pet Care',
      icon: 'HeartHandshake',
      color: '#f43f5e', // rose
      description: 'Loving and feeding our furry friends.',
      order: 6,
    }
  ],
  chores: [
    // Morning
    {
      id: 'chore-1',
      categoryId: 'cat-morning',
      title: 'Make your bed neatly',
      description: 'Pull sheets tight and arrange pillows nicely.',
      icon: '🛏️',
      stars: 3,
      assignedKidIds: ['all'],
      frequency: 'daily',
      timeOfDay: 'morning',
      isActive: true,
      order: 1,
      subtasks: ['Pull fitted and top sheets flat', 'Fluff and arrange pillows', 'Straighten quilt/comforter'],
      timerMinutes: 3,
    },
    {
      id: 'chore-2',
      categoryId: 'cat-morning',
      title: 'Brush teeth & wash face',
      description: '2 minutes brushing with clean rinse.',
      icon: '🪥',
      stars: 2,
      assignedKidIds: ['all'],
      frequency: 'daily',
      timeOfDay: 'morning',
      isActive: true,
      order: 2,
      subtasks: ['Brush top & bottom teeth (2 mins)', 'Spit and rinse toothbrush', 'Wash face & dry with clean towel'],
      timerMinutes: 2,
    },
    {
      id: 'chore-3',
      categoryId: 'cat-morning',
      title: 'Get dressed for the day',
      description: 'Put pyjamas in laundry or basket.',
      icon: '👕',
      stars: 2,
      assignedKidIds: ['all'],
      frequency: 'daily',
      timeOfDay: 'morning',
      isActive: true,
      order: 3,
      subtasks: ['Put on daytime clothes & socks', 'Place pajamas into hamper'],
      timerMinutes: 5,
    },
    // Bedroom
    {
      id: 'chore-4',
      categoryId: 'cat-bedroom',
      title: 'Pick up floor toys & books',
      description: 'Ensure floor is totally clear before dinner.',
      icon: '🧸',
      stars: 4,
      assignedKidIds: ['all'],
      frequency: 'daily',
      timeOfDay: 'afternoon',
      isActive: true,
      order: 1,
      subtasks: ['Put building blocks & toys in bins', 'Stack books on shelf', 'No items left on the carpet'],
      timerMinutes: 10,
    },
    {
      id: 'chore-5',
      categoryId: 'cat-bedroom',
      title: 'Put clean clothes away in closet',
      description: 'Hang shirts and fold pants into drawers.',
      icon: '🧺',
      stars: 5,
      assignedKidIds: ['kid-1', 'kid-2'],
      frequency: 'weekdays',
      timeOfDay: 'afternoon',
      isActive: true,
      order: 2,
      subtasks: ['Fold t-shirts & pants neatly', 'Hang coats/hoodies', 'Put socks & underwear in organizer'],
      timerMinutes: 10,
    },
    // School
    {
      id: 'chore-6',
      categoryId: 'cat-school',
      title: 'Complete daily reading (20 mins)',
      description: 'Read your favorite chapter book or comic.',
      icon: '📖',
      stars: 5,
      assignedKidIds: ['all'],
      frequency: 'daily',
      timeOfDay: 'afternoon',
      isActive: true,
      order: 1,
      subtasks: ['Find quiet reading spot', 'Read for 20 focused minutes', 'Write bookmark page or reading log'],
      timerMinutes: 20,
    },
    {
      id: 'chore-7',
      categoryId: 'cat-school',
      title: 'Pack backpack for tomorrow',
      description: 'Folders, signed notes, water bottle ready.',
      icon: '🎒',
      stars: 3,
      assignedKidIds: ['all'],
      frequency: 'weekdays',
      timeOfDay: 'evening',
      isActive: true,
      order: 2,
      subtasks: ['Check homework folder & library books', 'Pack clean water bottle & snacks', 'Zip bag and place by door'],
      timerMinutes: 5,
    },
    // House & Kitchen
    {
      id: 'chore-8',
      categoryId: 'cat-household',
      title: 'Clear your dinner plate to sink',
      description: 'Scrape food into trash and rinse plate.',
      icon: '🍽️',
      stars: 3,
      assignedKidIds: ['all'],
      frequency: 'daily',
      timeOfDay: 'evening',
      isActive: true,
      order: 1,
      subtasks: ['Scrape scraps into organic bin', 'Rinse plate and silverware with water', 'Wipe dining place with damp rag'],
      timerMinutes: 3,
    },
    {
      id: 'chore-9',
      categoryId: 'cat-household',
      title: 'Take out small trash or recycling',
      description: 'Tie bag and place into main bin.',
      icon: '🗑️',
      stars: 6,
      assignedKidIds: ['kid-1', 'kid-2'],
      frequency: 'specific_days',
      specificDays: [1, 3, 5], // Mon, Wed, Fri
      timeOfDay: 'afternoon',
      isActive: true,
      order: 2,
      subtasks: ['Tie bathroom & bedroom small trash bags', 'Take out to big outdoor bin', 'Put fresh liner bags in cans'],
      timerMinutes: 5,
    },
    // Pet care
    {
      id: 'chore-10',
      categoryId: 'cat-pets',
      title: 'Feed pets & refresh water bowl',
      description: '1 scoop of food and clean cold water.',
      icon: '🐾',
      stars: 4,
      assignedKidIds: ['kid-1', 'kid-3'],
      frequency: 'daily',
      timeOfDay: 'morning',
      isActive: true,
      order: 1,
      subtasks: ['Rinse water bowl & fill with fresh water', 'Scoop exact food portion into bowl'],
      timerMinutes: 3,
    },
    // Evening
    {
      id: 'chore-11',
      categoryId: 'cat-evening',
      title: 'Evening teeth brushing & PJs',
      description: 'Brush thoroughly and put on bedtime clothes.',
      icon: '🌙',
      stars: 3,
      assignedKidIds: ['all'],
      frequency: 'daily',
      timeOfDay: 'evening',
      isActive: true,
      order: 1,
      subtasks: ['Brush teeth with timer (2 mins)', 'Floss teeth gently', 'Slip into bedtime pajamas'],
      timerMinutes: 4,
    },
    // Bounty Extra Credit Chores
    {
      id: 'chore-bounty-1',
      categoryId: 'cat-household',
      title: '🌟 Bonus Bounty: Wash Car Windows & Vacuum Mats',
      description: 'First come first served extra-credit mission! Wash interior windshield and shake out floor mats.',
      icon: '🚗',
      stars: 15,
      bountyBonusStars: 5,
      assignedKidIds: ['all'],
      frequency: 'as_needed',
      timeOfDay: 'anytime',
      isActive: true,
      isBounty: true,
      order: 99,
      subtasks: ['Shake out dirt from front & back mats', 'Wipe dashboard with microfiber towel', 'Wipe car windows with glass cleaner'],
      timerMinutes: 20,
    },
    {
      id: 'chore-bounty-2',
      categoryId: 'cat-bedroom',
      title: '🌟 Bonus Bounty: Organize the Family Board Game Closet',
      description: 'Sort all puzzle pieces and board games into neat, labeled stacks!',
      icon: '🎲',
      stars: 12,
      bountyBonusStars: 4,
      assignedKidIds: ['all'],
      frequency: 'as_needed',
      timeOfDay: 'anytime',
      isActive: true,
      isBounty: true,
      order: 100,
      subtasks: ['Match missing cards and dice to game boxes', 'Stack heavy boxes at the bottom', 'Recycle any ripped loose flyers'],
      timerMinutes: 15,
    }
  ],
  logs: [
    // Pre-populate some completed and skipped chores today for instant preview
    {
      id: 'log-1',
      choreId: 'chore-1',
      kidId: 'kid-1',
      date: getTodayDateString(),
      status: 'completed',
      completedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      starsAwarded: 3,
      verifiedByParent: true,
    },
    {
      id: 'log-2',
      choreId: 'chore-2',
      kidId: 'kid-1',
      date: getTodayDateString(),
      status: 'completed',
      completedAt: new Date(Date.now() - 3600000 * 3.5).toISOString(),
      starsAwarded: 2,
      verifiedByParent: true,
    },
    {
      id: 'log-3',
      choreId: 'chore-9',
      kidId: 'kid-1',
      date: getTodayDateString(),
      status: 'skipped',
      skippedReasonCategory: 'supplies',
      skippedReason: 'We ran out of large recycling trash bags under the sink.',
      starsAwarded: 0,
    },
    {
      id: 'log-4',
      choreId: 'chore-1',
      kidId: 'kid-2',
      date: getTodayDateString(),
      status: 'completed',
      completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      starsAwarded: 3,
      verifiedByParent: false,
    }
  ],
  rewards: [
    {
      id: 'rew-1',
      title: '30 Mins Video Games / Screen Time',
      description: 'Extra gaming or tablet time on weekend or evening.',
      icon: '🎮',
      starCost: 20,
      category: 'screen_time',
      maxPerWeek: 3,
      isActive: true,
    },
    {
      id: 'rew-2',
      title: 'Ice Cream or Dessert of Choice',
      description: 'Pick any special treat from freezer or bakery trip.',
      icon: '🍦',
      starCost: 35,
      category: 'treat',
      maxPerWeek: 2,
      isActive: true,
    },
    {
      id: 'rew-3',
      title: 'Family Movie Night Pick',
      description: 'You get to pick the Friday family movie & popcorn flavor!',
      icon: '🍿',
      starCost: 40,
      category: 'activity',
      maxPerWeek: 1,
      isActive: true,
    },
    {
      id: 'rew-4',
      title: 'Stay Up 30 Mins Past Bedtime',
      description: 'Enjoy extra reading or quiet play time before lights out.',
      icon: '⏰',
      starCost: 25,
      category: 'privilege',
      maxPerWeek: 2,
      isActive: true,
    },
    {
      id: 'rew-5',
      title: '$5 Pocket Money / Allowance Bonus',
      description: 'Cash bonus added to your piggy bank or savings goal.',
      icon: '💵',
      starCost: 50,
      category: 'allowance',
      maxPerWeek: 1,
      isActive: true,
    },
    {
      id: 'rew-6',
      title: 'Special Outing to the Park / Playground',
      description: 'Trip to your favorite adventure park with mom/dad.',
      icon: '🎡',
      starCost: 60,
      category: 'activity',
      maxPerWeek: 1,
      isActive: true,
    }
  ],
  redemptions: [
    {
      id: 'red-1',
      rewardId: 'rew-1',
      rewardTitle: '30 Mins Video Games / Screen Time',
      rewardIcon: '🎮',
      kidId: 'kid-2',
      starCost: 20,
      date: new Date(Date.now() - 86400000).toISOString(),
      status: 'approved',
      notes: 'Redeemed for Saturday afternoon Nintendo Switch session',
    }
  ],
  events: getInitialSeedEvents(),
  weatherForecasts: {},
  familyGoal: {
    title: 'Friday Family Pizza & Movie Night',
    reward: 'Giant Pepperoni Pizza + Choose Any Movie! 🍕🎬',
    icon: '🍕',
    targetChoreCount: 35,
    weekStartDate: getTodayDateString(),
    isActive: true,
  },
};

// Storage operations
export const loadDatabase = (): FamilyDatabase => {
  if (typeof window === 'undefined') return DEFAULT_SEED_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveDatabase(DEFAULT_SEED_DATA);
      return DEFAULT_SEED_DATA;
    }
    const parsed = JSON.parse(raw) as FamilyDatabase;
    // ensure version fields exist
    if (!parsed.kids || !parsed.chores || !parsed.categories) {
      saveDatabase(DEFAULT_SEED_DATA);
      return DEFAULT_SEED_DATA;
    }
    if (!parsed.events || parsed.events.length === 0) {
      parsed.events = getInitialSeedEvents();
    }
    if (!parsed.weatherForecasts) {
      parsed.weatherForecasts = {};
    }
    if (!parsed.familyGoal) {
      parsed.familyGoal = DEFAULT_SEED_DATA.familyGoal;
    }
    return parsed;
  } catch (err) {
    console.error('Error loading database from localStorage:', err);
    return DEFAULT_SEED_DATA;
  }
};

export const saveDatabase = (db: FamilyDatabase): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Error saving database to localStorage:', err);
  }
};

export const exportDatabaseJSON = (db: FamilyDatabase): string => {
  const exportData = {
    ...db,
    exportTimestamp: new Date().toISOString(),
    system: 'ChoreQuest Raspberry Pi / Local Web Edition',
  };
  return JSON.stringify(exportData, null, 2);
};

export const importDatabaseJSON = (jsonString: string): FamilyDatabase => {
  const parsed = JSON.parse(jsonString);
  if (!parsed.kids || !parsed.categories || !parsed.chores || !parsed.settings) {
    throw new Error('Invalid ChoreQuest backup file format.');
  }
  return {
    version: parsed.version || 1,
    settings: {
      parentPin: parsed.settings?.parentPin || '1234',
      familyName: parsed.settings?.familyName || 'Our Family',
      soundEnabled: parsed.settings?.soundEnabled ?? true,
      streakBonusStars: parsed.settings?.streakBonusStars ?? 5,
      requireParentApprovalForRewards: parsed.settings?.requireParentApprovalForRewards ?? false,
      tempUnit: parsed.settings?.tempUnit || 'F',
    },
    kids: parsed.kids || [],
    categories: parsed.categories || [],
    chores: parsed.chores || [],
    logs: parsed.logs || [],
    rewards: parsed.rewards || [],
    redemptions: parsed.redemptions || [],
    events: parsed.events || getInitialSeedEvents(),
    weatherForecasts: parsed.weatherForecasts || {},
    lastBackupDate: new Date().toISOString(),
  };
};

// Check if a chore is scheduled for today
export const isChoreScheduledForDate = (chore: ChoreItem, dateStr: string): boolean => {
  if (!chore.isActive) return false;
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sun, 6=Sat

  switch (chore.frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6;
    case 'specific_days':
      return Array.isArray(chore.specificDays) && chore.specificDays.includes(dayOfWeek);
    case 'as_needed':
      return true;
    default:
      return true;
  }
};

// Check if a chore is assigned to a specific kid
export const isChoreAssignedToKid = (chore: ChoreItem, kidId: string): boolean => {
  if (!chore.assignedKidIds || chore.assignedKidIds.length === 0) return true;
  return chore.assignedKidIds.includes('all') || chore.assignedKidIds.includes(kidId);
};

// Calculate kid rank and next level threshold
export const getKidLevelInfo = (lifetimeStars: number) => {
  const levels = [
    { level: 1, title: 'Chore Cadet', minStars: 0, maxStars: 50, icon: '🌱' },
    { level: 2, title: 'Star Helper', minStars: 50, maxStars: 150, icon: '⭐' },
    { level: 3, title: 'Chore Champion', minStars: 150, maxStars: 300, icon: '🏆' },
    { level: 4, title: 'Super Hero', minStars: 300, maxStars: 500, icon: '🦸' },
    { level: 5, title: 'Household Legend', minStars: 500, maxStars: 1000, icon: '👑' },
  ];

  for (let i = 0; i < levels.length; i++) {
    const l = levels[i];
    if (lifetimeStars < l.maxStars || i === levels.length - 1) {
      const range = l.maxStars - l.minStars;
      const progressInLevel = Math.max(0, lifetimeStars - l.minStars);
      const progressPercent = Math.min(100, Math.round((progressInLevel / range) * 100));
      return {
        level: l.level,
        title: l.title,
        icon: l.icon,
        currentStarsInLevel: progressInLevel,
        starsNeededForNextLevel: l.maxStars - lifetimeStars,
        progressPercent,
        isMaxLevel: i === levels.length - 1 && lifetimeStars >= l.maxStars,
      };
    }
  }

  return {
    level: 5,
    title: 'Household Legend',
    icon: '👑',
    currentStarsInLevel: 500,
    starsNeededForNextLevel: 0,
    progressPercent: 100,
    isMaxLevel: true,
  };
};

// Calculate weekly family goal stats
export const getFamilyWeeklyGoalProgress = (database: FamilyDatabase) => {
  const goal = database.familyGoal || DEFAULT_SEED_DATA.familyGoal!;
  const today = new Date();
  
  // Calculate completed chores in the last 7 days or since weekStartDate
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  const startDateStr = goal.weekStartDate && goal.weekStartDate > sevenDaysAgoStr ? goal.weekStartDate : sevenDaysAgoStr;

  const completedLogs = (database.logs || []).filter(
    (l) => l.status === 'completed' && l.date >= startDateStr
  );

  const completedCount = completedLogs.length;
  const target = Math.max(1, goal.targetChoreCount || 30);
  const percent = Math.min(100, Math.round((completedCount / target) * 100));
  const isReached = completedCount >= target;

  return {
    goal,
    completedCount,
    target,
    percent,
    isReached,
    remaining: Math.max(0, target - completedCount),
  };
};

// Helper to filter active bounty chores
export const getBountyChores = (database: FamilyDatabase): ChoreItem[] => {
  return (database.chores || []).filter((c) => c.isActive && c.isBounty);
};

