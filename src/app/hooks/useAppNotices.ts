import { useSyncExternalStore } from "react";

export type AppNotice = { message: string; error: boolean };

let notices: AppNotice[] = [];
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => notices;

export const getErrorDetail = (error: unknown) =>
  error instanceof Error ? error.message : "Unexpected error.";

export function showAppNotice(message: string, error = true) {
  if (notices.some(notice => notice.message === message)) return;
  const notice = { message, error };
  notices = [...notices, notice];
  queueMicrotask(() => listeners.forEach(listener => listener()));
  setTimeout(() => dismissAppNotice(notice), error ? 8000 : 4000);
}

export function dismissAppNotice(notice: AppNotice) {
  notices = notices.filter(item => item !== notice);
  listeners.forEach(listener => listener());
}

export function useAppNotices() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
