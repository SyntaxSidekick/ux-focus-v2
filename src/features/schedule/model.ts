export interface ScheduleItem {
  id: string;
  label: string;
  title?: string;
  details?: string;
  start: string;
  end: string;
  startTime: string;
  endTime: string;
  sound: "deepwork" | "break" | "default";
  completed?: boolean;
  reminderEnabled?: boolean;
  reminderLastTriggeredDate?: string;
  startReminderLastTriggeredDate?: string;
}

export type ScheduleSound = ScheduleItem["sound"];

export type NewTask = Pick<ScheduleItem, "label" | "start" | "end" | "details" | "sound">;
