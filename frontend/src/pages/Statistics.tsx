import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { getOverallStats, getSubjectStats, getTeacherStats } from '../api/client';
import type { OverallStats, SubjectStats, TeacherStats } from '../types/attendance';
import ProgressBar from '../components/ProgressBar';

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
  goldBg:      'rgba(227,183,106,0.1)',
  goldBorder:  'rgba(227,183,106,0.22)',
  green:       '#5bbf8a',
  greenBg:     'rgba(91,191,138,0.1)',
  greenBorder: 'rgba(91,191,138,0.22)',
  red:         '#d95f6a',
  redBg:       'rgba(217,95,106,0.1)',
  redBorder:   'rgba(217,95,106,0.22)',
};

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
        <div style={{ color: C.muted, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>Loading…</div>
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
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '34px 24px 60px' }}>
      <h1
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 'clamp(24px,3vw,32px)',
          fontWeight: 500,
          color: C.cream,
          marginBottom: 28,
          letterSpacing: '-0.5px',
          animation: 'driftUp 0.7s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        Analytics &amp; Statistics
      </h1>

      {/* Overall Hero Card */}
      {overall && (
        <div
          style={{
            ...cardStyle,
            padding: '30px 32px',
            marginBottom: 24,
            display: 'flex',
            gap: 44,
            alignItems: 'center',
            flexWrap: 'wrap',
            animation: 'driftUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.05s both',
          }}
        >
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
              Overall Attendance
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 52,
                fontWeight: 500,
                color: getColor(overall.percentage),
                letterSpacing: '-2px',
                lineHeight: 1,
              }}
            >
              {overall.conducted > 0 ? `${overall.percentage.toFixed(1)}%` : '—'}
            </div>
            <div style={{ fontSize: 14, color: C.soft, marginTop: 10, fontFamily: "'Inter', sans-serif" }}>
              {overall.present} / {overall.conducted} classes attended
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 14, flex: 1, minWidth: 260 }}>
            {[
              { label: 'Present',   val: overall.present,   color: C.green, bg: C.greenBg, border: C.greenBorder },
              { label: 'Absent',    val: overall.absent,    color: C.red,   bg: C.redBg,   border: C.redBorder   },
              { label: 'Cancelled', val: overall.cancelled, color: C.muted, bg: 'rgba(255,255,255,0.03)', border: C.hairlineSoft },
              { label: 'Conducted', val: overall.conducted, color: C.gold,  bg: C.goldBg,  border: C.goldBorder  },
            ].map(({ label, val, color, bg, border }) => (
              <div key={label} style={{ textAlign: 'center', padding: '14px 10px', borderRadius: 12, background: bg, border: `1px solid ${border}` }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 500, color }}>{val}</div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 4, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bar Chart Card */}
      {chartData.length > 0 && (
        <div
          style={{
            ...cardStyle,
            padding: '26px 28px',
            marginBottom: 24,
            animation: 'driftUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both',
          }}
        >
          <div
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 500,
              fontSize: 17,
              color: C.cream,
              marginBottom: 22,
              letterSpacing: '-0.3px',
            }}
          >
            Subject Comparison
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={chartData} margin={{ top: 0, right: 16, bottom: 0, left: -22 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.hairlineSoft} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: C.muted, fontSize: 11, fontFamily: "'Inter', sans-serif" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: C.panel,
                  border: `1px solid ${C.hairline}`,
                  borderRadius: 10,
                  fontSize: 12,
                  fontFamily: "'Inter', sans-serif",
                  color: C.cream,
                }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                formatter={(val: unknown) => [`${Number(val).toFixed(1)}%`, 'Attendance'] as [string, string]}
              />
              <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
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
          ...cardStyle,
          padding: '26px 28px',
          marginBottom: 24,
          animation: 'driftUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s both',
        }}
      >
        <div
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 500,
            fontSize: 17,
            color: C.cream,
            marginBottom: 22,
            letterSpacing: '-0.3px',
          }}
        >
          Detailed Subject Progress
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {subjects.map(s => (
            <div key={s.subject_id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.cream, fontFamily: "'Inter', sans-serif" }}>{s.subject_name}</span>
                  <span style={{ fontSize: 11, color: C.muted, marginLeft: 8, fontWeight: 500, fontFamily: "'JetBrains Mono', monospace" }}>{s.subject_code}</span>
                </div>
                <div style={{ fontSize: 13, color: C.soft, fontFamily: "'Inter', sans-serif" }}>
                  {s.present}/{s.conducted} attended
                  <span style={{ fontSize: 11, color: C.muted, marginLeft: 8 }}>
                    (P:{s.present} A:{s.absent} C:{s.cancelled})
                  </span>
                </div>
              </div>
              <ProgressBar percentage={s.conducted > 0 ? s.percentage : 0} height={6} showLabel />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
