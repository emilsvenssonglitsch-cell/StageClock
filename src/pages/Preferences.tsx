import React from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTimerPreferences, ensureNotificationPermission } from "@/components/timer/useTimerPreferences";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { getAudioUrl, saveAudio, deleteAudio } from "@/lib/audioStore";
import { useLanguage } from "@/contexts/LanguageContext";

const PreferencesPage = () => {
  const [prefs, setPrefs] = useTimerPreferences();
  const { t } = useLanguage();

  React.useEffect(() => {
    document.title = `${t.preferencesTitle} – StageClock`;
  }, [t.preferencesTitle]);

  const toggle = (key: keyof typeof prefs) => (val: boolean) => {
    setPrefs({ ...prefs, [key]: val });
  };

  const onToggleNotifications = async (val: boolean) => {
    if (val) {
      const ok = await ensureNotificationPermission();
      if (!ok) {
        toast(t.allowNotifications);
        setPrefs({ ...prefs, notifyOnEnd: false });
        return;
      }
    }
    setPrefs({ ...prefs, notifyOnEnd: val });
  };

  const playSoundDirect = async (key: 'end' | 'half' | 'oneMin') => {
    const url = await getAudioUrl(key);
    if (!url) {
      toast(t.noCustomSound);
      return;
    }
    const audio = new Audio(url);
    audio.play().catch(() => toast(t.couldNotPlaySound));
  };

  const onPickSound = (key: 'end' | 'half' | 'oneMin') => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await saveAudio(key, file);
      // Mark as present in prefs using a tiny marker string (no big data in LS)
      const nextSources = { ...(prefs.soundSources ?? {}), [key]: 'idb' } as any;
      setPrefs({ ...prefs, soundSources: nextSources });
      toast(t.soundImported);
    } catch (err) {
      console.error(err);
      toast(t.couldNotSaveSound);
    }
  };

  const onTest = (key: 'end' | 'half' | 'oneMin') => () => playSoundDirect(key);

  return (
    <main className="container py-10">
      <header className="mb-8 flex items-center gap-3">
        <Button asChild variant="ghost">
          <Link to="/">{t.back}</Link>
        </Button>
        <h1 className="text-3xl font-semibold tracking-tight">{t.preferencesTitle}</h1>
      </header>

      <section className="max-w-2xl space-y-8 animate-fade-in">
        <article>
          <h2 className="text-xl font-medium">{t.playSound}</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{t.whenTimeIsUp}</p>
                <p className="text-sm text-muted-foreground">{t.whenTimeIsUpDescription}</p>
              </div>
              <Switch checked={prefs.soundEnd} onCheckedChange={toggle("soundEnd")} />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{t.last10Seconds}</p>
                <p className="text-sm text-muted-foreground">{t.last10SecondsDescription}</p>
              </div>
              <Switch checked={prefs.soundLast10} onCheckedChange={toggle("soundLast10")} />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{t.halfway}</p>
                <p className="text-sm text-muted-foreground">{t.halfwayDescription}</p>
              </div>
              <Switch checked={prefs.soundHalf} onCheckedChange={toggle("soundHalf")} />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{t.oneMinuteLeft}</p>
                <p className="text-sm text-muted-foreground">{t.oneMinuteLeftDescription}</p>
              </div>
              <Switch checked={prefs.soundOneMin} onCheckedChange={toggle("soundOneMin")} />
            </div>
          </div>
        </article>

        <article>
          <h2 className="text-xl font-medium">{t.customSounds}</h2>
          <div className="mt-4 space-y-6">
            <div className="space-y-2">
              <p className="font-medium">{t.soundWhenTimeIsUp}</p>
              <div className="flex items-center gap-3">
                <input type="file" accept="audio/*" onChange={onPickSound('end')} />
                <Button variant="secondary" onClick={onTest('end')}>{t.test}</Button>
                <Button variant="ghost" onClick={async () => { await deleteAudio('end'); setPrefs({ ...prefs, soundSources: { ...(prefs.soundSources ?? {}), end: undefined } }); toast(t.soundRemoved); }}>{t.remove}</Button>
              </div>
              <p className="text-xs text-muted-foreground">{prefs.soundSources?.end ? t.customSoundSelected : t.defaultSoundUsed}</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="font-medium">{t.soundHalfway}</p>
              <div className="flex items-center gap-3">
                <input type="file" accept="audio/*" onChange={onPickSound('half')} />
                <Button variant="secondary" onClick={onTest('half')}>{t.test}</Button>
                <Button variant="ghost" onClick={async () => { await deleteAudio('half'); setPrefs({ ...prefs, soundSources: { ...(prefs.soundSources ?? {}), half: undefined } }); toast(t.soundRemoved); }}>{t.remove}</Button>
              </div>
              <p className="text-xs text-muted-foreground">{prefs.soundSources?.half ? t.customSoundSelected : t.noSoundSelected}</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="font-medium">{t.soundOneMinute}</p>
              <div className="flex items-center gap-3">
                <input type="file" accept="audio/*" onChange={onPickSound('oneMin')} />
                <Button variant="secondary" onClick={onTest('oneMin')}>{t.test}</Button>
                <Button variant="ghost" onClick={async () => { await deleteAudio('oneMin'); setPrefs({ ...prefs, soundSources: { ...(prefs.soundSources ?? {}), oneMin: undefined } }); toast(t.soundRemoved); }}>{t.remove}</Button>
              </div>
              <p className="text-xs text-muted-foreground">{prefs.soundSources?.oneMin ? t.customSoundSelected : t.noSoundSelected}</p>
            </div>
            <p className="text-xs text-muted-foreground">{t.soundStorageNote}</p>
          </div>
        </article>

        <article>
          <h2 className="text-xl font-medium">{t.afterTimeIsUp}</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{t.countUp}</p>
                <p className="text-sm text-muted-foreground">{t.countUpDescription}</p>
              </div>
              <Switch checked={prefs.countUpAfterEnd} onCheckedChange={toggle("countUpAfterEnd")} />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{t.showNotifications}</p>
                <p className="text-sm text-muted-foreground">{t.showNotificationsDescription}</p>
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
