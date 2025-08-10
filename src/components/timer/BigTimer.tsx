import React from "react";
import { Button } from "@/components/ui/button";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Play, Pause, Maximize2, Minimize2, Plus, Minus, Info, SlidersHorizontal, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useTimerPreferences } from "@/components/timer/useTimerPreferences";



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
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [totalMs, setTotalMs] = React.useState(5 * 60 * 1000);
  const [remainingMs, setRemainingMs] = React.useState(totalMs);
  const [running, setRunning] = React.useState(false);
  const [targetEnd, setTargetEnd] = React.useState<number | null>(null);
  const [repeat, setRepeat] = React.useState<boolean>(() => localStorage.getItem("timer:repeat") === "1");
  const [prefs] = useTimerPreferences();
  const doneNotifiedRef = React.useRef(false);
  const prevSecondRef = React.useRef<number | null>(null);

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
      toast("Fullskjerm på");
    } else {
      await document.exitFullscreen().catch(() => {});
      toast("Fullskjerm av");
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
      toast(`Gjenta ${!repeat ? "på" : "av"}`);
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

function notifyDone() {
  if (prefs.soundEnd) {
    try {
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
    } catch {}
  }

  if (document.visibilityState === "hidden" && (window as any).Notification && prefs.notifyOnEnd) {
    try {
      new Notification("Tiden er ute!", { body: "Trykk R for å nullstille, eller start på nytt." });
    } catch {}
  }

  toast.success("Tiden er ute!", {
    description: "Trykk R for å nullstille, eller start på nytt.",
  });
}

/* ring style removed */

  const adjustMs = (delta: number) => {
    const nextTotal = Math.max(0, totalMs + delta);
    setTotalMs(nextTotal);
    if (running && targetEnd) {
      const now = Date.now();
      const newTarget = targetEnd + delta;
      setTargetEnd(newTarget);
      setRemainingMs(Math.max(-nextTotal, newTarget - now));
    } else {
      setRemainingMs(Math.max(0, remainingMs + delta));
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
  const dMin = Math.floor(absSec / 60);
  const dSec = absSec % 60;

  return (
    <div ref={containerRef} className={cn("min-h-screen bg-background")}>
      <header className="w-full py-3">
        <nav className="container flex items-center justify-between text-primary">
          <div className="flex items-center gap-6">
            <Link to="/info" className="flex items-center gap-2 story-link"><Info size={18}/> Info</Link>
            <Link to="/preferences" className="flex items-center gap-2 story-link"><SlidersHorizontal size={18}/> Preferences</Link>
            <Link to="/blog" className="flex items-center gap-2 story-link"><BookOpen size={18}/> Blog</Link>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm">Repeat</span>
              <Switch checked={repeat} onCheckedChange={(v) => setRepeat(v)} aria-label="Repeat" />
            </div>
            <button onClick={toggleFullscreen} className="inline-flex items-center gap-2">
              Fullscreen {document.fullscreenElement ? <Minimize2 size={18}/> : <Maximize2 size={18}/>}
            </button>
          </div>
        </nav>
      </header>

      <main className="container pb-16">
        <section className="flex flex-col items-center gap-8">
          <article className="w-full" aria-live="polite" aria-atomic="true">
            <div className="relative mx-auto w-full max-w-[min(92vw,1200px)] min-h-[60vh] flex items-center justify-center">
              {/* Start/Pause floating control (left) */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <Button onClick={toggle} className="rounded-full h-12 px-6 text-base shadow-lg">
                  {running ? (
                    <span className="flex items-center gap-2"><Pause size={18}/> Pause</span>
                  ) : (
                    <span className="flex items-center gap-2"><Play size={18}/> Start</span>
                  )}
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
                      <Button size="icon" variant="secondary"
                        onMouseDown={incHold.startHold} onMouseUp={incHold.stopHold} onMouseLeave={incHold.stopHold}
                        onTouchStart={incHold.startHold} onTouchEnd={incHold.stopHold}
                        onClick={inc} aria-label="Increase time">
                        <Plus />
                      </Button>
                      <Button size="icon" variant="secondary"
                        onMouseDown={decHold.startHold} onMouseUp={decHold.stopHold} onMouseLeave={decHold.stopHold}
                        onTouchStart={decHold.startHold} onTouchEnd={decHold.stopHold}
                        onClick={dec} aria-label="Decrease time">
                        <Minus />
                      </Button>
                    </>
                  );
                })()}
              </div>

              {/* Time display */}
              <div className="select-none text-foreground">
                <div className="flex items-end gap-6">
                  <div className="text-center">
                    <div className="font-bold leading-none tabular-nums tracking-tight text-[clamp(4rem,22vw,18rem)]">{dMin}</div>
                    <div className="mt-3 text-sm opacity-80">Minutes</div>
                  </div>
                  <div className="font-bold leading-none tabular-nums text-[clamp(4rem,22vw,18rem)]">:</div>
                  <div className="text-center">
                    <div className="font-bold leading-none tabular-nums tracking-tight text-[clamp(4rem,22vw,18rem)]">{String(dSec).padStart(2, '0')}</div>
                    <div className="mt-3 text-sm opacity-80">Seconds</div>
                  </div>
                </div>
              </div>
            </div>
          </article>

        </section>
      </main>

      <footer className="container pb-8 text-center text-sm text-muted-foreground">
        Inspirert av BigTimer. Ingen tilknytning.
      </footer>
    </div>
  );
}
