import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getSubject, getTeacherStats, getSchedule } from '../api/client';
import type { Subject, TeacherStats, ScheduleEntry } from '../types/attendance';
import StatusBadge from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';
import { format, todayStr, subDays } from '../utils/date';

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
  goldBorder:  'rgba(227,183,106,0.28)',
  green:       '#5bbf8a',
  red:         '#d95f6a',
};

async function fetchSubjectHistory(subjectId: number, weeks = 8): Promise<Array<{ date: string; entry: ScheduleEntry }>> {
  const today = todayStr();
  const result: Array<{ date: string; entry: ScheduleEntry }> = [];
  const promises = Array.from({ length: weeks * 7 }, (_, i) => {
    const dateStr = subDays(today, i);
    return getSchedule(dateStr).then(entries => {
      for (const e of entries) {
        if (e.subject.id === subjectId && e.status !== 'UNMARKED') {
          result.push({ date: dateStr, entry: e });
        }
      }
    }).catch(() => {});
  });
  await Promise.all(promises);
  return result.sort((a, b) => b.date.localeCompare(a.date));
}

function getColor(pct: number): string {
  if (pct >= 85) return C.green;
  if (pct >= 75) return C.gold;
  return C.red;
}

const cardStyle = {
  background: C.panelSoft,
  border: `1px solid ${C.hairline}`,
  borderRadius: 18,
  boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
};

