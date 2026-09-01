import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { CalendarEvent, CalendarEventCategory, KidProfile } from '../types';

export const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly',
];

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Provider with scopes
const provider = new GoogleAuthProvider();
CALENDAR_SCOPES.forEach((scope) => provider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Auth State Listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google Popup
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google access token from Firebase authentication.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Calendar sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface GoogleCalendarItem {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
  timeZone?: string;
  selected?: boolean;
}

export interface GoogleCalendarEventItem {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: {
    date?: string; // YYYY-MM-DD for all-day events
    dateTime?: string; // ISO string
    timeZone?: string;
  };
  end?: {
    date?: string;
    dateTime?: string;
  };
  htmlLink?: string;
  status?: string;
}

// Fetch list of user's Google Calendars
export const fetchGoogleCalendars = async (token: string): Promise<GoogleCalendarItem[]> => {
  const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch calendars (${response.status})`);
  }

  const data = await response.json();
  return (data.items || []).map((cal: any) => ({
    id: cal.id,
    summary: cal.summary || 'Untitled Calendar',
    description: cal.description,
    primary: !!cal.primary,
    backgroundColor: cal.backgroundColor || '#3b82f6',
    foregroundColor: cal.foregroundColor || '#ffffff',
    timeZone: cal.timeZone,
    selected: !!cal.primary || !!cal.selected,
  }));
};

// Fetch Events from a specific Google Calendar
export const fetchGoogleCalendarEvents = async (
  token: string,
  calendarId: string = 'primary',
  timeMin?: string,
  timeMax?: string,
  maxResults: number = 100
): Promise<GoogleCalendarEventItem[]> => {
  const params = new URLSearchParams({
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: maxResults.toString(),
  });

  if (timeMin) params.set('timeMin', timeMin);
  if (timeMax) params.set('timeMax', timeMax);

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
    calendarId
  )}/events?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch events from calendar (${response.status})`);
  }

  const data = await response.json();
  return data.items || [];
};

// Helper: Smart category deduction based on event title & description
export const inferCategoryAndIcon = (
  title: string = '',
  desc: string = ''
): { category: CalendarEventCategory; icon: string } => {
  const text = `${title} ${desc}`.toLowerCase();

  // Sports & Practice
  if (/soccer|football|baseball|basketball|gymnastics|swim|karate|practice|drill|scrimmage|match|game|track|tennis|dance|ballet|cheer/.test(text)) {
    if (/soccer/.test(text)) return { category: 'practice', icon: '⚽' };
    if (/basketball/.test(text)) return { category: 'practice', icon: '🏀' };
    if (/baseball/.test(text)) return { category: 'practice', icon: '⚾' };
    if (/swim/.test(text)) return { category: 'practice', icon: '🏊' };
    if (/dance|ballet/.test(text)) return { category: 'practice', icon: '🩰' };
    return { category: 'practice', icon: '🏆' };
  }

  // School, Projects, Homework
  if (/school|homework|project|exam|test|quiz|science fair|presentation|class|report|stem|math|spelling/.test(text)) {
    return { category: 'school_project', icon: '📚' };
  }

  // Field Trips & Outings
  if (/field trip|zoo|museum|aquarium|excursion|camp|tour|picnic|amusement|park/.test(text)) {
    return { category: 'field_trip', icon: '🚌' };
  }

  // Appointments / Doctor / Dentist
  if (/doctor|dentist|ortho|dr\.|pediatrician|checkup|eye|vaccine|shot|clinic|therapy|haircut/.test(text)) {
    if (/dentist|tooth|teeth|ortho/.test(text)) return { category: 'appointment', icon: '🦷' };
    if (/haircut|barber|salon/.test(text)) return { category: 'appointment', icon: '✂️' };
    return { category: 'appointment', icon: '🩺' };
  }

  // Birthday & Celebrations
  if (/birthday|bday|party|anniversary|celebrate|shower/.test(text)) {
    return { category: 'birthday', icon: '🎂' };
  }

  // Milestones & Ceremonies
  if (/graduation|recital|award|belt test|concert|play|showcase|ceremony/.test(text)) {
    return { category: 'milestone', icon: '🎖️' };
  }

  // Family Fun & Vacations
  if (/family|vacation|trip|flight|hotel|beach|camping|s'mores|movie|disney|holiday/.test(text)) {
    return { category: 'family', icon: '⛺' };
  }

  return { category: 'other', icon: '📌' };
};

