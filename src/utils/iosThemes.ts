/**
 * iOS "glass" themes — Aurora, Dusk, Ocean, Forest, Midnight (dark) and
 * Daylight (light). Each paints a wallpaper-* scene from src/styles/ios.css
 * behind frosted-glass surfaces. Registered in APP_THEMES (theme.ts).
 */
import type { AppThemeConfig } from './theme';

// ─── Shared glass token strings ────────────────────────────
// These are Tailwind utility strings used in the theme tokens.
// They reference our new .glass / .glass-mid utility classes
// defined in index.css via arbitrary Tailwind values.

const G = {
  // Glass backgrounds (arbitrary Tailwind bg values)
  thin:   'bg-white/[0.07] backdrop-blur-xl',
  mid:    'bg-white/[0.11] backdrop-blur-2xl',
  strong: 'bg-white/[0.16] backdrop-blur-3xl',

  // Borders
  border: 'border-white/[0.14]',
  borderStrong: 'border-white/[0.22]',

  // Text
  textPrimary:   'text-white/95',
  textSecondary: 'text-white/60',
  textTertiary:  'text-white/35',

  // Accents (iOS semantic)
  blue:   'text-[#0A84FF]',
  green:  'text-[#34C759]',
  orange: 'text-[#FF9F0A]',
  purple: 'text-[#BF5AF2]',
};

// ─────────────────────────────────────────────────────────────
// 1.  iOS AURORA  (deep violet/blue night sky)
// ─────────────────────────────────────────────────────────────
export const iosAuroraTheme: AppThemeConfig = {
  id: 'ios-aurora',
  name: 'Aurora',
  subtitle: 'Deep violet night sky',
  description: 'Violet aurora, midnight blue and soft starlight.',
  icon: '🌌',
  swatches: ['#8B5CF6', '#3B82F6', '#10B981', '#060B18', '#0C1535'],
  colorSwatch: '#8B5CF6',
  isDark: true,
  isUserFavorite: true,
  category: 'dark',
  contrastRatio: '15.3:1 (AAA Pass)',
  inputFieldBg: 'bg-white/10 text-white placeholder-white/40 border-white/20',
  inputFieldPreviewText: 'Aurora: crisp white on deep glass',

  // Canvas — wallpaper-aurora class is set on the root wrapper in App.tsx
  bgGradient: 'wallpaper-aurora',
  pageBackground: '#060B18',

  // Hero banner
  bannerGradient: `${G.mid} border ${G.border}`,
  bannerBorder: G.border,
  bannerGlow: '',

  // Navbar
  headerBg: `${G.mid} border-b ${G.border}`,
  headerBorder: G.border,
  headerLogoBg: 'bg-[#0A84FF]',
  headerLogoText: 'text-white',
  headerTextColor: G.textPrimary,

  // Family Goal Banner
  goalBannerBg: G.mid,
  goalBannerBorder: G.border,
  goalBannerIconBg: 'bg-[#8B5CF2]/30',
  goalBannerProgress: 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]',
  goalBadge: 'bg-[#8B5CF6]/25 text-[#C4B5FD] border border-[#8B5CF6]/35',
  goalTitleColor: G.textPrimary,

  // Kid cards
  kidCardBg: G.thin,
  kidCardBorder: G.border,
  kidCardHover: 'hover:bg-white/[0.13]',
  kidCardStatsBg: 'bg-white/[0.07]',
  kidCardNameColor: 'text-white/90',
  kidCardSubtextColor: 'text-white/55',
  kidCardProgress: 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]',
  kidCardAvatarBorder: 'border-white/20',

  // Kiosk
  kioskBg: 'wallpaper-aurora min-h-screen text-white',
  kioskHeaderBg: G.mid,
  kioskHeaderBorder: G.border,
  kioskHeaderLogoBg: 'bg-[#0A84FF]',
  kioskHeaderLogoText: 'text-white',
  kioskHeaderTextColor: G.textPrimary,
  kioskClockBg: G.thin,
  kioskClockText: 'text-white/90',
  kioskMvpSpotlightBg: 'bg-[#8B5CF6]/20',
  kioskMvpSpotlightBorder: 'border-[#8B5CF6]/35',
  kioskCardBg: G.thin,
  kioskCardBorder: G.border,
  kioskCardMvpBorder: 'border-[#8B5CF6]/50',
  kioskCardMvpBg: 'bg-[#8B5CF6]/12',
  kioskCardItemBg: 'bg-white/[0.05]',
  kioskCardItemDone: 'bg-[#34C759]/12',
  kioskSummaryCardBg: G.thin,
  kioskSummaryCardBorder: G.border,
  kioskFooterBorder: G.border,
  kioskFooterSlateBg: G.thin,
  kioskFooterSlateBorder: G.border,
  kioskFooterPillBg: 'bg-[#0A84FF]/25 border border-[#0A84FF]/40',
  kioskFooterPillText: 'text-[#5AC8FA] font-semibold',
  kioskFooterPillSecondaryBg: 'bg-white/[0.07] border border-white/[0.14]',
  kioskFooterPillSecondaryText: 'text-white/70 font-semibold',

  // Buttons
  primaryBtn: 'bg-[#0A84FF] hover:bg-[#0A84FF]/85 text-white font-semibold',
  secondaryBtn: 'bg-white/10 hover:bg-white/15 text-white/90 border border-white/20 font-semibold',
  accentPill: 'bg-[#8B5CF6]/20 text-[#C4B5FD] border border-[#8B5CF6]/30',
  progressGradient: 'from-[#8B5CF6] via-[#3B82F6] to-[#5AC8FA]',
};

