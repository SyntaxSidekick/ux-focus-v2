import { useEffect } from "react";
import type { ReminderEvent } from "./model.ts";
import { getDueScheduleReminder, type ScheduleReminderCandidate } from "./schedule-reminders.ts";

interface UseScheduleRemindersOptions {
  schedule: ScheduleReminderCandidate[];
  now: Date;
  onRecordTaskReminder(id: string, atStart: boolean, date: string): void;
  onReminder(event: ReminderEvent): void;
}

export function useScheduleReminders({ schedule, now, onRecordTaskReminder, onReminder }: UseScheduleRemindersOptions) {
  useEffect(() => {
    const due = getDueScheduleReminder(schedule, now);
    if (!due) return;
    onRecordTaskReminder(due.task.id, due.atStart, due.date);
    onReminder(due);
  }, [schedule, now, onRecordTaskReminder, onReminder]);
}
