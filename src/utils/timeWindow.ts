import { ChoreCategory, ChoreItem } from '../types';

/**
 * Converts a 24-hour time string ("06:00", "19:30") to a friendly 12-hour format ("6:00 AM", "7:30 PM").
 */
export function formatTime12Hour(timeStr?: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  
  let hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return timeStr;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  return `${hours}:${formattedMinutes} ${ampm}`;
}

export interface TimeWindowStatus {
  hasRestriction: boolean;
  isAllowed: boolean;
  startTime?: string;
  endTime?: string;
  startTimeFormatted?: string;
  endTimeFormatted?: string;
  formattedRange?: string;
  message?: string;
  isBeforeWindow?: boolean;
  isAfterWindow?: boolean;
  minutesRemaining?: number;
  isNearingExpiration?: boolean;
  isUrgentExpiration?: boolean;
  expirationBadgeText?: string;
}

/**
 * Checks if the current time falls within the allowed time window of a chore category.
 */
export function checkCategoryTimeWindow(
  category?: ChoreCategory | null,
  currentTime: Date = new Date()
): TimeWindowStatus {
  if (!category || !category.timeWindow || !category.timeWindow.enabled) {
    return {
      hasRestriction: false,
      isAllowed: true,
    };
  }

  const { startTime, endTime } = category.timeWindow;
  if (!startTime || !endTime) {
    return {
      hasRestriction: false,
      isAllowed: true,
    };
  }

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  const startMinutes = (startH || 0) * 60 + (startM || 0);
  const endMinutes = (endH || 0) * 60 + (endM || 0);

  const currentH = currentTime.getHours();
  const currentM = currentTime.getMinutes();
  const nowMinutes = currentH * 60 + currentM;

  const startFormatted = formatTime12Hour(startTime);
  const endFormatted = formatTime12Hour(endTime);
  const formattedRange = `${startFormatted} – ${endFormatted}`;

  let isAllowed = false;
  let isBeforeWindow = false;
  let isAfterWindow = false;
  let minutesRemaining: number | undefined;
  let isNearingExpiration = false;
  let isUrgentExpiration = false;
  let expirationBadgeText: string | undefined;

  if (startMinutes <= endMinutes) {
    // Normal day window, e.g. 06:00 to 11:00
    isAllowed = nowMinutes >= startMinutes && nowMinutes <= endMinutes;
    if (nowMinutes < startMinutes) isBeforeWindow = true;
    if (nowMinutes > endMinutes) isAfterWindow = true;

    if (isAllowed) {
      minutesRemaining = Math.max(0, endMinutes - nowMinutes);
    }
  } else {
    // Spans midnight, e.g. 20:00 to 02:00
    isAllowed = nowMinutes >= startMinutes || nowMinutes <= endMinutes;
    if (nowMinutes < startMinutes && nowMinutes > endMinutes) {
      isBeforeWindow = true;
    }

    if (isAllowed) {
      if (nowMinutes >= startMinutes) {
        minutesRemaining = (1440 - nowMinutes) + endMinutes;
      } else {
        minutesRemaining = Math.max(0, endMinutes - nowMinutes);
      }
    }
  }

  if (isAllowed && minutesRemaining !== undefined) {
    // Flag nearing expiration if within 60 minutes of closing
    if (minutesRemaining <= 60) {
      isNearingExpiration = true;
      isUrgentExpiration = minutesRemaining <= 20;

      if (minutesRemaining <= 1) {
        expirationBadgeText = 'Closing now!';
      } else if (minutesRemaining < 60) {
        expirationBadgeText = `${minutesRemaining}m left`;
      } else {
        expirationBadgeText = '1h left';
      }
    }
  }

  let message = '';
  if (!isAllowed) {
    if (isBeforeWindow) {
      message = `This task opens for check-off at ${startFormatted} (${formattedRange}).`;
    } else if (isAfterWindow) {
      message = `Check-off window closed at ${endFormatted} (${formattedRange}).`;
    } else {
      message = `This task can only be checked off during its scheduled window: ${formattedRange}.`;
    }
  }

  return {
    hasRestriction: true,
    isAllowed,
    startTime,
    endTime,
    startTimeFormatted: startFormatted,
    endTimeFormatted: endFormatted,
    formattedRange,
    message,
    isBeforeWindow,
    isAfterWindow,
    minutesRemaining,
    isNearingExpiration,
    isUrgentExpiration,
    expirationBadgeText,
  };
}

/**
 * Checks time window status for a specific chore item.
 * Evaluates the category time window first, and optionally evaluates timeOfDay if enabled.
 */
export function checkChoreTimeWindow(
  chore?: ChoreItem | null,
  category?: ChoreCategory | null,
  currentTime: Date = new Date()
): TimeWindowStatus {
  if (category?.timeWindow?.enabled) {
    return checkCategoryTimeWindow(category, currentTime);
  }

  // If category has no custom window, check time-of-day period
  if (chore?.timeOfDay && chore.timeOfDay !== 'anytime') {
    const timeOfDayWindows: Record<'morning' | 'afternoon' | 'evening', { start: string; end: string }> = {
      morning: { start: '06:00', end: '11:30' },
      afternoon: { start: '12:00', end: '17:30' },
      evening: { start: '17:30', end: '21:30' },
    };
    const tod = timeOfDayWindows[chore.timeOfDay as 'morning' | 'afternoon' | 'evening'];
    if (tod) {
      const syntheticCat: ChoreCategory = {
        id: `tod-${chore.timeOfDay}`,
        name: `${chore.timeOfDay.charAt(0).toUpperCase() + chore.timeOfDay.slice(1)} Window`,
        icon: 'Clock',
        color: '#6366f1',
        order: 99,
        timeWindow: {
          enabled: true,
          startTime: tod.start,
          endTime: tod.end,
        },
      };
      return checkCategoryTimeWindow(syntheticCat, currentTime);
    }
  }

  return {
    hasRestriction: false,
    isAllowed: true,
  };
}
