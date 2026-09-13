import { savedStorage } from "../../lib/storage/storage-adapter.ts";
import { SETTINGS_KEY } from "../../lib/storage/storage-keys.ts";
import type { TimeFormat } from "../../lib/time/format.ts";
import { DEFAULT_SETTINGS } from "./defaults.ts";
import type { AppSettings } from "./model.ts";
import { isThemeId } from "./themes.ts";

function isTimeFormat(value: unknown): value is TimeFormat {
  return value === "24h" || value === "12h";
}

function normalizeSettings(value: unknown): AppSettings {
  const parsed = (value && typeof value === "object") ? value as Record<string, unknown> : {};
  return {
    timeFormat: isTimeFormat(parsed.timeFormat) ? parsed.timeFormat : DEFAULT_SETTINGS.timeFormat,
    themeId: isThemeId(parsed.themeId) ? parsed.themeId : DEFAULT_SETTINGS.themeId,
    autoStart: typeof parsed.autoStart === "boolean" ? parsed.autoStart : DEFAULT_SETTINGS.autoStart,
  };
}

export function createSettingsRepository(storage = savedStorage) {
  return {
    load(): AppSettings {
      try {
        const raw = storage.read(SETTINGS_KEY);
        if (!raw) return DEFAULT_SETTINGS;
        return normalizeSettings(JSON.parse(raw));
      } catch (error) {
        storage.markUnreadable(SETTINGS_KEY);
        throw error;
      }
    },
    save(settings: AppSettings) {
      storage.write(SETTINGS_KEY, JSON.stringify(settings));
    },
  };
}

export const settingsRepository = createSettingsRepository();
