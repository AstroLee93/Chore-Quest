import React, { useState } from 'react';
import { Shield, Sparkles, Volume2, VolumeX, Wifi, Server, LogOut, ArrowLeft, Calendar as CalendarIcon, CloudSun } from 'lucide-react';
import { KidProfile, AppSettings, CalendarEvent } from '../types';
import { sound } from '../utils/sound';
import { getSeasonalWeatherForDate } from '../utils/calendar';
import { getTodayDateString } from '../utils/storage';
import { AppThemeId } from '../utils/theme';
import { ThemeSelector } from './ThemeSelector';

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
  currentTheme = 'soft-calm',
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
  const todayStr = getTodayDateString();
  const todayWeather = getSeasonalWeatherForDate(todayStr);
  const todayEventsCount = events.filter((e) => e.date === todayStr).length;

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3 sm:py-3.5 flex justify-between items-center shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand & Left Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {activeKid && !isParentMode && (
            <button
              id="btn-back-to-kids"
              onClick={() => {
                sound.playTap();
                onSelectKid(null);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-black transition-all cursor-pointer shadow-2xs"
              title="Switch Child"
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
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-500 dark:bg-indigo-600 rounded-2xl flex items-center justify-center shadow-md transform -rotate-3 group-hover:rotate-0 transition-transform shrink-0">
              <span className="text-white text-lg sm:text-2xl font-black">CQ</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white italic">
                  ChoreQuest
                </h1>
                <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <Wifi className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Pi Active
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold hidden sm:block">
                {isParentMode ? 'Parent Admin Control' : settings.familyName || 'Family Chore Server'}
              </p>
            </div>
          </div>
        </div>

        {/* Center / Kid Quick Info */}
        <div className="flex items-center gap-3 sm:gap-4">
          {activeKid && !isParentMode && (
            <>
              {/* Star Points pill matching vibrant design */}
              <button
                id="btn-open-rewards-nav"
                onClick={() => {
                  sound.playTap();
                  if (onOpenRewardStore) onOpenRewardStore();
                }}
                className="bg-pink-100 hover:bg-pink-200 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border-2 border-pink-300 flex items-center gap-2 sm:gap-3 transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                <span className="text-xl sm:text-2xl">⭐</span>
                <span className="font-black text-pink-600 text-base sm:text-xl leading-none">
                  {activeKid.stars.toLocaleString()} <span className="text-xs uppercase sm:text-sm font-extrabold">Pts</span>
                </span>
              </button>

              {/* Kid Profile Pill */}
              <div className="hidden md:flex items-center gap-2.5 bg-white p-1 pr-3.5 rounded-full border-2 border-slate-200 shadow-xs">
                <div
                  className="w-9 h-9 rounded-full border-2 border-white overflow-hidden flex items-center justify-center text-white font-black text-sm shadow-2xs"
                  style={{ backgroundColor: activeKid.color || '#3b82f6' }}
                >
                  {activeKid.avatar || activeKid.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="font-extrabold text-slate-800 text-sm">
                  {activeKid.name}'s Profile
                </span>
              </div>
            </>
          )}

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Dinner Menu Button */}
            {onToggleMenu && (
              <button
                id="btn-nav-dinner-menu"
                onClick={() => {
                  sound.playTap();
                  onToggleMenu();
                }}
                className={`p-2 sm:px-3.5 sm:py-2 rounded-xl border-2 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 ${
                  isMenuOpen
                    ? 'bg-amber-950 text-yellow-300 border-amber-950 shadow-md ring-2 ring-amber-400/50'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
                }`}
                title="Weekly Dinner Menu & Meal Voting"
              >
                <span className="text-base">🍽️</span>
                <span className="hidden sm:inline text-xs font-black">Dinner</span>
              </button>
            )}

            {/* Calendar Glass Overlay Button */}
            <button
              id="btn-nav-calendar"
              onClick={() => {
                sound.playTap();
                onToggleCalendar();
              }}
              className={`p-2 sm:px-3.5 sm:py-2 rounded-xl border-2 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 ${
                isCalendarOpen
                  ? 'bg-indigo-900 text-white border-indigo-950 shadow-md ring-2 ring-indigo-400/50'
                  : 'bg-yellow-100 hover:bg-yellow-200 text-slate-800 border-yellow-300'
              }`}
              title="Family Activity Calendar (Glass View)"
            >
              <CalendarIcon className="w-4 h-4 text-indigo-700 stroke-[2.5]" />
              <span className="hidden sm:inline text-xs font-black">Calendar</span>
              {todayEventsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-yellow-300 text-[10px] font-black">
                  {todayEventsCount}
                </span>
              )}
            </button>

            {/* Kiosk Mode Button */}
            {onToggleKiosk && (
              <button
                id="btn-nav-kiosk"
                onClick={() => {
                  sound.playTap();
                  onToggleKiosk();
                }}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Open Kitchen / Wall Tablet Ambient Kiosk Display"
              >
                <span>📺</span>
                <span className="hidden md:inline">Kiosk</span>
              </button>
            )}

            {/* Pi Guide Info */}
            <button
              id="btn-pi-guide"
              onClick={() => {
                sound.playTap();
                onOpenPiGuide();
              }}
              className="p-2.5 sm:px-3 sm:py-2 rounded-xl text-slate-700 hover:text-slate-900 bg-yellow-100/70 hover:bg-yellow-200 border-2 border-yellow-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Raspberry Pi Local Setup & Network Info"
            >
              <Server className="w-4 h-4 text-orange-600" />
              <span className="hidden xl:inline">Host Guide</span>
            </button>

            {/* Eye-Comfort Theme & Glass Switcher */}
            {onThemeChange && (
              <ThemeSelector currentTheme={currentTheme} onThemeChange={onThemeChange} />
            )}

            {/* Sound Toggle */}
            <button
              id="btn-sound-toggle"
              onClick={() => {
                onToggleSound();
                sound.playTap();
              }}
              className="p-2.5 sm:p-3 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title={settings.soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-sky-600 dark:text-sky-400 stroke-[2.5]" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400 stroke-[2.5]" />
              )}
            </button>

            {/* Parent Mode Toggle */}
            {isParentMode ? (
              <button
                id="btn-exit-parent-mode"
                onClick={() => {
                  sound.playTap();
                  onExitParentMode();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white text-xs sm:text-sm font-black shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Exit Parents</span>
              </button>
            ) : (
              <button
                id="btn-enter-parent-mode"
                onClick={() => {
                  sound.playTap();
                  onOpenParentPin();
                }}
                className="bg-slate-800 text-white p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl hover:bg-slate-700 flex items-center gap-1.5 font-black text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-95"
                title="Parent Settings & Management"
              >
                <Shield className="w-4 h-4 text-yellow-400" />
                <span className="hidden sm:inline">Parents</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

