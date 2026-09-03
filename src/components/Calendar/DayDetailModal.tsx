import React from 'react';
import { X, Plus, Calendar as CalendarIcon, Clock, MapPin, Sparkles, CheckCircle2, Edit3, Trash2, CloudSun, AlertCircle, Users } from 'lucide-react';
import { CalendarEvent, ChoreItem, CustomCalendarCategory, DayWeather, KidProfile } from '../../types';
import { EVENT_CATEGORIES, WEATHER_CONDITIONS, getEventCategoryMeta, getSeasonalWeatherForDate } from '../../utils/calendar';
import { sound } from '../../utils/sound';

interface DayDetailModalProps {
  isOpen: boolean;
  dateStr: string;
  events: CalendarEvent[];
  chores: ChoreItem[];
  kids: KidProfile[];
  customCategories?: CustomCalendarCategory[];
  customWeather?: DayWeather;
  tempUnit?: 'F' | 'C';
  onAddEvent: (dateStr: string) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onEditWeather: (dateStr: string) => void;
  onClose: () => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isOpen,
  dateStr,
  events,
  chores,
  kids,
  customCategories,
  customWeather,
  tempUnit = 'F',
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  onEditWeather,
  onClose,
}) => {
  if (!isOpen || !dateStr) return null;

  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const weather = customWeather || getSeasonalWeatherForDate(dateStr);
  const weatherMeta = WEATHER_CONDITIONS[weather.condition] || WEATHER_CONDITIONS.sunny;

  const isToday = new Date().toISOString().split('T')[0] === dateStr;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-yellow-50 rounded-[2.5rem] p-5 sm:p-7 max-w-xl w-full shadow-2xl border-4 border-yellow-300 max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-yellow-200/80 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-xl sm:text-2xl text-slate-800 italic">
                {formattedDate}
              </h3>
              {isToday && (
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-900 text-yellow-300 text-[11px] font-black uppercase">
                  Today
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-bold">
              Family Schedule & Daily Activities
            </p>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-white border-2 border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 py-4 space-y-4 pr-1">
          {/* Weather Highlight Box */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border-2 border-yellow-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="text-3xl sm:text-4xl p-2 bg-yellow-100 rounded-2xl border border-yellow-200 shrink-0">
                {weatherMeta.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-base text-slate-800">
                    {weatherMeta.label}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-black text-slate-700">
                    {weather.tempHigh}° / {weather.tempLow}° {tempUnit}
                  </span>
                  {weather.source === 'custom' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-bold">
                      Custom
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  {weather.note || weatherMeta.tip}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playTap();
                onEditWeather(dateStr);
              }}
              className="px-3 py-1.5 rounded-xl bg-yellow-100 hover:bg-yellow-200 text-slate-800 border border-yellow-300 text-xs font-black transition-colors cursor-pointer shrink-0"
            >
              Adjust Weather
            </button>
          </div>

          {/* Events & Activities Section */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-indigo-600" />
                Scheduled Events & Activities ({events.length})
              </h4>
              <button
                onClick={() => {
                  sound.playTap();
                  onAddEvent(dateStr);
                }}
                className="px-3 py-1 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Event
              </button>
            </div>

            {events.length === 0 ? (
              <div className="bg-white/80 p-6 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                <p className="text-sm font-bold text-slate-400">
                  No practice, project, or field trip scheduled for this day.
                </p>
                <button
                  onClick={() => {
                    sound.playTap();
                    onAddEvent(dateStr);
                  }}
                  className="mt-2 text-xs font-black text-indigo-700 hover:underline cursor-pointer"
                >
                  + Add sports practice, project due date, or field trip
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {events.map((evt) => {
                  const catMeta = getEventCategoryMeta(evt, customCategories);
                  const assignedKids = evt.assignedKidIds?.includes('all')
                    ? kids
                    : kids.filter((k) => evt.assignedKidIds?.includes(k.id));

                  return (
                    <div
                      key={evt.id}
                      className="bg-white p-3.5 rounded-2xl border-2 border-slate-200 shadow-2xs hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <span className="text-2xl p-1.5 bg-yellow-100 rounded-xl shrink-0">
                            {evt.icon || catMeta.icon}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-sm text-slate-800">
                                {evt.title}
                              </span>
                              {evt.isImportant && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black">
                                  ⭐ Important
                                </span>
                              )}
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 ${catMeta.badgeBg}`}
                              >
                                <span>{catMeta.icon}</span>
                                <span>{catMeta.shortLabel}</span>
                              </span>
                            </div>

                            {/* Activity Type Category Description */}
                            {catMeta.description && (
                              <div className="text-[11px] text-purple-900 font-semibold mt-1.5 bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-200 flex items-start gap-1.5">
                                <span className="text-purple-600 font-black shrink-0">🏷️ {catMeta.shortLabel}:</span>
                                <span>{catMeta.description}</span>
                              </div>
                            )}

                            {/* Time & Location */}
                            <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold mt-1 flex-wrap">
                              {evt.time && (
                                <span className="flex items-center gap-1 text-slate-700 font-bold">
                                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                  {evt.time} {evt.endTime ? `- ${evt.endTime}` : ''}
                                </span>
                              )}
                              {evt.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                                  {evt.location}
                                </span>
                              )}
                            </div>

                            {/* Description */}
                            {evt.description && (
                              <p className="text-xs text-slate-600 font-medium mt-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                                {evt.description}
                              </p>
                            )}

                            {/* Weather Prep */}
                            {evt.weatherNote && (
                              <p className="text-[11px] text-amber-900 font-bold mt-1.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                                ⛅ <strong>Weather Prep:</strong> {evt.weatherNote}
                              </p>
                            )}

                            {/* Kids Involved */}
                            <div className="flex items-center gap-1.5 mt-2">
                              <span className="text-[11px] font-bold text-slate-400">Assigned:</span>
                              <div className="flex items-center gap-1">
                                {evt.assignedKidIds?.includes('all') ? (
                                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-black">
                                    Entire Family
                                  </span>
                                ) : (
                                  assignedKids.map((k) => (
                                    <span
                                      key={k.id}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black text-slate-800 border border-slate-200 bg-white"
                                    >
                                      <span>{k.avatar}</span>
                                      <span>{k.name}</span>
                                    </span>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              sound.playTap();
                              onEditEvent(evt);
                            }}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Event"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              sound.playTap();
                              if (confirm(`Delete "${evt.title}"?`)) {
                                onDeleteEvent(evt.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chores Scheduled for this day */}
          <div>
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide flex items-center gap-1.5 mb-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Scheduled Daily Chores ({chores.length})
            </h4>

            {chores.length === 0 ? (
              <p className="text-xs text-slate-400 font-bold bg-white p-3 rounded-xl border border-slate-200">
                No active chores recurring on this day.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {chores.map((chore) => (
                  <div
                    key={chore.id}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="text-base">{chore.icon}</span>
                      <span className="truncate">{chore.title}</span>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-black text-[10px] border border-yellow-300">
                      +{chore.stars} ⭐
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t-2 border-yellow-200/80 flex justify-end shrink-0">
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="px-6 py-2.5 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs shadow-md transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
