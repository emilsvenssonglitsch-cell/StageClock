import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import type { ViewportDimensions } from "@/hooks/useViewport";

interface TimerAdjustmentsProps {
  onAdjust: (delta: number) => void;
  viewport: ViewportDimensions;
  isFullscreen: boolean;
}

export function TimerAdjustments({ onAdjust, viewport, isFullscreen }: TimerAdjustmentsProps) {
  const { t } = useLanguage();

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

  const inc = () => onAdjust(60_000);
  const dec = () => onAdjust(-60_000);
  const incHold = useHold(() => onAdjust(10_000));
  const decHold = useHold(() => onAdjust(-10_000));

  const getButtonSize = () => {
    if (isFullscreen) {
      return viewport.isSmall ? "h-12 w-12" : "h-14 w-14";
    }
    return viewport.isSmall ? "h-8 w-8" : "h-10 w-10";
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
      "absolute top-1/2 -translate-y-1/2 z-10 flex gap-3",
      viewport.isSmall ? "right-2 flex-row" : "right-4 flex-col"
    )}>
      <Button 
        className={cn("rounded-full", buttonSize)}
        onMouseDown={incHold.startHold} 
        onMouseUp={incHold.stopHold} 
        onMouseLeave={incHold.stopHold}
        onTouchStart={incHold.startHold} 
        onTouchEnd={incHold.stopHold}
        onClick={inc} 
        aria-label={t.increaseTime}
      >
        <Plus size={iconSize} />
      </Button>
      <Button 
        className={cn("rounded-full", buttonSize)}
        onMouseDown={decHold.startHold} 
        onMouseUp={decHold.stopHold} 
        onMouseLeave={decHold.stopHold}
        onTouchStart={decHold.startHold} 
        onTouchEnd={decHold.stopHold}
        onClick={dec} 
        aria-label={t.decreaseTime}
      >
        <Minus size={iconSize} />
      </Button>
    </div>
  );
}