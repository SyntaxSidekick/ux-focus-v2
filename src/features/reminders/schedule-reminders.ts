import { localDateKey } from "../../lib/time/format.ts";
import { timeToMinutes } from "../../lib/time/schedule-time.ts";
import type { ScheduleReminderEvent, ScheduleReminderTask } from "./model.ts";

export interface ScheduleReminderCandidate extends ScheduleReminderTask {
  completed?: boolean;
  reminderEnabled?: boolean;
  reminderLastTriggeredDate?: string;
  startReminderLastTriggeredDate?: string;
}

export function getDueScheduleReminder(schedule: ScheduleReminderCandidate[], now: Date): ScheduleReminderEvent | null {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const today = localDateKey(now);
  const due = schedule.find(item => !item.completed && item.reminderEnabled !== false && (
    (item.startReminderLastTriggeredDate !== today && currentMinutes === timeToMinutes(item.start)) ||
    (item.reminderLastTriggeredDate !== today && currentMinutes >= timeToMinutes(item.start) - 5 && currentMinutes < timeToMinutes(item.start))
  ));
  if (!due) return null;
  const atStart = currentMinutes === timeToMinutes(due.start);
  return {
    kind: atStart ? "task-start" : "task-warning",
    title: atStart ? "Time to start" : "Coming up",
    message: due.label + " (" + due.start + ")",
    icon: "\u{1F514}",
    atStart,
    date: today,
    task: {
      id: due.id,
      label: due.label,
      start: due.start,
      sound: due.sound,
    },
  };
}
