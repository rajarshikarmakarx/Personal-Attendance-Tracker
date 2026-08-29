import axios from 'axios';
import { supabase } from '../lib/supabase';
import type {
  Subject,
  Teacher,
  TimetableEntry,
  ScheduleEntry,
  AttendanceRecord,
  AttendanceUpsert,
  OverallStats,
  SubjectStats,
  TeacherStats,
} from '../types/attendance';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const baseURL = rawApiUrl.endsWith('/api')
  ? rawApiUrl
  : `${rawApiUrl.replace(/\/+$/, '')}/api`;

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Inject Supabase JWT on every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// ── Subjects ──────────────────────────────────────────────────────────────────
export const getSubjects = () => api.get<Subject[]>('/subjects').then(r => r.data);
export const getSubject = (id: number) => api.get<Subject>(`/subjects/${id}`).then(r => r.data);

// ── Teachers ──────────────────────────────────────────────────────────────────
export const getTeachers = () => api.get<Teacher[]>('/teachers').then(r => r.data);
export const getTeacher = (id: number) => api.get<Teacher>(`/teachers/${id}`).then(r => r.data);

// ── Timetable ─────────────────────────────────────────────────────────────────
export const getTimetable = () => api.get<TimetableEntry[]>('/timetable').then(r => r.data);
export const getTimetableForWeekday = (weekday: string) =>
  api.get<TimetableEntry[]>(`/timetable/${weekday}`).then(r => r.data);

// ── Schedule ──────────────────────────────────────────────────────────────────
export const getSchedule = (date: string) =>
  api.get<ScheduleEntry[]>(`/schedule/${date}`).then(r => r.data);

export const getScheduleRange = (startDate: string, endDate: string) =>
  api.get<Record<string, ScheduleEntry[]>>('/schedule/range', {
    params: { start_date: startDate, end_date: endDate }
  }).then(r => r.data);

// ── Attendance ────────────────────────────────────────────────────────────────
export const upsertAttendance = (payload: AttendanceUpsert) =>
  api.put<AttendanceRecord>('/attendance', payload).then(r => r.data);

export const deleteAttendance = (attendanceId: number) =>
  api.delete(`/attendance/${attendanceId}`);

// ── Statistics ────────────────────────────────────────────────────────────────
export const getOverallStats = () =>
  api.get<OverallStats>('/statistics/overall').then(r => r.data);

export const getSubjectStats = () =>
  api.get<SubjectStats[]>('/statistics/subjects').then(r => r.data);

export const getTeacherStats = () =>
  api.get<TeacherStats[]>('/statistics/teachers').then(r => r.data);

// ── Profile ───────────────────────────────────────────────────────────────────
export interface ProfileOut {
  user_id: string;
  email: string;
  group_number: number;
  created_at: string;
}

export const getProfile = () =>
  api.get<ProfileOut>('/profile').then(r => r.data);

export const createProfile = (group_number: number) =>
  api.post<ProfileOut>('/profile', { group_number }).then(r => r.data);

export default api;
