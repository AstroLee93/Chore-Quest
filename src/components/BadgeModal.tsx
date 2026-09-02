import React, { useState } from 'react';
import { Award, Lock, Sparkles, CheckCircle2, ChevronLeft, ChevronRight, X, Flame, Zap, Shield, Target } from 'lucide-react';
import { KidBadgeProgress, KidProfile } from '../types';
import { sound } from '../utils/sound';

interface BadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  kid: KidProfile;
  badges: KidBadgeProgress[];
  initialBadgeId?: string | null;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({
  isOpen,
  onClose,
  kid,
  badges,
  initialBadgeId,
}) => {
  const [selectedBadgeId, setSelectedBadgeId] = useState<string>(
    initialBadgeId || badges[0]?.badge.id || 'badge-first-quest'
  );

  if (!isOpen) return null;

  const currentIndex = badges.findIndex((b) => b.badge.id === selectedBadgeId);
  const currentBadgeProgress = badges[currentIndex >= 0 ? currentIndex : 0];
  const { badge, isUnlocked, progressPercent, progressText } = currentBadgeProgress;

  const handlePrev = () => {
    sound.playTap();
    const prevIndex = (currentIndex - 1 + badges.length) % badges.length;
    setSelectedBadgeId(badges[prevIndex].badge.id);
  };

  const handleNext = () => {
    sound.playTap();
    const nextIndex = (currentIndex + 1) % badges.length;
    setSelectedBadgeId(badges[nextIndex].badge.id);
  };

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  return (
    <div
      id="badge-detail-modal"
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border-4 border-yellow-400/80 text-white rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden flex flex-col items-center text-center animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background */}
        <div
          className="absolute -top-24 -left-24 w-60 h-60 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: badge.color }}
        />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="btn-close-badge-modal"
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="absolute top-4 right-4 w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Kid Mini Badge Summary Header */}
        <div className="flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-black text-amber-300">
          <span>{kid.avatar} {kid.name}'s Trophy Hall</span>
          <span>•</span>
          <span>{unlockedCount} / {badges.length} Badges Unlocked</span>
        </div>

        {/* Main Badge Graphic */}
        <div className="relative my-2">
          <div
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl border-4 flex items-center justify-center text-6xl sm:text-7xl shadow-2xl transition-all duration-300 ${
              isUnlocked
                ? `bg-gradient-to-br ${badge.bgGradient} border-amber-300 shadow-amber-500/40 ring-4 ring-amber-400/30 scale-105`
                : 'bg-slate-800/80 border-slate-700 text-slate-500 filter grayscale opacity-70'
            }`}
          >
            {badge.icon}
          </div>

          {/* Status Badge Float */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
            {isUnlocked ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg border border-emerald-300 animate-bounce">
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                <span>UNLOCKED</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-black text-xs uppercase tracking-wider shadow-lg border border-slate-600">
                <Lock className="w-3.5 h-3.5" />
                <span>LOCKED</span>
              </span>
            )}
          </div>
        </div>

        {/* Badge Title & Category */}
        <div className="mt-4">
          <span
            className="text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: `${badge.color}30`, color: badge.color }}
          >
            {badge.category} Quest
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
            {badge.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm font-semibold text-slate-300 mt-2 max-w-md">
          {badge.description}
        </p>

        {/* Requirement Box */}
        <div className="w-full bg-slate-800/80 border-2 border-slate-700/80 rounded-2xl p-4 my-4 text-left">
          <div className="flex items-center justify-between text-xs font-black text-amber-300 mb-1.5">
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              Unlock Requirement
            </span>
            <span className={isUnlocked ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}>
              {progressText}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-200">
            {badge.requirement}
          </p>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isUnlocked ? 'bg-gradient-to-r from-emerald-400 to-teal-300' : 'bg-gradient-to-r from-amber-400 to-yellow-300'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-black text-slate-400 mt-1">
              <span>{isUnlocked ? 'Requirement Fulfilled! 🎉' : 'In Progress'}</span>
              <span>{progressPercent}% Complete</span>
            </div>
          </div>
        </div>

        {/* Badges Mini Strip Selector */}
        <div className="w-full flex items-center justify-between gap-2 mt-2">
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95 shrink-0"
            title="Previous Badge"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 flex items-center justify-center gap-2 overflow-x-auto py-1">
            {badges.map((b) => (
              <button
                key={b.badge.id}
                onClick={() => {
                  sound.playTap();
                  setSelectedBadgeId(b.badge.id);
                }}
                className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center text-xl transition-all cursor-pointer ${
                  b.badge.id === selectedBadgeId
                    ? 'border-yellow-400 bg-yellow-400/20 ring-2 ring-yellow-400/40 scale-110'
                    : b.isUnlocked
                      ? 'border-white/20 bg-white/10 opacity-80 hover:opacity-100'
                      : 'border-slate-800 bg-slate-900/50 opacity-40 grayscale'
                }`}
                title={b.badge.title}
              >
                <span>{b.badge.icon}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95 shrink-0"
            title="Next Badge"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
