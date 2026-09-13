import { X } from "lucide-react";
import type { AppNotice } from "../../app/hooks/useAppNotices.ts";

interface AppNoticeListProps {
  notices: AppNotice[];
  onDismiss(notice: AppNotice): void;
}

export function AppNoticeList({ notices, onDismiss }: AppNoticeListProps) {
  return (
    <div className="sticky top-0 z-20 max-h-[40vh] overflow-y-auto bg-card">
      {notices.map(notice => (
        <div key={notice.message} role={notice.error ? "alert" : "status"} className={`mx-3 my-2 rounded-lg border p-3 text-xs ${notice.error ? "border-red-400/50 bg-red-500/10" : "border-emerald-400/50 bg-emerald-500/10"}`}>
          <div className="flex items-center justify-between gap-2">
            <strong>{notice.error ? "Something went wrong" : "Success"}</strong>
            <button aria-label="Dismiss message" onClick={() => onDismiss(notice)}><X size={14} /></button>
          </div>
          <p className="mt-1 break-words">{notice.message}</p>
        </div>
      ))}
    </div>
  );
}
