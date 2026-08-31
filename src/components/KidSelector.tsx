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
        <div className="mb-8 p-4 sm:p-5 rounded-3xl bg-white border-2 border-yellow-300 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-900 text-yellow-300 flex items-center justify-center text-2xl shadow-md shrink-0">
              📅
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-slate-900 text-base">
                  Today's Family Schedule ({todayEvents.length} {todayEvents.length === 1 ? 'event' : 'events'})
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-yellow-100 border border-yellow-300 text-yellow-900 text-xs font-black flex items-center gap-1">
                  <span>{WEATHER_CONDITIONS[todayWeather.condition]?.icon || '☀️'}</span>
                  <span>{todayWeather.tempHigh}°F</span>
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600 font-bold mt-1 flex-wrap">
                {todayEvents.slice(0, 2).map((evt) => (
                  <span key={evt.id} className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-200">
                    <span>{evt.icon || '⭐'}</span>
                    <span className="font-extrabold text-slate-900">{evt.title}</span>
                    {evt.time && <span className="text-indigo-600 font-medium">({evt.time})</span>}
                  </span>
                ))}
                {todayEvents.length > 2 && (
                  <span className="text-indigo-700 font-extrabold">+{todayEvents.length - 2} more</span>
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
              className="px-4 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
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
