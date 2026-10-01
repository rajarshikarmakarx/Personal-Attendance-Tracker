import axios from 'axios';
import { supabase } from '../lib/supabase';
import type {
  Subject,
  Teacher,
  TimetableEntry,
  TimetableBatchSave,
  ScheduleEntry,
  AttendanceRecord,
  AttendanceUpsert,
  OverallStats,
  SubjectStats,
  TeacherStats,
  Profile,
} from '../types/attendance';

export type ProfileOut = Profile;

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
export const createSubject = (data: { name: string; code?: string; short_name?: string; color?: string }) =>
  api.post<Subject>('/subjects', data).then(r => r.data);
export const deleteSubject = (id: number) => api.delete(`/subjects/${id}`);

// ── Teachers ──────────────────────────────────────────────────────────────────
export const getTeachers = () => api.get<Teacher[]>('/teachers').then(r => r.data);
export const getTeacher = (id: number) => api.get<Teacher>(`/teachers/${id}`).then(r => r.data);
export const createTeacher = (data: { name: string }) =>
  api.post<Teacher>('/teachers', data).then(r => r.data);

// ── Timetable & Weekly Schedule ───────────────────────────────────────────────
export const getTimetable = () => api.get<TimetableEntry[]>('/timetable').then(r => r.data);
export const getTimetableForWeekday = (weekday: string) =>
  api.get<TimetableEntry[]>(`/timetable/${weekday}`).then(r => r.data);
export const batchSaveTimetable = (payload: TimetableBatchSave) =>
  api.post<TimetableEntry[]>('/timetable/batch', payload).then(r => r.data);
export const deleteTimetableEntry = (entryId: number) =>
  api.delete(`/timetable/${entryId}`);
export const clearTimetable = () =>
  api.delete('/timetable/clear');

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
export const getProfile = () =>
  api.get<Profile>('/profile').then(r => r.data);

export const updateProfile = (data: { schedule_locked?: boolean }) =>
  api.patch<Profile>('/profile', data).then(r => r.data);

export const lockSchedule = () =>
  api.post<Profile>('/profile/lock').then(r => r.data);

export const unlockSchedule = () =>
  api.post<Profile>('/profile/unlock').then(r => r.data);

export default api;
