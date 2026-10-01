import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import WeeklyScheduleBuilder from '../components/WeeklyScheduleBuilder';
import { getTimetable } from '../api/client';
import type { TimetableEntry, Weekday } from '../types/attendance';
import toast from 'react-hot-toast';

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
  green:       '#5bbf8a',
  greenDim:    'rgba(91,191,138,0.12)',
};

const WEEKDAYS: { key: Weekday; label: string; short: string }[] = [
  { key: 'MONDAY',    label: 'Monday',    short: 'Mon' },
  { key: 'TUESDAY',   label: 'Tuesday',   short: 'Tue' },
  { key: 'WEDNESDAY', label: 'Wednesday', short: 'Wed' },
  { key: 'THURSDAY',  label: 'Thursday',  short: 'Thu' },
  { key: 'FRIDAY',    label: 'Friday',    short: 'Fri' },
  { key: 'SATURDAY',  label: 'Saturday',  short: 'Sat' },
  { key: 'SUNDAY',    label: 'Sunday',    short: 'Sun' },
];

export default function SchedulePage() {
  const { profile, unlockSchedule, lockSchedule, refreshProfile } = useAuth();
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const fetchTimetableData = async () => {
    try {
      const data = await getTimetable();
      setTimetable(data);
    } catch {
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetableData();
  }, []);

  useEffect(() => {
    // If schedule is not locked, default to editing mode
    if (profile && !profile.schedule_locked) {
      setIsEditing(true);
    } else if (profile && profile.schedule_locked && timetable.length > 0) {
      setIsEditing(false);
    }
  }, [profile, timetable.length]);

  const handleStartEditing = async () => {
    try {
      await unlockSchedule();
      setIsEditing(true);
      toast('Editing mode enabled', { icon: '✏️' });
    } catch {
      toast.error('Failed to unlock schedule');
    }
  };

  const handleSaved = async () => {
    await refreshProfile();
    await fetchTimetableData();
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ color: C.muted, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
          Loading schedule…
        </div>
      </div>
    );
  }

  // Group timetable entries by weekday
  const entriesByDay = WEEKDAYS.reduce((acc, { key }) => {
    acc[key] = timetable.filter(e => e.weekday === key).sort((a, b) => a.start_time.localeCompare(b.start_time));
    return acc;
  }, {} as Record<Weekday, TimetableEntry[]>);

  const hasWeekendClasses = (entriesByDay.SATURDAY?.length || 0) > 0 || (entriesByDay.SUNDAY?.length || 0) > 0;
  const activeDays = hasWeekendClasses ? WEEKDAYS : WEEKDAYS.slice(0, 5);

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '34px 24px 60px' }}>
      {/* If currently editing or schedule is unlocked, render WeeklyScheduleBuilder */}
      {isEditing || !profile?.schedule_locked ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            {profile?.schedule_locked && (
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  background: 'none',
                  border: `1px solid ${C.hairline}`,
                  color: C.soft,
                  padding: '7px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                ← Back to View Mode
              </button>
            )}
          </div>
          <WeeklyScheduleBuilder onSaved={handleSaved} isInitialSetup={timetable.length === 0} />
        </div>
      ) : (
        /* Read-Only Locked Timetable View with "Edit Schedule" Action */
        <div style={{ animation: 'driftUp 0.6s var(--ease-out-expo) both' }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 16,
              marginBottom: 32,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <h1
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: 'clamp(24px, 3vw, 32px)',
                    fontWeight: 500,
                    color: C.cream,
                    letterSpacing: '-0.5px',
                    margin: 0,
                  }}
                >
                  Weekly Timetable
                </h1>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: 999,
                    background: C.greenDim,
                    border: '1px solid rgba(91,191,138,0.3)',
                    color: C.green,
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  🔒 Locked & Active
                </span>
              </div>
              <p style={{ fontSize: 13, color: C.muted, margin: 0, fontFamily: "'Inter', sans-serif" }}>
                Your active weekly schedule. To change subjects, times, or instructors, click "Edit Schedule".
              </p>
            </div>

            <button
              id="btn-edit-schedule-page"
              onClick={handleStartEditing}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                background: C.goldDim,
                border: '1px solid rgba(227,183,106,0.3)',
                color: C.gold,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(227,183,106,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = C.goldDim)}
            >
              ✏️ Edit Schedule
            </button>
          </div>

          {/* Weekday Grid Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {activeDays.map(({ key, label }) => {
              const dayEntries = entriesByDay[key] || [];
              return (
                <div
                  key={key}
                  style={{
                    background: C.panelSoft,
                    border: `1px solid ${C.hairline}`,
                    borderRadius: 16,
                    padding: '22px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 16,
                      paddingBottom: 12,
                      borderBottom: `1px solid ${C.hairlineSoft}`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: 18,
                        fontWeight: 500,
                        color: C.cream,
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: C.muted,
                        fontFamily: "'JetBrains Mono', monospace",
                        background: 'rgba(255,255,255,0.04)',
                        padding: '2px 8px',
                        borderRadius: 999,
                      }}
                    >
                      {dayEntries.length} {dayEntries.length === 1 ? 'class' : 'classes'}
                    </span>
                  </div>

                  {dayEntries.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: C.muted, fontSize: 13 }}>
                      No classes scheduled
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {dayEntries.map(entry => (
                        <div
                          key={entry.id}
                          style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: `1px solid ${C.hairlineSoft}`,
                            borderRadius: 10,
                            padding: '12px 14px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: C.cream, fontFamily: "'Inter', sans-serif" }}>
                              {entry.subject.name}
                            </span>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: entry.class_type === 'LAB' ? C.green : C.gold,
                                padding: '1px 6px',
                                borderRadius: 4,
                                background: entry.class_type === 'LAB' ? C.greenDim : C.goldDim,
                                fontFamily: "'JetBrains Mono', monospace",
                              }}
                            >
                              {entry.class_type}
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: C.muted, fontFamily: "'JetBrains Mono', monospace" }}>
                            <span>{entry.start_time.slice(0, 5)} - {entry.end_time.slice(0, 5)}</span>
                            <span>{entry.room || (entry.teacher_name || (entry.teacher ? entry.teacher.name : ''))}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
