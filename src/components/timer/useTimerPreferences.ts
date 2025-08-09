import React from "react";

export type TimerPreferences = {
  soundEnd: boolean; // play sound when timer ends
  soundLast10: boolean; // beep each of last 10 seconds
  countUpAfterEnd: boolean; // continue counting up after reaching 0
  notifyOnEnd: boolean; // browser notification when ends (if tab inactive)
};

const DEFAULT_PREFS: TimerPreferences = {
  soundEnd: true,
  soundLast10: false,
  countUpAfterEnd: false,
  notifyOnEnd: false,
};

const LS_KEY = "timer:prefs";

export function useTimerPreferences() {
  const [prefs, setPrefs] = React.useState<TimerPreferences>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return DEFAULT_PREFS;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_PREFS, ...parsed } as TimerPreferences;
    } catch {
      return DEFAULT_PREFS;
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(prefs));
    } catch {}
  }, [prefs]);

  return [prefs, setPrefs] as const;
}

export async function ensureNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  try {
    const res = await Notification.requestPermission();
    return res === "granted";
  } catch {
    return false;
  }
}
