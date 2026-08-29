import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getSchedule, getOverallStats, getSubjectStats, getTeacherStats } from '../api/client';
import type { ScheduleEntry, OverallStats, SubjectStats, TeacherStats, AttendanceStatus } from '../types/attendance';
import AttendanceCard from '../components/AttendanceCard';
import SubjectCard from '../components/SubjectCard';
import { format, todayStr } from '../utils/date';

/* ── Presently theme tokens ── */
const C = {
  void:        '#080b13',
  panel:       '#111a2c',
  panelSoft:   '#0e1626',
  hairline:    'rgba(255,255,255,0.09)',
  hairlineSoft:'rgba(255,255,255,0.06)',
  cream:       '#f3ecdd',
  soft:        '#c7cfe0',
  muted:       '#8a93ab',
  gold:        '#e3b76a',
  goldSoft:    '#f0cd8f',
  goldDim:     'rgba(227,183,106,0.14)',
  green:       '#5bbf8a',
  greenBg:     'rgba(91,191,138,0.1)',
  greenBorder: 'rgba(91,191,138,0.22)',
  red:         '#d95f6a',
  redBg:       'rgba(217,95,106,0.1)',
  redBorder:   'rgba(217,95,106,0.22)',
  yellow:      '#e3b76a',
  yellowBg:    'rgba(227,183,106,0.1)',
  yellowBorder:'rgba(227,183,106,0.22)',
};

function AttendanceRing({ percentage }: { percentage: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  const color = percentage >= 85 ? C.green : percentage >= 75 ? C.gold : C.red;

  return (
    <div style={{ position: 'relative', width: 136, height: 136, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={136} height={136} viewBox="0 0 140 140">
        <circle cx={70} cy={70} r={r} fill="none" stroke={C.hairlineSoft} strokeWidth={9} />
        <circle
          cx={70} cy={70} r={r} fill="none"
          stroke={color} strokeWidth={9}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 1.2s var(--ease-out-expo), stroke 0.4s' }}
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 22,
            fontWeight: 500,
            color,
            lineHeight: 1,
          }}
        >
          {percentage > 0 ? `${percentage.toFixed(1)}%` : '—'}
        </div>
        <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '1px', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
          Overall
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: C.panelSoft,
  border: `1px solid ${C.hairline}`,
  borderRadius: 16,
  padding: '26px 28px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
};

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

  const marked    = schedule.filter(e => e.status !== 'UNMARKED').length;
  const present   = schedule.filter(e => e.status === 'PRESENT').length;
  const absent    = schedule.filter(e => e.status === 'ABSENT').length;
  const cancelled = schedule.filter(e => e.status === 'CANCELLED').length;
  const unmarked  = schedule.filter(e => e.status === 'UNMARKED').length;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ color: C.muted, fontSize: 14, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.5px' }}>Loading…</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '34px 24px 60px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32, animation: 'driftUp 0.7s cubic-bezier(0.16,1,0.3,1) both' }}>
        <div
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(26px,3vw,34px)',
            fontWeight: 500,
            color: C.cream,
            letterSpacing: '-0.5px',
          }}
        >
          Overview
        </div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
          {format(today, 'EEEE, d MMMM yyyy')}
        </div>
      </div>

      {/* Top Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 36 }}>
        {/* Overall attendance card */}
        <div
          style={{
            ...cardStyle,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            animation: 'driftUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.05s both',
          }}
        >
          <AttendanceRing percentage={overall?.percentage ?? 0} />
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
              Overall Attendance
            </div>
            <div
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 32,
                fontWeight: 500,
                color: C.cream,
                letterSpacing: '-0.5px',
                lineHeight: 1,
              }}
            >
              {overall ? `${overall.present}/${overall.conducted}` : '0/0'}
            </div>
            <div style={{ fontSize: 13, color: C.soft, marginTop: 10, display: 'flex', gap: 14, fontFamily: "'Inter', sans-serif" }}>
              <span style={{ color: C.green, fontWeight: 600 }}>✓ {overall?.present ?? 0} present</span>
              <span style={{ color: C.red, fontWeight: 600 }}>✗ {overall?.absent ?? 0} absent</span>
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
              {overall?.cancelled ?? 0} cancelled
            </div>
          </div>
        </div>

        {/* Today's progress card */}
        <div
          style={{
            ...cardStyle,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            animation: 'driftUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 3, fontFamily: "'JetBrains Mono', monospace" }}>
                Today's Progress
              </div>
              <div style={{ fontSize: 13, color: C.soft, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>
                {format(today, 'EEE, d MMM')}
              </div>
            </div>
            <Link
              to="/today"
              id="link-mark-today"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.gold,
                textDecoration: 'none',
                padding: '5px 14px',
                borderRadius: 999,
                border: `1px solid rgba(227,183,106,0.3)`,
                background: C.goldDim,
                transition: 'all 0.2s ease',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Mark →
            </Link>
          </div>

          {schedule.length === 0 ? (
            <div style={{ color: C.muted, fontSize: 13, padding: '16px 0', fontFamily: "'Inter', sans-serif" }}>
              No classes scheduled today
            </div>
          ) : (
            <>
              <div
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 30,
                  fontWeight: 500,
                  color: C.cream,
                  marginBottom: 14,
                  letterSpacing: '-0.4px',
                }}
              >
                {marked}/{schedule.length}
                <span style={{ fontSize: 14, fontWeight: 400, color: C.muted, marginLeft: 8, fontFamily: "'Inter', sans-serif" }}>marked</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[
                  { label: 'Present',  val: present,   color: C.green,  bg: C.greenBg,  border: C.greenBorder  },
                  { label: 'Absent',   val: absent,    color: C.red,    bg: C.redBg,    border: C.redBorder    },
                  { label: 'Cancelled',val: cancelled, color: C.muted,  bg: 'rgba(255,255,255,0.03)', border: C.hairlineSoft },
                  { label: 'Unmarked', val: unmarked,  color: C.gold,   bg: C.yellowBg, border: C.yellowBorder },
                ].map(({ label, val, color, bg, border }) => (
                  <div key={label} style={{ textAlign: 'center', padding: '9px 4px', borderRadius: 10, background: bg, border: `1px solid ${border}` }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 500, color }}>{val}</div>
                    <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, marginTop: 2, fontFamily: "'Inter', sans-serif" }}>{label}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Today's classes */}
      {schedule.length > 0 && (
        <div style={{ marginBottom: 40, animation: 'driftUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 20,
                fontWeight: 500,
                color: C.cream,
                letterSpacing: '-0.3px',
              }}
            >
              Today's Schedule
            </h2>
            {unmarked > 0 && (
              <span style={{ fontSize: 11, color: C.gold, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: C.yellowBg, border: `1px solid ${C.yellowBorder}`, fontFamily: "'JetBrains Mono', monospace" }}>
                ⚠ {unmarked} unmarked
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
        <div style={{ animation: 'driftUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s both' }}>
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 20,
              fontWeight: 500,
              color: C.cream,
              marginBottom: 16,
              letterSpacing: '-0.3px',
            }}
          >
            Subject Breakdown
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
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
