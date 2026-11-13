/**
 * Lightweight haptic feedback for the web.
 *
 * - Android / Chromium: navigator.vibrate() with short patterns.
 * - iOS 18+ Safari (incl. Home Screen web apps): there is no vibrate API, but
 *   toggling a native `<input type="checkbox" switch>` plays the system haptic
 *   tick. We keep one hidden switch and "click" its label. This only works
 *   inside a user gesture (tap handler), which is the only place we call it.
 * - Everywhere else (desktop, the Pi kiosk) it is a silent no-op.
 */

export type HapticStyle = 'selection' | 'light' | 'success' | 'warning' | 'error';

const VIBRATE_PATTERNS: Record<HapticStyle, number | number[]> = {
  selection: 8,
  light: 12,
  success: [14, 60, 18],
  warning: [20, 80, 20],
  error: [30, 60, 30, 60, 30],
};

let iosSwitchLabel: HTMLLabelElement | null = null;

function isAppleTouchDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  // iPadOS reports itself as "Macintosh" — disambiguate with touch support.
  return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

function getIosSwitchLabel(): HTMLLabelElement | null {
  if (iosSwitchLabel) return iosSwitchLabel;
  if (typeof document === 'undefined' || !document.body) return null;

  const label = document.createElement('label');
  label.setAttribute('aria-hidden', 'true');
  label.style.cssText =
    'position:fixed;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;left:-9999px;top:0;';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.setAttribute('switch', '');
  input.tabIndex = -1;
  label.appendChild(input);

  document.body.appendChild(label);
  iosSwitchLabel = label;
  return label;
}

export function haptic(style: HapticStyle = 'light'): void {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(VIBRATE_PATTERNS[style]);
      return;
    }
    if (isAppleTouchDevice()) {
      getIosSwitchLabel()?.click();
    }
  } catch {
    // Haptics are a nicety; never let them break a tap handler.
  }
}
