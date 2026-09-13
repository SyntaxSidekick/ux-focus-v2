import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStorageAdapter } from './storage-adapter.ts';
import { STORAGE_KEY, SETTINGS_KEY } from './storage-keys.ts';

function backend(initial = {}) {
  const values = new Map(Object.entries(initial));
  const calls = [];
  return {
    values, calls,
    getItem(key) { calls.push(['get', key]); return values.get(key) ?? null; },
    setItem(key, value) { calls.push(['set', key, value]); values.set(key, value); },
  };
}

test('persisted schedule and settings key strings remain compatible', () => {
  assert.equal(STORAGE_KEY, 'uxfocus-schedule-v2');
  assert.equal(SETTINGS_KEY, 'uxfocus-settings-v1');
});

for (const key of [STORAGE_KEY, SETTINGS_KEY]) {
  test(`${key}: browser reads and writes exact values; missing is null`, () => {
    const browser = backend();
    const storage = createStorageAdapter(() => ({ localStorage: browser }));
    assert.equal(storage.read(key), null);
    storage.write(key, '{"legacy":true}');
    assert.equal(storage.read(key), '{"legacy":true}');
    assert.deepEqual(browser.calls, [['get', key], ['set', key, '{"legacy":true}'], ['get', key]]);
  });

  test(`${key}: Electron is preferred for reads and writes without accessing browser storage`, () => {
    const desktop = backend({ [key]: '[]' });
    const storage = createStorageAdapter(() => ({ uxFocusStorage: desktop, get localStorage() { throw Error('Browser must not be accessed'); } }));
    assert.equal(storage.read(key), '[]');
    storage.write(key, '{}');
    assert.equal(storage.read(key), '{}');
    desktop.values.set(key, '');
    assert.equal(storage.read(key), '');
  });

  test(`${key}: migrates missing Electron values on read, preserving exact legacy bytes`, () => {
    for (const legacy of [' { "legacy": true } ', '[]', '']) {
      const browser = backend({ [key]: legacy });
      const desktop = backend();
      const storage = createStorageAdapter(() => ({ uxFocusStorage: desktop, localStorage: browser }));
      assert.equal(storage.read(key), legacy);
      assert.equal(browser.values.get(key), legacy);
      assert.deepEqual(desktop.calls, [['get', key], ['set', key, legacy]]);
      assert.equal(storage.read(key), legacy);
      assert.deepEqual(browser.calls, [['get', key]]);
    }
  });

  test(`${key}: absent data in both backends causes no migration or default write`, () => {
    const browser = backend(), desktop = backend();
    const storage = createStorageAdapter(() => ({ uxFocusStorage: desktop, localStorage: browser }));
    assert.equal(storage.read(key), null);
    assert.deepEqual(desktop.calls, [['get', key]]);
    assert.deepEqual(browser.calls, [['get', key]]);
    storage.write(key, '[]');
    assert.equal(desktop.values.get(key), '[]');
    assert.equal(browser.values.has(key), false);
  });

  test(`${key}: Electron read failure is not missing data and cannot overwrite recoverable data`, () => {
    const failure = Error('Disk unavailable');
    const browser = backend({ [key]: 'legacy' }), desktop = backend({ [key]: 'recoverable' });
    const read = desktop.getItem;
    desktop.getItem = () => { throw failure; };
    const storage = createStorageAdapter(() => ({ uxFocusStorage: desktop, localStorage: browser }));
    assert.throws(() => storage.read(key), error => error === failure);
    assert.throws(() => storage.write(key, 'defaults'), /refusing to overwrite/);
    assert.deepEqual(browser.calls, []);
    assert.equal(desktop.values.get(key), 'recoverable');
    desktop.getItem = read;
    assert.equal(storage.read(key), 'recoverable');
    assert.throws(() => storage.write(key, 'defaults'), /refusing to overwrite/);
  });

  test(`${key}: browser read/access failure protects the key`, () => {
    const browser = backend({ [key]: 'recoverable' });
    const failure = Error('Storage denied');
    const storage = createStorageAdapter(() => ({ get localStorage() { throw failure; } }));
    assert.throws(() => storage.read(key), error => error === failure);
    assert.throws(() => storage.write(key, 'defaults'), /refusing to overwrite/);
    browser.getItem = () => { throw failure; };
    const another = createStorageAdapter(() => ({ localStorage: browser }));
    assert.throws(() => another.read(key), error => error === failure);
    assert.throws(() => another.write(key, 'defaults'), /refusing to overwrite/);
    assert.equal(browser.values.get(key), 'recoverable');
  });

  test(`${key}: migration write failure propagates and blocks subsequent saves`, () => {
    const browser = backend({ [key]: '{"legacy":true}' });
    const desktop = backend();
    const failure = Error('Migration write failed');
    desktop.setItem = () => { throw failure; };
    const storage = createStorageAdapter(() => ({ uxFocusStorage: desktop, localStorage: browser }));
    assert.throws(() => storage.read(key), error => error === failure);
    assert.throws(() => storage.write(key, '{}'), /refusing to overwrite/);
    assert.equal(browser.values.get(key), '{"legacy":true}');
    assert.deepEqual(browser.calls, [['get', key]]);
  });

  test(`${key}: write failures propagate without fallback or permanent read protection`, () => {
    for (const useDesktop of [false, true]) {
      const browser = backend(), desktop = backend();
      const target = useDesktop ? desktop : browser;
      const write = target.setItem;
      const failure = Error('Disk full');
      target.setItem = () => { throw failure; };
      const storage = createStorageAdapter(() => ({ uxFocusStorage: useDesktop ? desktop : undefined, localStorage: browser }));
      assert.throws(() => storage.write(key, '[]'), error => error === failure);
      if (useDesktop) assert.deepEqual(browser.calls, []);
      target.setItem = write;
      storage.write(key, '[]');
      assert.equal(target.values.get(key), '[]');
    }
  });

  test(`${key}: invalid parsed data can be protected without conflating it with missing data`, () => {
    const browser = backend({ [key]: '{broken' });
    const storage = createStorageAdapter(() => ({ localStorage: browser }));
    const raw = storage.read(key);
    assert.equal(raw, '{broken');
    assert.throws(() => JSON.parse(raw));
    storage.markUnreadable(key);
    assert.throws(() => storage.write(key, '{}'), /refusing to overwrite/);
    const importMessage = 'Existing saved data could not be read. Export your schedule before repairing the saved file.';
    assert.throws(() => storage.assertWritable(key, importMessage), { message: importMessage });
    assert.equal(browser.values.get(key), '{broken');
    const otherKey = key === STORAGE_KEY ? SETTINGS_KEY : STORAGE_KEY;
    storage.write(otherKey, '{}');
    assert.equal(browser.values.get(otherKey), '{}');
  });
}

test('platform lookup is lazy and protection is scoped to a renderer adapter', () => {
  const browser = backend(), desktop = backend();
  let environment = { localStorage: browser };
  let calls = 0;
  const storage = createStorageAdapter(() => { calls++; return environment; });
  assert.equal(calls, 0);
  storage.write(STORAGE_KEY, '[]');
  environment = { localStorage: browser, uxFocusStorage: desktop };
  assert.equal(storage.read(STORAGE_KEY), '[]');
  assert.equal(desktop.values.get(STORAGE_KEY), '[]');
  storage.markUnreadable(STORAGE_KEY);
  const reopened = createStorageAdapter(() => environment);
  reopened.write(STORAGE_KEY, '[1]');
  assert.equal(reopened.read(STORAGE_KEY), '[1]');
});
