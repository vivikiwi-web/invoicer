import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { DISPLAY_PLANS } from "@shared/plans";
import { Badge } from "@/components/ui/Badge";
import { PUBLIC_PATHS } from "@/i18n/publicRoutes";
import { useLocale } from "@/context/LocaleContext";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";

export function PricingSection({ id }: { id?: string }) {
  const { t } = useTranslation("pricing");
  const { t: tc } = useTranslation("common");
  const { locale } = useLocale();

  return (
    <section id={id} className="max-w-[1400px] mx-auto px-5 py-24 scroll-mt-20">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl font-semibold tracking-tight">{t("title")}</h2>
        <p className="text-[#4a5f5a] mt-3">{t("subtitle")}</p>
        <p className="text-xs text-[#5c7570] mt-2">{t("vatNote")}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
        {DISPLAY_PLANS.map((plan) => {
          const copy = t(plan.id, { returnObjects: true }) as {
            name: string;
            blurb: string;
            cta: string;
            features: string[];
          };
          return (
            <div
              key={plan.id}
              className={cn(
                "rounded-3xl border p-6 bg-white",
                plan.popular ? "border-[#0d9488] shadow-[0_16px_40px_-24px_rgba(13,148,136,0.7)]" : "border-black/[0.06]",
              )}
            >
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl font-semibold">{copy.name}</h3>
                {plan.popular ? <Badge tone="accent">{tc("mostPopular")}</Badge> : null}
                {plan.comingSoon ? <Badge>{tc("comingSoon")}</Badge> : null}
              </div>
              <div className="mt-4 font-display text-3xl font-semibold tabular">
                {plan.monthlyPrice == null ? "—" : `€${plan.monthlyPrice.toFixed(2)}`}
                {plan.monthlyPrice != null ? (
                  <span className="text-sm font-medium text-[#5c7570]">{t("perMonth")}</span>
                ) : null}
              </div>
              <p className="text-sm text-[#4a5f5a] mt-2">{copy.blurb}</p>
              <ul className="mt-5 space-y-2">
                {copy.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check size={14} className="mt-0.5 text-[#0d9488] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.comingSoon ? (
                <a
                  href="mailto:[CONTACT_EMAIL]?subject=Invoicer%20Business"
                  onClick={() => analytics.track("pricing_plan_clicked", { plan: plan.id })}
                  className="mt-6 inline-flex h-11 px-5 rounded-full text-sm font-semibold border border-black/10 items-center"
                >
                  {copy.cta}
                </a>
              ) : (
                <Link
                  to="/register"
                  onClick={() => analytics.track("pricing_plan_clicked", { plan: plan.id })}
                  className={cn(
                    "mt-6 inline-flex h-11 px-5 rounded-full text-sm font-semibold items-center text-white",
                    plan.popular ? "bg-[#0d9488]" : "bg-[#0c1a17]",
                  )}
                >
                  {copy.cta}
                </Link>
              )}
            </div>
          );
        })}
      </div>
      <p className="sr-only">{PUBLIC_PATHS.pricing[locale]}</p>
    </section>
  );
}

export function FaqSection({ id }: { id?: string }) {
  const { t } = useTranslation("faq");
  const items = t("items", { returnObjects: true }) as Array<{ q: string; a: string }>;
  return (
    <section id={id} className="max-w-[800px] mx-auto px-5 py-20 scroll-mt-20">
      <h2 className="font-display text-3xl font-semibold tracking-tight">{t("title")}</h2>
      <dl className="mt-8 space-y-6">
        {items.map((item) => (
          <div key={item.q}>
            <dt className="font-semibold">{item.q}</dt>
            <dd className="text-sm text-[#4a5f5a] mt-1 leading-relaxed">{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
