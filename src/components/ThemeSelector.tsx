import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sparkles, Sun, Moon, Eye } from 'lucide-react';
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
  const activeTheme = APP_THEMES[currentTheme] || APP_THEMES['soft-calm'];

  // Handle outside click to close dropdown
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
      {/* Trigger Button */}
      <button
        id="btn-theme-switcher"
        type="button"
        onClick={() => {
          sound.playTap();
          setIsOpen((prev) => !prev)}
        }
        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-black border transition-all cursor-pointer shadow-2xs active:scale-95 ${
          isOpen
            ? 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-slate-800 dark:text-sky-300 dark:border-sky-700'
            : 'bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700'
        } backdrop-blur-md`}
        title="Change App Theme & Eye Comfort Colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-base leading-none">{activeTheme.icon}</span>
        <span className="hidden sm:inline font-extrabold">{activeTheme.name.split(' ')[0]}</span>
        <Palette className="w-3.5 h-3.5 opacity-60 text-slate-500 dark:text-slate-300" />
      </button>

      {/* Theme Options Dropdown Popover */}
      {isOpen && (
        <div
          id="theme-dropdown-menu"
          className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-2xl z-50 p-2 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-sky-500" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Eye Comfort & Themes
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Glass Look
            </span>
          </div>

          {/* Theme List */}
          <div className="space-y-1">
            {Object.values(APP_THEMES).map((theme) => {
              const isSelected = theme.id === currentTheme;
              return (
                <button
                  key={theme.id}
                  id={`theme-option-${theme.id}`}
                  onClick={() => handleSelect(theme.id)}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50 dark:bg-slate-800/90 border border-sky-200 dark:border-sky-700/80 shadow-xs'
                      : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  {/* Theme icon / swatch */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shadow-2xs shrink-0 border border-black/5 dark:border-white/10"
                    style={{ backgroundColor: `${theme.colorSwatch}25` }}
                  >
                    {theme.icon}
                  </div>

                  {/* Title & Description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-black ${
                          isSelected
                            ? 'text-sky-700 dark:text-sky-300'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {theme.name}
                      </span>
                      {isSelected && (
                        <span className="flex items-center text-sky-600 dark:text-sky-400">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">
                      {theme.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 px-3 py-1 text-[10px] text-slate-400 dark:text-slate-500 font-bold flex items-center justify-between">
            <span>✨ Frosted glass styling included</span>
            <span>Saved automatically</span>
          </div>
        </div>
      )}
    </div>
  );
};
