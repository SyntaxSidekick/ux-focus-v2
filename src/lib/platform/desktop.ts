import type { ReminderEvent } from "../../features/reminders/model.ts";

interface DesktopReminderPayload {
  label?: string;
  start?: string;
  atStart?: boolean;
  kind?: string;
  title?: string;
  message?: string;
  icon?: string;
}

interface DesktopBridge {
  minimize?: () => Promise<unknown>;
  toggleFullHeight?: () => Promise<unknown>;
  close?: () => Promise<unknown>;
  showReminder?: (reminder: DesktopReminderPayload) => Promise<unknown>;
}

const getBridge = () => (window as Window & { uxFocusWindow?: DesktopBridge }).uxFocusWindow;

export const desktop = {
  minimize: () => getBridge()?.minimize?.(),
  toggleFullHeight: () => getBridge()?.toggleFullHeight?.(),
  close: () => getBridge()?.close?.(),
  showTaskReminder: (payload: { label: string; start: string; atStart: boolean }) => getBridge()?.showReminder?.(payload),
  showWellnessReminder: (event: ReminderEvent) => getBridge()?.showReminder?.(event),
};
