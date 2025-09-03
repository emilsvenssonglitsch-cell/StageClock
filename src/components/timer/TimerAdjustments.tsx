import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TimerAdjustmentsProps {
  onAdjust: (delta: number) => void;
}

export function TimerAdjustments({ onAdjust }: TimerAdjustmentsProps) {
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

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
      <Button 
        size="icon"
        onMouseDown={incHold.startHold} 
        onMouseUp={incHold.stopHold} 
        onMouseLeave={incHold.stopHold}
        onTouchStart={incHold.startHold} 
        onTouchEnd={incHold.stopHold}
        onClick={inc} 
        aria-label={t.increaseTime}
      >
        <Plus />
      </Button>
      <Button 
        size="icon"
        onMouseDown={decHold.startHold} 
        onMouseUp={decHold.stopHold} 
        onMouseLeave={decHold.stopHold}
        onTouchStart={decHold.startHold} 
        onTouchEnd={decHold.stopHold}
        onClick={dec} 
        aria-label={t.decreaseTime}
      >
        <Minus />
      </Button>
    </div>
  );
}