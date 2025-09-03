import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Play, Pause, Maximize2, Minimize2, Plus, Minus, Info, SlidersHorizontal, BookOpen, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useTimerPreferences } from "@/components/timer/useTimerPreferences";
import { getAudioUrl } from "@/lib/audioStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";



function formatTime(ms: number, allowNegative = false) {
  const neg = ms < 0;
  const totalSeconds = Math.floor(Math.abs(ms) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const str = hours > 0
    ? [hours, minutes, seconds].map((v) => String(v).padStart(2, "0")).join(":")
    : [minutes, seconds].map((v) => String(v).padStart(2, "0")).join(":");
  return allowNegative && neg ? `+${str}` : str;
}

// Always return HH:MM:SS with leading zeros (used when entering edit mode)
function formatHMS(ms: number) {
  const totalSeconds = Math.floor(Math.max(0, Math.abs(ms)) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((v) => String(v).padStart(2, "0"))
    .join(":");
}

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

export default function BigTimer() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [totalMs, setTotalMs] = React.useState(5 * 60 * 1000);
  const [remainingMs, setRemainingMs] = React.useState(totalMs);
  const [running, setRunning] = React.useState(false);
  const [targetEnd, setTargetEnd] = React.useState<number | null>(null);
  const [repeat, setRepeat] = React.useState<boolean>(() => localStorage.getItem("timer:repeat") === "1");
  const [prefs] = useTimerPreferences();
  const doneNotifiedRef = React.useRef(false);
  const prevSecondRef = React.useRef<number | null>(null);

  // Track fullscreen state for responsive scaling
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  React.useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    handleFsChange();
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Active custom audio instance
  const activeAudioRef = React.useRef<HTMLAudioElement | null>(null);

  // Inline time edit state
  const [editing, setEditing] = React.useState(false);
  const [timeInput, setTimeInput] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    localStorage.setItem("timer:repeat", repeat ? "1" : "0");
  }, [repeat]);

  const minutesInput = Math.floor(totalMs / 60000);
  const secondsInput = Math.floor((totalMs % 60000) / 1000);

/* progress ring removed */

  // Pointer reactive gradient
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

// Timer tick
useInterval(() => {
  if (!running || targetEnd === null) return;
  const msLeft = targetEnd - Date.now();

  // last 10 seconds short beep
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
      doneNotifiedRef.current = false; // for next cycle
      return;
    }

    if (prefs.countUpAfterEnd) {
      setRemainingMs(msLeft); // negative, will show as +time
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
  // Stop any playing custom audio
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

  const toggleFullscreen = async () => {
    const el = containerRef.current ?? document.documentElement;
    if (!document.fullscreenElement) {
      await el.requestFullscreen().catch(() => {});
      toast(t.fullscreenOn);
    } else {
      await document.exitFullscreen().catch(() => {});
      toast(t.fullscreenOff);
    }
  };

React.useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === " ") {
      e.preventDefault();
      toggle();
    }
    if (e.key.toLowerCase() === "r" && !e.shiftKey) {
      reset();
    }
    if (e.key.toLowerCase() === "f") {
      toggleFullscreen();
    }
    if (e.key.toLowerCase() === "r" && e.shiftKey) {
      setRepeat((v) => !v);
      toast(`${t.repeat} ${!repeat ? t.repeatOn : t.repeatOff}`);
    }
    if (e.key === "ArrowUp") {
      adjustMs(60_000);
    }
    if (e.key === "ArrowDown") {
      adjustMs(-60_000);
    }
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [running, remainingMs, totalMs, repeat]);

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

