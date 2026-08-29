import { useState, ReactNode } from 'react';
import toast from 'react-hot-toast';
import type { ScheduleEntry, AttendanceStatus } from '../types/attendance';
import { upsertAttendance, deleteAttendance } from '../api/client';
import { formatTime } from '../utils/date';

interface AttendanceCardProps {
  entry: ScheduleEntry;
  date: string;
  onUpdate: (entryId: number, newStatus: AttendanceStatus, attendanceId: number | null) => void;
  compact?: boolean;
  index?: number;
}

const CLASS_TYPE_LABEL: Record<string, string> = {
  L: 'Lecture',
  T: 'Tutorial',
  LAB: 'Lab',
};

const CLASS_TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  L: { color: '#818cf8', bg: 'rgba(129, 140, 248, 0.1)' },
  T: { color: '#22d3ee', bg: 'rgba(34, 211, 238, 0.1)' },
  LAB: { color: '#c084fc', bg: 'rgba(192, 132, 252, 0.1)' },
};

const STATUS_BUTTONS: { status: Exclude<AttendanceStatus, 'UNMARKED'>; label: string; color: string; glow: string; gradient: string }[] = [
  {
    status: 'PRESENT',
    label: 'Present',
    color: 'var(--green)',
    glow: 'var(--green-glow)',
    gradient: 'linear-gradient(135deg, #059669, #10b981)',
  },
  {
    status: 'ABSENT',
    label: 'Absent',
    color: 'var(--red)',
    glow: 'var(--red-glow)',
    gradient: 'linear-gradient(135deg, #e11d48, #f43f5e)',
  },
  {
    status: 'CANCELLED',
    label: 'Cancelled',
    color: 'var(--text-secondary)',
    glow: 'rgba(255, 255, 255, 0.08)',
    gradient: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
  },
];

const STATUS_ICONS: Record<string, ReactNode> = {
  PRESENT: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ABSENT: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  CANCELLED: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3.5 7H10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

export default function AttendanceCard({ entry, date, onUpdate, compact = false, index = 0 }: AttendanceCardProps) {
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [cardHovered, setCardHovered] = useState(false);

  const handleMark = async (status: Exclude<AttendanceStatus, 'UNMARKED'>) => {
    if (loading) return;

    // If clicking the already-selected status, unmark (delete)
    if (entry.status === status && entry.attendance_id) {
      setLoading(true);
      const prevStatus = entry.status;
      const prevId = entry.attendance_id;
      // Optimistic update
      onUpdate(entry.timetable_entry_id, 'UNMARKED', null);
      try {
        await deleteAttendance(prevId);
      } catch {
        onUpdate(entry.timetable_entry_id, prevStatus, prevId);
        toast.error('Failed to unmark. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    const prevStatus = entry.status;
    const prevId = entry.attendance_id;
    // Optimistic update
    onUpdate(entry.timetable_entry_id, status, entry.attendance_id);
    try {
      const record = await upsertAttendance({
        timetable_entry_id: entry.timetable_entry_id,
        date,
        status,
      });
      onUpdate(entry.timetable_entry_id, status, record.id);
    } catch {
      onUpdate(entry.timetable_entry_id, prevStatus, prevId);
      toast.error('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isMarked = entry.status !== 'UNMARKED';
  const classColors = CLASS_TYPE_COLORS[entry.class_type] || CLASS_TYPE_COLORS.L;

  return (
    <div
      onMouseEnter={() => setCardHovered(true)}
      onMouseLeave={() => setCardHovered(false)}
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${cardHovered ? 'var(--border-hover)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: compact ? '16px 20px' : '20px 24px',
        transition: 'all 0.3s var(--ease-smooth)',
        opacity: loading ? 0.6 : 1,
        transform: cardHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: cardHovered
          ? '0 12px 40px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.05)'
          : '0 4px 16px rgba(0, 0, 0, 0.15)',
        animation: `fadeInUp 0.5s var(--ease-out-expo) ${index * 0.06}s both`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle gradient accent at top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: isMarked
            ? entry.status === 'PRESENT'
              ? 'linear-gradient(90deg, #059669, #10b981, #34d399)'
              : entry.status === 'ABSENT'
              ? 'linear-gradient(90deg, #e11d48, #f43f5e, #fb7185)'
              : 'linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'
            : 'var(--accent-gradient)',
          opacity: isMarked ? 1 : 0.4,
          transition: 'all 0.3s ease',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            {/* Time */}
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                fontFamily: "'Inter', monospace",
              }}
            >
              {formatTime(entry.start_time)} – {formatTime(entry.end_time)}
            </span>
            {/* Class type badge */}
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: classColors.color,
                background: classColors.bg,
                padding: '2px 10px',
                borderRadius: 'var(--radius-full)',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                border: `1px solid ${classColors.color}25`,
              }}
            >
              {CLASS_TYPE_LABEL[entry.class_type] || entry.class_type}
            </span>
          </div>
          {/* Subject name */}
          <div
            style={{
              fontFamily: "'Outfit', 'Inter', sans-serif",
              fontWeight: 700,
              fontSize: compact ? 16 : 17,
              color: 'var(--text-primary)',
              marginBottom: 3,
              letterSpacing: '-0.3px',
            }}
          >
            {entry.subject.name}
          </div>
          {/* Teacher + room */}
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {entry.teacher.name}
            {entry.room && (
              <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>
                <span style={{ opacity: 0.5 }}>·</span> {entry.room}
              </span>
            )}
          </div>
        </div>

        {/* Current status pill */}
        {isMarked && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: '5px 14px',
              borderRadius: 'var(--radius-full)',
              color: entry.status === 'PRESENT' ? 'var(--green)' : entry.status === 'ABSENT' ? 'var(--red)' : 'var(--text-secondary)',
              background: entry.status === 'PRESENT' ? 'var(--green-bg)' : entry.status === 'ABSENT' ? 'var(--red-bg)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${entry.status === 'PRESENT' ? 'var(--green-border)' : entry.status === 'ABSENT' ? 'var(--red-border)' : 'var(--border)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              transition: 'all 0.25s ease',
            }}
          >
            {STATUS_ICONS[entry.status]}
            {entry.status === 'PRESENT' ? 'Present' : entry.status === 'ABSENT' ? 'Absent' : 'Cancelled'}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        {STATUS_BUTTONS.map(({ status, label, color, glow, gradient }) => {
          const isActive = entry.status === status;
          const isHov = hovered === status;

          return (
            <button
              key={status}
              id={`btn-${status.toLowerCase()}-${entry.timetable_entry_id}`}
              onClick={() => handleMark(status)}
              disabled={loading}
              onMouseEnter={() => setHovered(status)}
              onMouseLeave={() => setHovered(null)}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${isActive ? color : isHov ? 'var(--border-hover)' : 'var(--border)'}`,
                background: isActive ? gradient : isHov ? 'var(--bg-elevated)' : 'transparent',
                color: isActive ? '#fff' : isHov ? color : 'var(--text-secondary)',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.25s var(--ease-smooth)',
                letterSpacing: '0.2px',
                fontFamily: "'Inter', sans-serif",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: isActive ? `0 4px 16px ${glow}` : 'none',
                transform: isHov && !isActive ? 'translateY(-1px)' : 'translateY(0)',
              }}
            >
              {isActive && STATUS_ICONS[status]}
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
