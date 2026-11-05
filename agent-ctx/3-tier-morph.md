# Task 3 — Tier morph: page metadata + template gating/add-ons

Agent: Task 3 (report as Task ID 3)

## Status log
- [x] 3a registry: tier tags added to all non-home pages (16 multi-page templates; 5 low-tier are single-page).
      Mapping decisions noted at bottom of this file.
- [x] food: molo (low), kumo (mid), ember-oak (mid), fuoco (high), maison-ember (premium)
- [ ] health: willow, kalm, northfield, halden
- [ ] legal: iris, harrow, albright, meridian
- [ ] home: kettle, clearpane, brickwell, volt
- [ ] property: harbour-keys, rowan-vale, crestline, northbank
- [x] Fixed pre-existing type error: `src/lib/engine/resolve.ts` missing `type TierId` import (one line; file not on do-not-touch list; tier morph depends on it).
- [x] tsc --noEmit clean after food batch; eslint clean.

## Patterns established (reuse for remaining templates)
- Native-low (single page): NO gating of existing sections (any gate would hide at native). Wrap the
  existing "call panel"-class section in `TierBelow need="mid"` (still visible at native) and add
  3 compact add-ons: mid (order/booking form replacing the call panel), high (team/gallery), premium
  (membership strip). See molo.
- Native-mid: gate existing mid-class sections (menu highlights, reviews, FAQ, trust bar, booking
  widgets, hours-with-status) at `need="mid"`; `TierBelow need="mid"` starter call panel; add-ons at
  high + premium. NEVER gate existing high-class sections (team/gallery/stats) above mid — they are
  native, so gate them at mid too (≤ native rule). See kumo / ember-oak.
- Native-high: gate mid-class at mid, high-class at high (both show at native); `TierBelow` starter
  panel; ONE premium add-on (membership strip / portal teaser). See fuoco.
- Native-premium: gate mid-class at mid, high at high, premium (live availability/membership) at
  premium — all show at native. `TierBelow need="mid"` starter call panel. NO add-ons (no step above
  premium). See maison-ember / halden / volt / meridian / northbank.
- Form id pattern: use a unique field key in useForm (e.g. `useForm({ famiglia: "" })`) so the kit's
  `field()` id (`f-famiglia`) never collides with another form's `f-email` on the same page.
- CSS: APPEND a `/* ── tier morph … */` block at the end of the template's own css (never edit
  existing rules); mirror its prefix + section rhythm; add a small media query for the new sections.

## Registry page-tier mapping (final)
- kumo: menu=mid, reserve=mid
- ember-oak: menu=mid, reservations=mid, private-dining=mid (native-mid ⇒ capped at mid to preserve
  native nav; task's "high" guidance yields to the native-preservation hard rule), contact=always
- fuoco: events=mid (conversion intake), venues=high, careers=high
- maison-ember: menu/reserve/order=mid, circle=premium
- kalm: treatments=mid, book=mid
- northfield: find=mid (the conversion engine), consultants/locations/resources=high
- halden: care/telehealth/coverage=mid, portal=premium
- harrow: services=mid, team=mid (native-mid ⇒ mid, not high), review=mid
- albright: expertise=mid, people/insights/offices=high
- meridian: assess=mid, fees=mid, upload=premium, status=premium
- clearpane: quote=mid, plans=mid
- brickwell: services=mid, book=mid, areas=high, projects=high
- volt: book=mid, emergency=always (urgent contact), track=premium, care=premium
- rowan-vale: listings/viewing/sell=mid
- crestline: buy=mid, sell=mid, areas=high, agents=high
- northbank: purchase=mid, residences=high (the collection), progress=high, portal=premium
- NOTE: task brief said "rowan-vale=low, harbour-keys=mid" but registry.ts says harbour-keys=low,
  rowan-vale=mid — followed the registry (cross-check instruction).
