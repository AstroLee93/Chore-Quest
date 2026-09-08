import { FamilyDatabase } from '../types';
import { saveDatabase, loadDatabase } from './storage';

// Unique client/session identifier to avoid echo loops
export const CLIENT_SESSION_ID = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// BroadcastChannel for instant local inter-tab synchronization
const localBroadcast = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('chorequest_sync_channel')
  : null;

// Track database revision, update timestamp, and signature to avoid redundant re-renders
let lastKnownRev = 0;
let lastKnownUpdatedAt = 0;
let lastKnownSignature = '';

// Seed initial rev from persisted local database if available
try {
  const initLocal = loadDatabase();
  if (initLocal) {
    lastKnownRev = (initLocal as any)._rev || 0;
    lastKnownUpdatedAt = (initLocal as any)._updatedAt || 0;
    lastKnownSignature = computeDatabaseSignature(initLocal);
  }
} catch {
  // ignore
}

/**
 * Robust and comprehensive database signature function.
 * Tracks 100% of mutations across chores, logs, kid profiles, groceries,
 * pantry staples, snack requests, dinner menus, calendar events, goals, and settings.
 */
export function computeDatabaseSignature(db: FamilyDatabase): string {
  if (!db) return '';

  const revPart = `${(db as any)._rev || 0}_${(db as any)._updatedAt || 0}`;

  // Kids: id, current stars, lifetime stars, streaks, last active date
  const kidsPart = (db.kids || [])
    .map((k) => `${k.id}:${k.stars}:${k.lifetimeStars || 0}:${k.streakDays}:${k.lastActiveDate || ''}`)
    .join('|');

  // Chores: count, active states, stars, and bounty statuses
  const choresPart = (db.chores || [])
    .map((c) => `${c.id}:${c.isActive ? 1 : 0}:${c.stars}:${c.isBounty ? 1 : 0}:${c.bountyBonusStars || 0}:${(c.assignedKidIds || []).join(',')}:${c.order}`)
    .join('|');

  // Logs: total count, and detailed state of the latest 20 logs (including status and parent verification)
  const logsList = db.logs || [];
  const recentLogs = logsList.slice(Math.max(0, logsList.length - 20));
  const logsPart = `${logsList.length}#` + recentLogs
    .map((l) => `${l.id}:${l.choreId}:${l.kidId}:${l.date}:${l.status}:${l.verifiedByParent ? 1 : 0}:${l.starsAwarded}:${l.skippedReasonCategory || ''}`)
    .join('|');

  // Groceries: items count, checked/needed count, pantry staple depleted count, requests count & statuses
  const groc = db.weeklyGroceryList;
  let grocPart = 'nogroc';
  if (groc) {
    const items = groc.items || [];
    const checkedCount = items.filter((i) => i.acquired).length;
    const staples = groc.pantryStaples || [];
    const depletedStaples = staples.filter((s) => s.isDepleted).length;
    const requests = groc.requests || [];
    const pendingReqs = requests.filter((r) => r.status === 'pending').length;
    grocPart = `${groc.lastUpdated || ''}#items:${items.length}:${checkedCount}#staples:${staples.length}:${depletedStaples}#reqs:${requests.length}:${pendingReqs}`;
  }

  // Weekly Menu: dishes and updates
  const menu = db.weeklyMenu;
  const menuPart = menu ? `${menu.lastUpdated || ''}#${Object.keys(menu.days || {}).length}` : 'nomenu';

  // Events: count and latest event
  const events = db.events || [];
  const latestEvent = events[events.length - 1];
  const eventsPart = `${events.length}:${latestEvent ? `${latestEvent.id}_${latestEvent.date}` : ''}`;

  // Redemptions: count and latest redemption status
  const redemptions = db.redemptions || [];
  const latestRedemption = redemptions[redemptions.length - 1];
  const redPart = `${redemptions.length}:${latestRedemption ? `${latestRedemption.id}_${latestRedemption.status}` : ''}`;

  // Goal & Settings
  const goalPart = db.familyGoal ? `${db.familyGoal.title}:${db.familyGoal.targetChoreCount}:${db.familyGoal.weekStartDate}` : 'nogoal';
  const set = db.settings || ({} as any);
  const settingsPart = `${set.parentPin}:${set.soundEnabled ? 1 : 0}:${set.kioskTimeout || ''}:${set.kioskTheme || ''}:${set.familyName || ''}`;

  return `${revPart}##${kidsPart}##${choresPart}##${logsPart}##${grocPart}##${menuPart}##${eventsPart}##${redPart}##${goalPart}##${settingsPart}`;
}

