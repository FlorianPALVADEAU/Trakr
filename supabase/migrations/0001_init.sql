-- Trakr — initial schema. Every user-owned table has RLS: user_id = auth.uid().
create extension if not exists pgcrypto;

create type session_kind as enum ('push','pull','legs','upper','lower','cardio','rest');
create type session_status as enum ('planned','done','skipped');

-- Profiles (1:1 with auth.users) ------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  height_cm numeric(5,1),
  birth_year int,
  timezone text not null default 'Europe/Paris',
  created_at timestamptz not null default now()
);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- Exercise catalog (shared, read-only for users) -------------------------------
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  muscle_group text,
  is_unilateral boolean not null default false
);

-- Plan: phases and events (ski trips, etc.) ----------------------------------
create table public.plan_phases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  goal text,
  starts_on date not null,
  ends_on date not null,
  notes jsonb not null default '{}'::jsonb,
  check (ends_on >= starts_on)
);

create table public.plan_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  kind text not null default 'trip',
  starts_on date not null,
  ends_on date not null,
  notes text,
  check (ends_on >= starts_on)
);

-- Training ----------------------------------------------------------------------
create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date date not null,
  kind session_kind not null,
  title text not null,
  starts_at time,
  program_week int,
  phase_id uuid references public.plan_phases(id) on delete set null,
  note text,
  status session_status not null default 'planned',
  unique (user_id, date)
);

create table public.session_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  exercise_id uuid references public.exercises(id),
  name text not null,
  position int not null,
  target text,
  tip text
);
create index on public.session_exercises (session_id, position);

create table public.set_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  session_exercise_id uuid not null references public.session_exercises(id) on delete cascade,
  set_no int not null,
  reps int,
  load_kg numeric(6,2),
  rpe numeric(3,1) check (rpe between 0 and 10),
  pain smallint check (pain between 0 and 10),
  note text,
  logged_at timestamptz not null default now(),
  unique (session_exercise_id, set_no)
);

-- Daily check-in (morning, very light) -----------------------------------------
create table public.daily_checkins (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date date not null,
  energy smallint check (energy between 1 and 5),
  soreness smallint check (soreness between 1 and 5),
  elbow_pain smallint check (elbow_pain between 0 and 10),
  knee_pain smallint check (knee_pain between 0 and 10),
  note text,
  primary key (user_id, date)
);

-- Body measures -------------------------------------------------------------------
create table public.body_measures (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date date not null,
  weight_kg numeric(5,2),
  body_fat_pct numeric(4,1),
  waist_navel_cm numeric(4,1),
  waist_below_navel_cm numeric(4,1),
  shoulders_cm numeric(4,1),
  chest_cm numeric(4,1),
  neck_cm numeric(4,1),
  arm_relaxed_cm numeric(4,1),
  arm_flexed_cm numeric(4,1),
  thigh_cm numeric(4,1),
  thigh_above_knee_cm numeric(4,1),
  calf_cm numeric(4,1),
  forearm_cm numeric(4,1),
  wrist_cm numeric(4,1),
  note text,
  primary key (user_id, date)
);

-- Garmin ----------------------------------------------------------------------------
create table public.garmin_connections (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','active','error')),
  last_sync_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create table public.garmin_daily (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date date not null,
  sleep_start time,
  sleep_end time,
  sleep_hours numeric(4,2),
  sleep_score int,
  deep_min int,
  rem_min int,
  resting_hr int,
  hrv_ms int,
  hrv_status text,
  body_battery_morning int,
  stress_avg int,
  steps int,
  training_readiness int,
  primary key (user_id, date)
);

create table public.garmin_activities (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  activity_id bigint not null,
  date date not null,
  type text,
  name text,
  duration_min numeric(7,1),
  distance_km numeric(7,2),
  avg_hr int,
  max_hr int,
  calories int,
  training_effect numeric(3,1),
  primary key (user_id, activity_id)
);
create index on public.garmin_activities (user_id, date desc);

-- Row Level Security -----------------------------------------------------------------
alter table public.profiles enable row level security;
create policy "own profile" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());

alter table public.exercises enable row level security;
create policy "catalog readable" on public.exercises for select to authenticated using (true);

do $$
declare t text;
begin
  foreach t in array array[
    'plan_phases','plan_events','workout_sessions','session_exercises','set_logs',
    'daily_checkins','body_measures','garmin_connections','garmin_daily','garmin_activities'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "own rows" on public.%I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end $$;
