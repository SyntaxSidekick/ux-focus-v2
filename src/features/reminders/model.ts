export interface ReminderNoticeModel {
  title: string;
  message: string;
  icon?: string;
}

export interface WellnessReminderEvent extends ReminderNoticeModel {
  kind: "posture" | "stretch" | "movement";
  icon: string;
}

export interface ScheduleReminderTask {
  id: string;
  label: string;
  start: string;
  sound: "deepwork" | "break" | "default";
}

export interface ScheduleReminderEvent extends ReminderNoticeModel {
  kind: "task-warning" | "task-start";
  icon: string;
  atStart: boolean;
  date: string;
  task: ScheduleReminderTask;
}

export type ReminderEvent = WellnessReminderEvent | ScheduleReminderEvent;
