# Renderer persistence boundary

`storage-keys.ts` retains the exact existing schedule/settings key strings.
`storage-adapter.ts` owns platform selection, legacy migration and unreadable-key
protection. It has no App, feature, React, Node filesystem or Electron imports.

## API

The application uses the renderer-lifetime `savedStorage` instance:

- `read(key): string | null`: returns the exact stored string or a genuinely
  missing value; marks the key unreadable and rethrows on read/migration failure.
- `write(key, value): void`: refuses protected keys, then writes synchronously.
  Write failures propagate; they do not enable browser fallback or permanently
  protect the key. A later write may retry, as before.
- `markUnreadable(key): void`: protects data that was read but could not be parsed
  or accepted by application-specific validation.
- `assertWritable(key, message?): void`: checks protection without writing. Import
  uses its existing error message before serialization and the subsequent write.

`createStorageAdapter(getEnvironment?)` provides isolated instances for tests.
The default environment is the current window, resolved only when an operation
needs it. This is a small test seam, not an application service container.

## Precedence and migration

Reads prefer the Electron preload bridge. A non-nullish result, including an
empty string, wins without accessing localStorage. Only a missing Electron value
falls back to localStorage. A non-nullish legacy value is copied to Electron
synchronously during that read, without deleting or reformatting the legacy data.
Migration still occurs before application parsing/normalization. Migration write
failure is a read failure and protects the key; it is not treated as missing data.

Writes use Electron whenever available, otherwise browser localStorage. A failing
Electron read/write never silently falls back to a potentially stale browser copy.

## Protection and error ownership

Protection lasts for the renderer instance and is per key. Successful later reads
do not clear it; imports cannot bypass it. The adapter throws errors, while App.tsx
retains the exact existing notices/logging and default selection.

Ordinary edits still update React state even if their save reports failure.
Imports still save before replacing the visible schedule or reporting success.
Schedule serialization, loading and normalization now belong to the Phase 4
schedule repository/hook. Settings validation and persistence coordination remain
in App.tsx. Neither feature nor application code accesses platform storage directly.

## Electron and future work

The existing preload, allowlisted main-process storage, backup recovery, temporary
file writes and rename replacement are unchanged. Renderer filesystem access is
not introduced. `contextIsolation: true` and `nodeIntegration: false` remain intact.
Synchronous IPC is deliberately preserved; any asynchronous conversion requires
a separate behavioral/performance evaluation.

Twenty characterization tests cover both persisted keys, browser/Electron reads
and writes, precedence, migration, absent data, read/access/migration failures,
write retries, invalid-data protection and renderer-lifetime scoping. Run them
with the existing `npm test` command. No new framework or dependency was added.
