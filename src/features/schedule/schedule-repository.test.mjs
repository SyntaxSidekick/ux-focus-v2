import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStorageAdapter } from '../../lib/storage/storage-adapter.ts';
import { STORAGE_KEY } from '../../lib/storage/storage-keys.ts';
import { createScheduleRepository } from './schedule-repository.ts';
import { DEFAULT_SCHEDULE } from './defaults.ts';
import { addScheduleTask, removeScheduleTask, toggleScheduleTaskComplete, toggleScheduleTaskReminder, recordScheduleTaskReminder, getCurrentBlock, getDayProgress, getCompletedCount } from './schedule-domain.ts';

function setup(value = null) {
  const writes = [];
  let failure;
  const backend = { getItem: () => value, setItem: (key, next) => { if (failure) throw failure; writes.push([key, next]); value = next; } };
  const storage = createStorageAdapter(() => ({ localStorage: backend }));
  return { repository: createScheduleRepository(storage), writes, backend, fail: error => { failure = error; } };
}

test('loads valid saved schedules without writing normalized data on startup', () => {
  const { repository, writes } = setup(JSON.stringify(DEFAULT_SCHEDULE));
  assert.deepEqual(repository.load().map(({ title, ...item }) => JSON.parse(JSON.stringify(item))), DEFAULT_SCHEDULE);
  assert.deepEqual(writes, []);
});

test('missing and empty-string saves use exact defaults; saved empty arrays stay empty', () => {
  for (const value of [null, '']) assert.equal(setup(value).repository.load(), DEFAULT_SCHEDULE);
  assert.deepEqual(setup('[]').repository.load(), []);
});

test('legacy aliases normalize without losing metadata, completion or reminder history', () => {
  const legacy = { id: 'legacy', title: 'Legacy', startTime: '09:00', endTime: '10:00', completed: true, reminderEnabled: false, reminderLastTriggeredDate: '2026-09-12', extra: 17 };
  const { repository } = setup(JSON.stringify([legacy]));
  const [loaded] = repository.load();
  for (const [key, value] of Object.entries(legacy)) assert.equal(loaded[key], value);
  assert.equal(loaded.start, '09:00');
  assert.equal(loaded.end, '10:00');
  assert.equal(loaded.label, 'Legacy');
});

test('malformed JSON and invalid schedules protect saves and replacements', () => {
  for (const value of ['{broken', '{}', '[{"label":"bad"}]']) {
    const { repository, writes } = setup(value);
    assert.throws(() => repository.load());
    assert.throws(() => repository.save(DEFAULT_SCHEDULE), /refusing to overwrite/);
    assert.throws(() => repository.saveReplacement([]), /Existing saved data could not be read/);
    assert.deepEqual(writes, []);
  }
});

test('read errors propagate and cannot trigger destructive default writes', () => {
  const { repository, backend, writes } = setup('[]');
  const error = Error('Unreadable disk');
  backend.getItem = () => { throw error; };
  assert.throws(() => repository.load(), actual => actual === error);
  assert.throws(() => repository.save(DEFAULT_SCHEDULE), /refusing to overwrite/);
  assert.deepEqual(writes, []);
});

test('add preserves field shapes and start-time sorting without mutating input', () => {
  const existing = [{ ...DEFAULT_SCHEDULE[0] }];
  const draft = { label: 'Earlier', start: '05:00', end: '05:30', sound: 'break' };
  const next = addScheduleTask(existing, draft, 'new');
  assert.equal(existing.length, 1);
  assert.deepEqual(next[0], { ...draft, id: 'new', title: 'Earlier', startTime: '05:00', endTime: '05:30' });
  assert.equal(next[1], existing[0]);
});

test('add, complete, uncomplete and delete persist using the compatible schedule key', () => {
  const { repository, writes } = setup('[]');
  let schedule = addScheduleTask(repository.load(), { label: 'Task', start: '09:00', end: '10:00', sound: 'deepwork' }, 'task');
  repository.save(schedule);
  assert.equal(getCurrentBlock(repository.load()).id, 'task');
  schedule = toggleScheduleTaskComplete(schedule, 'task'); repository.save(schedule);
  assert.equal(getCompletedCount(repository.load()), 1);
  assert.equal(getDayProgress(repository.load()), 1);
  assert.equal(getCurrentBlock(repository.load()), null);
  schedule = toggleScheduleTaskComplete(schedule, 'task'); repository.save(schedule);
  assert.equal(getDayProgress(repository.load()), 0);
  schedule = removeScheduleTask(schedule, 'task'); repository.save(schedule);
  assert.deepEqual(repository.load(), []);
  assert.equal(getCurrentBlock(schedule), null);
  assert.equal(getDayProgress(schedule), 0);
  assert.ok(writes.every(([key]) => key === STORAGE_KEY));
  assert.equal(writes.length, 4);
});

test('replacement saves exact supplied representation, including empty arrays, and propagates failure', () => {
  const { repository, writes, fail } = setup('[]');
  repository.saveReplacement(DEFAULT_SCHEDULE);
  assert.equal(writes[0][1], JSON.stringify(DEFAULT_SCHEDULE));
  repository.saveReplacement([]);
  assert.deepEqual(repository.load(), []);
  const error = Error('Disk full'); fail(error);
  assert.throws(() => repository.saveReplacement(DEFAULT_SCHEDULE), actual => actual === error);
  assert.deepEqual(repository.load(), []);
});

test('reminder data operations retain existing enable/reset and date-field semantics', () => {
  const item = { ...DEFAULT_SCHEDULE[0], reminderLastTriggeredDate: 'old', startReminderLastTriggeredDate: 'old' };
  const disabled = toggleScheduleTaskReminder([item], item.id);
  assert.equal(disabled[0].reminderEnabled, false);
  assert.equal(disabled[0].reminderLastTriggeredDate, undefined);
  assert.equal(disabled[0].startReminderLastTriggeredDate, undefined);
  const enabled = toggleScheduleTaskReminder(disabled, item.id);
  assert.equal(enabled[0].reminderEnabled, true);
  const upcoming = recordScheduleTaskReminder(enabled, item.id, false, 'today');
  const started = recordScheduleTaskReminder(upcoming, item.id, true, 'today');
  assert.equal(started[0].reminderLastTriggeredDate, 'today');
  assert.equal(started[0].startReminderLastTriggeredDate, 'today');
  assert.equal(item.reminderLastTriggeredDate, 'old');
});
