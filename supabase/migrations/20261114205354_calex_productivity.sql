-- Calex productivity data, one isolated document per authenticated user.
-- Apply this migration in the Supabase SQL editor before enabling cloud sync.
create table if not exists public.calex_productivity (
  user_id uuid primary key references auth.users(id) on delete cascade,
  productivity_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.calex_productivity enable row level security;
revoke all on table public.calex_productivity from anon;
grant select, insert, update, delete on table public.calex_productivity to authenticated;

drop policy if exists "Users can read their Calex productivity data" on public.calex_productivity;
create policy "Users can read their Calex productivity data"
  on public.calex_productivity for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their Calex productivity data" on public.calex_productivity;
create policy "Users can create their Calex productivity data"
  on public.calex_productivity for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their Calex productivity data" on public.calex_productivity;
create policy "Users can update their Calex productivity data"
  on public.calex_productivity for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their Calex productivity data" on public.calex_productivity;
create policy "Users can delete their Calex productivity data"
  on public.calex_productivity for delete to authenticated
  using ((select auth.uid()) = user_id);
