-- ============================================================
-- Attendance Tracker — Supabase SQL Migration (Phase 2)
-- Run this entire script in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Subjects
create table if not exists subjects (
  id serial primary key,
  name varchar(255) not null unique,
  code varchar(50) not null unique,
  short_name varchar(100) not null
);

-- 2. Teachers
create table if not exists teachers (
  id serial primary key,
  name varchar(255) not null unique
);

-- 3. Weekday enum
do $$ begin
  create type weekday_enum as enum (
    'MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'
  );
exception when duplicate_object then null; end $$;

-- 4. Timetable entries  (group_number = 1 or 2)
create table if not exists timetable_entries (
  id serial primary key,
  subject_id integer not null references subjects(id) on delete cascade,
  teacher_id integer not null references teachers(id) on delete cascade,
  weekday weekday_enum not null,
  start_time time not null,
  end_time time not null,
  room varchar(100),
  period_number integer,
  class_type varchar(10) not null default 'L',
  group_number integer not null default 1
);

create index if not exists ix_timetable_weekday on timetable_entries(weekday);
create index if not exists ix_timetable_group   on timetable_entries(group_number);

-- 5. Profiles  (one row per user — stores group choice)
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  group_number integer not null check (group_number in (1, 2)),
  created_at timestamptz not null default now()
);

-- 6. Attendance status enum
do $$ begin
  create type attendance_status_enum as enum ('PRESENT','ABSENT','CANCELLED');
exception when duplicate_object then null; end $$;

-- 7. Attendance records  (per-user, per-group-entry)
create table if not exists attendance_records (
  id serial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  timetable_entry_id integer not null references timetable_entries(id) on delete cascade,
  date date not null,
  status attendance_status_enum not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, timetable_entry_id, date)
);

create index if not exists ix_attendance_date     on attendance_records(date);
create index if not exists ix_attendance_entry_id on attendance_records(timetable_entry_id);
create index if not exists ix_attendance_user_id  on attendance_records(user_id);

-- ============================================================
-- Row Level Security
-- ============================================================

-- Profiles: users manage only their own row
alter table profiles enable row level security;
create policy "Users manage own profile" on profiles
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Attendance: users manage only their own records
alter table attendance_records enable row level security;
create policy "Users manage own attendance" on attendance_records
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Shared tables: authenticated users can read; service role writes (seeding)
alter table subjects enable row level security;
create policy "Authenticated read subjects" on subjects
  for select using (auth.role() = 'authenticated');

alter table teachers enable row level security;
create policy "Authenticated read teachers" on teachers
  for select using (auth.role() = 'authenticated');

alter table timetable_entries enable row level security;
create policy "Authenticated read timetable" on timetable_entries
  for select using (auth.role() = 'authenticated');

-- ============================================================
-- Done! Now run: python seed_data.py  (from backend/ dir)
-- using your Supabase DATABASE_URL with the service role.
-- ============================================================
