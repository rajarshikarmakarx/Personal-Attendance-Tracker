// ── Enums ────────────────────────────────────────────────────────────────────

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'CANCELLED' | 'UNMARKED';
export type Weekday = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
export type ClassType = 'L' | 'T' | 'LAB';

// ── Core entities ─────────────────────────────────────────────────────────────

export interface Subject {
  id: number;
  user_id?: string;
  name: string;
  code?: string | null;
  short_name: string;
  color?: string | null;
  created_at?: string;
}

export interface Teacher {
  id?: number;
  name: string;
}

export interface TimetableEntry {
  id: number;
  weekday: Weekday;
  start_time: string;
  end_time: string;
  room?: string | null;
  period_number?: number | null;
  class_type: ClassType;
  subject: Subject;
  teacher?: Teacher | null;
  teacher_name?: string | null;
}

export interface TimetableSlotInput {
  weekday: Weekday;
  start_time: string;
  end_time: string;
  subject_name: string;
  subject_code?: string;
  short_name?: string;
  teacher_name?: string;
  room?: string;
  class_type?: ClassType;
  period_number?: number;
}

export interface TimetableBatchSave {
  slots: TimetableSlotInput[];
  lock_schedule?: boolean;
}

// ── Profile ───────────────────────────────────────────────────────────────────

export interface Profile {
  user_id: string;
  email: string;
  schedule_locked: boolean;
  created_at: string;
}

// ── Schedule ──────────────────────────────────────────────────────────────────

export interface ScheduleEntry {
  timetable_entry_id: number;
  subject: Subject;
  teacher?: Teacher | null;
  teacher_name?: string | null;
  start_time: string;
  end_time: string;
  room?: string | null;
  class_type: ClassType;
  period_number?: number | null;
  status: AttendanceStatus;
  attendance_id: number | null;
  notes?: string | null;
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
  subject_code?: string | null;
  subject_short_name: string;
  present: number;
  absent: number;
  cancelled: number;
  conducted: number;
  percentage: number;
}

export interface TeacherStats {
  teacher_id?: number | null;
  teacher_name: string;
  subject_id: number;
  subject_name: string;
  subject_code?: string | null;
  present: number;
  absent: number;
  cancelled: number;
  conducted: number;
  percentage: number;
}
