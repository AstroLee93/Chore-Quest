import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  Upload,
  FileText,
  Link,
  HelpCircle,
  Copy,
  ExternalLink,
  ChevronRight,
  Save,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  GoogleCalendarItem,
  fetchGoogleCalendars,
  fetchGoogleCalendarEvents,
  convertGoogleEventToCalendarEvent,
  parseIcsContent,
  fetchIcsFeedFromUrl,
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
  // Tabs: 'url' (Secret iCal URL), 'google' (OAuth popup), 'ics' (File upload)
  const [activeTab, setActiveTab] = useState<'url' | 'google' | 'ics'>('url');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authErrorCode, setAuthErrorCode] = useState<string | null>(null);

  // URL Sync State
  const [feedUrl, setFeedUrl] = useState<string>(database.settings?.savedCalendarIcsUrl || '');
  const [isSavingUrl, setIsSavingUrl] = useState<boolean>(false);
  const [showUrlGuide, setShowUrlGuide] = useState<boolean>(false);
  const [copiedDomain, setCopiedDomain] = useState<boolean>(false);

  // Calendars & events state
  const [calendars, setCalendars] = useState<GoogleCalendarItem[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>('primary');
  const [isLoadingCalendars, setIsLoadingCalendars] = useState<boolean>(false);
  const [rangeOption, setRangeOption] = useState<'30days' | '90days' | 'year' | 'month'>('30days');
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);
  const [fetchedEvents, setFetchedEvents] = useState<CalendarEvent[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);

  // File upload state for ICS
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [icsFileName, setIcsFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Current domain for troubleshooting
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  // Initialize auth listener
  useEffect(() => {
    return initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );
  }, []);

  // Sync saved URL if it exists
  useEffect(() => {
    if (database.settings?.savedCalendarIcsUrl) {
      setFeedUrl(database.settings.savedCalendarIcsUrl);
    }
  }, [database.settings?.savedCalendarIcsUrl]);

  // Handle URL fetch
  const handleFetchUrlFeed = async () => {
    if (!feedUrl.trim()) {
      setAuthError('Please paste your Google Calendar Secret iCal URL or webcal link.');
      return;
    }

    setIsLoadingEvents(true);
    setAuthError(null);
    setImportSuccessCount(null);
    sound.playTap();

    try {
      const events = await fetchIcsFeedFromUrl(feedUrl, database.kids || []);
      setFetchedEvents(events);

      // Default select non-duplicate events
      const existingKeys = new Set(
        (database.events || []).map((e) => `${e.date}__${e.title.toLowerCase().trim()}`)
      );
      const newIds = new Set<string>();
      events.forEach((evt) => {
        if (!existingKeys.has(`${evt.date}__${evt.title.toLowerCase().trim()}`)) {
          newIds.add(evt.id);
        }
      });
      setSelectedEventIds(newIds.size > 0 ? newIds : new Set(events.map((e) => e.id)));
      sound.playStarEarned();

      // Automatically save URL to database settings if changed
      if (feedUrl !== database.settings?.savedCalendarIcsUrl) {
        onUpdateDatabase({
          ...database,
          settings: {
            ...database.settings,
            savedCalendarIcsUrl: feedUrl.trim(),
          },
        });
      }
    } catch (err: any) {
      setAuthError(err.message || 'Could not fetch events from the provided calendar URL.');
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const loadCalendars = useCallback(async (token: string) => {
    setIsLoadingCalendars(true);
    setAuthError(null);
    try {
      const list = await fetchGoogleCalendars(token);
      setCalendars(list);
      const primary = list.find((c) => c.primary) || list[0];
      if (primary) setSelectedCalendarId(primary.id);
    } catch (err: any) {
      setAuthError(err.message || 'Could not load Google Calendars. Please try again.');
    } finally {
      setIsLoadingCalendars(false);
    }
  }, []);

  useEffect(() => {
    if (accessToken) loadCalendars(accessToken);
  }, [accessToken, loadCalendars]);

  const loadEvents = useCallback(async (token: string, calId: string, range: string) => {
    setIsLoadingEvents(true);
    setAuthError(null);
    setImportSuccessCount(null);

    try {
      const now = new Date();
      let timeMin = now.toISOString();
      let timeMax = new Date(now.getTime() + 30 * 86400000).toISOString();

      if (range === 'month') {
        timeMin = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        timeMax = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
      } else if (range === '90days') {
        timeMax = new Date(now.getTime() + 90 * 86400000).toISOString();
      } else if (range === 'year') {
        timeMin = new Date(now.getFullYear(), 0, 1).toISOString();
        timeMax = new Date(now.getFullYear(), 11, 31, 23, 59, 59).toISOString();
      }

      const items = await fetchGoogleCalendarEvents(token, calId, timeMin, timeMax, 150);
      const converted = items
        .filter((item) => item.status !== 'cancelled' && (item.start?.date || item.start?.dateTime))
        .map((item) => convertGoogleEventToCalendarEvent(item, database.kids || []));

      setFetchedEvents(converted);

      // Default select non-duplicate events
      const existingKeys = new Set(
        (database.events || []).map((e) => `${e.date}__${e.title.toLowerCase().trim()}`)
      );
      const newIds = new Set<string>();
      converted.forEach((evt) => {
        if (!existingKeys.has(`${evt.date}__${evt.title.toLowerCase().trim()}`)) {
          newIds.add(evt.id);
        }
      });
      setSelectedEventIds(newIds.size > 0 ? newIds : new Set(converted.map((e) => e.id)));
    } catch (err: any) {
      setAuthError(err.message || 'Failed to load events from Google Calendar.');
    } finally {
      setIsLoadingEvents(false);
    }
  }, [database.kids, database.events]);

  useEffect(() => {
    if (accessToken && selectedCalendarId && activeTab === 'google') {
      loadEvents(accessToken, selectedCalendarId, rangeOption);
    }
  }, [accessToken, selectedCalendarId, rangeOption, activeTab, loadEvents]);

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    setAuthErrorCode(null);
    try {
      sound.playTap();
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
      }
    } catch (err: any) {
      const code = err.code || (err.message?.includes('auth/unauthorized-domain') ? 'auth/unauthorized-domain' : null);
      setAuthErrorCode(code);
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

  const handleIcsFile = (file: File) => {
    if (!file) return;
    setIcsFileName(file.name);
    setIsLoadingEvents(true);
    setAuthError(null);
    setImportSuccessCount(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = parseIcsContent(content, database.kids || []);
        if (parsed.length === 0) {
          setAuthError('No valid events found in the uploaded .ics calendar file.');
          setFetchedEvents([]);
          setSelectedEventIds(new Set());
        } else {
          setFetchedEvents(parsed);
          setSelectedEventIds(new Set(parsed.map((evt) => evt.id)));
          sound.playStarEarned();
        }
      } catch (err: any) {
        setAuthError('Could not parse .ics file. Please verify it is a valid calendar export.');
      } finally {
        setIsLoadingEvents(false);
      }
    };
    reader.onerror = () => {
      setAuthError('Failed to read file from disk.');
      setIsLoadingEvents(false);
    };
    reader.readAsText(file);
  };

  const handleLoadSampleSchedule = () => {
    sound.playTap();
    const today = new Date();
    const formatDate = (offsetDays: number) => {
      const d = new Date(today);
      d.setDate(today.getDate() + offsetDays);
      return d.toISOString().split('T')[0];
    };

    const kid1Id = database.kids[0]?.id || 'all';
    const kid2Id = database.kids[1]?.id || 'all';

    const sampleEvents: CalendarEvent[] = [
      {
        id: `sample-${Date.now()}-1`,
        title: 'Varsity Soccer Practice',
        description: 'Bring cleats, water bottle, and shin guards.',
        date: formatDate(1),
        time: '16:00',
        endTime: '17:30',
        category: 'practice',
        icon: '⚽',
        location: 'Community Athletic Turf Field 3',
        assignedKidIds: [kid1Id],
        isImportant: false,
      },
      {
        id: `sample-${Date.now()}-2`,
        title: 'Science Fair Project Due',
        description: 'Solar System model presentation and poster board.',
        date: formatDate(3),
        time: '08:30',
        endTime: '15:00',
        category: 'school_project',
        icon: '🪐',
        location: 'Elementary School Auditorium',
        assignedKidIds: [kid2Id],
        isImportant: true,
      },
      {
        id: `sample-${Date.now()}-3`,
        title: 'Pediatric Dental Checkup',
        description: 'Routine 6-month cleaning and checkup.',
        date: formatDate(4),
        time: '14:30',
        endTime: '15:30',
        category: 'appointment',
        icon: '🦷',
        location: 'Bright Smiles Pediatric Dentistry',
        assignedKidIds: ['all'],
        isImportant: false,
      },
      {
        id: `sample-${Date.now()}-4`,
        title: 'Natural History Museum Field Trip',
        description: 'Wear class t-shirt and bring packed lunch.',
        date: formatDate(7),
        time: '09:00',
        endTime: '14:00',
        category: 'field_trip',
        icon: '🚌',
        location: 'State Natural History Museum',
        assignedKidIds: [kid2Id],
        isImportant: false,
      },
    ];

    setFetchedEvents(sampleEvents);
    setSelectedEventIds(new Set(sampleEvents.map((e) => e.id)));
    setIcsFileName('Family_Sample_Schedule.ics');
  };

  const toggleSelectEvent = (id: string) => {
    sound.playTap();
    setSelectedEventIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
    confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });

    const existingMap = new Map<string, CalendarEvent>((database.events || []).map((e) => [e.id, e]));
    toImport.forEach((evt) => existingMap.set(evt.id, evt));

    const updatedEvents = Array.from(existingMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    onUpdateDatabase({ ...database, events: updatedEvents });
    setImportSuccessCount(toImport.length);
  };

  const handleCopyDomain = () => {
    sound.playTap();
    navigator.clipboard?.writeText(currentHostname);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/80 animate-fade-in">
      <div className="bg-slate-900 text-white rounded-[2.5rem] border-4 border-indigo-500 max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-indigo-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border-2 border-indigo-400 flex items-center justify-center text-2xl shadow-inner">
              📅
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-500/40 text-yellow-300">
                  Google Calendar & Schedule Sync
                </span>
                <span className="text-xs font-bold text-slate-400">ChoreQuest Sync Hub</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">Import Calendar Events</h2>
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

        {/* Sync Method Tabs */}
        <div className="px-6 pt-4 pb-1 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              setActiveTab('url');
              setAuthError(null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'url' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Link className="w-3.5 h-3.5 text-yellow-300" />
            <span>🔗 Secret iCal URL (Fastest / Local / Pi)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playTap();
              setActiveTab('google');
              setAuthError(null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'google' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>🔐 Google Account Popup</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playTap();
              setActiveTab('ics');
              setAuthError(null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'ics' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>📁 .ICS File / Sample</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-5">
          {/* TAB 1: GOOGLE CALENDAR SECRET ICAL URL (RECOMMENDED FOR LOCAL / PI / ZERO-AUTH) */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                      <span>Sync via Google Calendar Secret iCal Address</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        100% Reliable & No Auth Needed
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Paste your Google Calendar private iCal link. ChoreQuest fetches and categorizes your sports games, practices, appointments, and family events seamlessly!
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
                      value={feedUrl}
                      onChange={(e) => setFeedUrl(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-600 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleFetchUrlFeed}
                      disabled={isLoadingEvents || !feedUrl.trim()}
                      className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEvents ? 'animate-spin' : ''}`} />
                      <span>{isLoadingEvents ? 'Fetching Events...' : 'Sync Calendar'}</span>
                    </button>
                  </div>

                  {database.settings?.savedCalendarIcsUrl && (
                    <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Calendar URL saved. You can refresh anytime with one click!</span>
                    </div>
                  )}
                </div>

                {/* How to find Google Calendar URL Guide */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setShowUrlGuide(!showUrlGuide);
                    }}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>How to get your Google Calendar secret iCal URL (15 seconds)</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showUrlGuide ? 'rotate-180' : ''}`} />
                  </button>

                  {showUrlGuide && (
                    <div className="mt-3 p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 text-xs text-slate-300 space-y-2.5 animate-fade-in font-medium">
                      <div className="font-black text-yellow-300 flex items-center gap-1.5">
                        <span>📋 4 Simple Steps to get your link:</span>
                      </div>
                      <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1 text-[11px]">
                        <li>
                          Open <strong className="text-white">calendar.google.com</strong> on your computer or phone browser.
                        </li>
                        <li>
                          Click the <strong className="text-white">⚙️ Gear icon (Settings)</strong> in the top right &rarr; <strong className="text-white">Settings</strong>.
                        </li>
                        <li>
                          In the left sidebar, click on your <strong className="text-white">Family or Personal calendar name</strong> under <em>"Settings for my calendars"</em>.
                        </li>
                        <li>
                          Scroll down to <strong className="text-white">"Integrate calendar"</strong> and copy the <strong className="text-yellow-300">"Secret address in iCal format"</strong> link.
                        </li>
                      </ol>
                      <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800">
                        💡 Also works with Apple Calendar iCloud public/shared links, Outlook webcal links, TeamSnap, SportsEngine, and school district iCal feeds!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE ACCOUNT OAUTH POPUP */}
          {activeTab === 'google' && (
            <>
              {!currentUser || !accessToken ? (
                <div className="p-6 rounded-3xl bg-slate-800/80 border-2 border-slate-700 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-900/80 border-2 border-indigo-400 flex items-center justify-center text-3xl mx-auto shadow-lg">
                    🔐
                  </div>
                  <div className="max-w-md mx-auto">
                    <h3 className="text-lg font-black text-white mb-1">Direct Google Account Sign-In</h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      Sign in directly with your Google Account to automatically browse and import from your Google Calendar list.
                    </p>
                  </div>

                  {authError && (
                    <div className="p-4 rounded-2xl bg-rose-950/90 border border-rose-600 text-rose-200 text-xs font-bold space-y-3 text-left">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                        <div className="space-y-2">
                          <div className="font-black text-rose-300 text-sm">{authError}</div>
                          
                          {authErrorCode === 'auth/unauthorized-domain' && (
                            <div className="text-xs text-rose-200/90 space-y-2 font-normal">
                              <p>
                                🔒 <strong>Firebase Domain Restriction:</strong> Google OAuth popups require your current domain/IP (<strong>{currentHostname}</strong>) to be listed in Authorized Domains.
                              </p>
                              
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={handleCopyDomain}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-rose-500/50 text-white font-bold text-xs cursor-pointer transition-colors"
                                >
                                  {copiedDomain ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  <span>{copiedDomain ? 'Copied Domain!' : `Copy "${currentHostname}"`}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    sound.playTap();
                                    setActiveTab('url');
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer transition-colors"
                                >
                                  <Link className="w-3.5 h-3.5 text-yellow-300" />
                                  <span>Use Secret iCal URL (Recommended & Works Instantly)</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={handleSignIn}
                      disabled={isAuthenticating}
                      className="flex items-center gap-3 px-6 py-3.5 bg-white text-slate-700 hover:bg-slate-50 font-bold rounded-2xl shadow-lg border border-slate-300 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                      </svg>
                      <span className="text-sm font-black text-slate-800">
                        {isAuthenticating ? 'Connecting to Google...' : 'Sign in with Google'}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Connected Account Bar */}
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

                  {/* Filters: Calendar Dropdown & Date Range */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
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
                </>
              )}
            </>
          )}

          {/* TAB 3: DIRECT .ICS FILE & SCHEDULE IMPORTER */}
          {activeTab === 'ics' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files?.length) handleIcsFile(e.dataTransfer.files[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 rounded-3xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-indigo-400 bg-indigo-950/50'
                    : 'border-slate-700 hover:border-indigo-500 bg-slate-800/60 hover:bg-slate-800'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".ics,text/calendar"
                  onChange={(e) => {
                    if (e.target.files?.length) handleIcsFile(e.target.files[0]);
                  }}
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
                  <Upload className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-sm font-black text-white">
                    {icsFileName ? `Loaded: ${icsFileName}` : 'Drag & drop a .ICS file or click to browse'}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Supports Google Calendar .ics export, Apple Calendar, TeamSnap, school sports & club schedules
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-slate-700 text-slate-200 text-xs font-bold">
                    Choose .ics file
                  </span>
                  <span className="text-slate-500 text-xs font-bold">or</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoadSampleSchedule();
                    }}
                    className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Load Sample Family Schedule
                  </button>
                </div>
              </div>
            </div>
          )}

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

          {/* Staged Events Preview List */}
          {fetchedEvents.length > 0 && (
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">Events Found ({fetchedEvents.length})</span>
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
                  <p className="text-xs font-bold">Processing events...</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {fetchedEvents.map((evt) => {
                    const isSelected = selectedEventIds.has(evt.id);
                    const isAlreadyImported = (database.events || []).some(
                      (existing) =>
                        existing.id === evt.id ||
                        (existing.date === evt.date && existing.title.toLowerCase() === evt.title.toLowerCase())
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
                              <span className="text-sm font-black text-white truncate max-w-xs">{evt.title}</span>
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
                                <span className="text-slate-400 truncate max-w-[200px]">📍 {evt.location}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Category and Kid Assignment Dropdowns */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <select
                            value={evt.category === 'custom' && evt.customCategoryName ? `custom:${evt.customCategoryName}` : evt.category}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val.startsWith('custom:')) {
                                const cName = val.replace('custom:', '');
                                const found = database.customCalendarCategories?.find((c) => c.name === cName);
                                updateStagedEvent(evt.id, {
                                  category: 'custom',
                                  customCategoryName: cName,
                                  customCategoryIcon: found?.icon || '✨',
                                  customCategoryDescription: found?.description,
                                  customCategoryColor: found?.color,
                                  icon: found?.icon || '✨',
                                  color: found?.color,
                                });
                              } else {
                                updateStagedEvent(evt.id, {
                                  category: val as CalendarEventCategory,
                                  customCategoryName: undefined,
                                  icon: EVENT_CATEGORIES[val as CalendarEventCategory]?.icon || evt.icon,
                                  color: EVENT_CATEGORIES[val as CalendarEventCategory]?.color,
                                });
                              }
                            }}
                            className="px-2 py-1 rounded-xl bg-slate-900 border border-slate-700 text-[11px] font-black text-slate-300 focus:outline-indigo-500"
                          >
                            {Object.values(EVENT_CATEGORIES)
                              .filter((c) => c.id !== 'custom')
                              .map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.icon} {cat.shortLabel}
                                </option>
                              ))}
                            {database.customCalendarCategories?.map((c) => (
                              <option key={c.id} value={`custom:${c.name}`}>
                                {c.icon || '✨'} {c.name}
                              </option>
                            ))}
                          </select>

                          <select
                            value={evt.assignedKidIds[0] || 'all'}
                            onChange={(e) => updateStagedEvent(evt.id, { assignedKidIds: [e.target.value] })}
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

          {fetchedEvents.length > 0 && (
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
