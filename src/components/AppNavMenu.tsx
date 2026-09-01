import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Palette,
  Volume2,
  VolumeX,
  Calendar as CalendarIcon,
  Server,
  Wifi,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Star,
  LogOut,
  ArrowLeft,
  UtensilsCrossed,
  Tv,
  Lock,
  Compass,
} from 'lucide-react';
import { KidProfile, AppSettings, CalendarEvent } from '../types';
import { sound } from '../utils/sound';
import { getTodayDateString } from '../utils/storage';
import { AppThemeId, APP_THEMES } from '../utils/theme';

export interface AppNavMenuProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  activeKid: KidProfile | null;
  isParentMode: boolean;
  events?: CalendarEvent[];
  isCalendarOpen?: boolean;
  isMenuOpen?: boolean;
  isGroceryOpen?: boolean;
  currentTheme?: AppThemeId;
  onThemeChange?: (theme: AppThemeId) => void;
  onOpenParentPin: () => void;
  onExitParentMode: () => void;
  onSelectKid: (kid: KidProfile | null) => void;
  onToggleSound: () => void;
  onOpenPiGuide: () => void;
  onOpenRewardStore?: () => void;
  onToggleCalendar: () => void;
  onToggleMenu?: () => void;
  onToggleGrocery?: () => void;
  onToggleKiosk?: () => void;
}

