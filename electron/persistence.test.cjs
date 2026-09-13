const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { EventEmitter } = require('node:events');
const { createStorage } = require('./storage.cjs');
const { loadWindowState, saveWindowState } = require('./window-state.cjs');

test('imported schedule survives reopening storage, including an empty list', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'uxfocus-test-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const key = 'uxfocus-schedule-v2';
  const imported = JSON.stringify([{ id: 'imported', label: 'Imported task', start: '09:00', end: '10:00', sound: 'deepwork' }]);
  createStorage(directory).set(key, imported);
  assert.equal(createStorage(directory).get(key), imported);
  createStorage(directory).set(key, '[]');
  assert.equal(createStorage(directory).get(key), '[]');
});

test('window movement saves before close and restores on reopening', async t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'uxfocus-test-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const display = { workArea: { x: 0, y: 0, width: 1920, height: 1080 } };
  const screen = { getPrimaryDisplay: () => display, getDisplayMatching: () => display };
  let win;
  class Window extends EventEmitter {
    constructor(options) {
      super();
      this.options = options;
      this.bounds = { x: options.x, y: options.y, width: options.width, height: options.height };
      win = this;
    }
    setVisibleOnAllWorkspaces() {}
    setMenuBarVisibility() {}
    loadURL() {}
    isMinimized() { return !!this.minimized; }
    isMaximized() { return false; }
    getBounds() { return this.bounds; }
  }
  const app = new EventEmitter();
  Object.assign(app, { isPackaged: false, setPath() {}, getPath: () => directory,
    commandLine: { appendSwitch() {} }, requestSingleInstanceLock: () => true,
    whenReady: () => new Promise(() => {}) });
  const context = vm.createContext({
    require: name => name === 'electron' ? { app, BrowserWindow: Window, screen } : require(name),
    __dirname, process: { platform: 'win32', env: {} }, console, setTimeout, clearTimeout,
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, 'main.cjs'), 'utf8'), context);
  vm.runInContext('createWindow()', context);
  win.bounds = { x: 100, y: 150, width: 400, height: 800 };
  win.emit('move');
  await new Promise(resolve => setTimeout(resolve, 300));
  const file = path.join(directory, 'window-state.json');
  assert.deepEqual(loadWindowState(file, screen).bounds, win.bounds);
  win.minimized = true;
  win.emit('close');
  vm.runInContext('createWindow()', context);
  assert.deepEqual(win.bounds, { x: 100, y: 150, width: 400, height: 800 });
  win.bounds = { x: 250, y: 100, width: 400, height: 800 };
  win.emit('move');
  win.emit('close');
  assert.deepEqual(loadWindowState(file, screen).bounds, win.bounds);
  saveWindowState(file, { bounds: { x: 3000, y: 150, width: 400, height: 800 } });
  assert.equal(loadWindowState(file, screen).bounds.x, 1520);
});

test('saved data recovers from a damaged primary file', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'uxfocus-test-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const key = 'uxfocus-settings-v1';
  const value = JSON.stringify({ themeId: 'forest', timeFormat: '12h' });
  createStorage(directory).set(key, value);
  fs.writeFileSync(path.join(directory, `${key}.json`), '{broken');
  assert.equal(createStorage(directory).get(key), value);
});

test('Windows snap offsets and secondary monitor positions restore exactly', t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'uxfocus-test-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const file = path.join(directory, 'window-state.json');
  const screen = { getDisplayMatching: () => ({ workArea: { x: -1920, y: 0, width: 1920, height: 1080 } }) };
  const bounds = { x: -1928, y: -8, width: 976, height: 1096 };
  saveWindowState(file, { bounds });
  assert.deepEqual(loadWindowState(file, screen).bounds, bounds);
});
