import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DocumentMeta } from "@/components/seo/DocumentMeta";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { PricingSection, FaqSection } from "@/components/marketing/PricingFaq";
import { SiteFooter } from "@/pages/LegalPage";
import { useLocale } from "@/context/LocaleContext";
import AILogo from "@/components/layout/AILogo";
import { PUBLIC_PATHS } from "@/i18n/publicRoutes";

export default function PricingPage() {
  const { t } = useTranslation("marketing");
  const { locale } = useLocale();
  return (
    <div className="min-h-screen bg-white text-[#0c1a17]">
      <DocumentMeta
        title={t("meta.pricingTitle")}
        description={t("meta.pricingDescription")}
        locale={locale}
        page="pricing"
      />
      <header className="border-b border-black/[0.05]">
        <div className="max-w-[1400px] mx-auto px-5 h-16 flex items-center justify-between">
          <Link to={PUBLIC_PATHS.home[locale]} className="flex items-center gap-2">
            <AILogo />
            <span className="font-display font-semibold" translate="no">Invoicer</span>
          </Link>
          <LanguageSwitcher size="sm" />
        </div>
      </header>
      <PricingSection />
      <FaqSection />
      <SiteFooter />
    </div>
  );
}
