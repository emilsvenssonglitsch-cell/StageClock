import React from "react";
import { toast } from "sonner";
import { useTimerPreferences } from "@/components/timer/useTimerPreferences";
import { getAudioUrl } from "@/lib/audioStore";
import { useLanguage } from "@/contexts/LanguageContext";

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = React.useRef(callback);
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  React.useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

function simpleBeep(freq = 880, duration = 0.2) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    o.connect(g);
    g.connect(ctx.destination);
    const t0 = ctx.currentTime;
    g.gain.setValueAtTime(0.001, t0);
    g.gain.exponentialRampToValueAtTime(0.3, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    o.start(t0);
    o.stop(t0 + duration);
  } catch {}
}

export function useTimer() {
  const { t } = useLanguage();
  const [totalMs, setTotalMs] = React.useState(5 * 60 * 1000);
  const [remainingMs, setRemainingMs] = React.useState(totalMs);
  const [running, setRunning] = React.useState(false);
  const [targetEnd, setTargetEnd] = React.useState<number | null>(null);
  const [repeat, setRepeat] = React.useState<boolean>(() => localStorage.getItem("timer:repeat") === "1");
  const [prefs] = useTimerPreferences();
  const doneNotifiedRef = React.useRef(false);
  const prevSecondRef = React.useRef<number | null>(null);
  const activeAudioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    localStorage.setItem("timer:repeat", repeat ? "1" : "0");
  }, [repeat]);

  async function notifyDone() {
    if (prefs.soundEnd) {
      try {
        const customUrl = await getAudioUrl('end');
        if (customUrl) {
          try {
            const prev = activeAudioRef.current;
            if (prev) {
              try { prev.pause(); prev.currentTime = 0; } catch {}
            }
            const audio = new Audio(customUrl);
            activeAudioRef.current = audio;
            audio.onended = () => {
              if (activeAudioRef.current === audio) activeAudioRef.current = null;
            };
            await audio.play();
          } catch {}
        } else {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const duration = 0.2;
          const beep = (freq: number, when: number) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = "sine";
            o.frequency.value = freq;
            o.connect(g);
            g.connect(ctx.destination);
            const t0 = ctx.currentTime + when;
            g.gain.setValueAtTime(0.001, t0);
            g.gain.exponentialRampToValueAtTime(0.3, t0 + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
            o.start(t0);
            o.stop(t0 + duration);
          };
          [880, 660, 990].forEach((f, i) => beep(f, i * 0.25));
        }
      } catch {}
    }

    if (document.visibilityState === "hidden" && (window as any).Notification && prefs.notifyOnEnd) {
      try {
        new Notification(t.timeIsUp, { body: t.timeIsUpDescription });
      } catch {}
    }

    toast.success(t.timeIsUp, {
      description: t.timeIsUpDescription,
    });
  }

  // Timer tick
  useInterval(() => {
    if (!running || targetEnd === null) return;
    const msLeft = targetEnd - Date.now();

    const secLeft = Math.ceil(msLeft / 1000);
    if (prefs.soundLast10 && secLeft > 0 && secLeft <= 10) {
      if (prevSecondRef.current !== secLeft) {
        simpleBeep(700, 0.06);
        prevSecondRef.current = secLeft;
      }
    }

    if (msLeft <= 0) {
      if (!doneNotifiedRef.current) {
        notifyDone();
        doneNotifiedRef.current = true;
      }

      if (repeat) {
        const now = Date.now();
        setTargetEnd(now + totalMs);
        setRemainingMs(totalMs);
        doneNotifiedRef.current = false;
        return;
      }

      if (prefs.countUpAfterEnd) {
        setRemainingMs(msLeft);
        return;
      }

      setRunning(false);
      setRemainingMs(0);
      return;
    }
    setRemainingMs(msLeft);
  }, running ? 200 : null);

  const start = () => {
    if (totalMs <= 0) return;
    const now = Date.now();
    setTargetEnd(now + (remainingMs === totalMs ? totalMs : remainingMs));
    setRunning(true);
    doneNotifiedRef.current = false;
  };

  const pause = () => {
    setRunning(false);
    if (targetEnd) setRemainingMs(Math.max(0, targetEnd - Date.now()));
    setTargetEnd(null);
  };

  const reset = () => {
    setRunning(false);
    setTargetEnd(null);
    setRemainingMs(totalMs);
    doneNotifiedRef.current = false;
    prevSecondRef.current = null;
    const a = activeAudioRef.current;
    if (a) {
      try { a.pause(); a.currentTime = 0; } catch {}
      activeAudioRef.current = null;
    }
  };

  const toggle = () => (running ? pause() : start());

  const setCustom = (mins: number, secs: number) => {
    const m = Math.max(0, Math.floor(mins));
    const s = Math.max(0, Math.floor(secs));
    const clampedS = Math.min(59, s);
    const next = m * 60000 + clampedS * 1000;
    setTotalMs(next);
    setRemainingMs(next);
    setRunning(false);
    setTargetEnd(null);
  };

  // Smooth adjustment with smart rounding
  const adjustMs = (delta: number) => {
    const currentSecs = Math.floor(totalMs / 1000);
    let newSecs: number;

    if (Math.abs(delta) >= 60000) { // 1 minute or more
      // Round to nearest minute, then add/subtract
      const currentMins = Math.round(currentSecs / 60);
      const deltaMins = Math.round(delta / 60000);
      newSecs = Math.max(0, (currentMins + deltaMins) * 60);
    } else { // Less than 1 minute
      // Round to nearest 30 seconds, then add/subtract
      const current30s = Math.round(currentSecs / 30) * 30;
      const delta30s = Math.round(delta / 1000 / 30) * 30;
      newSecs = Math.max(0, current30s + delta30s);
    }

    const newMs = newSecs * 1000;
    setTotalMs(newMs);
    
    if (!running) {
      setRemainingMs(newMs);
    } else if (targetEnd) {
      const adjustmentMs = newMs - totalMs;
      const newTarget = targetEnd + adjustmentMs;
      setTargetEnd(newTarget);
      setRemainingMs(Math.max(0, newTarget - Date.now()));
    }
  };

  return {
    totalMs,
    remainingMs,
    running,
    repeat,
    setRepeat,
    start,
    pause,
    reset,
    toggle,
    setCustom,
    adjustMs
  };
}