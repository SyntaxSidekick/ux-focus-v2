import { useCallback, useState } from "react";
import { DEFAULT_SCHEDULE } from "./defaults.ts";
import type { NewTask, ScheduleItem } from "./model.ts";
import { addScheduleTask, removeScheduleTask, toggleScheduleTaskComplete, toggleScheduleTaskReminder, recordScheduleTaskReminder, getCurrentBlock, getDayProgress, getCompletedCount } from "./schedule-domain.ts";
import { scheduleRepository } from "./schedule-repository.ts";

interface ScheduleNotices {
  onLoadError(error: unknown): void;
  onSaveError(error: unknown): void;
}

export function useSchedule({ onLoadError, onSaveError }: ScheduleNotices) {
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    try { return scheduleRepository.load(); }
    catch (error) { onLoadError(error); return DEFAULT_SCHEDULE; }
  });

  const update = useCallback((mutation: (previous: ScheduleItem[]) => ScheduleItem[]) => {
    setSchedule(previous => {
      const next = mutation(previous);
      try { scheduleRepository.save(next); }
      catch (error) { onSaveError(error); }
      return next;
    });
  }, [onSaveError]);

  const addTask = useCallback((draft: NewTask) => {
    if (!draft.label || !draft.start || !draft.end) return false;
    const id = Date.now().toString();
    update(previous => addScheduleTask(previous, draft, id));
    return true;
  }, [update]);
  const removeTask = useCallback((id: string) => update(previous => removeScheduleTask(previous, id)), [update]);
  const toggleTaskComplete = useCallback((id: string) => update(previous => toggleScheduleTaskComplete(previous, id)), [update]);
  const toggleTaskReminder = useCallback((id: string) => update(previous => toggleScheduleTaskReminder(previous, id)), [update]);
  const recordTaskReminder = useCallback((id: string, atStart: boolean, date: string) => update(previous => recordScheduleTaskReminder(previous, id, atStart, date)), [update]);
  const resetSchedule = useCallback(() => update(() => DEFAULT_SCHEDULE), [update]);
  const replaceSchedule = useCallback((replacement: ScheduleItem[]) => {
    // Imports must save successfully before changing the visible state.
    scheduleRepository.saveReplacement(replacement);
    setSchedule(replacement);
  }, []);

  return {
    schedule, currentBlock: getCurrentBlock(schedule),
    dayProgress: getDayProgress(schedule), completedCount: getCompletedCount(schedule),
    addTask, removeTask, toggleTaskComplete, toggleTaskReminder, recordTaskReminder,
    resetSchedule, replaceSchedule,
  };
}
