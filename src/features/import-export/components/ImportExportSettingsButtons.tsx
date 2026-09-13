import { Download, Upload } from "lucide-react";

interface ImportExportSettingsButtonsProps {
  onExport(): void;
  onImport(): void;
}

export function ImportExportSettingsButtons({ onExport, onImport }: ImportExportSettingsButtonsProps) {
  return (
    <>
      <button
        onClick={onExport}
        className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card/35 px-2.5 py-2 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <Download size={12} /> Export
      </button>
      <button
        onClick={onImport}
        className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card/35 px-2.5 py-2 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <Upload size={12} /> Import
      </button>
    </>
  );
}
