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
