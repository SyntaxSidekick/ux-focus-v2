import type { TimeFormat } from "../../../lib/time/format.ts";
import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import type { AppSettings } from "../model.ts";
import { THEME_PALETTES } from "../themes.ts";

interface SettingsPanelProps {
  visible: boolean;
  settings: AppSettings;
  onToggleAutoStart(): void;
  onSetTimeFormat(format: TimeFormat): void;
  onSetTheme(themeId: AppSettings["themeId"]): void;
  onToggleAddEvent(): void;
  onResetSchedule(): void;
  scheduleExtraActions?: ReactNode;
  onClose(): void;
}

export function SettingsPanel({ visible, settings, onToggleAutoStart, onSetTimeFormat, onSetTheme, onToggleAddEvent, onResetSchedule, scheduleExtraActions, onClose }: SettingsPanelProps) {
  if (!visible) return null;

  return (
    <div className="mx-4 mb-3 rounded-xl border border-border bg-secondary/40 px-3 py-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Auto-start Pomodoro on Focus</span>
        <button
          onClick={onToggleAutoStart}
          className={`relative w-9 h-5 rounded-full transition-colors duration-300 ${settings.autoStart ? "bg-primary" : "bg-muted-foreground/30"}`}
        >
          <span className={`absolute top-[3px] left-[3px] w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-300 ${settings.autoStart ? "translate-x-4" : "translate-x-0"}`} />
        </button>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">Time format</span>
        <div className="grid grid-cols-2 rounded-lg border border-border bg-card/40 p-0.5">
          {(["24h", "12h"] as TimeFormat[]).map(format => (
            <button
              key={format}
              onClick={() => onSetTimeFormat(format)}
              className={`px-2.5 py-1 text-[10px] rounded-md transition-colors ${
                settings.timeFormat === format
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {format === "24h" ? "Military" : "Standard"}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <span className="text-xs text-muted-foreground">Theme</span>
        <div className="grid grid-cols-2 gap-2">
          {THEME_PALETTES.map(theme => (
            <button
              key={theme.id}
              onClick={() => onSetTheme(theme.id)}
              className={`flex items-center justify-between rounded-lg border px-2.5 py-2 text-[10px] transition-colors ${
                settings.themeId === theme.id
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card/35 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{theme.name}</span>
              <span className="flex -space-x-1">
                {theme.swatches.map(color => (
                  <span
                    key={color}
                    className="h-3.5 w-3.5 rounded-full border border-card"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="h-px bg-border/60" />
      <div className="space-y-2">
        <span className="text-xs text-muted-foreground">Schedule</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onToggleAddEvent}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 py-2 text-[10px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus size={12} /> Add Event
          </button>
          <button
            onClick={onResetSchedule}
            className="rounded-lg border border-border bg-card/35 px-2.5 py-2 text-[10px] text-muted-foreground transition-colors hover:text-destructive"
          >
            Reset Schedule
          </button>
          {scheduleExtraActions}
        </div>
      </div>
      <div className="h-px bg-border/60" />
      <button
        onClick={onClose}
        className="w-full text-center text-[10px] text-muted-foreground hover:text-foreground transition-colors"
      >
        Close Settings
      </button>
    </div>
  );
}
