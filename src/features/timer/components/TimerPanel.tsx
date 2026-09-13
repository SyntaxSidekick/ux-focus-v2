import { TimerFace } from "./TimerFace.tsx";
import { TimerControls } from "./TimerControls.tsx";

interface TimerPanelProps {
  progress: number;
  timeDisplay: string;
  isRunning: boolean;
  totalSeconds: number;
  onToggle(): void;
  onReset(): void;
}

export function TimerPanel({ progress, timeDisplay, isRunning, totalSeconds, onToggle, onReset }: TimerPanelProps) {
  return (
    <div className="px-4 py-5 flex flex-col items-center gap-4">
      <TimerFace
        progress={progress}
        timeDisplay={timeDisplay}
        isRunning={isRunning}
        totalSeconds={totalSeconds}
      />
      <TimerControls isRunning={isRunning} onToggle={onToggle} onReset={onReset} />
      <p className="text-[10px] text-muted-foreground">While running: switch every 30 min / stretch every 60 min</p>
    </div>
  );
}
