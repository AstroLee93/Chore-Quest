import { FamilyDatabase } from '../types';
import { saveDatabase, loadDatabase } from './storage';

// Unique client/session identifier to avoid echo lags
export const CLIENT_SESSION_ID = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// BroadcastChannel for instant local inter-tab synchronization
const localBroadcast = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('chorequest_sync_channel')
  : null;

// Cache last known database signature to avoid redundant JSON parsing, React re-renders, and disk writes
let lastKnownSignature = '';

function computeDatabaseSignature(db: FamilyDatabase): string {
  if (!db) return '';
  // Lightweight hash signature from kids, chores count, logs length, settings, and events
  return `${db.kids?.map(k => `${k.id}_${k.stars}_${k.streakDays}`).join('|')}#${db.chores?.length}#${db.logs?.length}_${db.logs?.[db.logs.length - 1]?.id || ''}#${db.events?.length || 0}#${db.settings?.parentPin}_${db.settings?.soundEnabled}_${db.settings?.kioskTheme}`;
}

// Fetch full database from backend server with signature verification
export async function fetchServerDatabase(): Promise<FamilyDatabase | null> {
  try {
    const res = await fetch('/api/database', {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = (await res.json()) as FamilyDatabase;
    const newSig = computeDatabaseSignature(data);
    if (newSig !== lastKnownSignature) {
      lastKnownSignature = newSig;
      saveDatabase(data);
    }
    return data;
  } catch (err) {
    console.warn('[Sync API] Could not fetch server database, fallback to local storage:', err);
    return null;
  }
}

// Push updated database to server and broadcast to all connected sessions
export async function pushServerDatabase(database: FamilyDatabase): Promise<boolean> {
  const newSig = computeDatabaseSignature(database);
  lastKnownSignature = newSig;

  // Cache locally
  saveDatabase(database);

  // Notify other tabs in same browser immediately
  if (localBroadcast) {
    localBroadcast.postMessage({
      type: 'DATABASE_UPDATED',
      database,
      senderId: CLIENT_SESSION_ID,
      signature: newSig,
    });
  }

  try {
    const res = await fetch('/api/database', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': CLIENT_SESSION_ID,
      },
      body: JSON.stringify({ database, senderId: CLIENT_SESSION_ID }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return true;
  } catch (err) {
    console.warn('[Sync API] Failed to push database to server:', err);
    return false;
  }
}

// Verify PIN with server
export async function verifyParentPin(pin: string): Promise<{ valid: boolean; isDefaultPin?: boolean }> {
  try {
    const res = await fetch('/api/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch {
    // Local fallback check
    const local = loadDatabase();
    const isCorrect = pin === local.settings.parentPin;
    return {
      valid: isCorrect,
      isDefaultPin: local.settings.isDefaultPin ?? (local.settings.parentPin === '1234'),
    };
  }
}

// Change Parent PIN securely
export async function changeParentPin(
  currentPin: string,
  newPin: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/change-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPin, newPin, senderId: CLIENT_SESSION_ID }),
    });
    const result = await res.json();
    if (!res.ok) {
      return { success: false, error: result.error || 'Failed to update PIN' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error updating PIN' };
  }
}

// Subscribe to real-time events across all sessions/devices
export function subscribeToDatabaseSync(
  onDatabaseUpdate: (db: FamilyDatabase) => void,
  onConnectionChange?: (connected: boolean) => void
): () => void {
  let eventSource: EventSource | null = null;
  let reconnectTimeout: any = null;
  let isSubscribed = true;
  let isSseConnected = false;

  const applyDatabaseUpdateIfChanged = (db: FamilyDatabase) => {
    if (!db) return;
    const sig = computeDatabaseSignature(db);
    if (sig !== lastKnownSignature) {
      lastKnownSignature = sig;
      saveDatabase(db);
      onDatabaseUpdate(db);
    }
  };

  // Listen to same-browser tabs
  const handleLocalBroadcast = (event: MessageEvent) => {
    if (event.data?.type === 'DATABASE_UPDATED' && event.data.database) {
      if (event.data.senderId !== CLIENT_SESSION_ID) {
        applyDatabaseUpdateIfChanged(event.data.database);
      }
    }
  };

  if (localBroadcast) {
    localBroadcast.addEventListener('message', handleLocalBroadcast);
  }

  function connectSSE() {
    if (!isSubscribed) return;

    try {
      eventSource = new EventSource('/api/events');

      eventSource.onopen = () => {
        isSseConnected = true;
        if (onConnectionChange) onConnectionChange(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'DATABASE_UPDATED' && payload.database) {
            // Ignore own broadcast
            if (payload.senderId !== CLIENT_SESSION_ID) {
              applyDatabaseUpdateIfChanged(payload.database);
            }
          } else if (payload.type === 'CONNECTED' && payload.database) {
            applyDatabaseUpdateIfChanged(payload.database);
          }
        } catch (e) {
          console.error('[Sync API] Error parsing SSE payload:', e);
        }
      };

      eventSource.onerror = () => {
        isSseConnected = false;
        if (onConnectionChange) onConnectionChange(false);
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        // Reconnect after 4 seconds
        if (isSubscribed) {
          reconnectTimeout = setTimeout(connectSSE, 4000);
        }
      };
    } catch (err) {
      isSseConnected = false;
      console.warn('[Sync API] SSE connection error:', err);
      if (onConnectionChange) onConnectionChange(false);
      if (isSubscribed) {
        reconnectTimeout = setTimeout(connectSSE, 5000);
      }
    }
  }

  connectSSE();

  // Listen to window focus & online events to re-check fresh state
  const handleFocus = async () => {
    const fresh = await fetchServerDatabase();
    if (fresh) {
      applyDatabaseUpdateIfChanged(fresh);
    }
  };

  window.addEventListener('focus', handleFocus);
  window.addEventListener('online', handleFocus);

  // Relaxed background polling: Only runs every 30 seconds as fallback watchdog, avoids UI stutter
  const pollInterval = setInterval(async () => {
    if (!document.hidden && !isSseConnected) {
      const fresh = await fetchServerDatabase();
      if (fresh) {
        applyDatabaseUpdateIfChanged(fresh);
      }
    }
  }, 30000);

  return () => {
    isSubscribed = false;
    if (localBroadcast) {
      localBroadcast.removeEventListener('message', handleLocalBroadcast);
    }
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }
    clearInterval(pollInterval);
    window.removeEventListener('focus', handleFocus);
    window.removeEventListener('online', handleFocus);
  };
}
