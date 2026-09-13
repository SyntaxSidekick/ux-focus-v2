const fs = require("node:fs");
const path = require("node:path");

function validBounds(bounds) {
  return bounds && ["x", "y", "width", "height"].every(key => Number.isInteger(bounds[key]))
    && bounds.width >= 300 && bounds.height >= 420;
}

function fitBounds(bounds, screen) {
  const { workArea } = screen.getDisplayMatching(bounds);
  // Keep exact coordinates (including Windows Snap's negative frame offsets)
  // whenever enough of the title bar remains reachable.
  if (bounds.y >= workArea.y - 16 && bounds.y < workArea.y + workArea.height - 32
    && bounds.x + bounds.width >= workArea.x + 80
    && bounds.x <= workArea.x + workArea.width - 80) return { ...bounds };
  const width = Math.min(bounds.width, workArea.width);
  const height = Math.min(bounds.height, workArea.height);
  return {
    width, height,
    x: Math.max(workArea.x, Math.min(bounds.x, workArea.x + workArea.width - width)),
    y: Math.max(workArea.y, Math.min(bounds.y, workArea.y + workArea.height - height)),
  };
}

function loadWindowState(file, screen) {
  try {
    const state = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!validBounds(state.bounds)) return null;
    return {
      bounds: fitBounds(state.bounds, screen),
      maximized: state.maximized === true,
      fullHeightRestore: validBounds(state.fullHeightRestore) ? fitBounds(state.fullHeightRestore, screen) : null,
    };
  } catch (error) {
    if (error.code !== "ENOENT") console.error("Unable to read window layout:", error.message);
    return null;
  }
}

function saveWindowState(file, state) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(`${file}.tmp`, JSON.stringify(state), { encoding: "utf8", flush: true });
  fs.renameSync(`${file}.tmp`, file);
}

module.exports = { loadWindowState, saveWindowState };
