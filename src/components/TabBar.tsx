/**
 * TabBar — the floating bottom tab bar from the 2026 design (mockup `Main`).
 *
 * With a kid active: Today · Calendar · Rewards · Savings.
 * On the family home: Today · Calendar · Dinners · Groceries.
 * Shown on 2026 themes outside parent mode; it only calls existing App handlers.
 */
import React from 'react';
import { CircleCheck, CalendarDays, Gift, Wallet, UtensilsCrossed, ShoppingCart } from 'lucide-react';
import { sound } from '../utils/sound';
import { haptic } from '../utils/haptics';

export type TabId = 'today' | 'calendar' | 'rewards' | 'savings' | 'dinners' | 'groceries';

interface TabBarProps {
  hasActiveKid: boolean;
  active: TabId;
  showSavings?: boolean;
  onSelect: (tab: TabId) => void;
}

const ICONS: Record<TabId, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  today: CircleCheck,
  calendar: CalendarDays,
  rewards: Gift,
  savings: Wallet,
  dinners: UtensilsCrossed,
  groceries: ShoppingCart,
};

const LABELS: Record<TabId, string> = {
  today: 'Today',
  calendar: 'Calendar',
  rewards: 'Rewards',
  savings: 'Savings',
  dinners: 'Dinners',
  groceries: 'Groceries',
};

export const TabBar: React.FC<TabBarProps> = ({ hasActiveKid, active, showSavings = true, onSelect }) => {
  const tabs: TabId[] = hasActiveKid
    ? (['today', 'calendar', 'rewards', ...(showSavings ? ['savings'] : [])] as TabId[])
    : ['today', 'calendar', 'dinners', 'groceries'];

  return (
    <nav
      aria-label="Main"
      className="cq-tabbar fixed z-[55] left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[440px] h-16 rounded-full px-2 grid items-center"
      style={{
        bottom: 'calc(16px + var(--safe-bottom, 0px))',
        gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
      }}
    >
      {tabs.map((id) => {
        const Icon = ICONS[id];
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            id={`tab-${id}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => {
              sound.playTap();
              haptic('selection');
              onSelect(id);
            }}
            className={`flex flex-col items-center justify-center gap-0.5 min-h-[52px] rounded-full text-[11px] cursor-pointer transition-colors ${
              isActive ? 'text-[var(--cq-accent-text)] font-semibold' : 'text-[var(--cq-label-2)] font-medium'
            }`}
          >
            <Icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.1 : 1.8} />
            {LABELS[id]}
          </button>
        );
      })}
    </nav>
  );
};
