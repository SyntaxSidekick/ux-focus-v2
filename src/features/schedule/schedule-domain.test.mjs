import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSchedule, addScheduleTask, getCurrentBlock, getDayProgress, getCompletedCount, getSessionDurationSecs } from './schedule-domain.ts';
import { DEFAULT_SCHEDULE } from './defaults.ts';
import { parseScheduleImport } from '../import-export/import-schedule.mjs';

test('normalizes legacy fields, preserves metadata and does not mutate input', () => {
  const raw = Object.freeze({ title: 'Legacy', startTime: '09:00', endTime: '10:00', custom: 42 });
  const result = normalizeSchedule([raw], ['123-0']);
  assert.deepEqual(result, [{ ...raw, id: '123-0', label: 'Legacy', start: '09:00', end: '10:00', sound: 'default', completed: undefined, reminderEnabled: undefined, startReminderLastTriggeredDate: undefined, reminderLastTriggeredDate: undefined }]);
  assert.deepEqual(normalizeSchedule([raw], ['123-0']), result);
});

test('preserves conflicting aliases, IDs, completion and reminder history', () => {
  const raw = { id: 'a', label: 'Task', title: 'Old title', start: '09:00', end: '10:00', startTime: '11:00', endTime: '12:00', sound: 'break', completed: true, reminderEnabled: false, startReminderLastTriggeredDate: '2026-09-12', reminderLastTriggeredDate: '2026-09-11' };
  assert.deepEqual(normalizeSchedule([raw], ['unused']), [raw]);
});

test('retains existing validation limits and all-or-nothing acceptance', () => {
  const valid = { label: 'Task', start: '09:00', end: '10:00' };
  for (const invalid of [null, {}, { ...valid, label: '' }, { ...valid, start: '9:00' }, { ...valid, end: '24:00' }, { ...valid, start: '', startTime: '09:00' }]) {
    assert.equal(normalizeSchedule([valid, invalid], ['a', 'b']), null);
  }
  assert.equal(normalizeSchedule({ schedule: [] }, []), null);
  assert.deepEqual(normalizeSchedule([], []), []);
  assert.ok(normalizeSchedule([{ ...valid, end: '08:00' }], ['a']));
  assert.ok(normalizeSchedule([{ ...valid, label: ' ' }], ['a']));
});

test('details stay optional, normalize when present, and empty values are omitted', () => {
  const withDetails = normalizeSchedule([{ label: 'Task', start: '09:00', end: '10:00', details: '  Finish docs  ' }], ['a']);
  const withoutDetails = normalizeSchedule([{ label: 'Task', start: '09:00', end: '10:00' }], ['b']);
  const emptyDetails = normalizeSchedule([{ label: 'Task', start: '09:00', end: '10:00', details: '   ' }], ['c']);
  assert.equal(withDetails[0].details, 'Finish docs');
  assert.equal(withoutDetails[0].details, undefined);
  assert.equal(emptyDetails[0].details, undefined);
});

test('adding tasks trims details and keeps no-details tasks compatible', () => {
  const withDetails = addScheduleTask([], { label: 'With details', start: '09:00', end: '10:00', details: '  Keep this  ', sound: 'deepwork' }, 'with-details');
  const withoutDetails = addScheduleTask([], { label: 'No details', start: '09:00', end: '10:00', details: '   ', sound: 'deepwork' }, 'without-details');
  assert.equal(withDetails[0].details, 'Keep this');
  assert.equal(withoutDetails[0].details, undefined);
});

test('import parsing feeds domain normalization and export round trips', () => {
  const parsed = parseScheduleImport('\uFEFF' + JSON.stringify({ schedule: [{ title: ' Task ', startTime: '9:00 AM', endTime: '10:00 AM', details: '  Ship layout polish  ', sound: 'unknown' }] }));
  const normalized = normalizeSchedule(parsed, ['unused']);
  assert.equal(normalized[0].label, 'Task');
  assert.equal(normalized[0].start, '09:00');
  assert.equal(normalized[0].startTime, '09:00');
  assert.equal(normalized[0].details, 'Ship layout polish');
  assert.equal(normalized[0].sound, 'default');
  assert.deepEqual(normalizeSchedule(parseScheduleImport(JSON.stringify(normalized)), []), normalized);
  assert.equal(DEFAULT_SCHEDULE.length, 12);
  assert.deepEqual(normalizeSchedule(DEFAULT_SCHEDULE, []).map(({ title, ...item }) => JSON.parse(JSON.stringify(item))), DEFAULT_SCHEDULE);
});

test('current block follows array order and completion, with empty and completed schedules', () => {
  const schedule = [{ ...DEFAULT_SCHEDULE[0], completed: true }, DEFAULT_SCHEDULE[2], DEFAULT_SCHEDULE[1]];
  assert.equal(getCurrentBlock(schedule), schedule[1]);
  assert.equal(getCompletedCount(schedule), 1);
  assert.equal(getDayProgress(schedule), 1 / 3);
  assert.equal(getCurrentBlock([]), null);
  assert.equal(getDayProgress([]), 0);
  const completed = schedule.map(item => ({ ...item, completed: true }));
  assert.equal(getCurrentBlock(completed), null);
  assert.equal(getDayProgress(completed), 1);
});

test('duration preserves alias precedence, legacy fallback and zero clamping', () => {
  assert.equal(getSessionDurationSecs(null), 0);
  assert.equal(getSessionDurationSecs({ start: '09:00', end: '10:00' }), 3600);
  assert.equal(getSessionDurationSecs({ start: '09:00', end: '10:00', startTime: '11:00', endTime: '11:30' }), 1800);
  assert.equal(getSessionDurationSecs({ start: '23:00', end: '01:00' }), 0);
  assert.equal(getSessionDurationSecs({ start: '09:00', end: '09:00' }), 0);
});
