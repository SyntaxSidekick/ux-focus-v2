# Schedule feature (Phase 4)

`model.ts` owns the React-independent schedule types. `defaults.ts` contains the
unchanged default data. `schedule-domain.ts` owns normalization, its existing
validation rules, completion selection/progress, and scheduled duration.
Dependencies point to the model and pure `src/lib/time` helpers only.

## Feature ownership and API

`useSchedule({ onLoadError, onSaveError })` owns the only canonical schedule state.
It returns `schedule`, `currentBlock`, `dayProgress`, `completedCount`, `addTask`,
`removeTask`, `toggleTaskComplete`, `toggleTaskReminder`, `recordTaskReminder`,
`resetSchedule` and `replaceSchedule`. No raw setter is exposed.

Ordinary mutations persist inside the state updater and still become visible if
the save fails; errors are passed to App's unchanged notices. `addTask` returns
false for missing label/start/end, otherwise adds the same fields/ID format and
sorts by start time. Replacement throws on save failure and changes state only
after a successful save. Callers supply already normalized ScheduleItems.

`schedule-repository.ts` is now justified by schedule-specific loading, decoding,
normalization, default selection, encoding and protected replacement semantics.
It uses only the storage abstraction. Load failures mark the key unreadable and
throw; the hook reports the error and displays the exact defaults. Loading does
not rewrite normalized data. Generic migration/platform decisions remain in lib.

## Components and consumers

- `SchedulePanel`: heading, add control, form and list composition, without adding
  DOM wrappers. App supplies a child slot for its existing reminder notice.
- `ScheduleList`: renders the collection without owning persistence.
- `ScheduleRow`: item presentation, completion/delete/reminder callbacks; no audio
  or storage access.
- `AddTaskForm`: owns draft fields, validation/submission interaction and reset
  after adding. It stays mounted while hidden so closing/reopening preserves the
  draft, matching the former App state lifetime.
- `CurrentScheduleBlock`: current-task summary, completion progress and empty/all
  complete presentation, including the schedule sound tag.

App retains visibility coordination with settings, notice wording, import file
parsing/export, time, timer execution, reminder timing/delivery and audio. Import
passes parsed data through `normalizeLoadedSchedule`, then `replaceSchedule`;
success is reported only after saving. App feeds derived `currentBlock` into the
existing timer. It records reminder dates through `recordTaskReminder`, and resumes
audio before requesting a bell toggle. These are data operations, not timing or
delivery logic. Schedule imports no App, timer, reminder or settings modules.

## Compatibility contract

- `start`/`end` are the canonical schedule/display fields. Normalization prefers
  string values in these fields, falling back to `startTime`/`endTime` only when
  the primary field is not a string. Empty or invalid primary strings still fail
  validation; valid aliases do not override them.
- Both pairs remain in memory and persistence. Missing aliases are filled from
  the primary fields. Existing string aliases, even conflicting ones, are retained.
  Session duration and the existing session-time module continue to prefer
  `startTime`/`endTime` with nullish fallback. Reminders continue to use `start`.
  Unifying this historical discrepancy would change behavior and is deferred.
- Label/title precedence, unknown fields, string IDs, sound defaults, completion,
  reminder flags and reminder date history retain their existing semantics.
- The normalizer receives fallback IDs, indexed to the input array, from the
  schedule repository. Callers must supply an ID for each item lacking a string ID. It retains
  the `${Date.now()}-${index}` format. Domain functions do not read the clock,
  generate random IDs, access storage, or mutate input.
- Validation intentionally remains limited: nonempty labels and strict HH:mm
  primary times. Empty schedules are valid; invalid items reject the entire
  schedule. Whitespace labels and reversed/equal intervals keep their existing
  acceptance. No stricter overlap, ordering, uniqueness or migration rules are added.
- Current block means the first incomplete item in array order, not the item at
  the current clock time. Day progress is completed count divided by item count.
  Scheduled duration remains clamped to zero for reversed intervals.

## Existing modules

`src/app/schedule-import.mjs` remains unchanged: it parses JSON/envelopes/BOM,
accepts import-specific time formats, trims labels, resolves IDs, and synchronizes
both time pairs. App.tsx then passes that output through domain normalization.
Persistence goes directly through normalization and does not adopt import's
different acceptance rules. Export and saved representations are unchanged.

The existing MJS modules exchange plain objects; they do not import App.tsx types.
No runtime TS dependency or conversion was added to them. Their eventual homes
are schedule import parsing, timer domain (`session-time.mjs`), and reminder domain
(`reminders.mjs`), respectively. Moving them is deferred to their own phases.

`src/lib/time/schedule-time.ts` provides pure HH:mm validation/conversion.
`src/lib/time/format.ts` provides duration display, clock display and local date
keys using caller-supplied values. Timer execution and its clock reads stay in App.tsx.

## Verification

`npm test` uses the existing Node test runner, discovers tests under src/electron,
and separately runs the existing popup test in Electron with an isolated profile
under `.cache/reminder-test`. New MJS tests import erasable TypeScript using Node's
native support (verified with Node 24.20.0). This is execution, not type checking.
There is no tsconfig, TypeScript dependency or configured typecheck command.

Phase 4 adds nine repository/domain characterization tests. The full suite passes
56 Node tests plus all 13 Electron popup cases at both widths. The existing twelve
visual scenarios remain pixel-identical. Isolated Electron runtime checks cover
existing saves, add/draft retention, complete/uncomplete, delete, replacement,
empty import, failed ordinary/import saves, timer duration, reminder delivery/date
recording and bell reset; a second process verifies persisted state. Test artifacts
and baseline source are under ignored `.cache/phase4-baseline/`.
