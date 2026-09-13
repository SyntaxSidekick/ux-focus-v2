import { useCallback, useMemo, useState } from "react";
import type { TimeFormat } from "../../lib/time/format.ts";
import { DEFAULT_SETTINGS } from "./defaults.ts";
import type { AppSettings, ThemeId } from "./model.ts";
import { getThemePalette } from "./themes.ts";
import { settingsRepository } from "./settings-repository.ts";

interface SettingsNotices {
  onLoadError(error: unknown): void;
  onSaveError(error: unknown): void;
}

export function useSettings({ onLoadError, onSaveError }: SettingsNotices) {
  const [settings, setSettingsState] = useState<AppSettings>(() => {
    try { return settingsRepository.load(); }
    catch (error) { onLoadError(error); return DEFAULT_SETTINGS; }
  });

  const update = useCallback((mutation: (previous: AppSettings) => AppSettings) => {
    setSettingsState(previous => {
      const next = mutation(previous);
      try { settingsRepository.save(next); }
      catch (error) { onSaveError(error); }
      return next;
    });
  }, [onSaveError]);

  const setTimeFormat = useCallback((timeFormat: TimeFormat) => {
    update(previous => ({ ...previous, timeFormat }));
  }, [update]);

  const setThemeId = useCallback((themeId: ThemeId) => {
    update(previous => ({ ...previous, themeId }));
  }, [update]);

  const toggleAutoStart = useCallback(() => {
    update(previous => ({ ...previous, autoStart: !previous.autoStart }));
  }, [update]);

  const resetSettings = useCallback(() => {
    update(() => DEFAULT_SETTINGS);
  }, [update]);

  const activeTheme = useMemo(() => getThemePalette(settings.themeId), [settings.themeId]);

  return {
    settings,
    activeTheme,
    setTimeFormat,
    setThemeId,
    toggleAutoStart,
    resetSettings,
  };
}
