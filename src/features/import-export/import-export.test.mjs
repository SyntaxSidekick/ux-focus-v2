import test from "node:test";
import assert from "node:assert/strict";
import { parseScheduleImport } from "./import-schedule.mjs";
import { normalizeSchedule } from "../schedule/schedule-domain.ts";
import { buildScheduleExportPayload } from "./export-schedule.ts";

test("import accepts details and keeps legacy tasks without details", () => {
  const parsed = parseScheduleImport(JSON.stringify({
    schedule: [
      { title: "Portfolio Development", start: "09:00", end: "10:00", details: "  Finish responsive pass.  " },
      { title: "Lunch", start: "12:00", end: "12:30" },
    ],
  }));
  const normalized = normalizeSchedule(parsed, ["a", "b"]);
  assert.equal(normalized[0].details, "Finish responsive pass.");
  assert.equal(normalized[1].details, undefined);
});

test("export includes details when present and omits empty details", () => {
  const payload = buildScheduleExportPayload([
    { id: "1", label: "Portfolio Development", title: "Portfolio Development", start: "09:00", end: "10:00", startTime: "09:00", endTime: "10:00", details: "Finish responsive pass.", sound: "deepwork" },
    { id: "2", label: "Lunch", title: "Lunch", start: "12:00", end: "12:30", startTime: "12:00", endTime: "12:30", details: undefined, sound: "break" },
  ]);
  const exported = JSON.parse(JSON.stringify(payload));
  assert.equal(exported.schedule[0].details, "Finish responsive pass.");
  assert.equal(Object.hasOwn(exported.schedule[1], "details"), false);
});
