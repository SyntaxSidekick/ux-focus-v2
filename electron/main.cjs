const { app, BrowserWindow, ipcMain, screen } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const { createStorage } = require("./storage.cjs");
const { loadWindowState, saveWindowState } = require("./window-state.cjs");

const isDev = !app.isPackaged;
const projectDir = path.join(__dirname, "..");
let isShuttingDownDocker = false;
let reminderWindow = null;
const restoredBounds = new WeakMap();

process.env.UX_FOCUS_USER_DATA_DIR ||= path.join(projectDir, ".cache", "electron-user-data");
if (process.env.UX_FOCUS_USER_DATA_DIR) {
  app.setPath("userData", process.env.UX_FOCUS_USER_DATA_DIR);
  app.setPath("sessionData", path.join(process.env.UX_FOCUS_USER_DATA_DIR, "session"));
  app.commandLine.appendSwitch("disk-cache-dir", path.join(process.env.UX_FOCUS_USER_DATA_DIR, "cache"));
  app.commandLine.appendSwitch("disable-gpu-shader-disk-cache");
}

function createWindow() {
  const isWindows = process.platform === "win32";
  const workArea = screen.getPrimaryDisplay().workArea;
  const width = 332;
  const height = 736;
  const stateFile = path.join(app.getPath("userData"), "window-state.json");
  const savedState = loadWindowState(stateFile, screen);

  const win = new BrowserWindow({
    width,
    height,
    minWidth: 300,
    minHeight: 420,
    ...(isWindows ? {} : { maxWidth: 420 }),
    x: workArea.x + workArea.width - width - 28,
    y: workArea.y + 28,
    ...(savedState?.bounds ?? {}),
    frame: false,
    // Windows Snap needs a normal resizable window without a width cap.
    transparent: !isWindows,
    thickFrame: true,
    resizable: true,
    maximizable: true,
    skipTaskbar: !isWindows,
    alwaysOnTop: true,
    backgroundColor: isWindows ? "#111120" : "#00000000",
    show: false,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
      autoplayPolicy: "no-user-gesture-required",
    },
  });

  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setMenuBarVisibility(false);

  if (savedState?.fullHeightRestore) restoredBounds.set(win, savedState.fullHeightRestore);
  let lastState = savedState;
  let saveTimer;
  const persistState = () => {
    clearTimeout(saveTimer);
    if (!lastState) return;
    try { saveWindowState(stateFile, lastState); }
    catch (error) { console.error("Unable to save window layout:", error.message); }
  };
  const captureState = () => {
    // A minimized window can report off-screen coordinates on Windows.
    if (win.isMinimized()) return;
    lastState = {
      bounds: win.isMaximized() ? win.getNormalBounds() : win.getBounds(),
      maximized: win.isMaximized(),
      fullHeightRestore: restoredBounds.get(win) ?? null,
    };
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persistState, 200);
  };
  for (const event of ["move", "resize", "maximize", "unmaximize"]) win.on(event, captureState);
  win.on("close", () => {
    captureState();
    persistState();
  });
  win.once("ready-to-show", () => {
    if (savedState?.maximized) win.maximize();
    win.show();
    captureState();
  });

  if (process.env.UX_FOCUS_WIDGET_URL) {
    win.loadURL(process.env.UX_FOCUS_WIDGET_URL, { extraHeaders: "Cache-Control: no-cache\n" });
  } else if (isDev) {
    win.loadURL("http://127.0.0.1:5173");
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

async function showReminder(sender, reminder) {
  const { reminderHtml, sizeReminderWindow } = require('./reminder-popup.cjs');
  const owner = BrowserWindow.fromWebContents(sender);
  const display = owner && !owner.isDestroyed() ? screen.getDisplayMatching(owner.getBounds()) : screen.getPrimaryDisplay();
  const { workArea } = display;
  if (reminderWindow && !reminderWindow.isDestroyed()) reminderWindow.close();
  const win = new BrowserWindow({ width: Math.min(420, workArea.width), height: 100, frame: false, parent: owner || undefined, alwaysOnTop: true, resizable: false, show: false, title: 'UX Focus reminder', backgroundColor: '#111120', webPreferences: { contextIsolation: true, nodeIntegration: false } });
  reminderWindow = win;
  win.setMenu(null);
  win.on('closed', () => { if (reminderWindow === win) reminderWindow = null; });
  await win.loadURL('data:text/html;charset=UTF-8,' + encodeURIComponent(reminderHtml(reminder)));
  if (win.isDestroyed()) return;
  await sizeReminderWindow(win, workArea);
  if (win.isDestroyed()) return;
  win.show();
  win.focus();
}

function closeWidget(sender) {
  const win = BrowserWindow.fromWebContents(sender);
  if (win && !win.isDestroyed()) win.close();
  app.quit();
}
const hasInstanceLock = app.requestSingleInstanceLock();
if (!hasInstanceLock) app.quit();
app.on("second-instance", () => {
  const win = BrowserWindow.getAllWindows().find(window => window !== reminderWindow);
  if (win) {
    win.webContents.reloadIgnoringCache();
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
  }
});

app.whenReady().then(() => {
  if (!hasInstanceLock) return;
  const storage = createStorage(path.join(app.getPath("userData"), "saved-data"));
  for (const operation of ["get", "set"]) {
    ipcMain.on(`storage:${operation}`, (event, key, value) => {
      try {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (!win || win === reminderWindow) throw new Error("Storage unavailable for this window");
        event.returnValue = { value: storage[operation](key, value) };
      } catch (error) {
        event.returnValue = { error: error.message };
      }
    });
  }
  ipcMain.handle("window:minimize", event => {
    BrowserWindow.fromWebContents(event.sender)?.minimize();
  });

  ipcMain.handle("window:toggle-full-height", event => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win || win.isDestroyed()) return;
    if (win.isMaximized()) win.unmaximize();
    const bounds = win.getBounds();
    const { workArea } = screen.getDisplayMatching(bounds);
    const previous = restoredBounds.get(win);
    if (previous && bounds.y === workArea.y && bounds.height === workArea.height) {
      const height = Math.min(previous.height, workArea.height);
      win.setBounds({
        x: Math.max(workArea.x, Math.min(bounds.x, workArea.x + workArea.width - bounds.width)),
        y: Math.max(workArea.y, Math.min(previous.y, workArea.y + workArea.height - height)),
        width: bounds.width,
        height,
      });
      restoredBounds.delete(win);
    } else {
      restoredBounds.set(win, bounds);
      win.setBounds({ ...bounds, y: workArea.y, height: workArea.height });
    }
  });

  ipcMain.handle("window:close", event => {
    closeWidget(event.sender);
  });

  ipcMain.handle("reminder:show", (event, reminder) => showReminder(event.sender, reminder));

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

