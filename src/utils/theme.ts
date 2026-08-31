export type AppThemeId = 'soft-calm' | 'warm-sand' | 'sage-meadow' | 'twilight-dark' | 'classic-sunshine';

export interface AppThemeConfig {
  id: AppThemeId;
  name: string;
  description: string;
  icon: string;
  colorSwatch: string;
  isDark: boolean;
  bgGradient: string;
  cardBg: string;
  cardBorder: string;
  headerBg: string;
  accentBadge: string;
}

export const APP_THEMES: Record<AppThemeId, AppThemeConfig> = {
  'soft-calm': {
    id: 'soft-calm',
    name: 'Soft Sky (Calm)',
    description: 'Gentle cool blue & slate. Eases eye strain for all-day use.',
    icon: '🌤️',
    colorSwatch: '#38bdf8',
    isDark: false,
    bgGradient: 'bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-50/60',
    cardBg: 'bg-white/80 backdrop-blur-md',
    cardBorder: 'border-slate-200/80',
    headerBg: 'bg-white/85 backdrop-blur-md border-slate-200/80',
    accentBadge: 'bg-sky-100 text-sky-800 border-sky-200',
  },
  'warm-sand': {
    id: 'warm-sand',
    name: 'Warm Linen',
    description: 'Cozy oatmeal and warm sand tones with soft contrast.',
    icon: '🌾',
    colorSwatch: '#d97706',
    isDark: false,
    bgGradient: 'bg-gradient-to-br from-stone-100 via-amber-50/70 to-orange-50/50',
    cardBg: 'bg-stone-50/85 backdrop-blur-md',
    cardBorder: 'border-stone-200',
    headerBg: 'bg-stone-100/90 backdrop-blur-md border-stone-200',
    accentBadge: 'bg-amber-100 text-amber-900 border-amber-200',
  },
  'sage-meadow': {
    id: 'sage-meadow',
    name: 'Sage Meadow',
    description: 'Tranquil earthy sage green, peaceful and natural.',
    icon: '🍃',
    colorSwatch: '#10b981',
    isDark: false,
    bgGradient: 'bg-gradient-to-br from-emerald-50/80 via-teal-50/60 to-slate-100',
    cardBg: 'bg-white/85 backdrop-blur-md',
    cardBorder: 'border-emerald-200/70',
    headerBg: 'bg-white/85 backdrop-blur-md border-emerald-200/80',
    accentBadge: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  },
  'twilight-dark': {
    id: 'twilight-dark',
    name: 'Twilight Slate (Dark)',
    description: 'Deep navy-slate dark mode for evening use and eye comfort.',
    icon: '🌙',
    colorSwatch: '#6366f1',
    isDark: true,
    bgGradient: 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950',
    cardBg: 'bg-slate-900/80 backdrop-blur-md',
    cardBorder: 'border-slate-800',
    headerBg: 'bg-slate-950/85 backdrop-blur-md border-slate-800',
    accentBadge: 'bg-indigo-950 text-indigo-300 border-indigo-800',
  },
  'classic-sunshine': {
    id: 'classic-sunshine',
    name: 'Classic Sunshine',
    description: 'The original vibrant high-energy gold & yellow palette.',
    icon: '☀️',
    colorSwatch: '#eab308',
    isDark: false,
    bgGradient: 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50',
    cardBg: 'bg-white/90 backdrop-blur-md',
    cardBorder: 'border-yellow-200',
    headerBg: 'bg-white/90 backdrop-blur-md border-yellow-200',
    accentBadge: 'bg-yellow-100 text-yellow-900 border-yellow-300',
  },
};

const THEME_STORAGE_KEY = 'chorequest_theme_id_v1';

export function getSavedThemeId(): AppThemeId {
  if (typeof window === 'undefined') return 'soft-calm';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as AppThemeId | null;
    if (saved && APP_THEMES[saved]) {
      return saved;
    }
  } catch (e) {
    // Ignore localStorage read failures
  }
  return 'soft-calm';
}

export function saveThemeId(themeId: AppThemeId): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
    // Also toggle dark class on html root for tailwind dark: modifiers
    if (APP_THEMES[themeId]?.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {
    // Ignore storage errors
  }
}
