create table if not exists public.calendar_events (
  user_id uuid not null references auth.users(id) on delete cascade,
  id uuid not null,
  title text not null,
  description text not null default '',
  event_date date not null,
  start_time text not null default '',
  end_time text not null default '',
  repeat_rule text not null default 'none',
  repeat_interval integer not null default 1 check (repeat_interval > 0),
  repeat_unit text not null default '',
  location text not null default '',
  people text not null default '',
  notes text not null default '',
  is_done boolean not null default false,
  tag text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object'),
  updated_at timestamptz not null default now()
);
create table if not exists public.calex_events (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
create table if not exists public.calex_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.calendar_events enable row level security;
alter table public.user_preferences enable row level security;
alter table public.calex_events enable row level security;
alter table public.calex_preferences enable row level security;
create policy "Users manage their own calendar events" on public.calendar_events for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users manage their own preferences" on public.user_preferences for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can read their own Calex events" on public.calex_events for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their own Calex events" on public.calex_events for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their own Calex events" on public.calex_events for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete their own Calex events" on public.calex_events for delete to authenticated using ((select auth.uid()) = user_id);
create policy "Users can read their own Calex preferences" on public.calex_preferences for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their own Calex preferences" on public.calex_preferences for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their own Calex preferences" on public.calex_preferences for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.calendar_events, public.user_preferences, public.calex_events, public.calex_preferences to authenticated;
revoke all on public.calex_preferences from anon;
