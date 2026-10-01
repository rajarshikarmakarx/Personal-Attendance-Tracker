-- ============================================================
-- Attendance Tracker — Clean Database Migration & Schema (Phase 3)
-- User-scoped subjects, teachers, timetable entries, and attendance
-- Run this script in Supabase Dashboard → SQL Editor or via reset_db.py
-- ============================================================

-- 0. Clean up old/legacy tables & types if they exist
drop table if exists attendance_records cascade;
drop table if exists timetable_entries cascade;
drop table if exists profiles cascade;
drop table if exists subjects cascade;
drop table if exists teachers cascade;

-- 1. Weekday enum
do $$ begin
  create type weekday_enum as enum (
    'MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'
  );
exception when duplicate_object then null; end $$;

-- 2. Attendance status enum
do $$ begin
  create type attendance_status_enum as enum ('PRESENT','ABSENT','CANCELLED');
exception when duplicate_object then null; end $$;

-- 3. Profiles (one row per auth user — tracks lock state)
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  schedule_locked boolean not null default false,
  created_at timestamptz not null default now()
);

-- 4. Subjects (user-scoped)
create table if not exists subjects (
  id serial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name varchar(255) not null,
  code varchar(50),
  short_name varchar(100) not null,
  color varchar(50),
  created_at timestamptz not null default now()
);

create index if not exists ix_subjects_user_id on subjects(user_id);
create index if not exists ix_subjects_name on subjects(name);

-- 5. Teachers (user-scoped)
create table if not exists teachers (
  id serial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name varchar(255) not null,
  created_at timestamptz not null default now()
);

create index if not exists ix_teachers_user_id on teachers(user_id);

-- 6. Timetable entries (user-scoped custom weekly schedule)
create table if not exists timetable_entries (
  id serial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id integer not null references subjects(id) on delete cascade,
  teacher_id integer references teachers(id) on delete set null,
  teacher_name varchar(255),
  weekday weekday_enum not null,
  start_time time not null,
  end_time time not null,
  room varchar(100),
  period_number integer,
  class_type varchar(10) not null default 'L',
  created_at timestamptz not null default now()
);

create index if not exists ix_timetable_user_id on timetable_entries(user_id);
create index if not exists ix_timetable_weekday on timetable_entries(weekday);

-- 7. Attendance records (per-user, per-timetable-entry, per-date)
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
-- Row Level Security (RLS)
-- ============================================================

-- Profiles: users manage only their own row
alter table profiles enable row level security;
create policy "Users manage own profile" on profiles
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Subjects: users manage only their own subjects
alter table subjects enable row level security;
create policy "Users manage own subjects" on subjects
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Teachers: users manage only their own teachers
alter table teachers enable row level security;
create policy "Users manage own teachers" on teachers
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Timetable: users manage only their own schedule
alter table timetable_entries enable row level security;
create policy "Users manage own timetable" on timetable_entries
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Attendance: users manage only their own records
alter table attendance_records enable row level security;
create policy "Users manage own attendance" on attendance_records
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
