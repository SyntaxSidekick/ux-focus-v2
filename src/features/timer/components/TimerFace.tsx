interface TimerFaceProps {
  progress: number;
  timeDisplay: string;
  isRunning: boolean;
  totalSeconds: number;
}

export function TimerFace({ progress, timeDisplay, isRunning, totalSeconds }: TimerFaceProps) {
  const SIZE = 180;
  const CX = SIZE / 2;
  const R_OUTER = 80;
  const R_INNER = 66;
  const STROKE = 7;
  const circ = 2 * Math.PI * R_OUTER;
  const offset = circ * (1 - progress);

  // totalSeconds is intentionally kept in the public API for future timer states.
  void totalSeconds;

  // tick marks at every 5-minute interval
  const TICKS = 12;
  const ticks = Array.from({ length: TICKS }, (_, i) => {
    const angle = (i / TICKS) * 2 * Math.PI - Math.PI / 2;
    const major = i % 3 === 0;
    const rOuter = R_OUTER + 10;
    const rInner = rOuter - (major ? 8 : 5);
    return {
      x1: CX + rInner * Math.cos(angle),
      y1: CX + rInner * Math.sin(angle),
      x2: CX + rOuter * Math.cos(angle),
      y2: CX + rOuter * Math.sin(angle),
      major,
    };
  });

  const pct = Math.round(progress * 100);

  return (
    <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      <svg
        width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="absolute inset-0 -rotate-90"
      >
        {/* Outer glow ring when running */}
        {isRunning && (
          <circle
            cx={CX} cy={CX} r={R_OUTER}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={STROKE + 6}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            opacity="0.12"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        )}
        {/* Track */}
        <circle cx={CX} cy={CX} r={R_OUTER} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={STROKE} />
        {/* Progress arc */}
        <circle
          cx={CX} cy={CX} r={R_OUTER}
          fill="none"
          stroke="url(#pomoGrad)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
        {/* Inner filled circle (face bg) */}
        <circle cx={CX} cy={CX} r={R_INNER} fill="rgba(255,255,255,0.03)" />
        {/* Inner border */}
        <circle cx={CX} cy={CX} r={R_INNER} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

        {/* Gradient def */}
        <defs>
          <linearGradient id="pomoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isRunning ? "var(--primary)" : "var(--muted)"} />
            <stop offset="100%" stopColor={isRunning ? "var(--accent)" : "var(--secondary)"} />
          </linearGradient>
        </defs>
      </svg>

      {/* Tick marks (not rotated — drawn in normal space) */}
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0">
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={t.major ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"}
            strokeWidth={t.major ? 1.5 : 1}
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center select-none">
        <span
          className="text-[30px] font-semibold tracking-widest leading-none text-foreground"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {timeDisplay}
        </span>
        <span className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground mt-1.5">
          {isRunning ? `${pct}% elapsed` : "pomodoro"}
        </span>
      </div>
    </div>
  );
}
