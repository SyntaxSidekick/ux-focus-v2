import type { TimeFormat } from "../../lib/time/format.ts";

export type ThemeId = "midnight" | "slate" | "forest" | "daylight";

export interface AppSettings {
  timeFormat: TimeFormat;
  themeId: ThemeId;
  autoStart: boolean;
}

export interface ThemePalette {
  id: ThemeId;
  name: string;
  swatches: string[];
  vars: Record<string, string>;
}
