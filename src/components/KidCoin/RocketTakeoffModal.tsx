import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { SavingsGoal, KidProfile } from '../../types';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';
import {
  Rocket,
  Flame,
  RotateCcw,
  X,
  Trophy,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import { GoalIcon } from './GoalIcon';

interface RocketTakeoffModalProps {
  isOpen: boolean;
  goal: SavingsGoal;
  kid?: KidProfile;
  onClose: () => void;
}

type LaunchPhase = 'countdown' | 'launching' | 'orbit' | 'landed';

export const RocketTakeoffModal: React.FC<RocketTakeoffModalProps> = ({
  isOpen,
  goal,
  kid,
  onClose,
}) => {
  const [phase, setPhase] = useState<LaunchPhase>('countdown');
  const [count, setCount] = useState<number>(3);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  // Sequence controller
  const startLaunchSequence = () => {
    setPhase('countdown');
    setCount(3);

    const timer1 = setTimeout(() => {
      setCount(2);
      if (!soundMuted) sound.playTap();
    }, 900);

    const timer2 = setTimeout(() => {
      setCount(1);
      if (!soundMuted) sound.playTap();
    }, 1800);

    const timer3 = setTimeout(() => {
      setCount(0);
      setPhase('launching');
      if (!soundMuted) {
        sound.playRocketLaunchSound();
      }
    }, 2700);

    const timer4 = setTimeout(() => {
      setPhase('orbit');
    }, 4500);

    const timer5 = setTimeout(() => {
      setPhase('landed');
      if (!soundMuted) {
        sound.playVictorySound();
      }
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
        });
        setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 60,
            origin: { x: 0.15, y: 0.6 },
          });
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 60,
            origin: { x: 0.85, y: 0.6 },
          });
        }, 300);
      } catch (err) {
        console.warn('Confetti error:', err);
      }
    }, 6200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  };

  useEffect(() => {
    if (!isOpen) {
      setPhase('countdown');
      setCount(3);
      return;
    }
    const cleanup = startLaunchSequence();
    return cleanup;
  }, [isOpen, soundMuted]);

  if (!isOpen) return null;

  return createPortal(
    <div key="rocket-takeoff-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        key="rocket-takeoff-modal-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border-2 border-indigo-500/50 p-6 shadow-2xl overflow-hidden text-center text-white"
      >
          {/* Header Controls */}
          <div className="flex items-center justify-between relative z-20 mb-2">
            <button
              onClick={() => setSoundMuted(!soundMuted)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title={soundMuted ? 'Unmute' : 'Mute'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-xs font-black tracking-wider uppercase text-indigo-300">
              <Rocket className="w-3.5 h-3.5" />
              <span>Cosmic Liftoff Telemetry</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Center Cosmic Stage */}
          <div className="relative w-full h-72 rounded-2xl bg-black/40 border border-indigo-500/20 my-4 flex flex-col items-center justify-center overflow-hidden">
            {/* Animated Stars */}
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 28 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-white opacity-40 animate-pulse"
                  style={{
                    width: `${(i % 3) + 1}px`,
                    height: `${(i % 3) + 1}px`,
                    top: `${(i * 13) % 90 + 5}%`,
                    left: `${(i * 31) % 90 + 5}%`,
                  }}
                />
              ))}
            </div>

            {/* Phases wrapped in AnimatePresence for clean transitions */}
            <AnimatePresence mode="wait">
              {/* Stage 1: Countdown */}
              {phase === 'countdown' && (
                <motion.div
                  key="countdown"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="flex flex-col items-center justify-center z-10"
                >
                  <div className="text-7xl sm:text-8xl font-black text-amber-400 font-mono tracking-wider drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">
                    {count > 0 ? count : 'GO!'}
                  </div>
                  <p className="text-sm font-bold text-slate-300 mt-3 uppercase tracking-widest animate-pulse">
                    Ignition Sequence Active...
                  </p>
                </motion.div>
              )}

              {/* Stage 2: Launching */}
              {phase === 'launching' && (
                <motion.div
                  key="launching"
                  initial={{ y: 80, opacity: 0 }}
                  animate={{ y: -60, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.8, ease: 'easeIn' }}
                  className="flex flex-col items-center justify-center z-10 relative"
                >
                  {/* Detailed Vertical SVG Rocket */}
                  <div className="w-20 h-28 relative">
                    <svg viewBox="0 0 45 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      {/* Nose Cone pointing UP */}
                      <path d="M22.5 2C18 15 12 28 12 42H33C33 28 27 15 22.5 2Z" fill="#EF4444" />
                      {/* Fuselage */}
                      <path d="M12 42C12 52 13 60 14 64H31C32 60 33 52 33 42H12Z" fill="#F8FAFC" />
                      {/* Porthole */}
                      <circle cx="22.5" cy="34" r="5" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.5" />
                      {/* Side Fins */}
                      <path d="M12 50L3 64H12V50Z" fill="#EF4444" />
                      <path d="M33 50L42 64H33V50Z" fill="#EF4444" />
                    </svg>
                  </div>
                  {/* Exhaust Flame */}
                  <motion.div
                    animate={{
                      scaleY: [1, 1.8, 1.2, 2],
                      opacity: [0.8, 1, 0.7],
                    }}
                    transition={{ repeat: Infinity, duration: 0.15 }}
                    className="w-8 h-20 bg-gradient-to-b from-yellow-300 via-orange-500 to-transparent rounded-b-full blur-xs -mt-1"
                  />
                </motion.div>
              )}

              {/* Stage 3: Orbit */}
              {phase === 'orbit' && (
                <motion.div
                  key="orbit"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center justify-center z-10 p-4"
                >
                  <div className="text-4xl sm:text-5xl animate-spin" style={{ animationDuration: '6s' }}>
                    🪐
                  </div>
                  <h4 className="text-lg font-black text-indigo-300 mt-4">Coasting Through Low Orbit</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Breaking through gravitational boundaries towards destination: {goal.title}
                  </p>
                </motion.div>
              )}

              {/* Stage 4: Landed / Mission Complete */}
              {phase === 'landed' && (
                <motion.div
                  key="landed"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center z-10 p-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center shadow-lg shadow-amber-500/40 text-3xl mb-2">
                    <GoalIcon icon={goal.icon} className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-400 font-black text-lg">
                    <Trophy className="w-5 h-5" />
                    <span>TOUCHDOWN COMPLETE!</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm">
                    Congratulations {kid?.name || 'Commander'}! Your rocket has touched down on {goal.title}!
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>$100% Target Met (${goal.currentSaved.toFixed(2)})</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between gap-3 mt-4">
            <button
              onClick={startLaunchSequence}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay Liftoff</span>
            </button>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-lg shadow-orange-500/30 transition-transform active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Flame className="w-4 h-4" />
              <span>Continue Mission</span>
            </button>
          </div>
        </motion.div>
      </div>,
    document.body
  );
};
