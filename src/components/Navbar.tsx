import React, { useState } from 'react';
import {
  Shield,
  Sparkles,
  Volume2,
  VolumeX,
  Wifi,
  Server,
  LogOut,
  ArrowLeft,
  Calendar as CalendarIcon,
  Menu,
  X,
} from 'lucide-react';
import { KidProfile, AppSettings, CalendarEvent } from '../types';
import { sound } from '../utils/sound';
import { getTodayDateString } from '../utils/storage';
import { AppThemeId, APP_THEMES } from '../utils/theme';
import { AppNavMenu } from './AppNavMenu';

interface NavbarProps {
  settings: AppSettings;
  activeKid: KidProfile | null;
  isParentMode: boolean;
  events?: CalendarEvent[];
  isCalendarOpen?: boolean;
  isMenuOpen?: boolean;
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
  onToggleKiosk?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  activeKid,
  isParentMode,
  events = [],
  isCalendarOpen = false,
  isMenuOpen = false,
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
  onToggleKiosk,
}) => {
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const todayStr = getTodayDateString();
  const todayEventsCount = events.filter((e) => e.date === todayStr).length;
  const theme = APP_THEMES[currentTheme] || APP_THEMES['coastal-horizon'];

  return (
    <>
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

          {/* Right Action Hub: Quick Launchers + Unified Menu Dropdown */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Quick Action: Dinner Menu */}
            {onToggleMenu && (
              <button
                id="btn-nav-dinner-menu"
                onClick={() => {
                  sound.playTap();
                  onToggleMenu();
                }}
                className={`p-2 sm:px-3 sm:py-2 rounded-xl border-2 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0 ${
                  isMenuOpen
                    ? 'bg-amber-950 text-yellow-300 border-amber-950 shadow-md ring-2 ring-amber-400/50'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
                }`}
                title="Weekly Dinner Menu & Meal Voting"
              >
                <span className="text-base leading-none">🍽️</span>
                <span className="hidden md:inline text-xs font-black">Dinner</span>
              </button>
            )}

            {/* Quick Action: Calendar */}
            <button
              id="btn-nav-calendar"
              onClick={() => {
                sound.playTap();
                onToggleCalendar();
              }}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl border-2 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0 ${
                isCalendarOpen
                  ? 'bg-indigo-900 text-white border-indigo-950 shadow-md ring-2 ring-indigo-400/50'
                  : 'bg-yellow-100 hover:bg-yellow-200 text-slate-800 border-yellow-300'
              }`}
              title="Family Activity Calendar"
            >
              <CalendarIcon className="w-4 h-4 text-indigo-700 stroke-[2.5]" />
              <span className="hidden md:inline text-xs font-black">Calendar</span>
              {todayEventsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-yellow-300 text-[10px] font-black">
                  {todayEventsCount}
                </span>
              )}
            </button>

            {/* UNIFIED NAVIGATION & CONTROLS MENU BUTTON (Desktop, Tablet & Mobile) */}
            <button
              id="btn-app-menu-toggle"
              onClick={() => {
                sound.playTap();
                setIsMenuDrawerOpen((prev) => !prev);
              }}
              className={`px-3 py-2 rounded-xl border-2 flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 ${
                isMenuDrawerOpen
                  ? 'bg-slate-900 text-white border-slate-950 ring-2 ring-slate-400/50'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600'
              }`}
              title="Open Navigation Menu & Controls"
              aria-label="Open Navigation Menu & Controls"
              aria-expanded={isMenuDrawerOpen}
            >
              {isMenuDrawerOpen ? (
                <X className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <Menu className="w-4 h-4 stroke-[2.5]" />
              )}
              <span className="text-xs sm:text-sm font-black">Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Universal Hub Menu: Houses Dinner, Calendar, Kiosk, Host Guide, Theme Switcher, Sound & Parents */}
      <AppNavMenu
        isOpen={isMenuDrawerOpen}
        onClose={() => setIsMenuDrawerOpen(false)}
        settings={settings}
        activeKid={activeKid}
        isParentMode={isParentMode}
        events={events}
        isCalendarOpen={isCalendarOpen}
        isMenuOpen={isMenuOpen}
        currentTheme={currentTheme}
        onThemeChange={onThemeChange}
        onOpenParentPin={onOpenParentPin}
        onExitParentMode={onExitParentMode}
        onSelectKid={onSelectKid}
        onToggleSound={onToggleSound}
        onOpenPiGuide={onOpenPiGuide}
        onOpenRewardStore={onOpenRewardStore}
        onToggleCalendar={onToggleCalendar}
        onToggleMenu={onToggleMenu}
        onToggleKiosk={onToggleKiosk}
      />
    </>
  );
};
