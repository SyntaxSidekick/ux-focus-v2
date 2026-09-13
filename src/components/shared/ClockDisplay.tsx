interface ClockDisplayProps {
  timeDisplay: string;
  seconds: string;
  dateLabel: string;
}

export function ClockDisplay({ timeDisplay, seconds, dateLabel }: ClockDisplayProps) {
  return (
    <div className="px-4 pb-3 text-center">
      <div className="flex items-end justify-center gap-1.5 leading-none">
        <span
          className="text-[48px] font-semibold tracking-tight text-foreground"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {timeDisplay}
        </span>
        <span
          className="text-xl text-muted-foreground mb-1.5 font-normal"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {seconds}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground mt-1">{dateLabel}</p>
    </div>
  );
}
