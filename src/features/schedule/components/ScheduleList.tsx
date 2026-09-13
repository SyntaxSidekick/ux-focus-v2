import type { ScheduleItem } from "../model.ts";
import { ScheduleRow, type ScheduleRowActions } from "./ScheduleRow.tsx";

export function ScheduleList({ schedule, currentBlock, ...actions }: ScheduleRowActions & { schedule: ScheduleItem[]; currentBlock: ScheduleItem | null }) {
  return (
    <div className="min-h-[120px] flex-1 pb-2 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      {schedule.map((item, index) => <ScheduleRow key={item.id} item={item} index={index} isActive={item.id === currentBlock?.id} {...actions} />)}
    </div>
  );
}
