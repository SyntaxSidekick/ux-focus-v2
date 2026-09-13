function normalizeImportTime(value) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  const military = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(text);
  if (military) return `${military[1].padStart(2, "0")}:${military[2]}`;
  const standard = /^(0?[1-9]|1[0-2]):([0-5]\d)\s*(AM|PM)$/i.exec(text);
  if (!standard) return null;
  const hour = Number(standard[1]) % 12 + (standard[3].toUpperCase() === "PM" ? 12 : 0);
  return `${String(hour).padStart(2, "0")}:${standard[2]}`;
}

export function parseScheduleImport(text) {
  let data;
  try { data = JSON.parse(text.replace(/^\uFEFF/, "")); }
  catch { throw new Error("This file is not valid JSON. Choose a UXFocus schedule export (.json)."); }
  const items = Array.isArray(data) ? data : data?.schedule;
  if (!Array.isArray(items)) {
    throw new Error('Expected a task array or an object containing a "schedule" array.');
  }
  const ids = new Set();
  return items.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`Task ${index + 1} must be an object.`);
    }
    const label = item.label ?? item.title;
    const start = item.start ?? item.startTime;
    const end = item.end ?? item.endTime;
    if (typeof label !== "string" || !label.trim()) throw new Error(`Task ${index + 1} needs a label or title.`);
    const normalizedStart = normalizeImportTime(start);
    const normalizedEnd = normalizeImportTime(end);
    if (!normalizedStart || !normalizedEnd) throw new Error(`Task ${index + 1} (${label}) needs start and end times such as 09:00 or 9:00 AM.`);
    let id = String(item.id ?? `import-${index}`);
    while (ids.has(id)) id += `-${index}`;
    ids.add(id);
    return { ...item, id, label: label.trim(), start: normalizedStart, end: normalizedEnd, startTime: normalizedStart, endTime: normalizedEnd };
  });
}
