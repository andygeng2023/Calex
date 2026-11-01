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

## Productivity workspace and sync regression coverage

- Productivity workspace: create/persist tasks, edit notes and recurrence, checklist/subtask capture, archive/restore, completion undo, calendar navigation, natural-language quick add, list filters/sorting, advanced-tab rendering, and safe Markdown note previews.
- Sync merge unit tests include stale-device edits/deletes, local and remote newer edits, tombstones, legacy timestamps, first sync, settings merge, and equal-timestamp conflict convergence.
- Responsive checks should cover 375px, 820px, and 1440px, with no page-level horizontal overflow. On mobile, preserve the existing calendar gesture model and use internal scrolling only where intended.
- Before release, run the full workflow on the pull request and manually verify cross-device sync against the configured Supabase project. The repository's browser tests do not substitute for real account/RLS, concurrent-user, physical-device Safari, OAuth-provider, notification-delivery, or security sign-off.

## Calendar task UX regression checks

- Add a task from Home and from the calendar panel; confirm the compact form hides event-only fields and saves the task into the calendar.
- Add a subtask under a task, then a further nested subtask; confirm each level persists after re-render and can be completed independently.
- Confirm Home shows overdue items, the upcoming task timeline, and completion/due-date insights.
- Expand the bottom calendar panel and verify its overdue section; confirm the collapsed panel still preserves the existing compact handle behaviour.
- Confirm Special features contains only Focus, Notes, Countdowns, and Matrix, and that there is no redundant Tasks/Agenda navigation item.
- Run the 375px mobile viewport test and inspect WebKit/Safari layouts for horizontal overflow, clipped controls, and calendar gesture regressions.
