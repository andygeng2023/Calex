# Calex Supabase setup

Calex is a static GitHub Pages PWA. Its browser client uses the Supabase publishable key; the service-role/secret key must never be added to this repository.

## 1. Auth URL configuration

In the Supabase Dashboard, open **Authentication → URL Configuration** for the **SimpleDay Calendar** project and set:

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
   `https://fwcijtjahtwpyaqedyhq.supabase.co/auth/v1/callback`
5. Copy the Google client ID and client secret into **Supabase Dashboard → Authentication → Sign In / Providers → Google** and enable Google. Do not put the client secret in this repository.
6. Test the Google button on the deployed PWA.

Google documentation: https://supabase.com/docs/guides/auth/social-login/auth-google

## 4. Data model and access control

- `public.calex_events` stores each user's events as JSONB, keyed by `user_id` and event `id`.
- `public.calex_preferences` stores each user's settings as JSONB.
- Row-level security is enabled. Policies limit read/write access to rows where `user_id = auth.uid()`.

The app preserves guest data locally and offers a first-login merge into the signed-in account. Cloud sync requires a valid signed-in session.

## 5. Deployment smoke test

After changing Auth settings and deploying:

1. Create an account with an email you can access.
2. Verify that the confirmation email returns to `https://andygeng2023.github.io/Calex/`.
3. Sign in, create an event, and change a preference.
4. Open Calex in another browser/device, sign in with the same account, and confirm the event and preference are present.
5. Test Google sign-in after provider setup, then sign out and confirm account data isn't visible under another user.

If confirmation links or OAuth redirects fail, check the Site URL and exact additional redirect URL above first.
