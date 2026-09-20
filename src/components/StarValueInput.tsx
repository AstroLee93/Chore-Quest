import React, { useState, useEffect } from 'react';
import { Star, Plus, Minus, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';
import { sound } from '../utils/sound';

export interface StarValueInputProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  label?: string;
  sublabel?: string;
  showPresets?: boolean;
  showSlider?: boolean;
  showEffortGuide?: boolean;
  averageChoreStars?: number;
  compact?: boolean;
  id?: string;
}

interface PresetTier {
  stars: number;
  label: string;
  icon: string;
  category: string;
}

const DEFAULT_PRESETS: PresetTier[] = [
  { stars: 5, label: 'Quick Snack / Treat', icon: '🍪', category: 'Snack' },
  { stars: 10, label: '30m Screen Time', icon: '📱', category: 'Screen' },
  { stars: 15, label: 'Dessert / Small Toy', icon: '🍦', category: 'Treat' },
  { stars: 20, label: 'Stay Up 30m Late', icon: '🌙', category: 'Privilege' },
  { stars: 25, label: 'Pick Dinner Menu', icon: '🍕', category: 'Privilege' },
  { stars: 35, label: 'Robux / Game Pass', icon: '🎮', category: 'Activity' },
  { stars: 50, label: 'Movie Outing / Big Prize', icon: '🎬', category: 'Outing' },
  { stars: 75, label: 'Theme Park / Day Trip', icon: '🎡', category: 'Major' },
  { stars: 100, label: 'Epic Milestone Goal', icon: '🏆', category: 'Milestone' },
];

