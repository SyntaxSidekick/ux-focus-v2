import { useCallback, useRef, type ChangeEvent } from "react";
import type { ScheduleItem } from "../schedule/model.ts";
import { normalizeLoadedSchedule } from "../schedule/schedule-repository.ts";
import { parseScheduleImport } from "./import-schedule.mjs";
import { exportScheduleFile } from "./export-schedule.ts";

interface ImportExportNotices {
  onSuccess(message: string): void;
  onError(message: string): void;
}

interface UseImportExportOptions extends ImportExportNotices {
  schedule: ScheduleItem[];
  replaceSchedule(schedule: ScheduleItem[]): void;
  getErrorDetail(error: unknown): string;
}

export function useImportExport({ schedule, replaceSchedule, onSuccess, onError, getErrorDetail }: UseImportExportOptions) {
  const importInput = useRef<HTMLInputElement>(null);

  const exportSchedule = useCallback(() => {
    try {
      exportScheduleFile(schedule);
    } catch (error) {
      onError(`Export failed: ${getErrorDetail(error)} Try exporting again before closing UXFocus.`);
    }
  }, [schedule, onError, getErrorDetail]);

  const openImportDialog = useCallback(() => {
    importInput.current?.click();
  }, []);

  const onImportChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    try {
      const imported = normalizeLoadedSchedule(parseScheduleImport(await file.text()));
      if (!imported) throw new Error("The schedule contains invalid tasks.");
      replaceSchedule(imported);
      onSuccess(`Imported and saved ${imported.length} tasks from ${file.name}.`);
    } catch (error) {
      onError(`Could not import ${file.name}: ${getErrorDetail(error)} Check the file and try again. Your current schedule has not been replaced.`);
    }
  }, [replaceSchedule, onSuccess, onError, getErrorDetail]);

  return {
    importInput,
    exportSchedule,
    openImportDialog,
    onImportChange,
  };
}
