import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getSchedule, getOverallStats, getSubjectStats, getTeacherStats } from '../api/client';
import type { ScheduleEntry, OverallStats, SubjectStats, TeacherStats, AttendanceStatus } from '../types/attendance';
import AttendanceCard from '../components/AttendanceCard';
import SubjectCard from '../components/SubjectCard';
import { format, todayStr } from '../utils/date';

function AttendanceRing({ percentage }: { percentage: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  const color = percentage >= 85 ? 'var(--green)' : percentage >= 75 ? 'var(--yellow)' : 'var(--red)';
  const glow = percentage >= 85 ? 'var(--green-glow)' : percentage >= 75 ? 'rgba(245, 158, 11, 0.4)' : 'var(--red-glow)';

  return (
    <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={140} height={140} viewBox="0 0 140 140">
        <circle cx={70} cy={70} r={r} fill="none" stroke="rgba(255, 255, 255, 0.06)" strokeWidth={10} />
        <circle
          cx={70} cy={70} r={r} fill="none"
          stroke={color} strokeWidth={10}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{
            transition: 'stroke-dashoffset 1.2s var(--ease-out-expo), stroke 0.4s',
            filter: `drop-shadow(0 0 10px ${glow})`,
          }}
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <div
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 24,
            fontWeight: 800,
            color,
            letterSpacing: '-1px',
            lineHeight: 1,
          }}
        >
          {percentage > 0 ? `${percentage.toFixed(1)}%` : '—'}
        </div>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: 4 }}>
          Overall
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const today = todayStr();
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [overall, setOverall] = useState<OverallStats | null>(null);
  const [subjectStats, setSubjectStats] = useState<SubjectStats[]>([]);
  const [teacherStats, setTeacherStats] = useState<TeacherStats[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [sched, ov, sub, teach] = await Promise.all([
        getSchedule(today),
        getOverallStats(),
        getSubjectStats(),
        getTeacherStats(),
      ]);
      setSchedule(sched);
      setOverall(ov);
      setSubjectStats(sub);
      setTeacherStats(teach);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAttendanceUpdate = useCallback((entryId: number, newStatus: AttendanceStatus, attendanceId: number | null) => {
    setSchedule(prev =>
      prev.map(e =>
        e.timetable_entry_id === entryId
          ? { ...e, status: newStatus, attendance_id: attendanceId }
          : e
      )
    );
    Promise.all([getOverallStats(), getSubjectStats(), getTeacherStats()]).then(([ov, sub, teach]) => {
      setOverall(ov);
      setSubjectStats(sub);
      setTeacherStats(teach);
    });
  }, []);

  const marked = schedule.filter(e => e.status !== 'UNMARKED').length;
  const present = schedule.filter(e => e.status === 'PRESENT').length;
  const absent = schedule.filter(e => e.status === 'ABSENT').length;
  const cancelled = schedule.filter(e => e.status === 'CANCELLED').length;
  const unmarked = schedule.filter(e => e.status === 'UNMARKED').length;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px 60px' }}>
      {/* Header / Hero */}
      <div style={{ marginBottom: 36, animation: 'fadeInUp 0.6s var(--ease-out-expo) both' }}>
        <div
          style={{
            fontFamily: "'Outfit', 'Inter', sans-serif",
            fontSize: 32,
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-1px',
          }}
        >
          Overview
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
          {format(today, 'EEEE, d MMMM yyyy')}
        </div>
      </div>

      {/* Top Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, marginBottom: 40 }}>
        {/* Overall attendance card */}
        <div
          style={{
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: 28,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            animation: 'fadeInUp 0.6s var(--ease-out-expo) 0.05s both',
          }}
        >
          <AttendanceRing percentage={overall?.percentage ?? 0} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
              Overall Attendance
            </div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px', lineHeight: 1 }}>
              {overall ? `${overall.present}/${overall.conducted}` : '0/0'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 10, display: 'flex', gap: 14 }}>
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>✓ {overall?.present ?? 0} present</span>
              <span style={{ color: 'var(--red)', fontWeight: 600 }}>✗ {overall?.absent ?? 0} absent</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              {overall?.cancelled ?? 0} cancelled
            </div>
          </div>
        </div>

        {/* Today's progress card */}
        <div
          style={{
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px 32px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            animation: 'fadeInUp 0.6s var(--ease-out-expo) 0.1s both',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>
                Today's Progress
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                {format(today, 'EEE, d MMM')}
              </div>
            </div>
            <Link
              to="/today"
              id="link-mark-today"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#a78bfa',
                textDecoration: 'none',
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(124, 58, 237, 0.3)',
                background: 'rgba(124, 58, 237, 0.12)',
                transition: 'all 0.25s var(--ease-smooth)',
                boxShadow: '0 0 16px var(--glow-purple)',
              }}
            >
              Mark →
            </Link>
          </div>

          {schedule.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
              No classes scheduled today
            </div>
          ) : (
            <>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16, letterSpacing: '-0.5px' }}>
                {marked}/{schedule.length}
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 8 }}>marked</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[
                  { label: 'Present', val: present, color: 'var(--green)', bg: 'var(--green-bg)' },
                  { label: 'Absent', val: absent, color: 'var(--red)', bg: 'var(--red-bg)' },
                  { label: 'Cancelled', val: cancelled, color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.03)' },
                  { label: 'Unmarked', val: unmarked, color: 'var(--yellow)', bg: 'var(--yellow-bg)' },
                ].map(({ label, val, color, bg }) => (
                  <div key={label} style={{ textAlign: 'center', padding: '10px 4px', borderRadius: 'var(--radius-sm)', background: bg, border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, color }}>{val}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Today's classes */}
      {schedule.length > 0 && (
        <div style={{ marginBottom: 44, animation: 'fadeInUp 0.6s var(--ease-out-expo) 0.15s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              Today's Schedule
            </h2>
            {unmarked > 0 && (
              <span style={{ fontSize: 12, color: 'var(--yellow)', fontWeight: 600, padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'var(--yellow-bg)', border: '1px solid var(--yellow-border)' }}>
                ⚠ {unmarked} unmarked
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {schedule.map((entry, idx) => (
              <AttendanceCard
                key={entry.timetable_entry_id}
                entry={entry}
                date={today}
                onUpdate={handleAttendanceUpdate}
                compact
                index={idx}
              />
            ))}
          </div>
        </div>
      )}

      {/* Subject attendance */}
      {subjectStats.length > 0 && (
        <div style={{ animation: 'fadeInUp 0.6s var(--ease-out-expo) 0.2s both' }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 18, letterSpacing: '-0.5px' }}>
            Subject Breakdown
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {subjectStats.map((s, idx) => (
              <SubjectCard
                key={s.subject_id}
                stats={s}
                teacherStats={teacherStats.filter(t => t.subject_id === s.subject_id)}
                index={idx}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
