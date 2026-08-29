interface ProgressBarProps {
  percentage: number;
  height?: number;
  showLabel?: boolean;
  animate?: boolean;
}

/* ── Presently theme tokens ── */
const C = {
  green: '#5bbf8a',
  gold:  '#e3b76a',
  red:   '#d95f6a',
};

function getColor(pct: number): string {
  if (pct >= 85) return C.green;
  if (pct >= 75) return C.gold;
  return C.red;
}

function getGradient(pct: number): string {
  if (pct >= 85) return `linear-gradient(90deg, #3da870, ${C.green}, #7dd9a8)`;
  if (pct >= 75) return `linear-gradient(90deg, #c99a50, ${C.gold}, #f0cd8f)`;
  return `linear-gradient(90deg, #b54455, ${C.red}, #e88090)`;
}

export default function ProgressBar({ percentage, height = 6, showLabel = false, animate = true }: ProgressBarProps) {
  const color = getColor(percentage);
  const gradient = getGradient(percentage);
  const width = Math.min(100, Math.max(0, percentage));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          flex: 1,
          height,
          borderRadius: height * 2,
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${width}%`,
            background: gradient,
            borderRadius: height * 2,
            transition: animate ? 'width 0.9s cubic-bezier(0.16,1,0.3,1)' : 'none',
          }}
        />
      </div>
      {showLabel && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color,
            minWidth: 44,
            textAlign: 'right',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {percentage.toFixed(1)}%
        </span>
      )}
    </div>
  );
}
