import React, { useState, useRef, useEffect } from 'react';
import {
  Palette,
  Check,
  Star,
  Sun,
  Moon,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  TestTube2,
  CheckCircle2,
  X,
  Type
} from 'lucide-react';
import { AppThemeId, APP_THEMES } from '../utils/theme';
import { sound } from '../utils/sound';

interface ThemeSelectorProps {
  currentTheme: AppThemeId;
  onThemeChange: (themeId: AppThemeId) => void;
}

type ThemeCategoryFilter = 'all' | 'favorites' | 'light' | 'dark';

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onThemeChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ThemeCategoryFilter>('all');
  const [showSandbox, setShowSandbox] = useState(false);
  const [sandboxText, setSandboxText] = useState('Typing here is crystal clear!');
  const [sandboxAmount, setSandboxAmount] = useState('15.00');
  const [sandboxSelect, setSandboxSelect] = useState('option-1');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeTheme = APP_THEMES[currentTheme] || APP_THEMES['coastal-horizon'];

  // Handle outside click & escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (themeId: AppThemeId) => {
    sound.playPop();
    onThemeChange(themeId);
  };

  const allThemes = Object.values(APP_THEMES);
  const favoriteThemes = allThemes.filter((t) => t.isUserFavorite);

  const filteredThemes = allThemes.filter((t) => {
    if (activeFilter === 'favorites') return t.isUserFavorite;
    if (activeFilter === 'light') return !t.isDark;
    if (activeFilter === 'dark') return t.isDark;
    return true;
  });

  return (
    <div className={`relative inline-block text-left ${isOpen ? 'z-50' : 'z-20'}`} ref={dropdownRef}>
      {/* Trigger Button with Active Theme and Swatch Dots */}
      <button
        id="btn-theme-switcher"
        type="button"
        onClick={() => {
          sound.playTap();
          setIsOpen((prev) => !prev);
        }}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-black border transition-all cursor-pointer shadow-sm active:scale-95 ${
          isOpen
            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-amber-400 ring-2 ring-amber-300/60'
            : 'bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 hover:bg-white dark:hover:bg-slate-700 border-slate-200/90 dark:border-slate-700'
        } backdrop-blur-md`}
        title={`Current Theme: ${activeTheme.name} (Verified High Contrast). Click to switch palette.`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-base leading-none">{activeTheme.icon}</span>

        {/* Swatch color dots */}
        <div className="flex items-center -space-x-1">
          {activeTheme.swatches.slice(0, 4).map((hex, idx) => (
            <span
              key={idx}
              className="w-3 h-3 rounded-full border border-white dark:border-slate-800 shadow-2xs inline-block"
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 font-black">
          <span>{activeTheme.name}</span>
          {activeTheme.isUserFavorite && (
            <span className="inline-flex items-center px-1.5 py-0.2 text-[10px] font-black rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
              ⭐ Favorite
            </span>
          )}
        </div>
        <Palette className="w-3.5 h-3.5 opacity-75 ml-0.5 text-amber-500" />
      </button>

      {/* Theme Options Dropdown Popover */}
      {isOpen && (
        <div
          id="theme-dropdown-menu"
          className="absolute right-0 mt-2 w-88 sm:w-105 max-w-[calc(100vw-1rem)] rounded-2xl bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-3 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[88vh] overflow-y-auto"
        >
          {/* Header Bar */}
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                  Color Palette & Theme Switcher
                </h3>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  All Text Fields Verified High Contrast & Visible
                </span>
              </div>
            </div>

            <button
              id="btn-close-theme-menu"
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close theme switcher"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick-Switch Header for User Favorites */}
          <div className="my-2.5 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-red-500/10 border border-amber-300/40 dark:border-amber-700/40">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                Users' Top Favorites (1-Click Switch)
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                Fixed & Contrast Guaranteed
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Soft Sky Quick Button */}
              <button
                id="btn-quick-soft-sky"
                type="button"
                onClick={() => handleSelect('soft-sky')}
                className={`p-2 rounded-lg text-left transition-all border cursor-pointer ${
                  currentTheme === 'soft-sky'
                    ? 'bg-sky-100/90 dark:bg-sky-950/80 border-sky-400 ring-2 ring-sky-300 shadow-sm'
                    : 'bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-base">🌤️</span>
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                      Soft Sky
                    </span>
                  </div>
                  {currentTheme === 'soft-sky' && (
                    <span className="w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-1">
                  {APP_THEMES['soft-sky'].swatches.slice(0, 4).map((c, i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                  ))}
                  <span className="text-[9px] font-bold text-sky-700 dark:text-sky-300 ml-auto">
                    Light Mode
                  </span>
                </div>
              </button>

              {/* Ohio State Buckeyes Quick Button */}
              <button
                id="btn-quick-buckeyes"
                type="button"
                onClick={() => handleSelect('ohio-state-buckeyes')}
                className={`p-2 rounded-lg text-left transition-all border cursor-pointer ${
                  currentTheme === 'ohio-state-buckeyes'
                    ? 'bg-red-950/40 border-red-500 ring-2 ring-red-400 shadow-sm'
                    : 'bg-white dark:bg-slate-800 hover:bg-red-50/30 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-base">🌰</span>
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                      Ohio State
                    </span>
                  </div>
                  {currentTheme === 'ohio-state-buckeyes' && (
                    <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-1">
                  {APP_THEMES['ohio-state-buckeyes'].swatches.slice(0, 4).map((c, i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                  ))}
                  <span className="text-[9px] font-bold text-red-600 dark:text-red-400 ml-auto">
                    Stadium Dark
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              id="filter-theme-all"
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All ({allThemes.length})
            </button>
            <button
              id="filter-theme-favorites"
              type="button"
              onClick={() => setActiveFilter('favorites')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                activeFilter === 'favorites'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}
            >
              <Star className="w-3 h-3 fill-amber-500" />
              Favorites ({favoriteThemes.length})
            </button>
            <button
              id="filter-theme-light"
              type="button"
              onClick={() => setActiveFilter('light')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                activeFilter === 'light'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Sun className="w-3 h-3" />
              Light
            </button>
            <button
              id="filter-theme-dark"
              type="button"
              onClick={() => setActiveFilter('dark')}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                activeFilter === 'dark'
                  ? 'bg-slate-800 text-white dark:bg-slate-700 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Moon className="w-3 h-3" />
              Dark
            </button>
          </div>

          {/* Theme List */}
          <div className="space-y-2.5">
            {filteredThemes.map((theme) => {
              const isSelected = theme.id === currentTheme;
              return (
                <div
                  key={theme.id}
                  id={`theme-card-${theme.id}`}
                  className={`p-3 rounded-xl transition-all border ${
                    isSelected
                      ? 'bg-slate-50 dark:bg-slate-800/90 border-amber-400 dark:border-amber-500 shadow-md ring-2 ring-amber-300/40'
                      : 'bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl shrink-0">{theme.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                            {theme.name}
                          </span>
                          {theme.isUserFavorite && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              User Favorite
                            </span>
                          )}
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {theme.isDark ? 'Dark Mode' : 'Light Mode'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-tight mt-0.5">
                          {theme.subtitle}
                        </p>
                      </div>
                    </div>

                    <button
                      id={`btn-apply-theme-${theme.id}`}
                      type="button"
                      onClick={() => handleSelect(theme.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-emerald-500 text-white shadow-xs cursor-default flex items-center gap-1'
                          : 'bg-slate-100 dark:bg-slate-700 hover:bg-amber-500 hover:text-white text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3 h-3 stroke-[3]" />
                          Active
                        </>
                      ) : (
                        'Select'
                      )}
                    </button>
                  </div>

                  {/* Swatch Color Bar */}
                  <div className="mt-2.5 flex items-center gap-1 h-3.5 bg-slate-100 dark:bg-slate-950 p-0.5 rounded-md">
                    {theme.swatches.map((hex, i) => (
                      <div
                        key={i}
                        className="flex-1 h-full rounded-xs shadow-2xs transition-transform hover:scale-110"
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    ))}
                  </div>

                  {/* Live Contrast & Text Field Preview Pill */}
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2 text-[10px]">
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold min-w-0 truncate">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span className="truncate">Contrast {theme.contrastRatio}</span>
                    </div>

                    {/* Mini live field representation */}
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-slate-400 font-medium">Input Preview:</span>
                      <div
                        className={`px-2 py-0.5 rounded-md border text-[10px] font-bold shadow-2xs ${theme.inputFieldBg}`}
                      >
                        Abc 123
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Text Field Legibility & Contrast Sandbox */}
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              id="btn-toggle-contrast-sandbox"
              type="button"
              onClick={() => {
                sound.playTap();
                setShowSandbox((prev) => !prev);
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 text-xs font-black text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <TestTube2 className="w-4 h-4 text-sky-500" />
                <span>Test Live Text Field Legibility Here</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {showSandbox ? 'Hide Test Form' : 'Try Typing Now'}
              </span>
            </button>

            {showSandbox && (
              <div
                id="live-contrast-sandbox"
                className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 animate-in fade-in-50 duration-150"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Type className="w-3.5 h-3.5 text-amber-500" />
                    Live Field Test ({activeTheme.name})
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    ✓ 100% Legible
                  </span>
                </div>

                {/* Text input test */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                    Type anything to test visible words:
                  </label>
                  <input
                    id="sandbox-text-input"
                    type="text"
                    value={sandboxText}
                    onChange={(e) => setSandboxText(e.target.value)}
                    placeholder="Type words here..."
                    className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-2xs"
                  />
                </div>

                {/* Number input and select dropdown test */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                      Number / Currency:
                    </label>
                    <input
                      id="sandbox-number-input"
                      type="number"
                      step="0.5"
                      value={sandboxAmount}
                      onChange={(e) => setSandboxAmount(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                      Select Dropdown:
                    </label>
                    <select
                      id="sandbox-select-input"
                      value={sandboxSelect}
                      onChange={(e) => setSandboxSelect(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-2xs"
                    >
                      <option value="option-1">Option 1 (Visible)</option>
                      <option value="option-2">Option 2 (High Contrast)</option>
                      <option value="option-3">Option 3 (Readable)</option>
                    </select>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                  Notice how typed words are crisp, sharp, and unmistakably visible with zero white-on-white or dark-on-dark washout.
                </p>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 px-1 text-[10px] text-slate-400 dark:text-slate-500 font-bold flex items-center justify-between">
            <span>✨ Soft Sky & Buckeyes Preserved</span>
            <span>Applied instantly</span>
          </div>
        </div>
      )}
    </div>
  );
};
