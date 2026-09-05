export type AppThemeId =
  | 'coastal-horizon'
  | 'nordic-forest'
  | 'midnight-charcoal'
  | 'soft-sky'
  | 'warm-sand'
  | 'classic-sunshine'
  | 'philadelphia-eagles'
  | 'ohio-state-buckeyes';

export interface AppThemeConfig {
  id: AppThemeId;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  swatches: string[]; // Palette hex colors from uploaded palettes
  colorSwatch: string;
  isDark: boolean;

  // Canvas
  bgGradient: string;
  pageBackground: string;

  // Animated Hero Banner
  bannerGradient: string;
  bannerBorder: string;
  bannerGlow: string;

  // Header / Navbar
  headerBg: string;
  headerBorder: string;
  headerLogoBg: string;
  headerLogoText: string;
  headerTextColor: string;

  // Family Goal Banner
  goalBannerBg: string;
  goalBannerBorder: string;
  goalBannerIconBg: string;
  goalBannerProgress: string;
  goalBadge: string;
  goalTitleColor: string;

  // Kid Cards
  kidCardBg: string;
  kidCardBorder: string;
  kidCardHover: string;
  kidCardStatsBg: string;
  kidCardNameColor: string;
  kidCardSubtextColor: string;
  kidCardProgress: string;
  kidCardAvatarBorder: string;

  // Kiosk Specific Theme Tokens
  kioskBg: string;
  kioskHeaderBg: string;
  kioskHeaderBorder: string;
  kioskHeaderLogoBg: string;
  kioskHeaderLogoText: string;
  kioskHeaderTextColor: string;
  kioskClockBg: string;
  kioskClockText: string;
  kioskMvpSpotlightBg: string;
  kioskMvpSpotlightBorder: string;
  kioskCardBg: string;
  kioskCardBorder: string;
  kioskCardMvpBorder: string;
  kioskCardMvpBg: string;
  kioskCardItemBg: string;
  kioskCardItemDone: string;
  kioskSummaryCardBg: string;
  kioskSummaryCardBorder: string;
  kioskFooterBorder: string;
  kioskFooterSlateBg: string;
  kioskFooterSlateBorder: string;
  kioskFooterPillBg: string;
  kioskFooterPillText: string;
  kioskFooterPillSecondaryBg: string;
  kioskFooterPillSecondaryText: string;

  // Buttons & Accents
  primaryBtn: string;
  secondaryBtn: string;
  accentPill: string;
  progressGradient: string;
}

