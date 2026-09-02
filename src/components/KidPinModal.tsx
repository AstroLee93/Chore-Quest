import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Delete, X, Sparkles, ShieldCheck, HelpCircle } from 'lucide-react';
import { KidProfile } from '../types';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface KidPinModalProps {
  isOpen: boolean;
  kid: KidProfile | null;
  onSuccess: () => void;
  onClose: () => void;
  onOpenParentPin?: () => void;
}

export const KidPinModal: React.FC<KidPinModalProps> = ({
  isOpen,
  kid,
  onSuccess,
  onClose,
  onOpenParentPin,
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Clear state whenever modal opens or kid changes
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
      setShowHint(false);
    }
  }, [isOpen, kid]);

  const correctPin = kid?.pin || '1234';
  const isDefaultPin = !kid?.pin || kid.pin === '1234';

  const handleKeyPress = useCallback(
    (digit: string) => {
      sound.playTap();
      setError(false);
      if (pin.length < 4) {
        const nextPin = pin + digit;
        setPin(nextPin);

        if (nextPin.length === 4) {
          if (nextPin === correctPin) {
            sound.playChoreComplete();
            try {
              confetti({
                particleCount: 40,
                spread: 60,
                origin: { y: 0.6 },
                colors: [kid?.color || '#f59e0b', '#ec4899', '#38bdf8', '#10b981'],
              });
            } catch (e) {
              // ignore
            }
            setTimeout(() => {
              onSuccess();
            }, 100);
          } else {
            sound.playUndo();
            setError(true);
            setTimeout(() => {
              setPin('');
            }, 400);
          }
        }
      }
    },
    [pin, correctPin, kid?.color, onSuccess]
  );

  const handleDelete = useCallback(() => {
    sound.playTap();
    setError(false);
    setPin((prev) => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    sound.playTap();
    setError(false);
    setPin('');
  }, []);

  // Handle hardware keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyPress, handleDelete, onClose]);

  if (!isOpen || !kid) return null;

  return (
    <div
      id="kid-pin-modal"
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border-4 rounded-[2.5rem] p-6 sm:p-8 max-w-sm w-full shadow-2xl relative overflow-hidden flex flex-col items-center text-center animate-scale-up"
        style={{ borderColor: kid.color || '#f59e0b' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background */}
        <div
          className="absolute -top-20 -left-20 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: kid.color || '#f59e0b' }}
        />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="btn-close-kid-pin-modal"
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="absolute top-4 right-4 w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
          title="Cancel"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Kid Avatar Header */}
        <div className="relative mb-3">
          <div
            style={{ backgroundColor: `${kid.color || '#f59e0b'}30`, borderColor: kid.color || '#f59e0b' }}
            className="w-20 h-20 rounded-3xl border-3 flex items-center justify-center text-4xl shadow-lg ring-4 ring-white/10 overflow-hidden"
          >
            {kid.avatar && (kid.avatar.startsWith('http') || kid.avatar.startsWith('data:image') || kid.avatar.startsWith('/')) ? (
              <img src={kid.avatar} alt={kid.name} className="w-full h-full object-cover" />
            ) : (
              <span className="leading-none">{kid.avatar || '⭐'}</span>
            )}
          </div>
        </div>

        <h3 className="text-2xl font-black text-white tracking-tight">
          Welcome, {kid.name}!
        </h3>
        <p className="text-xs font-bold text-slate-300 mt-1 max-w-[240px]">
          Enter your 4-digit secret PIN to open your missions and star bank.
        </p>

        {/* PIN Indicators */}
        <div className={`flex items-center gap-3 my-5 ${error ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black transition-all duration-200 border-2 ${
                  error
                    ? 'border-rose-500 bg-rose-950/80 text-rose-300 ring-2 ring-rose-500/50'
                    : isFilled
                      ? 'border-amber-400 bg-amber-400/20 text-amber-300 ring-4 ring-amber-400/30 scale-105'
                      : 'border-white/20 bg-white/5 text-transparent'
                }`}
              >
                {isFilled ? '⭐' : '•'}
              </div>
            );
          })}
        </div>

        {/* Error message */}
        {error && (
          <div className="text-xs font-black text-rose-400 mb-2 animate-fade-in flex items-center gap-1">
            <span>❌ Incorrect PIN. Try again!</span>
          </div>
        )}

        {/* Touch Keypad */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[260px] my-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              id={`btn-kid-pin-${digit}`}
              onClick={() => handleKeyPress(digit)}
              className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-black text-2xl transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-sm border border-white/10"
            >
              {digit}
            </button>
          ))}

          <button
            id="btn-kid-pin-clear"
            onClick={handleClear}
            className="h-14 rounded-2xl bg-white/5 hover:bg-white/15 active:bg-white/20 text-slate-400 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center cursor-pointer border border-white/10"
          >
            Clear
          </button>

          <button
            id="btn-kid-pin-0"
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-black text-2xl transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-sm border border-white/10"
          >
            0
          </button>

          <button
            id="btn-kid-pin-delete"
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-white/5 hover:bg-white/15 active:bg-white/20 text-slate-300 font-black transition-all active:scale-95 flex items-center justify-center cursor-pointer border border-white/10"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Helper Footer: Forgot PIN / Default PIN hint */}
        <div className="mt-4 pt-3 border-t border-white/10 w-full flex flex-col items-center gap-1.5 text-xs">
          {isDefaultPin && (
            <div className="text-[11px] font-bold text-amber-300/80">
              💡 Tip: Default PIN is <span className="font-mono font-black text-amber-200">1234</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              sound.playTap();
              setShowHint((prev) => !prev);
            }}
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 font-bold text-[11px] cursor-pointer py-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Forgot PIN? Ask a Parent</span>
          </button>

          {showHint && (
            <div className="p-2.5 rounded-xl bg-indigo-950/80 border border-indigo-700/80 text-[11px] text-indigo-200 font-bold max-w-xs animate-fade-in">
              Parents can reset or view any child's PIN in the <span className="font-black text-white">Parent Dashboard &rarr; Kids Profiles &rarr; Reset PIN</span>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
