import { ReactNode } from 'react';
import type { AttendanceStatus } from '../types/attendance';

/* ── Presently theme tokens ── */
const CONFIG: Record<AttendanceStatus, { label: string; color: string; bg: string; borderColor: string; icon: ReactNode }> = {
  PRESENT: {
    label: 'Present',
    color: '#5bbf8a',
    bg: 'rgba(91,191,138,0.1)',
    borderColor: 'rgba(91,191,138,0.22)',
    icon: (
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  ABSENT: {
    label: 'Absent',
    color: '#d95f6a',
    bg: 'rgba(217,95,106,0.1)',
    borderColor: 'rgba(217,95,106,0.22)',
    icon: (
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  CANCELLED: {
    label: 'Cancelled',
    color: '#8a93ab',
    bg: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.09)',
    icon: (
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <path d="M3 6H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  UNMARKED: {
    label: 'Unmarked',
    color: '#8a93ab',
    bg: 'transparent',
    borderColor: 'rgba(255,255,255,0.06)',
    icon: (
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="2" fill="currentColor" />
      </svg>
    ),
  },
};

interface StatusBadgeProps {
  status: AttendanceStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const c = CONFIG[status];
  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: isSmall ? '3px 9px' : '4px 12px',
        borderRadius: 999,
        fontSize: isSmall ? 11 : 12,
        fontWeight: 600,
        color: c.color,
        background: c.bg,
        border: `1px solid ${c.borderColor}`,
        letterSpacing: '0.2px',
        fontFamily: "'Inter', sans-serif",
        transition: 'all 0.2s ease',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center' }}>{c.icon}</span>
      {c.label}
    </span>
  );
}
