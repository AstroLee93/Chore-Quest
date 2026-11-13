# ChoreQuest iOS design system

The app's look follows iOS: frosted-glass surfaces over a wallpaper, system
colors that adapt to light/dark, SF Pro type, and Home Screen web-app support.

## Themes

Six iOS themes live in `src/utils/iosThemes.ts` and are registered first in
`APP_THEMES`. New installs start on **Aurora** (`DEFAULT_THEME_ID`); saved
themes are kept.

| Theme    | Appearance | Wallpaper class      |
|----------|------------|----------------------|
| Aurora   | dark       | `wallpaper-aurora`   |
| Daylight | light      | `wallpaper-daylight` |
| Dusk     | dark       | `wallpaper-dusk`     |
| Ocean    | dark       | `wallpaper-ocean`    |
| Forest   | dark       | `wallpaper-forest`   |
| Midnight | dark       | `wallpaper-midnight` |

The original palettes (Coastal Horizon, Eagles, Buckeyes, …) still work and
pick up the adaptive components automatically.

## Light / dark

`applyThemeToDocument()` puts `.dark` on `<html>` for dark themes, and
`dark:` utilities follow that class, not the OS setting (see the
`@custom-variant` in `src/index.css`).

**Never hardcode `text-white/…` or `text-slate-…` in new UI.** Use the
semantic tokens from `src/styles/ios.css`, which flip with the theme:

| Use for              | Class                                              |
|----------------------|----------------------------------------------------|
| Primary text         | `text-label`                                       |
| Secondary text       | `text-label-secondary`                             |
| Tertiary / disabled  | `text-label-tertiary`                              |
| Hairlines            | `border-separator`, `bg-separator`                 |
| Neutral fills        | `bg-fill`, `bg-fill-strong`                        |
| Alpha of foreground  | `text-ink/60`, `bg-ink/5` …                        |
| System colors        | `text-ios-blue`, `bg-ios-green`, `ring-ios-orange` (also red, yellow, purple, teal, indigo, pink) |

## Components (`src/styles/ios.css`)

- Surfaces: `glass`, `glass-mid`, `glass-strong`
- Sheets: `ios-sheet-detached` (centered), `ios-sheet ios-sheet-adaptive`
  (bottom sheet on phones), `ios-backdrop`, `sheet-handle`
- `ios-sheet-light`: forces a light sheet *and* turns off `dark:` styles inside
  it. Used for older modals whose content was only designed on white.
- Lists: `ios-list` + `ios-list-item`, `section-header`
- Controls: `btn-ios` (+ `-primary`, `-tinted`, `-glass`, `-sm`),
  `btn-ios-icon`, `check-circle`, `ios-segmented` / `ios-segment`
- Labels: `ios-tag` (+ `-orange`, `-green`, `-blue`, `-purple`, `-red`,
  `-birthday`), `ios-callout`
- Type: `type-largetitle` … `type-caption2` (iOS Dynamic Type "Large" sizes)
- Motion: `animate-fade-up`, `animate-scale-in`, `animate-slide-up`,
  `animate-pin-shake`

The component classes sit in `@layer components`, so a Tailwind utility on the
same element (e.g. `absolute`, `p-0`) still wins.

### Migrating an old modal

Add `ios-sheet-detached` to the panel; its frosted background, hairline border
and radius replace the old `bg-yellow-50 border-4 border-yellow-300` frame
without removing those classes. If the panel's content has no `dark:` styles,
add `ios-sheet-light` as well. Render modals through `createPortal(…,
document.body)` (as `Modal.tsx` and `KidPinModal.tsx` do) so a transformed
ancestor can't trap the fixed overlay.

## Platform behavior

- **Home Screen app:** `index.html` + `public/manifest.webmanifest` +
  `public/icons/*` (standalone display, translucent status bar,
  `apple-touch-icon`). The `theme-color` meta follows the active theme.
- **Safe areas:** `viewport-fit=cover`; nav bars use `ios-navbar` /
  `pt-safe` / `pb-safe` / `px-safe` to clear the notch, Dynamic Island and
  home indicator.
- **No zoom-on-focus:** form fields are ≥16px on touch devices.
- **Haptics:** `haptic()` in `src/utils/haptics.ts` (vibrate on Android; the
  iOS 18+ switch-toggle tick on iPhone; no-op elsewhere).
- **Accessibility settings honored:** Reduce Motion, Reduce Transparency
  (solid materials), Increase Contrast (stronger hairlines). Tap targets
  are at least 44×44pt.
