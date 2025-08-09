import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Play, Pause, RotateCcw, Maximize2, Minimize2 } from "lucide-react";
import { toast } from "sonner";

const presets = [1, 5, 10, 15, 20, 25, 30]; // minutes

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return [hours, minutes, seconds].map((v) => String(v).padStart(2, "0")).join(":");
  }
  return [minutes, seconds].map((v) => String(v).padStart(2, "0")).join(":");
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

  const minutesInput = Math.floor(totalMs / 60000);
  const secondsInput = Math.floor((totalMs % 60000) / 1000);

  const percent = React.useMemo(() => {
    if (totalMs <= 0) return 0;
    return 1 - Math.max(0, remainingMs) / totalMs;
  }, [remainingMs, totalMs]);

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
    if (msLeft <= 0) {
      setRunning(false);
      setRemainingMs(0);
      notifyDone();
      return;
    }
    setRemainingMs(msLeft);
  }, running ? 200 : null);

  const start = () => {
    if (totalMs <= 0) return;
    const now = Date.now();
    setTargetEnd(now + (remainingMs === totalMs ? totalMs : remainingMs));
    setRunning(true);
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
      if (e.key.toLowerCase() === "r") {
        reset();
      }
      if (e.key.toLowerCase() === "f") {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, remainingMs, totalMs]);

  function notifyDone() {
    // WebAudio beep
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
      // three quick beeps
      [880, 660, 990].forEach((f, i) => beep(f, i * 0.25));
    } catch {}

    toast.success("Tiden er ute!", {
      description: "Trykk R for å nullstille, eller start på nytt.",
    });
  }

  const ringStyle = {
    ["--progress" as any]: `${percent * 360}deg`,
  } as React.CSSProperties;

  return (
    <div ref={containerRef} className={cn("min-h-screen bg-background bg-hero")}>      
      <header className="container py-8">
        <nav className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Stor nedtellingstimer
          </h1>
          <div className="hidden sm:flex gap-2">
            {presets.map((m) => (
              <Button key={m} variant="secondary" onClick={() => setCustom(m, 0)} aria-label={`Sett ${m} minutter`}>
                {m}m
              </Button>
            ))}
          </div>
        </nav>
      </header>

      <main className="container pb-16">
        <section className="flex flex-col items-center gap-8">
          <article className="w-full max-w-4xl" aria-live="polite" aria-atomic="true">
            <div className={cn("relative aspect-square mx-auto w-full max-w-[min(80vw,700px)]")}>              
              <div className={cn("timer-ring rounded-full p-2 transition-[box-shadow] duration-300", running ? "animate-glow" : "")}
                   style={ringStyle}
                   aria-hidden>
                <div className="rounded-full bg-card/70 backdrop-blur-sm border border-border flex items-center justify-center h-full">
                  <div className="text-center select-none">
                    <div className="text-6xl md:text-8xl lg:text-9xl font-bold tabular-nums tracking-tight">
                      {formatTime(remainingMs)}
                    </div>
                    <div className="mt-2 text-muted-foreground">{running ? "Pågår" : "Klar"}</div>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <article className="w-full max-w-3xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm mb-1">Minutter</label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  disabled={running}
                  value={minutesInput}
                  onChange={(e) => setCustom(Number(e.target.value || 0), secondsInput)}
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm mb-1">Sekunder</label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={59}
                  disabled={running}
                  value={secondsInput}
                  onChange={(e) => setCustom(minutesInput, Number(e.target.value || 0))}
                />
              </div>
              <Button onClick={toggle} className="h-12 text-base">
                {running ? (
                  <span className="flex items-center gap-2"><Pause size={18}/> Pause</span>
                ) : (
                  <span className="flex items-center gap-2"><Play size={18}/> Start</span>
                )}
              </Button>
              <Button variant="secondary" onClick={reset} className="h-12 text-base">
                <span className="flex items-center gap-2"><RotateCcw size={18}/> Nullstill</span>
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={toggleFullscreen} aria-label="Fullskjerm">
                <span className="flex items-center gap-2">
                  {document.fullscreenElement ? <Minimize2 size={16}/> : <Maximize2 size={16}/>}
                  Fullskjerm (F)
                </span>
              </Button>
              <div className="sm:hidden flex gap-2">
                {presets.slice(0,4).map((m) => (
                  <Button key={m} variant="secondary" onClick={() => setCustom(m, 0)} aria-label={`Sett ${m} minutter`}>
                    {m}m
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground ml-auto">Mellomrom: start/pause · R: nullstill · F: fullskjerm</p>
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