async function notifyDone() {
  if (prefs.soundEnd) {
    try {
      // Try custom stored sound first
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
        // Fallback to simple beeps
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const duration = 0.2; // seconds per beep
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

/* ring style removed */

  const adjustMs = (delta: number) => {
    const nextTotal = Math.max(0, totalMs + delta);
    setTotalMs(nextTotal);
    
    // If timer is not running, just update remaining time to match total
    if (!running) {
      setRemainingMs(nextTotal);
      return;
    }
    
    // If running, adjust the target end time
    if (targetEnd) {
      const newTarget = targetEnd + delta;
      setTargetEnd(newTarget);
      setRemainingMs(Math.max(0, newTarget - Date.now()));
    }
  };

  // hold helper
  const useHold = (fn: () => void, interval = 120) => {
    const t = React.useRef<number | null>(null);
    const startHold = () => {
      fn();
      t.current = window.setInterval(fn, interval);
    };
    const stopHold = () => {
      if (t.current) {
        clearInterval(t.current);
        t.current = null;
      }
    };
    return { startHold, stopHold } as const;
  };

  const absSec = Math.abs(Math.floor(remainingMs / 1000));
  const dHour = Math.floor(absSec / 3600);
  const dMin = dHour > 0 ? Math.floor((absSec % 3600) / 60) : Math.floor(absSec / 60);
  const dSec = absSec % 60;

  // Time input parsing and handlers
  const parseTimeInput = (raw: string): number | null => {
    const t = raw.trim().replace(/,/g, ":").replace(/\s+/g, "");
    if (!t) return null;
    const parts = t.split(":").map((p) => Number(p));
    if (parts.some((n) => Number.isNaN(n) || n < 0)) return null;

    let seconds = 0;
    if (parts.length === 3) {
      const [h, m, s] = parts;
      if (m > 59 || s > 59) return null;
      seconds = h * 3600 + m * 60 + s;
    } else if (parts.length === 2) {
      const [m, s] = parts;
      if (s > 59) return null;
      seconds = m * 60 + s;
    } else if (parts.length === 1) {
      // Plain number -> minutes
      seconds = parts[0] * 60;
    } else {
      return null;
    }
    return Math.max(0, seconds * 1000);
  };

  const startEditing = () => {
    setRunning(false);
    setEditing(true);
    setTimeInput(formatHMS(totalMs));
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitEditing = () => {
    const ms = parseTimeInput(timeInput);
    if (ms !== null) {
      const mins = Math.floor(ms / 60000);
      const secs = Math.floor((ms % 60000) / 1000);
      setCustom(mins, secs);
    } else {
      toast.error(t.invalidTimeFormat);
    }
    setEditing(false);
  };

  const cancelEditing = () => {
    setEditing(false);
  };

  // Keep proportional sizing in fullscreen - same as normal mode
  const timeSize = 'text-[clamp(3.5rem,18vw,14rem)]';
  
  const handleNavigation = (path: string) => {
    if (isFullscreen) {
      document.exitFullscreen().then(() => navigate(path)).catch(() => navigate(path));
    } else {
      navigate(path);
    }
  };
  
  return (
    <div ref={containerRef} className={cn("min-h-screen bg-background")}>
      <header className="w-full py-3">
        <nav className="container flex items-center justify-between text-primary">
          <div className="flex items-center gap-6">
            <button onClick={() => handleNavigation("/info")} className="flex items-center gap-2 story-link"><Info size={18}/> {t.info}</button>
            <button onClick={() => handleNavigation("/preferences")} className="flex items-center gap-2 story-link"><SlidersHorizontal size={18}/> {t.preferences}</button>
            <button onClick={() => handleNavigation("/blog")} className="flex items-center gap-2 story-link"><BookOpen size={18}/> {t.blog}</button>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm">{t.repeat}</span>
              <Switch checked={repeat} onCheckedChange={(v) => setRepeat(v)} aria-label={t.repeat} />
            </div>
            <LanguageSelector />
            <button onClick={toggleFullscreen} className="inline-flex items-center gap-2">
              {t.fullscreen} {isFullscreen ? <Minimize2 size={18}/> : <Maximize2 size={18}/>}
            </button>
          </div>
        </nav>
      </header>

      <main className="container pb-16">
        <section className="flex flex-col items-center gap-8">
          <article className="w-full" aria-live="polite" aria-atomic="true">
            <div className={cn("relative mx-auto w-full flex items-center justify-center", isFullscreen ? "max-w-none min-h-[calc(100vh-8rem)]" : "max-w-[min(92vw,1200px)] min-h-[60vh]")}>
              {/* Start/Pause + Reset floating controls (left) */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex flex-col items-stretch gap-3">
                <Button onClick={toggle} className="rounded-full h-12 px-6 text-base shadow-lg">
                  {running ? (
                    <span className="flex items-center gap-2"><Pause size={18}/> {t.pause}</span>
                  ) : (
                    <span className="flex items-center gap-2"><Play size={18}/> {t.start}</span>
                  )}
                </Button>
                <Button onClick={reset} className="rounded-full h-12 px-6 text-base shadow-lg" aria-label={t.reset}>
                  <span className="flex items-center gap-2"><RotateCcw size={18}/> {t.reset}</span>
                </Button>
              </div>

              {/* +/- floating controls (right) */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
                {(() => {
                  const inc = () => adjustMs(60_000);
                  const dec = () => adjustMs(-60_000);
                  const incHold = useHold(() => adjustMs(10_000));
                  const decHold = useHold(() => adjustMs(-10_000));
                  return (
                    <>
                      <Button size="icon"
                        onMouseDown={incHold.startHold} onMouseUp={incHold.stopHold} onMouseLeave={incHold.stopHold}
                        onTouchStart={incHold.startHold} onTouchEnd={incHold.stopHold}
                        onClick={inc} aria-label={t.increaseTime}>
                        <Plus />
                      </Button>
                      <Button size="icon"
                        onMouseDown={decHold.startHold} onMouseUp={decHold.stopHold} onMouseLeave={decHold.stopHold}
                        onTouchStart={decHold.startHold} onTouchEnd={decHold.stopHold}
                        onClick={dec} aria-label={t.decreaseTime}>
                        <Minus />
                      </Button>
                    </>
                  );
                })()}
              </div>

              {/* Time display */}
              <div className="select-none text-foreground">
                 {editing ? (
                   <div className={cn("flex items-end justify-center", timeSize)}>
                     <Input
                       ref={inputRef}
                       value={timeInput}
                       onChange={(e) => setTimeInput(e.target.value)}
                       onBlur={commitEditing}
                       onKeyDown={(e) => {
                         if (e.key === "Enter") {
                           e.preventDefault();
                           commitEditing();
                         }
                         if (e.key === "Escape") {
                           e.preventDefault();
                           cancelEditing();
                         }
                       }}
                       aria-label={t.setTime}
                       placeholder={t.timeFormat}
                       className="h-auto w-full border-0 bg-transparent text-center font-bold leading-none tabular-nums focus-visible:ring-0 tracking-tight text-inherit"
                     />
                   </div>
                ) : (
                  <button
                    type="button"
                    onClick={startEditing}
                    aria-label={t.editTime}
                    title={t.editTime}
                    className="block"
                  >
                    <div className="flex items-end gap-6">
                      {dHour > 0 && (
                        <>
                          <div className="text-center">
                            <div className={cn("font-bold leading-none tabular-nums", isFullscreen ? "tracking-tighter" : "tracking-tight", timeSize)}>{String(dHour).padStart(2, '0')}</div>
                            <div className={cn("mt-3 text-sm opacity-80", isFullscreen && "hidden")}>{t.hours}</div>
                          </div>
                          <div className={cn("font-bold leading-none tabular-nums", timeSize)}>:</div>
                        </>
                      )}
                      <div className="text-center">
                        <div className={cn("font-bold leading-none tabular-nums", isFullscreen ? "tracking-tighter" : "tracking-tight", timeSize)}>{dHour > 0 ? String(dMin).padStart(2, '0') : dMin}</div>
                        <div className={cn("mt-3 text-sm opacity-80", isFullscreen && "hidden")}>{t.minutes}</div>
                      </div>
                      <div className={cn("font-bold leading-none tabular-nums", timeSize)}>:</div>
                      <div className="text-center">
                        <div className={cn("font-bold leading-none tabular-nums", isFullscreen ? "tracking-tighter" : "tracking-tight", timeSize)}>{String(dSec).padStart(2, '0')}</div>
                        <div className={cn("mt-3 text-sm opacity-80", isFullscreen && "hidden")}>{t.seconds}</div>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </article>

        </section>
      </main>

    </div>
  );
}
