import React from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTimerPreferences, ensureNotificationPermission } from "@/components/timer/useTimerPreferences";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const PreferencesPage = () => {
  const [prefs, setPrefs] = useTimerPreferences();

  React.useEffect(() => {
    document.title = "Preferanser – Stor nedtellingstimer";
  }, []);

  const toggle = (key: keyof typeof prefs) => (val: boolean) => {
    setPrefs({ ...prefs, [key]: val });
  };

  const onToggleNotifications = async (val: boolean) => {
    if (val) {
      const ok = await ensureNotificationPermission();
      if (!ok) {
        toast("Tillat varsler i nettleseren for å bruke denne funksjonen.");
        setPrefs({ ...prefs, notifyOnEnd: false });
        return;
      }
    }
    setPrefs({ ...prefs, notifyOnEnd: val });
  };

  return (
    <main className="container py-10">
      <header className="mb-8 flex items-center gap-3">
        <Button asChild variant="ghost">
          <Link to="/">← Tilbake</Link>
        </Button>
        <h1 className="text-3xl font-semibold tracking-tight">Preferanser</h1>
      </header>

      <section className="max-w-2xl space-y-8 animate-fade-in">
        <article>
          <h2 className="text-xl font-medium">Spill av lyd</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Når tiden er ute</p>
                <p className="text-sm text-muted-foreground">Spill en lyd når nedtellingen når 0.</p>
              </div>
              <Switch checked={prefs.soundEnd} onCheckedChange={toggle("soundEnd")} />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Siste 10 sekunder</p>
                <p className="text-sm text-muted-foreground">Pip for hvert sekund de siste 10 sekundene.</p>
              </div>
              <Switch checked={prefs.soundLast10} onCheckedChange={toggle("soundLast10")} />
            </div>
          </div>
        </article>

        <article>
          <h2 className="text-xl font-medium">Når tiden er ute</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Tell opp</p>
                <p className="text-sm text-muted-foreground">Fortsett å telle opp etter at tiden er ute.</p>
              </div>
              <Switch checked={prefs.countUpAfterEnd} onCheckedChange={toggle("countUpAfterEnd")} />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Vis varsler</p>
                <p className="text-sm text-muted-foreground">Vis nettleservarsel når timeren er ferdig i bakgrunnen.</p>
              </div>
              <Switch checked={prefs.notifyOnEnd} onCheckedChange={onToggleNotifications} />
            </div>
          </div>
        </article>
      </section>
    </main>
  );
};

export default PreferencesPage;
