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
  Video,
  Laptop,
  Smartphone,
  Watch,
  Monitor,
  Music,
  ShoppingBag,
  Shirt,
  Footprints,
  Plane,
  Car,
  BookOpen,
  Dumbbell,
  Smile,
  Flame,
  Zap,
  Package,
  Target,
  Shield,
  Tag,
  Mic,
  Radio,
  LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  // Direct PascalCase Lucide matches
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
  Video,
  Laptop,
  Smartphone,
  Watch,
  Monitor,
  Music,
  ShoppingBag,
  Shirt,
  Footprints,
  Plane,
  Car,
  BookOpen,
  Dumbbell,
  Smile,
  Flame,
  Zap,
  Package,
  Target,
  Shield,
  Tag,
  Mic,
  Radio,
};

// Aliases mapping lowercase / alternate strings to Lucide components
const ALIAS_MAP: Record<string, React.FC<LucideProps>> = {
  laptop: Laptop,
  pc: Laptop,
  computer: Laptop,
  macbook: Laptop,
  camera: Camera,
  photo: Camera,
  dslr: Camera,
  webcam: Camera,
  video: Video,
  vlog: Video,
  camcorder: Video,
  actioncam: Video,
  gopro: Video,
  osmo: Camera,
  dji: Camera,
  phone: Smartphone,
  smartphone: Smartphone,
  iphone: Smartphone,
  tablet: Tablet,
  ipad: Tablet,
  watch: Watch,
  smartwatch: Watch,
  tv: Tv,
  television: Tv,
  monitor: Monitor,
  display: Monitor,
  gamepad: Gamepad2,
  gamepad2: Gamepad2,
  gaming: Gamepad2,
  console: Gamepad2,
  nintendo: Gamepad2,
  playstation: Gamepad2,
  xbox: Gamepad2,
  headphone: Headphones,
  headphones: Headphones,
  earbud: Headphones,
  airpod: Headphones,
  audio: Headphones,
  bike: Bike,
  bicycle: Bike,
  scooter: Bike,
  box: Boxes,
  boxes: Boxes,
  toy: Boxes,
  toys: Boxes,
  lego: Boxes,
  music: Music,
  rocket: Rocket,
  space: Rocket,
  drone: Rocket,
  dronecam: Camera,
  shopping: ShoppingBag,
  shoppingbag: ShoppingBag,
  bag: ShoppingBag,
  clothes: Shirt,
  clothing: Shirt,
  shirt: Shirt,
  shoes: Footprints,
  sneakers: Footprints,
  footprints: Footprints,
  trophy: Trophy,
  star: Star,
  gift: Gift,
  heart: Heart,
  palette: Palette,
  art: Palette,
  coin: Coins,
  coins: Coins,
  car: Car,
  plane: Plane,
  book: BookOpen,
  books: BookOpen,
  fitness: Dumbbell,
  gym: Dumbbell,
  workout: Dumbbell,
  fire: Flame,
  flame: Flame,
  zap: Zap,
  energy: Zap,
};

interface GoalIconProps {
  icon?: string;
  className?: string;
  fallback?: string;
}

export const GoalIcon: React.FC<GoalIconProps> = ({ icon, className = 'w-5 h-5', fallback = '🎯' }) => {
  if (!icon || !icon.trim()) {
    return <span className="select-none text-xl leading-none">{fallback}</span>;
  }

  const trimmed = icon.trim();

  // If the icon is an emoji (e.g. 📷, 📸, 💻, 🎮, 🎯, 🚀, 🧸)
  // Handles single emojis, ZWJ sequences, variation selectors (\uFE0F), and unicode pictographs
  const hasLetters = /[a-zA-Z]/.test(trimmed);
  const containsPictographic = /\p{Extended_Pictographic}/u.test(trimmed) || /\p{Emoji}/u.test(trimmed);

  if (!hasLetters && containsPictographic) {
    return <span className="select-none text-xl leading-none inline-flex items-center justify-center">{trimmed}</span>;
  }

  // Check exact Lucide key in ICON_MAP
  const DirectComponent = ICON_MAP[trimmed];
  if (DirectComponent) {
    return <DirectComponent className={className} />;
  }

  // Check normalized lowercase alias
  const normalized = trimmed.toLowerCase();
  const AliasComponent = ALIAS_MAP[normalized] || ICON_MAP[normalized];
  if (AliasComponent) {
    return <AliasComponent className={className} />;
  }

  // If the icon string contains multiple words or letters that could not be resolved,
  // NEVER render raw multi-character text (like "Laptop" or "Undefined") which breaks icon boxes!
  // Instead, render the fallback emoji or Target icon.
  if (/^\p{Extended_Pictographic}+$/u.test(fallback)) {
    return <span className="select-none text-xl leading-none">{fallback}</span>;
  }

  return <Target className={className} />;
};