export const StarValueInput: React.FC<StarValueInputProps> = ({
  value,
  onChange,
  min = 1,
  max = 500,
  label = 'Reward Star Cost',
  sublabel,
  showPresets = true,
  showSlider = true,
  showEffortGuide = true,
  averageChoreStars = 5,
  compact = false,
  id = 'star-value-input',
}) => {
  // Local string buffer to allow seamless backspacing, typing, and editing without jumping/resetting
  const [textBuffer, setTextBuffer] = useState<string>(value.toString());
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Sync with prop when value changes externally and input isn't actively focused
  useEffect(() => {
    if (!isFocused) {
      setTextBuffer(value.toString());
    }
  }, [value, isFocused]);

  const updateValue = (newVal: number, playAudio: boolean = true) => {
    const clamped = Math.max(min, Math.min(max, Math.round(newVal)));
    setTextBuffer(clamped.toString());
    onChange(clamped);
    if (playAudio) {
      sound.playTap();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow empty string so user can clear the field to type a new number
    if (raw === '') {
      setTextBuffer('');
      return;
    }
    // Only allow digits
    const cleaned = raw.replace(/\D/g, '');
    setTextBuffer(cleaned);
    const parsed = parseInt(cleaned, 10);
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (textBuffer === '' || isNaN(parseInt(textBuffer, 10))) {
      updateValue(min, false);
    } else {
      const parsed = parseInt(textBuffer, 10);
      updateValue(parsed, false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      updateValue(value + 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      updateValue(value - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  };

  // Calculate effort estimation
  const choreEstimate = Math.max(1, Math.ceil(value / (averageChoreStars || 5)));
  const getEffortTier = (val: number) => {
    if (val <= 10) return { name: 'Quick Win', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' };
    if (val <= 25) return { name: 'Weekly Goal', color: 'bg-blue-100 text-blue-800 border-blue-300', dot: 'bg-blue-500' };
    if (val <= 50) return { name: 'Big Achievement', color: 'bg-purple-100 text-purple-800 border-purple-300', dot: 'bg-purple-500' };
    return { name: 'Major Milestone', color: 'bg-amber-100 text-amber-900 border-amber-300', dot: 'bg-amber-500' };
  };

  const effortTier = getEffortTier(value);

  if (compact) {
    return (
      <div id={id} className="flex items-center gap-1.5 bg-yellow-50/80 p-1.5 rounded-2xl border-2 border-yellow-300 shadow-2xs">
        <button
          type="button"
          onClick={() => updateValue(value - 5)}
          title="Decrease by 5"
          disabled={value <= min}
          className="w-8 h-8 rounded-xl bg-white hover:bg-yellow-100 text-slate-700 font-black text-xs border border-yellow-300 flex items-center justify-center transition-transform active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          -5
        </button>
        <button
          type="button"
          onClick={() => updateValue(value - 1)}
          title="Decrease by 1"
          disabled={value <= min}
          className="w-8 h-8 rounded-xl bg-white hover:bg-yellow-100 text-slate-800 font-black text-sm border border-yellow-300 flex items-center justify-center transition-transform active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="relative flex items-center justify-center px-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={textBuffer}
            onFocus={() => setIsFocused(true)}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-14 py-1 text-center font-black text-base text-slate-900 bg-white rounded-xl border-2 border-yellow-400 focus:outline-indigo-500 shadow-inner"
          />
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 absolute right-3 pointer-events-none" />
        </div>

        <button
          type="button"
          onClick={() => updateValue(value + 1)}
          title="Increase by 1"
          disabled={value >= max}
          className="w-8 h-8 rounded-xl bg-white hover:bg-yellow-100 text-slate-800 font-black text-sm border border-yellow-300 flex items-center justify-center transition-transform active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => updateValue(value + 5)}
          title="Increase by 5"
          disabled={value >= max}
          className="w-8 h-8 rounded-xl bg-white hover:bg-yellow-100 text-slate-700 font-black text-xs border border-yellow-300 flex items-center justify-center transition-transform active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          +5
        </button>
      </div>
    );
  }

  return (
    <div id={id} className="space-y-3 bg-amber-50/60 dark:bg-slate-800/80 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border-2 border-amber-200 dark:border-slate-700 shadow-2xs">
      {/* Label and Tier Badge */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <label className="block text-xs font-black text-slate-800 dark:text-white uppercase tracking-wide flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>{label}</span>
          </label>
          {sublabel && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">
              {sublabel}
            </p>
          )}
        </div>
        <div className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black border flex items-center gap-1.5 shadow-2xs ${effortTier.color}`}>
          <span className={`w-2 h-2 rounded-full ${effortTier.dot} animate-pulse`} />
          <span>{effortTier.name}</span>
        </div>
      </div>

      {/* Main Stepper and Number Display */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border-2 border-amber-300 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Decrease Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center">
          <button
            type="button"
            onClick={() => updateValue(value - 10)}
            disabled={value <= min}
            title="Minus 10 Stars"
            className="flex-1 sm:flex-none min-h-[44px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs border border-slate-200 dark:border-slate-700 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            -10
          </button>
          <button
            type="button"
            onClick={() => updateValue(value - 5)}
            disabled={value <= min}
            title="Minus 5 Stars"
            className="flex-1 sm:flex-none min-h-[44px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs border border-slate-200 dark:border-slate-700 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            -5
          </button>
          <button
            type="button"
            onClick={() => updateValue(value - 1)}
            disabled={value <= min}
            title="Minus 1 Star"
            className="flex-1 sm:flex-none min-h-[44px] w-11 h-11 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 text-amber-950 dark:text-amber-200 font-black text-base border-2 border-amber-300 dark:border-amber-700 flex items-center justify-center transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-2xs"
          >
            <Minus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Center Input & Star Display */}
        <div className="flex items-center justify-center gap-2">
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={textBuffer}
              onFocus={() => setIsFocused(true)}
              onChange={handleInputChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              aria-label="Star cost"
              className="w-24 sm:w-28 py-2 px-3 text-center font-black text-2xl sm:text-3xl text-slate-900 dark:text-white bg-amber-50/60 dark:bg-slate-800 rounded-2xl border-2 border-amber-400 dark:border-amber-500 focus:outline-indigo-500 shadow-inner"
            />
          </div>
          <div className="flex flex-col items-start justify-center leading-none">
            <span className="text-2xl sm:text-3xl">⭐</span>
            <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 tracking-wider">
              Stars
            </span>
          </div>
        </div>

        {/* Increase Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center">
          <button
            type="button"
            onClick={() => updateValue(value + 1)}
            disabled={value >= max}
            title="Plus 1 Star"
            className="flex-1 sm:flex-none min-h-[44px] w-11 h-11 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base border-2 border-amber-500 flex items-center justify-center transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-2xs"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={() => updateValue(value + 5)}
            disabled={value >= max}
            title="Plus 5 Stars"
            className="flex-1 sm:flex-none min-h-[44px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs border border-slate-200 dark:border-slate-700 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            +5
          </button>
          <button
            type="button"
            onClick={() => updateValue(value + 10)}
            disabled={value >= max}
            title="Plus 10 Stars"
            className="flex-1 sm:flex-none min-h-[44px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs border border-slate-200 dark:border-slate-700 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            +10
          </button>
        </div>
      </div>

      {/* Interactive Range Slider */}
      {showSlider && (
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-[10px] font-black text-slate-400 dark:text-slate-500">
            <span>{min} ⭐ (Min)</span>
            <span className="text-slate-600 dark:text-slate-300 font-bold">Slide to adjust</span>
            <span>{Math.min(max, 100)} ⭐</span>
          </div>
          <input
            type="range"
            min={min}
            max={Math.min(max, 100)}
            step={1}
            value={Math.min(value, 100)}
            onChange={(e) => updateValue(parseInt(e.target.value, 10), false)}
            className="w-full h-2.5 bg-amber-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>
      )}

      {/* Preset Value Pills */}
      {showPresets && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Recommended Quick Tiers</span>
            </span>
            <span className="text-[10px] text-slate-400 font-bold">1-click select</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-1.5">
            {DEFAULT_PRESETS.map((p) => {
              const isSelected = value === p.stars;
              return (
                <button
                  key={p.stars}
                  type="button"
                  onClick={() => updateValue(p.stars)}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 border-amber-500 font-black shadow-xs ring-2 ring-amber-300 scale-[1.02]'
                      : 'bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs">{p.icon}</span>
                    <span className={`text-xs font-black px-1.5 py-0.2 rounded-md ${isSelected ? 'bg-slate-950 text-amber-300' : 'bg-amber-100 text-amber-900 dark:bg-slate-700 dark:text-amber-300'}`}>
                      {p.stars} ⭐
                    </span>
                  </div>
                  <div className="text-[10px] font-bold truncate leading-tight">
                    {p.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Effort Context Guide */}
      {showEffortGuide && (
        <div className="p-2.5 rounded-xl bg-amber-100/70 dark:bg-slate-800/90 border border-amber-300/80 dark:border-slate-700 flex items-start gap-2 text-[11px] text-slate-700 dark:text-slate-300 font-bold">
          <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span>
              At ~{averageChoreStars}⭐ per completed chore, your child will complete about{' '}
              <strong className="text-slate-900 dark:text-white font-black underline decoration-amber-500">
                {choreEstimate} {choreEstimate === 1 ? 'chore' : 'chores'}
              </strong>{' '}
              to claim this reward.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StarValueInput;
