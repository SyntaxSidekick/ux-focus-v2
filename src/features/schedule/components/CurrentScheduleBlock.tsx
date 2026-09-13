import type { ScheduleItem } from "../model.ts";

function BlockTag({ type }: { type: ScheduleItem["sound"] }) {
  const styles = {
    deepwork: "bg-violet-500/15 text-violet-300 border-violet-500/20",
    break:    "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
    default:  "bg-sky-500/15 text-sky-300 border-sky-500/20",
  };
  const labels = { deepwork: "Focus", break: "Break", default: "Task" };
  return (
    <span className={`inline-flex text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border ${styles[type]}`}>
      {labels[type]}
    </span>
  );
}

export function CurrentScheduleBlock({ schedule, currentBlock, dayProgress, completedCount }: { schedule: ScheduleItem[]; currentBlock: ScheduleItem | null; dayProgress: number; completedCount: number }) {
  return (
        <div className="px-4 pb-4">
          {currentBlock ? (
            <div className="rounded-xl border border-border bg-secondary/40 p-3">
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Working On</p>
                  <p className="text-sm font-semibold text-foreground leading-snug">{currentBlock.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{currentBlock.start} – {currentBlock.end}</p>
                </div>
                <BlockTag type={currentBlock.sound} />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${dayProgress * 100}%`,
                      background: "linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)",
                      boxShadow: "0 0 8px color-mix(in srgb, var(--primary) 45%, transparent)",
                    }}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground tabular-nums flex-shrink-0">
                  {completedCount}/{schedule.length}
                </span>
              </div>
            </div>
          ) : schedule.length > 0 ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-emerald-400">All tasks complete!</p>
                <span className="text-[9px] text-emerald-400/70">{schedule.length}/{schedule.length}</span>
              </div>
              <div className="h-[3px] rounded-full" style={{ background: "linear-gradient(90deg, var(--primary), var(--accent))" }} />
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-secondary/20 p-3 text-center">
              <p className="text-xs text-muted-foreground">No tasks scheduled</p>
            </div>
          )}
        </div>
  );
}
