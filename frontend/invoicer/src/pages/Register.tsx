import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Loader2, User, Mail, Lock } from "lucide-react";
import {
  AuthShell,
  AuthField,
  AuthPrimaryButton,
  AuthErrorBanner,
} from "@/components/auth/AuthShell";
import AILogo from "@/components/layout/AILogo";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { PUBLIC_PATHS } from "@/i18n/publicRoutes";
import { useLocale } from "@/context/LocaleContext";
import { errorMessage } from "@/lib/utils";
import { analytics } from "@/lib/analytics";

export default function Register() {
  const { t } = useTranslation("auth");
  const { locale } = useLocale();
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    analytics.track("registration_started");
    setErr("");
    setLoading(true);
    try {
      await register(form);
      analytics.track("registration_completed");
      nav("/dashboard");
    } catch (e) {
      setErr(errorMessage(e, t("registerFailed")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      headline={t("registerHeadline")}
      subhead={t("registerSubhead")}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mb-12 flex items-center justify-between">
          <AILogo size={48} />
          <LanguageSwitcher size="sm" />
        </div>

        <h1 className="font-display text-[34px] font-semibold tracking-tight text-[var(--ink)] leading-[1.05]">
          {t("getStarted")}
        </h1>
        <p className="text-[var(--ink-muted)] mt-2 text-[15px]">
          {t("registerSubtitle")}
        </p>

        <form onSubmit={onSubmit} className="mt-9 space-y-4">
          <AuthField
            label={t("fullName")}
            autoComplete="name"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            placeholder={t("namePlaceholder")}
            icon={User}
          />

          <AuthField
            label={t("email")}
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            placeholder="you@example.com"
            icon={Mail}
          />

          <AuthField
            label={t("password")}
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
            placeholder={t("passwordHint")}
            minLength={8}
            icon={Lock}
          />

          <AuthErrorBanner>{err}</AuthErrorBanner>

          <div className="pt-1">
            <AuthPrimaryButton type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  {t("creatingAccount")}
                </>
              ) : (
                <>
                  {t("createAccount")} <ArrowRight size={15} />
                </>
              )}
            </AuthPrimaryButton>
          </div>
        </form>

        <div className="text-sm text-[var(--ink-muted)] text-center mt-8">
          {t("hasAccount")}{" "}
          <Link
            to="/login"
            className="text-[var(--accent-strong)] font-semibold hover:underline"
          >
            {t("signIn")}
          </Link>
        </div>

        <p className="text-[11px] text-[var(--ink-muted)]/80 text-center mt-6 leading-relaxed">
          {t("agreePrefix")}{" "}
          <Link to={PUBLIC_PATHS.terms[locale]} className="text-[var(--accent-strong)] font-semibold hover:underline">
            {t("terms")}
          </Link>{" "}
          {t("and")}{" "}
          <Link to={PUBLIC_PATHS.privacy[locale]} className="text-[var(--accent-strong)] font-semibold hover:underline">
            {t("privacy")}
          </Link>
          .
          <br />
          {t("neverShare")}
        </p>
      </motion.div>
    </AuthShell>
  );
}
