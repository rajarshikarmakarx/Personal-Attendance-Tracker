import { format, addDays, subDays } from '../utils/date';

interface DateNavigatorProps {
  date: string; // ISO YYYY-MM-DD
  onDateChange: (date: string) => void;
}

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{ transform: direction === 'left' ? 'rotate(180deg)' : 'none' }}
    >
      <path
        d="M6 3L11 8L6 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DateNavigator({ date, onDateChange }: DateNavigatorProps) {
  const prev = subDays(date, 1);
  const next = addDays(date, 1);
  const today = new Date().toISOString().slice(0, 10);
  const isToday = date === today;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        justifyContent: 'center',
        padding: '16px 0',
      }}
    >
      {/* Previous */}
      <button
        id="btn-prev-date"
        onClick={() => onDateChange(prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 42,
          height: 42,
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border)',
          background: 'var(--bg-card)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: 16,
          transition: 'all 0.25s var(--ease-smooth)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        onMouseEnter={e => {
          const t = e.currentTarget;
          t.style.borderColor = 'var(--border-hover)';
          t.style.color = 'var(--text-primary)';
          t.style.background = 'var(--bg-elevated)';
          t.style.transform = 'scale(1.08)';
          t.style.boxShadow = '0 0 20px var(--glow-purple)';
        }}
        onMouseLeave={e => {
          const t = e.currentTarget;
          t.style.borderColor = 'var(--border)';
          t.style.color = 'var(--text-secondary)';
          t.style.background = 'var(--bg-card)';
          t.style.transform = 'scale(1)';
          t.style.boxShadow = 'none';
        }}
      >
        <ArrowIcon direction="left" />
      </button>

      {/* Date display */}
      <div style={{ textAlign: 'center', minWidth: 220 }}>
        <div
          style={{
            fontFamily: "'Outfit', 'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 20,
            color: 'var(--text-primary)',
            letterSpacing: '-0.5px',
            lineHeight: 1.3,
          }}
        >
          {format(date, 'EEEE, d MMMM')}
        </div>
        {isToday && (
          <span
            style={{
              display: 'inline-block',
              marginTop: 6,
              fontSize: 10,
              fontWeight: 700,
              color: '#a78bfa',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              padding: '3px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(124, 58, 237, 0.12)',
              border: '1px solid rgba(124, 58, 237, 0.25)',
              animation: 'pulseGlow 2.5s ease-in-out infinite',
            }}
          >
            Today
          </span>
        )}
      </div>

      {/* Next */}
      <button
        id="btn-next-date"
        onClick={() => onDateChange(next)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 42,
          height: 42,
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border)',
          background: 'var(--bg-card)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: 16,
          transition: 'all 0.25s var(--ease-smooth)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        onMouseEnter={e => {
          const t = e.currentTarget;
          t.style.borderColor = 'var(--border-hover)';
          t.style.color = 'var(--text-primary)';
          t.style.background = 'var(--bg-elevated)';
          t.style.transform = 'scale(1.08)';
          t.style.boxShadow = '0 0 20px var(--glow-purple)';
        }}
        onMouseLeave={e => {
          const t = e.currentTarget;
          t.style.borderColor = 'var(--border)';
          t.style.color = 'var(--text-secondary)';
          t.style.background = 'var(--bg-card)';
          t.style.transform = 'scale(1)';
          t.style.boxShadow = 'none';
        }}
      >
        <ArrowIcon direction="right" />
      </button>
    </div>
  );
}
