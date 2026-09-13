import type { ScheduleItem } from "./model.ts";

export const DEFAULT_SCHEDULE: ScheduleItem[] = [
  { id: "1",  label: "Morning Review",                      start: "06:30", end: "07:00", startTime: "06:30", endTime: "07:00", sound: "default"  },
  { id: "2",  label: "Deep Work 1",                         start: "07:00", end: "08:30", startTime: "07:00", endTime: "08:30", sound: "deepwork" },
  { id: "3",  label: "Break",                               start: "08:30", end: "08:50", startTime: "08:30", endTime: "08:50", sound: "break"    },
  { id: "4",  label: "Audit Tokens & Components",           start: "08:50", end: "09:30", startTime: "08:50", endTime: "09:30", sound: "deepwork" },
  { id: "5",  label: "Build Design Token Foundation",       start: "09:30", end: "10:30", startTime: "09:30", endTime: "10:30", sound: "deepwork" },
  { id: "6",  label: "Break",                               start: "10:30", end: "10:50", startTime: "10:30", endTime: "10:50", sound: "break"    },
  { id: "7",  label: "Build Shared Component Library",      start: "10:50", end: "11:50", startTime: "10:50", endTime: "11:50", sound: "deepwork" },
  { id: "8",  label: "Implement Light & Dark Theme Toggle", start: "11:50", end: "12:30", startTime: "11:50", endTime: "12:30", sound: "deepwork" },
  { id: "9",  label: "Lunch Break",                         start: "12:30", end: "13:30", startTime: "12:30", endTime: "13:30", sound: "break"    },
  { id: "10", label: "Deep Work 2",                         start: "13:30", end: "15:00", startTime: "13:30", endTime: "15:00", sound: "deepwork" },
  { id: "11", label: "Break",                               start: "15:00", end: "15:20", startTime: "15:00", endTime: "15:20", sound: "break"    },
  { id: "12", label: "Review & Ship",                       start: "15:20", end: "16:30", startTime: "15:20", endTime: "16:30", sound: "default"  },
];

