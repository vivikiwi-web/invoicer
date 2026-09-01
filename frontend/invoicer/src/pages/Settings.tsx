import { useEffect, useRef, useState } from "react";
import { Sun, Moon, Check, Upload, Building2, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormSkeleton } from "@/components/ui/Skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import type { DocumentLanguage } from "@shared/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/UIContext";
import { authApi } from "@/api/auth";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { CURRENCIES, cn, errorMessage } from "@/lib/utils";
import { analytics } from "@/lib/analytics";

function FieldLabel({ children }) {
  return (
    <label className="text-xs font-medium text-[var(--ink-muted)] mb-1.5 block">
      {children}
    </label>
  );
}

function CompanySection() {
  const { t } = useTranslation("settings");
  const { t: tc } = useTranslation("common");
  const { data: settings } = useSettings();
  const update = useUpdateSettings();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<{
    company_name: string;
    email: string;
    phone: string;
    address: string;
    logo_url: string;
    currency: string;
    tax_rate: number;
    invoice_prefix: string;
    default_document_language: DocumentLanguage;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings && !form) {
      setForm({
        company_name: settings.company_name || "",
        email: settings.email || "",
        phone: settings.phone || "",
        address: settings.address || "",
        logo_url: settings.logo_url || "",
        currency: settings.currency || "EUR",
        tax_rate: Number(settings.tax_rate) || 0,
        invoice_prefix: settings.invoice_prefix || "INV-",
        default_document_language: settings.default_document_language === "en" ? "en" : "lt",
      });
    }
  }, [settings, form]);

  if (!form) {
    return <FormSkeleton />;
  }

  const set = (k: string) => (e: { target: { value: string } }) =>
    setForm((f) => (f ? { ...f, [k]: e.target.value } : f));

  function onLogoPick(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 55_000) {
      toast.error("Logo too large", "Please use an image under 55KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setForm((f) =>
        f ? { ...f, logo_url: String(reader.result || "") } : f,
      );
    reader.readAsDataURL(file);
  }

  async function onSave(e) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      await update.mutateAsync({ ...form, tax_rate: Number(form.tax_rate) || 0 });
      toast.success(t("saved"), t("savedBody"));
      if (form.company_name) analytics.track("company_profile_completed");
    } catch (err) {
      toast.error(t("saveFailed"), errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSave} className="space-y-5 max-w-2xl">
      <Card padding="lg">
        <CardHeader>
          <div>
            <CardTitle className="text-base">{t("companyProfile")}</CardTitle>
            <CardDescription className="mt-1">
              {t("companyProfileHint")}
            </CardDescription>
          </div>
        </CardHeader>

        <div className="flex items-center gap-4 mb-5">
          <div className="h-16 w-16 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-center overflow-hidden shrink-0">
            {form.logo_url ? (
              <img src={form.logo_url} alt="logo" className="h-full w-full object-contain" />
            ) : (
              <Building2 size={22} className="text-[var(--ink-muted)]" />
            )}
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onLogoPick} />
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload size={14} /> {t("uploadLogo")}
            </Button>
            {form.logo_url && (
              <button
                type="button"
                onClick={() => setForm((f) => (f ? { ...f, logo_url: "" } : f))}
                className="ml-2 text-xs text-[var(--danger)] font-semibold"
              >
                {t("remove")}
              </button>
            )}
            <p className="text-[11px] text-[var(--ink-muted)] mt-1.5">{t("logoHint")}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <FieldLabel>{t("companyName")}</FieldLabel>
            <Input value={form.company_name} onChange={set("company_name")} placeholder="Your Company LLC" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>{t("billingEmail")}</FieldLabel>
              <Input type="email" value={form.email} onChange={set("email")} placeholder="billing@you.com" />
            </div>
            <div>
              <FieldLabel>{t("phone")}</FieldLabel>
              <Input value={form.phone} onChange={set("phone")} placeholder="+1 (555) 000-0000" />
            </div>
          </div>
          <div>
            <FieldLabel>{t("address")}</FieldLabel>
            <Input value={form.address} onChange={set("address")} placeholder="123 Main St, City, State" />
          </div>
        </div>
      </Card>

      <Card padding="lg">
        <CardHeader>
          <div>
            <CardTitle className="text-base">{t("invoicingDefaults")}</CardTitle>
            <CardDescription className="mt-1">
              {t("invoicingDefaultsHint")}
            </CardDescription>
          </div>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <FieldLabel>{t("defaultCurrency")}</FieldLabel>
            <Select value={form.currency} onValueChange={(v) => setForm((f) => (f ? { ...f, currency: v } : f))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <FieldLabel>{t("taxRate")}</FieldLabel>
            <Input type="number" min="0" step="0.1" value={form.tax_rate} onChange={set("tax_rate")} className="tabular" />
          </div>
          <div>
            <FieldLabel>{t("invoicePrefix")}</FieldLabel>
            <Input value={form.invoice_prefix} onChange={set("invoice_prefix")} placeholder="INV-" />
          </div>
          <div className="sm:col-span-3">
            <FieldLabel>{t("defaultDocumentLanguage")}</FieldLabel>
            <Select
              value={form.default_document_language}
              onValueChange={(v) =>
                setForm((f) =>
                  f ? { ...f, default_document_language: v === "en" ? "en" : "lt" } : f,
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lt">{tc("documentLanguage.lt")}</SelectItem>
                <SelectItem value="en">{tc("documentLanguage.en")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" variant="accent" disabled={saving}>
          {saving && <Loader2 size={14} className="animate-spin" />}
          {tc("save")}
        </Button>
      </div>
    </form>
  );
}

function ProfileSection() {
  const { t } = useTranslation("settings");
  const { t: tc } = useTranslation("common");
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  const dirty = name.trim() !== (user?.name || "") && name.trim().length > 0;

  async function onSave(e) {
    e.preventDefault();
    if (!dirty) return;
    setSaving(true);
    try {
      await updateProfile({ name: name.trim() });
      toast.success(t("saved"));
    } catch (err) {
      toast.error(t("saveFailed"), errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card padding="lg" className="max-w-2xl">
      <CardHeader>
        <div>
          <CardTitle className="text-base">{t("yourAccount")}</CardTitle>
          <CardDescription className="mt-1">
            {t("yourAccountHint")}
          </CardDescription>
        </div>
      </CardHeader>

      <form onSubmit={onSave} className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)] font-semibold flex items-center justify-center text-lg ring-2 ring-[var(--surface)] shrink-0">
            {(user?.name?.[0] || "?").toUpperCase()}
          </div>
          <div className="text-xs text-[var(--ink-muted)]">{t("avatarHint")}</div>
        </div>

        <div>
          <FieldLabel>{t("name")}</FieldLabel>
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Your name" />
        </div>

        <div>
          <FieldLabel>{tc("uiLanguage.label")}</FieldLabel>
          <LanguageSwitcher />
          <p className="text-[11px] text-[var(--ink-muted)] mt-1.5">{t("languageHint")}</p>
        </div>

        <div>
          <FieldLabel>{t("email")}</FieldLabel>
          <Input value={user?.email || ""} disabled />
          <p className="text-[11px] text-[var(--ink-muted)] mt-1.5">{t("emailLocked")}</p>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={!dirty || saving}>
            {saving ? tc("saving") : t("saveChanges")}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function ThemeOption({ value, label, icon: Icon, current, onSelect }) {
  const { t } = useTranslation("settings");
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        "relative flex-1 flex flex-col items-start gap-3 p-4 rounded-2xl border text-left transition-all",
        active
          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
          : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]"
      )}
    >
      <div
        className={cn(
          "h-9 w-9 rounded-xl flex items-center justify-center",
          active ? "bg-[var(--accent-strong)] text-white" : "bg-[var(--surface-2)] text-[var(--ink-muted)]"
        )}
      >
        <Icon size={16} />
      </div>
      <div>
        <div className="text-sm font-semibold text-[var(--ink)]">{label}</div>
        <div className="text-[11px] text-[var(--ink-muted)] mt-0.5">
          {value === "light" ? t("themeLightHint") : t("themeDarkHint")}
        </div>
      </div>
      {active && (
        <span className="absolute top-3 right-3 h-5 w-5 rounded-full bg-[var(--accent-strong)] text-white flex items-center justify-center">
          <Check size={12} />
        </span>
      )}
    </button>
  );
}

