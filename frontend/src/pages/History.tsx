import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getSchedule, getScheduleRange } from '../api/client';
import type { ScheduleEntry, AttendanceStatus } from '../types/attendance';
import AttendanceCard from '../components/AttendanceCard';
import { format, todayStr, getDaysInMonth, getFirstDayOfMonth } from '../utils/date';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

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
      .catch((err) => {
        console.error('Failed to load month schedule range:', err);
        toast.error('Failed to load calendar data');
      });
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
    if (data.marked === 0) return 'var(--text-muted)';
    if (data.present === data.marked) return 'var(--green)';
    if (data.present > data.absent) return 'var(--yellow)';
    return 'var(--red)';
  };

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '36px 24px 60px' }}>
      <h1
        style={{
          fontFamily: "'Outfit', 'Inter', sans-serif",
          fontSize: 32,
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: 32,
          letterSpacing: '-1px',
          animation: 'fadeInUp 0.5s var(--ease-out-expo) both',
        }}
      >
        Calendar History
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 28, alignItems: 'start' }}>
        {/* Calendar Card */}
        <div
          style={{
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            animation: 'fadeInUp 0.5s var(--ease-out-expo) 0.05s both',
          }}
        >
          {/* Month Header Nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <button
              id="btn-prev-month"
              onClick={prevMonth}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              ←
            </button>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>
              {MONTHS[month]} {year}
            </div>
            <button
              id="btn-next-month"
              onClick={nextMonth}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              →
            </button>
          </div>

          {/* Weekday Titles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 12 }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
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
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: isSelected
                      ? '2px solid #a78bfa'
                      : isToday
                      ? '1px solid var(--border-hover)'
                      : '1px solid rgba(255, 255, 255, 0.03)',
                    background: isSelected
                      ? 'rgba(124, 58, 237, 0.15)'
                      : isToday
                      ? 'rgba(255, 255, 255, 0.06)'
                      : 'rgba(255, 255, 255, 0.02)',
                    transition: 'all 0.2s var(--ease-smooth)',
                    boxShadow: isSelected ? '0 0 16px var(--glow-purple)' : 'none',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 13,
                      fontWeight: isToday || isSelected ? 800 : 500,
                      color: isSelected ? '#fff' : isToday ? '#a78bfa' : 'var(--text-secondary)',
                    }}
                  >
                    {d}
                  </div>
                  {data && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 4 }}>
                      <div
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: getColor(data),
                          boxShadow: `0 0 6px ${getColor(data)}`,
                        }}
                      />
                      {hasMissing && (
                        <div style={{ fontSize: 9, color: 'var(--yellow)', fontWeight: 800 }}>!</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Day Detail Side Panel */}
        <div
          style={{
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            minHeight: 360,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            animation: 'fadeInUp 0.5s var(--ease-out-expo) 0.1s both',
          }}
        >
          {!selectedDate ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)', fontSize: 14 }}>
              👈 Select a date on the calendar to view details
            </div>
          ) : loadingSchedule ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)', fontSize: 14 }}>
              Loading day details...
            </div>
          ) : (
            <div style={{ animation: 'fadeInScale 0.4s var(--ease-spring) both' }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 20, color: 'var(--text-primary)', marginBottom: 20 }}>
                {format(selectedDate, 'EEEE, d MMMM')}
              </div>
              {selectedSchedule.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '60px 0' }}>
                  No classes scheduled on this day
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
