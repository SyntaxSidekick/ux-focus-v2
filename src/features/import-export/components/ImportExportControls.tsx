import { Download, Upload } from "lucide-react";

interface ImportExportControlsProps {
  onExport(): void;
  onImport(): void;
}

export function ImportExportControls({ onExport, onImport }: ImportExportControlsProps) {
  return (
    <div className="px-4 pt-1 pb-4 flex gap-2 border-t border-border mt-1">
      <button onClick={onExport}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground bg-secondary/40 hover:bg-secondary transition-colors mt-2"
      >
        <Download size={12} /> Export
      </button>
      <button onClick={onImport}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground bg-secondary/40 hover:bg-secondary transition-colors mt-2"
      >
        <Upload size={12} /> Import
      </button>
    </div>
  );
}
