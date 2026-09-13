import { useState } from "react";
import type { NewTask, ScheduleItem } from "../model.ts";

export function AddTaskForm({ visible, onAdd }: { visible: boolean; onAdd(draft: NewTask): boolean }) {
  const [newTask, setNewTask] = useState<NewTask>({ label: "", start: "", end: "", sound: "deepwork" });
  const addTask = () => {
    if (!onAdd(newTask)) return;
    setNewTask({ label: "", start: "", end: "", sound: "deepwork" });
  };
  return visible ? (
          <div className="px-4 pb-3 space-y-2">
            <input
              placeholder="Task name"
              value={newTask.label}
              onChange={e => setNewTask(t => ({ ...t, label: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && addTask()}
              className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-secondary/60 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 transition-colors"
            />
            <div className="flex gap-2">
              <input type="time" value={newTask.start}
                onChange={e => setNewTask(t => ({ ...t, start: e.target.value }))}
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-border bg-secondary/60 text-foreground focus:outline-none focus:border-primary/60 transition-colors"
              />
              <input type="time" value={newTask.end}
                onChange={e => setNewTask(t => ({ ...t, end: e.target.value }))}
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-border bg-secondary/60 text-foreground focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>
            <select value={newTask.sound}
              onChange={e => setNewTask(t => ({ ...t, sound: e.target.value as ScheduleItem["sound"] }))}
              className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-secondary/60 text-foreground focus:outline-none focus:border-primary/60 transition-colors"
            >
              <option value="deepwork">Deep Work</option>
              <option value="break">Break</option>
              <option value="default">Other</option>
            </select>
            <button onClick={addTask}
              className="w-full py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              Add to Schedule
            </button>
          </div>
  ) : null;
}