// ─────────────────────────────────────────────────────────────
// 2.  iOS DUSK  (rose/amber sunset)
// ─────────────────────────────────────────────────────────────
export const iosDuskTheme: AppThemeConfig = {
  id: 'ios-dusk',
  name: 'Dusk',
  subtitle: 'Warm rose and amber sunset',
  description: 'Deep dusk sky with rose, amber and violet gradients.',
  icon: '🌅',
  swatches: ['#FB7185', '#F97316', '#8B5CF6', '#0F0A0E', '#1A0F18'],
  colorSwatch: '#FB7185',
  isDark: true,
  isUserFavorite: false,
  category: 'dark',
  contrastRatio: '14.8:1 (AAA Pass)',
  inputFieldBg: 'bg-white/10 text-white placeholder-white/40 border-white/20',
  inputFieldPreviewText: 'Dusk: warm rose glass',

  bgGradient: 'wallpaper-dusk',
  pageBackground: '#0F0A0E',

  bannerGradient: `${G.mid} border ${G.border}`,
  bannerBorder: G.border,
  bannerGlow: '',

  headerBg: `${G.mid} border-b ${G.border}`,
  headerBorder: G.border,
  headerLogoBg: 'bg-[#FB7185]',
  headerLogoText: 'text-white',
  headerTextColor: G.textPrimary,

  goalBannerBg: G.mid,
  goalBannerBorder: G.border,
  goalBannerIconBg: 'bg-[#FB7185]/25',
  goalBannerProgress: 'bg-gradient-to-r from-[#FB7185] to-[#F97316]',
  goalBadge: 'bg-[#FB7185]/25 text-[#FCA5A5] border border-[#FB7185]/35',
  goalTitleColor: G.textPrimary,

  kidCardBg: G.thin,
  kidCardBorder: G.border,
  kidCardHover: 'hover:bg-white/[0.13]',
  kidCardStatsBg: 'bg-white/[0.07]',
  kidCardNameColor: 'text-white/90',
  kidCardSubtextColor: 'text-white/55',
  kidCardProgress: 'bg-gradient-to-r from-[#FB7185] to-[#F97316]',
  kidCardAvatarBorder: 'border-white/20',

  kioskBg: 'wallpaper-dusk min-h-screen text-white',
  kioskHeaderBg: G.mid,
  kioskHeaderBorder: G.border,
  kioskHeaderLogoBg: 'bg-[#FB7185]',
  kioskHeaderLogoText: 'text-white',
  kioskHeaderTextColor: G.textPrimary,
  kioskClockBg: G.thin,
  kioskClockText: 'text-white/90',
  kioskMvpSpotlightBg: 'bg-[#FB7185]/15',
  kioskMvpSpotlightBorder: 'border-[#FB7185]/30',
  kioskCardBg: G.thin,
  kioskCardBorder: G.border,
  kioskCardMvpBorder: 'border-[#FB7185]/45',
  kioskCardMvpBg: 'bg-[#FB7185]/10',
  kioskCardItemBg: 'bg-white/[0.05]',
  kioskCardItemDone: 'bg-[#34C759]/12',
  kioskSummaryCardBg: G.thin,
  kioskSummaryCardBorder: G.border,
  kioskFooterBorder: G.border,
  kioskFooterSlateBg: G.thin,
  kioskFooterSlateBorder: G.border,
  kioskFooterPillBg: 'bg-[#FB7185]/20 border border-[#FB7185]/35',
  kioskFooterPillText: 'text-[#FCA5A5] font-semibold',
  kioskFooterPillSecondaryBg: 'bg-white/[0.07] border border-white/[0.14]',
  kioskFooterPillSecondaryText: 'text-white/70 font-semibold',

  primaryBtn: 'bg-[#FB7185] hover:bg-[#FB7185]/85 text-white font-semibold',
  secondaryBtn: 'bg-white/10 hover:bg-white/15 text-white/90 border border-white/20 font-semibold',
  accentPill: 'bg-[#FB7185]/18 text-[#FCA5A5] border border-[#FB7185]/28',
  progressGradient: 'from-[#FB7185] via-[#F97316] to-[#FFD60A]',
};

