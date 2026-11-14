create table if not exists public.calex_gmail_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  google_subject text,
  scopes text[] not null default array[]::text[],
  refresh_token_ciphertext text not null,
  refresh_token_iv text not null,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.calex_gmail_connections enable row level security;
revoke all on table public.calex_gmail_connections from public, anon, authenticated;
grant all on table public.calex_gmail_connections to service_role;

comment on table public.calex_gmail_connections is
  'Server-only Gmail OAuth connection records. Refresh tokens are AES-GCM encrypted and never exposed through the Data API.';
