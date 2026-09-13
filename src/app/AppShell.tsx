import { useRef, useState } from "react";
import { formatClock } from "../lib/time/format.ts";
import { useClock } from "../hooks/useClock.ts";
import { useSchedule } from "../features/schedule/useSchedule.ts";
import { SchedulePanel, type SchedulePanelHandle } from "../features/schedule/components/SchedulePanel.tsx";
import { CurrentScheduleBlock } from "../features/schedule/components/CurrentScheduleBlock.tsx";
import { TimerPanel } from "../features/timer/components/TimerPanel.tsx";
import { useTimer } from "../features/timer/useTimer.ts";
import { ReminderNotice } from "../features/reminders/components/ReminderNotice.tsx";
import { useReminderNotice } from "../features/reminders/useReminderNotice.ts";
import { useWellnessReminders } from "../features/reminders/useWellnessReminders.ts";
import { useScheduleReminders } from "../features/reminders/useScheduleReminders.ts";
import { useSettings } from "../features/settings/useSettings.ts";
import { SettingsPanel } from "../features/settings/components/SettingsPanel.tsx";
import { useImportExport } from "../features/import-export/useImportExport.ts";
import { ImportExportControls } from "../features/import-export/components/ImportExportControls.tsx";
import { ImportExportSettingsButtons } from "../features/import-export/components/ImportExportSettingsButtons.tsx";
import { AppNoticeList } from "../components/shared/AppNoticeList.tsx";
import { TitleBar } from "../components/shared/TitleBar.tsx";
import { ClockDisplay } from "../components/shared/ClockDisplay.tsx";
import { dismissAppNotice, getErrorDetail, showAppNotice, useAppNotices } from "./hooks/useAppNotices.ts";
import { useReminderDelivery } from "./hooks/useReminderDelivery.ts";
import { notificationAudio } from "../lib/audio/notifications-audio.ts";
import { desktop } from "../lib/platform/desktop.ts";

export function AppShell() {
  const schedulePanel = useRef<SchedulePanelHandle>(null);
  const [showSettings, setShowSettings] = useState(false);

  const notices = useAppNotices();
  const now = useClock();
  const { notice: reminderNotice, showReminderNotice, dismissReminderNotice } = useReminderNotice();

  const { settings, activeTheme, setTimeFormat, setThemeId, toggleAutoStart } = useSettings({
    onLoadError: error => showAppNotice(`Settings could not be loaded: ${getErrorDetail(error)} Defaults are shown. Your saved settings have been preserved.`),
    onSaveError: error => {
      console.error("Unable to save UX Focus data", error);
      showAppNotice(`Changes could not be saved: ${getErrorDetail(error)} Export your schedule before closing UXFocus. Check disk space and folder access, then retry.`);
    },
  });

  const { schedule, currentBlock, dayProgress, completedCount, addTask, removeTask, toggleTaskComplete,
    toggleTaskReminder, recordTaskReminder, resetSchedule, replaceSchedule } = useSchedule({
    onLoadError: error => {
      console.error("Unable to load schedule", error);
      showAppNotice(`Saved schedule could not be loaded: ${getErrorDetail(error)} Your saved file is unchanged. Check the saved file before making further changes.`);
    },
    onSaveError: error => {
      console.error("Unable to save UX Focus data", error);
      showAppNotice(`Changes could not be saved: ${getErrorDetail(error)} Export your schedule before closing UXFocus. Check disk space and folder access, then retry.`);
    },
  });

  const deliverReminder = useReminderDelivery({ onShowInAppReminder: showReminderNotice });

  const wellnessReminders = useWellnessReminders({ currentSession: currentBlock, onReminder: deliverReminder });
  useScheduleReminders({ schedule, now, onRecordTaskReminder: recordTaskReminder, onReminder: deliverReminder });

  const timer = useTimer({
    currentBlock,
    onTick: wellnessReminders.handleTimerTick,
    onComplete: notificationAudio.playCompletionAlarm,
  });

  const importExport = useImportExport({
    schedule,
    replaceSchedule,
    onSuccess: message => showAppNotice(message, false),
    onError: message => showAppNotice(message),
    getErrorDetail,
  });

  return (
    <div className="h-dvh bg-transparent p-1" style={activeTheme.vars}>
      <input
        ref={importExport.importInput}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={importExport.onImportChange}
      />
      <div
        onPointerDown={notificationAudio.resume}
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        className="flex h-full flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-y-auto [&>*]:shrink-0"
      >
        <AppNoticeList notices={notices} onDismiss={dismissAppNotice} />

        <TitleBar
          showSettings={showSettings}
          onToggleSettings={() => {
            setShowSettings(value => !value);
            schedulePanel.current?.closeAddForm();
          }}
          onMinimize={desktop.minimize}
          onToggleWindowSize={desktop.toggleFullHeight}
          onClose={desktop.close}
        />

        <SettingsPanel
          visible={showSettings}
          settings={settings}
          onToggleAutoStart={toggleAutoStart}
          onSetTimeFormat={setTimeFormat}
          onSetTheme={setThemeId}
          onToggleAddEvent={() => {
            schedulePanel.current?.toggleAddForm();
            setShowSettings(false);
          }}
          onResetSchedule={resetSchedule}
          scheduleExtraActions={<ImportExportSettingsButtons onExport={importExport.exportSchedule} onImport={importExport.openImportDialog} />}
          onClose={() => setShowSettings(false)}
        />

        <ClockDisplay
          timeDisplay={formatClock(now, settings.timeFormat)}
          seconds={String(now.getSeconds()).padStart(2, "0")}
          dateLabel={now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        />

        <CurrentScheduleBlock
          schedule={schedule}
          currentBlock={currentBlock}
          dayProgress={dayProgress}
          completedCount={completedCount}
        />

        <div className="h-px bg-border mx-4" />

        <TimerPanel
          progress={timer.progress}
          timeDisplay={timer.timeDisplay}
          isRunning={timer.isRunning}
          totalSeconds={timer.totalSeconds}
          onToggle={() => {
            notificationAudio.resume();
            timer.toggle();
          }}
          onReset={() => {
            timer.reset();
            wellnessReminders.reset();
          }}
        />

        <div className="h-px bg-border mx-4" />

        <SchedulePanel
          ref={schedulePanel}
          schedule={schedule}
          currentBlock={currentBlock}
          onScheduleInteraction={() => setShowSettings(false)}
          onAdd={addTask}
          onComplete={toggleTaskComplete}
          onDelete={removeTask}
          onToggleReminder={id => {
            notificationAudio.resume();
            toggleTaskReminder(id);
          }}
        >
          <ReminderNotice notice={reminderNotice} onDismiss={dismissReminderNotice} />
        </SchedulePanel>

        <ImportExportControls onExport={importExport.exportSchedule} onImport={importExport.openImportDialog} />

        <p className="border-t border-border mt-1 px-4 py-3 text-center text-[9px] tracking-widest uppercase text-muted-foreground/25">
          uxFocus v2.0 &middot; Productivity without distraction
        </p>
      </div>
    </div>
  );
}
