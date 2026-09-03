import { CalendarEvent, CalendarEventCategory, CustomCalendarCategory, DayWeather, WeatherCondition } from '../types';

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
