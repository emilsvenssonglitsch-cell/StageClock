import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'no' | 'en' | 'sv';

interface Translations {
  // Navigation
  info: string;
  preferences: string;
  blog: string;
  back: string;
  
  // Timer
  start: string;
  pause: string;
  reset: string;
  repeat: string;
  fullscreen: string;
  hours: string;
  minutes: string;
  seconds: string;
  
  // Timer messages
  timeIsUp: string;
  timeIsUpDescription: string;
  fullscreenOn: string;
  fullscreenOff: string;
  repeatOn: string;
  repeatOff: string;
  
  // Time input
  editTime: string;
  setTime: string;
  timeFormat: string;
  invalidTimeFormat: string;
  increaseTime: string;
  decreaseTime: string;
  
  // Language selector
  language: string;
  norwegian: string;
  english: string;
  swedish: string;

  // Info page
  aboutTitle: string;
  aboutDescription1: string;
  aboutDescription2: string;
  aboutDescription3: string;
  keyboardShortcuts: string;
  keyboardShortcutSpace: string;
  keyboardShortcutR: string;
  keyboardShortcutShiftR: string;
  keyboardShortcutF: string;
  keyboardShortcutArrows: string;
  urlTricks: string;
  urlTricksDescription: string;

  // Preferences page
  preferencesTitle: string;
  playSound: string;
  whenTimeIsUp: string;
  whenTimeIsUpDescription: string;
  last10Seconds: string;
  last10SecondsDescription: string;
  halfway: string;
  halfwayDescription: string;
  oneMinuteLeft: string;
  oneMinuteLeftDescription: string;
  customSounds: string;
  soundWhenTimeIsUp: string;
  soundHalfway: string;
  soundOneMinute: string;
  test: string;
  remove: string;
  customSoundSelected: string;
  defaultSoundUsed: string;
  noSoundSelected: string;
  soundStorageNote: string;
  afterTimeIsUp: string;
  countUp: string;
  countUpDescription: string;
  showNotifications: string;
  showNotificationsDescription: string;
  allowNotifications: string;
  noCustomSound: string;
  couldNotPlaySound: string;
  soundImported: string;
  couldNotSaveSound: string;
  soundRemoved: string;

  // Blog page
  blogTitle: string;
  comingSoon: string;
}

