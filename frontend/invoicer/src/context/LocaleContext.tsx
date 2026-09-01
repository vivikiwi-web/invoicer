import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import type { Locale } from "@shared/types";
import { isLocale } from "@shared/types";
import i18n, {
  currentLocale,
  readStoredLocale,
  writeStoredLocale,
} from "@/i18n";
import { useAuth } from "@/context/AuthContext";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => Promise<void>;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function applyDocumentLang(locale: Locale) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { i18n: i18nHook } = useTranslation();
  const { user, loading, updateProfile } = useAuth();
  const locale: Locale = isLocale(i18nHook.resolvedLanguage || "")
    ? (i18nHook.resolvedLanguage as Locale)
    : currentLocale();
  const hydratedUser = useRef<string | null>(null);

  const setLocale = useCallback(
    async (next: Locale) => {
      if (!isLocale(next)) return;
      writeStoredLocale(next);
      await i18n.changeLanguage(next);
      applyDocumentLang(next);
      if (user && user.locale !== next) {
        try {
          await updateProfile({ locale: next });
        } catch {
          /* keep UI language even if persist fails */
        }
      }
    },
    [user, updateProfile],
  );

  useEffect(() => {
    applyDocumentLang(locale);
  }, [locale]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      hydratedUser.current = null;
      return;
    }
    if (hydratedUser.current === user.id) return;
    hydratedUser.current = user.id;

    const stored = readStoredLocale();
    const resolved: Locale = isLocale(user.locale) ? user.locale : stored || "lt";
    writeStoredLocale(resolved);
    if (currentLocale() !== resolved) {
      void i18n.changeLanguage(resolved).then(() => applyDocumentLang(resolved));
    } else {
      applyDocumentLang(resolved);
    }
    if (user.locale !== resolved) {
      void updateProfile({ locale: resolved });
    }
  }, [user, loading, updateProfile]);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
