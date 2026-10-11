# Calex release QA

## Coverage inventory

- Responsive overview, Full dates timeline, compact month/week grids, agenda, settings, and assistant at 375px, 820px, and 1440px.
- Create, edit, complete, delete, undo, recurring, all-day, timed, and categorized events.
- Pointer drag switching in both directions through Full dates/month/week; separate year/month arrow navigation; mini-calendar; Today; search; category filter toggles and empty states.
- Unboxed ordinary date backgrounds in light/dark mode, selected green fill, today outline, and no visible view-switch toolbar; drag and M/W/Y shortcuts still switch views.
- Centered Quick event/Add event labels and equal-height native date/time, text, and select fields at phone, tablet, and desktop widths, with a mobile WebKit regression check.
- Event validation, overlap warning, keyboard shortcuts, focus trap/return, native dialog dismissal, light/dark cycle.
- ICS import, duplicate skipping, export, local reload persistence, offline shell, PWA manifest and icon assets.
- Google-first authentication layout, Google-only account guidance, signup feedback, SMTP/rate-limit failures, confirmation resend cooldown, and password recovery/confirmation.
- Puter SDK lazy loading, deliberate authentication, disabled send before sign-in, successful response rendering, draft review without automatic save, context opt-in/off, request error, and timeout behavior.
- Off-happy-path checks: malformed AI event payload, HTML injection in AI response and event title, unavailable storage, unavailable Supabase/AI network, invalid end time.

## External sign-off limitations

The v30 highlight/input update is covered by 30 browser tests (29 Chromium and one mobile WebKit) and 33 unit tests. Browser checks cover selected fill, today outline, action-label centering, native field dimensions and event creation. Mobile WebKit form screenshots are also inspected; this is not a physical-device Safari sign-off.

The v29 visual cleanup passed 26 browser tests and all 33 unit tests. Phone/desktop calendar screenshots were checked for bare date numbers, the previous selected-date underline, absent mode switch, visible navigation arrows, and filter access.

The v27 run passed 17 Chromium browser tests and 33 import/sync unit tests; the v28 corrective release expands coverage to 25 browser tests with explicit drag and authentication checks. `npm audit` reported zero known vulnerabilities at the time of the initial release. Desktop, tablet, and mobile screenshots are inspected, including compact calendar views, dark appearance, and authentication. The fixed calendar shell must not have page-level horizontal or vertical overflow; the continuous Full dates timeline and long event lists scroll internally. This is not a full cross-browser, security, or Supabase row-level-security audit.

Live Puter authentication and paid/allowance-backed inference require an actual user's Puter account and are not exercised by automated tests. Puter integration tests use deterministic mocked SDK responses and errors. Supabase sign-in, database row-level security, and real cross-device sync require owner-account validation; pure merge rules and guest flows are tested here.

## Storage and hosting

Calex remains a static GitHub Pages PWA. Existing guarded browser storage is retained for backwards compatibility and offline persistence. A sandboxed preview can block storage, service workers, or popup authentication; Calex must remain usable and warn about unavailable persistence. Full PWA and live assistant testing should use the top-level GitHub Pages origin, not an opaque iframe.
