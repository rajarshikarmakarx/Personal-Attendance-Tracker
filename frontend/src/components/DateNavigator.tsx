import { format, addDays, subDays } from '../utils/date';

interface DateNavigatorProps {
  date: string; // ISO YYYY-MM-DD
  onDateChange: (date: string) => void;
}

/* ── Presently theme tokens ── */
const C = {
  panelSoft:   '#0e1626',
  hairline:    'rgba(255,255,255,0.09)',
  cream:       '#f3ecdd',
  soft:        '#c7cfe0',
  muted:       '#8a93ab',
  gold:        '#e3b76a',
  goldDim:     'rgba(227,183,106,0.14)',
  goldBorder:  'rgba(227,183,106,0.28)',
};

function ArrowBtn({ id, onClick, direction }: { id: string; onClick: () => void; direction: 'left' | 'right' }) {
  return (
    <button
      id={id}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: `1px solid ${C.hairline}`,
        background: 'transparent',
        color: C.soft,
        cursor: 'pointer',
        transition: 'border-color 0.2s ease, color 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = C.gold;
        e.currentTarget.style.color = C.gold;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = C.hairline;
        e.currentTarget.style.color = C.soft;
      }}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 16 16"
        fill="none"
        style={{ transform: direction === 'left' ? 'rotate(180deg)' : 'none' }}
      >
        <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
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
        padding: '14px 0',
      }}
    >
      <ArrowBtn id="btn-prev-date" onClick={() => onDateChange(prev)} direction="left" />

      {/* Date display */}
      <div style={{ textAlign: 'center', minWidth: 210 }}>
        <div
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 500,
            fontSize: 20,
            color: C.cream,
            letterSpacing: '-0.4px',
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
              fontSize: 9,
              fontWeight: 700,
              color: C.gold,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              padding: '3px 10px',
              borderRadius: 999,
              background: C.goldDim,
              border: `1px solid ${C.goldBorder}`,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Today
          </span>
        )}
      </div>

      <ArrowBtn id="btn-next-date" onClick={() => onDateChange(next)} direction="right" />
    </div>
  );
}
