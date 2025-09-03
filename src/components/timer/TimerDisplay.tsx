import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

function formatHMS(ms: number) {
  const totalSeconds = Math.floor(Math.max(0, Math.abs(ms)) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((v) => String(v).padStart(2, "0"))
    .join(":");
}

interface TimerDisplayProps {
  remainingMs: number;
  totalMs: number;
  isFullscreen: boolean;
  onTimeSet: (mins: number, secs: number) => void;
}

export function TimerDisplay({ remainingMs, totalMs, isFullscreen, onTimeSet }: TimerDisplayProps) {
  const { t } = useLanguage();
  const [editing, setEditing] = React.useState(false);
  const [timeInput, setTimeInput] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const timeSize = 'text-[clamp(3.5rem,18vw,14rem)]';

  const absSec = Math.abs(Math.floor(remainingMs / 1000));
  const dHour = Math.floor(absSec / 3600);
  const dMin = dHour > 0 ? Math.floor((absSec % 3600) / 60) : Math.floor(absSec / 60);
  const dSec = absSec % 60;

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
      seconds = parts[0] * 60;
    } else {
      return null;
    }
    return Math.max(0, seconds * 1000);
  };

  const startEditing = () => {
    setEditing(true);
    setTimeInput(formatHMS(totalMs));
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitEditing = () => {
    const ms = parseTimeInput(timeInput);
    if (ms !== null) {
      const mins = Math.floor(ms / 60000);
      const secs = Math.floor((ms % 60000) / 1000);
      onTimeSet(mins, secs);
    } else {
      toast.error(t.invalidTimeFormat);
    }
    setEditing(false);
  };

  const cancelEditing = () => {
    setEditing(false);
  };

  return (
    <div className="select-none text-foreground">
      {editing ? (
        <div className={cn("flex items-center justify-center", timeSize)}>
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
            className={cn(
              "h-auto w-full max-w-[8ch] border-0 bg-transparent text-center font-bold leading-none tabular-nums focus-visible:ring-0 tracking-tight text-inherit",
              timeSize
            )}
            style={{ fontSize: 'inherit' }}
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
                  <div className={cn("font-bold leading-none tabular-nums", isFullscreen ? "tracking-tighter" : "tracking-tight", timeSize)}>
                    {String(dHour).padStart(2, '0')}
                  </div>
                  <div className={cn("mt-3 text-sm opacity-80", isFullscreen && "hidden")}>{t.hours}</div>
                </div>
                <div className={cn("font-bold leading-none tabular-nums", timeSize)}>:</div>
              </>
            )}
            <div className="text-center">
              <div className={cn("font-bold leading-none tabular-nums", isFullscreen ? "tracking-tighter" : "tracking-tight", timeSize)}>
                {dHour > 0 ? String(dMin).padStart(2, '0') : dMin}
              </div>
              <div className={cn("mt-3 text-sm opacity-80", isFullscreen && "hidden")}>{t.minutes}</div>
            </div>
            <div className={cn("font-bold leading-none tabular-nums", timeSize)}>:</div>
            <div className="text-center">
              <div className={cn("font-bold leading-none tabular-nums", isFullscreen ? "tracking-tighter" : "tracking-tight", timeSize)}>
                {String(dSec).padStart(2, '0')}
              </div>
              <div className={cn("mt-3 text-sm opacity-80", isFullscreen && "hidden")}>{t.seconds}</div>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}