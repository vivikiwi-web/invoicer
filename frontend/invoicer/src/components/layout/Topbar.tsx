import { Menu, Search, Sun, Moon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { IconButton } from "@/components/ui/IconButton";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { NotificationsPopover } from "./NotificationsPopover";

export function Topbar({
  onOpenPalette,
  onOpenNav,
}: {
  onOpenPalette: () => void;
  onOpenNav: () => void;
}) {
  const { t } = useTranslation("nav");
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "";

  const isMac =
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/i.test(navigator.platform);

  return (
    <header className="flex items-start justify-between gap-6 mb-8">
      <div className="flex items-start gap-3 min-w-0">
        <IconButton onClick={onOpenNav} title={t("menu")} className="md:hidden mt-1" aria-label={t("menu")}>
          <Menu size={16} />
        </IconButton>
        <div className="min-w-0">
          <h1 className="font-display text-[clamp(28px,3vw,38px)] font-semibold leading-tight text-[var(--ink)]">
            {firstName ? t("hello", { name: firstName }) : t("helloGuest")}
          </h1>
          <p className="text-sm text-[var(--ink-muted)] mt-1">{t("subtitle")}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenPalette}
          className="hidden lg:flex items-center gap-3 h-11 w-[360px] rounded-full bg-[var(--surface)] border border-[var(--border)] pl-5 pr-1.5 shadow-card transition-shadow hover:shadow-hover text-left"
        >
          <Search size={16} className="text-[var(--ink-muted)] shrink-0" />
          <span className="flex-1 text-sm text-[var(--ink-muted)] truncate">
            {t("searchPlaceholder")}
          </span>
          <kbd className="inline-flex items-center gap-0.5 text-[10px] px-2 h-7 rounded-full bg-[var(--surface-2)] text-[var(--ink-muted)] border border-[var(--border)] font-semibold">
            {isMac ? "⌘" : "Ctrl"} K
          </kbd>
        </button>

        <IconButton
          onClick={onOpenPalette}
          title={t("searchTitle")}
          className="lg:hidden"
        >
          <Search size={16} />
        </IconButton>

        <LanguageSwitcher size="sm" className="hidden sm:inline-flex" />

        <IconButton onClick={toggle} title={t("toggleTheme")}>
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </IconButton>
        <NotificationsPopover />
      </div>
    </header>
  );
}
