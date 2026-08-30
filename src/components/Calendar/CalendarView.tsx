import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Users,
  CloudSun,
  Layers,
  Sparkles,
  Clock,
  MapPin,
  X,
  CalendarDays,
  ListFilter,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  Check,
} from 'lucide-react';
import {
  CalendarEvent,
  CalendarEventCategory,
  ChoreItem,
  DayWeather,
  FamilyDatabase,
  KidProfile,
} from '../../types';
import {
  EVENT_CATEGORIES,
  WEATHER_CONDITIONS,
  getSeasonalWeatherForDate,
} from '../../utils/calendar';
import { isChoreScheduledForDate, getTodayDateString } from '../../utils/storage';
import { sound } from '../../utils/sound';
import { CalendarEventModal } from './CalendarEventModal';
import { DayDetailModal } from './DayDetailModal';
import { WeatherModal } from './WeatherModal';

interface CalendarViewProps {
  database: FamilyDatabase;
  activeKid: KidProfile | null;
  onUpdateDatabase: (updated: FamilyDatabase) => void;
  onClose: () => void;
}

type CalendarViewMode = 'month' | 'year' | 'agenda';
type AgendaFilter = 'upcoming' | 'all' | 'past';

export const CalendarView: React.FC<CalendarViewProps> = ({
  database,
  activeKid,
  onUpdateDatabase,
  onClose,
}) => {
  const todayStr = getTodayDateString();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0 = Jan, 11 = Dec
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [agendaFilter, setAgendaFilter] = useState<AgendaFilter>('upcoming');

  // Filters
  const [selectedKidId, setSelectedKidId] = useState<string>(activeKid ? activeKid.id : 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals state
  const [selectedDateForDetail, setSelectedDateForDetail] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Partial<CalendarEvent> | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
  const [dateForNewEvent, setDateForNewEvent] = useState<string | undefined>(undefined);
  const [weatherModalDate, setWeatherModalDate] = useState<string | null>(null);

  const events = database.events || [];
  const weatherMap = database.weatherForecasts || {};
  const tempUnit = database.settings.tempUnit || 'F';

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEventModalOpen) {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        } else if (weatherModalDate) {
          setWeatherModalDate(null);
        } else if (selectedDateForDetail) {
          setSelectedDateForDetail(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEventModalOpen, selectedDateForDetail, weatherModalDate, onClose]);

  // Navigation handlers
  const handlePrevMonth = () => {
    sound.playTap();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    sound.playTap();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    sound.playTap();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  // Event CRUD
  const handleSaveEvent = (savedEvent: CalendarEvent) => {
    const existingIndex = events.findIndex((e) => e.id === savedEvent.id);
    let nextEvents: CalendarEvent[];
    if (existingIndex >= 0) {
      nextEvents = [...events];
      nextEvents[existingIndex] = savedEvent;
    } else {
      nextEvents = [...events, savedEvent];
    }
    onUpdateDatabase({
      ...database,
      events: nextEvents,
    });
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    const nextEvents = events.filter((e) => e.id !== eventId);
    onUpdateDatabase({
      ...database,
      events: nextEvents,
    });
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleSaveWeather = (dateStr: string, weather: DayWeather) => {
    const nextForecasts = {
      ...weatherMap,
      [dateStr]: weather,
    };
    onUpdateDatabase({
      ...database,
      weatherForecasts: nextForecasts,
    });
    setWeatherModalDate(null);
  };

  const handleResetWeather = (dateStr: string) => {
    const nextForecasts = { ...weatherMap };
    delete nextForecasts[dateStr];
    onUpdateDatabase({
      ...database,
      weatherForecasts: nextForecasts,
    });
    setWeatherModalDate(null);
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // Kid filter
      if (selectedKidId !== 'all') {
        const matchesKid =
          evt.assignedKidIds?.includes('all') ||
          evt.assignedKidIds?.includes(selectedKidId);
        if (!matchesKid) return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && evt.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [events, selectedKidId, selectedCategory]);

  // Calendar Grid Calculation for Month View
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon ...

    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // 1. Previous month trailing days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum,
        isCurrentMonth: false,
        dateObj: new Date(prevY, prevM, dayNum),
      });
    }

    // 2. Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: true,
        dateObj: new Date(currentYear, currentMonth, i),
      });
    }

    // 3. Next month leading days to fill up full 35 or 42 grid cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: false,
        dateObj: new Date(nextY, nextM, i),
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Agenda filtered list
  const agendaEvents = useMemo(() => {
    const list = [...filteredEvents].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.time || '').localeCompare(b.time || '');
    });

    if (agendaFilter === 'upcoming') {
      return list.filter((e) => e.date >= todayStr);
    }
    if (agendaFilter === 'past') {
      return list.filter((e) => e.date < todayStr).reverse();
    }
    return list;
  }, [filteredEvents, agendaFilter, todayStr]);

  const upcomingCount = filteredEvents.filter((e) => e.date >= todayStr).length;
  const pastCount = filteredEvents.filter((e) => e.date < todayStr).length;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-xl animate-fade-in"
    >
      {/* Frosted Glass Main Modal Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-7xl max-h-[94vh] overflow-y-auto rounded-[2.5rem] p-4 sm:p-6 border-4 border-yellow-300/80 bg-yellow-50/90 backdrop-blur-2xl shadow-2xl flex flex-col my-auto transition-all"
      >
        {/* Top Header Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b-2 border-yellow-200/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-900 text-yellow-300 rounded-2xl flex items-center justify-center text-2xl shadow-md shrink-0 ring-2 ring-yellow-400/40">
              📅
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 italic">
                  Family Activity Calendar
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-yellow-200/90 border border-yellow-300 text-yellow-900 text-xs font-black shadow-2xs">
                  🪟 Glass View
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-100/90 border border-cyan-300 text-cyan-900 text-xs font-bold shadow-2xs">
                  <CloudSun className="w-3.5 h-3.5 text-cyan-600" />
                  Weather Forecasts
                </span>
              </div>
              <p className="text-xs text-slate-500 font-bold">
                Track sports practices, school projects, milestones & daily weather • Completed days greyed out
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full lg:w-auto justify-end">
            {/* View Mode Toggle: Month | Year Matrix | Agenda */}
            <div className="bg-white/90 backdrop-blur-md p-1 rounded-2xl border-2 border-slate-200 flex items-center gap-1 shadow-2xs">
              <button
                id="btn-calendar-month-view"
                onClick={() => {
                  sound.playTap();
                  setViewMode('month');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  viewMode === 'month'
                    ? 'bg-indigo-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Month Grid
              </button>
              <button
                id="btn-calendar-year-view"
                onClick={() => {
                  sound.playTap();
                  setViewMode('year');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  viewMode === 'year'
                    ? 'bg-indigo-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                12-Month Year
              </button>
              <button
                id="btn-calendar-agenda-view"
                onClick={() => {
                  sound.playTap();
                  setViewMode('agenda');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  viewMode === 'agenda'
                    ? 'bg-indigo-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Agenda ({upcomingCount})
              </button>
            </div>

            {/* New Event Button */}
            <button
              id="btn-add-calendar-event"
              onClick={() => {
                sound.playTap();
                setDateForNewEvent(todayStr);
                setEditingEvent({});
                setIsEventModalOpen(true);
              }}
              className="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs rounded-2xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Event / Practice</span>
            </button>

            {/* Close Glass Overlay Button */}
            <button
              id="btn-close-calendar-overlay"
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="p-2 bg-white/90 hover:bg-white rounded-xl border-2 border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
              title="Close Calendar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter and Date Navigation Toolbar */}
        <div className="py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 flex-wrap">
          {/* Month & Year Navigator */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-white/90 border-2 border-slate-200 hover:bg-yellow-100 text-slate-700 font-black transition-colors cursor-pointer shadow-2xs"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="font-black text-lg sm:text-xl text-slate-900 tracking-tight">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <button
                onClick={handleJumpToToday}
                className="px-2.5 py-1 rounded-xl bg-white/90 border border-slate-200 text-slate-700 hover:bg-yellow-100 text-xs font-black transition-colors cursor-pointer shadow-2xs"
              >
                Today
              </button>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-white/90 border-2 border-slate-200 hover:bg-yellow-100 text-slate-700 font-black transition-colors cursor-pointer shadow-2xs"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Year Quick Jump Dropdown */}
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(Number(e.target.value))}
              className="px-2.5 py-1.5 bg-white/90 rounded-xl border border-slate-200 text-xs font-black text-slate-800 cursor-pointer shadow-2xs"
            >
              {Array.from({ length: 6 }, (_, i) => today.getFullYear() - 1 + i).map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Filters: Kid & Category */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Kid Filter */}
            <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => {
                  sound.playTap();
                  setSelectedKidId('all');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-colors cursor-pointer ${
                  selectedKidId === 'all'
                    ? 'bg-indigo-900 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Kids
              </button>
              {database.kids.map((kid) => (
                <button
                  key={kid.id}
                  onClick={() => {
                    sound.playTap();
                    setSelectedKidId(kid.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition-colors cursor-pointer ${
                    selectedKidId === kid.id
                      ? 'bg-indigo-900 text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{kid.avatar}</span>
                  <span className="hidden sm:inline">{kid.name}</span>
                </button>
              ))}
            </div>

            {/* Category Filter Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                sound.playTap();
                setSelectedCategory(e.target.value);
              }}
              className="px-3 py-1.5 bg-white/90 rounded-xl border border-slate-200 text-xs font-black text-slate-700 cursor-pointer shadow-2xs"
            >
              <option value="all">All Event Types ({filteredEvents.length})</option>
              {(Object.keys(EVENT_CATEGORIES) as CalendarEventCategory[]).map((catKey) => {
                const meta = EVENT_CATEGORIES[catKey];
                return (
                  <option key={catKey} value={catKey}>
                    {meta.icon} {meta.label}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* --- VIEW MODE 1: MONTH GRID VIEW (With Greyed-Out Completed Days) --- */}
        {viewMode === 'month' && (
          <div className="mt-2 flex-1 flex flex-col">
            {/* Weekday Labels */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center mb-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, idx) => (
                <div
                  key={dayName}
                  className={`py-1.5 text-xs font-black uppercase tracking-wider ${
                    idx === 0 || idx === 6 ? 'text-amber-700' : 'text-slate-600'
                  }`}
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* 7-Column Day Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 flex-1 auto-rows-fr">
              {calendarDays.map((day) => {
                const isTodayCell = day.dateStr === todayStr;
                const isPastDay = day.dateStr < todayStr;
                const isFutureDay = day.dateStr > todayStr;

                const dayEvents = filteredEvents.filter((e) => e.date === day.dateStr);
                const dayWeather = weatherMap[day.dateStr] || getSeasonalWeatherForDate(day.dateStr);
                const weatherMeta = WEATHER_CONDITIONS[dayWeather.condition] || WEATHER_CONDITIONS.sunny;

                // Completed/Past Day Styling vs Active Today vs Future Days
                let cellContainerStyle = '';
                if (isTodayCell) {
                  cellContainerStyle =
                    'bg-amber-100/95 border-indigo-600 shadow-lg ring-4 ring-indigo-500/30 scale-[1.01] z-10';
                } else if (isPastDay) {
                  // GREYED OUT COMPLETED DAY
                  cellContainerStyle = day.isCurrentMonth
                    ? 'bg-slate-200/50 border-slate-300/60 opacity-45 hover:opacity-85 grayscale-[0.4] transition-all hover:bg-slate-100/80 hover:shadow-xs'
                    : 'bg-slate-200/30 border-slate-200/40 opacity-25 grayscale-[0.6]';
                } else if (day.isCurrentMonth) {
                  // Active upcoming current month day
                  cellContainerStyle =
                    'bg-white/95 backdrop-blur-sm border-yellow-200/90 hover:border-indigo-400 hover:shadow-md transition-all';
                } else {
                  // Leading/trailing outside month day
                  cellContainerStyle =
                    'bg-yellow-50/40 border-yellow-100/50 opacity-40 hover:opacity-75 transition-opacity';
                }

                return (
                  <div
                    key={day.dateStr}
                    onClick={() => {
                      sound.playTap();
                      setSelectedDateForDetail(day.dateStr);
                    }}
                    className={`min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 rounded-2xl border-2 transition-all flex flex-col justify-between cursor-pointer group relative ${cellContainerStyle}`}
                  >
                    {/* Top Row in Cell: Date Number, Past Indicator & Weather */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-xs sm:text-sm font-black w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                            isTodayCell
                              ? 'bg-indigo-950 text-yellow-300 shadow-xs'
                              : isPastDay
                              ? 'text-slate-400 font-bold bg-slate-300/40'
                              : 'text-slate-800'
                          }`}
                        >
                          {day.dayNum}
                        </span>

                        {isPastDay && day.isCurrentMonth && (
                          <span className="hidden sm:inline-flex items-center text-[10px] text-slate-400 font-bold">
                            <Check className="w-3 h-3 text-slate-400 stroke-[2.5]" />
                          </span>
                        )}
                      </div>

                      {/* Weather Pill on Day Cell */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playTap();
                          setWeatherModalDate(day.dateStr);
                        }}
                        className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-[10px] font-black transition-colors ${
                          isPastDay
                            ? 'bg-slate-200/60 text-slate-400 hover:bg-slate-300/60'
                            : 'bg-yellow-100/90 hover:bg-yellow-200 text-slate-700'
                        }`}
                        title={`Weather: ${weatherMeta.label}, High ${dayWeather.tempHigh}°${tempUnit}`}
                      >
                        <span>{weatherMeta.icon}</span>
                        <span className="hidden xl:inline">{dayWeather.tempHigh}°</span>
                      </button>
                    </div>

                    {/* Middle: Event Tag Pills */}
                    <div className="space-y-1 my-1 flex-1 overflow-hidden">
                      {dayEvents.slice(0, 3).map((evt) => {
                        const catMeta = EVENT_CATEGORIES[evt.category] || EVENT_CATEGORIES.practice;

                        if (isPastDay) {
                          return (
                            <div
                              key={evt.id}
                              className="px-1.5 py-0.5 rounded-lg text-[10px] font-bold truncate border bg-slate-200/70 text-slate-500 border-slate-300/80 line-through decoration-slate-400/50 flex items-center gap-1 opacity-75"
                              title={`${evt.title} (Completed/Past)`}
                            >
                              <span className="shrink-0 opacity-60">{evt.icon || catMeta.icon}</span>
                              <span className="truncate">{evt.title}</span>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={evt.id}
                            className={`px-1.5 py-0.5 rounded-lg text-[10px] font-black truncate border flex items-center gap-1 shadow-2xs ${
                              evt.isImportant
                                ? 'bg-amber-200 text-amber-950 border-amber-400 font-extrabold ring-1 ring-amber-400'
                                : `${catMeta.badgeBg}`
                            }`}
                            title={`${evt.title} (${evt.time || 'All Day'})`}
                          >
                            <span className="shrink-0">{evt.icon || catMeta.icon}</span>
                            <span className="truncate">{evt.title}</span>
                          </div>
                        );
                      })}

                      {dayEvents.length > 3 && (
                        <div
                          className={`text-[10px] font-black px-1 ${
                            isPastDay ? 'text-slate-400' : 'text-indigo-700'
                          }`}
                        >
                          +{dayEvents.length - 3} more...
                        </div>
                      )}
                    </div>

                    {/* Bottom: Quick Add trigger on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playTap();
                          setDateForNewEvent(day.dateStr);
                          setEditingEvent({ date: day.dateStr });
                          setIsEventModalOpen(true);
                        }}
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-black transition-colors ${
                          isPastDay
                            ? 'bg-slate-300/80 hover:bg-slate-400 text-slate-700'
                            : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-900'
                        }`}
                        title="Add event on this date"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- VIEW MODE 2: 12-MONTH YEAR MATRIX (With Past Months Subdued) --- */}
        {viewMode === 'year' && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {monthNames.map((mName, mIdx) => {
              const mEvents = filteredEvents.filter((e) => {
                const parts = e.date.split('-').map(Number);
                return parts[0] === currentYear && parts[1] === mIdx + 1;
              });

              const isCurrentActiveMonth =
                mIdx === currentMonth && currentYear === today.getFullYear();
              const isPastMonth =
                currentYear < today.getFullYear() ||
                (currentYear === today.getFullYear() && mIdx < today.getMonth());

              return (
                <div
                  key={mName}
                  onClick={() => {
                    sound.playTap();
                    setCurrentMonth(mIdx);
                    setViewMode('month');
                  }}
                  className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isCurrentActiveMonth
                      ? 'bg-amber-100/95 border-indigo-600 shadow-md ring-2 ring-indigo-400/40'
                      : isPastMonth
                      ? 'bg-slate-100/60 border-slate-200/80 opacity-55 hover:opacity-90 grayscale-[0.3]'
                      : 'bg-white/90 backdrop-blur-sm border-yellow-200 hover:border-indigo-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-yellow-200">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-base text-slate-900 italic">
                        {mName}
                      </h4>
                      {isPastMonth && (
                        <span className="text-[10px] text-slate-400 font-bold">
                          ✓ Done
                        </span>
                      )}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-black ${
                        isPastMonth
                          ? 'bg-slate-200 text-slate-500'
                          : 'bg-indigo-50 border border-indigo-200 text-indigo-900'
                      }`}
                    >
                      {mEvents.length} events
                    </span>
                  </div>

                  <div className="py-3 space-y-1.5 flex-1">
                    {mEvents.length === 0 ? (
                      <p className="text-xs text-slate-400 font-bold py-2">
                        No events scheduled
                      </p>
                    ) : (
                      mEvents.slice(0, 3).map((evt) => (
                        <div
                          key={evt.id}
                          className={`text-xs font-bold flex items-center gap-1.5 truncate ${
                            isPastMonth ? 'text-slate-400 line-through' : 'text-slate-700'
                          }`}
                        >
                          <span className={isPastMonth ? 'opacity-50' : ''}>{evt.icon || '⭐'}</span>
                          <span className="truncate">{evt.title}</span>
                        </div>
                      ))
                    )}
                    {mEvents.length > 3 && (
                      <span className={`text-[11px] font-black ${isPastMonth ? 'text-slate-400' : 'text-indigo-600'}`}>
                        +{mEvents.length - 3} additional events
                      </span>
                    )}
                  </div>

                  <button
                    className={`w-full py-1.5 rounded-xl font-black text-xs transition-colors cursor-pointer ${
                      isPastMonth
                        ? 'bg-slate-200/80 hover:bg-slate-300 text-slate-600'
                        : 'bg-yellow-100 hover:bg-yellow-200 text-indigo-950'
                    }`}
                  >
                    Open {mName} →
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* --- VIEW MODE 3: AGENDA VIEW --- */}
        {viewMode === 'agenda' && (
          <div className="mt-4 space-y-3 flex-1 flex flex-col">
            {/* Agenda Filter Tabs */}
            <div className="flex items-center gap-2 pb-2">
              <button
                onClick={() => {
                  sound.playTap();
                  setAgendaFilter('upcoming');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                  agendaFilter === 'upcoming'
                    ? 'bg-indigo-900 text-white shadow-xs'
                    : 'bg-white/80 text-slate-600 hover:bg-yellow-100'
                }`}
              >
                Upcoming Focus ({upcomingCount})
              </button>
              <button
                onClick={() => {
                  sound.playTap();
                  setAgendaFilter('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                  agendaFilter === 'all'
                    ? 'bg-indigo-900 text-white shadow-xs'
                    : 'bg-white/80 text-slate-600 hover:bg-yellow-100'
                }`}
              >
                All Events ({filteredEvents.length})
              </button>
              <button
                onClick={() => {
                  sound.playTap();
                  setAgendaFilter('past');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                  agendaFilter === 'past'
                    ? 'bg-indigo-900 text-white shadow-xs'
                    : 'bg-white/80 text-slate-600 hover:bg-yellow-100'
                }`}
              >
                Completed Past Events ({pastCount})
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1">
              {agendaEvents.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                  <p className="text-base font-black text-slate-500">
                    No {agendaFilter} events found matching your filters.
                  </p>
                  <button
                    onClick={() => {
                      sound.playTap();
                      setDateForNewEvent(todayStr);
                      setEditingEvent({});
                      setIsEventModalOpen(true);
                    }}
                    className="mt-3 px-4 py-2 rounded-2xl bg-indigo-900 text-white font-black text-xs shadow-xs"
                  >
                    + Add Sports Practice or Project Deadline
                  </button>
                </div>
              ) : (
                agendaEvents.map((evt) => {
                  const catMeta = EVENT_CATEGORIES[evt.category] || EVENT_CATEGORIES.practice;
                  const isPast = evt.date < todayStr;
                  const assignedKids = evt.assignedKidIds?.includes('all')
                    ? database.kids
                    : database.kids.filter((k) => evt.assignedKidIds?.includes(k.id));

                  return (
                    <div
                      key={evt.id}
                      className={`p-4 rounded-3xl border-2 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                        isPast
                          ? 'bg-slate-100/60 border-slate-200/80 opacity-60 grayscale-[0.4]'
                          : 'bg-white/95 backdrop-blur-sm border-yellow-200 shadow-2xs hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`text-3xl p-2.5 rounded-2xl border shrink-0 ${
                            isPast
                              ? 'bg-slate-200/70 border-slate-300 text-slate-400'
                              : 'bg-yellow-100 border-yellow-200'
                          }`}
                        >
                          {evt.icon || catMeta.icon}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4
                              className={`font-black text-base ${
                                isPast ? 'text-slate-500 line-through' : 'text-slate-900'
                              }`}
                            >
                              {evt.title}
                            </h4>
                            {isPast && (
                              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-black">
                                ✓ Completed
                              </span>
                            )}
                            {evt.isImportant && !isPast && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-black">
                                ⭐ Important
                              </span>
                            )}
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
                                isPast ? 'bg-slate-200 text-slate-600 border-slate-300' : catMeta.badgeBg
                              }`}
                            >
                              {catMeta.shortLabel}
                            </span>
                          </div>

                          {/* Date, Time, Location */}
                          <div className="flex items-center gap-4 text-xs text-slate-500 font-bold mt-1.5 flex-wrap">
                            <span className="flex items-center gap-1 text-slate-800 font-extrabold">
                              <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
                              {evt.date}
                            </span>
                            {evt.time && (
                              <span className="flex items-center gap-1 text-slate-700">
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
                            <p className="text-xs text-slate-600 mt-1 font-medium">
                              {evt.description}
                            </p>
                          )}

                          {/* Weather Note */}
                          {evt.weatherNote && (
                            <p className="text-[11px] text-amber-900 font-bold mt-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-block">
                              ⛅ {evt.weatherNote}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right side kid avatars and actions */}
                      <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                        <div className="flex items-center gap-1">
                          {evt.assignedKidIds?.includes('all') ? (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-black">
                              All Kids
                            </span>
                          ) : (
                            assignedKids.map((k) => (
                              <span
                                key={k.id}
                                className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-xs font-bold"
                                title={k.name}
                              >
                                {k.avatar} {k.name}
                              </span>
                            ))
                          )}
                        </div>

                        <button
                          onClick={() => {
                            sound.playTap();
                            setEditingEvent(evt);
                            setIsEventModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-yellow-100 hover:bg-yellow-200 text-slate-800 text-xs font-black border border-yellow-300 cursor-pointer shadow-2xs"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Day Detail Modal */}
      {selectedDateForDetail && (
        <DayDetailModal
          isOpen={Boolean(selectedDateForDetail)}
          dateStr={selectedDateForDetail}
          events={filteredEvents.filter((e) => e.date === selectedDateForDetail)}
          chores={database.chores.filter((c) =>
            isChoreScheduledForDate(c, selectedDateForDetail)
          )}
          kids={database.kids}
          customWeather={weatherMap[selectedDateForDetail]}
          tempUnit={tempUnit}
          onAddEvent={(d) => {
            setDateForNewEvent(d);
            setEditingEvent({ date: d });
            setIsEventModalOpen(true);
          }}
          onEditEvent={(evt) => {
            setEditingEvent(evt);
            setIsEventModalOpen(true);
          }}
          onDeleteEvent={handleDeleteEvent}
          onEditWeather={(d) => {
            setWeatherModalDate(d);
          }}
          onClose={() => setSelectedDateForDetail(null)}
        />
      )}

      {/* Add / Edit Event Modal */}
      {isEventModalOpen && (
        <CalendarEventModal
          isOpen={isEventModalOpen}
          event={editingEvent}
          kids={database.kids}
          initialDate={dateForNewEvent || todayStr}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          onClose={() => {
            setIsEventModalOpen(false);
            setEditingEvent(null);
          }}
        />
      )}

      {/* Weather Adjust Modal */}
      {weatherModalDate && (
        <WeatherModal
          isOpen={Boolean(weatherModalDate)}
          dateStr={weatherModalDate}
          initialWeather={
            weatherMap[weatherModalDate] || getSeasonalWeatherForDate(weatherModalDate)
          }
          tempUnit={tempUnit}
          onSave={handleSaveWeather}
          onReset={handleResetWeather}
          onClose={() => setWeatherModalDate(null)}
        />
      )}
    </div>
  );
};
