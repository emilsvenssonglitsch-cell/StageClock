import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'no' | 'en' | 'sv';

interface Translations {
  // Navigation
  info: string;
  preferences: string;
  blog: string;
  
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
}

const translations: Record<Language, Translations> = {
  no: {
    info: 'Info',
    preferences: 'Preferences',
    blog: 'Blog',
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
    swedish: 'Svensk'
  },
  en: {
    info: 'Info',
    preferences: 'Preferences',
    blog: 'Blog',
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
    swedish: 'Swedish'
  },
  sv: {
    info: 'Info',
    preferences: 'Inställningar',
    blog: 'Blogg',
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
    swedish: 'Svenska'
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