// ── Enums ────────────────────────────────────────────────────────────────────

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'CANCELLED' | 'UNMARKED';
export type Weekday = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
export type ClassType = 'L' | 'T' | 'LAB';

// ── Core entities ─────────────────────────────────────────────────────────────

export interface Subject {
  id: number;
  name: string;
  code: string;
  short_name: string;
}

export interface Teacher {
  id: number;
  name: string;
}

export interface TimetableEntry {
  id: number;
  weekday: Weekday;
  start_time: string;
  end_time: string;
  room: string | null;
  period_number: number | null;
  class_type: ClassType;
  subject: Subject;
  teacher: Teacher;
}

// ── Schedule ──────────────────────────────────────────────────────────────────

export interface ScheduleEntry {
  timetable_entry_id: number;
  subject: Subject;
  teacher: Teacher;
  start_time: string;
  end_time: string;
  room: string | null;
  class_type: ClassType;
  period_number: number | null;
  status: AttendanceStatus;
  attendance_id: number | null;
  notes: string | null;
}

// ── Attendance ────────────────────────────────────────────────────────────────

export interface AttendanceRecord {
  id: number;
  timetable_entry_id: number;
  date: string;
  status: Exclude<AttendanceStatus, 'UNMARKED'>;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceUpsert {
  timetable_entry_id: number;
  date: string;
  status: Exclude<AttendanceStatus, 'UNMARKED'>;
  notes?: string;
}

// ── Statistics ────────────────────────────────────────────────────────────────

export interface OverallStats {
  present: number;
  absent: number;
  cancelled: number;
  conducted: number;
  percentage: number;
}

export interface SubjectStats {
  subject_id: number;
  subject_name: string;
  subject_code: string;
  subject_short_name: string;
  present: number;
  absent: number;
  cancelled: number;
  conducted: number;
  percentage: number;
}

export interface TeacherStats {
  teacher_id: number;
  teacher_name: string;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  present: number;
  absent: number;
  cancelled: number;
  conducted: number;
  percentage: number;
}
