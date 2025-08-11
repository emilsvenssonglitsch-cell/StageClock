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

  const playSound = (src?: string) => {
    if (!src) {
      toast("Ingen lyd valgt.");
      return;
    }
    const audio = new Audio(src);
    audio.play().catch(() => toast("Kunne ikke spille av lyd."));
  };

  const onPickSound = (key: 'end' | 'half' | 'oneMin') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 512 * 1024) {
      toast("Lydfilen er for stor (maks 512 kB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPrefs({
        ...prefs,
        soundSources: { ...(prefs.soundSources ?? {}), [key]: reader.result as string },
      });
      toast("Lyd importert.");
    };
    reader.readAsDataURL(file);
  };

  const onTest = (key: 'end' | 'half' | 'oneMin') => () => playSound(prefs.soundSources?.[key]);

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
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Halvveis</p>
                <p className="text-sm text-muted-foreground">Spill en lyd når halveis av satt tid er passert.</p>
              </div>
              <Switch checked={prefs.soundHalf} onCheckedChange={toggle("soundHalf")} />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">1 minutt igjen</p>
                <p className="text-sm text-muted-foreground">Spill en lyd når det gjenstår 1 minutt.</p>
              </div>
              <Switch checked={prefs.soundOneMin} onCheckedChange={toggle("soundOneMin")} />
            </div>
          </div>
        </article>

        <article>
          <h2 className="text-xl font-medium">Egendefinerte lyder</h2>
          <div className="mt-4 space-y-6">
            <div className="space-y-2">
              <p className="font-medium">Lyd når tiden er ute</p>
              <div className="flex items-center gap-3">
                <input type="file" accept="audio/*" onChange={onPickSound('end')} />
                <Button variant="secondary" onClick={onTest('end')}>Test</Button>
                <Button variant="ghost" onClick={() => setPrefs({ ...prefs, soundSources: { ...(prefs.soundSources ?? {}), end: undefined } })}>Fjern</Button>
              </div>
              <p className="text-xs text-muted-foreground">{prefs.soundSources?.end ? "Egendefinert lyd valgt" : "Standardlyd brukes hvis tilgjengelig"}</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="font-medium">Lyd ved halvveis</p>
              <div className="flex items-center gap-3">
                <input type="file" accept="audio/*" onChange={onPickSound('half')} />
                <Button variant="secondary" onClick={onTest('half')}>Test</Button>
                <Button variant="ghost" onClick={() => setPrefs({ ...prefs, soundSources: { ...(prefs.soundSources ?? {}), half: undefined } })}>Fjern</Button>
              </div>
              <p className="text-xs text-muted-foreground">{prefs.soundSources?.half ? "Egendefinert lyd valgt" : "Ingen valgt"}</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="font-medium">Lyd når 1 minutt gjenstår</p>
              <div className="flex items-center gap-3">
                <input type="file" accept="audio/*" onChange={onPickSound('oneMin')} />
                <Button variant="secondary" onClick={onTest('oneMin')}>Test</Button>
                <Button variant="ghost" onClick={() => setPrefs({ ...prefs, soundSources: { ...(prefs.soundSources ?? {}), oneMin: undefined } })}>Fjern</Button>
              </div>
              <p className="text-xs text-muted-foreground">{prefs.soundSources?.oneMin ? "Egendefinert lyd valgt" : "Ingen valgt"}</p>
            </div>
            <p className="text-xs text-muted-foreground">Tips: korte .mp3 eller .wav-filer fungerer best. Maks ca. 512 kB lagres i nettleseren.</p>
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