// ─────────────────────────────────────────────────────────────
// 3.  iOS OCEAN  (deep ocean teal/blue)
// ─────────────────────────────────────────────────────────────
export const iosOceanTheme: AppThemeConfig = {
  id: 'ios-ocean',
  name: 'Ocean',
  subtitle: 'Deep ocean teal and blue',
  description: 'Midnight ocean depths with teal bioluminescence.',
  icon: '🌊',
  swatches: ['#0EA5E9', '#10B981', '#6366F1', '#030C18', '#061525'],
  colorSwatch: '#0EA5E9',
  isDark: true,
  isUserFavorite: false,
  category: 'dark',
  contrastRatio: '15.1:1 (AAA Pass)',
  inputFieldBg: 'bg-white/10 text-white placeholder-white/40 border-white/20',
  inputFieldPreviewText: 'Ocean: cool teal glass',

  bgGradient: 'wallpaper-ocean',
  pageBackground: '#030C18',

  bannerGradient: `${G.mid} border ${G.border}`,
  bannerBorder: G.border,
  bannerGlow: '',

  headerBg: `${G.mid} border-b ${G.border}`,
  headerBorder: G.border,
  headerLogoBg: 'bg-[#0EA5E9]',
  headerLogoText: 'text-white',
  headerTextColor: G.textPrimary,

  goalBannerBg: G.mid,
  goalBannerBorder: G.border,
  goalBannerIconBg: 'bg-[#0EA5E9]/25',
  goalBannerProgress: 'bg-gradient-to-r from-[#0EA5E9] to-[#10B981]',
  goalBadge: 'bg-[#0EA5E9]/22 text-[#7DD3FC] border border-[#0EA5E9]/32',
  goalTitleColor: G.textPrimary,

  kidCardBg: G.thin,
  kidCardBorder: G.border,
  kidCardHover: 'hover:bg-white/[0.13]',
  kidCardStatsBg: 'bg-white/[0.07]',
  kidCardNameColor: 'text-white/90',
  kidCardSubtextColor: 'text-white/55',
  kidCardProgress: 'bg-gradient-to-r from-[#0EA5E9] to-[#10B981]',
  kidCardAvatarBorder: 'border-white/20',

  kioskBg: 'wallpaper-ocean min-h-screen text-white',
  kioskHeaderBg: G.mid,
  kioskHeaderBorder: G.border,
  kioskHeaderLogoBg: 'bg-[#0EA5E9]',
  kioskHeaderLogoText: 'text-white',
  kioskHeaderTextColor: G.textPrimary,
  kioskClockBg: G.thin,
  kioskClockText: 'text-white/90',
  kioskMvpSpotlightBg: 'bg-[#0EA5E9]/15',
  kioskMvpSpotlightBorder: 'border-[#0EA5E9]/30',
  kioskCardBg: G.thin,
  kioskCardBorder: G.border,
  kioskCardMvpBorder: 'border-[#0EA5E9]/45',
  kioskCardMvpBg: 'bg-[#0EA5E9]/10',
  kioskCardItemBg: 'bg-white/[0.05]',
  kioskCardItemDone: 'bg-[#34C759]/12',
  kioskSummaryCardBg: G.thin,
  kioskSummaryCardBorder: G.border,
  kioskFooterBorder: G.border,
  kioskFooterSlateBg: G.thin,
  kioskFooterSlateBorder: G.border,
  kioskFooterPillBg: 'bg-[#0EA5E9]/20 border border-[#0EA5E9]/35',
  kioskFooterPillText: 'text-[#7DD3FC] font-semibold',
  kioskFooterPillSecondaryBg: 'bg-white/[0.07] border border-white/[0.14]',
  kioskFooterPillSecondaryText: 'text-white/70 font-semibold',

  primaryBtn: 'bg-[#0EA5E9] hover:bg-[#0EA5E9]/85 text-white font-semibold',
  secondaryBtn: 'bg-white/10 hover:bg-white/15 text-white/90 border border-white/20 font-semibold',
  accentPill: 'bg-[#0EA5E9]/18 text-[#7DD3FC] border border-[#0EA5E9]/28',
  progressGradient: 'from-[#0EA5E9] via-[#10B981] to-[#6366F1]',
};

