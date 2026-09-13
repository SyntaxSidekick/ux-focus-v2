import assert from "node:assert/strict";
import test from "node:test";
import { getRemainingSessionSecs, getSessionDurationSecs } from "./timer-domain.ts";

const at = (hour, minute, second = 0) => new Date(2026, 8, 11, hour, minute, second);
const routine = { startTime: "05:30", endTime: "06:45" };

test("session timing preserves early, exact and late start semantics", () => {
  assert.equal(getRemainingSessionSecs(routine, at(5, 0)), 105 * 60);
  assert.equal(getRemainingSessionSecs(routine, at(5, 30)), 75 * 60);
  assert.equal(getRemainingSessionSecs(routine, at(6, 0)), 45 * 60);
});

test("scheduled end and after-end return zero", () => {
  assert.equal(getRemainingSessionSecs(routine, at(6, 45)), 0);
  assert.equal(getRemainingSessionSecs(routine, at(7, 0)), 0);
  assert.equal(getRemainingSessionSecs(null, at(6, 0)), 0);
});

test("remaining seconds preserve wall-clock precision across minute boundaries", () => {
  assert.equal(getRemainingSessionSecs(routine, at(6, 0, 15)), 44 * 60 + 45);
  assert.equal(getRemainingSessionSecs(routine, at(6, 44, 59)), 1);
  assert.equal(getRemainingSessionSecs(routine, at(6, 45, 1)), 0);
});

test("domain supports canonical and alias-less time fields", () => {
  assert.equal(getRemainingSessionSecs({ start: "07:00", end: "08:00" }, at(6, 50)), 70 * 60);
  assert.equal(getRemainingSessionSecs({ start: "07:00", end: "08:00" }, at(7, 10)), 50 * 60);
});

test("duration calculation preserves alias precedence and zero clamp", () => {
  assert.equal(getSessionDurationSecs(null), 0);
  assert.equal(getSessionDurationSecs({ start: "09:00", end: "10:00" }), 3600);
  assert.equal(getSessionDurationSecs({ start: "09:00", end: "10:00", startTime: "11:00", endTime: "11:30" }), 1800);
  assert.equal(getSessionDurationSecs({ start: "23:00", end: "01:00" }), 0);
});
