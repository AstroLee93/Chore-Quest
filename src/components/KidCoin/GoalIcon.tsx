import React from 'react';
import {
  Gamepad2,
  Tv,
  Boxes,
  Headphones,
  Bike,
  Tablet,
  Coins,
  Sparkles,
  Rocket,
  Trophy,
  Star,
  Gift,
  Heart,
  Palette,
  Camera,
  Music,
  ShoppingBag,
  LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Gamepad2,
  Tv,
  Boxes,
  Headphones,
  Bike,
  Tablet,
  Coins,
  Sparkles,
  Rocket,
  Trophy,
  Star,
  Gift,
  Heart,
  Palette,
  Camera,
  Music,
  ShoppingBag,
};

interface GoalIconProps {
  icon?: string;
  className?: string;
  fallback?: string;
}

export const GoalIcon: React.FC<GoalIconProps> = ({ icon, className = 'w-5 h-5', fallback = '🎯' }) => {
  if (!icon) {
    return <span className="select-none text-xl leading-none">{fallback}</span>;
  }

  // If the icon is an emoji (single or multiple unicode chars)
  const isEmoji = /\p{Extended_Pictographic}/u.test(icon);
  if (isEmoji) {
    return <span className="select-none text-xl leading-none">{icon}</span>;
  }

  const Component = ICON_MAP[icon];
  if (Component) {
    return <Component className={className} />;
  }

  return <span className="select-none text-xl leading-none">{icon || fallback}</span>;
};
