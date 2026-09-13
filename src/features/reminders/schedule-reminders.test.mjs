import test from "node:test";
import assert from "node:assert/strict";
import { getDueScheduleReminder } from "./schedule-reminders.ts";

const at = (hour, minute) => new Date(2026, 8, 12, hour, minute, 0);
const baseItem = {
  id: "a",
  label: "Task",
  start: "09:00",
  sound: "deepwork",
  completed: false,
  reminderEnabled: true,
};

test("disabled or completed tasks do not trigger reminders", () => {
  assert.equal(getDueScheduleReminder([{ ...baseItem, reminderEnabled: false }], at(8, 55)), null);
  assert.equal(getDueScheduleReminder([{ ...baseItem, completed: true }], at(8, 55)), null);
});

test("five-minute and exact-start reminders are detected", () => {
  const warning = getDueScheduleReminder([baseItem], at(8, 55));
  assert.equal(warning?.kind, "task-warning");
  assert.equal(warning?.atStart, false);
  const start = getDueScheduleReminder([baseItem], at(9, 0));
  assert.equal(start?.kind, "task-start");
  assert.equal(start?.atStart, true);
});

test("four minutes before still warns; after start does not trigger", () => {
  assert.equal(getDueScheduleReminder([baseItem], at(8, 56))?.kind, "task-warning");
  assert.equal(getDueScheduleReminder([baseItem], at(9, 1)), null);
});

test("duplicate prevention fields are respected per day", () => {
  assert.equal(getDueScheduleReminder([{ ...baseItem, reminderLastTriggeredDate: "2026-09-12" }], at(8, 55)), null);
  assert.equal(getDueScheduleReminder([{ ...baseItem, startReminderLastTriggeredDate: "2026-09-12" }], at(9, 0)), null);
  assert.equal(getDueScheduleReminder([{ ...baseItem, reminderLastTriggeredDate: "2026-09-11", startReminderLastTriggeredDate: "2026-09-11" }], at(8, 55))?.kind, "task-warning");
});

test("date rollover allows reminders to trigger again", () => {
  const item = { ...baseItem, reminderLastTriggeredDate: "2026-09-12", startReminderLastTriggeredDate: "2026-09-12" };
  assert.equal(getDueScheduleReminder([item], new Date(2026, 8, 13, 8, 55, 0))?.kind, "task-warning");
  assert.equal(getDueScheduleReminder([item], new Date(2026, 8, 13, 9, 0, 0))?.kind, "task-start");
});

test("schedule order semantics are preserved when selecting due task", () => {
  const first = { ...baseItem, id: "first", label: "First", start: "09:00" };
  const second = { ...baseItem, id: "second", label: "Second", start: "09:00" };
  assert.equal(getDueScheduleReminder([first, second], at(8, 55))?.task.id, "first");
  assert.equal(getDueScheduleReminder([second, first], at(8, 55))?.task.id, "second");
});
