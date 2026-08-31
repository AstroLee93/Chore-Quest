import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Eye } from 'lucide-react';
import { AppThemeId, APP_THEMES } from '../utils/theme';
import { sound } from '../utils/sound';

interface ThemeSelectorProps {
  currentTheme: AppThemeId;
  onThemeChange: (themeId: AppThemeId) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onThemeChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
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
    sound.playTap();
    onThemeChange(themeId);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button with mini palette preview */}
      <button
        id="btn-theme-switcher"
        type="button"
        onClick={() => {
          sound.playTap();
          setIsOpen((prev) => !prev);
        }}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-black border transition-all cursor-pointer shadow-sm active:scale-95 ${
          isOpen
            ? 'bg-white text-slate-900 border-sky-400 ring-2 ring-sky-300/50'
            : 'bg-white/85 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 hover:bg-white dark:hover:bg-slate-700 border-slate-200/80 dark:border-slate-700'
        } backdrop-blur-md`}
        title={`Current Theme: ${activeTheme.name}. Click to switch color palette.`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-base leading-none">{activeTheme.icon}</span>
        
        {/* Swatch color dots in the header button */}
        <div className="flex items-center -space-x-1">
          {activeTheme.swatches.slice(0, 4).map((hex, idx) => (
            <span
              key={idx}
              className="w-3 h-3 rounded-full border border-white dark:border-slate-800 shadow-2xs inline-block"
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>

        <span className="hidden sm:inline font-extrabold">{activeTheme.name}</span>
        <Palette className="w-3.5 h-3.5 opacity-70" />
      </button>

      {/* Theme Options Dropdown Popover */}
      {isOpen && (
        <div
          id="theme-dropdown-menu"
          className="absolute right-0 mt-2 w-84 sm:w-96 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-2.5 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-sky-500" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Select Color Palette
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Visual Swatches
            </span>
          </div>

          {/* Theme List with Visual Color Bars */}
          <div className="space-y-2">
            {Object.values(APP_THEMES).map((theme) => {
              const isSelected = theme.id === currentTheme;
              return (
                <button
                  key={theme.id}
                  id={`theme-option-${theme.id}`}
                  onClick={() => handleSelect(theme.id)}
                  className={`w-full p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-sky-50/90 dark:bg-slate-800/90 border-sky-400 dark:border-sky-500 shadow-xs ring-1 ring-sky-300'
                      : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/60 border-slate-200/60 dark:border-slate-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl shrink-0">{theme.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-black truncate ${
                              isSelected
                                ? 'text-sky-900 dark:text-sky-300'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {theme.name}
                          </span>
                          {theme.isDark && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              Dark
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-tight truncate">
                          {theme.subtitle}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  {/* VISUAL COLOR PALETTE STRIP */}
                  <div className="mt-2 flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 px-1">
                      Palette:
                    </span>
                    <div className="flex-1 flex items-center gap-1 h-5">
                      {theme.swatches.map((hex, i) => (
                        <div
                          key={i}
                          className="flex-1 h-full rounded shadow-2xs border border-black/10 dark:border-white/20 transition-transform hover:scale-105"
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 px-2 py-1 text-[10px] text-slate-400 dark:text-slate-500 font-bold flex items-center justify-between">
            <span>✨ Includes uploaded color palettes</span>
            <span>Saved automatically</span>
          </div>
        </div>
      )}
    </div>
  );
};
