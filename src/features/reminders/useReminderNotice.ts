import { useCallback, useState } from "react";
import type { ReminderEvent, ReminderNoticeModel } from "./model.ts";

export function useReminderNotice() {
  const [notice, setNotice] = useState<ReminderNoticeModel | null>(null);

  const showReminderNotice = useCallback((event: ReminderEvent) => {
    setNotice({ title: event.title, message: event.message, icon: event.icon });
  }, []);

  const dismissReminderNotice = useCallback(() => {
    setNotice(null);
  }, []);

  return { notice, showReminderNotice, dismissReminderNotice };
}
