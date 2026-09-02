import React, { useState, useRef, useEffect } from 'react';
import { Menu, ChevronDown } from 'lucide-react';
import { sound } from '../utils/sound';

export interface ActionMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  variant?: 'default' | 'danger' | 'success' | 'warning' | 'primary';
  disabled?: boolean;
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  label?: string;
  buttonClassName?: string;
  menuClassName?: string;
  align?: 'left' | 'right';
  id?: string;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  items,
  label = 'Menu',
  buttonClassName,
  menuClassName,
  align = 'right',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playTap();
    setIsOpen((prev) => !prev);
  };

  const handleItemClick = (item: ActionMenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.disabled) return;
    sound.playTap();
    setIsOpen(false);
    item.onClick(e);
  };

  const getVariantClasses = (variant?: string) => {
    switch (variant) {
      case 'danger':
        return 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-700';
      case 'success':
        return 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700';
      case 'warning':
        return 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-700';
      case 'primary':
        return 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-700 font-black';
      default:
        return 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700';
    }
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        ref={buttonRef}
        id={id || `action-menu-btn-${Math.random().toString(36).substr(2, 6)}`}
        type="button"
        onClick={handleToggle}
        className={
          buttonClassName ||
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-extrabold text-xs transition-all shadow-2xs cursor-pointer active:scale-95'
        }
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={label ? `${label} actions menu` : 'Action menu'}
      >
        <Menu className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>{label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-labelledby={id}
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-1.5 w-52 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
            menuClassName || ''
          }`}
        >
          {items.map((item) => (
            <button
              key={item.id}
              role="menuitem"
              type="button"
              disabled={item.disabled}
              onClick={(e) => handleItemClick(item, e)}
              className={`w-full text-left px-3.5 py-2 text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${
                item.disabled
                  ? 'opacity-40 cursor-not-allowed text-slate-400'
                  : getVariantClasses(item.variant)
              }`}
            >
              {item.icon && <span className="w-4 h-4 shrink-0 flex items-center justify-center">{item.icon}</span>}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