// ─────────────────────────────────────────────────────────────
// 4.  iOS FOREST  (deep emerald forest)
// ─────────────────────────────────────────────────────────────
export const iosForestTheme: AppThemeConfig = {
  id: 'ios-forest',
  name: 'Forest',
  subtitle: 'Deep emerald forest night',
  description: 'Midnight forest with emerald glow and misty cyan.',
  icon: '🌲',
  swatches: ['#10B981', '#059669', '#0EA5E9', '#030C0A', '#061A0F'],
  colorSwatch: '#10B981',
  isDark: true,
  isUserFavorite: false,
  category: 'dark',
  contrastRatio: '14.9:1 (AAA Pass)',
  inputFieldBg: 'bg-white/10 text-white placeholder-white/40 border-white/20',
  inputFieldPreviewText: 'Forest: deep green glass',

  bgGradient: 'wallpaper-forest',
  pageBackground: '#030C0A',

  bannerGradient: `${G.mid} border ${G.border}`,
  bannerBorder: G.border,
  bannerGlow: '',

  headerBg: `${G.mid} border-b ${G.border}`,
  headerBorder: G.border,
  headerLogoBg: 'bg-[#10B981]',
  headerLogoText: 'text-white',
  headerTextColor: G.textPrimary,

  goalBannerBg: G.mid,
  goalBannerBorder: G.border,
  goalBannerIconBg: 'bg-[#10B981]/25',
  goalBannerProgress: 'bg-gradient-to-r from-[#10B981] to-[#0EA5E9]',
  goalBadge: 'bg-[#10B981]/22 text-[#6EE7B7] border border-[#10B981]/32',
  goalTitleColor: G.textPrimary,

  kidCardBg: G.thin,
  kidCardBorder: G.border,
  kidCardHover: 'hover:bg-white/[0.13]',
  kidCardStatsBg: 'bg-white/[0.07]',
  kidCardNameColor: 'text-white/90',
  kidCardSubtextColor: 'text-white/55',
  kidCardProgress: 'bg-gradient-to-r from-[#10B981] to-[#0EA5E9]',
  kidCardAvatarBorder: 'border-white/20',

  kioskBg: 'wallpaper-forest min-h-screen text-white',
  kioskHeaderBg: G.mid,
  kioskHeaderBorder: G.border,
  kioskHeaderLogoBg: 'bg-[#10B981]',
  kioskHeaderLogoText: 'text-white',
  kioskHeaderTextColor: G.textPrimary,
  kioskClockBg: G.thin,
  kioskClockText: 'text-white/90',
  kioskMvpSpotlightBg: 'bg-[#10B981]/15',
  kioskMvpSpotlightBorder: 'border-[#10B981]/30',
  kioskCardBg: G.thin,
  kioskCardBorder: G.border,
  kioskCardMvpBorder: 'border-[#10B981]/45',
  kioskCardMvpBg: 'bg-[#10B981]/10',
  kioskCardItemBg: 'bg-white/[0.05]',
  kioskCardItemDone: 'bg-[#34C759]/12',
  kioskSummaryCardBg: G.thin,
  kioskSummaryCardBorder: G.border,
  kioskFooterBorder: G.border,
  kioskFooterSlateBg: G.thin,
  kioskFooterSlateBorder: G.border,
  kioskFooterPillBg: 'bg-[#10B981]/20 border border-[#10B981]/35',
  kioskFooterPillText: 'text-[#6EE7B7] font-semibold',
  kioskFooterPillSecondaryBg: 'bg-white/[0.07] border border-white/[0.14]',
  kioskFooterPillSecondaryText: 'text-white/70 font-semibold',

  primaryBtn: 'bg-[#10B981] hover:bg-[#10B981]/85 text-white font-semibold',
  secondaryBtn: 'bg-white/10 hover:bg-white/15 text-white/90 border border-white/20 font-semibold',
  accentPill: 'bg-[#10B981]/18 text-[#6EE7B7] border border-[#10B981]/28',
  progressGradient: 'from-[#10B981] via-[#059669] to-[#0EA5E9]',
};

