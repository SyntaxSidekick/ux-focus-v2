import type { ScheduleItem } from "../schedule/model.ts";

export const buildScheduleExportPayload = (schedule: ScheduleItem[]) => ({ schedule });

export function exportScheduleFile(schedule: ScheduleItem[]) {
  const blob = new Blob([JSON.stringify(buildScheduleExportPayload(schedule), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  Object.assign(document.createElement("a"), { href: url, download: "uxfocus-schedule.json" }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
