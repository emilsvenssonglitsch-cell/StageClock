import React from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTimer } from "@/components/timer/useTimer";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TimerControls } from "@/components/timer/TimerControls";
import { TimerAdjustments } from "@/components/timer/TimerAdjustments";
import { TimerNavigation } from "@/components/timer/TimerNavigation";

export default function BigTimer() {
  const { t } = useLanguage();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const {
    totalMs,
    remainingMs,
    running,
    repeat,
    setRepeat,
    toggle,
    reset,
    setCustom,
    adjustMs
  } = useTimer();

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

  // Pointer reactive gradient
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

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

  // Keyboard shortcuts
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
  }, [running, remainingMs, totalMs, repeat, toggle, reset, adjustMs, setRepeat, t, toggleFullscreen]);

  return (
    <div ref={containerRef} className={cn("min-h-screen bg-background")}>
      <TimerNavigation
        repeat={repeat}
        onRepeatChange={setRepeat}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      <main className="container pb-16">
        <section className="flex flex-col items-center gap-8">
          <article className="w-full" aria-live="polite" aria-atomic="true">
            <div className={cn(
              "relative mx-auto w-full flex items-center justify-center", 
              isFullscreen ? "max-w-none min-h-[calc(100vh-8rem)]" : "max-w-[min(92vw,1200px)] min-h-[60vh]"
            )}>
              <TimerControls
                running={running}
                onToggle={toggle}
                onReset={reset}
              />

              <TimerAdjustments onAdjust={adjustMs} />

              <TimerDisplay
                remainingMs={remainingMs}
                totalMs={totalMs}
                isFullscreen={isFullscreen}
                onTimeSet={setCustom}
              />
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}