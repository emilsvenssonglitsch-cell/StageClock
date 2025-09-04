import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Info, SlidersHorizontal, BookOpen, Maximize2, Minimize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useViewport } from "@/hooks/useViewport";
import { cn } from "@/lib/utils";

interface TimerNavigationProps {
  repeat: boolean;
  onRepeatChange: (repeat: boolean) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function TimerNavigation({ repeat, onRepeatChange, isFullscreen, onToggleFullscreen }: TimerNavigationProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const viewport = useViewport();

  const handleNavigation = (path: string) => {
    // Don't exit fullscreen when navigating - just navigate
    navigate(path);
  };

  return (
    <header className={cn(
      "w-full py-3",
      isFullscreen && "absolute top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm"
    )}>
      <nav className={cn(
        "container flex items-center justify-between text-primary",
        viewport.isSmall && "flex-col gap-4",
        isFullscreen && viewport.isSmall && "px-4"
      )}>
        <div className={cn(
          "flex items-center",
          viewport.isSmall ? "gap-4" : "gap-6"
        )}>
          <button onClick={() => handleNavigation("/info")} className="flex items-center gap-2 story-link">
            <Info size={viewport.isSmall ? 16 : 18}/> 
            {!viewport.isSmall && t.info}
          </button>
          <button onClick={() => handleNavigation("/preferences")} className="flex items-center gap-2 story-link">
            <SlidersHorizontal size={viewport.isSmall ? 16 : 18}/> 
            {!viewport.isSmall && t.preferences}
          </button>
          <button onClick={() => handleNavigation("/blog")} className="flex items-center gap-2 story-link">
            <BookOpen size={viewport.isSmall ? 16 : 18}/> 
            {!viewport.isSmall && t.blog}
          </button>
        </div>
        <div className={cn(
          "flex items-center",
          viewport.isSmall ? "gap-4" : "gap-6"
        )}>
          <div className="flex items-center gap-2">
            {!viewport.isSmall && <span className="text-sm">{t.repeat}</span>}
            <Switch checked={repeat} onCheckedChange={onRepeatChange} aria-label={t.repeat} />
          </div>
          <div className={cn("relative", isFullscreen && "z-[60]")}>
            <LanguageSelector />
          </div>
          <button onClick={onToggleFullscreen} className="inline-flex items-center gap-2">
            {!viewport.isSmall && t.fullscreen} 
            {isFullscreen ? 
              <Minimize2 size={viewport.isSmall ? 16 : 18}/> : 
              <Maximize2 size={viewport.isSmall ? 16 : 18}/>
            }
          </button>
        </div>
      </nav>
    </header>
  );
}