import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  X,
  RefreshCw,
  Check,
  Sparkles,
  AlertCircle,
  Clock,
  MapPin,
  Users,
  LogOut,
  ChevronDown,
  CalendarDays,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  GoogleCalendarItem,
  GoogleCalendarEventItem,
  fetchGoogleCalendars,
  fetchGoogleCalendarEvents,
  convertGoogleEventToCalendarEvent,
  googleSignIn,
  logoutGoogle,
  initAuth,
} from '../../utils/googleCalendar';
import { CalendarEvent, CalendarEventCategory, FamilyDatabase, KidProfile } from '../../types';
import { EVENT_CATEGORIES } from '../../utils/calendar';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface GoogleCalendarImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: FamilyDatabase;
  onUpdateDatabase: (updated: FamilyDatabase) => void;
}

export const GoogleCalendarImportModal: React.FC<GoogleCalendarImportModalProps> = ({
  isOpen,
  onClose,
  database,
  onUpdateDatabase,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Calendars & events state
  const [calendars, setCalendars] = useState<GoogleCalendarItem[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>('primary');
  const [isLoadingCalendars, setIsLoadingCalendars] = useState<boolean>(false);

  // Date range filter
  const [rangeOption, setRangeOption] = useState<'30days' | '90days' | 'year' | 'month'>('30days');

  // Fetched events & staged import events
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);
  const [fetchedEvents, setFetchedEvents] = useState<CalendarEvent[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // When token is available, load user's Google Calendars
  useEffect(() => {
    if (accessToken) {
      loadCalendars(accessToken);
    }
  }, [accessToken]);

  // Load calendars helper
  const loadCalendars = async (token: string) => {
    setIsLoadingCalendars(true);
    setAuthError(null);
    try {
      const list = await fetchGoogleCalendars(token);
      setCalendars(list);
      const primary = list.find((c) => c.primary) || list[0];
      if (primary) {
        setSelectedCalendarId(primary.id);
      }
    } catch (err: any) {
      console.error('Error loading Google Calendars:', err);
      setAuthError(err.message || 'Could not load your Google Calendars. Please re-authenticate.');
    } finally {
      setIsLoadingCalendars(false);
    }
  };

  // Fetch events whenever calendar or date range changes
  useEffect(() => {
    if (accessToken && selectedCalendarId) {
      loadEvents(accessToken, selectedCalendarId, rangeOption);
    }
  }, [accessToken, selectedCalendarId, rangeOption]);

  const loadEvents = async (token: string, calId: string, range: string) => {
    setIsLoadingEvents(true);
    setAuthError(null);
    setImportSuccessCount(null);

    try {
      const now = new Date();
      let timeMin = new Date().toISOString();
      let timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

      if (range === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        timeMin = startOfMonth.toISOString();
        timeMax = endOfMonth.toISOString();
      } else if (range === '90days') {
        timeMax = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();
      } else if (range === 'year') {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        timeMin = startOfYear.toISOString();
        timeMax = endOfYear.toISOString();
      }

      const items = await fetchGoogleCalendarEvents(token, calId, timeMin, timeMax, 150);
      const converted = items
        .filter((item) => item.status !== 'cancelled' && (item.start?.date || item.start?.dateTime))
        .map((item) => convertGoogleEventToCalendarEvent(item, database.kids || []));

      setFetchedEvents(converted);

      // By default, select non-duplicate events
      const existingTitlesAndDates = new Set(
        (database.events || []).map((e) => `${e.date}__${e.title.toLowerCase().trim()}`)
      );

      const newIds = new Set<string>();
      converted.forEach((evt) => {
        const key = `${evt.date}__${evt.title.toLowerCase().trim()}`;
        if (!existingTitlesAndDates.has(key)) {
          newIds.add(evt.id);
        }
      });
      setSelectedEventIds(newIds);
    } catch (err: any) {
      console.error('Error fetching calendar events:', err);
      setAuthError(err.message || 'Failed to load events from Google Calendar.');
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      sound.playTap();
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
      }
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      setAuthError(err.message || 'Sign in failed. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    sound.playTap();
    await logoutGoogle();
    setCurrentUser(null);
    setAccessToken(null);
    setCalendars([]);
    setFetchedEvents([]);
    setSelectedEventIds(new Set());
  };

  const toggleSelectEvent = (id: string) => {
    sound.playTap();
    const next = new Set(selectedEventIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedEventIds(next);
  };

  const handleSelectAll = () => {
    sound.playTap();
    if (selectedEventIds.size === fetchedEvents.length) {
      setSelectedEventIds(new Set());
    } else {
      setSelectedEventIds(new Set(fetchedEvents.map((e) => e.id)));
    }
  };

  const updateStagedEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setFetchedEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const handleExecuteImport = () => {
    const toImport = fetchedEvents.filter((e) => selectedEventIds.has(e.id));
    if (toImport.length === 0) return;

    sound.playLevelUp();
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
    });

    const existing = database.events || [];
    // Merge, replacing any existing events that have the same generated id
    const existingMap = new Map<string, CalendarEvent>(existing.map((e) => [e.id, e]));

    toImport.forEach((evt) => {
      existingMap.set(evt.id, evt);
    });

    const updatedEvents = Array.from(existingMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    onUpdateDatabase({
      ...database,
      events: updatedEvents,
    });

    setImportSuccessCount(toImport.length);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
      <div className="bg-slate-900 text-white rounded-[2.5rem] border-4 border-indigo-500 max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-indigo-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border-2 border-indigo-400 flex items-center justify-center text-2xl shadow-inner">
              📅
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-500/40 text-yellow-300">
                  Google Workspace Sync
                </span>
                <span className="text-xs font-bold text-slate-400">Official API</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Import Google Calendar Events
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-5">
          {/* Auth State Box */}
          {!currentUser || !accessToken ? (
            <div className="p-6 rounded-3xl bg-slate-800/80 border-2 border-slate-700 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-indigo-900/80 border-2 border-indigo-400 flex items-center justify-center text-3xl mx-auto shadow-lg">
                🔐
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-black text-white mb-1">
                  Connect Your Google Account
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Connect your Google Calendar to seamlessly import sports practices, school field trips, doctor appointments, and family events directly into your family schedule.
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-200 text-xs font-bold flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Official Google Sign-In Button */}
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isAuthenticating}
                  className="flex items-center gap-3 px-6 py-3.5 bg-white text-slate-700 hover:bg-slate-50 font-bold rounded-2xl shadow-lg border border-slate-300 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span className="text-sm font-black text-slate-800">
                    {isAuthenticating ? 'Connecting to Google...' : 'Sign in with Google'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Connected User Bar */}
              <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-xl border border-indigo-400"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-indigo-800 flex items-center justify-center text-lg font-black text-white">
                      {currentUser.displayName ? currentUser.displayName[0] : '👤'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">
                        {currentUser.displayName || 'Google Account'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-700">
                        <ShieldCheck className="w-3 h-3" /> Connected
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{currentUser.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => loadEvents(accessToken, selectedCalendarId, rangeOption)}
                    disabled={isLoadingEvents}
                    className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-black flex items-center gap-1 cursor-pointer transition-colors"
                    title="Refresh Events"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEvents ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-black flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>

              {/* Filters Bar: Select Calendar & Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
                {/* Calendar Selector */}
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Select Google Calendar:
                  </label>
                  <select
                    value={selectedCalendarId}
                    onChange={(e) => setSelectedCalendarId(e.target.value)}
                    disabled={isLoadingCalendars || calendars.length === 0}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-600 text-white font-bold text-xs focus:outline-indigo-500"
                  >
                    {calendars.length === 0 ? (
                      <option value="primary">Primary Calendar</option>
                    ) : (
                      calendars.map((cal) => (
                        <option key={cal.id} value={cal.id}>
                          {cal.summary} {cal.primary ? '(Primary)' : ''}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Date Range Selector */}
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Date Range:
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { id: 'month', label: 'This Month' },
                      { id: '30days', label: '30 Days' },
                      { id: '90days', label: '90 Days' },
                      { id: 'year', label: 'Full Year' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          sound.playTap();
                          setRangeOption(opt.id as any);
                        }}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                          rangeOption === opt.id
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-900 text-slate-400 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Success Notification */}
              {importSuccessCount !== null && (
                <div className="p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-emerald-200 text-xs font-black flex items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>
                      Successfully imported {importSuccessCount} event{importSuccessCount === 1 ? '' : 's'} into your Family Calendar! 🎉
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black cursor-pointer"
                  >
                    View Calendar
                  </button>
                </div>
              )}

              {/* Events Staging Area */}
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">
                      Google Events Found ({fetchedEvents.length})
                    </span>
                    <span className="text-xs font-bold text-yellow-400">
                      • {selectedEventIds.size} Selected for Import
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs font-black text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                  >
                    {selectedEventIds.size === fetchedEvents.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                {isLoadingEvents ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <RefreshCw className="w-8 h-8 mx-auto animate-spin text-indigo-400" />
                    <p className="text-xs font-bold">Scanning Google Calendar events...</p>
                  </div>
                ) : fetchedEvents.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-2">
                    <CalendarDays className="w-8 h-8 mx-auto text-slate-500" />
                    <p className="text-xs font-bold">No events found in this date range.</p>
                    <p className="text-[11px] text-slate-500">Try choosing a wider range or a different Google Calendar.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {fetchedEvents.map((evt) => {
                      const isSelected = selectedEventIds.has(evt.id);
                      const isAlreadyImported = (database.events || []).some(
                        (existing) => existing.id === evt.id || (existing.date === evt.date && existing.title.toLowerCase() === evt.title.toLowerCase())
                      );

                      return (
                        <div
                          key={evt.id}
                          className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-indigo-950/40 border-indigo-500 shadow-sm'
                              : 'bg-slate-800/60 border-slate-700 opacity-75'
                          }`}
                        >
                          {/* Checkbox & Basic Info */}
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <button
                              type="button"
                              onClick={() => toggleSelectEvent(evt.id)}
                              className={`w-6 h-6 rounded-lg border-2 mt-0.5 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-indigo-600 border-indigo-400 text-white'
                                  : 'border-slate-500 hover:border-slate-400 bg-slate-900'
                              }`}
                            >
                              {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                            </button>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-lg">{evt.icon || '📌'}</span>
                                <span className="text-sm font-black text-white truncate max-w-xs">
                                  {evt.title}
                                </span>
                                {isAlreadyImported && (
                                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-950 border border-amber-600 text-amber-300">
                                    Already in ChoreQuest
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 mt-1 flex-wrap">
                                <span className="text-yellow-400 font-mono">📅 {evt.date}</span>
                                {evt.time && (
                                  <span className="text-slate-300 font-mono">
                                    ⏰ {evt.time} {evt.endTime ? `- ${evt.endTime}` : ''}
                                  </span>
                                )}
                                {evt.location && (
                                  <span className="text-slate-400 truncate max-w-[200px]">
                                    📍 {evt.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick Mapping: Category & Kid Assignment */}
                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            {/* Category Select */}
                            <select
                              value={evt.category}
                              onChange={(e) =>
                                updateStagedEvent(evt.id, {
                                  category: e.target.value as CalendarEventCategory,
                                  icon: EVENT_CATEGORIES[e.target.value as CalendarEventCategory]?.icon || evt.icon,
                                })
                              }
                              className="px-2 py-1 rounded-xl bg-slate-900 border border-slate-700 text-[11px] font-black text-slate-300 focus:outline-indigo-500"
                            >
                              {Object.values(EVENT_CATEGORIES).map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.icon} {cat.shortLabel}
                                </option>
                              ))}
                            </select>

                            {/* Kid Assignment Select */}
                            <select
                              value={evt.assignedKidIds[0] || 'all'}
                              onChange={(e) =>
                                updateStagedEvent(evt.id, {
                                  assignedKidIds: [e.target.value],
                                })
                              }
                              className="px-2 py-1 rounded-xl bg-slate-900 border border-slate-700 text-[11px] font-black text-yellow-300 focus:outline-indigo-500"
                            >
                              <option value="all">👥 Whole Family</option>
                              {database.kids.map((k) => (
                                <option key={k.id} value={k.id}>
                                  {k.avatar} {k.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 sm:p-6 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs cursor-pointer transition-colors"
          >
            Close
          </button>

          {currentUser && (
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={selectedEventIds.size === 0 || isLoadingEvents}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-yellow-300 font-black text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Import Selected Events ({selectedEventIds.size})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
