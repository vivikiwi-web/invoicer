import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { useConsent } from "@/context/ConsentContext";
import { useState } from "react";

export function CookieBanner() {
  const { t } = useTranslation("consent");
  const { decided, acceptAll, rejectNonEssential, openPrefs } = useConsent();
  if (decided) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-4 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-hover p-5">
        <h2 className="font-display text-base font-semibold">{t("banner.title")}</h2>
        <p className="text-sm text-[var(--ink-muted)] mt-1">{t("banner.body")}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="accent" onClick={acceptAll}>
            {t("banner.acceptAll")}
          </Button>
          <Button variant="outline" onClick={rejectNonEssential}>
            {t("banner.reject")}
          </Button>
          <Button variant="ghost" onClick={openPrefs}>
            {t("banner.customize")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CookiePreferences() {
  const { t } = useTranslation("consent");
  const { t: tc } = useTranslation("common");
  const { prefsOpen, closePrefs, consent, save } = useConsent();
  const [analyticsOn, setAnalyticsOn] = useState(Boolean(consent?.analytics));

  return (
    <Dialog
      open={prefsOpen}
      onOpenChange={(open) => {
        if (open) setAnalyticsOn(Boolean(consent?.analytics));
        else closePrefs();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-semibold">{t("prefs.title")}</DialogTitle>
          <DialogDescription className="text-sm text-[var(--ink-muted)] mt-1">
            {t("prefs.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-2xl border border-[var(--border)] p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm">{t("prefs.necessary")}</div>
              <span className="text-[11px] font-semibold text-[var(--ink-muted)]">{t("prefs.alwaysOn")}</span>
            </div>
            <p className="text-xs text-[var(--ink-muted)] mt-1">{t("prefs.necessaryHelp")}</p>
          </div>
          <label className="rounded-2xl border border-[var(--border)] p-4 flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1"
              checked={analyticsOn}
              onChange={(e) => setAnalyticsOn(e.target.checked)}
            />
            <span>
              <span className="block font-medium text-sm">{t("prefs.analytics")}</span>
              <span className="block text-xs text-[var(--ink-muted)] mt-1">{t("prefs.analyticsHelp")}</span>
            </span>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closePrefs} type="button">
            {tc("cancel")}
          </Button>
          <Button variant="accent" onClick={() => save(analyticsOn)}>
            {t("prefs.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