export const AppNavMenu: React.FC<AppNavMenuProps> = ({
  isOpen,
  onClose,
  settings,
  activeKid,
  isParentMode,
  events = [],
  isCalendarOpen = false,
  isMenuOpen = false,
  isGroceryOpen = false,
  currentTheme = 'coastal-horizon',
  onThemeChange,
  onOpenParentPin,
  onExitParentMode,
  onSelectKid,
  onToggleSound,
  onOpenPiGuide,
  onOpenRewardStore,
  onToggleCalendar,
  onToggleMenu,
  onToggleGrocery,
  onToggleKiosk,
}) => {
  const [isThemeSectionExpanded, setIsThemeSectionExpanded] = useState<boolean>(false);
  const todayStr = getTodayDateString();
  const todayEventsCount = events.filter((e) => e.date === todayStr).length;
  const activeTheme = APP_THEMES[currentTheme] || APP_THEMES['coastal-horizon'];

  // Lock background body scroll when open and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAction = (callback: () => void) => {
    sound.playTap();
    callback();
    onClose();
  };

  return (
    <div
      id="app-nav-overlay"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-md transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sound.playTap();
          onClose();
        }
      }}
    >
      <div
        id="app-nav-modal"
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95 sm:zoom-in-98 slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-200"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 ${activeTheme.headerLogoBg} rounded-2xl flex items-center justify-center shadow-md transform -rotate-2`}
            >
              <span className={`text-lg font-black ${activeTheme.headerLogoText}`}>CQ</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  ChoreQuest Hub
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <Wifi className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                  Pi Active
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {isParentMode ? 'Parent Admin Mode' : settings.familyName || 'Family Chore & Menu System'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-app-menu"
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer active:scale-95 border border-slate-200/80 dark:border-slate-700"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Body with All 7 Tools */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 divide-y divide-slate-100 dark:divide-slate-800/80">
          {/* Active Profile Status / Switcher (if child selected) */}
          {activeKid && !isParentMode ? (
            <div className="pb-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 dark:from-slate-800/90 dark:to-slate-800/60 border border-pink-200 dark:border-pink-900/40 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-12 h-12 rounded-2xl border-2 border-white dark:border-slate-700 flex items-center justify-center text-white font-black text-xl shadow-sm shrink-0"
                    style={{ backgroundColor: activeKid.color || '#3b82f6' }}
                  >
                    {activeKid.avatar || activeKid.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Current Kid Profile</div>
                    <div className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 truncate">
                      {activeKid.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onOpenRewardStore && (
                    <button
                      id="btn-modal-rewards"
                      onClick={() => handleAction(onOpenRewardStore)}
                      className="px-3.5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                    >
                      <span>⭐</span>
                      <span>{activeKid.stars.toLocaleString()} Pts</span>
                    </button>
                  )}

                  <button
                    id="btn-modal-switch-kid"
                    onClick={() => handleAction(() => onSelectKid(null))}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    title="Switch Child"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Switch</span>
                  </button>
                </div>
              </div>
            </div>
          ) : isParentMode ? (
            <div className="pb-4">
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-indigo-600 text-yellow-300 flex items-center justify-center shadow-xs">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-black text-indigo-950 dark:text-indigo-200">
                      Parent Admin Mode Active
                    </div>
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                      Full access to chore assignments, rewards & PIN
                    </div>
                  </div>
                </div>

                <button
                  id="btn-modal-exit-parent"
                  onClick={() => handleAction(onExitParentMode)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Exit</span>
                </button>
              </div>
            </div>
          ) : null}

          {/* 1. Primary Family Hub Features (Dinner, Calendar, Kiosk, Host Guide) */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>Family Hub Applications</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {/* 1. Dinner Menu Button */}
              {onToggleMenu && (
                <button
                  id="btn-menu-dinner"
                  onClick={() => handleAction(onToggleMenu)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer active:scale-95 shadow-xs flex items-center justify-between gap-3 ${
                    isMenuOpen
                      ? 'bg-amber-950 text-yellow-300 border-amber-950 ring-2 ring-amber-400/50'
                      : 'bg-amber-50/80 hover:bg-amber-100/90 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 border-amber-200 dark:border-amber-900/40 text-amber-950 dark:text-amber-100'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 flex items-center justify-center text-xl shadow-2xs shrink-0">
                      🍽️
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-black truncate">Dinner Menu</div>
                      <div className="text-[11px] font-semibold opacity-80 truncate">
                        Meal planning & recipes
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-xs font-black shrink-0">
                    Open
                  </span>
                </button>
              )}

              {/* 2. Automated Weekly Grocery List Button */}
              {onToggleGrocery && (
                <button
                  id="btn-menu-grocery"
                  onClick={() => handleAction(onToggleGrocery)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer active:scale-95 shadow-xs flex items-center justify-between gap-3 ${
                    isGroceryOpen
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-950 ring-2 ring-emerald-400/50'
                      : 'bg-emerald-50/80 hover:bg-emerald-100/90 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900/40 text-emerald-950 dark:text-emerald-100'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 flex items-center justify-center text-xl shadow-2xs shrink-0">
                      🛒
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-black truncate">Grocery List</div>
                      <div className="text-[11px] font-semibold opacity-80 truncate">
                        Automated weekly shopping
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 text-xs font-black shrink-0">
                    Open
                  </span>
                </button>
              )}

              {/* 3. Calendar Button */}
              <button
                id="btn-menu-calendar"
                onClick={() => handleAction(onToggleCalendar)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer active:scale-95 shadow-xs flex items-center justify-between gap-3 ${
                  isCalendarOpen
                    ? 'bg-indigo-900 text-white border-indigo-950 ring-2 ring-indigo-400/50'
                    : 'bg-indigo-50/80 hover:bg-indigo-100/90 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 border-indigo-200 dark:border-indigo-900/40 text-indigo-950 dark:text-indigo-100'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 flex items-center justify-center shadow-2xs shrink-0">
                    <CalendarIcon className="w-5 h-5 text-indigo-700 dark:text-indigo-300 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-black truncate">Activity Calendar</div>
                    <div className="text-[11px] font-semibold opacity-80 truncate">
                      Family schedule & events
                    </div>
                  </div>
                </div>
                {todayEventsCount > 0 ? (
                  <span className="px-2 py-1 rounded-lg bg-indigo-600 text-yellow-300 text-xs font-black shadow-2xs shrink-0">
                    {todayEventsCount} Today
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-black shrink-0">
                    View
                  </span>
                )}
              </button>

              {/* 4. Kiosk Mode Button */}
              {onToggleKiosk && (
                <button
                  id="btn-menu-kiosk"
                  onClick={() => handleAction(onToggleKiosk)}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/90 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-left transition-all cursor-pointer active:scale-95 shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center text-xl shadow-2xs shrink-0">
                      📺
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">
                        Kitchen Wall Kiosk
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                        Ambient scoreboard & clock
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold shrink-0">
                    Launch
                  </span>
                </button>
              )}

              {/* 5. Host Guide / Raspberry Pi Button */}
              <button
                id="btn-menu-pi-guide"
                onClick={() => handleAction(onOpenPiGuide)}
                className="p-3.5 rounded-2xl bg-yellow-50/80 hover:bg-yellow-100/90 dark:bg-yellow-950/30 dark:hover:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-900/40 flex items-center justify-between gap-3 text-left transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-200 flex items-center justify-center shadow-2xs shrink-0">
                    <Server className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">
                      Host Guide
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                      Raspberry Pi Wi-Fi & IP
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-200 text-xs font-bold shrink-0">
                  Guide
                </span>
              </button>
            </div>
          </div>

          {/* 2. Controls & Preferences (Theme, Sound, Parents) */}
          <div className="pt-4 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Settings & Controls</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* 5. Sound Toggle Button */}
              <button
                id="btn-menu-sound-toggle"
                onClick={() => {
                  sound.playTap();
                  onToggleSound();
                }}
                className={`p-3.5 rounded-2xl border flex flex-col items-start justify-between text-left transition-all cursor-pointer active:scale-95 shadow-xs ${
                  settings.soundEnabled
                    ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 text-sky-950 dark:text-sky-200'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2 bg-white dark:bg-slate-800 shadow-2xs">
                  {settings.soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-sky-600 dark:text-sky-400 stroke-[2.5]" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-slate-400 stroke-[2.5]" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-black">Sound Effects</div>
                  <div className="text-[11px] font-bold opacity-80">
                    {settings.soundEnabled ? '🔊 Active (Enabled)' : '🔇 Muted'}
                  </div>
                </div>
              </button>

              {/* 6. Parents Admin Toggle / Login Button */}
              {isParentMode ? (
                <button
                  id="btn-menu-parents-active"
                  onClick={() => handleAction(onExitParentMode)}
                  className="p-3.5 rounded-2xl border bg-indigo-900 border-indigo-950 text-white flex flex-col items-start justify-between text-left transition-all cursor-pointer active:scale-95 shadow-xs"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2 bg-indigo-800 shadow-2xs">
                    <LogOut className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div>
                    <div className="text-xs font-black">Parent Mode</div>
                    <div className="text-[11px] font-bold text-yellow-300">Tap to Exit</div>
                  </div>
                </button>
              ) : (
                <button
                  id="btn-menu-parents-login"
                  onClick={() => handleAction(onOpenParentPin)}
                  className="p-3.5 rounded-2xl border bg-slate-900 border-slate-950 text-white hover:bg-slate-800 flex flex-col items-start justify-between text-left transition-all cursor-pointer active:scale-95 shadow-xs"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2 bg-slate-800 shadow-2xs">
                    <Shield className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-xs font-black">Parent Admin</div>
                    <div className="text-[11px] font-bold text-slate-300">PIN Protected</div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* 7. Theme Switcher Section */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                <span>Color Palette & Theme Switcher</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  setIsThemeSectionExpanded((prev) => !prev);
                }}
                className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1 cursor-pointer hover:underline"
              >
                <span>{isThemeSectionExpanded ? 'Show Less' : 'View All 6 Themes'}</span>
                {isThemeSectionExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Current Active Theme Summary Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl shrink-0">{activeTheme.icon}</span>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <span>{activeTheme.name}</span>
                    {activeTheme.isDark && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        Dark
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                    {activeTheme.subtitle}
                  </p>
                </div>
              </div>

              {/* Swatches strip */}
              <div className="flex items-center -space-x-1 shrink-0 bg-white dark:bg-slate-900 p-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs">
                {activeTheme.swatches.slice(0, 5).map((hex, i) => (
                  <span
                    key={i}
                    className="w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 shadow-2xs"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>

            {/* Expanded List of Themes */}
            {isThemeSectionExpanded && onThemeChange && (
              <div className="space-y-2 pt-1 animate-in fade-in-50 duration-150">
                {Object.values(APP_THEMES).map((theme) => {
                  const isSelected = theme.id === currentTheme;
                  return (
                    <button
                      key={theme.id}
                      id={`btn-menu-theme-pick-${theme.id}`}
                      onClick={() => {
                        sound.playTap();
                        onThemeChange(theme.id);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-400 dark:border-sky-500 shadow-xs ring-1 ring-sky-300'
                          : 'bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-slate-200/80 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl shrink-0">{theme.icon}</span>
                          <div className="min-w-0">
                            <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                              {theme.name}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate font-medium">
                              {theme.subtitle}
                            </span>
                          </div>
                        </div>

                        {isSelected ? (
                          <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        ) : null}
                      </div>

                      {/* Visual Swatch Color Strip */}
                      <div className="mt-2 flex items-center gap-1 h-3.5 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-md">
                        {theme.swatches.map((hex, i) => (
                          <div
                            key={i}
                            className="flex-1 h-full rounded-sm"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer info strip */}
        <div className="p-3.5 px-5 bg-slate-100/90 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Raspberry Pi Server Connected</span>
          </span>
          <span>ChoreQuest v2.0</span>
        </div>
      </div>
    </div>
  );
};
