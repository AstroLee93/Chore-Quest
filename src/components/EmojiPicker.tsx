import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Sparkles, X, Check, ChevronDown, Smile } from 'lucide-react';
import { sound } from '../utils/sound';

export interface EmojiOption {
  emoji: string;
  keywords: string[];
  category: 'chores' | 'characters' | 'rewards' | 'activities' | 'symbols' | 'food';
}

export const POPULAR_EMOJIS: EmojiOption[] = [
  // Characters & Animals
  { emoji: '🦁', keywords: ['lion', 'animal', 'cat', 'king', 'safari'], category: 'characters' },
  { emoji: '🦄', keywords: ['unicorn', 'magic', 'horse', 'fantasy'], category: 'characters' },
  { emoji: '🚀', keywords: ['rocket', 'space', 'ship', 'blast', 'star'], category: 'characters' },
  { emoji: '🦊', keywords: ['fox', 'animal', 'cute', 'orange'], category: 'characters' },
  { emoji: '🐼', keywords: ['panda', 'bear', 'animal', 'bamboo'], category: 'characters' },
  { emoji: '🦖', keywords: ['dino', 'dinosaur', 't-rex', 'jurassic'], category: 'characters' },
  { emoji: '🐶', keywords: ['dog', 'puppy', 'pet', 'animal'], category: 'characters' },
  { emoji: '🐱', keywords: ['cat', 'kitten', 'pet', 'meow'], category: 'characters' },
  { emoji: '🐯', keywords: ['tiger', 'cat', 'wild', 'stripes'], category: 'characters' },
  { emoji: '🐨', keywords: ['koala', 'bear', 'australia'], category: 'characters' },
  { emoji: '🐵', keywords: ['monkey', 'ape', 'jungle'], category: 'characters' },
  { emoji: '🐸', keywords: ['frog', 'toad', 'green'], category: 'characters' },
  { emoji: '🐙', keywords: ['octopus', 'ocean', 'sea'], category: 'characters' },
  { emoji: '🐬', keywords: ['dolphin', 'ocean', 'swim', 'sea'], category: 'characters' },
  { emoji: '🦅', keywords: ['eagle', 'bird', 'fly'], category: 'characters' },
  { emoji: '🦉', keywords: ['owl', 'bird', 'wise', 'night'], category: 'characters' },
  { emoji: '🐺', keywords: ['wolf', 'wild', 'pack'], category: 'characters' },
  { emoji: '🦔', keywords: ['hedgehog', 'sonic', 'quill'], category: 'characters' },
  { emoji: '🐲', keywords: ['dragon', 'fantasy', 'monster', 'fire'], category: 'characters' },
  { emoji: '🧙', keywords: ['wizard', 'magic', 'witch', 'sorcerer'], category: 'characters' },
  { emoji: '🦸', keywords: ['superhero', 'hero', 'cape'], category: 'characters' },
  { emoji: '🥷', keywords: ['ninja', 'stealth', 'shadow'], category: 'characters' },
  { emoji: '👸', keywords: ['princess', 'queen', 'crown', 'royalty'], category: 'characters' },
  { emoji: '🤖', keywords: ['robot', 'bot', 'tech', 'ai'], category: 'characters' },
  { emoji: '👾', keywords: ['alien', 'game', 'monster', 'arcade'], category: 'characters' },
  { emoji: '🤠', keywords: ['cowboy', 'hat', 'western'], category: 'characters' },
  { emoji: '👻', keywords: ['ghost', 'spooky', 'halloween'], category: 'characters' },
  { emoji: '👑', keywords: ['crown', 'king', 'queen', 'mvp', 'royal'], category: 'characters' },

  // Chores & Household Routines
  { emoji: '🛏️', keywords: ['bed', 'make bed', 'sleep', 'bedroom', 'blanket'], category: 'chores' },
  { emoji: '🧹', keywords: ['broom', 'sweep', 'clean', 'floor', 'dust'], category: 'chores' },
  { emoji: '🍽️', keywords: ['dishes', 'plates', 'dishwasher', 'table', 'dinner'], category: 'chores' },
  { emoji: '🧺', keywords: ['laundry', 'clothes', 'hamper', 'fold', 'wash'], category: 'chores' },
  { emoji: '🧽', keywords: ['sponge', 'scrub', 'wipe', 'clean', 'sink'], category: 'chores' },
  { emoji: '🧼', keywords: ['soap', 'bath', 'wash', 'clean', 'bubbles'], category: 'chores' },
  { emoji: '🗑️', keywords: ['trash', 'garbage', 'rubbish', 'bin', 'recycle'], category: 'chores' },
  { emoji: '🪴', keywords: ['plant', 'water', 'garden', 'flower', 'leaf'], category: 'chores' },
  { emoji: '📚', keywords: ['books', 'reading', 'homework', 'study', 'school'], category: 'chores' },
  { emoji: '🎒', keywords: ['backpack', 'pack bag', 'school', 'supplies'], category: 'chores' },
  { emoji: '🦷', keywords: ['teeth', 'brush teeth', 'toothbrush', 'dental'], category: 'chores' },
  { emoji: '🚿', keywords: ['shower', 'bath', 'clean', 'water'], category: 'chores' },
  { emoji: '🧸', keywords: ['toys', 'teddy', 'clean room', 'tidy', 'playroom'], category: 'chores' },
  { emoji: '🧦', keywords: ['socks', 'pair socks', 'laundry', 'clothes'], category: 'chores' },
  { emoji: '👟', keywords: ['shoes', 'put away shoes', 'closet', 'boots'], category: 'chores' },
  { emoji: '👕', keywords: ['shirt', 'hang clothes', 'closet', 'dress'], category: 'chores' },
  { emoji: '📦', keywords: ['box', 'organize', 'put away', 'storage'], category: 'chores' },
  { emoji: '🥣', keywords: ['bowl', 'cereal', 'breakfast', 'snack'], category: 'chores' },
  { emoji: '🪥', keywords: ['toothbrush', 'brush', 'teeth', 'hygiene'], category: 'chores' },
  { emoji: '⏰', keywords: ['alarm', 'wake up', 'morning', 'clock'], category: 'chores' },
  { emoji: '🌿', keywords: ['weeds', 'garden', 'yard', 'outside'], category: 'chores' },
  { emoji: '🐾', keywords: ['pet', 'feed pet', 'walk dog', 'litter box'], category: 'chores' },
  { emoji: '🚗', keywords: ['car', 'wash car', 'clean car', 'van'], category: 'chores' },

  // Food & Meals
  { emoji: '🍕', keywords: ['pizza', 'slice', 'dinner', 'party', 'food'], category: 'food' },
  { emoji: '🍔', keywords: ['burger', 'fast food', 'treat', 'dinner'], category: 'food' },
  { emoji: '🌮', keywords: ['taco', 'mexican', 'dinner', 'tuesday'], category: 'food' },
  { emoji: '🍝', keywords: ['spaghetti', 'pasta', 'italian', 'noodles'], category: 'food' },
  { emoji: '🍗', keywords: ['chicken', 'drumstick', 'meat', 'dinner'], category: 'food' },
  { emoji: '🥪', keywords: ['sandwich', 'lunch', 'prepare food', 'pack lunch'], category: 'food' },
  { emoji: '🍎', keywords: ['apple', 'healthy', 'lunchbox', 'snack', 'fruit'], category: 'food' },
  { emoji: '🍣', keywords: ['sushi', 'rice', 'fish', 'japanese'], category: 'food' },
  { emoji: '🥗', keywords: ['salad', 'healthy', 'greens', 'vegetables'], category: 'food' },
  { emoji: '🍲', keywords: ['soup', 'stew', 'pot', 'warm'], category: 'food' },
  { emoji: '🥞', keywords: ['pancakes', 'breakfast', 'syrup', 'fluffy'], category: 'food' },

  // Rewards & Treats
  { emoji: '🎁', keywords: ['gift', 'present', 'box', 'surprise', 'reward'], category: 'rewards' },
  { emoji: '🍦', keywords: ['ice cream', 'treat', 'cone', 'dessert', 'sundae'], category: 'rewards' },
  { emoji: '🎮', keywords: ['video game', 'switch', 'playstation', 'xbox', 'roblox'], category: 'rewards' },
  { emoji: '🎬', keywords: ['movie', 'cinema', 'film', 'theater', 'show'], category: 'rewards' },
  { emoji: '🍟', keywords: ['fries', 'french fries', 'snack', 'food'], category: 'rewards' },
  { emoji: '🍩', keywords: ['donut', 'doughnut', 'sweet', 'bakery'], category: 'rewards' },
  { emoji: '🍪', keywords: ['cookie', 'bake', 'chocolate chip', 'treat'], category: 'rewards' },
  { emoji: '🧁', keywords: ['cupcake', 'cake', 'icing', 'birthday'], category: 'rewards' },
  { emoji: '🍫', keywords: ['chocolate', 'candy', 'bar', 'sweet'], category: 'rewards' },
  { emoji: '🍿', keywords: ['popcorn', 'movie', 'snack', 'cinema'], category: 'rewards' },
  { emoji: '🎡', keywords: ['ferris wheel', 'theme park', 'carnival', 'fair'], category: 'rewards' },
  { emoji: '🎢', keywords: ['roller coaster', 'amusement park', 'rides'], category: 'rewards' },
  { emoji: '🎳', keywords: ['bowling', 'pins', 'strike', 'game', 'arcade'], category: 'rewards' },
  { emoji: '🛹', keywords: ['skateboard', 'park', 'skate', 'ride'], category: 'rewards' },
  { emoji: '🚲', keywords: ['bike', 'bicycle', 'cycling', 'ride'], category: 'rewards' },
  { emoji: '🏕️', keywords: ['camp', 'tent', 'campout', 'outdoor', 'sleepover'], category: 'rewards' },
  { emoji: '📱', keywords: ['phone', 'tablet', 'screen time', 'ipad', 'youtube'], category: 'rewards' },
  { emoji: '🎟️', keywords: ['ticket', 'pass', 'event', 'admission'], category: 'rewards' },
  { emoji: '🏖️', keywords: ['beach', 'sand', 'vacation', 'ocean'], category: 'rewards' },
  { emoji: '🎈', keywords: ['balloon', 'party', 'celebrate', 'fun'], category: 'rewards' },
  { emoji: '💵', keywords: ['money', 'allowance', 'cash', 'dollars', 'pay'], category: 'rewards' },
  { emoji: '🏆', keywords: ['trophy', 'prize', 'winner', 'cup', 'gold'], category: 'rewards' },

  // Sports, Fun & Hobbies
  { emoji: '⚽', keywords: ['soccer', 'football', 'ball', 'sports'], category: 'activities' },
  { emoji: '🏀', keywords: ['basketball', 'hoop', 'sports'], category: 'activities' },
  { emoji: '🏈', keywords: ['football', 'sports', 'pass'], category: 'activities' },
  { emoji: '⚾', keywords: ['baseball', 'bat', 'sports'], category: 'activities' },
  { emoji: '🎾', keywords: ['tennis', 'racket', 'sports'], category: 'activities' },
  { emoji: '🥋', keywords: ['martial arts', 'karate', 'taekwondo', 'judo'], category: 'activities' },
  { emoji: '🏊', keywords: ['swimming', 'pool', 'swim', 'water'], category: 'activities' },
  { emoji: '🧗', keywords: ['climbing', 'rock climbing', 'ninja'], category: 'activities' },
  { emoji: '🎯', keywords: ['target', 'darts', 'laser tag', 'bullseye'], category: 'activities' },
  { emoji: '🎣', keywords: ['fishing', 'fish', 'lake', 'outdoor'], category: 'activities' },
  { emoji: '🧩', keywords: ['puzzle', 'jigsaw', 'brain', 'logic'], category: 'activities' },
  { emoji: '🎲', keywords: ['dice', 'board game', 'tabletop', 'play'], category: 'activities' },
  { emoji: '🎨', keywords: ['art', 'painting', 'draw', 'craft', 'colors'], category: 'activities' },
  { emoji: '🖌️', keywords: ['brush', 'paint', 'canvas', 'art'], category: 'activities' },
  { emoji: '🎸', keywords: ['guitar', 'music', 'instrument', 'rock'], category: 'activities' },
  { emoji: '🎹', keywords: ['piano', 'keyboard', 'music', 'practice'], category: 'activities' },
  { emoji: '🥁', keywords: ['drums', 'music', 'beat'], category: 'activities' },
  { emoji: '🎤', keywords: ['microphone', 'singing', 'karaoke'], category: 'activities' },
  { emoji: '🎧', keywords: ['headphones', 'music', 'listen', 'audio'], category: 'activities' },
  { emoji: '🧪', keywords: ['science', 'experiment', 'chemistry', 'stem'], category: 'activities' },
  { emoji: '💻', keywords: ['computer', 'laptop', 'coding', 'tech'], category: 'activities' },
  { emoji: '🪄', keywords: ['magic wand', 'sparkle', 'spell'], category: 'activities' },

  // Symbols & Celebrations
  { emoji: '⭐', keywords: ['star', 'favorite', 'gold', 'point'], category: 'symbols' },
  { emoji: '🌟', keywords: ['glowing star', 'shine', 'special'], category: 'symbols' },
  { emoji: '✨', keywords: ['sparkles', 'magic', 'clean', 'shine'], category: 'symbols' },
  { emoji: '💥', keywords: ['boom', 'blast', 'energy', 'super'], category: 'symbols' },
  { emoji: '🔥', keywords: ['fire', 'streak', 'flame', 'hot'], category: 'symbols' },
  { emoji: '💖', keywords: ['heart', 'love', 'kindness', 'care'], category: 'symbols' },
  { emoji: '💎', keywords: ['diamond', 'gem', 'jewel', 'crystal'], category: 'symbols' },
  { emoji: '🥇', keywords: ['gold medal', 'first place', '1st', 'winner'], category: 'symbols' },
  { emoji: '🌈', keywords: ['rainbow', 'colorful', 'sky'], category: 'symbols' },
  { emoji: '☀️', keywords: ['sun', 'sunny', 'morning', 'bright'], category: 'symbols' },
  { emoji: '🌙', keywords: ['moon', 'night', 'bedtime', 'sleep'], category: 'symbols' },
  { emoji: '⚡', keywords: ['lightning', 'zap', 'speed', 'fast'], category: 'symbols' },
  { emoji: '🍀', keywords: ['clover', 'luck', 'green'], category: 'symbols' },
  { emoji: '🥳', keywords: ['party face', 'celebrate', 'happy', 'yay'], category: 'symbols' },
  { emoji: '😎', keywords: ['cool', 'sunglasses', 'awesome'], category: 'symbols' },
  { emoji: '🤩', keywords: ['star struck', 'excited', 'wow'], category: 'symbols' },
  { emoji: '💯', keywords: ['100', 'perfect', 'full score', 'score'], category: 'symbols' },
];

export interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  title?: string;
  categoryFilter?: 'chores' | 'characters' | 'rewards' | 'activities' | 'symbols' | 'food' | 'all';
  compact?: boolean;
  inline?: boolean;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  value,
  onChange,
  title = 'Choose Icon',
  categoryFilter = 'all',
  compact = false,
  inline = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'chores' | 'characters' | 'rewards' | 'activities' | 'symbols' | 'food'>(
    categoryFilter === 'all' ? 'all' : categoryFilter
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customEmojiInput, setCustomEmojiInput] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside of popover
  useEffect(() => {
    if (!isOpen || inline) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, inline]);

  const filteredEmojis = useMemo(() => {
    return POPULAR_EMOJIS.filter((item) => {
      if (activeTab !== 'all' && item.category !== activeTab) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchEmoji = item.emoji.includes(q);
        const matchKeywords = item.keywords.some((k) => k.includes(q));
        return matchEmoji || matchKeywords;
      }
      return true;
    });
  }, [activeTab, searchQuery]);

  const handleSelect = (emoji: string) => {
    sound.playTap();
    onChange(emoji);
    if (!inline) {
      setIsOpen(false);
    }
  };

  const handleApplyCustom = () => {
    if (customEmojiInput.trim()) {
      sound.playTap();
      onChange(customEmojiInput.trim());
      setCustomEmojiInput('');
      if (!inline) {
        setIsOpen(false);
      }
    }
  };

  const pickerPanel = (
    <div className="bg-white rounded-2xl border-2 border-yellow-300 p-3.5 shadow-xl space-y-3 w-full max-w-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-yellow-100 border border-yellow-300 flex items-center justify-center text-lg shadow-inner shrink-0">
            {value || '⭐'}
          </div>
          <div>
            <span className="text-xs font-black text-slate-800 block leading-tight">
              {title}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              Select or type any custom emoji
            </span>
          </div>
        </div>

        {!inline && (
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-black scrollbar-none">
        {[
          { id: 'all', label: '🌟 All' },
          { id: 'chores', label: '🧹 Chores' },
          { id: 'rewards', label: '🎁 Rewards' },
          { id: 'food', label: '🍕 Food' },
          { id: 'characters', label: '🦁 Animals' },
          { id: 'activities', label: '⚽ Fun' },
          { id: 'symbols', label: '⭐ Badges' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              sound.playTap();
              setActiveTab(tab.id as any);
            }}
            className={`px-2.5 py-1 rounded-xl whitespace-nowrap cursor-pointer transition-all ${
              activeTab === tab.id
                ? 'bg-yellow-300 text-slate-950 font-black shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search icons (e.g. bed, clean, pet)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-indigo-500"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Emojis Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-7 gap-1.5 max-h-48 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-100">
        {filteredEmojis.map((item, idx) => {
          const isSelected = value === item.emoji;
          return (
            <button
              key={`${item.emoji}-${idx}`}
              type="button"
              onClick={() => handleSelect(item.emoji)}
              title={item.keywords.join(', ')}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl transition-all cursor-pointer select-none relative ${
                isSelected
                  ? 'bg-yellow-300 ring-2 ring-indigo-900 scale-110 shadow-sm z-10'
                  : 'hover:bg-white hover:scale-115 hover:shadow-2xs'
              }`}
            >
              <span>{item.emoji}</span>
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-900 text-yellow-300 rounded-full flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
        {filteredEmojis.length === 0 && (
          <div className="col-span-full py-4 text-center text-xs font-bold text-slate-400">
            No matching icons found. Type custom emoji below!
          </div>
        )}
      </div>

      {/* Quick Custom Emoji Input */}
      <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
        <input
          type="text"
          placeholder="Or paste/type custom emoji..."
          value={customEmojiInput}
          onChange={(e) => setCustomEmojiInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleApplyCustom();
            }
          }}
          className="flex-1 px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-indigo-500"
        />
        <button
          type="button"
          onClick={handleApplyCustom}
          disabled={!customEmojiInput.trim()}
          className="px-3 py-1.5 text-xs font-black bg-indigo-900 text-yellow-300 rounded-xl disabled:opacity-40 hover:bg-indigo-800 cursor-pointer transition-colors shrink-0"
        >
          Apply
        </button>
      </div>
    </div>
  );

  // If inline mode is requested, render directly
  if (inline) {
    return pickerPanel;
  }

  // Default: Clean interactive trigger with floating popover dropdown
  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          sound.playTap();
          setIsOpen(!isOpen);
        }}
        className="w-full h-11 px-3 rounded-2xl border-2 border-slate-200 bg-white hover:border-indigo-400 flex items-center justify-between gap-2 text-left cursor-pointer transition-all shadow-2xs group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-yellow-100 border border-yellow-300 flex items-center justify-center text-lg shadow-inner shrink-0 group-hover:scale-105 transition-transform">
            {value || '⭐'}
          </div>
          <span className="text-xs font-black text-slate-800 truncate">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-black text-indigo-900 bg-yellow-300/80 px-2 py-1 rounded-lg shrink-0 group-hover:bg-yellow-300">
          <span>Change</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Nested Floating Popover Menu */}
      {isOpen && (
        <div className="absolute left-0 sm:right-auto top-full mt-2 z-50 animate-fade-in drop-shadow-2xl">
          {pickerPanel}
        </div>
      )}
    </div>
  );
};
