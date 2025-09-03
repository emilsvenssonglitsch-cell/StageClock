import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Info, SlidersHorizontal, BookOpen, Maximize2, Minimize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
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

  const handleNavigation = (path: string) => {
    // Don't exit fullscreen when navigating - just navigate
    navigate(path);
  };

  return (
    <header className="w-full py-3">
      <nav className="container flex items-center justify-between text-primary">
        <div className="flex items-center gap-6">
          <button onClick={() => handleNavigation("/info")} className="flex items-center gap-2 story-link">
            <Info size={18}/> {t.info}
          </button>
          <button onClick={() => handleNavigation("/preferences")} className="flex items-center gap-2 story-link">
            <SlidersHorizontal size={18}/> {t.preferences}
          </button>
          <button onClick={() => handleNavigation("/blog")} className="flex items-center gap-2 story-link">
            <BookOpen size={18}/> {t.blog}
          </button>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm">{t.repeat}</span>
            <Switch checked={repeat} onCheckedChange={onRepeatChange} aria-label={t.repeat} />
          </div>
          <div className={cn("relative", isFullscreen && "z-[60]")}>
            <LanguageSelector />
          </div>
          <button onClick={onToggleFullscreen} className="inline-flex items-center gap-2">
            {t.fullscreen} {isFullscreen ? <Minimize2 size={18}/> : <Maximize2 size={18}/>}
          </button>
        </div>
      </nav>
    </header>
  );
}