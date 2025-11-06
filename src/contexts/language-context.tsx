"use client";

import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import { Translation, Translations } from '@/lib/types';
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';

const translations: Translations = { en, hi };

type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState('en');

  const t = (key: string): string => {
    const keys = key.split('.');
    let result: string | Translation = translations[language];
    for (const k of keys) {
      if (typeof result === 'object' && result !== null && k in result) {
        result = result[k] as Translation;
      } else {
        return key; // Key not found
      }
    }
    return typeof result === 'string' ? result : key;
  };

  const value = useMemo(() => ({ language, setLanguage, t }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
