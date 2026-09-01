import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import { NAV, SETTINGS_NAV } from "./nav";

export function MobileNav({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation("nav");
  const { user, logout } = useAuth();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="left-0 top-0 h-full max-h-none w-[min(100%,320px)] max-w-none translate-x-0 translate-y-0 rounded-none rounded-r-3xl p-0"
        showClose
      >
        <DialogTitle className="sr-only">{t("menu")}</DialogTitle>
        <div className="flex h-full flex-col py-6 px-4">
          <div className="font-display text-lg font-semibold px-2 mb-6" translate="no">
            Invoicer
          </div>
          <nav className="flex flex-col gap-1" aria-label={t("main")}>
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onOpenChange(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 h-11 px-3 rounded-2xl text-sm font-medium",
                    isActive
                      ? "bg-[var(--ink)] text-[var(--bg)]"
                      : "text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]",
                  )
                }
              >
                <item.icon size={18} />
                {t(item.labelKey)}
              </NavLink>
            ))}
            <NavLink
              to={SETTINGS_NAV.to}
              onClick={() => onOpenChange(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 h-11 px-3 rounded-2xl text-sm font-medium",
                  isActive
                    ? "bg-[var(--ink)] text-[var(--bg)]"
                    : "text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]",
                )
              }
            >
              <SETTINGS_NAV.icon size={18} />
              {t(SETTINGS_NAV.labelKey)}
            </NavLink>
          </nav>
          <div className="mt-auto pt-4 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                void logout();
              }}
              className="flex items-center gap-3 h-11 px-3 rounded-2xl text-sm font-medium text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] w-full"
            >
              <LogOut size={18} />
              {t("logOut")}
            </button>
            <div className="px-3 mt-3 text-sm font-semibold truncate">{user?.name}</div>
            <div className="px-3 text-[11px] text-[var(--ink-muted)] truncate">{user?.email}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
