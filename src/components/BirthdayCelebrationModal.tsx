import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Award, Heart, Volume2, X, Gift, Check, Flame } from 'lucide-react';
import { KidProfile, BirthdayConfig } from '../types';
import { sound } from '../utils/sound';
import { fireConfetti } from '../utils/confetti';
import { getTurningAge } from '../utils/birthday';

interface BirthdayCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  kid: KidProfile;
  starsAwarded: number;
  config: BirthdayConfig;
  isPreview?: boolean;
}

export const BirthdayCelebrationModal: React.FC<BirthdayCelebrationModalProps> = ({
  isOpen,
  onClose,
  kid,
  starsAwarded,
  config,
  isPreview = false,
}) => {
  const [candlesLit, setCandlesLit] = useState(true);
  const [wishMade, setWishMade] = useState(false);
  const [isPlayingSong, setIsPlayingSong] = useState(false);

  const currentYear = new Date().getFullYear();
  const turningAge = getTurningAge(kid.birthdate, currentYear);

  useEffect(() => {
    if (isOpen) {
      setCandlesLit(true);
      setWishMade(false);
      setIsPlayingSong(false);
      // Play celebratory chime upon opening
      sound.playMilestoneFanfare();
      fireConfetti({ origin: { y: 0.6 }, mode: 'celebration' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBlowCandles = () => {
    if (!candlesLit) return;
    sound.playCandleBlow();
    setCandlesLit(false);
    setWishMade(true);
    fireConfetti({ origin: { y: 0.5 }, mode: 'celebration' });
  };

  const handlePlaySong = () => {
    sound.playBirthdaySong();
    setIsPlayingSong(true);
    fireConfetti({ origin: { y: 0.7 }, mode: 'snappy' });
    setTimeout(() => setIsPlayingSong(false), 9500);
  };

  const handleCelebrateAndClose = () => {
    sound.playTap();
    fireConfetti({ origin: { y: 0.6 }, mode: 'snappy' });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
        {/* Floating background decorative balloons */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden select-none">
          <motion.div
            initial={{ y: '100vh', opacity: 0 }}
            animate={{ y: '-20vh', opacity: [0, 0.8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeOut', delay: 0.2 }}
            className="absolute left-6 text-4xl sm:text-5xl"
          >
            🎈
          </motion.div>
          <motion.div
            initial={{ y: '100vh', opacity: 0 }}
            animate={{ y: '-20vh', opacity: [0, 0.8, 0] }}
            transition={{ duration: 8.5, repeat: Infinity, ease: 'easeOut', delay: 1.5 }}
            className="absolute right-10 text-4xl sm:text-5xl"
          >
            🎉
          </motion.div>
          <motion.div
            initial={{ y: '100vh', opacity: 0 }}
            animate={{ y: '-20vh', opacity: [0, 0.7, 0] }}
            transition={{ duration: 6.8, repeat: Infinity, ease: 'easeOut', delay: 3 }}
            className="absolute left-1/4 text-3xl sm:text-4xl"
          >
            🎂
          </motion.div>
          <motion.div
            initial={{ y: '100vh', opacity: 0 }}
            animate={{ y: '-20vh', opacity: [0, 0.8, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeOut', delay: 2.2 }}
            className="absolute right-1/4 text-4xl sm:text-5xl"
          >
            ⭐
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-amber-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 rounded-3xl border-4 border-amber-300 dark:border-amber-600 shadow-2xl overflow-hidden my-auto"
        >
          {/* Top Decorative Banner */}
          <div className="relative bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-600 p-4 sm:p-5 text-white text-center shadow-md">
            <button
              onClick={handleCelebrateAndClose}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
              title="Close Celebration"
            >
              <X className="w-5 h-5" />
            </button>

            {isPreview && (
              <div className="inline-block bg-slate-900/80 text-amber-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1">
                Parent Preview Mode
              </div>
            )}

            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-2xl sm:text-3xl animate-bounce">👑</span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-xs">
                HAPPY BIRTHDAY!
              </h2>
              <span className="text-2xl sm:text-3xl animate-bounce">🎈</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white/95">
              Today is all about celebrating you, <span className="underline decoration-wavy decoration-amber-300">{kid.name}</span>!
            </p>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Center Profile Badge with Crown */}
            <div className="text-center relative">
              <div className="relative inline-block">
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-4xl sm:text-5xl shadow-xl border-4 border-amber-400 mx-auto"
                  style={{ backgroundColor: kid.color || '#f59e0b' }}
                >
                  {kid.avatar}
                </div>
                {/* Crown overlay */}
                <div className="absolute -top-4 -right-1 text-3xl sm:text-4xl filter drop-shadow-md animate-pulse select-none">
                  👑
                </div>
                {/* Sparkle badge */}
                <div className="absolute -bottom-1 -left-1 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-md">
                  <Sparkles className="w-4 h-4 fill-amber-950" />
                </div>
              </div>

              <div className="mt-2.5">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {kid.name}
                </h3>
                {turningAge && (
                  <div className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-extrabold px-3 py-1 rounded-full mt-1">
                    <span>🎂</span>
                    <span>Turning {turningAge} Years Old Today!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Birthday Cake & Make A Wish */}
            <div className="bg-gradient-to-br from-pink-50 to-amber-50 dark:from-slate-800/80 dark:to-slate-800/40 rounded-2xl border-2 border-pink-200 dark:border-slate-700 p-4 text-center shadow-xs">
              <div className="text-xs font-black uppercase tracking-wider text-pink-700 dark:text-pink-300 mb-2 flex items-center justify-center gap-1.5">
                <Flame className={`w-4 h-4 ${candlesLit ? 'text-amber-500 fill-amber-500 animate-pulse' : 'text-slate-400'}`} />
                <span>Make a Birthday Wish!</span>
              </div>

              {/* Cake graphic with interactive candle clicking */}
              <div
                onClick={handleBlowCandles}
                className="relative inline-block cursor-pointer select-none group py-2"
                title="Tap cake to blow out candles!"
              >
                {/* Candles */}
                <div className="flex justify-center items-end gap-2 mb-1">
                  {[0, 1, 2, 3].map((idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      {candlesLit ? (
                        <motion.div
                          animate={{ scale: [1, 1.25, 0.95, 1], rotate: [0, 2, -2, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8 + idx * 0.2 }}
                          className="w-3 h-4 bg-gradient-to-t from-amber-400 via-orange-400 to-yellow-200 rounded-full shadow-lg shadow-amber-300/60"
                        />
                      ) : (
                        <motion.span
                          initial={{ opacity: 1, y: 0 }}
                          animate={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.9 }}
                          className="text-xs"
                        >
                          💨
                        </motion.span>
                      )}
                      <div className="w-1.5 h-4 bg-gradient-to-b from-indigo-300 to-indigo-500 rounded-t-xs" />
                    </div>
                  ))}
                </div>

                {/* Cake Layers */}
                <div className="w-28 sm:w-32 mx-auto">
                  {/* Top Layer */}
                  <div className="h-4 bg-pink-300 dark:bg-pink-500 rounded-t-xl border border-pink-400 flex items-center justify-center text-[10px]">
                    🍓 🍓 🍓
                  </div>
                  {/* Middle Frosting */}
                  <div className="h-2 bg-yellow-200 dark:bg-yellow-300 -my-0.5" />
                  {/* Base Layer */}
                  <div className="h-6 bg-amber-200 dark:bg-amber-400 rounded-b-xl border border-amber-300 flex items-center justify-around px-2 text-[10px]">
                    🧁 ✨ 🧁
                  </div>
                  {/* Cake Plate */}
                  <div className="w-32 sm:w-36 -ml-2 sm:-ml-2 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full shadow-xs" />
                </div>

                <div className="mt-2.5">
                  {candlesLit ? (
                    <button
                      type="button"
                      onClick={handleBlowCandles}
                      className="px-3.5 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 active:scale-95 text-white font-black text-xs shadow-xs transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Blow Out Candles! 🎂💨</span>
                    </button>
                  ) : (
                    <div className="text-emerald-700 dark:text-emerald-300 font-black text-xs inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-300">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Wish Made! May all your dreams come true! 🌟</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Special Parent Birthday Note */}
            {kid.birthdayWish && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-100/70 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/80 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 dark:text-amber-200 uppercase mb-1">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>A Special Note From Mom & Dad:</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 italic">
                  "{kid.birthdayWish}"
                </p>
              </div>
            )}

            {/* Birthday Star Vault Reward Gift */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 text-slate-950 shadow-md border-2 border-amber-200">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-xl bg-white/90 flex items-center justify-center text-2xl shadow-inner shrink-0">
                    ⭐
                  </div>
                  <div>
                    <div className="text-[10px] sm:text-xs font-black uppercase text-amber-950/80">
                      Official Birthday Vault Gift
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-slate-950">
                      +{starsAwarded} Bonus Stars!
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] font-bold text-amber-950 bg-white/70 px-2 py-0.5 rounded-lg border border-amber-300">
                    Deposit Complete ✓
                  </div>
                </div>
              </div>
              <p className="text-[11px] font-bold text-amber-950/90 mt-2">
                Your birthday stars have been automatically credited to your vault to save for your goals or spend on rewards!
              </p>
            </div>

            {/* Birthday VIP Perks for the Day */}
            <div className="space-y-2">
              <div className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-indigo-500" />
                <span>Your Birthday VIP Perks Today:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {config.doubleStarBonusDay && (
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-start gap-2">
                    <span className="text-lg">⚡</span>
                    <div>
                      <strong className="block text-indigo-950 dark:text-indigo-200 font-black">
                        Double Star Missions
                      </strong>
                      <span className="text-indigo-800/80 dark:text-indigo-300 text-[11px] font-bold">
                        Chores completed today earn 2x bonus stars!
                      </span>
                    </div>
                  </div>
                )}

                {config.freeChorePassEnabled && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2">
                    <span className="text-lg">🎟️</span>
                    <div>
                      <strong className="block text-emerald-950 dark:text-emerald-200 font-black">
                        1 Free Chore Skip Pass
                      </strong>
                      <span className="text-emerald-800/80 dark:text-emerald-300 text-[11px] font-bold">
                        Skip 1 chore today with parent birthday blessing!
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-2.5 rounded-xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 flex items-start gap-2">
                  <span className="text-lg">👑</span>
                  <div>
                    <strong className="block text-pink-950 dark:text-pink-200 font-black">
                      Royal Birthday Crown
                    </strong>
                    <span className="text-pink-800/80 dark:text-pink-300 text-[11px] font-bold">
                      Your avatar wears the gold birthday crown all day!
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-2">
                  <span className="text-lg">🍿</span>
                  <div>
                    <strong className="block text-amber-950 dark:text-amber-200 font-black">
                      Birthday Treat Pass
                    </strong>
                    <span className="text-amber-800/80 dark:text-amber-300 text-[11px] font-bold">
                      Pick any snack or treat from the pantry!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
            <button
              type="button"
              onClick={handlePlaySong}
              disabled={isPlayingSong}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 font-black text-xs inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Volume2 className={`w-3.5 h-3.5 text-pink-500 ${isPlayingSong ? 'animate-spin' : ''}`} />
              <span>{isPlayingSong ? 'Playing Song 🎶...' : 'Play Birthday Song 🎵'}</span>
            </button>

            <button
              type="button"
              onClick={handleCelebrateAndClose}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer ml-auto inline-flex items-center gap-1.5"
            >
              <span>Celebrate & Have Fun! 🎉</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
