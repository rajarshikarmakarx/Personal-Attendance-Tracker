import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getSchedule, getScheduleRange } from '../api/client';
import type { ScheduleEntry, AttendanceStatus } from '../types/attendance';
import AttendanceCard from '../components/AttendanceCard';
import { format, todayStr, getDaysInMonth, getFirstDayOfMonth } from '../utils/date';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

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
  red:         '#d95f6a',
  yellow:      '#e3b76a',
};

interface DayData {
  total: number;
  marked: number;
  present: number;
  absent: number;
}

export default function History() {
  const today = todayStr();
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayData, setDayData] = useState<Record<string, DayData>>({});
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleEntry[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  useEffect(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const startDateStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

    getScheduleRange(startDateStr, endDateStr)
      .then(rangeData => {
        const newDayData: Record<string, DayData> = {};
        Object.entries(rangeData).forEach(([dateStr, entries]) => {
          if (entries.length > 0) {
            newDayData[dateStr] = {
              total: entries.length,
              marked: entries.filter(e => e.status !== 'UNMARKED').length,
              present: entries.filter(e => e.status === 'PRESENT').length,
              absent: entries.filter(e => e.status === 'ABSENT').length,
            };
          }
        });
        setDayData(newDayData);
      })
      .catch(() => toast.error('Failed to load calendar data'));
  }, [year, month]);

  const handleDayClick = async (dateStr: string) => {
    setSelectedDate(dateStr);
    setLoadingSchedule(true);
    try {
      const data = await getSchedule(dateStr);
      setSelectedSchedule(data);
    } catch {
      toast.error('Failed to load day details');
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleUpdate = (entryId: number, newStatus: AttendanceStatus, attendanceId: number | null) => {
    if (!selectedDate) return;
    setSelectedSchedule(prev => {
      const updated = prev.map(e =>
        e.timetable_entry_id === entryId
          ? { ...e, status: newStatus, attendance_id: attendanceId }
          : e
      );
      setDayData(old => {
        if (!old[selectedDate]) return old;
        return {
          ...old,
          [selectedDate]: {
            ...old[selectedDate],
            marked: updated.filter(e => e.status !== 'UNMARKED').length,
            present: updated.filter(e => e.status === 'PRESENT').length,
            absent: updated.filter(e => e.status === 'ABSENT').length,
          }
        };
      });
      return updated;
    });
  };

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDow = getFirstDayOfMonth(year, month);
  const startPadding = (firstDow + 6) % 7;

  const getColor = (data: DayData) => {
    if (data.marked === 0) return C.muted;
    if (data.present === data.marked) return C.green;
    if (data.present > data.absent) return C.yellow;
    return C.red;
  };

  const cardStyle = {
    background: C.panelSoft,
    border: `1px solid ${C.hairline}`,
    borderRadius: 18,
    padding: '26px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
  };

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
        Calendar History
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'start' }}>
        {/* Calendar Card */}
        <div style={{ ...cardStyle, animation: 'driftUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.05s both' }}>
          {/* Month Header Nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <button
              id="btn-prev-month"
              onClick={prevMonth}
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'transparent',
                border: `1px solid ${C.hairline}`,
                color: C.soft,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                transition: 'border-color 0.2s ease, color 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.hairline; e.currentTarget.style.color = C.soft; }}
            >
              ←
            </button>
            <div
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 500,
                fontSize: 17,
                color: C.cream,
                letterSpacing: '-0.3px',
              }}
            >
              {MONTHS[month]} {year}
            </div>
            <button
              id="btn-next-month"
              onClick={nextMonth}
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'transparent',
                border: `1px solid ${C.hairline}`,
                color: C.soft,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                transition: 'border-color 0.2s ease, color 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.hairline; e.currentTarget.style.color = C.soft; }}
            >
              →
            </button>
          </div>

          {/* Weekday Titles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5, marginBottom: 10 }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'JetBrains Mono', monospace" }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
            {Array(startPadding).fill(null).map((_, i) => <div key={`pad-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const d = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const data = dayData[dateStr];
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedDate;
              const hasMissing = data && data.marked < data.total;

              return (
                <div
                  key={d}
                  id={`calendar-day-${dateStr}`}
                  onClick={() => handleDayClick(dateStr)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 9,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: isSelected
                      ? `2px solid ${C.gold}`
                      : isToday
                      ? `1px solid rgba(227,183,106,0.4)`
                      : `1px solid ${C.hairlineSoft}`,
                    background: isSelected
                      ? C.goldDim
                      : isToday
                      ? 'rgba(255,255,255,0.04)'
                      : 'rgba(255,255,255,0.015)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12,
                      fontWeight: isToday || isSelected ? 700 : 500,
                      color: isSelected ? C.goldSoft : isToday ? C.gold : C.soft,
                    }}
                  >
                    {d}
                  </div>
                  {data && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 3 }}>
                      <div
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          background: getColor(data),
                        }}
                      />
                      {hasMissing && (
                        <div style={{ fontSize: 8, color: C.yellow, fontWeight: 800 }}>!</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Day Detail Side Panel */}
        <div style={{ ...cardStyle, minHeight: 340, animation: 'driftUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}>
          {!selectedDate ? (
            <div style={{ textAlign: 'center', padding: '70px 0', color: C.muted, fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
              ← Select a date to view details
            </div>
          ) : loadingSchedule ? (
            <div style={{ textAlign: 'center', padding: '70px 0', color: C.muted, fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
              Loading…
            </div>
          ) : (
            <div style={{ animation: 'driftUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
              <div
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 500,
                  fontSize: 18,
                  color: C.cream,
                  marginBottom: 18,
                  letterSpacing: '-0.3px',
                }}
              >
                {format(selectedDate, 'EEEE, d MMMM')}
              </div>
              {selectedSchedule.length === 0 ? (
                <div style={{ color: C.muted, fontSize: 13, textAlign: 'center', padding: '50px 0', fontFamily: "'Inter', sans-serif" }}>
                  No classes scheduled on this day
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedSchedule.map((entry, idx) => (
                    <AttendanceCard
                      key={entry.timetable_entry_id}
                      entry={entry}
                      date={selectedDate}
                      onUpdate={handleUpdate}
                      compact={true}
                      index={idx}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
