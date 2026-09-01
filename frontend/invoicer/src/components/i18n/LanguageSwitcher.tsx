import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Locale } from "@shared/types";
import { LOCALES } from "@shared/types";
import { cn } from "@/lib/utils";
import { useLocale } from "@/context/LocaleContext";
import { siblingPublicPath } from "@/i18n/publicRoutes";

export function LanguageSwitcher({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  const { t } = useTranslation("common");
  const { locale, setLocale } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();

  async function choose(next: Locale) {
    await setLocale(next);
    const sibling = siblingPublicPath(location.pathname, next);
    if (sibling && sibling !== location.pathname) navigate(sibling);
  }

  return (
    <div
      role="group"
      aria-label={t("language")}
      className={cn(
        "inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-0.5 shadow-card",
        className,
      )}
    >
      {LOCALES.map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={active}
            onClick={() => void choose(code)}
            className={cn(
              "rounded-full font-semibold tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40",
              size === "sm" ? "h-7 min-w-8 px-2 text-[11px]" : "h-8 min-w-9 px-2.5 text-xs",
              active
                ? "bg-[var(--ink)] text-[var(--bg)]"
                : "text-[var(--ink-muted)] hover:text-[var(--ink)]",
            )}
          >
            {code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
