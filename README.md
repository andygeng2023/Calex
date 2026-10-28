# Calex

A responsive, offline-capable calendar PWA built with plain HTML, CSS and JavaScript. Designed for phones, tablets, and desktops, with optional Supabase sync and a user-enabled Puter.js planning assistant.

## Features

- Home screen with today's to-do and completed events, plus a **Coming up** list for the next 7 days.
- A desktop workspace sidebar, responsive tablet layout, and mobile bottom navigation.
- The original drag-to-change Full dates, month, and compact week views, with separate year/month navigation arrows and a fixed-height calendar shell. Month/week controls and the event panel remain on screen; Full dates scrolls internally through the continuous timeline.
- Unboxed ordinary date numbers on the calendar background; the selected date has a green fill with white text, and today has a green outline. View changes use the drag handle or M/W/Y shortcuts, without a redundant mode-switch toolbar.
- A 30-day agenda, mini-calendar, and Today shortcut.
- Personal, Work & study, and Wellbeing calendars with synchronized category filters.
- Search by title, description, location or date; keyboard shortcuts; overlap warnings; focus-trapped event editing.
- Quick add with rule-based parsing of dates, times and repeats, and a full event editor.
- Centered calendar action labels and consistent 48px single-line event fields, including native mobile date/time inputs.
- Repeating events (daily, weekly, fortnightly, monthly, yearly, custom intervals).
- **Undo** after deleting an event.
- **Import** `.ics` files (Google, Outlook, Apple, TickTick) and **export** your calendar, including repeat rules.
- Optional account sync: edits and deletions merge across devices using timestamps and delete markers (`sync.js`), with a sync status line and a **Sync now** button.
- Daily event, committed-time, and completion summaries.
- Calendar-based tasks use a compact event-style form and support nested subtasks directly under each task. Home includes overdue items, a task timeline, and insights; Focus, Notes, Countdowns, and Matrix live under Special features.
- Works offline; follows your system dark mode on first run; persistent offline and storage-unavailable warnings.
- Installable PWA with PNG/maskable icons, app shortcuts, and a versioned service-worker cache.
- Bundled interface language selection for English, Spanish, French, German, Chinese, Japanese, and Korean, plus Auto to follow the device language. Translations work offline, and user-created event titles and notes remain as entered.
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

GitHub Pages serves `main` from the repository root. Keep relative asset URLs and bump both HTML asset query versions and `sw.js`'s shell-cache name whenever releasing an update. The current app-shell version is `v69`. Keep the asset query versions in `index.html` and the cache name and asset versions in `sw.js` aligned for each release. The productivity workspace and its advanced views are documented in `PRODUCTIVITY_PARITY.md`; that matrix explicitly separates implemented local features from integrations and collaboration features that still need work. The offline shell includes the app, calendar stylesheet, local icons, and PNG install icons; cloud sync and AI need connectivity.

Existing guest/user event storage keys and Supabase configuration are retained. New calendars start empty rather than receiving unlabelled demo appointments. Browser storage is used by the original app for backwards compatibility and offline persistence; opaque sandbox previews can block it and may also block service workers and popup authentication. Test installation and live AI from the top-level Pages origin. Always export a calendar backup before major upgrades.

## Gmail inbox and email-to-event drafts

Gmail connection is optional and off until the user clicks **Connect Gmail**. To enable it for a deployment:

1. In a Google Cloud project, enable the [Gmail API](https://developers.google.com/workspace/gmail/api/quickstart/js).
2. Configure the Google Auth Platform consent screen and create an OAuth 2.0 client ID for a **Web application**.
3. Add every deployment origin to the client's **Authorized JavaScript origins** (for example, the production Pages origin and any local development origin).
4. Put the client ID in `gmail-config.js` as `window.CALEX_GMAIL_CLIENT_ID`. The client ID is public; never add a client secret to browser code.
5. Add/authorize the `https://www.googleapis.com/auth/gmail.readonly` scope in the consent configuration and add permitted test users while testing.

Google categorizes `gmail.readonly` as a **restricted scope**. Google may require OAuth verification before an external/public app can provide this access to general users; check the current [Gmail scope and verification requirements](https://developers.google.com/workspace/gmail/api/auth/scopes) before release.

Gmail linking requires a signed-in Calex account. The browser obtains a short-lived Google access token through a server-exchanged authorization code; Calex stores only the encrypted Google refresh token in the server-only `public.calex_gmail_connections` table. The refresh token is AES-GCM encrypted with a key held in Supabase Edge Function secrets and is never returned to the browser. On later visits, Calex refreshes Gmail access from that saved connection; Google may still require reauthorization if access is revoked or the refresh token expires. The dedicated Email tab initially loads recent matching messages and snippets, with inbox, unread, and starred filters. Message cards open a full-text detail view; full message text is fetched only on demand. Inbox metadata, message bodies, and successful event-extraction results are cached in memory for the current page session to reduce repeated Gmail API and Puter calls without persisting email content in browser storage. Pagination is explicit to prevent background requests from exhausting quotas. Up to 12,000 characters of the selected message are sent to Puter AI for extraction. The prompt treats email content as untrusted input, and Calex opens an editable event draft; the user must review and save it. Disconnecting removes the saved server-side connection and attempts to revoke the Google refresh token.

Email conversion requires the Puter assistant to be enabled and signed in as well as Gmail access. Event extraction can be wrong; always verify the date, time, title, and location before saving. Email data is not intentionally persisted by the Gmail integration, but a draft the user saves can contain extracted event details.

## Keyboard shortcuts

`N`: new event. `Q`: quick add. `/`: search. `T`: today. `M`/`W`/`Y`: month/week/Full dates. `?`: help. `Escape`: close dialog. Shortcuts do not intercept typing in fields.

## Account sign-in and email confirmation

Google and email/password are distinct sign-in methods. An account originally created with Google can have a confirmed email but no password; use **Continue with Google** or use **Forgot password** to establish a password through the recovery flow. Creating that already-confirmed account again does not establish a password or necessarily send a new confirmation.

The app now displays authentication errors inline, provides a confirmation-resend action with a 60-second cooldown, and uses an explicit recovery form rather than `prompt()` to set a new password. A successful signup/resend request does not guarantee an email reached the inbox. Supabase controls delivery, rate limits, and anti-enumeration responses. Check [Supabase SMTP configuration](https://supabase.com/docs/guides/auth/auth-smtp) and Auth logs when troubleshooting genuine delivery failures. Never disable confirmation or manually alter a user's password as a shortcut.

## Test

```
npm run test:unit
npx playwright install --with-deps chromium webkit
npm test
npm audit
```

See `QA.md` for the release coverage and the external-account checks still required.
