import { ReactNode } from 'react';
import type { AttendanceStatus } from '../types/attendance';

const CONFIG: Record<AttendanceStatus, { label: string; color: string; bg: string; borderColor: string; icon: ReactNode }> = {
  PRESENT: {
    label: 'Present',
    color: 'var(--green)',
    bg: 'var(--green-bg)',
    borderColor: 'var(--green-border)',
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  ABSENT: {
    label: 'Absent',
    color: 'var(--red)',
    bg: 'var(--red-bg)',
    borderColor: 'var(--red-border)',
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'var(--text-secondary)',
    bg: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 6H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  UNMARKED: {
    label: 'Unmarked',
    color: 'var(--text-muted)',
    bg: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.06)',
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        padding: isSmall ? '3px 10px' : '5px 14px',
        borderRadius: 'var(--radius-full)',
        fontSize: isSmall ? 11 : 12,
        fontWeight: 600,
        color: c.color,
        background: c.bg,
        border: `1px solid ${c.borderColor}`,
        letterSpacing: '0.2px',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        transition: 'all 0.2s ease',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center' }}>{c.icon}</span>
      {c.label}
    </span>
  );
}
