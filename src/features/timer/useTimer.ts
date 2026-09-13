import { useCallback, useEffect, useMemo, useState } from "react";
import { formatTimer } from "../../lib/time/format.ts";
import { getRemainingSessionSecs, getSessionDurationSecs, type TimerSession } from "./timer-domain.ts";

interface TimerTick {
  deltaMs: number;
  remainingSeconds: number;
}

interface UseTimerOptions {
  currentBlock: TimerSession | null;
  onTick?(tick: TimerTick): void;
  onComplete?(): void;
}

export function useTimer({ currentBlock, onTick, onComplete }: UseTimerOptions) {
  const initialDuration = useMemo(() => getSessionDurationSecs(currentBlock), [currentBlock]);
  const [remainingSeconds, setRemainingSeconds] = useState(initialDuration);
  const [totalSeconds, setTotalSeconds] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const nextDuration = getSessionDurationSecs(currentBlock);
    setIsRunning(false);
    setRemainingSeconds(nextDuration);
    setTotalSeconds(nextDuration);
  }, [currentBlock?.id, currentBlock?.startTime, currentBlock?.endTime, currentBlock?.start, currentBlock?.end]);

  useEffect(() => {
    if (!isRunning) return;
    let previousTick = Date.now();
    const intervalId = setInterval(() => {
      const tick = Date.now();
      const remaining = getRemainingSessionSecs(currentBlock, new Date(tick));
      const deltaMs = tick - previousTick;
      previousTick = tick;
      onTick?.({ deltaMs, remainingSeconds: remaining });
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        setIsRunning(false);
        onComplete?.();
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [isRunning, currentBlock?.id, currentBlock?.endTime, currentBlock?.end, onTick, onComplete]);

  const start = useCallback(() => {
    const seconds = getRemainingSessionSecs(currentBlock);
    setTotalSeconds(previous => Math.max(previous, seconds));
    setRemainingSeconds(seconds);
    setIsRunning(seconds > 0);
  }, [currentBlock]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const toggle = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
      return;
    }
    const seconds = getRemainingSessionSecs(currentBlock);
    setTotalSeconds(previous => Math.max(previous, seconds));
    setRemainingSeconds(seconds);
    setIsRunning(seconds > 0);
  }, [isRunning, currentBlock]);

  const reset = useCallback(() => {
    const seconds = getSessionDurationSecs(currentBlock);
    setIsRunning(false);
    setRemainingSeconds(seconds);
    setTotalSeconds(seconds);
  }, [currentBlock]);

  const progress = totalSeconds > 0 ? Math.max(0, 1 - remainingSeconds / totalSeconds) : 0;

  return {
    remainingSeconds,
    totalSeconds,
    progress,
    isRunning,
    timeDisplay: formatTimer(remainingSeconds),
    start,
    pause,
    toggle,
    reset,
  };
}
