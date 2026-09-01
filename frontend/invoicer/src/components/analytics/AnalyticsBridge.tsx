import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useConsent } from "@/context/ConsentContext";
import { useLocale } from "@/context/LocaleContext";
import { analytics } from "@/lib/analytics";

export function AnalyticsBridge() {
  const location = useLocation();
  const { consent } = useConsent();
  const { user } = useAuth();
  const { locale } = useLocale();

  useEffect(() => {
    analytics.setAllowed(Boolean(consent?.analytics));
  }, [consent?.analytics]);

  useEffect(() => {
    if (!consent?.analytics) return;
    if (user) analytics.identify(user.id, { locale });
    else analytics.reset();
  }, [consent?.analytics, user, locale]);

  useEffect(() => {
    if (!consent?.analytics) return;
    analytics.pageview(location.pathname);
  }, [consent?.analytics, location.pathname]);

  return null;
}
