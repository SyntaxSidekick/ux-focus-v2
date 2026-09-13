export interface TimerSession {
  id?: string;
  start?: string;
  end?: string;
  startTime?: string;
  endTime?: string;
}

function toSeconds(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours * 60 + minutes) * 60;
}

export function getRemainingSessionSecs(item: TimerSession | null, now = new Date()): number {
  if (!item) return 0;
  const endTime = item.endTime ?? item.end;
  if (!endTime) return 0;
  const end = toSeconds(endTime);
  const current = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  return Math.max(0, end - current);
}

export function getSessionDurationSecs(item: TimerSession | null): number {
  if (!item) return 0;
  const startTime = item.startTime ?? item.start;
  const endTime = item.endTime ?? item.end;
  if (!startTime || !endTime) return 0;
  return Math.max(0, toSeconds(endTime) - toSeconds(startTime));
}
