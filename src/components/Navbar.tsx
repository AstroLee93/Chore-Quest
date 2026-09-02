import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Volume2,
  VolumeX,
  Wifi,
  Server,
  LogOut,
  ArrowLeft,
  Calendar as CalendarIcon,
  Menu,
  X,
  Palette,
  ChevronDown,
  ChevronUp,
  Check,
  Compass,
  Sparkles,
} from 'lucide-react';
import { KidProfile, AppSettings, CalendarEvent } from '../types';
import { sound } from '../utils/sound';
import { getTodayDateString } from '../utils/storage';
import { AppThemeId, APP_THEMES } from '../utils/theme';

interface NavbarProps {
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

export const Navbar: React.FC<NavbarProps> = ({
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isThemeSectionExpanded, setIsThemeSectionExpanded] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  const todayStr = getTodayDateString();
  const todayEventsCount = events.filter((e) => e.date === todayStr).length;
  const theme = APP_THEMES[currentTheme] || APP_THEMES['coastal-horizon'];

  // Close dropdown on click outside & Escape key
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleMenuItemClick = (action: () => void) => {
    sound.playTap();
    action();
    setIsDropdownOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 ${theme.headerBg} border-b ${theme.headerBorder} px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 shadow-sm transition-all duration-300`}
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Brand & Child Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {activeKid && !isParentMode && (
            <button
              id="btn-back-to-kids"
              onClick={() => {
                sound.playTap();
                onSelectKid(null);
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-white/80 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-black transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
              title="Switch Child Profile"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">All Kids</span>
            </button>
          )}

          <div
            onClick={() => {
              if (activeKid && !isParentMode) {
                sound.playTap();
                onSelectKid(null);
              }
            }}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none"
          >
            <div
              className={`w-9 h-9 sm:w-11 sm:h-11 ${theme.headerLogoBg} rounded-2xl flex items-center justify-center shadow-md transform -rotate-3 group-hover:rotate-0 transition-transform shrink-0`}
            >
              <span className={`text-base sm:text-xl font-black ${theme.headerLogoText}`}>CQ</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className={`text-lg sm:text-2xl font-black tracking-tight ${theme.headerTextColor} italic leading-none`}>
                  ChoreQuest
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <Wifi className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                  Pi Active
                </span>
              </div>
              <p className={`text-[10px] sm:text-xs font-bold hidden sm:block opacity-80 ${theme.headerTextColor} truncate mt-0.5`}>
                {isParentMode ? 'Parent Admin Control' : settings.familyName || 'Family Chore Server'}
              </p>
            </div>
          </div>
        </div>

        {/* Center / Kid Quick Info (Stars & Profile Badge) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {activeKid && !isParentMode && (
            <>
              {/* Star Points pill */}
              <button
                id="btn-open-rewards-nav"
                onClick={() => {
                  sound.playTap();
                  if (onOpenRewardStore) onOpenRewardStore();
                }}
                className="bg-pink-100 hover:bg-pink-200 dark:bg-pink-950/60 dark:hover:bg-pink-950/80 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border-2 border-pink-300 dark:border-pink-800 flex items-center gap-1.5 sm:gap-2.5 transition-all cursor-pointer active:scale-95 shadow-xs shrink-0"
                title="Open Rewards Store"
              >
                <span className="text-base sm:text-xl leading-none">⭐</span>
                <span className="font-black text-pink-600 dark:text-pink-300 text-sm sm:text-lg leading-none">
                  {activeKid.stars.toLocaleString()}{' '}
                  <span className="text-[10px] uppercase sm:text-xs font-extrabold">Pts</span>
                </span>
              </button>

              {/* Kid Profile Badge */}
              <div className="hidden lg:flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 p-1 pr-3 rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs">
                <div
                  className="w-7 h-7 rounded-full border border-white dark:border-slate-700 overflow-hidden flex items-center justify-center text-white font-black text-xs shadow-2xs shrink-0"
                  style={{ backgroundColor: activeKid.color || '#3b82f6' }}
                >
                  {activeKid.avatar || activeKid.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                  {activeKid.name}
                </span>
              </div>
            </>
          )}

          {isParentMode && (
            <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-800 text-[11px] sm:text-xs font-black shrink-0">
              <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="hidden sm:inline">Parent Admin Active</span>
              <span className="sm:hidden">Admin</span>
            </div>
          )}
        </div>

        {/* Right: Single [ ☰ Menu ] Button & Vertically Stacked Dropdown Menu */}
        <div className="relative shrink-0" ref={menuContainerRef}>
          <button
            id="btn-app-menu-toggle"
            onClick={() => {
              sound.playTap();
              setIsDropdownOpen((prev) => !prev);
            }}
            className={`px-3.5 py-2 rounded-xl border-2 flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 select-none ${
              isDropdownOpen
                ? 'bg-slate-900 text-white border-slate-950 ring-2 ring-slate-400/50'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600'
            }`}
            title="Open Menu"
            aria-label="Toggle Application Menu"
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
            aria-controls="nav-dropdown-menu"
          >
            {isDropdownOpen ? (
              <X className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <Menu className="w-4 h-4 stroke-[2.5]" />
            )}
            <span className="text-xs sm:text-sm font-black">Menu</span>
            {todayEventsCount > 0 && !isDropdownOpen && (
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            )}
          </button>

          {/* Vertically Stacked Dropdown Menu */}
          {isDropdownOpen && (
            <div
              id="nav-dropdown-menu"
              role="menu"
              aria-labelledby="btn-app-menu-toggle"
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-slate-800 p-3 sm:p-4 space-y-3 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150"
            >
              {/* Active Profile Info (if kid selected) */}
              {activeKid && !isParentMode && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 dark:from-slate-800 dark:to-slate-800/60 border border-pink-200 dark:border-pink-900/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl border-2 border-white dark:border-slate-700 flex items-center justify-center text-white font-black text-sm shadow-2xs shrink-0"
                      style={{ backgroundColor: activeKid.color || '#3b82f6' }}
                    >
                      {activeKid.avatar || activeKid.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Child Profile</div>
                      <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 truncate">
                        {activeKid.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {onOpenRewardStore && (
                      <button
                        id="btn-dropdown-rewards"
                        role="menuitem"
                        tabIndex={0}
                        onClick={() => handleMenuItemClick(onOpenRewardStore)}
                        className="px-2.5 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-black text-xs flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                      >
                        <span>⭐</span>
                        <span>{activeKid.stars.toLocaleString()}</span>
                      </button>
                    )}
                    <button
                      id="btn-dropdown-switch-kid"
                      role="menuitem"
                      tabIndex={0}
                      onClick={() => handleMenuItemClick(() => onSelectKid(null))}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer hover:bg-slate-100"
                      title="Switch Child Profile"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Switch</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Section: Family Hub Applications */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-0.5 flex items-center gap-1">
                  <Compass className="w-3 h-3" />
                  <span>Family Tools & Planning</span>
                </div>

                {/* 1. Dinner Menu */}
                {onToggleMenu && (
                  <button
                    id="btn-menu-dinner"
                    role="menuitem"
                    tabIndex={0}
                    onClick={() => handleMenuItemClick(onToggleMenu)}
                    className={`w-full p-2.5 rounded-2xl border text-left transition-all cursor-pointer active:scale-95 shadow-2xs flex items-center justify-between gap-2.5 ${
                      isMenuOpen
                        ? 'bg-amber-950 text-yellow-300 border-amber-950 ring-2 ring-amber-400/50'
                        : 'bg-amber-50/90 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 border-amber-200 dark:border-amber-900/40 text-amber-950 dark:text-amber-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 flex items-center justify-center text-base shadow-2xs shrink-0">
                        🍽️
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-black truncate">Dinner Menu</div>
                        <div className="text-[10px] font-semibold opacity-80 truncate">
                          Meal planning & recipes
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-[11px] font-black shrink-0">
                      Open
                    </span>
                  </button>
                )}

                {/* 2. Grocery List (Admin or Main Dashboard Only) */}
                {onToggleGrocery && (isParentMode || !activeKid) && (
                  <button
                    id="btn-menu-grocery"
                    role="menuitem"
                    tabIndex={0}
                    onClick={() => handleMenuItemClick(onToggleGrocery)}
                    className={`w-full p-2.5 rounded-2xl border text-left transition-all cursor-pointer active:scale-95 shadow-2xs flex items-center justify-between gap-2.5 ${
                      isGroceryOpen
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-950 ring-2 ring-emerald-400/50'
                        : 'bg-emerald-50/90 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900/40 text-emerald-950 dark:text-emerald-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 flex items-center justify-center text-base shadow-2xs shrink-0">
                        🛒
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-black truncate">Grocery List</div>
                        <div className="text-[10px] font-semibold opacity-80 truncate">
                          Weekly shopping items
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 text-[11px] font-black shrink-0">
                      Open
                    </span>
                  </button>
                )}

                {/* 3. Activity Calendar */}
                <button
                  id="btn-menu-calendar"
                  role="menuitem"
                  tabIndex={0}
                  onClick={() => handleMenuItemClick(onToggleCalendar)}
                  className={`w-full p-2.5 rounded-2xl border text-left transition-all cursor-pointer active:scale-95 shadow-2xs flex items-center justify-between gap-2.5 ${
                    isCalendarOpen
                      ? 'bg-indigo-900 text-white border-indigo-950 ring-2 ring-indigo-400/50'
                      : 'bg-indigo-50/90 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 border-indigo-200 dark:border-indigo-900/40 text-indigo-950 dark:text-indigo-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 flex items-center justify-center shadow-2xs shrink-0">
                      <CalendarIcon className="w-4 h-4 text-indigo-700 dark:text-indigo-300 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-black truncate">Activity Calendar</div>
                      <div className="text-[10px] font-semibold opacity-80 truncate">
                        Family events & schedule
                      </div>
                    </div>
                  </div>
                  {todayEventsCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-yellow-300 text-[11px] font-black shadow-2xs shrink-0">
                      {todayEventsCount} Today
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-[11px] font-black shrink-0">
                      View
                    </span>
                  )}
                </button>

                {/* 4. Kitchen Wall Kiosk */}
                {onToggleKiosk && (
                  <button
                    id="btn-menu-kiosk"
                    role="menuitem"
                    tabIndex={0}
                    onClick={() => handleMenuItemClick(onToggleKiosk)}
                    className="w-full p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2.5 text-left transition-all cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center text-base shadow-2xs shrink-0">
                        📺
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 truncate">
                          Kitchen Wall Kiosk
                        </div>
                        <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                          Ambient scoreboard & clock
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold shrink-0">
                      Launch
                    </span>
                  </button>
                )}

                {/* 5. Raspberry Pi Host Guide */}
                <button
                  id="btn-menu-pi-guide"
                  role="menuitem"
                  tabIndex={0}
                  onClick={() => handleMenuItemClick(onOpenPiGuide)}
                  className="w-full p-2.5 rounded-2xl bg-yellow-50/80 hover:bg-yellow-100 dark:bg-yellow-950/30 dark:hover:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-900/40 flex items-center justify-between gap-2.5 text-left transition-all cursor-pointer active:scale-95 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-200 flex items-center justify-center shadow-2xs shrink-0">
                      <Server className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 truncate">
                        Host Guide
                      </div>
                      <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                        Raspberry Pi Wi-Fi & IP
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-200 text-[11px] font-bold shrink-0">
                    Guide
                  </span>
                </button>
              </div>

              {/* Section: Settings & Controls */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-0.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Controls & Admin</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Sound Toggle */}
                  <button
                    id="btn-menu-sound-toggle"
                    role="menuitem"
                    tabIndex={0}
                    onClick={() => {
                      sound.playTap();
                      onToggleSound();
                    }}
                    className={`p-2.5 rounded-2xl border flex flex-col items-start justify-between text-left transition-all cursor-pointer active:scale-95 shadow-2xs ${
                      settings.soundEnabled
                        ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 text-sky-950 dark:text-sky-200'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-1 bg-white dark:bg-slate-800 shadow-2xs">
                      {settings.soundEnabled ? (
                        <Volume2 className="w-4 h-4 text-sky-600 dark:text-sky-400 stroke-[2.5]" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-slate-400 stroke-[2.5]" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-black">Sound</div>
                      <div className="text-[10px] font-bold opacity-80">
                        {settings.soundEnabled ? '🔊 ON' : '🔇 OFF'}
                      </div>
                    </div>
                  </button>

                  {/* Parent Admin Login / Exit */}
                  {isParentMode ? (
                    <button
                      id="btn-menu-parents-active"
                      role="menuitem"
                      tabIndex={0}
                      onClick={() => handleMenuItemClick(onExitParentMode)}
                      className="p-2.5 rounded-2xl border bg-indigo-900 border-indigo-950 text-white flex flex-col items-start justify-between text-left transition-all cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-1 bg-indigo-800 shadow-2xs">
                        <LogOut className="w-4 h-4 text-yellow-300" />
                      </div>
                      <div>
                        <div className="text-xs font-black">Parent Mode</div>
                        <div className="text-[10px] font-bold text-yellow-300">Tap to Exit</div>
                      </div>
                    </button>
                  ) : (
                    <button
                      id="btn-menu-parents-login"
                      role="menuitem"
                      tabIndex={0}
                      onClick={() => handleMenuItemClick(onOpenParentPin)}
                      className="p-2.5 rounded-2xl border bg-slate-900 border-slate-950 text-white hover:bg-slate-800 flex flex-col items-start justify-between text-left transition-all cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-1 bg-slate-800 shadow-2xs">
                        <Shield className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div>
                        <div className="text-xs font-black">Parent PIN</div>
                        <div className="text-[10px] font-bold text-slate-300">Admin Login</div>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Section: Themes */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between px-2 py-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Palette className="w-3 h-3" />
                    <span>Theme: {theme.name}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setIsThemeSectionExpanded((prev) => !prev);
                    }}
                    className="text-[11px] font-bold text-sky-600 dark:text-sky-400 flex items-center gap-0.5 cursor-pointer hover:underline"
                  >
                    <span>{isThemeSectionExpanded ? 'Less' : 'Change'}</span>
                    {isThemeSectionExpanded ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </div>

                {/* Expanded Theme Choices */}
                {isThemeSectionExpanded && onThemeChange && (
                  <div className="space-y-1 pt-1 max-h-48 overflow-y-auto pr-1">
                    {Object.values(APP_THEMES).map((th) => {
                      const isSelected = th.id === currentTheme;
                      return (
                        <button
                          key={th.id}
                          id={`btn-menu-theme-${th.id}`}
                          role="menuitem"
                          tabIndex={0}
                          onClick={() => {
                            sound.playTap();
                            onThemeChange(th.id);
                          }}
                          className={`w-full p-2 rounded-xl text-left transition-all cursor-pointer border flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-400 dark:border-sky-500 shadow-2xs ring-1 ring-sky-300'
                              : 'bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-slate-200/80 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base">{th.icon}</span>
                            <div className="min-w-0">
                              <span className="text-xs font-black text-slate-900 dark:text-slate-100 block truncate">
                                {th.name}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className="flex items-center -space-x-1">
                              {th.swatches.slice(0, 3).map((hex, i) => (
                                <span
                                  key={i}
                                  className="w-3 h-3 rounded-full border border-white dark:border-slate-900"
                                  style={{ backgroundColor: hex }}
                                />
                              ))}
                            </div>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 stroke-[3]" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