// Convert Google Event to ChoreQuest CalendarEvent
export const convertGoogleEventToCalendarEvent = (
  gEvent: GoogleCalendarEventItem,
  kids: KidProfile[] = []
): CalendarEvent => {
  const summary = gEvent.summary?.trim() || 'Untitled Event';
  const description = gEvent.description?.trim() || '';
  const { category, icon } = inferCategoryAndIcon(summary, description);

  let dateStr = '';
  let timeStr: string | undefined = undefined;
  let endTimeStr: string | undefined = undefined;

  if (gEvent.start?.date) {
    // All-day event (YYYY-MM-DD)
    dateStr = gEvent.start.date;
  } else if (gEvent.start?.dateTime) {
    const startDate = new Date(gEvent.start.dateTime);
    dateStr = startDate.toISOString().split('T')[0];
    timeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  if (gEvent.end?.dateTime) {
    const endDate = new Date(gEvent.end.dateTime);
    endTimeStr = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  // Check if title mentions any specific kid's name
  let assignedKidIds: string[] = ['all'];
  const matchedKid = kids.find((k) => {
    const kidNameRegex = new RegExp(`\\b${k.name.trim()}\\b`, 'i');
    return kidNameRegex.test(summary) || kidNameRegex.test(description);
  });

  if (matchedKid) {
    assignedKidIds = [matchedKid.id];
  }

  return {
    id: `gcal-${gEvent.id}`,
    title: summary,
    description: description || undefined,
    date: dateStr,
    time: timeStr,
    endTime: endTimeStr,
    category,
    icon,
    location: gEvent.location?.trim() || undefined,
    assignedKidIds,
    isImportant: /urgent|important|must|mandatory|due|test|exam/i.test(`${summary} ${description}`),
  };
};

// Helper: Parse standard iCalendar (.ics) format exported from Google Calendar or Apple Calendar
export const parseIcsContent = (icsText: string, kids: KidProfile[] = []): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  // Unfold multi-line ICS lines (lines starting with space or tab are continuations)
  const unfolded = icsText.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
  const lines = unfolded.split(/\r\n|\r|\n/);

  let inEvent = false;
  let summary = '';
  let description = '';
  let location = '';
  let dtStartRaw = '';
  let dtEndRaw = '';
  let uid = '';

  const parseIcsDate = (val: string): { date: string; time?: string } => {
    // Clean parameter prefix if present, e.g. "TZID=America/New_York:20260901T143000" or "VALUE=DATE:20260901"
    const colonIdx = val.indexOf(':');
    const dateStr = colonIdx >= 0 ? val.substring(colonIdx + 1).trim() : val.trim();

    if (dateStr.length >= 8) {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      const formattedDate = `${year}-${month}-${day}`;

      if (dateStr.includes('T')) {
        const timePart = dateStr.split('T')[1]?.replace('Z', '') || '';
        if (timePart.length >= 4) {
          const hour = timePart.substring(0, 2);
          const min = timePart.substring(2, 4);
          return { date: formattedDate, time: `${hour}:${min}` };
        }
      }
      return { date: formattedDate };
    }
    return { date: new Date().toISOString().split('T')[0] };
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('BEGIN:VEVENT')) {
      inEvent = true;
      summary = '';
      description = '';
      location = '';
      dtStartRaw = '';
      dtEndRaw = '';
      uid = `ics-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    } else if (trimmed.startsWith('END:VEVENT') && inEvent) {
      inEvent = false;
      if (dtStartRaw) {
        const startInfo = parseIcsDate(dtStartRaw);
        const endInfo = dtEndRaw ? parseIcsDate(dtEndRaw) : undefined;
        const cleanSummary = summary.replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\n/g, ' ').trim() || 'Untitled Event';
        const cleanDesc = description.replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\n/g, '\n').trim();
        const { category, icon } = inferCategoryAndIcon(cleanSummary, cleanDesc);

        // Check if title mentions any specific kid
        let assignedKidIds: string[] = ['all'];
        const matchedKid = kids.find((k) => {
          const kidNameRegex = new RegExp(`\\b${k.name.trim()}\\b`, 'i');
          return kidNameRegex.test(cleanSummary) || kidNameRegex.test(cleanDesc);
        });
        if (matchedKid) {
          assignedKidIds = [matchedKid.id];
        }

        events.push({
          id: uid,
          title: cleanSummary,
          description: cleanDesc || undefined,
          date: startInfo.date,
          time: startInfo.time,
          endTime: endInfo?.time,
          category,
          icon,
          location: location.replace(/\\,/g, ',').trim() || undefined,
          assignedKidIds,
          isImportant: /urgent|important|must|mandatory|due|test|exam/i.test(`${cleanSummary} ${cleanDesc}`),
        });
      }
    } else if (inEvent) {
      if (trimmed.startsWith('SUMMARY')) {
        const idx = trimmed.indexOf(':');
        if (idx >= 0) summary = trimmed.substring(idx + 1);
      } else if (trimmed.startsWith('DESCRIPTION')) {
        const idx = trimmed.indexOf(':');
        if (idx >= 0) description = trimmed.substring(idx + 1);
      } else if (trimmed.startsWith('LOCATION')) {
        const idx = trimmed.indexOf(':');
        if (idx >= 0) location = trimmed.substring(idx + 1);
      } else if (trimmed.startsWith('DTSTART')) {
        dtStartRaw = trimmed;
      } else if (trimmed.startsWith('DTEND')) {
        dtEndRaw = trimmed;
      } else if (trimmed.startsWith('UID:')) {
        uid = `ics-${trimmed.substring(4).trim().replace(/[^a-zA-Z0-9-_]/g, '_')}`;
      }
    }
  }

  return events;
};

// Fetch and parse iCal feed directly from URL (e.g. Google Calendar Secret Address or webcal link)
export const fetchIcsFeedFromUrl = async (
  feedUrl: string,
  kids: KidProfile[] = []
): Promise<CalendarEvent[]> => {
  if (!feedUrl || !feedUrl.trim()) {
    throw new Error('Please enter a valid Google Calendar Secret iCal URL.');
  }

  const endpoint = `/api/calendar/fetch-ics?url=${encodeURIComponent(feedUrl.trim())}`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.error || `Failed to fetch calendar feed (HTTP ${response.status})`);
  }

  const icsText = await response.text();
  const events = parseIcsContent(icsText, kids);
  if (events.length === 0) {
    throw new Error('No events could be extracted from this calendar feed. Make sure the URL is valid.');
  }
  return events;
};

