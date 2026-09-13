import type { ReminderNoticeModel } from "../model.ts";

interface ReminderNoticeProps {
  notice: ReminderNoticeModel | null;
  onDismiss(): void;
}

export function ReminderNotice({ notice, onDismiss }: ReminderNoticeProps) {
  if (!notice) return null;
  return (
    <div role="status" className="mx-4 my-2 rounded-lg border border-current bg-card p-3 text-xs text-card-foreground">
      <p className="font-semibold">{notice.icon} {notice.title}</p>
      <p className="mt-1 leading-relaxed">{notice.message}</p>
      <button className="mt-3 rounded-md border border-current px-3 py-1.5 font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current" onClick={onDismiss}>Dismiss</button>
    </div>
  );
}
