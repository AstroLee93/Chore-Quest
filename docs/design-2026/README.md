# ChoreQuest 2026 redesign

The approved visual direction for the next version of ChoreQuest.
Phase 1 is built (see *Building it, in order* below); the rest is the spec.

`mockups/` holds the source of each screen from the design canvas
(`*.dc.html`, with `canvas.json` as the layout index). They're for reference
when building and won't open as standalone pages.

## Principles

1. **Calm chrome, joyful moments.** Navigation, lists, the parent tools and
   the wall stay quiet and neutral. Celebration is saved for moments that earn
   it: finishing the day, reaching a goal, birthdays.
2. **A style setting for each kid.** *Playful* for young kids (close to today's
   look), *Balanced* (default), and *Minimal* for teens: monochrome, plain
   words, colour only for deadlines.
3. **Plain language.** Today, Rewards, Savings, Dinners, Groceries,
   "Needs you", "32 to go". Playful names only in Playful style.
4. **Everything feeds the core loop.** Cook-mode helpers, pantry checks and
   dinner votes all earn points.

## Visual system

| Token | Midnight (default) |
|---|---|
| Background | `#0C0E13` (wall: `#08090C`) |
| Surface | `#161922` (wall: `#12141A`), 1px `rgba(255,255,255,0.06)` border |
| Text | `#F2F3F5` |
| Secondary text | `#9BA1AD` |
| Tertiary text | `#7C8290` |
| Accent | `#5B8CFF` (text-on-dark tint `#7FA6FF`) |
| Done | `#30D158` |
| Due soon | `#FFB547` / `rgba(255,159,10,0.14)` fill |

- **Kid colours** (rings, avatars) stay the same in every theme: Leo `#FFB547`,
  Maya `#FF6FA5`, Sam `#7FA6FF`. In the app, each kid's chosen colour.
- **Type:** Inter (SF Pro on Apple devices). Weights 300 for big numbers,
  400/500 for body text, 600/700 for titles; no extra-black. Fixed-width
  numerals. Large title 34px, section labels 13px uppercase.
- **Icons:** one line-icon set (lucide-react, 1.8–2px stroke). No emoji in
  the interface; avatars are initials on a tint of the kid's colour.
- **Shapes:** cards with 18–22px corners (28px on the wall), 44px minimum
  tap targets (80px rows on the wall), 12–16px button corners, pill chips.
- **Progress rings** per kid; segmented controls for switching views.

## Themes

| Theme | Mode | Background | Surface | Accent |
|---|---|---|---|---|
| Midnight | dark (default) | `#0C0E13` | `#161922` | `#5B8CFF` |
| Graphite & Sage | dark | `#101311` | `#1A1E1B` | `#8FC4A0` |
| Ember | dark | `#14100E` | `#1F1915` | `#F08A5D` |
| Nebula | dark | `#0D0B17` | `#191529` | `#A78BFA` |
| Paper | light | `#F6F3EE` | `#FFFFFF` | `#3D5AFE` |
| Fog | light | `#EEF1F4` | `#FFFFFF` | `#0F7C7E` |
| Sorbet | light (Playful) | `#FFF4EE` | `#FFFFFF` | `#E8437A` |
| Midnight Green | dark (team) | `#041618` | `#0B2A2E` | `#A5ACAF` |

## Screens

| Mockup | Screen | Key ideas |
|---|---|---|
| `Main` | Family · Today | Ring per kid, family goal, "Needs you" approvals inbox (photo proof), floating tab bar |
| `KidToday` | Kid's day, Balanced | Big ring, streak and savings, morning/afternoon/evening timeline, reward nudge |
| `KidMinimal` | Kid's day, Minimal | Light, monochrome, stat strip, plain list |
| `Savings` | Savings goal | Big balance, goal gauge with "about N weeks at your pace", 8-week chart, activity |
| `Rewards` | Rewards | Affordable items get a button; others show points remaining and progress |
| `Celebrate` | All done for today | The one celebratory screen: closed ring, points, streak, savings, badge |
| `Kiosk` | Wall · ambient | Clock, weather, upcoming events, family goal, column per kid; "Locked to wall mode · Exit · parent PIN" |
| `KioskKid` | Wall · kid session | 80px rows, timers, confirmation, idle countdown back to the wall; settings hidden |
| `Themes` | Theme collection | The eight themes above |
| `DinnerWeek` | Dinners | Week strip, tonight's card → cook mode / missing items, family vote, kid suggestions, grocery sync |
| `CookMode` | Cook mode | One step at a time, timer that shows on the wall, step ingredients, kitchen-helper task for a kid (+pts) |
| `GroceryList` | Groceries | By aisle, colour-coded source of each item (dinner / pantry / kid / person), budget estimate, kid requests, receipt scan, "I'm at the store" |
| `Pantry` | Pantry & budget | Three-level stock meters, "low or out → add to list", spices tab, 4-week spend against target, pantry check as a kid chore |
| `KitchenWall` | Wall · kitchen | Tonight, timers, helpers, vote with PIN, "Ask for an item" / "We ran out of…" requests, the week |

## Kiosk locking (unchanged)

Kiosk mode stays as it works today: it's saved on the device, exiting needs
the parent PIN, kid sessions only show "back to the wall", and it returns to
the wall when idle. The redesign only makes that state visible.

## Building it, in order

1. ✅ Tokens, type, icons and the per-kid Style setting —
   `src/utils/themes2026.ts`, `src/styles/cq2026.css` (incl. a compatibility
   layer that restyles not-yet-rebuilt screens on 2026 themes), Inter bundled
   locally, Look & feel picker in the kid avatar sheet.
2. ✅ (first pass) Kid screens: family home with rings (`KidSelector`),
   `KidDashboard` ring header + morning/afternoon/evening timeline +
   "All done for today", `ChoreCard`, kiosk rings and ambient clock. Still to
   do: the action tiles and badges/rewards hub on the kid dashboard, and the
   kiosk's priority cards.
3. Rewards, Savings, and the "all done" moment.
4. Kitchen: split `WeeklyMenuModal` / `WeeklyGroceryModal` into the Dinners,
   Cook mode, Groceries and Pantry screens, then the kitchen wall board.
5. Parent dashboard and the remaining modals.
