import { Pause, Play, RotateCcw } from "lucide-react";

interface TimerControlsProps {
  isRunning: boolean;
  onToggle(): void;
  onReset(): void;
}

export function TimerControls({ isRunning, onToggle, onReset }: TimerControlsProps) {
  return (
    <div className="flex items-center gap-2.5">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/25"
      >
        {isRunning ? <Pause size={13} /> : <Play size={13} />}
        {isRunning ? "Pause" : "Start"}
      </button>
      <button
        onClick={onReset}
        className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        title="Reset"
      >
        <RotateCcw size={14} />
      </button>
    </div>
  );
}
