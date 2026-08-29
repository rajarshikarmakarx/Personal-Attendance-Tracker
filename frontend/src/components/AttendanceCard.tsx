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
  greenBg:     'rgba(91,191,138,0.1)',
  greenBorder: 'rgba(91,191,138,0.22)',
  greenGlow:   'rgba(91,191,138,0.28)',
  red:         '#d95f6a',
  redBg:       'rgba(217,95,106,0.1)',
  redBorder:   'rgba(217,95,106,0.22)',
  redGlow:     'rgba(217,95,106,0.28)',
};

const CLASS_TYPE_LABEL: Record<string, string> = {
  L: 'Lecture',
  T: 'Tutorial',
  LAB: 'Lab',
};

const CLASS_TYPE_STYLE: Record<string, { color: string; bg: string }> = {
  L:   { color: C.gold,  bg: C.goldDim },
  T:   { color: '#a8c4e0', bg: 'rgba(168,196,224,0.1)' },
  LAB: { color: '#b5a0d4', bg: 'rgba(181,160,212,0.1)' },
};

const STATUS_BUTTONS: {
  status: Exclude<AttendanceStatus, 'UNMARKED'>;
  label: string;
  color: string;
  glow: string;
  activeBg: string;
  activeBorder: string;
}[] = [
  {
    status: 'PRESENT',
    label: 'Present',
    color: C.green,
    glow: C.greenGlow,
    activeBg: C.greenBg,
    activeBorder: C.greenBorder,
  },
  {
    status: 'ABSENT',
    label: 'Absent',
    color: C.red,
    glow: C.redGlow,
    activeBg: C.redBg,
    activeBorder: C.redBorder,
  },
  {
    status: 'CANCELLED',
    label: 'Cancelled',
    color: C.muted,
    glow: 'rgba(255,255,255,0.08)',
    activeBg: 'rgba(255,255,255,0.04)',
    activeBorder: C.hairline,
  },
];

const STATUS_ICONS: Record<string, ReactNode> = {
  PRESENT: (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ABSENT: (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  CANCELLED: (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
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

    if (entry.status === status && entry.attendance_id) {
      setLoading(true);
      const prevStatus = entry.status;
      const prevId = entry.attendance_id;
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
  const classStyle = CLASS_TYPE_STYLE[entry.class_type] || CLASS_TYPE_STYLE.L;

  /* top stripe color by status */
  const stripeColor = isMarked
    ? entry.status === 'PRESENT'
      ? `linear-gradient(90deg, ${C.green}, rgba(91,191,138,0.4))`
      : entry.status === 'ABSENT'
      ? `linear-gradient(90deg, ${C.red}, rgba(217,95,106,0.4))`
      : `linear-gradient(90deg, rgba(255,255,255,0.08), transparent)`
    : `linear-gradient(90deg, ${C.gold}, rgba(227,183,106,0.3))`;

  return (
    <div
      onMouseEnter={() => setCardHovered(true)}
      onMouseLeave={() => setCardHovered(false)}
      style={{
        background: C.panelSoft,
        border: `1px solid ${cardHovered ? 'rgba(227,183,106,0.25)' : C.hairline}`,
        borderRadius: 14,
        padding: compact ? '14px 18px' : '18px 22px',
        transition: 'border-color 0.25s ease, transform 0.25s ease',
        opacity: loading ? 0.6 : 1,
        transform: cardHovered ? 'translateY(-2px)' : 'translateY(0)',
        animation: `driftUp 0.7s cubic-bezier(0.16,1,0.3,1) ${index * 0.06}s both`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top stripe */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: stripeColor,
          opacity: isMarked ? 0.9 : 0.5,
          transition: 'all 0.3s ease',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
            {/* Time */}
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: C.muted,
                letterSpacing: '0.6px',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {formatTime(entry.start_time)} – {formatTime(entry.end_time)}
            </span>
            {/* Class type badge */}
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: classStyle.color,
                background: classStyle.bg,
                padding: '2px 8px',
                borderRadius: 999,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {CLASS_TYPE_LABEL[entry.class_type] || entry.class_type}
            </span>
          </div>
          {/* Subject name */}
          <div
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 500,
              fontSize: compact ? 15 : 17,
              color: C.cream,
              marginBottom: 3,
              letterSpacing: '-0.2px',
            }}
          >
            {entry.subject.name}
          </div>
          {/* Teacher + room */}
          <div style={{ fontSize: 12, color: C.muted, fontFamily: "'Inter', sans-serif" }}>
            {entry.teacher.name}
            {entry.room && (
              <span style={{ color: C.muted, marginLeft: 8 }}>
                <span style={{ opacity: 0.5 }}>·</span> {entry.room}
              </span>
            )}
          </div>
        </div>

        {/* Current status pill */}
        {isMarked && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '4px 12px',
              borderRadius: 999,
              color: entry.status === 'PRESENT' ? C.green : entry.status === 'ABSENT' ? C.red : C.muted,
              background: entry.status === 'PRESENT' ? C.greenBg : entry.status === 'ABSENT' ? C.redBg : 'rgba(255,255,255,0.04)',
              border: `1px solid ${entry.status === 'PRESENT' ? C.greenBorder : entry.status === 'ABSENT' ? C.redBorder : C.hairline}`,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.25s ease',
            }}
          >
            {STATUS_ICONS[entry.status]}
            {entry.status === 'PRESENT' ? 'Present' : entry.status === 'ABSENT' ? 'Absent' : 'Cancelled'}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 7 }}>
        {STATUS_BUTTONS.map(({ status, label, color, glow, activeBg, activeBorder }) => {
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
                padding: '9px 0',
                borderRadius: 9,
                border: `1px solid ${isActive ? activeBorder : isHov ? 'rgba(255,255,255,0.15)' : C.hairline}`,
                background: isActive ? activeBg : isHov ? 'rgba(255,255,255,0.03)' : 'transparent',
                color: isActive ? color : isHov ? color : C.muted,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 12,
                fontWeight: 600,
                transition: 'all 0.2s ease',
                letterSpacing: '0.2px',
                fontFamily: "'Inter', sans-serif",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                boxShadow: isActive ? `0 2px 12px ${glow}` : 'none',
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
