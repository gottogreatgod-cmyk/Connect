# FORGE-KIT-REGISTRY — Kit Registry for the Module Forge

## What was built

When a playbook module id matches a real Template Factory kit component, the
Module Forge now renders the REAL interactive component (with honest demo
props) instead of the generic archetype card.

### Files

1. **`src/modules/registry.tsx`** (new, `'use client'`) — the kit registry:
   - `KIT_MODULE_IDS: string[]` — 67 playbook ids with real implementations
   - `hasKitModule(id: string): boolean` — prototype-safe lookup
   - `renderKitModule(m: PlaybookModule, tpl: TemplateDef): React.ReactNode`
   - Demo content derives from `CONTENT_PACKS[tpl.industry]` + the fictional
     NAP block (Berlin: +49 30 555 0134 / desk@example.com / 14 Foundry Lane).
     Every adapter that fabricates proof (credentials, team, plans, coverage
     figures, estimates) marks it with `DemoContentBadge` / a `DemoNote`.
   - Note: file is `.tsx` (not `.ts` as the brief sketched) because the
     adapters are JSX — `from "./registry"` resolves identically.

2. **`src/modules/index.tsx`** (modified, `ModuleCard` only) —
   `const real = hasKitModule(m.id) ? renderKitModule(m, tpl) : null`;
   kit matches render the wrapper + chip `FACTORY KIT · REAL · {name}` with
   `data-arch="kit"`, archetype switch untouched otherwise.

### Key mapping decisions (real kit signatures won over the sketch)

- `whatsapp-button` → the actual playbook id is **`whats-app-button`**
  (verified against `data/playbook.json`) — mapped under the real id.
- `call-now-panel` — kit `CallNowPanel.hours` is a `string`, not an array →
  passed `"Mon–Fri 08:00–18:00 · Sat 09:00–13:00"`.
- `cost-calculator` — kit `CostCalculator` also requires `ctaHref` →
  `#booking`; calc mirrors the ThermoNorth hvac-sizing basis
  (base €/m² per system type, +8% premium, max = min × 1.22).
- `configurator` — kit `Configurator` requires `title` → "Build your package".
- `process-timeline` — `duration` is required → `Stage N of M`.
- `trust-bar` — icon must be one of the kit icon keys → rotates
  BadgeCheck / ShieldCheck / HeartHandshake.
- `hero-campaign.deadline` — computed at render:
  `new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10)`.
- `mega-menu` — the header is pinned to tier 3 via `SiteContext.Provider`
  (tierStep "high") so the mega dropdown pattern actually renders in the
  forge; copy notes it is part of SiteHeader, not a separate component.
- `error-boundary` — includes a real fault-injection demo (`FaultDemo`
  throws during render; `TemplateErrorBoundary` catches and recovers).
- Tiny/position-fixed components (skip-to-content, cookie-consent,
  theme-toggle, language-switcher, back-to-top, offline-banner, breadcrumb,
  open-now-badge, sticky-action-bar, whats-app-button, ai-concierge,
  live-chat-launcher, animated-counter, form-field, inline-validation,
  phone-field, case-study-card, structured-data-block, mega-menu) are
  wrapped in the kit `<Section>` with eyebrow = m.section, title = m.name,
  description = m.purpose (or behaviour-explaining copy).
- Import cycle `index.tsx ⇄ registry.tsx` is safe: registry only touches
  `CONTENT_PACKS` inside adapter bodies, never at module-eval time.

### Verification

- `bun run lint` → clean (exit 0, no findings).
- `bunx tsc --noEmit` → no errors in the new/changed files (3 pre-existing
  errors live in files this task must not touch: kit/system.tsx
  `ConsentCategory` import, kit/conversion.tsx `<span htmlFor>`,
  sites/factory/nightflow.tsx credential `kind` widening).
- Runtime smoke test with bun: all 67 adapters render without throwing for
  ALL 5 industry packs (food / health / legal / home / property), and all 67
  ids exist in `data/playbook.json`.
- dev.log: `GET /?view=forge` → 200, `GET /?view=forge&m=site-header` → 200,
  `GET /` → 200, no compile errors after the change.

### Mapped ids (67)

chrome/system: skip-to-content, cookie-consent, theme-toggle, language-switcher,
back-to-top, offline-banner, error-boundary, breadcrumb, announcement-bar,
open-now-badge, site-header, site-footer, sticky-action-bar, mega-menu
heroes: hero-urgent, hero-local, hero-campaign, hero-cinematic, hero-video,
3-d-hero-object
proof: review-carousel, review-wall, google-reviews-embed, case-study-card,
case-study-index, credential-wall, guarantee-panel, team-grid,
team-credentials, trust-bar, results-stat-strip, animated-counter
conversion: contact-form, call-now-panel, quote-request-form, callback-request,
booking-calendar, membership-signup, newsletter-signup, emergency-triage,
financing-calculator, quote-calculator, cost-calculator, comparison-table,
configurator, process-timeline, personalized-recommendations, whats-app-button,
ai-concierge, live-chat-launcher, client-dashboard, client-portal-teaser,
project-status-portal, job-dispatch-teaser
local/content: hours-table, google-map-embed, service-area-map,
postcode-checker, neighborhood-pages, blog-index, structured-data-block
motion: before-after-slider, before-after-transition
forms: form-field, inline-validation, phone-field, success-state
