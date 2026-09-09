import {
  CalendarColorCodeMode,
  CalendarEvent,
  CalendarEventCategory,
  CustomCalendarCategory,
  DayWeather,
  KidProfile,
  WeatherCondition,
} from '../types';

export interface CategoryMeta {
  id: CalendarEventCategory | string;
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  description?: string;
}

export const EVENT_CATEGORIES: Record<CalendarEventCategory, CategoryMeta> = {
  practice: {
    id: 'practice',
    label: 'Afterschool Practice & Sports',
    shortLabel: 'Practice',
    icon: '⚽',
    color: '#10b981',
    bgColor: 'bg-emerald-500',
    borderColor: 'border-emerald-300',
    textColor: 'text-emerald-900',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  school_project: {
    id: 'school_project',
    label: 'Important Projects & Homework',
    shortLabel: 'Project Due',
    icon: '📚',
    color: '#6366f1',
    bgColor: 'bg-indigo-500',
    borderColor: 'border-indigo-300',
    textColor: 'text-indigo-900',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  field_trip: {
    id: 'field_trip',
    label: 'School Field Trips & Outings',
    shortLabel: 'Field Trip',
    icon: '🚌',
    color: '#f59e0b',
    bgColor: 'bg-amber-500',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-900',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  appointment: {
    id: 'appointment',
    label: 'Appointments & Doctor/Dentist',
    shortLabel: 'Appointment',
    icon: '🩺',
    color: '#06b6d4',
    bgColor: 'bg-cyan-500',
    borderColor: 'border-cyan-300',
    textColor: 'text-cyan-900',
    badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-300',
  },
  birthday: {
    id: 'birthday',
    label: 'Birthdays & Celebrations',
    shortLabel: 'Birthday',
    icon: '🎂',
    color: '#ec4899',
    bgColor: 'bg-pink-500',
    borderColor: 'border-pink-300',
    textColor: 'text-pink-900',
    badgeBg: 'bg-pink-100 text-pink-900 border-pink-300',
  },
  milestone: {
    id: 'milestone',
    label: 'Family Milestones & Events',
    shortLabel: 'Milestone',
    icon: '🏆',
    color: '#8b5cf6',
    bgColor: 'bg-purple-500',
    borderColor: 'border-purple-300',
    textColor: 'text-purple-900',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
  },
  family: {
    id: 'family',
    label: 'Family Fun & Activities',
    shortLabel: 'Family Fun',
    icon: '⛺',
    color: '#f97316',
    bgColor: 'bg-orange-500',
    borderColor: 'border-orange-300',
    textColor: 'text-orange-900',
    badgeBg: 'bg-orange-100 text-orange-900 border-orange-300',
  },
  other: {
    id: 'other',
    label: 'Other Reminders & Notes',
    shortLabel: 'General',
    icon: '📌',
    color: '#64748b',
    bgColor: 'bg-slate-500',
    borderColor: 'border-slate-300',
    textColor: 'text-slate-900',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
  },
  custom: {
    id: 'custom',
    label: 'Custom Activity Type',
    shortLabel: 'Custom',
    icon: '✨',
    color: '#8b5cf6',
    bgColor: 'bg-purple-500',
    borderColor: 'border-purple-300',
    textColor: 'text-purple-900',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
  },
};

export interface CustomColorOption {
  id: string;
  name: string;
  color: string;
  badgeBg: string;
}

export const CUSTOM_CATEGORY_COLORS: CustomColorOption[] = [
  { id: 'purple', name: 'Royal Purple', color: '#8b5cf6', badgeBg: 'bg-purple-100 text-purple-900 border-purple-300' },
  { id: 'indigo', name: 'Indigo Blue', color: '#6366f1', badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
  { id: 'emerald', name: 'Emerald Green', color: '#10b981', badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  { id: 'teal', name: 'Sea Teal', color: '#14b8a6', badgeBg: 'bg-teal-100 text-teal-900 border-teal-300' },
  { id: 'cyan', name: 'Sky Cyan', color: '#06b6d4', badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-300' },
  { id: 'rose', name: 'Ruby Rose', color: '#f43f5e', badgeBg: 'bg-rose-100 text-rose-900 border-rose-300' },
  { id: 'pink', name: 'Berry Pink', color: '#ec4899', badgeBg: 'bg-pink-100 text-pink-900 border-pink-300' },
  { id: 'amber', name: 'Golden Amber', color: '#f59e0b', badgeBg: 'bg-amber-100 text-amber-900 border-amber-300' },
  { id: 'orange', name: 'Sunset Orange', color: '#f97316', badgeBg: 'bg-orange-100 text-orange-900 border-orange-300' },
  { id: 'slate', name: 'Slate Gray', color: '#64748b', badgeBg: 'bg-slate-100 text-slate-800 border-slate-300' },
];

export interface PopularCustomCategorySuggestion {
  name: string;
  icon: string;
  description: string;
  color: string;
}

export const POPULAR_CUSTOM_CATEGORY_SUGGESTIONS: PopularCustomCategorySuggestion[] = [
  {
    name: 'Martial Arts & Karate',
    icon: '🥋',
    description: 'Dojo sparring, forms, kata training, and belt advancement',
    color: '#f59e0b',
  },
  {
    name: 'Music & Instrument Lessons',
    icon: '🎹',
    description: 'Piano, guitar, violin, or voice practice and recitals',
    color: '#8b5cf6',
  },
  {
    name: 'Dance & Ballet Rehearsal',
    icon: '🩰',
    description: 'Choreography rehearsals, recital costumes, and stage prep',
    color: '#ec4899',
  },
  {
    name: 'Scouts & Camping',
    icon: '🏕️',
    description: 'Troop meetings, merit badges, outdoor expeditions, and service',
    color: '#10b981',
  },
  {
    name: 'Swimming & Aquatics',
    icon: '🏊',
    description: 'Swim lessons, laps, team meets, and water safety',
    color: '#06b6d4',
  },
  {
    name: 'Robotics & STEM Club',
    icon: '🤖',
    description: 'Coding challenges, robot builds, science fair prep, and math club',
    color: '#6366f1',
  },
  {
    name: 'Art, Pottery & Theater',
    icon: '🎨',
    description: 'Creative studio sessions, stage plays, and pottery classes',
    color: '#f97316',
  },
  {
    name: 'Tutoring & Academic Coaching',
    icon: '📝',
    description: 'One-on-one subject tutoring, speech therapy, and study skills',
    color: '#14b8a6',
  },
  {
    name: 'Youth Group & Community Faith',
    icon: '⛪',
    description: 'Youth group meetings, volunteering, community service, and choir',
    color: '#8b5cf6',
  },
  {
    name: 'Misc Tasks, Errands & To-Dos',
    icon: '📋',
    description: 'General tasks, home repairs, seasonal errands, and to-do items',
    color: '#8b5cf6',
  },
  {
    name: 'Pet Training & Vet Care',
    icon: '🐕',
    description: 'Puppy obedience training, agility courses, and checkups',
    color: '#64748b',
  },
];

export function getEventCategoryMeta(
  eventOrCategory: CalendarEvent | CalendarEventCategory | string | undefined,
  customCategories?: CustomCalendarCategory[]
): CategoryMeta & { description?: string; isCustom?: boolean } {
  if (!eventOrCategory) {
    return EVENT_CATEGORIES.practice;
  }

  // If passed a full CalendarEvent object
  if (typeof eventOrCategory === 'object' && eventOrCategory !== null) {
    const evt = eventOrCategory as CalendarEvent;
    if (evt.category === 'custom' || evt.customCategoryName) {
      const name = evt.customCategoryName?.trim() || 'Custom Activity';
      const icon = evt.customCategoryIcon || evt.icon || '✨';
      const colorOption =
        CUSTOM_CATEGORY_COLORS.find(
          (c) => c.color === evt.customCategoryColor || c.id === evt.customCategoryColor
        ) || CUSTOM_CATEGORY_COLORS[0];

      return {
        id: 'custom',
        label: name,
        shortLabel: name,
        icon: icon,
        color: colorOption.color,
        bgColor: 'bg-purple-500',
        borderColor: 'border-purple-300',
        textColor: 'text-purple-900',
        badgeBg: colorOption.badgeBg,
        description: evt.customCategoryDescription || undefined,
        isCustom: true,
      };
    }

    const preset = EVENT_CATEGORIES[evt.category];
    if (preset) return preset;
  }

  // If passed a string (category key or custom category id/name)
  if (typeof eventOrCategory === 'string') {
    const preset = EVENT_CATEGORIES[eventOrCategory as CalendarEventCategory];
    if (preset && eventOrCategory !== 'custom') return preset;

    // Check customCategories if provided
    if (customCategories && customCategories.length > 0) {
      const matched = customCategories.find(
        (c) =>
          c.id === eventOrCategory ||
          c.name.toLowerCase() === eventOrCategory.toLowerCase()
      );
      if (matched) {
        const colorOption =
          CUSTOM_CATEGORY_COLORS.find(
            (c) => c.color === matched.color || c.id === matched.color
          ) || CUSTOM_CATEGORY_COLORS[0];

        return {
          id: matched.id,
          label: matched.name,
          shortLabel: matched.name,
          icon: matched.icon || '✨',
          color: colorOption.color,
          bgColor: 'bg-purple-500',
          borderColor: 'border-purple-300',
          textColor: 'text-purple-900',
          badgeBg: colorOption.badgeBg,
          description: matched.description,
          isCustom: true,
        };
      }
    }

    if (preset) return preset;
  }

  return EVENT_CATEGORIES.practice;
}

export const WEATHER_CONDITIONS: Record<
  WeatherCondition,
  { icon: string; label: string; tip: string; bgClass: string; textClass: string }
> = {
  sunny: {
    icon: '☀️',
    label: 'Sunny & Bright',
    tip: 'Great weather for outdoor games & practice! Sunscreen ready.',
    bgClass: 'bg-amber-100/90 border-amber-300',
    textClass: 'text-amber-900',
  },
  partly_cloudy: {
    icon: '⛅',
    label: 'Partly Cloudy',
    tip: 'Mild temperature with pleasant breeze.',
    bgClass: 'bg-blue-100/80 border-blue-200',
    textClass: 'text-blue-900',
  },
  cloudy: {
    icon: '☁️',
    label: 'Cloudy / Overcast',
    tip: 'Cooler daylight conditions.',
    bgClass: 'bg-slate-100 border-slate-300',
    textClass: 'text-slate-800',
  },
  rainy: {
    icon: '🌧️',
    label: 'Rain / Showers',
    tip: 'Bring umbrella, rainboots, & water-resistant gear ☔',
    bgClass: 'bg-cyan-100/90 border-cyan-300',
    textClass: 'text-cyan-900',
  },
  stormy: {
    icon: '⛈️',
    label: 'Thunderstorms',
    tip: 'Caution: outdoor practice might be postponed indoors.',
    bgClass: 'bg-purple-100/90 border-purple-300',
    textClass: 'text-purple-900',
  },
  snowy: {
    icon: '❄️',
    label: 'Snow / Flurries',
    tip: 'Bundle up warm with gloves & winter jacket! 🧤',
    bgClass: 'bg-indigo-100/90 border-indigo-300',
    textClass: 'text-indigo-900',
  },
  windy: {
    icon: '💨',
    label: 'Breezy / Windy',
    tip: 'Windy conditions outside. Secure light project boards.',
    bgClass: 'bg-teal-100/90 border-teal-300',
    textClass: 'text-teal-900',
  },
};

// Date math helper: get YYYY-MM-DD for date + N days
export function getRelativeDateString(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Deterministic seasonal weather generator
export function getSeasonalWeatherForDate(dateStr: string): DayWeather {
  if (!dateStr) return { condition: 'sunny', tempHigh: 72, tempLow: 55, note: 'Comfortable day' };
  
  const [, mStr, dStr] = dateStr.split('-');
  const month = Number(mStr) || 1;
  const day = Number(dStr) || 1;
  const hash = ((month * 31 + day) * 17) % 100;

  if (month === 12 || month <= 2) {
    const conds: WeatherCondition[] = ['cloudy', 'snowy', 'partly_cloudy', 'rainy', 'windy'];
    return { condition: conds[hash % conds.length], tempHigh: 38 + (hash % 12), tempLow: 24 + (hash % 10), source: 'auto' };
  } else if (month >= 3 && month <= 5) {
    const conds: WeatherCondition[] = ['sunny', 'partly_cloudy', 'rainy', 'windy', 'sunny'];
    return { condition: conds[hash % conds.length], tempHigh: 58 + (hash % 16), tempLow: 42 + (hash % 12), source: 'auto' };
  } else if (month >= 6 && month <= 8) {
    const conds: WeatherCondition[] = ['sunny', 'sunny', 'partly_cloudy', 'stormy', 'sunny'];
    return { condition: conds[hash % conds.length], tempHigh: 78 + (hash % 15), tempLow: 62 + (hash % 12), source: 'auto' };
  } else {
    const conds: WeatherCondition[] = ['sunny', 'partly_cloudy', 'windy', 'rainy', 'cloudy'];
    return { condition: conds[hash % conds.length], tempHigh: 62 + (hash % 16), tempLow: 44 + (hash % 14), source: 'auto' };
  }
}

// Initial seed calendar events
export function getInitialSeedEvents(): CalendarEvent[] {
  return [
    {
      id: 'evt-1',
      title: 'Leo Soccer Practice ⚽',
      description: 'Bring soccer cleats, shin guards, and large water bottle.',
      date: getRelativeDateString(1),
      time: '16:00',
      endTime: '17:30',
      category: 'practice',
      assignedKidIds: ['kid-1'],
      location: 'Community Park Field #3',
      color: '#10b981',
      icon: '⚽',
      weatherNote: 'Sunny 75°F - Perfect match conditions',
      weatherIcon: 'sunny',
      isImportant: true,
    },
    {
      id: 'evt-2',
      title: 'Maya Science Fair Project Due 🪐',
      description: 'Final Solar System diorama presentation and notebook check.',
      date: getRelativeDateString(3),
      time: '09:00',
      endTime: '11:30',
      category: 'school_project',
      assignedKidIds: ['kid-2'],
      location: 'Oak Creek Elementary Gymnasium',
      color: '#6366f1',
      icon: '🪐',
      weatherNote: 'Rain forecast - Pack project in protective plastic cover',
      weatherIcon: 'rainy',
      isImportant: true,
    },
    {
      id: 'evt-3',
      title: 'School Field Trip: Science & History Museum 🚌',
      description: 'Grade 3 & 4 annual museum visit. Packed lunch and permission slip required.',
      date: getRelativeDateString(5),
      time: '08:30',
      endTime: '14:30',
      category: 'field_trip',
      assignedKidIds: ['kid-1', 'kid-2'],
      location: 'City Museum of Science',
      color: '#f59e0b',
      icon: '🚌',
      weatherNote: 'Partly cloudy 70°F - Comfortable walking weather',
      weatherIcon: 'partly_cloudy',
      isImportant: true,
    },
    {
      id: 'evt-4',
      title: 'Sam Pediatrician Checkup 🩺',
      description: 'Routine 6-year wellness checkup and growth chart update.',
      date: getRelativeDateString(8),
      time: '15:15',
      endTime: '16:00',
      category: 'appointment',
      assignedKidIds: ['kid-3'],
      location: 'Pediatric Care Center, Suite 204',
      color: '#06b6d4',
      icon: '🩺',
      weatherNote: 'Mild 68°F',
      weatherIcon: 'partly_cloudy',
      isImportant: false,
    },
    {
      id: 'evt-5',
      title: 'Maya Gymnastics & Dance Class 🩰',
      description: 'Practice floor routine and balance beam combinations.',
      date: getRelativeDateString(6),
      time: '10:00',
      endTime: '11:15',
      category: 'practice',
      assignedKidIds: ['kid-2'],
      location: 'Apex Gymnastics Academy',
      color: '#10b981',
      icon: '🩰',
      weatherNote: 'Indoor gym facility',
      isImportant: false,
    },
    {
      id: 'evt-6',
      title: 'Family Friday Pizza & Board Game Night 🍕',
      description: 'Kids choice: make homemade personal pizzas and play Monopoly Junior!',
      date: getRelativeDateString(4),
      time: '18:00',
      endTime: '20:30',
      category: 'family',
      assignedKidIds: ['all'],
      location: 'Home Dining Room',
      color: '#f97316',
      icon: '🍕',
      weatherNote: 'Cozy evening in',
      isImportant: true,
    },
    {
      id: 'evt-7',
      title: "Grandpa's 70th Birthday Celebration 🎂",
      description: 'Family cookout and surprise photobook gift presentation.',
      date: getRelativeDateString(14),
      time: '14:00',
      endTime: '18:00',
      category: 'birthday',
      assignedKidIds: ['all'],
      location: "Grandparent's Backyard",
      color: '#ec4899',
      icon: '🎂',
      weatherNote: 'Outdoor barbecue - Check weather closer to date',
      weatherIcon: 'sunny',
      isImportant: true,
    },
    {
      id: 'evt-8',
      title: 'Leo Karate Belt Evaluation 🥋',
      description: 'Testing for Green Belt rank. Wear full clean Gi uniform.',
      date: getRelativeDateString(18),
      time: '17:00',
      endTime: '18:30',
      category: 'milestone',
      assignedKidIds: ['kid-1'],
      location: 'Tiger Martial Arts Dojo',
      color: '#8b5cf6',
      icon: '🥋',
      isImportant: true,
    },
  ];
}

export const DEFAULT_ALL_KIDS_COLOR = '#10b981'; // Emerald Green for Entire Family / All Kids

export interface PoiColorChoice {
  id: string;
  label: string;
  hex: string;
  color: string;
  badgeBg: string;
  description?: string;
}

export const POI_COLOR_PALETTE: PoiColorChoice[] = [
  { id: 'emerald', label: 'Emerald / All Kids', hex: '#10b981', color: '#10b981', badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300', description: 'Emerald green for whole family & all kids' },
  { id: 'amber', label: 'Amber / Leo', hex: '#f59e0b', color: '#f59e0b', badgeBg: 'bg-amber-100 text-amber-900 border-amber-300', description: 'Sunny amber tint for sports and practices' },
  { id: 'pink', label: 'Berry / Maya', hex: '#ec4899', color: '#ec4899', badgeBg: 'bg-pink-100 text-pink-900 border-pink-300', description: 'Berry rose for arts, music & recitals' },
  { id: 'blue', label: 'Sky / Sam', hex: '#3b82f6', color: '#3b82f6', badgeBg: 'bg-blue-100 text-blue-900 border-blue-300', description: 'Sky blue for academic milestones & STEM' },
  { id: 'purple', label: 'Purple / Violet (Tasks & Misc)', hex: '#8b5cf6', color: '#8b5cf6', badgeBg: 'bg-purple-100 text-purple-900 border-purple-300', description: 'Royal purple / violet for misc tasks, errands, home projects & special events' },
  { id: 'cyan', label: 'Aqua Cyan', hex: '#06b6d4', color: '#06b6d4', badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-300', description: 'Aqua cyan for outdoor trips & beach outings' },
  { id: 'rose', label: 'Ruby Red', hex: '#f43f5e', color: '#f43f5e', badgeBg: 'bg-rose-100 text-rose-900 border-rose-300', description: 'Ruby red for doctor & high-urgency appointments' },
  { id: 'orange', label: 'Sunset Orange', hex: '#f97316', color: '#f97316', badgeBg: 'bg-orange-100 text-orange-900 border-orange-300', description: 'Sunset orange for social playdates & birthdays' },
  { id: 'indigo', label: 'Electric Indigo', hex: '#6366f1', color: '#6366f1', badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300', description: 'Deep indigo for school testing & finals' },
  { id: 'teal', label: 'Sea Teal', hex: '#14b8a6', color: '#14b8a6', badgeBg: 'bg-teal-100 text-teal-900 border-teal-300', description: 'Sea teal for swim meets & water sports' },
];

export interface DateSquareColorMeta {
  hasEvents: boolean;
  hasImportantPoi: boolean;
  isMultiKid: boolean;
  allKidsInvolved: boolean;
  involvedKids: KidProfile[];
  primaryColor: string;
  secondaryColor?: string;
  containerBg: string; // CSS background value (solid or linear-gradient)
  containerBorder: string; // CSS border-color
  topAccentBar?: string; // CSS background for top accent stripe
  badgeText?: string;
  avatarList: string[]; // Emojis e.g. ["🦁"], ["🦄"], ["👨‍👩‍👧‍👦"]
  dateNumberBg?: string; // Pill color behind date number
  dateNumberColor?: string; // Text color
}

/**
 * Calculates color coding styles for a calendar date square
 * Based on the events on that date, assigned kids, POI status, and color mode
 */
export function getDateSquareColorMeta(
  dayEvents: CalendarEvent[],
  kids: KidProfile[],
  colorMode: CalendarColorCodeMode = 'kid',
  allKidsColor: string = DEFAULT_ALL_KIDS_COLOR,
  isPast: boolean = false,
  isToday: boolean = false,
  customCategories?: CustomCalendarCategory[]
): DateSquareColorMeta {
  if (!dayEvents || dayEvents.length === 0) {
    return {
      hasEvents: false,
      hasImportantPoi: false,
      isMultiKid: false,
      allKidsInvolved: false,
      involvedKids: [],
      primaryColor: '#94a3b8',
      containerBg: isToday ? 'rgba(254, 243, 199, 0.95)' : isPast ? 'rgba(241, 245, 249, 0.5)' : 'rgba(255, 255, 255, 0.95)',
      containerBorder: isToday ? '#4f46e5' : isPast ? 'rgba(226, 232, 240, 0.6)' : 'rgba(254, 240, 138, 0.9)',
      avatarList: [],
    };
  }

  const hasImportantPoi = dayEvents.some((e) => e.isImportant || e.isPoi);

  // Check custom highlight override on any event on this date
  const customHighlightEvent = dayEvents.find((e) => e.highlightSquareColor);
  const customColorOverride = customHighlightEvent ? customHighlightEvent.highlightSquareColor : undefined;

  // Determine kid involvement
  let allKidsInvolved = false;
  const involvedKidSet = new Set<string>();

  dayEvents.forEach((evt) => {
    if (evt.assignedKidIds && evt.assignedKidIds.includes('all')) {
      allKidsInvolved = true;
    } else if (evt.category === 'family') {
      allKidsInvolved = true;
    }

    if (evt.assignedKidIds) {
      evt.assignedKidIds.forEach((id) => {
        if (id !== 'all') {
          involvedKidSet.add(id);
        }
      });
    }
  });

  const involvedKids = kids.filter((k) => involvedKidSet.has(k.id));
  const isMultiKid = involvedKids.length > 1 || (allKidsInvolved && involvedKids.length >= 1);

  // MODE 1: BY KID / FAMILY (Default requested mode)
  if (colorMode === 'kid') {
    // If a custom POI color is set on this date, let it take precedence
    if (customColorOverride) {
      const hex = customColorOverride;
      const bgOpacity = isPast ? '18' : '28';
      const borderOpacity = isPast ? '55' : 'aa';
      return {
        hasEvents: true,
        hasImportantPoi,
        isMultiKid,
        allKidsInvolved,
        involvedKids,
        primaryColor: hex,
        containerBg: `${hex}${bgOpacity}`,
        containerBorder: `${hex}${borderOpacity}`,
        topAccentBar: hex,
        badgeText: customHighlightEvent?.title || 'Highlight POI',
        avatarList: involvedKids.map((k) => k.avatar).concat(allKidsInvolved ? ['👨‍👩‍👧‍👦'] : []),
        dateNumberBg: hex,
        dateNumberColor: '#ffffff',
      };
    }

    // Case A: Exactly ONE kid involved (e.g. Leo)
    if (involvedKids.length === 1 && !allKidsInvolved) {
      const kid = involvedKids[0];
      const hex = kid.color || '#f59e0b';
      const bgOpacity = isPast ? '18' : '26';
      const borderOpacity = isPast ? '55' : 'aa';

      return {
        hasEvents: true,
        hasImportantPoi,
        isMultiKid: false,
        allKidsInvolved: false,
        involvedKids,
        primaryColor: hex,
        containerBg: `${hex}${bgOpacity}`,
        containerBorder: `${hex}${borderOpacity}`,
        topAccentBar: hex,
        badgeText: kid.name,
        avatarList: [kid.avatar],
        dateNumberBg: hex,
        dateNumberColor: '#ffffff',
      };
    }

    // Case B: ONLY "All Kids" / Family involved
    if (allKidsInvolved && involvedKids.length === 0) {
      const hex = allKidsColor || DEFAULT_ALL_KIDS_COLOR;
      const bgOpacity = isPast ? '18' : '26';
      const borderOpacity = isPast ? '55' : 'aa';

      return {
        hasEvents: true,
        hasImportantPoi,
        isMultiKid: false,
        allKidsInvolved: true,
        involvedKids: [],
        primaryColor: hex,
        containerBg: `${hex}${bgOpacity}`,
        containerBorder: `${hex}${borderOpacity}`,
        topAccentBar: hex,
        badgeText: 'All Kids',
        avatarList: ['👨‍👩‍👧‍👦'],
        dateNumberBg: hex,
        dateNumberColor: '#ffffff',
      };
    }

    // Case C: Multiple kids, or single kid + All Kids
    if (involvedKids.length > 1 || (allKidsInvolved && involvedKids.length > 0)) {
      const kidColors: string[] = [];
      const avatars: string[] = [];

      involvedKids.forEach((k) => {
        kidColors.push(k.color || '#3b82f6');
        avatars.push(k.avatar);
      });

      if (allKidsInvolved) {
        kidColors.push(allKidsColor || DEFAULT_ALL_KIDS_COLOR);
        avatars.push('👨‍👩‍👧‍👦');
      }

      const c1 = kidColors[0] || '#f59e0b';
      const c2 = kidColors[1] || '#ec4899';
      const c3 = kidColors[2];

      const bgOpacity = isPast ? '16' : '24';
      let gradientBg = `linear-gradient(135deg, ${c1}${bgOpacity} 0%, ${c2}${bgOpacity} 100%)`;
      if (c3) {
        gradientBg = `linear-gradient(135deg, ${c1}${bgOpacity} 0%, ${c2}${bgOpacity} 50%, ${c3}${bgOpacity} 100%)`;
      }

      const accentBar = c3
        ? `linear-gradient(90deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`
        : `linear-gradient(90deg, ${c1} 0%, ${c2} 100%)`;

      return {
        hasEvents: true,
        hasImportantPoi,
        isMultiKid: true,
        allKidsInvolved,
        involvedKids,
        primaryColor: c1,
        secondaryColor: c2,
        containerBg: gradientBg,
        containerBorder: isPast ? `${c1}55` : `${c1}aa`,
        topAccentBar: accentBar,
        badgeText: involvedKids.map((k) => k.name).join(' & '),
        avatarList: avatars,
        dateNumberBg: c1,
        dateNumberColor: '#ffffff',
      };
    }
  }

  // MODE 2: BY CATEGORY
  if (colorMode === 'category') {
    const primaryEvent = dayEvents[0];
    const catMeta = getEventCategoryMeta(primaryEvent, customCategories);
    const hex = catMeta.color || '#6366f1';
    const bgOpacity = isPast ? '18' : '26';
    const borderOpacity = isPast ? '55' : 'aa';

    return {
      hasEvents: true,
      hasImportantPoi,
      isMultiKid,
      allKidsInvolved,
      involvedKids,
      primaryColor: hex,
      containerBg: `${hex}${bgOpacity}`,
      containerBorder: `${hex}${borderOpacity}`,
      topAccentBar: hex,
      badgeText: catMeta.shortLabel,
      avatarList: [catMeta.icon],
      dateNumberBg: hex,
      dateNumberColor: '#ffffff',
    };
  }

  // MODE 3: BY POI / PRIORITY ONLY
  if (colorMode === 'poi') {
    if (hasImportantPoi) {
      return {
        hasEvents: true,
        hasImportantPoi: true,
        isMultiKid,
        allKidsInvolved,
        involvedKids,
        primaryColor: '#f59e0b',
        containerBg: isPast ? 'rgba(245, 158, 11, 0.20)' : 'rgba(245, 158, 11, 0.32)',
        containerBorder: '#f59e0b',
        topAccentBar: '#f59e0b',
        badgeText: '⭐ POI Alert',
        avatarList: ['⭐'],
        dateNumberBg: '#f59e0b',
        dateNumberColor: '#ffffff',
      };
    }

    return {
      hasEvents: true,
      hasImportantPoi: false,
      isMultiKid,
      allKidsInvolved,
      involvedKids,
      primaryColor: '#6366f1',
      containerBg: isPast ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.14)',
      containerBorder: isPast ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.6)',
      topAccentBar: '#6366f1',
      avatarList: [],
    };
  }

  // MODE 4: SUBTLE (White background with colored top accent strip)
  const fallbackKid = involvedKids[0];
  const hex = customColorOverride || (fallbackKid ? fallbackKid.color : allKidsInvolved ? allKidsColor : '#6366f1');

  return {
    hasEvents: true,
    hasImportantPoi,
    isMultiKid,
    allKidsInvolved,
    involvedKids,
    primaryColor: hex,
    containerBg: isToday ? 'rgba(254, 243, 199, 0.95)' : isPast ? 'rgba(241, 245, 249, 0.6)' : 'rgba(255, 255, 255, 0.95)',
    containerBorder: isPast ? 'rgba(203, 213, 225, 0.6)' : `${hex}60`,
    topAccentBar: hex,
    badgeText: fallbackKid?.name || (allKidsInvolved ? 'All Kids' : undefined),
    avatarList: involvedKids.map((k) => k.avatar).concat(allKidsInvolved ? ['👨‍👩‍👧‍👦'] : []),
  };
}
