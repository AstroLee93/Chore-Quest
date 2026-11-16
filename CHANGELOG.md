# ChoreQuest changelog

Every release bumps the version in `package.json`. The running version is shown
at the bottom of the kiosk wall, in a kid's "Kid session" box, and at the top of
Parent admin → Settings. To check it from the Pi:

```bash
curl -s http://localhost:3000/api/version
```

## 2.1.0 — 2026-11-16

- **Version numbers.** The running version, commit and build date are shown in
  the app and served at `/api/version`.
- **Family Wish Catalog** replaces the Goal Selection & AI Retail Importer.
  Parents add and verify items (Parent admin → Kid-Coin Savings → Wish
  Catalog); kids pick their own goal from the Wish List (kid screen button,
  the wall's "…" menu, or Savings → New goal) and can ask for something else.
  Removing items asks first; "Mark as bought" closes reached goals.
- **Fix: kids sent back to the wall mid-chore.** The idle timer now waits while
  a chore timer is open, and shows a "Still there?" countdown before
  returning to the wall.

## 2.0.0 — 2026-11-15

- ChoreQuest 2026 redesign: 2026 themes, the ambient kiosk wall, kid rings,
  Kitchen, kiosk wallpapers with adjustable card visibility, and iPad layout.
