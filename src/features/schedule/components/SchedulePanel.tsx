import { forwardRef, useImperativeHandle, useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import type { NewTask, ScheduleItem } from "../model.ts";
import { AddTaskForm } from "./AddTaskForm.tsx";
import { ScheduleList } from "./ScheduleList.tsx";
import type { ScheduleRowActions } from "./ScheduleRow.tsx";

export interface SchedulePanelHandle {
  openAddForm(): void;
  closeAddForm(): void;
  toggleAddForm(): void;
}

interface SchedulePanelProps extends ScheduleRowActions {
  schedule: ScheduleItem[];
  currentBlock: ScheduleItem | null;
  onScheduleInteraction?(): void;
  onAdd(draft: NewTask): boolean;
  children?: ReactNode;
}

export const SchedulePanel = forwardRef<SchedulePanelHandle, SchedulePanelProps>(function SchedulePanel({ schedule, currentBlock, onScheduleInteraction, onAdd, children, ...actions }: SchedulePanelProps, ref) {
  const [showAddForm, setShowAddForm] = useState(false);

  useImperativeHandle(ref, () => ({
    openAddForm() { setShowAddForm(true); },
    closeAddForm() { setShowAddForm(false); },
    toggleAddForm() { setShowAddForm(value => !value); },
  }), []);

  const toggleAddForm = () => {
    setShowAddForm(value => !value);
    onScheduleInteraction?.();
  };

  const addTask = (draft: NewTask) => {
    const added = onAdd(draft);
    if (!added) return false;
    setShowAddForm(false);
    onScheduleInteraction?.();
    return true;
  };

  return (<>
        <div className="px-4 pt-3 pb-1.5 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Schedule</span>
          <button
            onClick={toggleAddForm}
            className={`p-1 rounded-lg transition-colors ${showAddForm ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
          >
            <Plus size={13} />
          </button>
        </div>
        {children}
        <p className="px-4 pb-2 text-[10px] text-muted-foreground">Bell: 5 minutes before + at start. Task-specific chimes.</p>
        <AddTaskForm visible={showAddForm} onAdd={addTask} />
        <ScheduleList schedule={schedule} currentBlock={currentBlock} {...actions} />
  </>);
});
