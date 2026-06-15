import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { type Language } from "@/lib/i18n";

type Theme = "dark" | "light";

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  appPasscode: string | null;
  secretPasscode: string | null;
  isLocked: boolean;
  setIsLocked: (v: boolean) => void;
  secretMode: boolean;
  setSecretMode: (v: boolean) => void;
  setAppPasscode: (code: string | null) => Promise<void>;
  setSecretPasscode: (code: string | null) => Promise<void>;
  verifyAppPasscode: (input: string) => boolean;
  verifySecretPasscode: (input: string) => boolean;
  resetAllPasscodes: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | null>(null);

const KEYS = {
  theme: "@provalifeOS_theme",
  language: "@provalifeOS_lang",
  appPasscode: "@provalifeOS_appCode",
  secretPasscode: "@provalifeOS_secretCode",
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [language, setLanguageState] = useState<Language>("en");
  const [appPasscode, setAppPasscodeState] = useState<string | null>(null);
  const [secretPasscode, setSecretPasscodeState] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [secretMode, setSecretMode] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [th, lang, appCode, secCode] = await Promise.all([
          AsyncStorage.getItem(KEYS.theme),
          AsyncStorage.getItem(KEYS.language),
          AsyncStorage.getItem(KEYS.appPasscode),
          AsyncStorage.getItem(KEYS.secretPasscode),
        ]);
        if (th === "dark" || th === "light") setTheme(th);
        if (lang === "en" || lang === "ar" || lang === "tr")
          setLanguageState(lang);
        setAppPasscodeState(appCode ?? null);
        setSecretPasscodeState(secCode ?? null);
        if (appCode) setIsLocked(true);
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      AsyncStorage.setItem(KEYS.theme, next);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return next;
    });
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem(KEYS.language, lang);
  }, []);

  const setAppPasscode = useCallback(async (code: string | null) => {
    setAppPasscodeState(code);
    if (code) await AsyncStorage.setItem(KEYS.appPasscode, code);
    else await AsyncStorage.removeItem(KEYS.appPasscode);
  }, []);

  const setSecretPasscode = useCallback(async (code: string | null) => {
    setSecretPasscodeState(code);
    if (code) await AsyncStorage.setItem(KEYS.secretPasscode, code);
    else await AsyncStorage.removeItem(KEYS.secretPasscode);
  }, []);

  const verifyAppPasscode = useCallback(
    (input: string) => appPasscode === input,
    [appPasscode]
  );

  const verifySecretPasscode = useCallback(
    (input: string) => secretPasscode === input,
    [secretPasscode]
  );

  const resetAllPasscodes = useCallback(async () => {
    setAppPasscodeState(null);
    setSecretPasscodeState(null);
    setIsLocked(false);
    await Promise.all([
      AsyncStorage.removeItem(KEYS.appPasscode),
      AsyncStorage.removeItem(KEYS.secretPasscode),
    ]);
  }, []);

  if (!loaded) return null;

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        setLanguage,
        appPasscode,
        secretPasscode,
        isLocked,
        setIsLocked,
        secretMode,
        setSecretMode,
        setAppPasscode,
        setSecretPasscode,
        verifyAppPasscode,
        verifySecretPasscode,
        resetAllPasscodes,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside AppProvider");
  return ctx;
}
