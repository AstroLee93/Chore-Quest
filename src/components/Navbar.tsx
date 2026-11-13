/**
 * Navbar — iOS navigation bar.
 * Calm three-zone bar: back + brand / the active kid's balances / menu.
 * Keeps the theme's own header material (so team themes stay branded),
 * pads under the status bar & Dynamic Island, and uses adaptive label colors.
 */

import React, { useEffect, useState } from 'react';
import { Shield, ChevronLeft, Menu, X, Star } from 'lucide-react';
import { KidProfile, AppSettings, CalendarEvent } from '../types';
import { sound } from '../utils/sound';
import { AppThemeId, APP_THEMES, DEFAULT_THEME_ID } from '../utils/theme';
import { haptic } from '../utils/haptics';
import { isCq2026Active } from '../utils/themes2026';
import { AppNavMenu } from './AppNavMenu';

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
  onOpenGoalManager?: () => void;
  onOpenVault?: () => void;
  onOpenHouseRules?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  activeKid,
  isParentMode,
  events = [],
  isCalendarOpen = false,
  isMenuOpen = false,
  isGroceryOpen = false,
  currentTheme = DEFAULT_THEME_ID,
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
  onOpenGoalManager,
  onOpenVault,
  onOpenHouseRules,
}) => {
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);

  // 2026 family home has no top bar; its header's menu button opens this drawer.
  useEffect(() => {
    const open = () => setIsMenuDrawerOpen(true);
    window.addEventListener('cq-open-menu', open);
    return () => window.removeEventListener('cq-open-menu', open);
  }, []);
  const theme = APP_THEMES[currentTheme] || APP_THEMES[DEFAULT_THEME_ID];

  const vaultTotal =
    (activeKid?.goals?.reduce((acc, g) => acc + g.currentSaved, 0) ?? 0) +
    (activeKid?.kidCoinBalance || 0);

  return (
    <>
      <header
        className={!activeKid && !isParentMode && isCq2026Active()
          ? 'hidden'
          : `ios-navbar sticky top-0 z-40 ${theme.headerBg} border-b ${theme.headerBorder} pb-2.5 transition-colors duration-300`}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">

          {/* ── Left: Brand ──────────────────────────────────── */}
          <div className="flex items-center gap-2.5 shrink-0 min-w-0">
            {activeKid && !isParentMode && (
              <button
                id="btn-back-to-kids"
                onClick={() => { sound.playTap(); onSelectKid(null); }}
                className="flex items-center -ml-2 pr-1 min-h-[44px] text-ios-blue text-[17px] tracking-[-0.41px] cursor-pointer active:opacity-50 transition-opacity shrink-0"
                title="Switch Child Profile"
              >
                <ChevronLeft className="w-7 h-7 stroke-[2.25] -mr-0.5" />
                <span>Family</span>
              </button>
            )}

            <div
              onClick={() => { if (activeKid && !isParentMode) { sound.playTap(); onSelectKid(null); } }}
              className={`items-center gap-2.5 cursor-pointer select-none min-w-0 ${activeKid && !isParentMode ? 'hidden sm:flex' : !activeKid && !isParentMode && isCq2026Active() ? 'hidden' : 'flex'}`}
            >
              <div className={`w-8 h-8 ${theme.headerLogoBg} rounded-[9px] flex items-center justify-center shrink-0 shadow-sm`}>
                <span className={`text-[13px] font-bold font-rounded ${theme.headerLogoText}`}>CQ</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-[17px] font-semibold text-label leading-tight tracking-[-0.41px] truncate">
                  ChoreQuest
                </h1>
                <p className="text-[12px] text-label-secondary truncate leading-tight">
                  {isParentMode ? 'Parent admin' : settings.familyName || 'Family'}
                </p>
              </div>
            </div>
          </div>

          {/* ── Center: Active kid's currency pill ──────────── */}
          <div className="flex items-center gap-2 shrink-0">
            {activeKid && !isParentMode && (
              <>
                <button
                  id="btn-open-rewards-nav"
                  onClick={() => { sound.playTap(); haptic('selection'); onOpenRewardStore?.(); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-mid min-h-[36px] transition-transform cursor-pointer active:scale-95 shrink-0"
                  title={settings.pauseRewardStore ? 'Rewards Store (paused)' : 'Open Rewards Store'}
                >
                  <Star className={`w-3.5 h-3.5 ${settings.pauseRewardStore ? 'text-label-tertiary' : 'fill-ios-yellow text-ios-yellow'}`} />
                  <span className="text-[15px] font-semibold text-label tabular-nums">
                    {activeKid.stars.toLocaleString()}
                  </span>
                </button>

                {settings.kidCoinEnabled !== false && (
                  <button
                    id="btn-open-kidcoin-vault"
                    onClick={() => { sound.playCoinSound(); haptic('selection'); onOpenVault?.(); }}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-mid min-h-[36px] transition-transform cursor-pointer active:scale-95 shrink-0"
                    title="Kid-Coin savings vault"
                  >
                    <span className="text-sm leading-none">🪙</span>
                    <span className="text-[15px] font-semibold text-label tabular-nums">${vaultTotal.toFixed(2)}</span>
                  </button>
                )}

                {/* Avatar chip — desktop only */}
                <div className="hidden lg:flex items-center gap-2 pl-1 pr-3 py-1 rounded-full glass-mid">
                  <div
                    className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
                    style={{ backgroundColor: activeKid.color || '#0A84FF' }}
                  >
                    {activeKid.avatar && (activeKid.avatar.startsWith('http') || activeKid.avatar.startsWith('data:image') || activeKid.avatar.startsWith('/')) ? (
                      <img src={activeKid.avatar} alt={activeKid.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{activeKid.avatar || activeKid.name.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="text-[15px] font-medium text-label">{activeKid.name}</span>
                </div>
              </>
            )}

            {isParentMode && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-mid text-[13px] font-semibold text-label">
                <Shield className="w-3.5 h-3.5 text-ios-blue" />
                <span className="hidden sm:inline">Parent admin</span>
              </div>
            )}
          </div>

          {/* ── Right: Menu ──────────────────────────────────── */}
          <div className="flex items-center shrink-0">
            <button
              id="btn-app-menu-toggle"
              onClick={() => { sound.playTap(); haptic('selection'); setIsMenuDrawerOpen(p => !p); }}
              className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-transform cursor-pointer active:scale-90 before:absolute before:-inset-1 before:content-[''] ${
                isMenuDrawerOpen ? 'bg-fill-strong text-label' : 'glass-mid text-label'
              }`}
              title="Menu"
              aria-label="Open navigation menu"
              aria-expanded={isMenuDrawerOpen}
            >
              {isMenuDrawerOpen ? <X className="w-4 h-4 stroke-[2.5]" /> : <Menu className="w-4 h-4 stroke-[2.5]" />}
            </button>
          </div>
        </div>
      </header>

      <AppNavMenu
        isOpen={isMenuDrawerOpen}
        onClose={() => setIsMenuDrawerOpen(false)}
        settings={settings}
        activeKid={activeKid}
        isParentMode={isParentMode}
        events={events}
        isCalendarOpen={isCalendarOpen}
        isMenuOpen={isMenuOpen}
        isGroceryOpen={isGroceryOpen}
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
        onToggleGrocery={onToggleGrocery}
        onToggleKiosk={onToggleKiosk}
        onOpenGoalManager={onOpenGoalManager}
        onOpenVault={onOpenVault}
        onOpenHouseRules={onOpenHouseRules}
      />
    </>
  );
};
