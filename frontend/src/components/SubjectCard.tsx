import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SubjectStats, TeacherStats } from '../types/attendance';
import ProgressBar from './ProgressBar';

interface SubjectCardProps {
  stats: SubjectStats;
  teacherStats: TeacherStats[];
  index?: number;
}

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
  goldDim:     'rgba(227,183,106,0.14)',
  green:       '#5bbf8a',
  red:         '#d95f6a',
};

function getColor(pct: number): string {
  if (pct >= 85) return C.green;
  if (pct >= 75) return C.gold;
  return C.red;
}

function getStripe(pct: number): string {
  if (pct >= 85) return `linear-gradient(180deg, ${C.green}, rgba(91,191,138,0.4))`;
  if (pct >= 75) return `linear-gradient(180deg, ${C.gold}, rgba(227,183,106,0.4))`;
  return `linear-gradient(180deg, ${C.red}, rgba(217,95,106,0.4))`;
}

export default function SubjectCard({ stats, teacherStats, index = 0 }: SubjectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const color = getColor(stats.percentage);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.panelSoft,
        border: `1px solid ${hovered ? 'rgba(227,183,106,0.25)' : C.hairline}`,
        borderRadius: 14,
        overflow: 'hidden',
        transition: 'border-color 0.25s ease, transform 0.25s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        animation: `driftUp 0.7s cubic-bezier(0.16,1,0.3,1) ${index * 0.07}s both`,
        position: 'relative',
      }}
    >
      {/* Left gradient accent strip */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: 3,
          background: getStripe(stats.percentage),
          borderRadius: '3px 0 0 3px',
          opacity: hovered ? 1 : 0.7,
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Main row */}
      <div
        style={{ padding: '18px 20px 18px 24px', cursor: 'pointer' }}
        onClick={() => navigate(`/subjects/${stats.subject_id}`)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 500,
                fontSize: 15,
                color: C.cream,
                marginBottom: 3,
                letterSpacing: '-0.2px',
              }}
            >
              {stats.subject_name}
            </div>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: "'JetBrains Mono', monospace" }}>
              {stats.subject_code}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 22,
                fontWeight: 500,
                color,
                lineHeight: 1,
                letterSpacing: '-0.5px',
              }}
            >
              {stats.conducted > 0 ? `${stats.percentage.toFixed(1)}%` : '—'}
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 3, fontFamily: "'Inter', sans-serif" }}>
              {stats.present}/{stats.conducted}
            </div>
          </div>
        </div>

        <ProgressBar percentage={stats.conducted > 0 ? stats.percentage : 0} height={4} />

        <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
          {[
            { label: 'P', val: stats.present,   color: C.green },
            { label: 'A', val: stats.absent,    color: C.red   },
            { label: 'C', val: stats.cancelled, color: C.muted },
          ].map(({ label, val, color: c }) => (
            <span key={label} style={{ fontSize: 11, color: c, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
              {label}: {val}
            </span>
          ))}
        </div>
      </div>

      {/* Expand/collapse teacher breakdown */}
      {teacherStats.length > 0 && (
        <>
          <div
            style={{
              borderTop: `1px solid ${C.hairlineSoft}`,
              padding: '9px 20px 9px 24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'background 0.2s ease',
            }}
            onClick={e => {
              e.stopPropagation();
              setExpanded(prev => !prev);
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <span style={{ fontSize: 11, color: C.muted, fontFamily: "'Inter', sans-serif" }}>
              {teacherStats.length} teacher{teacherStats.length > 1 ? 's' : ''}
            </span>
            <svg
              width="13"
              height="13"
              viewBox="0 0 14 14"
              fill="none"
              style={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.25s ease',
                color: C.muted,
              }}
            >
              <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {expanded && (
            <div
              style={{
                borderTop: `1px solid ${C.hairlineSoft}`,
                padding: '12px 20px 12px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                animation: 'slideDown 0.3s var(--ease-out-expo) both',
              }}
            >
              {teacherStats.map(t => (
                <div
                  key={t.teacher_id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '9px 12px',
                    borderRadius: 9,
                    background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${C.hairlineSoft}`,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.cream, fontFamily: "'Inter', sans-serif" }}>
                      {t.teacher_name}
                    </div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                      {t.present}/{t.conducted} classes
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, maxWidth: 180, marginLeft: 16 }}>
                    <div style={{ flex: 1 }}>
                      <ProgressBar percentage={t.conducted > 0 ? t.percentage : 0} height={3} />
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: getColor(t.percentage),
                        minWidth: 40,
                        textAlign: 'right',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {t.conducted > 0 ? `${t.percentage.toFixed(1)}%` : '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