export const APP_THEMES: Record<AppThemeId, AppThemeConfig> = {
  // 🌊 PALETTE 1 (Uploaded Image 1): Ocean Beach Coastal (#579FB6, #77B7D0, #B3E0F4, #FCFDFE, #EED3CE, #E2BAB1)
  'coastal-horizon': {
    id: 'coastal-horizon',
    name: 'Coastal Horizon',
    subtitle: 'Ocean Blue & Sandy Coral',
    description: 'Crisp azure sea, aqua mist, and warm coral sand from your palette.',
    icon: '🌊',
    swatches: ['#579FB6', '#77B7D0', '#B3E0F4', '#FCFDFE', '#EED3CE', '#E2BAB1'],
    colorSwatch: '#579FB6',
    isDark: false,
    bgGradient: 'bg-gradient-to-br from-[#FCFDFE] via-[#B3E0F4]/35 to-[#EED3CE]/30',
    pageBackground: '#FCFDFE',

    // Animated Hero Banner
    bannerGradient: 'bg-gradient-to-r from-[#579FB6] via-[#77B7D0] to-[#E2BAB1]',
    bannerBorder: 'border-[#77B7D0]',
    bannerGlow: 'shadow-[0_10px_30px_rgba(87,159,182,0.35)]',

    // Header / Navbar
    headerBg: 'bg-gradient-to-r from-white/95 via-[#B3E0F4]/30 to-white/95 backdrop-blur-md',
    headerBorder: 'border-[#77B7D0]/50',
    headerLogoBg: 'bg-[#579FB6] shadow-[#579FB6]/30',
    headerLogoText: 'text-white',
    headerTextColor: 'text-[#143B47]',

    // Family Goal Banner
    goalBannerBg: 'bg-gradient-to-r from-[#B3E0F4]/70 via-[#77B7D0]/40 to-[#EED3CE]/60 backdrop-blur-md',
    goalBannerBorder: 'border-[#77B7D0]/70',
    goalBannerIconBg: 'bg-[#B3E0F4] text-[#143B47] border border-[#77B7D0]',
    goalBannerProgress: 'bg-gradient-to-r from-[#77B7D0] via-[#579FB6] to-[#E2BAB1]',
    goalBadge: 'bg-[#EED3CE] text-[#422923] border border-[#E2BAB1]',
    goalTitleColor: 'text-[#143B47]',

    // Kid Cards
    kidCardBg: 'bg-gradient-to-b from-[#FCFDFE] via-[#B3E0F4]/25 to-[#EED3CE]/30 backdrop-blur-md',
    kidCardBorder: 'border-[#77B7D0]/50',
    kidCardHover: 'hover:border-[#579FB6] hover:shadow-[0_16px_36px_rgba(87,159,182,0.25)]',
    kidCardStatsBg: 'bg-[#B3E0F4]/25 border border-[#77B7D0]/40',
    kidCardNameColor: 'text-[#143B47]',
    kidCardSubtextColor: 'text-[#3D6675]',
    kidCardProgress: 'bg-gradient-to-r from-[#77B7D0] via-[#579FB6] to-[#E2BAB1]',
    kidCardAvatarBorder: 'border-[#77B7D0]/80',

    // Kiosk Theme Tokens
    kioskBg: 'bg-gradient-to-br from-[#0C222B] via-[#143B47] to-[#08171E] text-white',
    kioskHeaderBg: 'bg-[#0C222B]/90 backdrop-blur-md',
    kioskHeaderBorder: 'border-[#579FB6]/40',
    kioskHeaderLogoBg: 'bg-[#579FB6] border border-[#77B7D0]',
    kioskHeaderLogoText: 'text-white',
    kioskHeaderTextColor: 'text-white',
    kioskClockBg: 'bg-[#143B47]/90 border border-[#579FB6]/40 shadow-md',
    kioskClockText: 'text-[#B3E0F4]',
    kioskMvpSpotlightBg: 'bg-gradient-to-r from-[#1A4553]/90 via-[#245D70]/85 to-[#1A4553]/90',
    kioskMvpSpotlightBorder: 'border-[#77B7D0] shadow-[0_10px_30px_rgba(87,159,182,0.35)]',
    kioskCardBg: 'bg-[#143B47]/85 backdrop-blur-md shadow-xl',
    kioskCardBorder: 'border-[#579FB6]/50',
    kioskCardMvpBorder: 'border-[#77B7D0] ring-4 ring-[#77B7D0]/35 shadow-2xl shadow-[#579FB6]/30',
    kioskCardMvpBg: 'bg-gradient-to-b from-[#1E5263]/90 via-[#143B47]/95 to-[#0C222B]/95',
    kioskCardItemBg: 'bg-[#0C222B]/75 border border-[#579FB6]/35 text-white hover:border-[#77B7D0]',
    kioskCardItemDone: 'bg-[#579FB6]/25 border border-[#77B7D0]/50 text-[#B3E0F4]',
    kioskSummaryCardBg: 'bg-[#143B47]/85 backdrop-blur-md',
    kioskSummaryCardBorder: 'border-[#579FB6]/50',
    kioskFooterBorder: 'border-[#579FB6]/40',
    kioskFooterSlateBg: 'bg-[#143B47]/85 backdrop-blur-md hover:bg-[#1A4553] transition-all',
    kioskFooterSlateBorder: 'border-[#579FB6]/40 hover:border-[#77B7D0]',
    kioskFooterPillBg: 'bg-[#579FB6] border border-[#77B7D0]',
    kioskFooterPillText: 'text-white font-extrabold',
    kioskFooterPillSecondaryBg: 'bg-[#EED3CE]/20 border border-[#E2BAB1]/50',
    kioskFooterPillSecondaryText: 'text-[#EED3CE] font-extrabold',

    // Buttons
    primaryBtn: 'bg-[#579FB6] hover:bg-[#46869B] text-white shadow-sm font-bold',
    secondaryBtn: 'bg-[#EED3CE]/70 hover:bg-[#EED3CE] text-[#3D2621] border border-[#E2BAB1] font-bold',
    accentPill: 'bg-[#EED3CE]/90 text-[#422923] border border-[#E2BAB1]',
    progressGradient: 'from-[#77B7D0] via-[#579FB6] to-[#E2BAB1]',
  },

  // 🌲 PALETTE 2 (Uploaded Image 2): Deep Spruce, Pine & Seafoam (#192E26, #2C524C, #6B9E96, #9FA7A4, #E5EDE9)
  'nordic-forest': {
    id: 'nordic-forest',
    name: 'Nordic Forest',
    subtitle: 'Deep Spruce & Eucalyptus Mist',
    description: 'Rich evergreen pine, sage seafoam, and soft morning fog from your palette.',
    icon: '🌲',
    swatches: ['#192E26', '#2C524C', '#6B9E96', '#9FA7A4', '#E5EDE9'],
    colorSwatch: '#6B9E96',
    isDark: false,
    bgGradient: 'bg-gradient-to-br from-[#E5EDE9] via-[#EDF3F0] to-[#9FA7A4]/25',
    pageBackground: '#E5EDE9',

    // Animated Hero Banner
    bannerGradient: 'bg-gradient-to-r from-[#192E26] via-[#2C524C] to-[#6B9E96]',
    bannerBorder: 'border-[#6B9E96]',
    bannerGlow: 'shadow-[0_10px_30px_rgba(44,82,76,0.35)]',

    // Header / Navbar
    headerBg: 'bg-gradient-to-r from-[#E5EDE9]/95 via-[#6B9E96]/20 to-[#E5EDE9]/95 backdrop-blur-md',
    headerBorder: 'border-[#6B9E96]/50',
    headerLogoBg: 'bg-[#2C524C] shadow-[#192E26]/30',
    headerLogoText: 'text-white',
    headerTextColor: 'text-[#12231D]',

    // Family Goal Banner
    goalBannerBg: 'bg-gradient-to-r from-[#6B9E96]/35 via-[#E5EDE9] to-[#6B9E96]/30 backdrop-blur-md',
    goalBannerBorder: 'border-[#6B9E96]/60',
    goalBannerIconBg: 'bg-[#6B9E96]/30 text-[#12231D] border border-[#6B9E96]/60',
    goalBannerProgress: 'bg-gradient-to-r from-[#6B9E96] via-[#2C524C] to-[#192E26]',
    goalBadge: 'bg-[#6B9E96]/30 text-[#12231D] border border-[#6B9E96]/60',
    goalTitleColor: 'text-[#12231D]',

    // Kid Cards
    kidCardBg: 'bg-gradient-to-b from-[#E5EDE9] to-[#9FA7A4]/25 backdrop-blur-md',
    kidCardBorder: 'border-[#6B9E96]/50',
    kidCardHover: 'hover:border-[#2C524C] hover:shadow-[0_16px_36px_rgba(44,82,76,0.25)]',
    kidCardStatsBg: 'bg-[#6B9E96]/20 border border-[#9FA7A4]/50',
    kidCardNameColor: 'text-[#12231D]',
    kidCardSubtextColor: 'text-[#35524B]',
    kidCardProgress: 'bg-gradient-to-r from-[#6B9E96] via-[#2C524C] to-[#192E26]',
    kidCardAvatarBorder: 'border-[#6B9E96]/80',

    // Kiosk Theme Tokens
    kioskBg: 'bg-gradient-to-br from-[#0E1A16] via-[#192E26] to-[#0A1310] text-white',
    kioskHeaderBg: 'bg-[#0E1A16]/90 backdrop-blur-md',
    kioskHeaderBorder: 'border-[#6B9E96]/40',
    kioskHeaderLogoBg: 'bg-[#2C524C] border border-[#6B9E96]',
    kioskHeaderLogoText: 'text-white',
    kioskHeaderTextColor: 'text-white',
    kioskClockBg: 'bg-[#192E26]/90 border border-[#6B9E96]/40 shadow-md',
    kioskClockText: 'text-[#6B9E96]',
    kioskMvpSpotlightBg: 'bg-gradient-to-r from-[#192E26]/90 via-[#2C524C]/85 to-[#192E26]/90',
    kioskMvpSpotlightBorder: 'border-[#6B9E96] shadow-[0_10px_30px_rgba(44,82,76,0.35)]',
    kioskCardBg: 'bg-[#192E26]/85 backdrop-blur-md shadow-xl',
    kioskCardBorder: 'border-[#6B9E96]/50',
    kioskCardMvpBorder: 'border-[#6B9E96] ring-4 ring-[#6B9E96]/35 shadow-2xl shadow-[#2C524C]/30',
    kioskCardMvpBg: 'bg-gradient-to-b from-[#2C524C]/90 via-[#192E26]/95 to-[#0E1A16]/95',
    kioskCardItemBg: 'bg-[#0E1A16]/75 border border-[#6B9E96]/35 text-white hover:border-[#6B9E96]',
    kioskCardItemDone: 'bg-[#2C524C]/35 border border-[#6B9E96]/50 text-[#E5EDE9]',
    kioskSummaryCardBg: 'bg-[#192E26]/85 backdrop-blur-md',
    kioskSummaryCardBorder: 'border-[#6B9E96]/50',
    kioskFooterBorder: 'border-[#6B9E96]/40',
    kioskFooterSlateBg: 'bg-[#192E26]/85 backdrop-blur-md hover:bg-[#233F34] transition-all',
    kioskFooterSlateBorder: 'border-[#6B9E96]/40 hover:border-[#6B9E96]',
    kioskFooterPillBg: 'bg-[#2C524C] border border-[#6B9E96]',
    kioskFooterPillText: 'text-white font-extrabold',
    kioskFooterPillSecondaryBg: 'bg-[#6B9E96]/25 border border-[#6B9E96]/50',
    kioskFooterPillSecondaryText: 'text-[#E5EDE9] font-extrabold',

    // Buttons
    primaryBtn: 'bg-[#2C524C] hover:bg-[#192E26] text-white shadow-sm font-bold',
    secondaryBtn: 'bg-[#E5EDE9] hover:bg-[#9FA7A4]/40 text-[#12231D] border border-[#9FA7A4]/60 font-bold',
    accentPill: 'bg-[#6B9E96]/30 text-[#12231D] border border-[#6B9E96]/60',
    progressGradient: 'from-[#6B9E96] via-[#2C524C] to-[#192E26]',
  },

  // 🌑 PALETTE 3 (Uploaded Image 3): Midnight Charcoal & Espresso (#1E181D, #342A31, #56575C, #6C6C72, #C8C8CA, #23252A)
  'midnight-charcoal': {
    id: 'midnight-charcoal',
    name: 'Midnight Charcoal',
    subtitle: 'Espresso, Slate & Silver',
    description: 'Deep espresso-charcoal & graphite glass with crisp bright typography.',
    icon: '🌑',
    swatches: ['#1E181D', '#342A31', '#56575C', '#6C6C72', '#C8C8CA', '#23252A'],
    colorSwatch: '#56575C',
    isDark: true,
    bgGradient: 'bg-gradient-to-br from-[#1E181D] via-[#2A2329] to-[#161215]',
    pageBackground: '#1E181D',

    // Animated Hero Banner
    bannerGradient: 'bg-gradient-to-r from-[#342A31] via-[#56575C] to-[#23252A]',
    bannerBorder: 'border-[#6C6C72]',
    bannerGlow: 'shadow-[0_10px_30px_rgba(0,0,0,0.6)]',

    // Header / Navbar
    headerBg: 'bg-gradient-to-r from-[#1E181D]/95 via-[#2A2329]/90 to-[#1E181D]/95 backdrop-blur-md',
    headerBorder: 'border-[#56575C]/60',
    headerLogoBg: 'bg-[#56575C] shadow-black/50 border border-[#6C6C72]',
    headerLogoText: 'text-white',
    headerTextColor: 'text-white',

    // Family Goal Banner
    goalBannerBg: 'bg-gradient-to-r from-[#2A2329]/95 via-[#342A31]/95 to-[#23252A]/95 backdrop-blur-md',
    goalBannerBorder: 'border-[#6C6C72]/70',
    goalBannerIconBg: 'bg-[#342A31] text-white border border-[#56575C]',
    goalBannerProgress: 'bg-gradient-to-r from-[#56575C] via-[#6C6C72] to-[#C8C8CA]',
    goalBadge: 'bg-[#342A31] text-[#EDEDEE] border border-[#56575C]',
    goalTitleColor: 'text-white',

    // Kid Cards
    kidCardBg: 'bg-gradient-to-b from-[#2A2329]/90 to-[#1E181D]/90 backdrop-blur-md',
    kidCardBorder: 'border-[#56575C]/70',
    kidCardHover: 'hover:border-[#C8C8CA] hover:shadow-[0_16px_36px_rgba(0,0,0,0.7)]',
    kidCardStatsBg: 'bg-[#1E181D]/90 border border-[#56575C]/60',
    kidCardNameColor: 'text-white',
    kidCardSubtextColor: 'text-[#C8C8CA]',
    kidCardProgress: 'bg-gradient-to-r from-[#56575C] via-[#6C6C72] to-[#C8C8CA]',
    kidCardAvatarBorder: 'border-[#6C6C72]',

    // Kiosk Theme Tokens
    kioskBg: 'bg-gradient-to-br from-[#120E11] via-[#1E181D] to-[#0D0A0C] text-white',
    kioskHeaderBg: 'bg-[#120E11]/90 backdrop-blur-md',
    kioskHeaderBorder: 'border-[#56575C]/50',
    kioskHeaderLogoBg: 'bg-[#342A31] border border-[#6C6C72]',
    kioskHeaderLogoText: 'text-white',
    kioskHeaderTextColor: 'text-white',
    kioskClockBg: 'bg-[#1E181D]/90 border border-[#56575C]/50 shadow-md',
    kioskClockText: 'text-[#C8C8CA]',
    kioskMvpSpotlightBg: 'bg-gradient-to-r from-[#2A2329]/90 via-[#342A31]/90 to-[#23252A]/90',
    kioskMvpSpotlightBorder: 'border-[#6C6C72] shadow-[0_10px_30px_rgba(0,0,0,0.7)]',
    kioskCardBg: 'bg-[#1E181D]/85 backdrop-blur-md shadow-xl',
    kioskCardBorder: 'border-[#56575C]/60',
    kioskCardMvpBorder: 'border-[#C8C8CA] ring-4 ring-[#C8C8CA]/30 shadow-2xl shadow-black/60',
    kioskCardMvpBg: 'bg-gradient-to-b from-[#342A31]/90 via-[#2A2329]/95 to-[#120E11]/95',
    kioskCardItemBg: 'bg-[#120E11]/80 border border-[#56575C]/45 text-white hover:border-[#6C6C72]',
    kioskCardItemDone: 'bg-[#342A31]/60 border border-[#56575C]/70 text-[#C8C8CA]',
    kioskSummaryCardBg: 'bg-[#1E181D]/85 backdrop-blur-md',
    kioskSummaryCardBorder: 'border-[#56575C]/60',
    kioskFooterBorder: 'border-[#56575C]/50',
    kioskFooterSlateBg: 'bg-[#1E181D]/90 backdrop-blur-md hover:bg-[#2A2329] transition-all',
    kioskFooterSlateBorder: 'border-[#56575C]/50 hover:border-[#6C6C72]',
    kioskFooterPillBg: 'bg-[#342A31] border border-[#56575C]',
    kioskFooterPillText: 'text-[#EDEDEE] font-extrabold',
    kioskFooterPillSecondaryBg: 'bg-[#56575C]/35 border border-[#6C6C72]',
    kioskFooterPillSecondaryText: 'text-[#EDEDEE] font-extrabold',

    // Buttons
    primaryBtn: 'bg-[#56575C] hover:bg-[#6C6C72] text-white shadow-sm border border-[#6C6C72] font-bold',
    secondaryBtn: 'bg-[#342A31] hover:bg-[#443841] text-[#EDEDEE] border border-[#56575C] font-bold',
    accentPill: 'bg-[#342A31] text-[#EDEDEE] border border-[#56575C]',
    progressGradient: 'from-[#56575C] via-[#6C6C72] to-[#C8C8CA]',
  },

  // 🌤️ Soft Sky Calm
  'soft-sky': {
    id: 'soft-sky',
    name: 'Soft Sky (Calm)',
    subtitle: 'Cool Blue & Anti-Glare Slate',
    description: 'Gentle cool blue and slate tones tailored to minimize glare.',
    icon: '🌤️',
    swatches: ['#0284c7', '#38bdf8', '#bae6fd', '#f0f9ff', '#64748b'],
    colorSwatch: '#38bdf8',
    isDark: false,
    bgGradient: 'bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-50/60',
    pageBackground: '#f1f5f9',

    // Animated Hero Banner
    bannerGradient: 'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600',
    bannerBorder: 'border-sky-400',
    bannerGlow: 'shadow-[0_10px_30px_rgba(2,132,199,0.35)]',

    // Header / Navbar
    headerBg: 'bg-gradient-to-r from-white/95 via-sky-100/40 to-white/95 backdrop-blur-md',
    headerBorder: 'border-sky-200',
    headerLogoBg: 'bg-sky-500 shadow-sky-500/30',
    headerLogoText: 'text-white',
    headerTextColor: 'text-slate-900',

    // Family Goal Banner
    goalBannerBg: 'bg-gradient-to-r from-sky-100/90 via-blue-100/75 to-indigo-100/80 backdrop-blur-md',
    goalBannerBorder: 'border-sky-300',
    goalBannerIconBg: 'bg-sky-100 text-sky-800 border border-sky-200',
    goalBannerProgress: 'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600',
    goalBadge: 'bg-sky-100 text-sky-900 border border-sky-200',
    goalTitleColor: 'text-slate-900',

    // Kid Cards
    kidCardBg: 'bg-gradient-to-b from-sky-50 via-sky-50/70 to-indigo-50/60 backdrop-blur-md',
    kidCardBorder: 'border-sky-200',
    kidCardHover: 'hover:border-sky-400 hover:shadow-[0_16px_36px_rgba(2,132,199,0.2)]',
    kidCardStatsBg: 'bg-sky-100/70 border border-sky-200',
    kidCardNameColor: 'text-slate-900',
    kidCardSubtextColor: 'text-slate-500',
    kidCardProgress: 'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600',
    kidCardAvatarBorder: 'border-sky-200',

    // Kiosk Theme Tokens
    kioskBg: 'bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A0F1D] text-white',
    kioskHeaderBg: 'bg-[#0F172A]/90 backdrop-blur-md',
    kioskHeaderBorder: 'border-sky-600/40',
    kioskHeaderLogoBg: 'bg-sky-600 border border-sky-400',
    kioskHeaderLogoText: 'text-white',
    kioskHeaderTextColor: 'text-white',
    kioskClockBg: 'bg-slate-900/85 border border-sky-700/40 shadow-md',
    kioskClockText: 'text-sky-300',
    kioskMvpSpotlightBg: 'bg-gradient-to-r from-sky-950/90 via-blue-950/85 to-indigo-950/90',
    kioskMvpSpotlightBorder: 'border-sky-400 shadow-[0_10px_30px_rgba(2,132,199,0.35)]',
    kioskCardBg: 'bg-slate-900/85 backdrop-blur-md shadow-xl',
    kioskCardBorder: 'border-sky-700/40',
    kioskCardMvpBorder: 'border-sky-400 ring-4 ring-sky-400/35 shadow-2xl shadow-sky-500/25',
    kioskCardMvpBg: 'bg-gradient-to-b from-sky-950/80 via-slate-900/95 to-slate-950/95',
    kioskCardItemBg: 'bg-slate-950/75 border border-slate-700/70 text-white hover:border-sky-500',
    kioskCardItemDone: 'bg-sky-950/45 border border-sky-800/80 text-sky-200',
    kioskSummaryCardBg: 'bg-slate-900/85 backdrop-blur-md',
    kioskSummaryCardBorder: 'border-sky-700/40',
    kioskFooterBorder: 'border-sky-800/40',
    kioskFooterSlateBg: 'bg-slate-900/90 backdrop-blur-md hover:bg-slate-850 transition-all',
    kioskFooterSlateBorder: 'border-sky-800/50 hover:border-sky-500',
    kioskFooterPillBg: 'bg-sky-600 border border-sky-400',
    kioskFooterPillText: 'text-white font-extrabold',
    kioskFooterPillSecondaryBg: 'bg-blue-900/60 border border-blue-700/70',
    kioskFooterPillSecondaryText: 'text-sky-200 font-extrabold',

    // Buttons
    primaryBtn: 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm font-bold',
    secondaryBtn: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold',
    accentPill: 'bg-sky-100 text-sky-900 border border-sky-200',
    progressGradient: 'from-sky-400 via-blue-500 to-indigo-600',
  },

  // 🌾 Warm Linen
  'warm-sand': {
    id: 'warm-sand',
    name: 'Warm Linen',
    subtitle: 'Oatmeal & Terracotta Sand',
    description: 'Cozy oatmeal and warm terracotta sand tones with soft contrast.',
    icon: '🌾',
    swatches: ['#92400e', '#d97706', '#fde68a', '#fafaf9', '#78716c'],
    colorSwatch: '#d97706',
    isDark: false,
    bgGradient: 'bg-gradient-to-br from-stone-100 via-amber-50/70 to-orange-50/50',
    pageBackground: '#f5f5f4',

    // Animated Hero Banner
    bannerGradient: 'bg-gradient-to-r from-amber-700 via-orange-600 to-amber-600',
    bannerBorder: 'border-amber-400',
    bannerGlow: 'shadow-[0_10px_30px_rgba(217,119,6,0.35)]',

    // Header / Navbar
    headerBg: 'bg-gradient-to-r from-[#f5f5f4]/95 via-amber-100/40 to-[#f5f5f4]/95 backdrop-blur-md',
    headerBorder: 'border-stone-300',
    headerLogoBg: 'bg-amber-700 shadow-amber-700/30',
    headerLogoText: 'text-white',
    headerTextColor: 'text-stone-900',

    // Family Goal Banner
    goalBannerBg: 'bg-gradient-to-r from-amber-100/90 via-orange-100/75 to-amber-100/80 backdrop-blur-md',
    goalBannerBorder: 'border-amber-300',
    goalBannerIconBg: 'bg-amber-100 text-amber-900 border border-amber-200',
    goalBannerProgress: 'bg-gradient-to-r from-amber-400 via-amber-600 to-orange-600',
    goalBadge: 'bg-amber-100 text-amber-900 border border-amber-200',
    goalTitleColor: 'text-stone-900',

    // Kid Cards
    kidCardBg: 'bg-gradient-to-b from-stone-100 via-stone-100/80 to-amber-50/70 backdrop-blur-md',
    kidCardBorder: 'border-stone-300',
    kidCardHover: 'hover:border-amber-500 hover:shadow-[0_16px_36px_rgba(217,119,6,0.2)]',
    kidCardStatsBg: 'bg-amber-100/60 border border-amber-200',
    kidCardNameColor: 'text-stone-900',
    kidCardSubtextColor: 'text-stone-500',
    kidCardProgress: 'bg-gradient-to-r from-amber-400 via-amber-600 to-orange-600',
    kidCardAvatarBorder: 'border-amber-200',

    // Kiosk Theme Tokens
    kioskBg: 'bg-gradient-to-br from-[#1C1917] via-[#292524] to-[#141210] text-white',
    kioskHeaderBg: 'bg-[#1C1917]/90 backdrop-blur-md',
    kioskHeaderBorder: 'border-amber-700/50',
    kioskHeaderLogoBg: 'bg-amber-700 border border-amber-500',
    kioskHeaderLogoText: 'text-white',
    kioskHeaderTextColor: 'text-white',
    kioskClockBg: 'bg-[#292524]/85 border border-amber-700/40 shadow-md',
    kioskClockText: 'text-amber-300',
    kioskMvpSpotlightBg: 'bg-gradient-to-r from-amber-950/90 via-stone-900/85 to-amber-950/90',
    kioskMvpSpotlightBorder: 'border-amber-500 shadow-[0_10px_30px_rgba(217,119,6,0.35)]',
    kioskCardBg: 'bg-[#292524]/85 backdrop-blur-md shadow-xl',
    kioskCardBorder: 'border-amber-700/40',
    kioskCardMvpBorder: 'border-amber-400 ring-4 ring-amber-400/35 shadow-2xl shadow-amber-600/25',
    kioskCardMvpBg: 'bg-gradient-to-b from-amber-950/80 via-stone-900/95 to-stone-950/95',
    kioskCardItemBg: 'bg-[#1C1917]/80 border border-stone-700/70 text-white hover:border-amber-500',
    kioskCardItemDone: 'bg-amber-950/45 border border-amber-800/80 text-amber-200',
    kioskSummaryCardBg: 'bg-[#292524]/85 backdrop-blur-md',
    kioskSummaryCardBorder: 'border-amber-700/40',
    kioskFooterBorder: 'border-amber-800/40',
    kioskFooterSlateBg: 'bg-[#292524]/90 backdrop-blur-md hover:bg-[#383331] transition-all',
    kioskFooterSlateBorder: 'border-amber-800/50 hover:border-amber-500',
    kioskFooterPillBg: 'bg-amber-700 border border-amber-500',
    kioskFooterPillText: 'text-white font-extrabold',
    kioskFooterPillSecondaryBg: 'bg-stone-800 border border-stone-600',
    kioskFooterPillSecondaryText: 'text-amber-200 font-extrabold',

    // Buttons
    primaryBtn: 'bg-amber-700 hover:bg-amber-800 text-white shadow-sm font-bold',
    secondaryBtn: 'bg-stone-200/80 hover:bg-stone-300 text-stone-800 border border-stone-300 font-bold',
    accentPill: 'bg-amber-100 text-amber-900 border border-amber-200',
    progressGradient: 'from-amber-400 via-amber-600 to-orange-600',
  },

  // ☀️ Classic Sunshine
  'classic-sunshine': {
    id: 'classic-sunshine',
    name: 'Classic Sunshine',
    subtitle: 'Original Cheerful Gold',
    description: 'The original vibrant high-energy gold & deep indigo palette.',
    icon: '☀️',
    swatches: ['#312e81', '#ca8a04', '#facc15', '#fef9c3', '#fefce8'],
    colorSwatch: '#eab308',
    isDark: false,
    bgGradient: 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50',
    pageBackground: '#fefce8',

    // Animated Hero Banner
    bannerGradient: 'bg-gradient-to-r from-indigo-900 via-indigo-800 to-amber-500',
    bannerBorder: 'border-yellow-400',
    bannerGlow: 'shadow-[0_10px_30px_rgba(49,46,129,0.35)]',

    // Header / Navbar
    headerBg: 'bg-indigo-900 backdrop-blur-md',
    headerBorder: 'border-yellow-400',
    headerLogoBg: 'bg-yellow-400 shadow-yellow-400/30',
    headerLogoText: 'text-indigo-950 font-black',
    headerTextColor: 'text-white',

    // Family Goal Banner
    goalBannerBg: 'bg-gradient-to-r from-yellow-100 via-amber-100 to-yellow-200/80 backdrop-blur-md',
    goalBannerBorder: 'border-yellow-400',
    goalBannerIconBg: 'bg-yellow-200 text-yellow-950 border border-yellow-300',
    goalBannerProgress: 'bg-gradient-to-r from-yellow-400 via-orange-400 to-indigo-600',
    goalBadge: 'bg-yellow-200 text-slate-900 border border-yellow-300',
    goalTitleColor: 'text-slate-900',

    // Kid Cards
    kidCardBg: 'bg-gradient-to-b from-yellow-50 via-amber-50/60 to-yellow-100/50 backdrop-blur-md',
    kidCardBorder: 'border-yellow-300',
    kidCardHover: 'hover:border-yellow-400 hover:shadow-[0_16px_36px_rgba(234,179,8,0.25)]',
    kidCardStatsBg: 'bg-yellow-100/70 border border-yellow-300',
    kidCardNameColor: 'text-slate-900',
    kidCardSubtextColor: 'text-slate-500',
    kidCardProgress: 'bg-gradient-to-r from-yellow-400 via-orange-400 to-indigo-600',
    kidCardAvatarBorder: 'border-yellow-300',

    // Kiosk Theme Tokens
    kioskBg: 'bg-gradient-to-br from-[#0F0D24] via-[#1E1B4B] to-[#0A091A] text-white',
    kioskHeaderBg: 'bg-indigo-950/90 backdrop-blur-md',
    kioskHeaderBorder: 'border-yellow-400/50',
    kioskHeaderLogoBg: 'bg-yellow-400 border border-yellow-300',
    kioskHeaderLogoText: 'text-indigo-950 font-black',
    kioskHeaderTextColor: 'text-white',
    kioskClockBg: 'bg-indigo-900/85 border border-yellow-400/40 shadow-md',
    kioskClockText: 'text-yellow-400',
    kioskMvpSpotlightBg: 'bg-gradient-to-r from-indigo-950/90 via-indigo-900/85 to-amber-950/90',
    kioskMvpSpotlightBorder: 'border-yellow-400 shadow-[0_10px_30px_rgba(234,179,8,0.35)]',
    kioskCardBg: 'bg-indigo-950/85 backdrop-blur-md shadow-xl',
    kioskCardBorder: 'border-indigo-700/60',
    kioskCardMvpBorder: 'border-yellow-400 ring-4 ring-yellow-400/35 shadow-2xl shadow-yellow-500/25',
    kioskCardMvpBg: 'bg-gradient-to-b from-indigo-900/90 via-indigo-950/95 to-slate-950/95',
    kioskCardItemBg: 'bg-indigo-900/60 border border-indigo-700/70 text-white hover:border-yellow-400',
    kioskCardItemDone: 'bg-emerald-950/45 border border-emerald-700/80 text-emerald-200',
    kioskSummaryCardBg: 'bg-indigo-950/85 backdrop-blur-md',
    kioskSummaryCardBorder: 'border-indigo-700/60',
    kioskFooterBorder: 'border-indigo-800/60',
    kioskFooterSlateBg: 'bg-indigo-950/90 backdrop-blur-md hover:bg-indigo-900 transition-all',
    kioskFooterSlateBorder: 'border-indigo-800/60 hover:border-yellow-400',
    kioskFooterPillBg: 'bg-yellow-400 border border-yellow-300',
    kioskFooterPillText: 'text-indigo-950 font-black',
    kioskFooterPillSecondaryBg: 'bg-indigo-900 border border-indigo-700',
    kioskFooterPillSecondaryText: 'text-yellow-300 font-extrabold',

    // Buttons
    primaryBtn: 'bg-indigo-900 hover:bg-indigo-800 text-yellow-300 shadow-sm font-black',
    secondaryBtn: 'bg-yellow-200 hover:bg-yellow-300 text-slate-900 border border-yellow-300 font-bold',
    accentPill: 'bg-yellow-200 text-slate-900 border border-yellow-300',
    progressGradient: 'from-yellow-400 via-orange-400 to-indigo-600',
  },

  // 🦅 PHILADELPHIA EAGLES: Midnight Green (#004C54), Metallic Silver (#A5ACAF), Charcoal Black (#0B1315), Crisp White
  'philadelphia-eagles': {
    id: 'philadelphia-eagles',
    name: 'Philadelphia Eagles',
    subtitle: 'Midnight Green & Metallic Silver',
    description: 'Iconic Philadelphia Eagles midnight green, silver wings, and crisp charcoal tones.',
    icon: '🦅',
    swatches: ['#004C54', '#002C31', '#A5ACAF', '#48C07A', '#111827', '#FFFFFF'],
    colorSwatch: '#004C54',
    isDark: true,
    bgGradient: 'bg-gradient-to-br from-[#0B1516] via-[#002C31] to-[#040C0E]',
    pageBackground: '#0B1516',

    // Animated Hero Banner
    bannerGradient: 'bg-gradient-to-r from-[#004C54] via-[#00707B] to-[#A5ACAF]',
    bannerBorder: 'border-[#48C07A]',
    bannerGlow: 'shadow-[0_10px_30px_rgba(0,76,84,0.55)]',

    // Header / Navbar
    headerBg: 'bg-gradient-to-r from-[#0B1516]/95 via-[#002C31]/90 to-[#0B1516]/95 backdrop-blur-md',
    headerBorder: 'border-[#004C54]/70',
    headerLogoBg: 'bg-[#004C54] shadow-[#004C54]/50 border border-[#48C07A]/60',
    headerLogoText: 'text-white font-black',
    headerTextColor: 'text-white',

    // Family Goal Banner
    goalBannerBg: 'bg-gradient-to-r from-[#002C31]/95 via-[#004C54]/85 to-[#0B1516]/95 backdrop-blur-md',
    goalBannerBorder: 'border-[#48C07A]/60',
    goalBannerIconBg: 'bg-[#004C54] text-white border border-[#48C07A]/60',
    goalBannerProgress: 'bg-gradient-to-r from-[#004C54] via-[#48C07A] to-[#A5ACAF]',
    goalBadge: 'bg-[#004C54] text-[#A5ACAF] border border-[#48C07A]/50',
    goalTitleColor: 'text-white',

    // Kid Cards
    kidCardBg: 'bg-gradient-to-b from-[#002C31]/90 to-[#0B1516]/90 backdrop-blur-md',
    kidCardBorder: 'border-[#004C54]/70',
    kidCardHover: 'hover:border-[#48C07A] hover:shadow-[0_16px_36px_rgba(0,76,84,0.6)]',
    kidCardStatsBg: 'bg-[#041012]/90 border border-[#004C54]/60',
    kidCardNameColor: 'text-white',
    kidCardSubtextColor: 'text-[#A5ACAF]',
    kidCardProgress: 'bg-gradient-to-r from-[#004C54] via-[#48C07A] to-[#A5ACAF]',
    kidCardAvatarBorder: 'border-[#48C07A]/70',

    // Kiosk Theme Tokens
    kioskBg: 'bg-gradient-to-br from-[#040C0E] via-[#002C31] to-[#0B1516] text-white',
    kioskHeaderBg: 'bg-[#040C0E]/90 backdrop-blur-md',
    kioskHeaderBorder: 'border-[#004C54]/60',
    kioskHeaderLogoBg: 'bg-[#004C54] border border-[#48C07A]/70',
    kioskHeaderLogoText: 'text-white font-black',
    kioskHeaderTextColor: 'text-white',
    kioskClockBg: 'bg-[#002C31]/90 border border-[#004C54]/60 shadow-md',
    kioskClockText: 'text-[#48C07A]',
    kioskMvpSpotlightBg: 'bg-gradient-to-r from-[#002C31]/95 via-[#004C54]/90 to-[#0B1516]/95',
    kioskMvpSpotlightBorder: 'border-[#48C07A] shadow-[0_10px_30px_rgba(0,76,84,0.6)]',
    kioskCardBg: 'bg-[#002C31]/85 backdrop-blur-md shadow-xl',
    kioskCardBorder: 'border-[#004C54]/65',
    kioskCardMvpBorder: 'border-[#48C07A] ring-4 ring-[#48C07A]/35 shadow-2xl shadow-[#004C54]/60',
    kioskCardMvpBg: 'bg-gradient-to-b from-[#004C54]/90 via-[#002C31]/95 to-[#040C0E]/95',
    kioskCardItemBg: 'bg-[#040C0E]/80 border border-[#004C54]/50 text-white hover:border-[#48C07A]',
    kioskCardItemDone: 'bg-[#004C54]/50 border border-[#48C07A]/70 text-[#A5ACAF]',
    kioskSummaryCardBg: 'bg-[#002C31]/85 backdrop-blur-md',
    kioskSummaryCardBorder: 'border-[#004C54]/60',
    kioskFooterBorder: 'border-[#004C54]/50',
    kioskFooterSlateBg: 'bg-[#002C31]/85 backdrop-blur-md hover:bg-[#004C54]/70 transition-all',
    kioskFooterSlateBorder: 'border-[#004C54]/50 hover:border-[#48C07A]',
    kioskFooterPillBg: 'bg-[#004C54] border border-[#48C07A]/70',
    kioskFooterPillText: 'text-white font-extrabold',
    kioskFooterPillSecondaryBg: 'bg-[#040C0E]/80 border border-[#A5ACAF]/40',
    kioskFooterPillSecondaryText: 'text-[#A5ACAF] font-extrabold',

    // Buttons
    primaryBtn: 'bg-[#004C54] hover:bg-[#00383E] text-white shadow-sm font-black border border-[#48C07A]/50',
    secondaryBtn: 'bg-[#A5ACAF]/20 hover:bg-[#A5ACAF]/35 text-white border border-[#A5ACAF]/50 font-bold',
    accentPill: 'bg-[#004C54] text-[#A5ACAF] border border-[#48C07A]/50',
    progressGradient: 'from-[#004C54] via-[#48C07A] to-[#A5ACAF]',
  },

  // 🌰 OHIO STATE BUCKEYES: Scarlet (#BB0000), Buckeye Gray (#A7A9AC), Stadium Silver (#D0D0CE), Black (#18181B)
  'ohio-state-buckeyes': {
    id: 'ohio-state-buckeyes',
    name: 'Ohio State Buckeyes',
    subtitle: 'Scarlet, Gray & Stadium Silver',
    description: 'Legendary Ohio State scarlet red, silver-gray stripes, and stadium charcoal.',
    icon: '🌰',
    swatches: ['#BB0000', '#800000', '#A7A9AC', '#D0D0CE', '#18181B', '#FFFFFF'],
    colorSwatch: '#BB0000',
    isDark: true,
    bgGradient: 'bg-gradient-to-br from-[#18181B] via-[#2A1518] to-[#121214]',
    pageBackground: '#18181B',

    // Animated Hero Banner
    bannerGradient: 'bg-gradient-to-r from-[#BB0000] via-[#800000] to-[#555555]',
    bannerBorder: 'border-[#BB0000]',
    bannerGlow: 'shadow-[0_10px_30px_rgba(187,0,0,0.5)]',

    // Header / Navbar
    headerBg: 'bg-gradient-to-r from-[#18181B]/95 via-[#2A1518]/90 to-[#18181B]/95 backdrop-blur-md',
    headerBorder: 'border-[#BB0000]/60',
    headerLogoBg: 'bg-[#BB0000] shadow-[#BB0000]/50 border border-[#D0D0CE]/60',
    headerLogoText: 'text-white font-black',
    headerTextColor: 'text-white',

    // Family Goal Banner
    goalBannerBg: 'bg-gradient-to-r from-[#2A1518]/95 via-[#BB0000]/80 to-[#18181B]/95 backdrop-blur-md',
    goalBannerBorder: 'border-[#BB0000]/60',
    goalBannerIconBg: 'bg-[#BB0000] text-white border border-[#D0D0CE]/60',
    goalBannerProgress: 'bg-gradient-to-r from-[#BB0000] via-[#DC2626] to-[#D0D0CE]',
    goalBadge: 'bg-[#BB0000] text-[#D0D0CE] border border-[#A7A9AC]/50',
    goalTitleColor: 'text-white',

    // Kid Cards
    kidCardBg: 'bg-gradient-to-b from-[#2A1518]/90 to-[#18181B]/90 backdrop-blur-md',
    kidCardBorder: 'border-[#BB0000]/60',
    kidCardHover: 'hover:border-[#DC2626] hover:shadow-[0_16px_36px_rgba(187,0,0,0.55)]',
    kidCardStatsBg: 'bg-[#111113]/90 border border-[#BB0000]/50',
    kidCardNameColor: 'text-white',
    kidCardSubtextColor: 'text-[#D0D0CE]',
    kidCardProgress: 'bg-gradient-to-r from-[#BB0000] via-[#DC2626] to-[#D0D0CE]',
    kidCardAvatarBorder: 'border-[#BB0000]/70',

    // Kiosk Theme Tokens
    kioskBg: 'bg-gradient-to-br from-[#121214] via-[#2A1518] to-[#18181B] text-white',
    kioskHeaderBg: 'bg-[#121214]/90 backdrop-blur-md',
    kioskHeaderBorder: 'border-[#BB0000]/50',
    kioskHeaderLogoBg: 'bg-[#BB0000] border border-[#D0D0CE]/60',
    kioskHeaderLogoText: 'text-white font-black',
    kioskHeaderTextColor: 'text-white',
    kioskClockBg: 'bg-[#2A1518]/90 border border-[#BB0000]/50 shadow-md',
    kioskClockText: 'text-[#EF4444]',
    kioskMvpSpotlightBg: 'bg-gradient-to-r from-[#2A1518]/95 via-[#800000]/90 to-[#18181B]/95',
    kioskMvpSpotlightBorder: 'border-[#BB0000] shadow-[0_10px_30px_rgba(187,0,0,0.55)]',
    kioskCardBg: 'bg-[#2A1518]/85 backdrop-blur-md shadow-xl',
    kioskCardBorder: 'border-[#BB0000]/60',
    kioskCardMvpBorder: 'border-[#EF4444] ring-4 ring-[#EF4444]/35 shadow-2xl shadow-[#BB0000]/50',
    kioskCardMvpBg: 'bg-gradient-to-b from-[#BB0000]/90 via-[#2A1518]/95 to-[#121214]/95',
    kioskCardItemBg: 'bg-[#121214]/80 border border-[#BB0000]/40 text-white hover:border-[#DC2626]',
    kioskCardItemDone: 'bg-[#800000]/50 border border-[#BB0000]/70 text-[#D0D0CE]',
    kioskSummaryCardBg: 'bg-[#2A1518]/85 backdrop-blur-md',
    kioskSummaryCardBorder: 'border-[#BB0000]/50',
    kioskFooterBorder: 'border-[#BB0000]/45',
    kioskFooterSlateBg: 'bg-[#2A1518]/85 backdrop-blur-md hover:bg-[#800000]/60 transition-all',
    kioskFooterSlateBorder: 'border-[#BB0000]/45 hover:border-[#DC2626]',
    kioskFooterPillBg: 'bg-[#BB0000] border border-[#D0D0CE]/60',
    kioskFooterPillText: 'text-white font-extrabold',
    kioskFooterPillSecondaryBg: 'bg-[#121214]/80 border border-[#A7A9AC]/40',
    kioskFooterPillSecondaryText: 'text-[#D0D0CE] font-extrabold',

    // Buttons
    primaryBtn: 'bg-[#BB0000] hover:bg-[#990000] text-white shadow-sm font-black border border-[#DC2626]/50',
    secondaryBtn: 'bg-[#A7A9AC]/20 hover:bg-[#A7A9AC]/35 text-white border border-[#A7A9AC]/50 font-bold',
    accentPill: 'bg-[#BB0000] text-[#D0D0CE] border border-[#DC2626]/50',
    progressGradient: 'from-[#BB0000] via-[#DC2626] to-[#D0D0CE]',
  },
};

const THEME_STORAGE_KEY = 'chorequest_theme_id_v4';

export function getSavedThemeId(): AppThemeId {
  if (typeof window === 'undefined') return 'coastal-horizon';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as AppThemeId | null;
    if (saved && APP_THEMES[saved]) {
      return saved;
    }
  } catch (e) {
    // Ignore localStorage read failures
  }
  return 'coastal-horizon';
}

export function saveThemeId(themeId: AppThemeId): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
    if (APP_THEMES[themeId]?.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {
    // Ignore storage errors
  }
}
