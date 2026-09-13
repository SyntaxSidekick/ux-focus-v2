import { Settings, X } from "lucide-react";
import type { CSSProperties } from "react";

interface TitleBarProps {
  showSettings: boolean;
  onToggleSettings(): void;
  onMinimize(): void;
  onToggleWindowSize(): void;
  onClose(): void;
}

export function TitleBar({ showSettings, onToggleSettings, onMinimize, onToggleWindowSize, onClose }: TitleBarProps) {
  return (
    <div
      style={{ WebkitAppRegion: "drag" } as CSSProperties}
      className="flex cursor-grab items-center justify-between px-4 pt-3.5 pb-2.5 active:cursor-grabbing"
    >
      <span className="text-[15px] font-bold tracking-[0.18em] uppercase">
        <span className="text-primary">ux</span>
        <span className="text-foreground">Focus</span>
      </span>

      <div className="flex items-center gap-2" style={{ WebkitAppRegion: "no-drag" } as CSSProperties}>
        <button
          onClick={onToggleSettings}
          className={`p-1.5 rounded-lg transition-colors ${showSettings ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
          title="Settings"
        >
          <Settings size={13} />
        </button>

        <div className="w-px h-3.5 bg-border mx-0.5" />

        <div className="flex items-center gap-1.5">
          <button onClick={onMinimize} title="Minimize"
            className="group w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-300 flex items-center justify-center transition-colors">
            <span className="w-1.5 h-px bg-yellow-900/60 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button onClick={onToggleWindowSize} title="Maximize / restore height" aria-label="Maximize / restore height"
            className="w-3 h-3 rounded-full bg-green-400 hover:bg-green-300 flex items-center justify-center transition-colors" />
          <button onClick={onClose} title="Close"
            className="group w-3 h-3 rounded-full bg-red-400 hover:bg-red-300 flex items-center justify-center transition-colors">
            <X size={6} className="text-red-900/60 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    </div>
  );
}