const translations: Record<Language, Translations> = {
  no: {
    info: 'Info',
    preferences: 'Preferanser',
    blog: 'Blogg',
    back: '← Tilbake',
    start: 'Start',
    pause: 'Pause',
    reset: 'Nullstill',
    repeat: 'Gjenta',
    fullscreen: 'Fullskjerm',
    hours: 'Timer',
    minutes: 'Minutter',
    seconds: 'Sekunder',
    timeIsUp: 'Tiden er ute!',
    timeIsUpDescription: 'Trykk R for å nullstille, eller start på nytt.',
    fullscreenOn: 'Fullskjerm på',
    fullscreenOff: 'Fullskjerm av',
    repeatOn: 'på',
    repeatOff: 'av',
    editTime: 'Rediger tid',
    setTime: 'Sett tid',
    timeFormat: 'mm:ss eller hh:mm:ss',
    invalidTimeFormat: 'Ugyldig tidsformat. Bruk mm:ss eller hh:mm:ss.',
    increaseTime: 'Øk tid',
    decreaseTime: 'Reduser tid',
    language: 'Språk',
    norwegian: 'Norsk',
    english: 'Engelsk',
    swedish: 'Svensk',
    aboutTitle: 'Om StageClock',
    aboutDescription1: 'StageClock er en app laget for presentasjoner og scener hvor du trenger en tydelig og stilren nedtelling.',
    aboutDescription2: 'Appen er utviklet av Emil med hjelp fra Lovable (basert på GPT-5), og er inspirert av funksjonene og utseendet til bigtimer.net.',
    aboutDescription3: 'StageClock lar deg styre tiden enkelt med tastatur, lydvarsler og fullskjermmodus.',
    keyboardShortcuts: 'Tastatursnarveier',
    keyboardShortcutSpace: 'Mellomrom: start/pause',
    keyboardShortcutR: 'R: nullstill',
    keyboardShortcutShiftR: 'Shift + R: veksle gjenta',
    keyboardShortcutF: 'F: fullskjerm',
    keyboardShortcutArrows: 'Pil opp/ned: øk/reduser tid (+/- 1 min)',
    urlTricks: 'URL-triks',
    urlTricksDescription: 'Kommer snart – angi starttid via URL-parametere.',
    preferencesTitle: 'Preferanser',
    playSound: 'Spill av lyd',
    whenTimeIsUp: 'Når tiden er ute',
    whenTimeIsUpDescription: 'Spill en lyd når nedtellingen når 0.',
    last10Seconds: 'Siste 10 sekunder',
    last10SecondsDescription: 'Pip for hvert sekund de siste 10 sekundene.',
    halfway: 'Halvveis',
    halfwayDescription: 'Spill en lyd når halveis av satt tid er passert.',
    oneMinuteLeft: '1 minutt igjen',
    oneMinuteLeftDescription: 'Spill en lyd når det gjenstår 1 minutt.',
    customSounds: 'Egendefinerte lyder',
    soundWhenTimeIsUp: 'Lyd når tiden er ute',
    soundHalfway: 'Lyd ved halvveis',
    soundOneMinute: 'Lyd når 1 minutt gjenstår',
    test: 'Test',
    remove: 'Fjern',
    customSoundSelected: 'Egendefinert lyd valgt',
    defaultSoundUsed: 'Standardlyd brukes hvis tilgjengelig',
    noSoundSelected: 'Ingen valgt',
    soundStorageNote: 'Filene lagres lokalt i nettleseren (IndexedDB) og kan være store (avhengig av tilgjengelig lagring).',
    afterTimeIsUp: 'Når tiden er ute',
    countUp: 'Tell opp',
    countUpDescription: 'Fortsett å telle opp etter at tiden er ute.',
    showNotifications: 'Vis varsler',
    showNotificationsDescription: 'Vis nettleservarsel når timeren er ferdig i bakgrunnen.',
    allowNotifications: 'Tillat varsler i nettleseren for å bruke denne funksjonen.',
    noCustomSound: 'Ingen egendefinert lyd lagret.',
    couldNotPlaySound: 'Kunne ikke spille av lyd.',
    soundImported: 'Lyd importert og lagret lokalt.',
    couldNotSaveSound: 'Kunne ikke lagre lyd.',
    soundRemoved: 'Fjernet lyd.',
    blogTitle: 'Blogg – StageClock',
    comingSoon: 'Kommer snart.'
  },
  en: {
    info: 'Info',
    preferences: 'Preferences',
    blog: 'Blog',
    back: '← Back',
    start: 'Start',
    pause: 'Pause',
    reset: 'Reset',
    repeat: 'Repeat',
    fullscreen: 'Fullscreen',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
    timeIsUp: 'Time is up!',
    timeIsUpDescription: 'Press R to reset, or start again.',
    fullscreenOn: 'Fullscreen on',
    fullscreenOff: 'Fullscreen off',
    repeatOn: 'on',
    repeatOff: 'off',
    editTime: 'Edit time',
    setTime: 'Set time',
    timeFormat: 'mm:ss or hh:mm:ss',
    invalidTimeFormat: 'Invalid time format. Use mm:ss or hh:mm:ss.',
    increaseTime: 'Increase time',
    decreaseTime: 'Decrease time',
    language: 'Language',
    norwegian: 'Norwegian',
    english: 'English',
    swedish: 'Swedish',
    aboutTitle: 'About StageClock',
    aboutDescription1: 'StageClock is an app made for presentations and stages where you need a clear and stylish countdown.',
    aboutDescription2: 'The app is developed by Emil with help from Lovable (based on GPT-5), and is inspired by the functions and appearance of bigtimer.net.',
    aboutDescription3: 'StageClock lets you control time easily with keyboard, sound alerts and fullscreen mode.',
    keyboardShortcuts: 'Keyboard shortcuts',
    keyboardShortcutSpace: 'Space: start/pause',
    keyboardShortcutR: 'R: reset',
    keyboardShortcutShiftR: 'Shift + R: toggle repeat',
    keyboardShortcutF: 'F: fullscreen',
    keyboardShortcutArrows: 'Arrow up/down: increase/decrease time (+/- 1 min)',
    urlTricks: 'URL tricks',
    urlTricksDescription: 'Coming soon – set start time via URL parameters.',
    preferencesTitle: 'Preferences',
    playSound: 'Play sound',
    whenTimeIsUp: 'When time is up',
    whenTimeIsUpDescription: 'Play a sound when the countdown reaches 0.',
    last10Seconds: 'Last 10 seconds',
    last10SecondsDescription: 'Beep for each second in the last 10 seconds.',
    halfway: 'Halfway',
    halfwayDescription: 'Play a sound when halfway through the set time has passed.',
    oneMinuteLeft: '1 minute left',
    oneMinuteLeftDescription: 'Play a sound when 1 minute remains.',
    customSounds: 'Custom sounds',
    soundWhenTimeIsUp: 'Sound when time is up',
    soundHalfway: 'Sound at halfway',
    soundOneMinute: 'Sound when 1 minute remains',
    test: 'Test',
    remove: 'Remove',
    customSoundSelected: 'Custom sound selected',
    defaultSoundUsed: 'Default sound used if available',
    noSoundSelected: 'None selected',
    soundStorageNote: 'Files are stored locally in the browser (IndexedDB) and can be large (depending on available storage).',
    afterTimeIsUp: 'After time is up',
    countUp: 'Count up',
    countUpDescription: 'Continue counting up after time is up.',
    showNotifications: 'Show notifications',
    showNotificationsDescription: 'Show browser notification when timer finishes in background.',
    allowNotifications: 'Allow notifications in the browser to use this function.',
    noCustomSound: 'No custom sound stored.',
    couldNotPlaySound: 'Could not play sound.',
    soundImported: 'Sound imported and stored locally.',
    couldNotSaveSound: 'Could not save sound.',
    soundRemoved: 'Sound removed.',
    blogTitle: 'Blog – StageClock',
    comingSoon: 'Coming soon.'
  },
  sv: {
    info: 'Info',
    preferences: 'Inställningar',
    blog: 'Blogg',
    back: '← Tillbaka',
    start: 'Start',
    pause: 'Paus',
    reset: 'Återställ',
    repeat: 'Upprepa',
    fullscreen: 'Helskärm',
    hours: 'Timmar',
    minutes: 'Minuter',
    seconds: 'Sekunder',
    timeIsUp: 'Tiden är ute!',
    timeIsUpDescription: 'Tryck R för att återställa, eller starta igen.',
    fullscreenOn: 'Helskärm på',
    fullscreenOff: 'Helskärm av',
    repeatOn: 'på',
    repeatOff: 'av',
    editTime: 'Redigera tid',
    setTime: 'Ställ in tid',
    timeFormat: 'mm:ss eller hh:mm:ss',
    invalidTimeFormat: 'Ogiltigt tidsformat. Använd mm:ss eller hh:mm:ss.',
    increaseTime: 'Öka tid',
    decreaseTime: 'Minska tid',
    language: 'Språk',
    norwegian: 'Norska',
    english: 'Engelska',
    swedish: 'Svenska',
    aboutTitle: 'Om StageClock',
    aboutDescription1: 'StageClock är en app gjord för presentationer och scener där du behöver en tydlig och stilren nedräkning.',
    aboutDescription2: 'Appen är utvecklad av Emil med hjälp från Lovable (baserat på GPT-5), och är inspirerad av funktionerna och utseendet på bigtimer.net.',
    aboutDescription3: 'StageClock låter dig styra tiden enkelt med tangentbord, ljudvarningar och helskärmsläge.',
    keyboardShortcuts: 'Tangentbordsgenvägar',
    keyboardShortcutSpace: 'Mellanslag: start/paus',
    keyboardShortcutR: 'R: återställ',
    keyboardShortcutShiftR: 'Shift + R: växla upprepa',
    keyboardShortcutF: 'F: helskärm',
    keyboardShortcutArrows: 'Pil upp/ner: öka/minska tid (+/- 1 min)',
    urlTricks: 'URL-tricks',
    urlTricksDescription: 'Kommer snart – ange starttid via URL-parametrar.',
    preferencesTitle: 'Inställningar',
    playSound: 'Spela ljud',
    whenTimeIsUp: 'När tiden är ute',
    whenTimeIsUpDescription: 'Spela ett ljud när nedräkningen når 0.',
    last10Seconds: 'Sista 10 sekunderna',
    last10SecondsDescription: 'Pip för varje sekund de sista 10 sekunderna.',
    halfway: 'Halvvägs',
    halfwayDescription: 'Spela ett ljud när halvvägs av inställd tid har passerat.',
    oneMinuteLeft: '1 minut kvar',
    oneMinuteLeftDescription: 'Spela ett ljud när 1 minut återstår.',
    customSounds: 'Anpassade ljud',
    soundWhenTimeIsUp: 'Ljud när tiden är ute',
    soundHalfway: 'Ljud vid halvvägs',
    soundOneMinute: 'Ljud när 1 minut återstår',
    test: 'Testa',
    remove: 'Ta bort',
    customSoundSelected: 'Anpassat ljud valt',
    defaultSoundUsed: 'Standardljud används om tillgängligt',
    noSoundSelected: 'Inget valt',
    soundStorageNote: 'Filerna lagras lokalt i webbläsaren (IndexedDB) och kan vara stora (beroende på tillgänglig lagring).',
    afterTimeIsUp: 'Efter tiden är ute',
    countUp: 'Räkna upp',
    countUpDescription: 'Fortsätt räkna upp efter tiden är ute.',
    showNotifications: 'Visa notifieringar',
    showNotificationsDescription: 'Visa webbläsarnotifiering när timern slutar i bakgrunden.',
    allowNotifications: 'Tillåt notifieringar i webbläsaren för att använda denna funktion.',
    noCustomSound: 'Inget anpassat ljud lagrat.',
    couldNotPlaySound: 'Kunde inte spela ljud.',
    soundImported: 'Ljud importerat och lagrat lokalt.',
    couldNotSaveSound: 'Kunde inte spara ljud.',
    soundRemoved: 'Ljud borttaget.',
    blogTitle: 'Blogg – StageClock',
    comingSoon: 'Kommer snart.'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('timer:language');
    return (saved as Language) || 'no';
  });

  useEffect(() => {
    localStorage.setItem('timer:language', language);
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: translations[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}