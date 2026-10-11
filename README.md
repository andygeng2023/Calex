# Calex

A responsive, offline-capable calendar PWA built with plain HTML, CSS and JavaScript. Designed for phones, tablets, and desktops, with optional Supabase sync and a user-enabled Puter.js planning assistant.

## Features

- Home screen with today's to-do and completed events, plus a **Coming up** list for the next 7 days.
- A desktop workspace sidebar, responsive tablet layout, and mobile bottom navigation.
- Month cards with event previews, a timed week calendar with overlap lanes, year view, a 30-day agenda, a mini-calendar, and a Today shortcut.
- Personal, Work & study, and Wellbeing calendars with synchronized category filters.
- Search by title, description, location or date; keyboard shortcuts; overlap warnings; focus-trapped event editing.
- Quick add with rule-based parsing of dates, times and repeats, and a full event editor.
- Repeating events (daily, weekly, fortnightly, monthly, yearly, custom intervals).
- **Undo** after deleting an event.
- **Import** `.ics` files (Google, Outlook, Apple, TickTick) and **export** your calendar, including repeat rules.
- Optional account sync: edits and deletions merge across devices using timestamps and delete markers (`sync.js`), with a sync status line and a **Sync now** button.
- Daily event, committed-time, and completion summaries.
- Works offline; follows your system dark mode on first run; persistent offline and storage-unavailable warnings.
- Installable PWA with PNG/maskable icons, app shortcuts, and a versioned service-worker cache.
- Optional Puter.js assistant: plan the day, find focus time, and review an event draft before saving.

## Run

```sh
npm ci
npm start
```

Open `http://localhost:4173`. The app is static and needs no build or server-side secret. See `SUPABASE_SETUP.md` for account sync and row-level-security configuration.

## Puter assistant

Open **Ask assistant**, click **Enable Puter assistant**, and then **Sign in to Puter** after the SDK has loaded. The extra click preserves a browser user gesture for the authentication popup. If the SDK is already available, authentication begins immediately.

The SDK is loaded lazily from `https://js.puter.com/v2/`. AI access is provided through the user's Puter account, not a Calex API key. Account access, usage allowances, and any charges are governed by Puter. The integration follows [Puter authentication](https://docs.puter.com/Auth/signIn/) and [Puter AI chat](https://docs.puter.com/AI/chat/) documentation.

Calendar sharing is off by default. When opted in, only the next 14 days of titles, dates, times, and locations are supplied, capped at 150 occurrences. Notes, descriptions, and people are excluded. Changing the context toggle clears the model conversation history; visible messages remain for reference. AI text is rendered as text, draft payloads are validated, and no AI-generated event is saved automatically. Live authentication and inference require user-account validation; automated tests mock the provider.

## Hosting and updates

GitHub Pages serves `main` from the repository root. Keep relative asset URLs and bump both HTML asset query versions and `sw.js`'s shell-cache name whenever releasing an update. New versions of this release use `v27`. The offline shell includes the app, local icons, and PNG install icons; cloud sync and AI need connectivity.

Existing guest/user event storage keys and Supabase configuration are retained. New calendars start empty rather than receiving unlabelled demo appointments. Browser storage is used by the original app for backwards compatibility and offline persistence; opaque sandbox previews can block it and may also block service workers and popup authentication. Test installation and live AI from the top-level Pages origin. Always export a calendar backup before major upgrades.

## Keyboard shortcuts

`N`: new event. `Q`: quick add. `/`: search. `T`: today. `M`/`W`/`Y`: month/week/year. `?`: help. `Escape`: close dialog. Shortcuts do not intercept typing in fields.

## Test

```
npm run test:unit
npx playwright install chromium
npm test
npm audit
```

See `QA.md` for the release coverage and the external-account checks still required.
