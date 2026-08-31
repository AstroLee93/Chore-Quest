import React from 'react';
import { Sparkles, Flame, Trophy, Plus, Award, Calendar, CloudSun, Clock, MapPin } from 'lucide-react';
import { KidProfile, CalendarEvent, FamilyDatabase } from '../types';
import { getKidLevelInfo, getTodayDateString } from '../utils/storage';
import { getSeasonalWeatherForDate, EVENT_CATEGORIES, WEATHER_CONDITIONS } from '../utils/calendar';
import { FamilyGoalBanner } from './FamilyGoalBanner';
import { sound } from '../utils/sound';

interface KidSelectorProps {
  kids: KidProfile[];
  events?: CalendarEvent[];
  database?: FamilyDatabase;
  onSelectKid: (kid: KidProfile) => void;
  onOpenParentPin: () => void;
  onOpenCalendar?: () => void;
  onOpenGoalManager?: () => void;
}

export const KidSelector: React.FC<KidSelectorProps> = ({
  kids,
  events = [],
  database,
  onSelectKid,
  onOpenParentPin,
  onOpenCalendar,
  onOpenGoalManager,
}) => {
  const todayStr = getTodayDateString();
  const todayWeather = getSeasonalWeatherForDate(todayStr);
  const todayEvents = events.filter((e) => e.date === todayStr);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero Welcome */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 text-sky-700 dark:text-sky-300 text-xs sm:text-sm font-black mb-3 border border-sky-200/80 dark:border-sky-800/80 shadow-sm backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-sky-500" />
          Ready for Today's Chores!
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Who is completing chores today?
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-bold mt-2 max-w-lg mx-auto">
          Tap your character below to view your daily missions, check off completed tasks, and earn stars for awesome rewards!
        </p>
      </div>

      {/* Shared Family Goal Progress Banner */}
      {database && (
        <div className="mb-6">
          <FamilyGoalBanner
            database={database}
            onEditGoal={onOpenGoalManager}
          />
        </div>
      )}

      {/* Today's Schedule & Practice Highlights Banner */}
      {todayEvents.length > 0 && onOpenCalendar && (
        <div className="mb-8 p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/60 dark:border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
              📅
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  Today's Family Schedule ({todayEvents.length} {todayEvents.length === 1 ? 'event' : 'events'})
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-sky-100 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-sky-900 dark:text-sky-300 text-xs font-black flex items-center gap-1">
                  <span>{WEATHER_CONDITIONS[todayWeather.condition]?.icon || '☀️'}</span>
                  <span>{todayWeather.tempHigh}°F</span>
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-bold mt-1 flex-wrap">
                {todayEvents.slice(0, 2).map((evt) => (
                  <span key={evt.id} className="flex items-center gap-1 bg-white/70 dark:bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
                    <span>{evt.icon || '⭐'}</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{evt.title}</span>
                    {evt.time && <span className="text-sky-600 dark:text-sky-400 font-medium">({evt.time})</span>}
                  </span>
                ))}
                {todayEvents.length > 2 && (
                  <span className="text-sky-600 dark:text-sky-400 font-extrabold">+{todayEvents.length - 2} more</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              onClick={() => {
                sound.playTap();
                onOpenCalendar();
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-500 text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              Open Family Calendar →
            </button>
          </div>
        </div>
      )}

      {/* Kid Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {kids.map((kid, index) => {
          const levelInfo = getKidLevelInfo(kid.lifetimeStars);
          return (
            <button
              key={kid.id}
              id={`kid-card-${kid.id}`}
              onClick={() => {
                sound.playTap();
                onSelectKid(kid);
              }}
              className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[2.5rem] p-6 sm:p-7 border border-white/60 dark:border-slate-800 shadow-lg hover:shadow-2xl hover:bg-white/95 dark:hover:bg-slate-900/95 transition-all duration-300 text-left flex flex-col justify-between overflow-hidden cursor-pointer active:scale-[0.98]"
            >
              {/* Avatar & Header */}
              <div className="flex items-center gap-4 mb-5">
                <div
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl shadow-md border-2 border-white/80 dark:border-slate-700 shrink-0 transition-transform group-hover:scale-105 duration-200"
                  style={{ backgroundColor: `${kid.color || '#3b82f6'}20` }}
                >
                  {kid.avatar || '⭐'}
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {kid.name}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                      <span>{levelInfo.icon}</span>
                      <span>Level {levelInfo.level}</span>
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block mt-0.5">
                    {levelInfo.title}
                  </span>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 mb-4">
                {/* Star Balance */}
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300 flex items-center justify-center font-black text-base shadow-2xs">
                    ⭐
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">Points</div>
                    <div className="text-base font-black text-slate-800 dark:text-slate-100 leading-tight">
                      {kid.stars}
                    </div>
                  </div>
                </div>

                {/* Streak */}
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-base shadow-2xs">
                    <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">Streak</div>
                    <div className="text-base font-black text-orange-600 dark:text-orange-400 leading-tight">
                      {kid.streakDays} {kid.streakDays === 1 ? 'day' : 'days'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress to next level */}
              <div>
                <div className="flex justify-between text-xs font-black text-slate-600 dark:text-slate-400 mb-1.5">
                  <span>Level Progress</span>
                  <span className="text-sky-600 dark:text-sky-400">{levelInfo.progressPercent}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-500"
                    style={{ width: `${levelInfo.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Tap to enter prompt */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs sm:text-sm font-black text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform">
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
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-black transition-all border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 text-sky-500 stroke-[3]" />
          <span>Parents: Manage kids, add categories, or change chore schedules</span>
        </button>
      </div>
    </div>
  );
};
