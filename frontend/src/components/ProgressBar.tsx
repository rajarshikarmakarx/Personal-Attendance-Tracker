interface ProgressBarProps {
  percentage: number;
  height?: number;
  showLabel?: boolean;
  animate?: boolean;
}

function getColor(pct: number): string {
  if (pct >= 85) return 'var(--green)';
  if (pct >= 75) return 'var(--yellow)';
  return 'var(--red)';
}

function getGlow(pct: number): string {
  if (pct >= 85) return 'var(--green-glow)';
  if (pct >= 75) return 'rgba(245, 158, 11, 0.35)';
  return 'var(--red-glow)';
}

function getGradient(pct: number): string {
  if (pct >= 85) return 'linear-gradient(90deg, #059669, #10b981, #34d399)';
  if (pct >= 75) return 'linear-gradient(90deg, #d97706, #f59e0b, #fbbf24)';
  return 'linear-gradient(90deg, #e11d48, #f43f5e, #fb7185)';
}

export default function ProgressBar({ percentage, height = 6, showLabel = false, animate = true }: ProgressBarProps) {
  const color = getColor(percentage);
  const glow = getGlow(percentage);
  const gradient = getGradient(percentage);
  const width = Math.min(100, Math.max(0, percentage));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          flex: 1,
          height,
          borderRadius: height * 2,
          background: 'rgba(255, 255, 255, 0.06)',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: animate ? `${width}%` : `${width}%`,
            background: gradient,
            borderRadius: height * 2,
            transition: animate ? 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
            boxShadow: `0 0 ${height * 2}px ${glow}, 0 0 ${height}px ${glow}`,
            position: 'relative',
          }}
        >
          {/* Shimmer overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: height * 2,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: width > 0 ? 'shimmer 2.5s linear infinite' : 'none',
            }}
          />
        </div>
      </div>
      {showLabel && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color,
            minWidth: 44,
            textAlign: 'right',
            fontFamily: "'Outfit', 'Inter', sans-serif",
            letterSpacing: '-0.3px',
          }}
        >
          {percentage.toFixed(1)}%
        </span>
      )}
    </div>
  );
}
