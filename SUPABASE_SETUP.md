# Calex Supabase setup

Calex is a static GitHub Pages PWA. Its browser client uses the Supabase publishable key; the service-role/secret key must never be added to this repository.

## Project connection\n\nThis branch uses the Calex project in the `ageng002` Supabase organisation (`fxhzywzufnvoxapvtidn`). The browser client is configured in `app.js` with its project URL and publishable key. Never add a service-role key to the repository.\n\n## Migration limits\n\nThe new project contains the six Calex application tables, their row-level security policies, the three matching SQL migrations, and the `calex-gmail-auth` Edge Function. The source project had two Auth user accounts but no rows in the six public Calex tables and no Storage buckets. Auth accounts/password credentials, provider settings, SMTP configuration, and Edge Function secret values are not transferred by this migration. Users will need to register again in the new project. Reconfigure any enabled Auth providers and SMTP settings in the new project's dashboard.\n\nThe Gmail Edge Function is deployed, but Gmail linking remains unconfigured until its three secrets below are added to the new project. Do not copy the old token-encryption key if it is unavailable; use a new base64-encoded 32-byte key.\n\n## 1. Auth URL configuration

In the Supabase Dashboard, open **Authentication → URL Configuration** for the **Calex** project and set:

- **Site URL:** `https://andygeng2023.github.io/Calex/`
- **Additional Redirect URLs:** `https://andygeng2023.github.io/Calex/`

Keep the trailing slash so it exactly matches the URL used by the PWA. Add a separate local-development URL only if needed.

## 2. Require email confirmation

Open **Authentication → Sign In / Providers → Email** and make sure **Confirm email** is enabled. Calex uses Supabase's email confirmation flow and redirects back to the PWA. The user must click the confirmation email before email/password sign-in is permitted.

For email delivery beyond Supabase's default testing limits, configure a custom SMTP provider in Supabase Auth.

## 3. Configure Google sign-in

Google sign-in is wired into the Calex account screen, but Supabase cannot complete it until Google OAuth credentials are configured.

1. In Google Cloud Console, create/select a project and configure the Google Auth Platform consent screen.
2. Create an OAuth client with application type **Web application**.
3. Add this **Authorized JavaScript origin**:
   `https://andygeng2023.github.io`
4. Add this **Authorized redirect URI**:
   `https://fxhzywzufnvoxapvtidn.supabase.co/auth/v1/callback`
5. Copy the Google client ID and client secret into **Supabase Dashboard → Authentication → Sign In / Providers → Google** and enable Google. Do not put the client secret in this repository.
6. Test the Google button on the deployed PWA.

Google documentation: https://supabase.com/docs/guides/auth/social-login/auth-google

## 4. Data model and access control

- `public.calex_events` stores each user's events as JSONB, keyed by `user_id` and event `id`.
- `public.calex_preferences` stores each user's settings as JSONB.
- Row-level security is enabled. Policies limit read/write access to rows where `user_id = auth.uid()`.

The app preserves guest data locally and offers a first-login merge into the signed-in account. Cloud sync requires a valid signed-in session.

## 5. Persistent Gmail connection

The dedicated Gmail integration uses the separate Google OAuth client configured in `gmail-config.js`. Gmail linking is tied to a signed-in Calex account and uses a Supabase Edge Function so the long-lived Google refresh token is not exposed to browser code.

1. In Google Cloud Console, open the OAuth client matching the ID in `gmail-config.js`. Add `https://andygeng2023.github.io` to **Authorized JavaScript origins** (and `http://localhost:4173` only for local development).
2. In Supabase Dashboard → **Edge Functions → Secrets**, add:
   - `CALEX_GMAIL_CLIENT_ID`: the same web OAuth client ID as `gmail-config.js`.
   - `CALEX_GMAIL_CLIENT_SECRET`: the secret for that same Google OAuth client. Keep it in Supabase only.
   - `CALEX_GMAIL_TOKEN_ENCRYPTION_KEY`: a base64-encoded, randomly generated 32-byte key (for example, generate one locally with `openssl rand -base64 32`). Keep this key stable; rotating it without re-encrypting saved records will make existing connections unreadable.
3. Confirm the `calex-gmail-auth` Edge Function is deployed with JWT verification enabled. The database table `public.calex_gmail_connections` has RLS enabled and no browser-role access.
4. Sign in to Calex, open Email, and connect Gmail. Refresh the page and reopen Email; the saved account should restore without repeating Google consent.
5. Disconnect Gmail in Calex and confirm the account is removed from the saved connections.

The function and table can be deployed without the OAuth client secret, but Gmail linking will return a configuration error until all three secrets are set. Never add these secrets to this repository or a client-side JavaScript file.

## 6. Deployment smoke test

After changing Auth settings and deploying:

1. Create an account with an email you can access.
2. Verify that the confirmation email returns to `https://andygeng2023.github.io/Calex/`.
3. Sign in, create an event, and change a preference.
4. Open Calex in another browser/device, sign in with the same account, and confirm the event and preference are present.
5. Test Google sign-in after provider setup, then sign out and confirm account data isn't visible under another user.

If confirmation links or OAuth redirects fail, check the Site URL and exact additional redirect URL above first.
## 7. Enable productivity cloud sync (feature branch)

The productivity workspace uses a separate per-user JSONB row and does not reuse the calendar event table. The migration is applied to the new Calex project in ageng002's organisation. The core schema, Gmail connection table, and productivity table are installed in the new project from the versioned migrations in `supabase/migrations/`. It creates `public.calex_productivity` with row-level security and policies restricting every row to `auth.uid() = user_id`. Do not disable RLS or grant anonymous access.

After the migration is applied, sign in to Calex and open Tasks. Productivity data will merge with the account row and sync when online. If the migration is not installed, Calex keeps local data and displays a cloud-sync setup message. This initial implementation merges local and remote records by per-item timestamps; it is not a transactional collaboration engine, so concurrent edits across devices still need additional conflict-resolution testing before production claims.