export default function SubjectDetail() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [teacherStats, setTeacherStats] = useState<TeacherStats[]>([]);
  const [history, setHistory] = useState<Array<{ date: string; entry: ScheduleEntry }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);

  useEffect(() => {
    if (!subjectId) return;
    const id = Number(subjectId);
    Promise.all([getSubject(id), getTeacherStats(), fetchSubjectHistory(id)])
      .then(([sub, teachers, hist]) => {
        setSubject(sub);
        setTeacherStats(teachers.filter(t => t.subject_id === id));
        setHistory(hist);
      })
      .catch(() => toast.error('Failed to load subject details'))
      .finally(() => setLoading(false));
  }, [subjectId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ color: C.muted, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>Loading…</div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ color: C.muted, fontFamily: "'Inter', sans-serif" }}>Subject not found</div>
        <button
          onClick={() => navigate(-1)}
          style={{ marginTop: 16, color: C.gold, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: 14 }}
        >
          ← Go back
        </button>
      </div>
    );
  }

  const totalPresent   = teacherStats.reduce((s, t) => s + t.present, 0);
  const totalAbsent    = teacherStats.reduce((s, t) => s + t.absent, 0);
  const totalCancelled = teacherStats.reduce((s, t) => s + t.cancelled, 0);
  const totalConducted = totalPresent + totalAbsent;
  const totalPct       = totalConducted > 0 ? (totalPresent / totalConducted) * 100 : 0;

  const filteredHistory = selectedTeacher
    ? history.filter(h => h.entry.teacher.id === selectedTeacher)
    : history;

  return (
    <div style={{ maxWidth: 940, margin: '0 auto', padding: '34px 24px 60px' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: 'none',
          color: C.muted,
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 22,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'color 0.2s',
          fontFamily: "'Inter', sans-serif",
          animation: 'driftUp 0.7s cubic-bezier(0.16,1,0.3,1) both',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = C.soft)}
        onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
      >
        ← Back
      </button>

      {/* Subject Header Card */}
      <div
        style={{
          ...cardStyle,
          padding: '30px',
          marginBottom: 20,
          animation: 'driftUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.05s both',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }} className="subject-header-row">
          <div>
            <div
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 'clamp(20px,2.5vw,26px)',
                fontWeight: 500,
                color: C.cream,
                letterSpacing: '-0.3px',
                marginBottom: 4,
              }}
            >
              {subject.name}
            </div>
            <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{subject.code}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 40,
                fontWeight: 500,
                color: getColor(totalPct),
                lineHeight: 1,
              }}
            >
              {totalConducted > 0 ? `${totalPct.toFixed(1)}%` : '—'}
            </div>
            <div style={{ fontSize: 12, color: C.soft, marginTop: 5, fontFamily: "'Inter', sans-serif" }}>
              {totalPresent}/{totalConducted} attended
            </div>
          </div>
        </div>
        <ProgressBar percentage={totalConducted > 0 ? totalPct : 0} height={7} />
        <div style={{ display: 'flex', gap: 18, marginTop: 14, fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
          <span style={{ color: C.green }}>Present: {totalPresent}</span>
          <span style={{ color: C.red }}>Absent: {totalAbsent}</span>
          <span style={{ color: C.muted }}>Cancelled: {totalCancelled}</span>
        </div>
      </div>

      {/* Teacher Breakdown Card */}
      {teacherStats.length > 0 && (
        <div
          style={{
            ...cardStyle,
            padding: '26px 28px',
            marginBottom: 20,
            animation: 'driftUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both',
          }}
        >
          <div
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 500,
              fontSize: 17,
              color: C.cream,
              marginBottom: 18,
              letterSpacing: '-0.3px',
            }}
          >
            Teacher Breakdown
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {teacherStats.map(t => (
              <div
                key={t.teacher_id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${C.hairlineSoft}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.cream, fontFamily: "'Inter', sans-serif" }}>{t.teacher_name}</span>
                  <span style={{ fontSize: 12, color: C.soft, fontFamily: "'Inter', sans-serif" }}>
                    {t.present}/{t.conducted}
                    <span style={{ color: getColor(t.percentage), marginLeft: 8, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                      {t.conducted > 0 ? `${t.percentage.toFixed(1)}%` : '—'}
                    </span>
                  </span>
                </div>
                <ProgressBar percentage={t.conducted > 0 ? t.percentage : 0} height={4} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance History Card */}
      <div
        style={{
          ...cardStyle,
          padding: '26px 28px',
          animation: 'driftUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s both',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 500,
              fontSize: 17,
              color: C.cream,
              letterSpacing: '-0.3px',
            }}
          >
            Log History (Past 8 Weeks)
          </div>
          {teacherStats.length > 1 && (
            <div style={{ display: 'flex', gap: 5 }}>
              <button
                onClick={() => setSelectedTeacher(null)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 999,
                  border: `1px solid ${selectedTeacher === null ? C.gold : C.hairline}`,
                  background: selectedTeacher === null ? C.goldDim : 'transparent',
                  color: selectedTeacher === null ? C.gold : C.muted,
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: "'Inter', sans-serif",
                  transition: 'all 0.2s ease',
                }}
              >
                All
              </button>
              {teacherStats.map(t => (
                <button
                  key={t.teacher_id}
                  onClick={() => setSelectedTeacher(t.teacher_id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 999,
                    border: `1px solid ${selectedTeacher === t.teacher_id ? C.gold : C.hairline}`,
                    background: selectedTeacher === t.teacher_id ? C.goldDim : 'transparent',
                    color: selectedTeacher === t.teacher_id ? C.gold : C.muted,
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "'Inter', sans-serif",
                    transition: 'all 0.2s ease',
                  }}
                >
                  {t.teacher_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '44px 0', color: C.muted, fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
            No attendance recorded for this filter in the past 8 weeks
          </div>
        ) : (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.2fr 1fr',
                padding: '8px 10px',
                borderBottom: `1px solid ${C.hairlineSoft}`,
                marginBottom: 6,
              }}
            >
              {['Date', 'Teacher', 'Status'].map(h => (
                <div key={h} style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'JetBrains Mono', monospace" }}>
                  {h}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {filteredHistory.map(({ date, entry }) => (
                <div
                  key={`${date}-${entry.timetable_entry_id}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1.2fr 1fr',
                    padding: '11px 10px',
                    borderRadius: 9,
                    background: 'rgba(255,255,255,0.015)',
                    border: `1px solid ${C.hairlineSoft}`,
                    alignItems: 'center',
                  }}
                >
                  <div style={{ fontSize: 12, color: C.soft, fontFamily: "'Inter', sans-serif" }}>
                    {format(date, 'EEE, d MMM yyyy')}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, fontFamily: "'Inter', sans-serif" }}>
                    {entry.teacher.name}
                  </div>
                  <div>
                    <StatusBadge status={entry.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
