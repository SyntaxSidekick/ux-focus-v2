import { useCallback } from "react";
import type { ReminderEvent } from "../../features/reminders/model.ts";
import { notificationAudio } from "../../lib/audio/notifications-audio.ts";
import { desktop } from "../../lib/platform/desktop.ts";

interface ReminderDeliveryOptions {
  onShowInAppReminder(event: ReminderEvent): void;
}

export function useReminderDelivery({ onShowInAppReminder }: ReminderDeliveryOptions) {
  return useCallback((event: ReminderEvent) => {
    onShowInAppReminder(event);
    if (event.kind === "task-warning" || event.kind === "task-start") {
      notificationAudio.playTaskChime(event.task, event.atStart);
      void desktop.showTaskReminder({ label: event.task.label, start: event.task.start, atStart: event.atStart });
      return;
    }

    notificationAudio.playWellnessReminder();
    void desktop.showWellnessReminder(event);
  }, [onShowInAppReminder]);
}
