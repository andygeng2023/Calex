# Calex

A clean, offline-capable calendar and to-do PWA built with plain HTML, CSS and JavaScript, with optional Supabase sync (email and Google sign-in).

## Features

- Home screen with today's to-do and completed events, plus a **Coming up** list for the next 7 days.
- Month, week and all-dates calendar views, a **Today** shortcut, and search by title, description, location or date.
- Quick add with rule-based parsing of dates, times and repeats, and a full event editor.
- Repeating events (daily, weekly, monthly, yearly, custom intervals).
- **Undo** after deleting an event.
- **Import** `.ics` files (Google, Outlook, Apple, TickTick) and **export** your calendar, including repeat rules.
- Optional account sync: edits and deletions merge across devices using timestamps and delete markers (`sync.js`), with a sync status line and a **Sync now** button.
- Works offline; follows your system dark mode on first run.

## Run

Serve this directory with any static server (for example `python3 -m http.server`). See `SUPABASE_SETUP.md` for sign-in and sync configuration.

## Test

```
node --test tests/ics.unit.js tests/sync.unit.js
npm test   # Playwright browser tests
```
