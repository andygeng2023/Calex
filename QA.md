# Calex release QA

## Coverage inventory

- Responsive overview, month grid, week timeline, agenda, settings, and assistant at 375px, 820px, and 1440px.
- Create, edit, complete, delete, undo, recurring, all-day, timed, and categorized events.
- Month/week/year switching; next/previous navigation; mini-calendar; Today; search; category filter toggles and empty states.
- Event validation, overlap warning, keyboard shortcuts, focus trap/return, native dialog dismissal, light/dark cycle.
- ICS import, duplicate skipping, export, local reload persistence, offline shell, PWA manifest and icon assets.
- Puter SDK lazy loading, deliberate authentication, disabled send before sign-in, successful response rendering, draft review without automatic save, context opt-in/off, request error, and timeout behavior.
- Off-happy-path checks: malformed AI event payload, HTML injection in AI response and event title, unavailable storage, unavailable Supabase/AI network, invalid end time.

## External sign-off limitations

The local release run passed 17 Chromium browser tests and 33 import/sync unit tests. `npm audit` reported zero known vulnerabilities at the time of this release. Desktop, tablet, and mobile screenshots were inspected, including dark-mode calendar, week timeline, overview, and assistant states. No page-level horizontal overflow or uncaught app exceptions were observed in the exercised flows. This is not a full cross-browser, security, or Supabase row-level-security audit.

Live Puter authentication and paid/allowance-backed inference require an actual user's Puter account and are not exercised by automated tests. Puter integration tests use deterministic mocked SDK responses and errors. Supabase sign-in, database row-level security, and real cross-device sync require owner-account validation; pure merge rules and guest flows are tested here.

## Storage and hosting

Calex remains a static GitHub Pages PWA. Existing guarded browser storage is retained for backwards compatibility and offline persistence. A sandboxed preview can block storage, service workers, or popup authentication; Calex must remain usable and warn about unavailable persistence. Full PWA and live assistant testing should use the top-level GitHub Pages origin, not an opaque iframe.
