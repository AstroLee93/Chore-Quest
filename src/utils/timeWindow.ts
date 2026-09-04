import { ChoreCategory } from '../types';

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

  if (startMinutes <= endMinutes) {
    // Normal day window, e.g. 06:00 to 11:00
    isAllowed = nowMinutes >= startMinutes && nowMinutes <= endMinutes;
    if (nowMinutes < startMinutes) isBeforeWindow = true;
    if (nowMinutes > endMinutes) isAfterWindow = true;
  } else {
    // Spans midnight, e.g. 20:00 to 02:00
    isAllowed = nowMinutes >= startMinutes || nowMinutes <= endMinutes;
    if (nowMinutes < startMinutes && nowMinutes > endMinutes) {
      isBeforeWindow = true;
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
  };
}
