import { useState } from "react";
import { Bell, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import type { ScheduleItem } from "../model.ts";
import { TaskDetails } from "./TaskDetails.tsx";

export interface ScheduleRowActions {
  onComplete(id: string): void;
  onDelete(id: string): void;
  onToggleReminder(id: string): void;
}

export function ScheduleRow({ item, isActive, index, onComplete, onDelete, onToggleReminder }: ScheduleRowActions & { item: ScheduleItem; isActive: boolean; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const isDone = !!item.completed;
  const isEven = index % 2 === 0;
  const details = item.details;
  const hasDetails = Boolean(details);
  const detailsId = `task-details-${item.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;

  return (
              <div>
              <div
                aria-current={isActive ? "time" : undefined}
                className={`group flex items-center gap-2.5 px-4 py-2.5 transition-all ${
                  isActive
                    ? "bg-primary/25 border-l-2 border-l-primary ring-1 ring-inset ring-primary/40"
                    : isEven
                    ? "bg-secondary/30"
                    : "bg-transparent"
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => onComplete(item.id)}
                  className={`flex-shrink-0 w-[15px] h-[15px] rounded-[4px] border flex items-center justify-center transition-all ${
                    isDone
                      ? "bg-primary border-primary"
                      : isActive
                      ? "border-primary bg-primary/15 hover:bg-primary/30"
                      : "border-muted-foreground/25 hover:border-muted-foreground/60"
                  }`}
                >
                  {isDone && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                {/* Label + time */}
                <div className="flex-1 min-w-0">
                  <p title={item.label} className={`text-xs font-medium truncate transition-colors ${
                    isDone
                      ? "text-muted-foreground/35 line-through decoration-muted-foreground/25"
                      : isActive
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}>
                    {item.label}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className={`text-[10px] ${isActive ? "text-foreground/85" : "text-muted-foreground/45"}`}>{item.start} – {item.end}</p>
                    {isActive && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded bg-primary px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-primary-foreground">
                        <span className="h-1 w-1 rounded-full bg-current" aria-hidden="true" />
                        Active
                      </span>
                    )}
                  </div>
                </div>

                {hasDetails && (
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={detailsId}
                    aria-label={`${expanded ? "Hide" : "Show"} details for ${item.label}`}
                    title={expanded ? "Hide details" : "Show details"}
                    onClick={() => setExpanded(value => !value)}
                    className="p-1 rounded text-muted-foreground/55 hover:text-foreground hover:bg-secondary transition-all flex-shrink-0"
                  >
                    {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>
                )}

                {/* Type dot */}
                <div className={`w-1 h-1 rounded-full flex-shrink-0 ${
                  item.sound === "deepwork" ? "bg-violet-400/50"
                  : item.sound === "break"  ? "bg-emerald-400/50"
                  : "bg-sky-400/50"
                }`} />

                <button onClick={() => onToggleReminder(item.id)}
                  className={`p-1 rounded transition-all flex-shrink-0 ${item.reminderEnabled !== false ? "text-amber-400 bg-amber-400/10" : "text-muted-foreground/45 hover:text-amber-400"}`}
                  title={item.reminderEnabled !== false ? "Reminders on: 5 minutes before and at start" : "Enable task reminders"} aria-pressed={item.reminderEnabled !== false}>
                  <Bell size={12} fill={item.reminderEnabled !== false ? "currentColor" : "none"} />
                </button>

                {/* Delete */}
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-1 rounded text-muted-foreground/55 hover:text-destructive hover:bg-destructive/10 transition-all flex-shrink-0 ml-1"
                  title="Delete event"
                >
                  <Trash2 size={11} />
                </button>
              </div>
              {details && expanded && <TaskDetails id={detailsId} details={details} />}
              </div>
  );
}
