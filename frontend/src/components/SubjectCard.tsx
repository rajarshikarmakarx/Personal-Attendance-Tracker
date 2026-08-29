import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SubjectStats, TeacherStats } from '../types/attendance';
import ProgressBar from './ProgressBar';

interface SubjectCardProps {
  stats: SubjectStats;
  teacherStats: TeacherStats[];
  index?: number;
}

function getColor(pct: number): string {
  if (pct >= 85) return 'var(--green)';
  if (pct >= 75) return 'var(--yellow)';
  return 'var(--red)';
}

function getGlow(pct: number): string {
  if (pct >= 85) return 'var(--green-glow)';
  if (pct >= 75) return 'rgba(245, 158, 11, 0.3)';
  return 'var(--red-glow)';
}

function getGradient(pct: number): string {
  if (pct >= 85) return 'linear-gradient(180deg, #059669, #10b981)';
  if (pct >= 75) return 'linear-gradient(180deg, #d97706, #f59e0b)';
  return 'linear-gradient(180deg, #e11d48, #f43f5e)';
}

export default function SubjectCard({ stats, teacherStats, index = 0 }: SubjectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const color = getColor(stats.percentage);
  const glow = getGlow(stats.percentage);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${hovered ? 'var(--border-hover)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        transition: 'all 0.3s var(--ease-smooth)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 16px 48px rgba(0, 0, 0, 0.25), 0 0 30px ${glow}`
          : '0 4px 16px rgba(0, 0, 0, 0.12)',
        animation: `fadeInUp 0.5s var(--ease-out-expo) ${index * 0.07}s both`,
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
          background: getGradient(stats.percentage),
          borderRadius: '3px 0 0 3px',
          opacity: hovered ? 1 : 0.6,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Main row */}
      <div
        style={{ padding: '20px 22px 20px 26px', cursor: 'pointer' }}
        onClick={() => navigate(`/subjects/${stats.subject_id}`)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div
              style={{
                fontFamily: "'Outfit', 'Inter', sans-serif",
                fontWeight: 700,
                fontSize: 16,
                color: 'var(--text-primary)',
                marginBottom: 3,
                letterSpacing: '-0.3px',
              }}
            >
              {stats.subject_name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              {stats.subject_code}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontFamily: "'Outfit', 'Inter', sans-serif",
                fontSize: 24,
                fontWeight: 800,
                color,
                lineHeight: 1,
                letterSpacing: '-1px',
                textShadow: hovered ? `0 0 20px ${glow}` : 'none',
                transition: 'text-shadow 0.3s ease',
              }}
            >
              {stats.conducted > 0 ? `${stats.percentage.toFixed(1)}%` : '—'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, fontWeight: 500 }}>
              {stats.present}/{stats.conducted}
            </div>
          </div>
        </div>

        <ProgressBar percentage={stats.conducted > 0 ? stats.percentage : 0} height={5} />

        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          {[
            { label: 'P', val: stats.present, color: 'var(--green)' },
            { label: 'A', val: stats.absent, color: 'var(--red)' },
            { label: 'C', val: stats.cancelled, color: 'var(--text-muted)' },
          ].map(({ label, val, color: c }) => (
            <span key={label} style={{ fontSize: 12, color: c, fontWeight: 600, letterSpacing: '0.3px' }}>
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
              borderTop: '1px solid var(--border-subtle)',
              padding: '10px 22px 10px 26px',
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
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              {teacherStats.length} teacher{teacherStats.length > 1 ? 's' : ''}
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              style={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s var(--ease-smooth)',
                color: 'var(--text-muted)',
              }}
            >
              <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {expanded && (
            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                padding: '14px 22px 14px 26px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
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
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {t.teacher_name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {t.present}/{t.conducted} classes
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, maxWidth: 200, marginLeft: 20 }}>
                    <div style={{ flex: 1 }}>
                      <ProgressBar percentage={t.conducted > 0 ? t.percentage : 0} height={4} />
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: getColor(t.percentage),
                        minWidth: 44,
                        textAlign: 'right',
                        fontFamily: "'Outfit', 'Inter', sans-serif",
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
