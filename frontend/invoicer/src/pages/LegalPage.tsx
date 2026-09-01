import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DocumentMeta } from "@/components/seo/DocumentMeta";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useLocale } from "@/context/LocaleContext";
import { useConsent } from "@/context/ConsentContext";
import { PUBLIC_PATHS, type PublicPageId } from "@/i18n/publicRoutes";
import AILogo from "@/components/layout/AILogo";

export function SiteFooter() {
  const { t } = useTranslation("marketing");
  const { t: tl } = useTranslation("legal");
  const { t: tConsent } = useTranslation("consent");
  const { locale } = useLocale();
  const { openPrefs } = useConsent();
  const p = (id: PublicPageId) => PUBLIC_PATHS[id][locale];

  return (
    <footer className="border-t border-black/[0.06] bg-[#f5faf9] mt-10">
      <div className="max-w-[1400px] mx-auto px-5 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AILogo />
            <span className="font-display font-semibold" translate="no">Invoicer</span>
          </div>
          <LanguageSwitcher size="sm" />
        </div>
        <div>
          <div className="font-semibold mb-3">{t("footer.product")}</div>
          <ul className="space-y-2 text-[#4a5f5a]">
            <li><a href="#features">{t("footer.features")}</a></li>
            <li><Link to={p("pricing")}>{t("footer.pricing")}</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">{t("footer.account")}</div>
          <ul className="space-y-2 text-[#4a5f5a]">
            <li><Link to="/login">{t("footer.login")}</Link></li>
            <li><Link to="/register">{t("footer.register")}</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">{t("footer.legal")}</div>
          <ul className="space-y-2 text-[#4a5f5a]">
            <li><Link to={p("privacy")}>{tl("nav.privacy")}</Link></li>
            <li><Link to={p("cookies")}>{tl("nav.cookies")}</Link></li>
            <li><Link to={p("terms")}>{tl("nav.terms")}</Link></li>
            <li><Link to={p("billing")}>{tl("nav.billing")}</Link></li>
            <li><Link to={p("refund")}>{tl("nav.refund")}</Link></li>
            <li>
              <button type="button" className="hover:underline" onClick={openPrefs}>
                {tConsent("footerLink")}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export function LegalPage({ page }: { page: Exclude<PublicPageId, "home" | "pricing"> }) {
  const { t } = useTranslation("legal");
  const { locale } = useLocale();
  const content = t(page, { returnObjects: true }) as {
    title: string;
    metaTitle: string;
    metaDescription: string;
    intro: string;
    sections: Array<{ h: string; p: string }>;
  };

  return (
    <div className="min-h-screen bg-white text-[#0c1a17]">
      <DocumentMeta
        title={content.metaTitle}
        description={content.metaDescription}
        locale={locale}
        page={page}
      />
      <header className="border-b border-black/[0.05]">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to={PUBLIC_PATHS.home[locale]} className="flex items-center gap-2">
            <AILogo />
            <span className="font-display font-semibold" translate="no">Invoicer</span>
          </Link>
          <LanguageSwitcher size="sm" />
        </div>
      </header>
      <article className="max-w-3xl mx-auto px-5 py-12">
        <p className="text-xs text-[#5c7570] mb-2">{t("updated")}</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{content.title}</h1>
        <p className="mt-4 text-sm text-[#4a5f5a] leading-relaxed">{t("operator")}</p>
        <p className="mt-4 text-[15px] leading-relaxed">{content.intro}</p>
        {"controller" in (t(page, { returnObjects: true }) as object) && page === "privacy" ? (
          <p className="mt-3 text-[15px] leading-relaxed">{t("privacy.controller")}</p>
        ) : null}
        {content.sections?.map((s) => (
          <section key={s.h} className="mt-8">
            <h2 className="font-display text-lg font-semibold">{s.h}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-[#1f2e2b]">{s.p}</p>
          </section>
        ))}
        <p className="mt-10 text-sm text-[#5c7570]">{t("contact")}</p>
      </article>
      <SiteFooter />
    </div>
  );
}