// ─────────────────────────────────────────────────────────────
// 5.  iOS MIDNIGHT  (pure deep space midnight)
// ─────────────────────────────────────────────────────────────
export const iosMidnightTheme: AppThemeConfig = {
  id: 'ios-midnight',
  name: 'Midnight',
  subtitle: 'Pure deep space',
  description: 'Near-black deep space with subtle indigo glow.',
  icon: '🌑',
  swatches: ['#6366F1', '#8B5CF6', '#1E1B4B', '#07070D', '#0D0D1A'],
  colorSwatch: '#6366F1',
  isDark: true,
  isUserFavorite: false,
  category: 'dark',
  contrastRatio: '16.1:1 (AAA Pass)',
  inputFieldBg: 'bg-white/10 text-white placeholder-white/40 border-white/20',
  inputFieldPreviewText: 'Midnight: near-black deep space',

  bgGradient: 'wallpaper-midnight',
  pageBackground: '#07070D',

  bannerGradient: `${G.mid} border ${G.border}`,
  bannerBorder: G.border,
  bannerGlow: '',

  headerBg: `${G.mid} border-b ${G.border}`,
  headerBorder: G.border,
  headerLogoBg: 'bg-[#6366F1]',
  headerLogoText: 'text-white',
  headerTextColor: G.textPrimary,

  goalBannerBg: G.mid,
  goalBannerBorder: G.border,
  goalBannerIconBg: 'bg-[#6366F1]/25',
  goalBannerProgress: 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]',
  goalBadge: 'bg-[#6366F1]/22 text-[#A5B4FC] border border-[#6366F1]/32',
  goalTitleColor: G.textPrimary,

  kidCardBg: G.thin,
  kidCardBorder: G.border,
  kidCardHover: 'hover:bg-white/[0.13]',
  kidCardStatsBg: 'bg-white/[0.07]',
  kidCardNameColor: 'text-white/90',
  kidCardSubtextColor: 'text-white/55',
  kidCardProgress: 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]',
  kidCardAvatarBorder: 'border-white/20',

  kioskBg: 'wallpaper-midnight min-h-screen text-white',
  kioskHeaderBg: G.mid,
  kioskHeaderBorder: G.border,
  kioskHeaderLogoBg: 'bg-[#6366F1]',
  kioskHeaderLogoText: 'text-white',
  kioskHeaderTextColor: G.textPrimary,
  kioskClockBg: G.thin,
  kioskClockText: 'text-white/90',
  kioskMvpSpotlightBg: 'bg-[#6366F1]/15',
  kioskMvpSpotlightBorder: 'border-[#6366F1]/30',
  kioskCardBg: G.thin,
  kioskCardBorder: G.border,
  kioskCardMvpBorder: 'border-[#6366F1]/45',
  kioskCardMvpBg: 'bg-[#6366F1]/10',
  kioskCardItemBg: 'bg-white/[0.05]',
  kioskCardItemDone: 'bg-[#34C759]/12',
  kioskSummaryCardBg: G.thin,
  kioskSummaryCardBorder: G.border,
  kioskFooterBorder: G.border,
  kioskFooterSlateBg: G.thin,
  kioskFooterSlateBorder: G.border,
  kioskFooterPillBg: 'bg-[#6366F1]/20 border border-[#6366F1]/35',
  kioskFooterPillText: 'text-[#A5B4FC] font-semibold',
  kioskFooterPillSecondaryBg: 'bg-white/[0.07] border border-white/[0.14]',
  kioskFooterPillSecondaryText: 'text-white/70 font-semibold',

  primaryBtn: 'bg-[#6366F1] hover:bg-[#6366F1]/85 text-white font-semibold',
  secondaryBtn: 'bg-white/10 hover:bg-white/15 text-white/90 border border-white/20 font-semibold',
  accentPill: 'bg-[#6366F1]/18 text-[#A5B4FC] border border-[#6366F1]/28',
  progressGradient: 'from-[#6366F1] via-[#8B5CF6] to-[#5AC8FA]',
};

