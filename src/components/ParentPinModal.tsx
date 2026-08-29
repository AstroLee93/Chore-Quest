import React, { useState, useEffect } from 'react';
import { Shield, Lock, X, Delete, KeyRound, AlertCircle } from 'lucide-react';
import { sound } from '../utils/sound';

interface ParentPinModalProps {
  isOpen: boolean;
  correctPin: string;
  isDefaultPin?: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

export const ParentPinModal: React.FC<ParentPinModalProps> = ({
  isOpen,
  correctPin,
  isDefaultPin = true,
  onSuccess,
  onClose,
}) => {
  const [pinInput, setPinInput] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setPinInput('');
      setError(false);
      setShake(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showDefaultHint = isDefaultPin && correctPin === '1234';

  const handleKeyPress = (num: string) => {
    sound.playTap();
    if (pinInput.length < 4) {
      const nextPin = pinInput + num;
      setPinInput(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    sound.playTap();
    setPinInput((prev) => prev.slice(0, -1));
    setError(false);
  };

  const verifyPin = (candidate: string) => {
    if (candidate === correctPin) {
      sound.playUnlock();
      onSuccess();
    } else {
      sound.playSkipNotice();
      setError(true);
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setPinInput('');
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div
        id="parent-pin-dialog"
        className={`bg-yellow-50 w-full max-w-sm rounded-[2.5rem] p-6 sm:p-7 shadow-2xl border-4 border-yellow-300 transition-all ${
          shake ? 'animate-bounce' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md transform -rotate-3">
              <Shield className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-xl tracking-tight">Parent Access</h3>
              <p className="text-xs text-slate-500 font-bold">Enter your 4-digit security PIN</p>
            </div>
          </div>
          <button
            id="btn-close-pin-modal"
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 border-2 border-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* PIN Indicators */}
        <div className="my-6 flex justify-center items-center gap-4">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pinInput.length > idx;
            return (
              <div
                key={idx}
                className={`w-6 h-6 rounded-full transition-all duration-200 border-2 ${
                  isFilled
                    ? error
                      ? 'bg-rose-500 border-rose-600 scale-110 shadow-sm'
                      : 'bg-indigo-600 border-indigo-700 scale-110 shadow-sm'
                    : 'bg-yellow-100 border-yellow-300'
                }`}
              />
            );
          })}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 flex items-center justify-center gap-1.5 text-xs text-rose-600 font-black text-center">
            <AlertCircle className="w-4 h-4" />
            <span>Incorrect PIN. Please try again.</span>
          </div>
        )}

        {/* Default Pin Hint */}
        {showDefaultHint && (
          <div className="text-center text-xs text-slate-600 font-bold mb-4 bg-yellow-100/90 py-1.5 rounded-xl border border-yellow-300">
            Default PIN is <strong className="text-indigo-900 font-mono font-black">1234</strong> (customizable in settings)
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              id={`pin-key-${num}`}
              onClick={() => handleKeyPress(num)}
              className="h-14 rounded-2xl bg-white hover:bg-yellow-100 active:bg-yellow-200 text-slate-800 font-black text-2xl transition-all shadow-2xs border-2 border-yellow-200 flex items-center justify-center active:scale-95 cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            id="pin-key-clear"
            onClick={() => {
              sound.playTap();
              setPinInput('');
              setError(false);
            }}
            className="h-14 rounded-2xl bg-white hover:bg-slate-100 text-slate-500 font-black text-xs tracking-wider uppercase transition-all flex items-center justify-center active:scale-95 border-2 border-slate-200 cursor-pointer"
          >
            Clear
          </button>
          <button
            id="pin-key-0"
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-2xl bg-white hover:bg-yellow-100 active:bg-yellow-200 text-slate-800 font-black text-2xl transition-all shadow-2xs border-2 border-yellow-200 flex items-center justify-center active:scale-95 cursor-pointer"
          >
            0
          </button>
          <button
            id="pin-key-delete"
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-white hover:bg-slate-100 text-slate-600 transition-all flex items-center justify-center active:scale-95 border-2 border-slate-200 cursor-pointer"
          >
            <Delete className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
