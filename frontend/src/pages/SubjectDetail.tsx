import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getSubject, getTeacherStats, getSchedule } from '../api/client';
import type { Subject, TeacherStats, ScheduleEntry } from '../types/attendance';
import StatusBadge from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';
import { format, todayStr, subDays } from '../utils/date';

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
  if (pct >= 85) return 'var(--green)';
  if (pct >= 75) return 'var(--yellow)';
  return 'var(--red)';
}

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

    Promise.all([
      getSubject(id),
      getTeacherStats(),
      fetchSubjectHistory(id),
    ])
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
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading details...</div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ color: 'var(--text-muted)' }}>Subject not found</div>
        <button onClick={() => navigate(-1)} style={{ marginTop: 16, color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer' }}>
          ← Go back
        </button>
      </div>
    );
  }

  const totalPresent = teacherStats.reduce((s, t) => s + t.present, 0);
  const totalAbsent = teacherStats.reduce((s, t) => s + t.absent, 0);
  const totalCancelled = teacherStats.reduce((s, t) => s + t.cancelled, 0);
  const totalConducted = totalPresent + totalAbsent;
  const totalPct = totalConducted > 0 ? (totalPresent / totalConducted) * 100 : 0;

  const filteredHistory = selectedTeacher
    ? history.filter(h => h.entry.teacher.id === selectedTeacher)
    : history;

  return (
    <div style={{ maxWidth: 940, margin: '0 auto', padding: '36px 24px 60px' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 24,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'color 0.2s',
          animation: 'fadeInUp 0.5s var(--ease-out-expo) both',
        }}
      >
        ← Back to Dashboard
      </button>

      {/* Subject Header Card */}
      <div
        style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          marginBottom: 24,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          animation: 'fadeInUp 0.5s var(--ease-out-expo) 0.05s both',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 4 }}>
              {subject.name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{subject.code}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 44, fontWeight: 900, color: getColor(totalPct), lineHeight: 1 }}>
              {totalConducted > 0 ? `${totalPct.toFixed(1)}%` : '—'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 500 }}>
              {totalPresent}/{totalConducted} attended
            </div>
          </div>
        </div>
        <ProgressBar percentage={totalConducted > 0 ? totalPct : 0} height={8} />
        <div style={{ display: 'flex', gap: 20, marginTop: 16, fontSize: 13, fontWeight: 600 }}>
          <span style={{ color: 'var(--green)' }}>Present: {totalPresent}</span>
          <span style={{ color: 'var(--red)' }}>Absent: {totalAbsent}</span>
          <span style={{ color: 'var(--text-muted)' }}>Cancelled: {totalCancelled}</span>
        </div>
      </div>

      {/* Teacher Breakdown Card */}
      {teacherStats.length > 0 && (
        <div
          style={{
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px 32px',
            marginBottom: 24,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            animation: 'fadeInUp 0.5s var(--ease-out-expo) 0.1s both',
          }}
        >
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', marginBottom: 20 }}>
            Teacher Performance Breakdown
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {teacherStats.map(t => (
              <div key={t.teacher_id} style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{t.teacher_name}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {t.present}/{t.conducted}
                    <span style={{ color: getColor(t.percentage), marginLeft: 8, fontWeight: 800 }}>
                      {t.conducted > 0 ? `${t.percentage.toFixed(1)}%` : '—'}
                    </span>
                  </span>
                </div>
                <ProgressBar percentage={t.conducted > 0 ? t.percentage : 0} height={5} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance History Card */}
      <div
        style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 32px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          animation: 'fadeInUp 0.5s var(--ease-out-expo) 0.15s both',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>
            Log History (Past 8 Weeks)
          </div>
          {teacherStats.length > 1 && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setSelectedTeacher(null)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border)',
                  background: selectedTeacher === null ? 'var(--accent-gradient)' : 'transparent',
                  color: selectedTeacher === null ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                All Teachers
              </button>
              {teacherStats.map(t => (
                <button
                  key={t.teacher_id}
                  onClick={() => setSelectedTeacher(t.teacher_id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border)',
                    background: selectedTeacher === t.teacher_id ? 'var(--accent-gradient)' : 'transparent',
                    color: selectedTeacher === t.teacher_id ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {t.teacher_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)', fontSize: 13 }}>
            No attendance recorded for this filter in the past 8 weeks
          </div>
        ) : (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.2fr 1fr',
                padding: '10px 12px',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: 6,
              }}
            >
              {['Date', 'Teacher', 'Status'].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  {h}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {filteredHistory.map(({ date, entry }) => (
                <div
                  key={`${date}-${entry.timetable_entry_id}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1.2fr 1fr',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.015)',
                    border: '1px solid rgba(255, 255, 255, 0.02)',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                    {format(date, 'EEE, d MMM yyyy')}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
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
