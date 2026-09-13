import { test } from 'node:test';
import assert from 'node:assert/strict';
import { timeToMinutes, isValidTime } from './schedule-time.ts';
import { formatTimer, formatClock, localDateKey } from './format.ts';

test('schedule times retain strict HH:mm validation and minute conversion', () => {
  for (const time of ['00:00', '09:00', '23:59']) assert.equal(isValidTime(time), true);
  for (const time of ['9:00', '24:00', '12:60', ' 09:00', '9:00 AM', '']) assert.equal(isValidTime(time), false);
  assert.equal(timeToMinutes('00:00'), 0);
  assert.equal(timeToMinutes('23:59'), 1439);
});

test('timer formatting keeps minute and hour boundaries', () => {
  for (const [seconds, expected] of [[0, '00:00'], [59, '00:59'], [60, '01:00'], [3599, '59:59'], [3600, '1:00:00'], [3661, '1:01:01']]) assert.equal(formatTimer(seconds), expected);
});

test('clock and date keys use the supplied local date', () => {
  const date = new Date(2026, 0, 2, 13, 5, 9);
  assert.equal(localDateKey(date), '2026-01-02');
  assert.equal(formatClock(date, '24h'), '13:05');
  assert.equal(formatClock(date, '12h'), '01:05 PM');
  assert.equal(localDateKey(new Date(2026, 11, 31, 23, 59)), '2026-12-31');
});
