import React, { useState } from 'react';
import { X, Sparkles, Check, Smile } from 'lucide-react';
import { KidProfile, FamilyDatabase } from '../types';
import { EmojiPicker } from './EmojiPicker';
import { sound } from '../utils/sound';
import { fireConfetti } from '../utils/confetti';

interface KidAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  kid: KidProfile;
  database?: FamilyDatabase;
  onUpdateDatabase?: (updatedDb: FamilyDatabase) => void;
  onSave?: (updatedKid: KidProfile) => void;
}

const COLOR_OPTIONS = [
  '#f59e0b', // Amber / Gold
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#10b981', // Emerald / Green
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan / Teal
  '#f43f5e', // Rose / Red
  '#fb923c', // Orange
  '#84cc16', // Lime
];

export const KidAvatarModal: React.FC<KidAvatarModalProps> = ({
  isOpen,
  onClose,
  kid,
  database,
  onUpdateDatabase,
  onSave,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(kid.avatar || '🦁');
  const [selectedColor, setSelectedColor] = useState<string>(kid.color || '#3b82f6');
  const [kidName, setKidName] = useState<string>(kid.name);
  const [uiStyle, setUiStyle] = useState<NonNullable<KidProfile['uiStyle']>>(kid.uiStyle || 'balanced');

  if (!isOpen) return null;

  const handleSave = () => {
    sound.playLevelUp();
    fireConfetti({
      origin: { y: 0.6 },
      mode: 'snappy',
    });

    const updatedKid: KidProfile = {
      ...kid,
      name: kidName.trim() || kid.name,
      avatar: selectedAvatar,
      color: selectedColor,
      uiStyle,
    };

    if (onSave) {
      onSave(updatedKid);
    } else if (database && onUpdateDatabase) {
      const updatedKids = database.kids.map((k) => (k.id === kid.id ? updatedKid : k));
      onUpdateDatabase({
        ...database,
        kids: updatedKids,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div className="ios-sheet-detached ios-sheet-light bg-yellow-50 rounded-[2.5rem] p-6 max-w-lg w-full shadow-2xl border-4 border-yellow-300 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-yellow-200">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">🎨</span>
            <div>
              <h3 className="font-black text-xl text-slate-800 italic">
                Customize {kid.name}'s Avatar!
              </h3>
              <p className="text-xs font-bold text-slate-500">
                Choose any character emoji and favorite theme color
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="p-2 rounded-2xl bg-white border border-yellow-200 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Profile Preview Card */}
        <div className="my-4 p-4 rounded-3xl bg-white border-2 border-yellow-200 shadow-sm flex items-center gap-4">
          <div
            style={{ backgroundColor: `${selectedColor}25`, borderColor: selectedColor }}
            className="w-20 h-20 rounded-3xl border-3 flex items-center justify-center text-5xl shrink-0 shadow-inner relative"
          >
            {selectedAvatar}
            <div className="absolute -bottom-1 -right-1 bg-yellow-300 text-slate-950 p-1 rounded-full border border-yellow-500 shadow-xs text-xs">
              ✨
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
              Name
            </label>
            <input
              type="text"
              value={kidName}
              onChange={(e) => setKidName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-black text-slate-800 text-base focus:bg-yellow-50 focus:outline-indigo-500"
            />
            <div className="flex items-center gap-2 mt-1 text-xs font-black text-slate-500">
              <span className="text-amber-500">⭐ {kid.stars} Stars</span>
              <span>•</span>
              <span className="text-pink-600">🔥 {kid.streakDays} Day Streak</span>
            </div>
          </div>
        </div>

        {/* Choose Color */}
        <div className="mb-4">
          <label className="block text-xs font-black text-slate-700 uppercase mb-1.5">
            1. Pick Theme Color:
          </label>
          <div className="flex flex-wrap gap-2.5">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  sound.playTap();
                  setSelectedColor(c);
                }}
                className={`w-10 h-10 rounded-2xl border-2 transition-transform cursor-pointer flex items-center justify-center ${
                  selectedColor === c
                    ? 'scale-115 border-slate-900 ring-2 ring-yellow-400 shadow-md'
                    : 'border-white hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              >
                {selectedColor === c && <Check className="w-5 h-5 text-white stroke-[3]" />}
              </button>
            ))}
          </div>
        </div>

        {/* Emoji Selector */}
        <div className="mb-4">
          <label className="block text-xs font-black text-slate-700 uppercase mb-1.5">
            2. Choose Character Emoji:
          </label>
          <EmojiPicker
            value={selectedAvatar}
            onChange={(emoji) => setSelectedAvatar(emoji)}
            title="Character Avatar"
            categoryFilter="all"
          />
        </div>

        {/* Look & feel (2026 design): how grown-up this kid's screens are */}
        <div className="flex flex-col gap-2 pt-3">
          <span id="kid-style-label" className="text-sm font-semibold text-slate-700">Look &amp; feel</span>
          <div role="radiogroup" aria-labelledby="kid-style-label" className="ios-segmented !max-w-none">
            {([
              ['playful', 'Playful'],
              ['balanced', 'Balanced'],
              ['minimal', 'Minimal'],
            ] as const).map(([value, text]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={uiStyle === value}
                onClick={() => { sound.playTap(); setUiStyle(value); }}
                className="ios-segment"
              >
                {text}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            {uiStyle === 'playful'
              ? 'Bright colours, emoji and big celebrations. Best for younger kids.'
              : uiStyle === 'minimal'
              ? 'Calm and monochrome with plain words. Great for teens.'
              : 'Clean and colourful, with celebrations saved for big moments.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="flex-1 py-3 rounded-2xl border-2 border-slate-200 bg-white font-black text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-yellow-300 font-black text-xs shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Save My Avatar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
