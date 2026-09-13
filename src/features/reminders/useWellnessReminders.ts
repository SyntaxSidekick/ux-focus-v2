import { useCallback, useEffect, useRef } from "react";
import { advanceReminders, getReminderContent } from "./wellness-reminders.mjs";
import type { ReminderEvent } from "./model.ts";

interface TimerTick {
  deltaMs: number;
  remainingSeconds: number;
}

interface SessionLike {
  id?: string;
  start?: string;
  end?: string;
  startTime?: string;
  endTime?: string;
}

interface UseWellnessRemindersOptions {
  currentSession: SessionLike | null;
  onReminder(event: ReminderEvent): void;
}

export function useWellnessReminders({ currentSession, onReminder }: UseWellnessRemindersOptions) {
  const elapsedMs = useRef(0);
  const rotations = useRef<Record<string, number>>({});

  const handleTimerTick = useCallback(({ deltaMs, remainingSeconds }: TimerTick) => {
    const reminder = advanceReminders(elapsedMs.current, deltaMs, remainingSeconds);
    elapsedMs.current = reminder.elapsedMs;
    if (!reminder.due.length) return;
    const content = getReminderContent(reminder.due, rotations.current);
    if (!content) return;
    onReminder(content);
  }, [onReminder]);

  const reset = useCallback(() => {
    elapsedMs.current = 0;
  }, []);

  useEffect(() => {
    reset();
  }, [reset, currentSession?.id, currentSession?.startTime, currentSession?.endTime, currentSession?.start, currentSession?.end]);

  return { handleTimerTick, reset };
}
