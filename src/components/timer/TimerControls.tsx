import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import type { ViewportDimensions } from "@/hooks/useViewport";

interface TimerControlsProps {
  running: boolean;
  onToggle: () => void;
  onReset: () => void;
  viewport: ViewportDimensions;
  isFullscreen: boolean;
}

export function TimerControls({ running, onToggle, onReset, viewport, isFullscreen }: TimerControlsProps) {
  const { t } = useLanguage();

  const getButtonSize = () => {
    if (isFullscreen) {
      return viewport.isSmall ? "h-14 px-8 text-lg" : "h-16 px-10 text-xl";
    }
    return viewport.isSmall ? "h-10 px-4 text-sm" : "h-12 px-6 text-base";
  };

  const getIconSize = () => {
    if (isFullscreen) {
      return viewport.isSmall ? 20 : 24;
    }
    return viewport.isSmall ? 16 : 18;
  };

  const buttonSize = getButtonSize();
  const iconSize = getIconSize();

  return (
    <div className={cn(
      "absolute top-1/2 -translate-y-1/2 z-10 flex items-stretch gap-3",
      viewport.isSmall ? "left-2 flex-row" : "left-4 flex-col"
    )}>
      <Button onClick={onToggle} className={cn("rounded-full shadow-lg", buttonSize)}>
        {running ? (
          <span className="flex items-center gap-2">
            <Pause size={iconSize}/>
            {!viewport.isSmall && t.pause}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Play size={iconSize}/>
            {!viewport.isSmall && t.start}
          </span>
        )}
      </Button>
      <Button onClick={onReset} className={cn("rounded-full shadow-lg", buttonSize)} aria-label={t.reset}>
        <span className="flex items-center gap-2">
          <RotateCcw size={iconSize}/>
          {!viewport.isSmall && t.reset}
        </span>
      </Button>
    </div>
  );
}