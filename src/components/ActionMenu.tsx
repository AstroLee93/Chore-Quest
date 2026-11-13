import React, { useState, useRef, useEffect, useId } from 'react';
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
  /** Compact iOS-style round icon trigger (e.g. a "…" glyph). `label` is then used only for accessibility. */
  icon?: React.ReactNode;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  items,
  label = 'Menu',
  buttonClassName,
  menuClassName,
  align = 'right',
  id,
  icon,
}) => {
  const generatedId = useId();
  const buttonId = id || `action-menu-btn-${generatedId}`;
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Calculate whether menu should pop upward or downward based on viewport space
  const checkPosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Typical menu height is ~160-220px. If less than 220px below and more room above, flip upward.
    if (spaceBelow < 220 && spaceAbove > spaceBelow) {
      setOpenUpward(true);
    } else {
      setOpenUpward(false);
    }
  };

  // Close when clicking outside and handle scroll/resize position checks
  useEffect(() => {
    if (!isOpen) return;

    checkPosition();

    const handleClickOutside = (event: PointerEvent) => {
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

    const handleScrollOrResize = () => {
      checkPosition();
    };

    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playTap();
    if (!isOpen) {
      checkPosition();
    }
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
        return 'text-ios-red hover:bg-fill';
      case 'success':
        return 'text-ios-green hover:bg-fill';
      case 'warning':
        return 'text-ios-orange hover:bg-fill';
      case 'primary':
        return 'text-ios-blue hover:bg-fill font-semibold';
      default:
        return 'text-label hover:bg-fill';
    }
  };

  return (
    <div className={`relative inline-block text-left ${isOpen ? 'z-50' : ''}`} ref={menuRef}>
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        onClick={handleToggle}
        className={
          buttonClassName ||
          (icon ? `btn-ios-icon ${isOpen ? 'bg-fill-strong text-label' : ''}` : '') ||
          'min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-extrabold text-xs transition-all shadow-2xs cursor-pointer active:scale-95'
        }
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={label ? `${label} actions menu` : 'Action menu'}
      >
        {icon ?? (
          <>
            <Menu className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{label}</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-labelledby={buttonId}
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${
            openUpward
              ? 'bottom-full mb-1.5 origin-bottom-right'
              : 'top-full mt-1.5 origin-top-right'
          } w-60 max-h-[min(380px,80vh)] overflow-y-auto rounded-[14px] glass-strong py-1 z-50 animate-scale-in divide-y divide-separator ${
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
              className={`w-full min-h-[44px] text-left px-4 py-2.5 text-[15px] tracking-[-0.24px] flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                item.disabled
                  ? 'opacity-40 cursor-not-allowed text-label-tertiary'
                  : getVariantClasses(item.variant)
              }`}
            >
              <span className="truncate">{item.label}</span>
              {item.icon && <span className="w-4 h-4 shrink-0 flex items-center justify-center" aria-hidden="true">{item.icon}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
