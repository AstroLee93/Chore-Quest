import React from 'react';
import { Sparkles, Flame, Trophy, Plus, Award } from 'lucide-react';
import { KidProfile } from '../types';
import { getKidLevelInfo } from '../utils/storage';
import { sound } from '../utils/sound';

interface KidSelectorProps {
  kids: KidProfile[];
  onSelectKid: (kid: KidProfile) => void;
  onOpenParentPin: () => void;
}

export const KidSelector: React.FC<KidSelectorProps> = ({
  kids,
  onSelectKid,
  onOpenParentPin,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero Welcome */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-pink-700 text-xs sm:text-sm font-black mb-3 border-2 border-pink-300 shadow-2xs">
          <Sparkles className="w-4 h-4 text-pink-500" />
          Ready for Today's Chores!
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-800 tracking-tight">
          Who is completing chores today?
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-bold mt-2 max-w-lg mx-auto">
          Tap your character below to view your daily missions, check off completed tasks, and earn stars for awesome rewards!
        </p>
      </div>

      {/* Kid Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {kids.map((kid, index) => {
          const levelInfo = getKidLevelInfo(kid.lifetimeStars);
          // Alternate border colors
          const borderClasses = [
            'border-indigo-500 hover:border-orange-400',
            'border-pink-500 hover:border-emerald-500',
            'border-orange-400 hover:border-purple-500',
          ];
          const borderClass = borderClasses[index % borderClasses.length];

          return (
            <button
              key={kid.id}
              id={`kid-card-${kid.id}`}
              onClick={() => {
                sound.playTap();
                onSelectKid(kid);
              }}
              className={`group relative bg-white rounded-[2.5rem] p-6 sm:p-7 border-b-8 border-r-4 ${borderClass} border-t-2 border-l-2 border-t-slate-100 border-l-slate-100 shadow-md hover:shadow-xl transition-all duration-300 text-left flex flex-col justify-between overflow-hidden cursor-pointer active:scale-[0.98]`}
            >
              {/* Avatar & Header */}
              <div className="flex items-center gap-4 mb-5">
                <div
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl shadow-md border-4 border-yellow-200 shrink-0 transition-transform group-hover:scale-105 duration-200"
                  style={{ backgroundColor: `${kid.color || '#3b82f6'}25` }}
                >
                  {kid.avatar || '⭐'}
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {kid.name}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-900 border border-yellow-300 flex items-center gap-1">
                      <span>{levelInfo.icon}</span>
                      <span>Level {levelInfo.level}</span>
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-bold block mt-0.5">
                    {levelInfo.title}
                  </span>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-yellow-50/80 border-2 border-yellow-200 mb-4">
                {/* Star Balance */}
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-black text-base shadow-2xs">
                    ⭐
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 font-bold uppercase">Points</div>
                    <div className="text-base font-black text-pink-600 leading-tight">
                      {kid.stars}
                    </div>
                  </div>
                </div>

                {/* Streak */}
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-base shadow-2xs">
                    <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 font-bold uppercase">Streak</div>
                    <div className="text-base font-black text-orange-600 leading-tight">
                      {kid.streakDays} {kid.streakDays === 1 ? 'day' : 'days'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress to next level */}
              <div>
                <div className="flex justify-between text-xs font-black text-slate-600 mb-1.5">
                  <span>Level Progress</span>
                  <span className="text-indigo-600">{levelInfo.progressPercent}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 border border-slate-200 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                    style={{ width: `${levelInfo.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Tap to enter prompt */}
              <div className="mt-5 pt-3 border-t-2 border-slate-100 flex items-center justify-between text-xs sm:text-sm font-black text-indigo-600 group-hover:translate-x-1 transition-transform">
                <span>View Today's Missions</span>
                <span className="text-base">➔</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Parent setup note */}
      <div className="mt-12 text-center">
        <button
          id="btn-parent-add-kid-prompt"
          onClick={() => {
            sound.playTap();
            onOpenParentPin();
          }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-black transition-all border-2 border-slate-200 shadow-xs cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 text-indigo-600 stroke-[3]" />
          <span>Parents: Manage kids, add categories, or change chore schedules</span>
        </button>
      </div>
    </div>
  );
};
