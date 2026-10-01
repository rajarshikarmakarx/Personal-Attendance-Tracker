import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getTimetable, batchSaveTimetable, getSubjects, clearTimetable } from '../api/client';
import type { Weekday, ClassType, Subject, TimetableSlotInput } from '../types/attendance';

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
  goldBorder:  'rgba(227,183,106,0.28)',
  green:       '#5bbf8a',
  greenDim:    'rgba(91,191,138,0.12)',
  red:         '#d95f6a',
  redDim:      'rgba(217,95,106,0.12)',
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

const DEFAULT_SAMPLE_SCHEDULE: TimetableSlotInput[] = [
  // Monday
  { weekday: 'MONDAY', start_time: '09:00', end_time: '10:00', subject_name: 'Mathematics', subject_code: 'MTH101', short_name: 'Maths', teacher_name: 'Prof. Miller', room: 'Room 101', class_type: 'L' },
  { weekday: 'MONDAY', start_time: '10:00', end_time: '11:00', subject_name: 'Physics', subject_code: 'PHY101', short_name: 'Physics', teacher_name: 'Dr. Watson', room: 'Room 204', class_type: 'L' },
  { weekday: 'MONDAY', start_time: '11:15', end_time: '12:15', subject_name: 'Computer Science', subject_code: 'CS101', short_name: 'CS', teacher_name: 'Dr. Turing', room: 'Lab 2', class_type: 'L' },
  { weekday: 'MONDAY', start_time: '13:30', end_time: '15:30', subject_name: 'CS Laboratory', subject_code: 'CS102', short_name: 'CS Lab', teacher_name: 'Dr. Turing', room: 'Lab 2', class_type: 'LAB' },

  // Tuesday
  { weekday: 'TUESDAY', start_time: '09:00', end_time: '10:00', subject_name: 'Electronics', subject_code: 'ECE101', short_name: 'Electronics', teacher_name: 'Prof. Tesla', room: 'Room 305', class_type: 'L' },
  { weekday: 'TUESDAY', start_time: '10:00', end_time: '11:00', subject_name: 'Mathematics', subject_code: 'MTH101', short_name: 'Maths', teacher_name: 'Prof. Miller', room: 'Room 101', class_type: 'L' },
  { weekday: 'TUESDAY', start_time: '11:15', end_time: '12:15', subject_name: 'Communication Skills', subject_code: 'HUM101', short_name: 'Comm Skills', teacher_name: 'Ms. Davis', room: 'Room 105', class_type: 'L' },

  // Wednesday
  { weekday: 'WEDNESDAY', start_time: '09:00', end_time: '10:00', subject_name: 'Computer Science', subject_code: 'CS101', short_name: 'CS', teacher_name: 'Dr. Turing', room: 'Lab 2', class_type: 'L' },
  { weekday: 'WEDNESDAY', start_time: '10:00', end_time: '11:00', subject_name: 'Electronics', subject_code: 'ECE101', short_name: 'Electronics', teacher_name: 'Prof. Tesla', room: 'Room 305', class_type: 'L' },
  { weekday: 'WEDNESDAY', start_time: '13:00', end_time: '15:00', subject_name: 'Physics Laboratory', subject_code: 'PHY102', short_name: 'Physics Lab', teacher_name: 'Dr. Watson', room: 'Lab 1', class_type: 'LAB' },

  // Thursday
  { weekday: 'THURSDAY', start_time: '09:00', end_time: '10:00', subject_name: 'Physics', subject_code: 'PHY101', short_name: 'Physics', teacher_name: 'Dr. Watson', room: 'Room 204', class_type: 'L' },
  { weekday: 'THURSDAY', start_time: '10:00', end_time: '11:00', subject_name: 'Mathematics Tutorial', subject_code: 'MTH101', short_name: 'Maths Tut', teacher_name: 'Prof. Miller', room: 'Room 101', class_type: 'T' },
  { weekday: 'THURSDAY', start_time: '11:15', end_time: '12:15', subject_name: 'Electronics', subject_code: 'ECE101', short_name: 'Electronics', teacher_name: 'Prof. Tesla', room: 'Room 305', class_type: 'L' },

  // Friday
  { weekday: 'FRIDAY', start_time: '09:00', end_time: '11:00', subject_name: 'Electronics Laboratory', subject_code: 'ECE102', short_name: 'ECE Lab', teacher_name: 'Prof. Tesla', room: 'Lab 4', class_type: 'LAB' },
  { weekday: 'FRIDAY', start_time: '11:15', end_time: '12:15', subject_name: 'Communication Skills', subject_code: 'HUM101', short_name: 'Comm Skills', teacher_name: 'Ms. Davis', room: 'Room 105', class_type: 'T' },
  { weekday: 'FRIDAY', start_time: '13:30', end_time: '14:30', subject_name: 'Computer Science', subject_code: 'CS101', short_name: 'CS', teacher_name: 'Dr. Turing', room: 'Lab 2', class_type: 'L' },
];

