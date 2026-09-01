import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Loader2, Mail, Lock, Sparkles } from "lucide-react";
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
import { errorMessage } from "@/lib/utils";
import { analytics } from "@/lib/analytics";

const DEMO = import.meta.env.DEV
  ? { email: "alex@timetoprogram.com", password: "Test@1234" }
  : null;

export default function Login() {
  const { t } = useTranslation("auth");
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  function fillDemo() {
    if (!DEMO) return;
    setForm({ ...DEMO });
    setErr("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(form);
      analytics.track("login_completed");
      nav("/dashboard");
    } catch (e) {
      setErr(errorMessage(e, t("loginFailed")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      headline={t("loginHeadline")}
      subhead={t("loginSubhead")}
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
          {t("loginTitle")}
        </h1>
        <p className="text-[var(--ink-muted)] mt-2 text-[15px]">
          {t("loginSubtitle")}
        </p>

        <form onSubmit={onSubmit} className="mt-9 space-y-4">
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
            autoComplete="current-password"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
            placeholder="••••••••"
            icon={Lock}
            extra={null}
          />

          <AuthErrorBanner>{err}</AuthErrorBanner>

          <div className="pt-1">
            <AuthPrimaryButton type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  {t("signingIn")}
                </>
              ) : (
                <>
                  {t("signIn")} <ArrowRight size={15} />
                </>
              )}
            </AuthPrimaryButton>
          </div>

          {import.meta.env.DEV && (
            <>
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[var(--border)]" />
                <span className="text-[11px] uppercase tracking-wider text-[var(--ink-muted)] font-semibold">or</span>
                <div className="h-px flex-1 bg-[var(--border)]" />
              </div>

              <button
                type="button"
                onClick={fillDemo}
                className="w-full h-12 rounded-2xl border border-dashed border-[var(--accent)]/40 bg-[var(--accent-soft)]/40 text-sm font-semibold text-[var(--accent-strong)] hover:bg-[var(--accent-soft)] transition-colors inline-flex items-center justify-center gap-2"
              >
                <Sparkles size={14} /> {t("useDemo")}
              </button>
            </>
          )}
        </form>

        <div className="text-sm text-[var(--ink-muted)] text-center mt-8">
          {t("noAccount")}{" "}
          <Link
            to="/register"
            className="text-[var(--accent-strong)] font-semibold hover:underline"
          >
            {t("createAccount")}
          </Link>
        </div>
      </motion.div>
    </AuthShell>
  );
}
