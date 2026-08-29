import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { getOverallStats, getSubjectStats, getTeacherStats } from '../api/client';
import type { OverallStats, SubjectStats, TeacherStats } from '../types/attendance';
import ProgressBar from '../components/ProgressBar';

function getColor(pct: number) {
  if (pct >= 85) return '#10b981';
  if (pct >= 75) return '#f59e0b';
  return '#f43f5e';
}

export default function Statistics() {
  const [overall, setOverall] = useState<OverallStats | null>(null);
  const [subjects, setSubjects] = useState<SubjectStats[]>([]);
  const [teachers, setTeachers] = useState<TeacherStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOverallStats(), getSubjectStats(), getTeacherStats()])
      .then(([o, s, t]) => {
        setOverall(o);
        setSubjects(s.sort((a, b) => b.percentage - a.percentage));
        setTeachers(t);
      })
      .catch(() => toast.error('Failed to load statistics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading statistics...</div>
      </div>
    );
  }

  const chartData = subjects.map(s => ({
    name: s.subject_short_name,
    percentage: s.percentage,
    present: s.present,
    conducted: s.conducted,
  }));

  const teachersBySubject: Record<number, TeacherStats[]> = {};
  for (const t of teachers) {
    if (!teachersBySubject[t.subject_id]) teachersBySubject[t.subject_id] = [];
    teachersBySubject[t.subject_id].push(t);
  }

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '36px 24px 60px' }}>
      <h1
        style={{
          fontFamily: "'Outfit', 'Inter', sans-serif",
          fontSize: 32,
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: 32,
          letterSpacing: '-1px',
          animation: 'fadeInUp 0.5s var(--ease-out-expo) both',
        }}
      >
        Analytics & Statistics
      </h1>

      {/* Overall Hero Card */}
      {overall && (
        <div
          style={{
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px 36px',
            marginBottom: 28,
            display: 'flex',
            gap: 48,
            alignItems: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            flexWrap: 'wrap',
            animation: 'fadeInUp 0.5s var(--ease-out-expo) 0.05s both',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
              Overall Attendance
            </div>
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 54,
                fontWeight: 900,
                color: getColor(overall.percentage),
                letterSpacing: '-2px',
                lineHeight: 1,
                textShadow: `0 0 30px ${getColor(overall.percentage)}40`,
              }}
            >
              {overall.conducted > 0 ? `${overall.percentage.toFixed(1)}%` : '—'}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 10, fontWeight: 500 }}>
              {overall.present} / {overall.conducted} classes attended
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 16, flex: 1, minWidth: 280 }}>
            {[
              { label: 'Present', val: overall.present, color: 'var(--green)', bg: 'var(--green-bg)' },
              { label: 'Absent', val: overall.absent, color: 'var(--red)', bg: 'var(--red-bg)' },
              { label: 'Cancelled', val: overall.cancelled, color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.03)' },
              { label: 'Conducted', val: overall.conducted, color: '#a78bfa', bg: 'rgba(124, 58, 237, 0.1)' },
            ].map(({ label, val, color, bg }) => (
              <div key={label} style={{ textAlign: 'center', padding: '16px 12px', borderRadius: 'var(--radius-md)', background: bg, border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 800, color }}>{val}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bar Chart Card */}
      {chartData.length > 0 && (
        <div
          style={{
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px 32px',
            marginBottom: 28,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            animation: 'fadeInUp 0.5s var(--ease-out-expo) 0.1s both',
          }}
        >
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', marginBottom: 24, letterSpacing: '-0.5px' }}>
            Subject Comparison Chart
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 0, right: 20, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'rgba(10, 10, 15, 0.9)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12, backdropFilter: 'blur(16px)' }}
                cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                formatter={(val: unknown) => [`${Number(val).toFixed(1)}%`, 'Attendance'] as [string, string]}
              />
              <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.percentage)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Subject Details Progress list */}
      <div
        style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 32px',
          marginBottom: 28,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          animation: 'fadeInUp 0.5s var(--ease-out-expo) 0.15s both',
        }}
      >
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', marginBottom: 24, letterSpacing: '-0.5px' }}>
          Detailed Subject Progress
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {subjects.map(s => (
            <div key={s.subject_id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{s.subject_name}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8, fontWeight: 500 }}>{s.subject_code}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {s.present}/{s.conducted} attended
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>
                    (P:{s.present} A:{s.absent} C:{s.cancelled})
                  </span>
                </div>
              </div>
              <ProgressBar percentage={s.conducted > 0 ? s.percentage : 0} height={7} showLabel />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
