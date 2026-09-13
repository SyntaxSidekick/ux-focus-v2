const fs = require("node:fs");
const path = require("node:path");

function createStorage(directory) {
  function fileFor(key) {
    if (!["uxfocus-schedule-v2", "uxfocus-settings-v1"].includes(key)) throw new Error("Unknown storage key");
    return path.join(directory, `${key}.json`);
  }
  return {
    get(key) {
      const file = fileFor(key);
      try {
        const value = fs.readFileSync(file, "utf8");
        JSON.parse(value);
        return value;
      } catch (error) {
        try {
          const backup = fs.readFileSync(`${file}.bak`, "utf8");
          JSON.parse(backup);
          return backup;
        } catch {
          if (error.code === "ENOENT" && !fs.existsSync(`${file}.bak`)) return null;
          throw error;
        }
      }
    },
    set(key, value) {
      const file = fileFor(key);
      if (typeof value !== "string") throw new Error("Invalid saved data");
      JSON.parse(value);
      fs.mkdirSync(directory, { recursive: true });
      fs.writeFileSync(`${file}.tmp`, value, { encoding: "utf8", flush: true });
      fs.renameSync(`${file}.tmp`, file);
      fs.writeFileSync(`${file}.bak.tmp`, value, { encoding: "utf8", flush: true });
      fs.renameSync(`${file}.bak.tmp`, `${file}.bak`);
    },
  };
}
module.exports = { createStorage };
