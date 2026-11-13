/**
 * ChoreQuest 2026 themes — see docs/design-2026/README.md.
 *
 * Every 2026 theme shares the same class strings below; the actual colours
 * come from CSS variables set per theme in src/styles/cq2026.css
 * (`html[data-theme="cq-…"]`). That keeps Tailwind's class scanning happy
 * (all class names are literal) and lets one stylesheet restyle the whole app.
 */
import type { AppThemeConfig, AppThemeId } from './theme';

export const CQ2026_THEME_IDS = [
  'cq-midnight',
  'cq-sage',
  'cq-ember',
  'cq-nebula',
  'cq-paper',
  'cq-fog',
  'cq-sorbet',
  'cq-green',
] as const;

export type Cq2026ThemeId = (typeof CQ2026_THEME_IDS)[number];

export const isCq2026Theme = (id: string | undefined | null): id is Cq2026ThemeId =>
  !!id && (CQ2026_THEME_IDS as readonly string[]).includes(id);

// Shared token strings (colours resolve through CSS variables).
const surface = 'bg-[var(--cq-surface)]';
const line = 'border-[var(--cq-line)]';
const label = 'text-[var(--cq-label)]';
const label2 = 'text-[var(--cq-label-2)]';
const accentFill = 'bg-[var(--cq-accent)] text-[var(--cq-on-accent)]';
const accentSoft = 'bg-[var(--cq-accent-soft)] text-[var(--cq-accent-text)] border border-[var(--cq-line)]';

function make(
  id: Cq2026ThemeId,
  name: string,
  subtitle: string,
  description: string,
  icon: string,
  swatches: string[],
  isDark: boolean,
  category: AppThemeConfig['category'],
  isUserFavorite = false,
): AppThemeConfig {
  return {
    id: id as AppThemeId,
    name,
    subtitle,
    description,
    icon,
    swatches,
    colorSwatch: swatches[2],
    isDark,
    isUserFavorite,
    category,
    contrastRatio: 'AA+ (checked)',
    inputFieldBg: 'bg-[var(--cq-surface-2)] text-[var(--cq-label)] border-[var(--cq-line)]',
    inputFieldPreviewText: `${name}: calm surfaces, one accent`,

    bgGradient: 'cq-ground',
    pageBackground: swatches[0],

    bannerGradient: `${surface} border ${line}`,
    bannerBorder: line,
    bannerGlow: '',

    headerBg: 'bg-[var(--cq-ground-glass)] backdrop-blur-xl',
    headerBorder: line,
    headerLogoBg: 'bg-[var(--cq-accent)]',
    headerLogoText: 'text-[var(--cq-on-accent)]',
    headerTextColor: label,

    goalBannerBg: surface,
    goalBannerBorder: line,
    goalBannerIconBg: 'bg-[var(--cq-accent-soft)]',
    goalBannerProgress: 'bg-[var(--cq-accent)]',
    goalBadge: accentSoft,
    goalTitleColor: label,

    kidCardBg: surface,
    kidCardBorder: line,
    kidCardHover: 'hover:bg-[var(--cq-surface-2)]',
    kidCardStatsBg: 'bg-[var(--cq-surface-2)]',
    kidCardNameColor: label,
    kidCardSubtextColor: label2,
    kidCardProgress: 'bg-[var(--cq-accent)]',
    kidCardAvatarBorder: line,

    kioskBg: 'cq-ground min-h-screen text-[var(--cq-label)]',
    kioskHeaderBg: surface,
    kioskHeaderBorder: line,
    kioskHeaderLogoBg: 'bg-[var(--cq-accent)]',
    kioskHeaderLogoText: 'text-[var(--cq-on-accent)]',
    kioskHeaderTextColor: label,
    kioskClockBg: 'bg-transparent',
    kioskClockText: label,
    kioskMvpSpotlightBg: surface,
    kioskMvpSpotlightBorder: line,
    kioskCardBg: surface,
    kioskCardBorder: line,
    kioskCardMvpBorder: 'border-[var(--cq-accent)]',
    kioskCardMvpBg: surface,
    kioskCardItemBg: 'bg-[var(--cq-surface-2)] border border-[var(--cq-line)] text-[var(--cq-label)]',
    kioskCardItemDone: 'bg-[var(--cq-done-soft)] border border-[var(--cq-line)] text-[var(--cq-label-2)]',
    kioskSummaryCardBg: surface,
    kioskSummaryCardBorder: line,
    kioskFooterBorder: line,
    kioskFooterSlateBg: surface,
    kioskFooterSlateBorder: line,
    kioskFooterPillBg: 'bg-[var(--cq-accent-soft)] border border-[var(--cq-line)]',
    kioskFooterPillText: 'text-[var(--cq-accent-text)] font-semibold',
    kioskFooterPillSecondaryBg: 'bg-[var(--cq-surface-2)] border border-[var(--cq-line)]',
    kioskFooterPillSecondaryText: 'text-[var(--cq-label-2)] font-semibold',

    primaryBtn: `${accentFill} hover:opacity-90 font-semibold`,
    secondaryBtn: 'bg-[var(--cq-surface-2)] hover:opacity-90 text-[var(--cq-label)] border border-[var(--cq-line)] font-semibold',
    accentPill: accentSoft,
    progressGradient: 'from-[var(--cq-accent)] to-[var(--cq-accent)]',
  };
}

export const CQ2026_THEMES: Record<Cq2026ThemeId, AppThemeConfig> = {
  'cq-midnight': make('cq-midnight', 'Midnight', 'Dark · the 2026 default', 'Deep charcoal, quiet surfaces and one blue accent.', '🌙', ['#0C0E13', '#161922', '#5B8CFF'], true, 'dark', true),
  'cq-sage': make('cq-sage', 'Graphite & Sage', 'Dark · calm and earthy', 'Graphite surfaces with a soft sage accent.', '🌿', ['#101311', '#1A1E1B', '#8FC4A0'], true, 'dark'),
  'cq-ember': make('cq-ember', 'Ember', 'Dark · warm for evenings', 'Warm dark browns with a terracotta accent.', '🔥', ['#14100E', '#1F1915', '#F08A5D'], true, 'dark'),
  'cq-nebula': make('cq-nebula', 'Nebula', 'Dark · violet', 'Inky violet with a lavender accent.', '🪐', ['#0D0B17', '#191529', '#A78BFA'], true, 'dark'),
  'cq-paper': make('cq-paper', 'Paper', 'Light · warm, print-like', 'Warm off-white paper with an indigo accent.', '📄', ['#F6F3EE', '#FFFFFF', '#3D5AFE'], false, 'light', true),
  'cq-fog': make('cq-fog', 'Fog', 'Light · cool and clean', 'Cool grey-white with a deep teal accent.', '🌫️', ['#EEF1F4', '#FFFFFF', '#0F7C7E'], false, 'light'),
  'cq-sorbet': make('cq-sorbet', 'Sorbet', 'Light · for Playful style', 'Soft peach with a bright pink accent.', '🍧', ['#FFF4EE', '#FFFFFF', '#E8437A'], false, 'light'),
  'cq-green': make('cq-green', 'Midnight Green', 'Dark · team colours', 'Midnight green with a silver accent.', '🏈', ['#041618', '#0B2A2E', '#A5ACAF'], true, 'sports'),
};

/** True when a 2026 theme is applied to the page (for components without a theme prop). */
export const isCq2026Active = (): boolean =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('cq2026');
