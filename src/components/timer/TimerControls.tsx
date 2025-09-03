import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TimerControlsProps {
  running: boolean;
  onToggle: () => void;
  onReset: () => void;
}

export function TimerControls({ running, onToggle, onReset }: TimerControlsProps) {
  const { t } = useLanguage();

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex flex-col items-stretch gap-3">
      <Button onClick={onToggle} className="rounded-full h-12 px-6 text-base shadow-lg">
        {running ? (
          <span className="flex items-center gap-2"><Pause size={18}/> {t.pause}</span>
        ) : (
          <span className="flex items-center gap-2"><Play size={18}/> {t.start}</span>
        )}
      </Button>
      <Button onClick={onReset} className="rounded-full h-12 px-6 text-base shadow-lg" aria-label={t.reset}>
        <span className="flex items-center gap-2"><RotateCcw size={18}/> {t.reset}</span>
      </Button>
    </div>
  );
}