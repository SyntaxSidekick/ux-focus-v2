import type { ScheduleSound } from "../../features/schedule/model.ts";

let timerAudioContext: AudioContext | null = null;
let completionAlarmEndsAt = 0;

const getAudioContext = (): AudioContext | null => {
  const audioWindow = window as Window & { webkitAudioContext?: typeof AudioContext };
  const AudioContextCtor = window.AudioContext ?? audioWindow.webkitAudioContext;
  if (!AudioContextCtor) return null;
  if (!timerAudioContext) timerAudioContext = new AudioContextCtor();
  return timerAudioContext;
};

const playTone = (
  ctx: AudioContext,
  startAt: number,
  frequency: number,
  duration: number,
  volume: number,
  type: OscillatorType = "sine",
  sustain = false,
) => {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.025);
  if (sustain) gain.gain.setValueAtTime(volume, startAt + duration - 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.04);
  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();
  };
};

export const notificationAudio = {
  resume() {
    const ctx = getAudioContext();
    if (ctx?.state === "suspended") void ctx.resume();
  },
  playCompletionAlarm() {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") void ctx.resume();
    if (ctx.currentTime < completionAlarmEndsAt) return;

    const startAt = ctx.currentTime + 0.02;
    for (let group = 0; group < 6; group += 1) {
      for (let pulse = 0; pulse < 3; pulse += 1) {
        playTone(ctx, startAt + group + pulse * 0.24, pulse === 1 ? 1046.5 : 783.99, 0.18, 0.22, "square", true);
      }
    }
    completionAlarmEndsAt = startAt + 5.7;
  },
  playWellnessReminder() {
    const ctx = getAudioContext();
    if (!ctx) return;
    void ctx.resume().then(() => {
      playTone(ctx, ctx.currentTime + 0.02, 880, 0.25, 0.15, "triangle");
      playTone(ctx, ctx.currentTime + 0.35, 440, 0.4, 0.15, "triangle");
    });
  },
  playTaskChime(item: { id: string; label: string; sound: ScheduleSound }, atStart: boolean) {
    const ctx = getAudioContext();
    if (!ctx) return;
    void ctx.resume().then(() => {
      let hash = 2166136261;
      for (const char of item.id + item.label) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
      const notes = [0, 2, 4, 7, 9];
      const base = item.sound === "break" ? 440 : item.sound === "deepwork" ? 523.25 : 587.33;
      for (let index = 0; index < 4; index++) {
        const step = notes[(hash >>> (index * 3)) % notes.length] + (atStart ? index : 3 - index);
        playTone(ctx, ctx.currentTime + 0.02 + index * 0.24, base * 2 ** (step / 12), 0.4, 0.12, item.sound === "break" ? "triangle" : "sine");
      }
    }).catch(console.error);
  },
};
