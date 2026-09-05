import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {
  IndianLanguageCode,
  IndianLanguageMeta,
  INDIAN_LANGUAGES,
  detectIndianLanguage,
} from '@/services/languageService';
import { TRANSLATIONS, TranslationKey } from '@/services/translations';
import { getLatestTelemetry } from '@/services/telemetry';

const STORAGE_KEY = 'bmap_user_language_v1';

export interface LanguageContextType {
  language: IndianLanguageCode;
  languageMeta: IndianLanguageMeta;
  isAutoDetected: boolean;
  setLanguage: (code: IndianLanguageCode) => Promise<void>;
  resetToAutoDetect: () => void;
  t: (key: TranslationKey) => string;
  allLanguages: IndianLanguageMeta[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

async function getPersistedLanguage(): Promise<IndianLanguageCode | null> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(STORAGE_KEY);
        if (item && item in INDIAN_LANGUAGES) {
          return item as IndianLanguageCode;
        }
      }
      return null;
    }
    const stored = await SecureStore.getItemAsync(STORAGE_KEY);
    if (stored && stored in INDIAN_LANGUAGES) {
      return stored as IndianLanguageCode;
    }
    return null;
  } catch {
    return null;
  }
}

async function savePersistedLanguage(code: IndianLanguageCode): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, code);
      }
      return;
    }
    await SecureStore.setItemAsync(STORAGE_KEY, code);
  } catch {
    // Non-blocking storage fallback
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<IndianLanguageCode>('hi');
  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(true);

  // Initialize language from storage or geo-detection
  useEffect(() => {
    let isMounted = true;

    async function initLanguage() {
      const persisted = await getPersistedLanguage();
      if (!isMounted) return;

      if (persisted) {
        setLanguageState(persisted);
        setIsAutoDetected(false);
      } else {
        // Auto-detect based on latest device telemetry coordinates
        const loc = getLatestTelemetry();
        const detected = detectIndianLanguage({
          latitude: loc.latitude,
          longitude: loc.longitude,
        });
        setLanguageState(detected);
        setIsAutoDetected(true);
      }
    }

    initLanguage();

    return () => {
      isMounted = false;
    };
  }, []);

  const setLanguage = useCallback(async (code: IndianLanguageCode) => {
    setLanguageState(code);
    setIsAutoDetected(false);
    await savePersistedLanguage(code);
  }, []);

  const resetToAutoDetect = useCallback(() => {
    const loc = getLatestTelemetry();
    const detected = detectIndianLanguage({
      latitude: loc.latitude,
      longitude: loc.longitude,
    });
    setLanguageState(detected);
    setIsAutoDetected(true);
    // Clear persisted override
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      } catch {}
    } else {
      SecureStore.deleteItemAsync(STORAGE_KEY).catch(() => {});
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      const langDict = TRANSLATIONS[language];
      if (langDict && langDict[key]) {
        return langDict[key];
      }
      // Fallback to Hindi, then English
      return TRANSLATIONS.hi[key] || TRANSLATIONS.en[key] || key;
    },
    [language]
  );

  const languageMeta = useMemo(() => {
    return INDIAN_LANGUAGES[language] || INDIAN_LANGUAGES.hi;
  }, [language]);

  const allLanguages = useMemo(() => {
    return Object.values(INDIAN_LANGUAGES);
  }, []);

  const value = useMemo<LanguageContextType>(
    () => ({
      language,
      languageMeta,
      isAutoDetected,
      setLanguage,
      resetToAutoDetect,
      t,
      allLanguages,
    }),
    [language, languageMeta, isAutoDetected, setLanguage, resetToAutoDetect, t, allLanguages]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
