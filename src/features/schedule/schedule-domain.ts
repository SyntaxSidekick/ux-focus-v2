import type { NewTask, ScheduleItem } from "./model.ts";
import { isValidTime, timeToMinutes } from "../../lib/time/schedule-time.ts";

export function isScheduleSound(value: unknown): value is ScheduleItem["sound"] {
  return value === "deepwork" || value === "break" || value === "default";
}

export function normalizeScheduleItem(item: unknown, fallbackId: string): ScheduleItem | null {
  if (!item || typeof item !== "object") return null;
  const raw = item as Record<string, unknown>;
  const label = typeof raw.label === "string" ? raw.label : typeof raw.title === "string" ? raw.title : "";
  const start = typeof raw.start === "string" ? raw.start : typeof raw.startTime === "string" ? raw.startTime : "";
  const end = typeof raw.end === "string" ? raw.end : typeof raw.endTime === "string" ? raw.endTime : "";
  if (!label || !isValidTime(start) || !isValidTime(end)) return null;

  return {
    ...raw,
    id: typeof raw.id === "string" ? raw.id : fallbackId,
    label,
    title: typeof raw.title === "string" ? raw.title : label,
    start,
    end,
    startTime: typeof raw.startTime === "string" ? raw.startTime : start,
    endTime: typeof raw.endTime === "string" ? raw.endTime : end,
    sound: isScheduleSound(raw.sound) ? raw.sound : "default",
    completed: typeof raw.completed === "boolean" ? raw.completed : undefined,
    reminderEnabled: typeof raw.reminderEnabled === "boolean" ? raw.reminderEnabled : undefined,
    startReminderLastTriggeredDate: typeof raw.startReminderLastTriggeredDate === "string" ? raw.startReminderLastTriggeredDate : undefined,
    reminderLastTriggeredDate: typeof raw.reminderLastTriggeredDate === "string" ? raw.reminderLastTriggeredDate : undefined,
  };
}

export function normalizeSchedule(value: unknown, fallbackIds: string[]): ScheduleItem[] | null {
  if (!Array.isArray(value)) return null;
  const schedule = value.map((item, index) => normalizeScheduleItem(item, fallbackIds[index]));
  if (schedule.some(item => item === null)) return null;
  return schedule as ScheduleItem[];
}

export function getSessionDurationSecs(item: ScheduleItem | null): number {
  if (!item) return 0;
  const start = timeToMinutes(item.startTime ?? item.start);
  const end = timeToMinutes(item.endTime ?? item.end);
  return Math.max(0, end - start) * 60;
}

export function getCurrentBlock(schedule: ScheduleItem[]): ScheduleItem | null {
  return schedule.find(item => !item.completed) ?? null;
}

export function getDayProgress(schedule: ScheduleItem[]): number {
  if (!schedule.length) return 0;
  return getCompletedCount(schedule) / schedule.length;
}

export function getCompletedCount(schedule: ScheduleItem[]): number {
  return schedule.filter(i => i.completed).length;
}

export function addScheduleTask(schedule: ScheduleItem[], draft: NewTask, id: string): ScheduleItem[] {
  const item: ScheduleItem = { ...draft, id, title: draft.label, startTime: draft.start, endTime: draft.end };
  return [...schedule, item].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
}

export function removeScheduleTask(schedule: ScheduleItem[], id: string): ScheduleItem[] {
  return schedule.filter(item => item.id !== id);
}

export function toggleScheduleTaskComplete(schedule: ScheduleItem[], id: string): ScheduleItem[] {
  return schedule.map(item => item.id === id ? { ...item, completed: !item.completed } : item);
}

export function toggleScheduleTaskReminder(schedule: ScheduleItem[], id: string): ScheduleItem[] {
  return schedule.map(item => item.id === id ? { ...item, reminderEnabled: item.reminderEnabled === false, reminderLastTriggeredDate: undefined, startReminderLastTriggeredDate: undefined } : item);
}

export function recordScheduleTaskReminder(schedule: ScheduleItem[], id: string, atStart: boolean, date: string): ScheduleItem[] {
  return schedule.map(item => item.id === id ? { ...item, [atStart ? "startReminderLastTriggeredDate" : "reminderLastTriggeredDate"]: date } : item);
}
