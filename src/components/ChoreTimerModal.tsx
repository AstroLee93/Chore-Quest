import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Check, X, Bell, Sparkles, Volume2 } from 'lucide-react';
import { fireConfetti } from '../utils/confetti';
import { ChoreItem } from '../types';
import { sound } from '../utils/sound';

interface ChoreTimerModalProps {
  chore: ChoreItem;
  initialMinutes?: number;
  isOpen: boolean;
  onClose: () => void;
  onCompleteChore: (chore: ChoreItem) => void;
}

export const ChoreTimerModal: React.FC<ChoreTimerModalProps> = ({
  chore,
  initialMinutes = 5,
  isOpen,
  onClose,
  onCompleteChore,
}) => {
  const defaultSeconds = Math.max(1, (chore.timerMinutes || initialMinutes)) * 60;
  const [totalSeconds, setTotalSeconds] = useState<number>(defaultSeconds);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(defaultSeconds);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [hasFinished, setHasFinished] = useState<boolean>(false);
  const halfwayPlayedRef = useRef<boolean>(false);

  // Reset when chore or modal opens
  useEffect(() => {
    if (isOpen) {
      const secs = Math.max(1, (chore.timerMinutes || initialMinutes)) * 60;
      setTotalSeconds(secs);
      setSecondsRemaining(secs);
      setIsActive(false);
      setHasFinished(false);
      halfwayPlayedRef.current = false;
    }
  }, [isOpen, chore, initialMinutes]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          const next = prev - 1;

          // Halfway reminder
          if (!halfwayPlayedRef.current && next === Math.floor(totalSeconds / 2) && totalSeconds >= 60) {
            halfwayPlayedRef.current = true;
            sound.playCoin();
          }

          // Finish reminder
          if (next <= 0) {
            setIsActive(false);
            setHasFinished(true);
            sound.playChoreComplete();
            sound.playFanfare();

            fireConfetti({
              origin: { y: 0.6 },
              mode: 'celebration',
            });
            return 0;
          }
          return next;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsRemaining, totalSeconds]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsRemaining) / totalSeconds) * 100 : 0;

  const handleTogglePlay = () => {
    sound.playTap();
    if (!isActive && hasFinished) {
      // Restart
      setSecondsRemaining(totalSeconds);
      setHasFinished(false);
      halfwayPlayedRef.current = false;
      setIsActive(true);
    } else {
      setIsActive((prev) => !prev);
    }
  };

  const handleReset = () => {
    sound.playTap();
    setIsActive(false);
    setSecondsRemaining(totalSeconds);
    setHasFinished(false);
    halfwayPlayedRef.current = false;
  };

  const handleAddMinute = () => {
    sound.playTap();
    setTotalSeconds((prev) => prev + 60);
    setSecondsRemaining((prev) => prev + 60);
    setHasFinished(false);
  };

  const handleSetPreset = (mins: number) => {
    sound.playTap();
    setIsActive(false);
    setTotalSeconds(mins * 60);
    setSecondsRemaining(mins * 60);
    setHasFinished(false);
    halfwayPlayedRef.current = false;
  };

  // SVG Circular progress stroke calculations
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-4 border-yellow-300 relative text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs mb-2">
            <span className="animate-pulse">⏱️</span> Focus Mission Timer
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl">{chore.icon || '⭐'}</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {chore.title}
            </h2>
          </div>
          {chore.description && (
            <p className="text-xs text-slate-500 mt-1 font-medium max-w-xs mx-auto">
              {chore.description}
            </p>
          )}
        </div>

        {/* Circular Progress & Clock Display */}
        <div className="relative w-56 h-56 mx-auto my-4 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              className="stroke-slate-100"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Active progress circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              className={`transition-all duration-500 ease-linear ${
                hasFinished ? 'stroke-emerald-500' : isActive ? 'stroke-amber-400' : 'stroke-indigo-600'
              }`}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Time digits in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {hasFinished ? (
              <div className="animate-bounce">
                <div className="text-4xl">🎉</div>
                <div className="text-lg font-black text-emerald-600">TIME'S UP!</div>
                <div className="text-xs font-bold text-slate-500">Awesome Job!</div>
              </div>
            ) : (
              <>
                <div className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900 font-mono">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-400 mt-1">
                  {isActive ? 'Mission In Progress' : 'Paused'}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[2, 5, 10, 15, 20].map((mins) => (
            <button
              key={mins}
              onClick={() => handleSetPreset(mins)}
              className={`px-2.5 py-1 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                totalSeconds === mins * 60
                  ? 'bg-indigo-900 text-white border-indigo-950 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>

        {/* Primary Timer Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleReset}
            className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all cursor-pointer"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleTogglePlay}
            className={`flex-1 py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
              hasFinished
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
                : isActive
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30'
            }`}
          >
            {hasFinished ? (
              <>
                <RotateCcw className="w-5 h-5" />
                <span>Restart Timer</span>
              </>
            ) : isActive ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Start Mission</span>
              </>
            )}
          </button>

          <button
            onClick={handleAddMinute}
            className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all cursor-pointer flex items-center gap-1 text-xs"
            title="Add 1 minute"
          >
            <Plus className="w-4 h-4" />
            <span>1m</span>
          </button>
        </div>

        {/* Mark Done Shortcut */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={() => {
              sound.playTap();
              onCompleteChore(chore);
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-sm border-2 border-emerald-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>Complete Chore Now (+{chore.stars} Points)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
