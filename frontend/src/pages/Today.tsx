import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getSchedule } from '../api/client';
import type { ScheduleEntry, AttendanceStatus } from '../types/attendance';
import AttendanceCard from '../components/AttendanceCard';
import DateNavigator from '../components/DateNavigator';
import { todayStr, format } from '../utils/date';

export default function Today() {
  const [date, setDate] = useState(todayStr());
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSchedule = useCallback(async (d: string) => {
    setLoading(true);
    try {
      const data = await getSchedule(d);
      setSchedule(data);
    } catch {
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSchedule(date); }, [date, loadSchedule]);

  const handleUpdate = useCallback((entryId: number, newStatus: AttendanceStatus, attendanceId: number | null) => {
    setSchedule(prev =>
      prev.map(e =>
        e.timetable_entry_id === entryId
          ? { ...e, status: newStatus, attendance_id: attendanceId }
          : e
      )
    );
  }, []);

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
  };

  const marked = schedule.filter(e => e.status !== 'UNMARKED').length;
  const present = schedule.filter(e => e.status === 'PRESENT').length;
  const absent = schedule.filter(e => e.status === 'ABSENT').length;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 60px' }}>
      {/* Date navigator */}
      <div style={{ animation: 'fadeInUp 0.5s var(--ease-out-expo) both' }}>
        <DateNavigator date={date} onDateChange={handleDateChange} />
      </div>

      {/* Progress summary */}
      {schedule.length > 0 && !loading && (
        <div
          style={{
            margin: '24px 0 28px',
            padding: '18px 24px',
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            animation: 'fadeInUp 0.5s var(--ease-out-expo) 0.1s both',
          }}
        >
          <div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              {marked}/{schedule.length}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8, fontWeight: 500 }}>classes marked</span>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, fontWeight: 600 }}>
            <span style={{ color: 'var(--green)' }}>P: {present}</span>
            <span style={{ color: 'var(--red)' }}>A: {absent}</span>
            <span style={{ color: 'var(--text-muted)' }}>C: {schedule.filter(e => e.status === 'CANCELLED').length}</span>
            {schedule.length - marked > 0 && (
              <span style={{ color: 'var(--yellow)' }}>? {schedule.length - marked}</span>
            )}
          </div>
        </div>
      )}

      {/* Schedule list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: 14 }}>
          Loading schedule...
        </div>
      ) : schedule.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            marginTop: 24,
            animation: 'fadeInScale 0.5s var(--ease-spring) both',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>☕</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.5px' }}>
            No classes scheduled
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {format(date, 'EEEE')}s are free days! Take a break.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {schedule.map((entry, idx) => (
            <AttendanceCard
              key={entry.timetable_entry_id}
              entry={entry}
              date={date}
              onUpdate={handleUpdate}
              index={idx}
            />
          ))}
        </div>
      )}
    </div>
  );
}