// ─────────────────────────────────────────────────────────────
// 6.  iOS DAYLIGHT  (light appearance — frosted white on a soft morning sky)
// ─────────────────────────────────────────────────────────────
const L = {
  thin: 'bg-white/[0.55] backdrop-blur-xl',
  mid: 'bg-white/[0.7] backdrop-blur-2xl',
  border: 'border-black/[0.07]',
  textPrimary: 'text-black/90',
  textSecondary: 'text-black/55',
};

export const iosDaylightTheme: AppThemeConfig = {
  id: 'ios-daylight',
  name: 'Daylight',
  subtitle: 'Frosted white morning sky',
  description: 'The light iOS look: soft sky-blue wallpaper under frosted white glass.',
  icon: '☀️',
  swatches: ['#007AFF', '#5AC8FA', '#AF52DE', '#F2F2F7', '#FFFFFF'],
  colorSwatch: '#007AFF',
  isDark: false,
  isUserFavorite: true,
  category: 'light',
  contrastRatio: '17.9:1 (AAA Pass)',
  inputFieldBg: 'bg-white text-slate-900 border-black/10',
  inputFieldPreviewText: 'Daylight: black text on frosted white',

  bgGradient: 'wallpaper-daylight',
  pageBackground: '#F2F2F7',

  bannerGradient: `${L.mid} border ${L.border}`,
  bannerBorder: L.border,
  bannerGlow: 'shadow-[0_8px_24px_rgba(0,0,0,0.06)]',

  headerBg: `${L.mid} border-b ${L.border}`,
  headerBorder: L.border,
  headerLogoBg: 'bg-[#007AFF]',
  headerLogoText: 'text-white',
  headerTextColor: L.textPrimary,

  goalBannerBg: L.mid,
  goalBannerBorder: L.border,
  goalBannerIconBg: 'bg-[#007AFF]/12',
  goalBannerProgress: 'bg-gradient-to-r from-[#007AFF] to-[#5AC8FA]',
  goalBadge: 'bg-[#007AFF]/12 text-[#0062CC] border border-[#007AFF]/20',
  goalTitleColor: L.textPrimary,

  kidCardBg: L.thin,
  kidCardBorder: L.border,
  kidCardHover: 'hover:bg-white/[0.75]',
  kidCardStatsBg: 'bg-black/[0.04]',
  kidCardNameColor: 'text-black/90',
  kidCardSubtextColor: 'text-black/55',
  kidCardProgress: 'bg-gradient-to-r from-[#007AFF] to-[#5AC8FA]',
  kidCardAvatarBorder: 'border-white',

  kioskBg: 'wallpaper-daylight min-h-screen text-black',
  kioskHeaderBg: L.mid,
  kioskHeaderBorder: L.border,
  kioskHeaderLogoBg: 'bg-[#007AFF]',
  kioskHeaderLogoText: 'text-white',
  kioskHeaderTextColor: L.textPrimary,
  kioskClockBg: L.thin,
  kioskClockText: 'text-black/85',
  kioskMvpSpotlightBg: 'bg-[#FF9500]/12',
  kioskMvpSpotlightBorder: 'border-[#FF9500]/30',
  kioskCardBg: L.thin,
  kioskCardBorder: L.border,
  kioskCardMvpBorder: 'border-[#FF9500]/50',
  kioskCardMvpBg: 'bg-[#FF9500]/8',
  kioskCardItemBg: 'bg-black/[0.03]',
  kioskCardItemDone: 'bg-[#34C759]/12',
  kioskSummaryCardBg: L.thin,
  kioskSummaryCardBorder: L.border,
  kioskFooterBorder: L.border,
  kioskFooterSlateBg: L.thin,
  kioskFooterSlateBorder: L.border,
  kioskFooterPillBg: 'bg-[#007AFF]/12 border border-[#007AFF]/20',
  kioskFooterPillText: 'text-[#0062CC] font-semibold',
  kioskFooterPillSecondaryBg: 'bg-black/[0.04] border border-black/[0.08]',
  kioskFooterPillSecondaryText: 'text-black/65 font-semibold',

  primaryBtn: 'bg-[#007AFF] hover:bg-[#007AFF]/85 text-white font-semibold',
  secondaryBtn: 'bg-black/[0.05] hover:bg-black/[0.08] text-[#007AFF] border border-black/[0.06] font-semibold',
  accentPill: 'bg-[#007AFF]/12 text-[#0062CC] border border-[#007AFF]/20',
  progressGradient: 'from-[#007AFF] via-[#5AC8FA] to-[#34C759]',
};

/** All iOS themes, keyed by id — spread into APP_THEMES. */
export const IOS_THEMES = {
  'ios-aurora': iosAuroraTheme,
  'ios-daylight': iosDaylightTheme,
  'ios-dusk': iosDuskTheme,
  'ios-ocean': iosOceanTheme,
  'ios-forest': iosForestTheme,
  'ios-midnight': iosMidnightTheme,
} as const;