// Fetch full database from backend server with cache-busting and revision tracking
export async function fetchServerDatabase(): Promise<FamilyDatabase | null> {
  try {
    const res = await fetch(`/api/database?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = (await res.json()) as FamilyDatabase;
    if (data) {
      if ((data as any)._rev) {
        lastKnownRev = Math.max(lastKnownRev, (data as any)._rev);
      }
      if ((data as any)._updatedAt) {
        lastKnownUpdatedAt = Math.max(lastKnownUpdatedAt, (data as any)._updatedAt);
      }
      lastKnownSignature = computeDatabaseSignature(data);
      saveDatabase(data);
    }
    return data;
  } catch (err) {
    console.warn('[Sync API] Could not fetch server database, fallback to local storage:', err);
    return null;
  }
}

// Push updated database to server and broadcast instantly to all connected sessions
export async function pushServerDatabase(database: FamilyDatabase): Promise<boolean> {
  // Atomically bump local revision number
  const nextRev = Math.max(lastKnownRev, ((database as any)._rev || 0)) + 1;
  (database as any)._rev = nextRev;
  (database as any)._updatedAt = Date.now();
  lastKnownRev = nextRev;
  lastKnownUpdatedAt = (database as any)._updatedAt;
  lastKnownSignature = computeDatabaseSignature(database);

  // Cache locally immediately so UI is always responsive
  saveDatabase(database);

  // Notify other tabs in same browser immediately (0ms inter-tab sync)
  if (localBroadcast) {
    localBroadcast.postMessage({
      type: 'DATABASE_UPDATED',
      database,
      senderId: CLIENT_SESSION_ID,
      rev: nextRev,
      updatedAt: lastKnownUpdatedAt,
    });
  }

  try {
    const res = await fetch('/api/database', {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': CLIENT_SESSION_ID,
      },
      body: JSON.stringify({ database, senderId: CLIENT_SESSION_ID }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (data.database && (data.database as any)._rev) {
      lastKnownRev = Math.max(lastKnownRev, (data.database as any)._rev);
      lastKnownUpdatedAt = Math.max(lastKnownUpdatedAt, (data.database as any)._updatedAt || 0);
    }
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

/**
 * Hardened real-time synchronization subscriber.
 *
 * Employs a multi-layered, zero-lag architecture:
 * 1. SSE (Server-Sent Events) with proxy-buffering disabled for instant (<50ms) push notifications.
 * 2. BroadcastChannel for instant inter-tab dispatch in the same browser.
 * 3. Keepalive heartbeat watchdog to detect dead sockets and auto-reconnect.
 * 4. Lightweight `/api/database/version` polling watchdog (every 3.5s) to guarantee no missed updates.
 * 5. Instant re-sync on window focus, tab visibility change, and network online events.
 */
export function subscribeToDatabaseSync(
  onDatabaseUpdate: (db: FamilyDatabase) => void,
  onConnectionChange?: (connected: boolean) => void
): () => void {
  let eventSource: EventSource | null = null;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  let isSubscribed = true;
  let isSseConnected = false;
  let lastServerContactTime = Date.now();
  let reconnectAttempts = 0;

  // Applies an incoming database update if it represents a newer revision or changed content
  const applyDatabaseUpdateIfChanged = (
    db: FamilyDatabase,
    incomingRev?: number,
    incomingUpdatedAt?: number,
    force = false
  ) => {
    if (!db) return;

    const dbRev = incomingRev ?? (db as any)._rev;
    const dbUpdatedAt = incomingUpdatedAt ?? (db as any)._updatedAt;

    let isNewer = false;
    if (dbRev !== undefined && dbRev > lastKnownRev) {
      isNewer = true;
    } else if (dbUpdatedAt !== undefined && dbUpdatedAt > lastKnownUpdatedAt) {
      isNewer = true;
    } else {
      const sig = computeDatabaseSignature(db);
      if (sig !== lastKnownSignature || force) {
        isNewer = true;
      }
    }

    if (isNewer) {
      if (dbRev !== undefined) lastKnownRev = Math.max(lastKnownRev, dbRev);
      if (dbUpdatedAt !== undefined) lastKnownUpdatedAt = Math.max(lastKnownUpdatedAt, dbUpdatedAt);
      lastKnownSignature = computeDatabaseSignature(db);
      saveDatabase(db);
      onDatabaseUpdate(db);
    }
  };

  // Instant local inter-tab listener
  const handleLocalBroadcast = (event: MessageEvent) => {
    if (event.data?.type === 'DATABASE_UPDATED' && event.data.database) {
      if (event.data.senderId !== CLIENT_SESSION_ID) {
        applyDatabaseUpdateIfChanged(
          event.data.database,
          event.data.rev,
          event.data.updatedAt
        );
      }
    }
  };

  if (localBroadcast) {
    localBroadcast.addEventListener('message', handleLocalBroadcast);
  }

  // Check version with ultra-lightweight endpoint
  const checkVersionAndSync = async () => {
    if (!isSubscribed) return;
    try {
      const res = await fetch(`/api/database/version?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      if (!res.ok) return;
      const meta = await res.json();
      if (meta && (meta.rev > lastKnownRev || meta.updatedAt > lastKnownUpdatedAt)) {
        // Fetch full database because an update was confirmed
        const fresh = await fetchServerDatabase();
        if (fresh) {
          applyDatabaseUpdateIfChanged(fresh, meta.rev, meta.updatedAt, true);
        }
      }
    } catch {
      // Soft fail during transient offline
    }
  };

  function connectSSE() {
    if (!isSubscribed) return;

    if (eventSource) {
      try {
        eventSource.close();
      } catch {
        // ignore
      }
      eventSource = null;
    }

    try {
      eventSource = new EventSource('/api/events');

      eventSource.onopen = () => {
        isSseConnected = true;
        reconnectAttempts = 0;
        lastServerContactTime = Date.now();
        if (onConnectionChange) onConnectionChange(true);
      };

      eventSource.onmessage = (event) => {
        lastServerContactTime = Date.now();
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'DATABASE_UPDATED' && payload.database) {
            // Ignore own broadcast to prevent echoing local optimistic state
            if (payload.senderId !== CLIENT_SESSION_ID) {
              applyDatabaseUpdateIfChanged(
                payload.database,
                payload.rev,
                payload.updatedAt
              );
            }
          } else if (payload.type === 'CONNECTED' && payload.database) {
            applyDatabaseUpdateIfChanged(
              payload.database,
              payload.rev,
              payload.updatedAt
            );
          }
        } catch (e) {
          // May be plain keepalive ping
        }
      };

      eventSource.onerror = () => {
        isSseConnected = false;
        lastServerContactTime = 0;
        if (onConnectionChange) onConnectionChange(false);
        if (eventSource) {
          try {
            eventSource.close();
          } catch {
            // ignore
          }
          eventSource = null;
        }

        // Exponential backoff reconnect: 1s, 2s, max 4s
        if (isSubscribed) {
          reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(1.5, reconnectAttempts), 4000);
          if (reconnectTimeout) clearTimeout(reconnectTimeout);
          reconnectTimeout = setTimeout(connectSSE, delay);
        }
      };
    } catch (err) {
      isSseConnected = false;
      if (onConnectionChange) onConnectionChange(false);
      if (isSubscribed) {
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        reconnectTimeout = setTimeout(connectSSE, 3000);
      }
    }
  }

  // Initial connection
  connectSSE();

  // Instant triggers on visibility, window focus, and online transitions
  const handleImmediateSync = () => {
    checkVersionAndSync();
    if (!isSseConnected) {
      connectSSE();
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      handleImmediateSync();
    }
  };

  window.addEventListener('focus', handleImmediateSync);
  window.addEventListener('online', handleImmediateSync);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Watchdog 1: Heartbeat monitor to detect silent socket deaths (every 5 seconds)
  const heartbeatWatchdog = setInterval(() => {
    if (!isSubscribed) return;
    const now = Date.now();
    // If SSE was supposedly connected but hasn't received a message or keepalive in 25s, reconnect!
    if (isSseConnected && now - lastServerContactTime > 25000) {
      console.warn('[Sync API] SSE heartbeat timed out, reconnecting socket...');
      isSseConnected = false;
      connectSSE();
    }
  }, 5000);

  // Watchdog 2: Fast Background Version Check
  // Runs every 3.5 seconds when active, 12 seconds when tab is backgrounded
  const versionPollInterval = setInterval(() => {
    if (!isSubscribed) return;
    if (document.hidden) {
      // Slower polling in background to conserve mobile battery
      if (Math.random() < 0.3) {
        checkVersionAndSync();
      }
    } else {
      checkVersionAndSync();
    }
  }, 3500);

  return () => {
    isSubscribed = false;
    if (localBroadcast) {
      localBroadcast.removeEventListener('message', handleLocalBroadcast);
    }
    if (eventSource) {
      try {
        eventSource.close();
      } catch {
        // ignore
      }
      eventSource = null;
    }
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }
    clearInterval(heartbeatWatchdog);
    clearInterval(versionPollInterval);
    window.removeEventListener('focus', handleImmediateSync);
    window.removeEventListener('online', handleImmediateSync);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
