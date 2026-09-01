import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useLocale } from "@/context/LocaleContext";
import { localeFromPublicPath } from "@/i18n/publicRoutes";

export function PublicLocaleSync({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { locale, setLocale } = useLocale();

  useEffect(() => {
    const fromPath = localeFromPublicPath(location.pathname);
    if (fromPath && fromPath !== locale) {
      void setLocale(fromPath);
    }
  }, [location.pathname, locale, setLocale]);

  return children;
}