interface WeeklyScheduleBuilderProps {
  onSaved?: () => void;
  isInitialSetup?: boolean;
}

export default function WeeklyScheduleBuilder({ onSaved, isInitialSetup = false }: WeeklyScheduleBuilderProps) {
  const [selectedDay, setSelectedDay] = useState<Weekday>('MONDAY');
  const [showWeekends, setShowWeekends] = useState(false);
  const [slots, setSlots] = useState<TimetableSlotInput[]>([]);
  const [existingSubjects, setExistingSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjCode, setNewSubjCode] = useState('');
  const [newSubjShort, setNewSubjShort] = useState('');

  // Fetch current user timetable and subjects
  useEffect(() => {
    Promise.all([getTimetable(), getSubjects()])
      .then(([entries, subjects]) => {
        setExistingSubjects(subjects);
        if (entries && entries.length > 0) {
          const formatted: TimetableSlotInput[] = entries.map(e => ({
            weekday: e.weekday,
            start_time: e.start_time.slice(0, 5),
            end_time: e.end_time.slice(0, 5),
            subject_name: e.subject.name,
            subject_code: e.subject.code || '',
            short_name: e.subject.short_name,
            teacher_name: e.teacher_name || (e.teacher ? e.teacher.name : ''),
            room: e.room || '',
            class_type: e.class_type,
            period_number: e.period_number ?? undefined,
          }));
          setSlots(formatted);
          if (formatted.some(s => s.weekday === 'SATURDAY' || s.weekday === 'SUNDAY')) {
            setShowWeekends(true);
          }
        }
      })
      .catch(() => {
        toast.error('Failed to load timetable data');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Filter slots for active day
  const currentDaySlots = slots.filter(s => s.weekday === selectedDay);

  // Counts by day
  const getSlotCount = (day: Weekday) => slots.filter(s => s.weekday === day).length;

  const handleAddSlot = () => {
    const lastSlot = currentDaySlots[currentDaySlots.length - 1];
    let newStart = '09:00';
    let newEnd = '10:00';

    if (lastSlot) {
      newStart = lastSlot.end_time;
      const [h, m] = lastSlot.end_time.split(':').map(Number);
      const nextH = (h + 1).toString().padStart(2, '0');
      newEnd = `${nextH}:${m.toString().padStart(2, '0')}`;
    }

    const defaultSubj = existingSubjects.length > 0 ? existingSubjects[0].name : '';
    const defaultSubjObj = existingSubjects.find(s => s.name === defaultSubj);

    const newSlot: TimetableSlotInput = {
      weekday: selectedDay,
      start_time: newStart,
      end_time: newEnd,
      subject_name: defaultSubj,
      subject_code: defaultSubjObj?.code || '',
      short_name: defaultSubjObj?.short_name || defaultSubj,
      teacher_name: '',
      room: '',
      class_type: 'L',
    };

    setSlots(prev => [...prev, newSlot]);
  };

  const handleUpdateSlot = (indexInDay: number, field: keyof TimetableSlotInput, val: any) => {
    let count = -1;
    setSlots(prev =>
      prev.map(slot => {
        if (slot.weekday === selectedDay) {
          count++;
          if (count === indexInDay) {
            const updated = { ...slot, [field]: val };
            if (field === 'subject_name') {
              const matched = existingSubjects.find(s => s.name.toLowerCase() === String(val).toLowerCase());
              if (matched) {
                updated.subject_code = matched.code || '';
                updated.short_name = matched.short_name;
              }
            }
            return updated;
          }
        }
        return slot;
      })
    );
  };

  const handleDeleteSlot = (indexInDay: number) => {
    let count = -1;
    setSlots(prev =>
      prev.filter(slot => {
        if (slot.weekday === selectedDay) {
          count++;
          return count !== indexInDay;
        }
        return true;
      })
    );
  };

  const handleDuplicateSlot = (indexInDay: number) => {
    const slotToDup = currentDaySlots[indexInDay];
    if (!slotToDup) return;
    const [h, m] = slotToDup.end_time.split(':').map(Number);
    const nextH = (h + 1).toString().padStart(2, '0');
    const newEnd = `${nextH}:${m.toString().padStart(2, '0')}`;

    const newSlot: TimetableSlotInput = {
      ...slotToDup,
      start_time: slotToDup.end_time,
      end_time: newEnd,
    };
    setSlots(prev => [...prev, newSlot]);
  };

  const handleCopyDaySchedule = (targetDay: Weekday) => {
    if (targetDay === selectedDay) return;
    const daySlots = currentDaySlots.map(s => ({ ...s, weekday: targetDay }));
    setSlots(prev => [...prev.filter(s => s.weekday !== targetDay), ...daySlots]);
    toast.success(`Copied ${selectedDay} classes to ${targetDay}`);
  };

  const handleCreateSubject = () => {
    if (!newSubjName.trim()) {
      toast.error('Subject name is required');
      return;
    }
    const short = newSubjShort.trim() || newSubjName.trim();
    const newSubject: Subject = {
      id: Date.now(),
      name: newSubjName.trim(),
      code: newSubjCode.trim() || undefined,
      short_name: short,
    };
    setExistingSubjects(prev => [...prev, newSubject]);
    setNewSubjName('');
    setNewSubjCode('');
    setNewSubjShort('');
    setShowSubjectModal(false);
    toast.success(`Subject "${newSubject.name}" added`);
  };

  const handleLoadSample = () => {
    if (slots.length > 0 && !window.confirm('Replace current timetable with sample starter schedule?')) {
      return;
    }
    setSlots(DEFAULT_SAMPLE_SCHEDULE);
    // Add sample subjects to list
    const subjectsMap = new Map<string, Subject>();
    DEFAULT_SAMPLE_SCHEDULE.forEach(s => {
      if (!subjectsMap.has(s.subject_name)) {
        subjectsMap.set(s.subject_name, {
          id: Date.now() + Math.random(),
          name: s.subject_name,
          code: s.subject_code,
          short_name: s.short_name || s.subject_name,
        });
      }
    });
    setExistingSubjects(Array.from(subjectsMap.values()));
    toast.success('Loaded sample weekly schedule!');
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear your entire weekly schedule?')) {
      return;
    }
    setSlots([]);
    try {
      await clearTimetable();
      toast.success('Timetable cleared');
    } catch {
      toast.error('Failed to clear database timetable');
    }
  };

  const handleSaveAndLock = async () => {
    if (slots.length === 0) {
      toast.error('Please add at least one class slot to your weekly schedule');
      return;
    }

    // Validation: Ensure every slot has a subject name
    const invalidSlot = slots.find(s => !s.subject_name.trim());
    if (invalidSlot) {
      toast.error(`Please specify a subject for all classes on ${invalidSlot.weekday}`);
      setSelectedDay(invalidSlot.weekday);
      return;
    }

    setSaving(true);
    try {
      await batchSaveTimetable({
        slots,
        lock_schedule: true,
      });
      toast.success('🎉 Schedule locked in successfully! Welcome to your dashboard.');
      if (onSaved) {
        onSaved();
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to save schedule';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const visibleDays = showWeekends ? WEEKDAYS : WEEKDAYS.slice(0, 5);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <div style={{ color: C.muted, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
          Loading Schedule Builder…
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', animation: 'driftUp 0.6s var(--ease-out-expo) both' }}>
      {/* Header Banner */}
      <div
        style={{
          background: `linear-gradient(135deg, ${C.panelSoft} 0%, #162035 100%)`,
          border: `1px solid ${C.hairline}`,
          borderRadius: 20,
          padding: '30px 32px',
          marginBottom: 28,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 22 }}>🗓️</span>
            <h1
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 'clamp(22px, 3vw, 28px)',
                fontWeight: 500,
                color: C.cream,
                letterSpacing: '-0.4px',
                margin: 0,
              }}
            >
              {isInitialSetup ? 'Create Your Weekly Schedule' : 'Weekly Schedule Builder'}
            </h1>
          </div>
          <p
            style={{
              fontSize: 14,
              color: C.soft,
              margin: 0,
              lineHeight: 1.5,
              maxWidth: 580,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Configure your personalized classes, time slots, and instructors for the week.
            When done, lock it in to start tracking daily attendance.
          </p>
        </div>

        {/* Quick Action Tools */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={handleLoadSample}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${C.hairline}`,
              color: C.cream,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = C.gold)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = C.hairline)}
          >
            ⚡ Load Sample Schedule
          </button>
          {slots.length > 0 && (
            <button
              onClick={handleClearAll}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                background: C.redDim,
                border: '1px solid rgba(217,95,106,0.3)',
                color: C.red,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                transition: 'all 0.2s ease',
              }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Main Builder Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
        {/* Day Tabs + Weekend toggle */}
        <div
          style={{
            background: C.panelSoft,
            border: `1px solid ${C.hairline}`,
            borderRadius: 16,
            padding: '16px 20px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {visibleDays.map(({ key, short }) => {
              const isSelected = selectedDay === key;
              const count = getSlotCount(key);
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDay(key)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 10,
                    border: isSelected
                      ? `1px solid ${C.gold}`
                      : `1px solid ${C.hairlineSoft}`,
                    background: isSelected ? C.goldDim : 'rgba(255,255,255,0.02)',
                    color: isSelected ? C.goldSoft : C.soft,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: isSelected ? 700 : 500,
                    fontFamily: "'Inter', sans-serif",
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>{short}</span>
                  <span
                    style={{
                      fontSize: 11,
                      padding: '2px 7px',
                      borderRadius: 999,
                      background: count > 0 ? (isSelected ? C.gold : 'rgba(255,255,255,0.08)') : 'transparent',
                      color: count > 0 ? (isSelected ? '#111a2c' : C.muted) : C.muted,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: C.muted,
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={showWeekends}
              onChange={e => setShowWeekends(e.target.checked)}
              style={{ accentColor: C.gold, cursor: 'pointer' }}
            />
            Include Weekends (Sat/Sun)
          </label>
        </div>

        {/* Selected Day Workspace */}
        <div
          style={{
            background: C.panelSoft,
            border: `1px solid ${C.hairline}`,
            borderRadius: 18,
            padding: '24px 28px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          }}
        >
          {/* Day Header Row */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: `1px solid ${C.hairlineSoft}`,
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 20,
                  fontWeight: 500,
                  color: C.cream,
                  letterSpacing: '-0.3px',
                }}
              >
                {WEEKDAYS.find(w => w.key === selectedDay)?.label} Classes
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                {currentDaySlots.length} {currentDaySlots.length === 1 ? 'class slot' : 'class slots'} scheduled
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Copy Day schedule dropdown */}
              {currentDaySlots.length > 0 && (
                <select
                  defaultValue=""
                  onChange={e => {
                    if (e.target.value) {
                      handleCopyDaySchedule(e.target.value as Weekday);
                      e.target.value = '';
                    }
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${C.hairline}`,
                    borderRadius: 9,
                    padding: '7px 12px',
                    color: C.soft,
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <option value="" disabled>Copy {selectedDay} to…</option>
                  {visibleDays
                    .filter(d => d.key !== selectedDay)
                    .map(d => (
                      <option key={d.key} value={d.key} style={{ background: '#111a2c', color: '#f3ecdd' }}>
                        {d.label}
                      </option>
                    ))}
                </select>
              )}

              {/* Add class slot button */}
              <button
                onClick={handleAddSlot}
                style={{
                  padding: '7px 14px',
                  borderRadius: 9,
                  background: C.goldDim,
                  border: `1px solid ${C.goldBorder}`,
                  color: C.gold,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(227,183,106,0.22)')}
                onMouseLeave={e => (e.currentTarget.style.background = C.goldDim)}
              >
                + Add Class Slot
              </button>
            </div>
          </div>

          {/* Slots List */}
          {currentDaySlots.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '50px 20px',
                border: `1px dashed ${C.hairline}`,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.01)',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 10 }}>📖</div>
              <div
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 17,
                  fontWeight: 500,
                  color: C.cream,
                  marginBottom: 6,
                }}
              >
                No classes on {WEEKDAYS.find(w => w.key === selectedDay)?.label}
              </div>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>
                Click "+ Add Class Slot" to add a lecture, lab, or tutorial.
              </p>
              <button
                onClick={handleAddSlot}
                style={{
                  padding: '8px 18px',
                  borderRadius: 10,
                  background: C.gold,
                  border: 'none',
                  color: '#111a2c',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                + Add First Class
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {currentDaySlots.map((slot, idx) => (
                <div
                  key={`${selectedDay}-${idx}`}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${C.hairline}`,
                    borderRadius: 14,
                    padding: '18px 20px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 14,
                    alignItems: 'center',
                    position: 'relative',
                  }}
                >
                  {/* Period badge & Time Range */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                      Time ({slot.start_time} - {slot.end_time})
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input
                        type="time"
                        value={slot.start_time}
                        onChange={e => handleUpdateSlot(idx, 'start_time', e.target.value)}
                        style={{
                          background: C.panel,
                          border: `1px solid ${C.hairline}`,
                          borderRadius: 8,
                          padding: '6px 10px',
                          color: C.cream,
                          fontSize: 13,
                          fontFamily: "'JetBrains Mono', monospace",
                          width: '100%',
                        }}
                      />
                      <span style={{ color: C.muted }}>→</span>
                      <input
                        type="time"
                        value={slot.end_time}
                        onChange={e => handleUpdateSlot(idx, 'end_time', e.target.value)}
                        style={{
                          background: C.panel,
                          border: `1px solid ${C.hairline}`,
                          borderRadius: 8,
                          padding: '6px 10px',
                          color: C.cream,
                          fontSize: 13,
                          fontFamily: "'JetBrains Mono', monospace",
                          width: '100%',
                        }}
                      />
                    </div>
                  </div>

                  {/* Subject selector / Input */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'JetBrains Mono', monospace" }}>
                        Subject Name *
                      </label>
                      <button
                        onClick={() => setShowSubjectModal(true)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: C.gold,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0,
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        + New
                      </button>
                    </div>
                    <input
                      type="text"
                      list={`subject-options-${selectedDay}-${idx}`}
                      value={slot.subject_name}
                      placeholder="e.g. Mathematics"
                      onChange={e => handleUpdateSlot(idx, 'subject_name', e.target.value)}
                      style={{
                        background: C.panel,
                        border: `1px solid ${C.hairline}`,
                        borderRadius: 8,
                        padding: '7px 12px',
                        color: C.cream,
                        fontSize: 13,
                        fontFamily: "'Inter', sans-serif",
                        width: '100%',
                        boxSizing: 'border-box',
                      }}
                    />
                    <datalist id={`subject-options-${selectedDay}-${idx}`}>
                      {existingSubjects.map(s => (
                        <option key={s.id} value={s.name}>
                          {s.code ? `${s.code} · ` : ''}{s.name}
                        </option>
                      ))}
                    </datalist>
                  </div>

                  {/* Class Type */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                      Class Type
                    </label>
                    <select
                      value={slot.class_type}
                      onChange={e => handleUpdateSlot(idx, 'class_type', e.target.value as ClassType)}
                      style={{
                        background: C.panel,
                        border: `1px solid ${C.hairline}`,
                        borderRadius: 8,
                        padding: '7px 12px',
                        color: C.cream,
                        fontSize: 13,
                        fontFamily: "'Inter', sans-serif",
                        width: '100%',
                        boxSizing: 'border-box',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="L" style={{ background: '#111a2c' }}>Lecture (L)</option>
                      <option value="LAB" style={{ background: '#111a2c' }}>Laboratory (LAB)</option>
                      <option value="T" style={{ background: '#111a2c' }}>Tutorial (T)</option>
                    </select>
                  </div>

                  {/* Teacher & Room (combined column) */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                      Teacher & Room
                    </label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        type="text"
                        placeholder="Instructor"
                        value={slot.teacher_name || ''}
                        onChange={e => handleUpdateSlot(idx, 'teacher_name', e.target.value)}
                        style={{
                          background: C.panel,
                          border: `1px solid ${C.hairline}`,
                          borderRadius: 8,
                          padding: '7px 10px',
                          color: C.cream,
                          fontSize: 12,
                          fontFamily: "'Inter', sans-serif",
                          width: '55%',
                          boxSizing: 'border-box',
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Room"
                        value={slot.room || ''}
                        onChange={e => handleUpdateSlot(idx, 'room', e.target.value)}
                        style={{
                          background: C.panel,
                          border: `1px solid ${C.hairline}`,
                          borderRadius: 8,
                          padding: '7px 10px',
                          color: C.cream,
                          fontSize: 12,
                          fontFamily: "'Inter', sans-serif",
                          width: '45%',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                    <button
                      title="Duplicate slot"
                      onClick={() => handleDuplicateSlot(idx)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${C.hairline}`,
                        color: C.soft,
                        cursor: 'pointer',
                        fontSize: 12,
                      }}
                    >
                      📋
                    </button>
                    <button
                      title="Delete slot"
                      onClick={() => handleDeleteSlot(idx)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        background: C.redDim,
                        border: '1px solid rgba(217,95,106,0.3)',
                        color: C.red,
                        cursor: 'pointer',
                        fontSize: 12,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lock In Schedule Footer Bar */}
        <div
          style={{
            background: C.panelSoft,
            border: `1px solid ${C.hairline}`,
            borderRadius: 18,
            padding: '22px 28px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.cream, fontFamily: "'Inter', sans-serif" }}>
              Total Weekly Classes: <span style={{ color: C.gold, fontFamily: "'JetBrains Mono', monospace" }}>{slots.length}</span>
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 3, fontFamily: "'Inter', sans-serif" }}>
              Once locked in, your schedule will be ready on your daily dashboard. You can edit anytime!
            </div>
          </div>

          <button
            id="btn-lock-schedule"
            onClick={handleSaveAndLock}
            disabled={saving || slots.length === 0}
            style={{
              padding: '13px 28px',
              borderRadius: 12,
              background: slots.length > 0 ? C.gold : C.panel,
              border: 'none',
              color: slots.length > 0 ? '#111a2c' : C.muted,
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
              cursor: slots.length > 0 && !saving ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              boxShadow: slots.length > 0 ? '0 4px 20px rgba(227,183,106,0.28)' : 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              if (slots.length > 0 && !saving) e.currentTarget.style.background = C.goldSoft;
            }}
            onMouseLeave={e => {
              if (slots.length > 0 && !saving) e.currentTarget.style.background = C.gold;
            }}
          >
            {saving ? 'Locking In…' : '🔒 Lock In Schedule'}
          </button>
        </div>
      </div>

      {/* Quick Subject Creator Modal */}
      {showSubjectModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setShowSubjectModal(false)}
        >
          <div
            style={{
              background: '#111a2c',
              border: `1px solid ${C.hairline}`,
              borderRadius: 16,
              padding: '24px 28px',
              width: '100%',
              maxWidth: 420,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 19,
                fontWeight: 500,
                color: C.cream,
                marginTop: 0,
                marginBottom: 16,
              }}
            >
              Add New Subject
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                  Subject Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Data Structures & Algorithms"
                  value={newSubjName}
                  onChange={e => setNewSubjName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: '#0e1626',
                    border: `1px solid ${C.hairline}`,
                    color: C.cream,
                    fontSize: 13,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                  Subject Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CS201"
                  value={newSubjCode}
                  onChange={e => setNewSubjCode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: '#0e1626',
                    border: `1px solid ${C.hairline}`,
                    color: C.cream,
                    fontSize: 13,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                  Short Name (for badges)
                </label>
                <input
                  type="text"
                  placeholder="e.g. DSA"
                  value={newSubjShort}
                  onChange={e => setNewSubjShort(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: '#0e1626',
                    border: `1px solid ${C.hairline}`,
                    color: C.cream,
                    fontSize: 13,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
              <button
                onClick={() => setShowSubjectModal(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  background: 'transparent',
                  border: `1px solid ${C.hairline}`,
                  color: C.muted,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubject}
                style={{
                  padding: '8px 18px',
                  borderRadius: 8,
                  background: C.gold,
                  border: 'none',
                  color: '#111a2c',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Add Subject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
