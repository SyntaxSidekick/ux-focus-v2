import { test } from "node:test";
import assert from "node:assert/strict";
import { createStorageAdapter } from "../../lib/storage/storage-adapter.ts";
import { SETTINGS_KEY } from "../../lib/storage/storage-keys.ts";
import { createSettingsRepository } from "./settings-repository.ts";
import { DEFAULT_SETTINGS } from "./defaults.ts";
import { THEME_PALETTES } from "./themes.ts";

function setup(value = null) {
  const writes = [];
  let failure;
  const backend = {
    getItem: () => value,
    setItem: (key, next) => {
      if (failure) throw failure;
      writes.push([key, next]);
      value = next;
    },
  };
  const storage = createStorageAdapter(() => ({ localStorage: backend }));
  return { repository: createSettingsRepository(storage), writes, backend, fail: error => { failure = error; } };
}

test("loads valid settings exactly and does not write on load", () => {
  const valid = { timeFormat: "12h", themeId: "forest", autoStart: false };
  const { repository, writes } = setup(JSON.stringify(valid));
  assert.deepEqual(repository.load(), valid);
  assert.deepEqual(writes, []);
});

test("missing and empty values return defaults", () => {
  assert.equal(setup(null).repository.load(), DEFAULT_SETTINGS);
  assert.equal(setup("").repository.load(), DEFAULT_SETTINGS);
});

test("partially missing or unknown values normalize to defaults", () => {
  const { repository } = setup(JSON.stringify({ timeFormat: "wat", themeId: "unknown", autoStart: "yes" }));
  assert.deepEqual(repository.load(), DEFAULT_SETTINGS);
  const partial = setup(JSON.stringify({ timeFormat: "12h" })).repository.load();
  assert.equal(partial.timeFormat, "12h");
  assert.equal(partial.themeId, DEFAULT_SETTINGS.themeId);
  assert.equal(partial.autoStart, DEFAULT_SETTINGS.autoStart);
});

test("malformed JSON and read failures mark key unreadable and block overwrite", () => {
  for (const value of ["{broken"] ) {
    const { repository, writes } = setup(value);
    assert.throws(() => repository.load());
    assert.throws(() => repository.save(DEFAULT_SETTINGS), /refusing to overwrite/i);
    assert.deepEqual(writes, []);
  }
  const { repository, backend, writes } = setup(JSON.stringify(DEFAULT_SETTINGS));
  const error = Error("Unreadable disk");
  backend.getItem = () => { throw error; };
  assert.throws(() => repository.load(), actual => actual === error);
  assert.throws(() => repository.save(DEFAULT_SETTINGS), /refusing to overwrite/i);
  assert.deepEqual(writes, []);
});

test("saves settings with the existing storage key", () => {
  const { repository, writes } = setup(JSON.stringify(DEFAULT_SETTINGS));
  const next = { timeFormat: "12h", themeId: "daylight", autoStart: false };
  repository.save(next);
  assert.equal(writes.length, 1);
  assert.equal(writes[0][0], SETTINGS_KEY);
  assert.equal(writes[0][1], JSON.stringify(next));
});

test("theme registry preserves all expected IDs", () => {
  assert.deepEqual(THEME_PALETTES.map(theme => theme.id), ["midnight", "slate", "forest", "daylight"]);
}
);
