# UXFocus v2

UXFocus is a distraction-light desktop productivity app for structured focus sessions.

It combines:
- a daily schedule planner,
- a live session timer,
- movement and wellness reminders,
- schedule import/export,
- and desktop reminder popups.

Built with React + TypeScript + Tailwind + Electron.

## User Setup (Beginner Friendly)

If you just want to run the desktop app, follow these steps.

### 1) Install required apps

- Node.js 18 or newer (includes npm)
- Docker Desktop

After installing Docker Desktop, open it once and wait until it says Docker Engine is running.

### 2) Open this project and install dependencies

From the project folder, run:

```bash
npm install
```

### 3) Start UXFocus

On Windows, run:

```powershell
scripts/start-uxfocus.vbs
```

What this launcher does:
- Starts Docker Desktop if needed.
- Builds/starts the local container.
- Opens the UXFocus desktop window.

### 4) Add quick launch (optional but recommended)

Auto-start at Windows login:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/install-windows-startup.ps1
```

Manual desktop shortcut:
1. Right-click scripts/start-uxfocus.vbs.
2. Select Send to > Desktop (create shortcut).
3. Rename the shortcut to UX Focus V2.

### 5) If startup fails

- Confirm Docker Desktop is open and running.
- Run scripts/start-uxfocus.vbs again.
- First launch after reboot may take longer while Docker starts.

## Daily Use

1. Open Settings and choose time format/theme.
2. Add your tasks in Schedule (name + start/end + type).
3. Toggle reminders for tasks you want alerts for.
4. Start the timer on your current task.
5. Export your schedule periodically as a backup JSON.

## Privacy and Storage

- Imported schedule files are read and parsed, then normalized schedule data is saved locally.
- Local runtime data is stored under .cache/electron-user-data in local desktop workflows.
- Personal runtime schedule data is ignored by git via .gitignore rules.

## Developer Setup

Use this section if you want to develop or contribute to UXFocus.

### Prerequisites

- Node.js 18+
- npm 9+
- Docker Desktop

### Install

```bash
npm install
```

### Run web app (Vite)

```bash
npm run dev
```

### Run desktop dev mode (Electron + Vite)

```bash
npm run desktop:dev
```

### Build and test

```bash
npm test
npm run build
npm run docker:build
npm run docker:up
```

## Project Structure

- src/app: app composition (App.tsx, AppShell.tsx) and app-level orchestration hooks
- src/features: feature boundaries (schedule, timer, reminders, settings, import-export)
- src/components/shared: cross-feature shared UI components
- src/lib: infrastructure modules (audio, platform, storage, time)
- electron: main/preload process code and Electron-facing tests

## Notes for Contributors

- Follow architecture guidance in docs/architecture.md.
- Keep feature ownership inside src/features/<feature>.
- Put shared product UI in src/components/shared.
- Put infrastructure code in src/lib.
- Avoid cross-feature coupling.

## License

No license file is currently defined in this repository.
