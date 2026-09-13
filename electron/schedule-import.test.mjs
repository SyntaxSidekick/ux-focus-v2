import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseScheduleImport } from '../src/features/import-export/import-schedule.mjs';
const task = { id: 'one', label: 'Focus', start: '09:00', end: '10:00', completed: true, reminderEnabled: false };
test('reads exported schedules and raw arrays without losing task data', () => {
  for (const data of [{ schedule: [task] }, [task]]) {
    const [result] = parseScheduleImport(JSON.stringify(data));
    assert.equal(result.label, task.label);
    assert.equal(result.completed, true);
    assert.equal(result.reminderEnabled, false);
  }
});
test('accepts BOM, legacy field names, and single digit hours', () => {
  const [result] = parseScheduleImport('\uFEFF' + JSON.stringify([{ title: 'Legacy', startTime: '9:00', endTime: '10:00' }]));
  assert.equal(result.start, '09:00');
  assert.equal(result.label, 'Legacy');
});
test('keeps empty schedules and assigns distinct IDs', () => {
  assert.deepEqual(parseScheduleImport('[]'), []);
  const result = parseScheduleImport(JSON.stringify([task, task]));
  assert.notEqual(result[0].id, result[1].id);
});
test('rejects malformed files with actionable errors', () => {
  assert.throws(() => parseScheduleImport('{'), /not valid JSON/);
  assert.throws(() => parseScheduleImport('{}'), /schedule/);
  assert.throws(() => parseScheduleImport(JSON.stringify([task, { ...task, start: '25:00' } ])), /Task 2.*start and end/);
});

test('converts AM/PM correctly including noon, midnight, and lowercase', () => {
  for (const [input, expected] of [['5:30 AM', '05:30'], ['12:30 PM', '12:30'], ['3:15 PM', '15:15'], ['12:00 AM', '00:00'], [' 07:15 pm ', '19:15']]) {
    const [result] = parseScheduleImport(JSON.stringify([{ ...task, start: input, end: input }]));
    assert.equal(result.start, expected);
    assert.equal(result.startTime, expected);
    assert.equal(result.end, expected);
    assert.equal(result.endTime, expected);
  }
  for (const input of ['0:30 AM', '13:00 PM', '9:60 AM']) {
    assert.throws(() => parseScheduleImport(JSON.stringify([{ ...task, start: input }])), /start and end/);
  }
});
