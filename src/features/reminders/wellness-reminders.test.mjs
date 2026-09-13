import test from "node:test";
import assert from "node:assert/strict";
import { advanceReminders, getReminderContent } from "./wellness-reminders.mjs";

test("wellness thresholds at 29/30/59/60 minutes", () => {
  assert.deepEqual(advanceReminders(0, 29 * 60 * 1000, 7200).due, []);
  assert.deepEqual(advanceReminders(29 * 60 * 1000, 60 * 1000, 7200).due, ["posture"]);
  assert.deepEqual(advanceReminders(30 * 60 * 1000, 29 * 60 * 1000, 7200).due, []);
  assert.deepEqual(advanceReminders(59 * 60 * 1000, 60 * 1000, 7200).due, ["stretch", "posture"]);
});

test("90 and 120 minute cadence is preserved", () => {
  assert.deepEqual(advanceReminders(89 * 60 * 1000, 60 * 1000, 7200).due, ["posture"]);
  assert.deepEqual(advanceReminders(119 * 60 * 1000, 60 * 1000, 7200).due, ["stretch", "posture"]);
});

test("delayed and large ticks preserve combined precedence semantics", () => {
  assert.equal(getReminderContent(advanceReminders(0, 61 * 60 * 1000, 7200).due, {}).kind, "movement");
  assert.equal(getReminderContent(advanceReminders(0, 121 * 60 * 1000, 7200).due, {}).kind, "movement");
});

test("pause/resume/reset/completion behavior is unchanged", () => {
  assert.deepEqual(advanceReminders(25 * 60 * 1000, 0, 3600), { elapsedMs: 25 * 60 * 1000, due: [] });
  assert.deepEqual(advanceReminders(25 * 60 * 1000, 5 * 60 * 1000, 3600).due, ["posture"]);
  assert.deepEqual(advanceReminders(25 * 60 * 1000, 5 * 60 * 1000, 0).due, []);
  assert.deepEqual(advanceReminders(0, 1, 3600).due, []);
});

test("rotation sequence and wrap are preserved", () => {
  const rotations = {};
  const posture = Array.from({ length: 4 }, () => getReminderContent(["posture"], rotations).title);
  assert.equal(new Set(posture.slice(0, 3)).size, 3);
  assert.equal(posture[0], posture[3]);
  const combined = Array.from({ length: 4 }, () => getReminderContent(["posture", "stretch"], rotations).title);
  assert.equal(new Set(combined.slice(0, 3)).size, 3);
  assert.equal(combined[0], combined[3]);
});
