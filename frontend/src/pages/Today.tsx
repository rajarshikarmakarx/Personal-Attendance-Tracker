import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getSchedule } from '../api/client';
import type { ScheduleEntry, AttendanceStatus } from '../types/attendance';
import AttendanceCard from '../components/AttendanceCard';
import DateNavigator from '../components/DateNavigator';
import { todayStr, format } from '../utils/date';

/* ── Presently theme tokens ── */
const C = {
  panel:       '#111a2c',
  panelSoft:   '#0e1626',
  hairline:    'rgba(255,255,255,0.09)',
  hairlineSoft:'rgba(255,255,255,0.06)',
  cream:       '#f3ecdd',
  soft:        '#c7cfe0',
  muted:       '#8a93ab',
  gold:        '#e3b76a',
  goldDim:     'rgba(227,183,106,0.14)',
  goldBorder:  'rgba(227,183,106,0.22)',
  green:       '#5bbf8a',
  greenBg:     'rgba(91,191,138,0.1)',
  red:         '#d95f6a',
  redBg:       'rgba(217,95,106,0.1)',
};

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

  const marked   = schedule.filter(e => e.status !== 'UNMARKED').length;
  const present  = schedule.filter(e => e.status === 'PRESENT').length;
  const absent   = schedule.filter(e => e.status === 'ABSENT').length;
  const cancelled= schedule.filter(e => e.status === 'CANCELLED').length;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '30px 24px 60px' }}>
      {/* Date navigator */}
      <div style={{ animation: 'driftUp 0.7s cubic-bezier(0.16,1,0.3,1) both' }}>
        <DateNavigator date={date} onDateChange={handleDateChange} />
      </div>

      {/* Progress summary */}
      {schedule.length > 0 && !loading && (
        <div
          style={{
            margin: '20px 0 24px',
            padding: '16px 22px',
            background: C.panelSoft,
            border: `1px solid ${C.hairline}`,
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: 'driftUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both',
          }}
        >
          <div>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 500, color: C.cream }}>
              {marked}/{schedule.length}
            </span>
            <span style={{ fontSize: 13, color: C.muted, marginLeft: 8, fontFamily: "'Inter', sans-serif" }}>classes marked</span>
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
            <span style={{ color: C.green }}>P: {present}</span>
            <span style={{ color: C.red }}>A: {absent}</span>
            <span style={{ color: C.muted }}>C: {cancelled}</span>
            {schedule.length - marked > 0 && (
              <span style={{ color: C.gold }}>? {schedule.length - marked}</span>
            )}
          </div>
        </div>
      )}

      {/* Schedule list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: C.muted, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
          Loading schedule…
        </div>
      ) : schedule.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '70px 20px',
            background: C.panelSoft,
            border: `1px solid ${C.hairline}`,
            borderRadius: 16,
            marginTop: 20,
            animation: 'driftUp 0.7s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 14 }}>☕</div>
          <div
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 20,
              fontWeight: 500,
              color: C.cream,
              marginBottom: 8,
              letterSpacing: '-0.3px',
            }}
          >
            No classes scheduled
          </div>
          <div style={{ fontSize: 13, color: C.muted, fontFamily: "'Inter', sans-serif" }}>
            {format(date, 'EEEE')}s are free days. Take a breath.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
