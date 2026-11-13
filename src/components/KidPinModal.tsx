/**
 * KidPinModal — iOS lock-screen passcode sheet.
 * Round keypad with ABC letters, filled/empty dots, the lock-screen shake on a
 * wrong code, hardware-keyboard support, and the default-PIN / forgot hints.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Delete, HelpCircle } from 'lucide-react';
import { KidProfile } from '../types';
import { sound } from '../utils/sound';
import { fireConfetti } from '../utils/confetti';
import { haptic } from '../utils/haptics';

interface KidPinModalProps {
  isOpen: boolean;
  kid: KidProfile | null;
  onSuccess: () => void;
  onClose: () => void;
  onOpenParentPin?: () => void;
}

const KEY_LETTERS: Record<string, string> = {
  '1': '', '2': 'ABC', '3': 'DEF',
  '4': 'GHI', '5': 'JKL', '6': 'MNO',
  '7': 'PQRS', '8': 'TUV', '9': 'WXYZ',
  '0': '',
};

export const KidPinModal: React.FC<KidPinModalProps> = ({
  isOpen,
  kid,
  onSuccess,
  onClose,
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  // Bumped on every wrong attempt so the shake animation replays each time.
  const [shakeKey, setShakeKey] = useState(0);

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
      if (pin.length >= 4) return; // ignore taps while a wrong code is clearing
      sound.playTap();
      haptic('selection');
      setError(false);
      {
        const nextPin = pin + digit;
        setPin(nextPin);

        if (nextPin.length === 4) {
          if (nextPin === correctPin) {
            sound.playChoreComplete();
            haptic('success');
            fireConfetti({
              origin: { y: 0.6 },
              colors: [kid?.color || '#0A84FF', '#34C759', '#5AC8FA', '#FFD60A'],
              mode: 'snappy',
            });
            setTimeout(() => onSuccess(), 100);
          } else {
            sound.playUndo();
            haptic('error');
            setError(true);
            setShakeKey((k) => k + 1);
            setTimeout(() => setPin(''), 450);
          }
        }
      }
    },
    [pin, correctPin, kid?.color, onSuccess]
  );

  const handleDelete = useCallback(() => {
    if (pin.length === 0) return;
    sound.playTap();
    setError(false);
    setPin((prev) => prev.slice(0, -1));
  }, [pin.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleKeyPress(e.key);
      else if (e.key === 'Backspace') handleDelete();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyPress, handleDelete, onClose]);

  if (!isOpen || !kid) return null;

  const isCustomPhoto = kid.avatar && (kid.avatar.startsWith('http') || kid.avatar.startsWith('data:image') || kid.avatar.startsWith('/'));

  // Portal to <body> so no transformed/animated ancestor can trap the fixed overlay.
  return createPortal(
    <div
      id="kid-pin-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kid-pin-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 ios-backdrop animate-fade-in"
      onClick={onClose}
    >
      <div
        className="ios-sheet-detached w-full max-w-[360px] py-[max(1.25rem,3dvh)] px-6 relative max-h-[calc(100dvh-2rem)] overflow-y-auto scrollbar-none flex flex-col items-center text-center animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          id="btn-close-kid-pin-modal"
          onClick={() => { sound.playTap(); onClose(); }}
          className="btn-ios-icon absolute top-4 right-4"
          title="Cancel"
          aria-label="Cancel"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Avatar */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-3xl overflow-hidden mb-2 ring-2 ring-separator shadow-md"
          style={{ backgroundColor: `${kid.color || '#0A84FF'}` }}
        >
          {isCustomPhoto ? (
            <img src={kid.avatar} alt={kid.name} className="w-full h-full object-cover" />
          ) : (
            <span className="leading-none">{kid.avatar || '⭐'}</span>
          )}
        </div>

        <h3 id="kid-pin-title" className="text-[20px] font-semibold text-label tracking-[0.38px]">
          {kid.name}
        </h3>
        <p className="text-[15px] text-label-secondary mt-1 max-w-[220px] leading-snug">
          Enter your passcode
        </p>

        {/* PIN dots */}
        <div
          key={shakeKey}
          className={`flex items-center gap-5 my-[max(1rem,3dvh)] ${shakeKey > 0 ? 'animate-pin-shake' : ''}`}
          role="status"
          aria-label={`${pin.length} of 4 digits entered`}
        >
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`pin-dot ${pin.length > index ? 'filled' : ''} ${error ? 'error' : ''}`}
            />
          ))}
        </div>

        {error && (
          <p role="alert" className="text-[13px] font-medium text-ios-red -mt-2 mb-3">Wrong passcode — try again</p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              id={`btn-kid-pin-${digit}`}
              onClick={() => handleKeyPress(digit)}
              className="numpad-key"
              aria-label={digit}
            >
              <span className="numpad-key-num">{digit}</span>
              {KEY_LETTERS[digit] && <span className="numpad-key-letters">{KEY_LETTERS[digit]}</span>}
            </button>
          ))}

          <div />

          <button
            key="btn-kid-pin-0"
            id="btn-kid-pin-0"
            onClick={() => handleKeyPress('0')}
            className="numpad-key"
            aria-label="0"
          >
            <span className="numpad-key-num">0</span>
          </button>

          <button
            key="btn-kid-pin-delete"
            id="btn-kid-pin-delete"
            onClick={handleDelete}
            className={`numpad-key-size rounded-full flex items-center justify-center text-[17px] text-label cursor-pointer active:opacity-40 transition-opacity ${pin.length === 0 ? 'invisible' : ''}`}
            title="Delete"
            aria-label="Delete last digit"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-separator w-full flex flex-col items-center gap-1.5">
          {isDefaultPin && (
            <p className="text-[13px] text-label-secondary">
              Default passcode is <span className="font-semibold text-label tabular-nums">1234</span>
            </p>
          )}
          <button
            type="button"
            onClick={() => { sound.playTap(); setShowHint((p) => !p); }}
            className="text-ios-blue active:opacity-50 transition-opacity flex items-center gap-1.5 text-[15px] cursor-pointer min-h-[44px]"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Forgot passcode?</span>
          </button>
          {showHint && (
            <p className="text-[13px] text-label-secondary max-w-[260px] leading-relaxed animate-fade-in">
              Ask a parent to reset it from Parent Dashboard → Kids Profiles → Reset PIN.
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