function AppearanceSection() {
  const { t } = useTranslation("settings");
  const { theme, setTheme } = useTheme();
  return (
    <Card padding="lg" className="max-w-2xl">
      <CardHeader>
        <div>
          <CardTitle className="text-base">{t("appearance")}</CardTitle>
          <CardDescription className="mt-1">
            {t("languageHint")}
          </CardDescription>
        </div>
      </CardHeader>

      <div className="flex gap-3">
        <ThemeOption value="light" label={t("light")} icon={Sun} current={theme} onSelect={setTheme} />
        <ThemeOption value="dark" label={t("dark")} icon={Moon} current={theme} onSelect={setTheme} />
      </div>
    </Card>
  );
}

function PasswordSection() {
  const { t } = useTranslation("settings");
  const { t: tc } = useTranslation("common");
  const toast = useToast();
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const newTooShort = newPassword.length > 0 && newPassword.length < 8;
  const mismatch = confirm.length > 0 && confirm !== newPassword;
  const canSubmit =
    currentPassword.length > 0 && newPassword.length >= 8 && confirm === newPassword && !saving;

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success(t("passwordUpdated"));
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      toast.error(t("saveFailed"), errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card padding="lg" className="max-w-2xl">
      <CardHeader>
        <div>
          <CardTitle className="text-base">{t("changePassword")}</CardTitle>
          <CardDescription className="mt-1">
            {t("passwordHint")}
          </CardDescription>
        </div>
      </CardHeader>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <FieldLabel>{t("currentPassword")}</FieldLabel>
          <Input type="password" value={currentPassword} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
        </div>

        <div>
          <FieldLabel>{t("newPassword")}</FieldLabel>
          <Input type="password" value={newPassword} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
          {newTooShort && <p className="text-[11px] text-[var(--danger)] mt-1.5">{t("passwordHint")}</p>}
        </div>

        <div>
          <FieldLabel>{t("confirmPassword")}</FieldLabel>
          <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          {mismatch && <p className="text-[11px] text-[var(--danger)] mt-1.5">{t("passwordMismatch")}</p>}
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={!canSubmit}>
            {saving ? tc("saving") : t("updatePassword")}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default function Settings() {
  const { t } = useTranslation("settings");
  const [tab, setTab] = useState("company");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="company">{t("company")}</TabsTrigger>
          <TabsTrigger value="profile">{t("account")}</TabsTrigger>
          <TabsTrigger value="appearance">{t("appearance")}</TabsTrigger>
          <TabsTrigger value="password">{t("changePassword")}</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="company">
            <CompanySection />
          </TabsContent>
          <TabsContent value="profile">
            <ProfileSection />
          </TabsContent>
          <TabsContent value="appearance">
            <AppearanceSection />
          </TabsContent>
          <TabsContent value="password">
            <PasswordSection />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
