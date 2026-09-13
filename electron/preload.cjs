const { contextBridge, ipcRenderer } = require("electron");

function storageRequest(operation, key, value) {
  const result = ipcRenderer.sendSync(`storage:${operation}`, key, value);
  if (result.error) throw new Error(result.error);
  return result.value;
}

contextBridge.exposeInMainWorld("uxFocusStorage", {
  getItem: key => storageRequest("get", key),
  setItem: (key, value) => storageRequest("set", key, value),
});

contextBridge.exposeInMainWorld("uxFocusWindow", {
  minimize: () => ipcRenderer.invoke("window:minimize"),
  toggleFullHeight: () => ipcRenderer.invoke("window:toggle-full-height"),
  close: () => ipcRenderer.invoke("window:close"),
  showReminder: reminder => ipcRenderer.invoke("reminder:show", reminder),
});


