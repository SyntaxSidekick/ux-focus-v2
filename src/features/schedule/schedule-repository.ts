import { savedStorage } from "../../lib/storage/storage-adapter.ts";
import { STORAGE_KEY } from "../../lib/storage/storage-keys.ts";
import { DEFAULT_SCHEDULE } from "./defaults.ts";
import type { ScheduleItem } from "./model.ts";
import { normalizeSchedule } from "./schedule-domain.ts";

export function normalizeLoadedSchedule(value: unknown): ScheduleItem[] | null {
  const source = Array.isArray(value)
    ? value
    : (value && typeof value === "object" && Array.isArray((value as { schedule?: unknown }).schedule)
      ? (value as { schedule: unknown[] }).schedule
      : null);
  const fallbackIds = Array.isArray(source) ? source.map((_, index) => `${Date.now()}-${index}`) : [];
  return normalizeSchedule(source, fallbackIds);
}

export function createScheduleRepository(storage = savedStorage) {
  return {
    load(): ScheduleItem[] {
      try {
        const raw = storage.read(STORAGE_KEY);
        if (raw) {
          const parsed = normalizeLoadedSchedule(JSON.parse(raw));
          if (parsed) return parsed;
          throw new Error("Saved schedule has an invalid format");
        }
        return DEFAULT_SCHEDULE;
      } catch (error) {
        storage.markUnreadable(STORAGE_KEY);
        throw error;
      }
    },
    save(schedule: ScheduleItem[]) {
      storage.write(STORAGE_KEY, JSON.stringify(schedule));
    },
    saveReplacement(schedule: ScheduleItem[]) {
      storage.assertWritable(STORAGE_KEY, "Existing saved data could not be read. Export your schedule before repairing the saved file.");
      storage.write(STORAGE_KEY, JSON.stringify(schedule));
    },
  };
}

export const scheduleRepository = createScheduleRepository();
