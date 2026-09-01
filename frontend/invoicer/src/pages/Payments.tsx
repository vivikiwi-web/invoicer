import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Wallet, Trash2, X, Loader2, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton, StatCardSkeleton } from "@/components/ui/Skeleton";
import { StatCard } from "@/components/dashboard/StatCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Combobox } from "@/components/ui/Combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { usePayments, usePaymentMutations } from "@/hooks/useFeatures";
import { useInvoices } from "@/hooks/useInvoices";
import { useSettings } from "@/hooks/useSettings";
import { formatMoney, formatDate, errorMessage } from "@/lib/utils";
import { analytics } from "@/lib/analytics";

const METHODS = [
  { value: "Bank transfer", key: "bank" },
  { value: "Credit card", key: "card" },
  { value: "Check", key: "check" },
  { value: "PayPal", key: "paypal" },
  { value: "Cash", key: "cash" },
  { value: "Other", key: "other" },
] as const;

export default function Payments() {
  const { t } = useTranslation("payments");
  const { t: tc } = useTranslation("common");
  const { t: ti } = useTranslation("invoices");
  const { data, isLoading } = usePayments();
  const { data: settings } = useSettings();
  const currency = settings?.currency || "EUR";
  const { remove } = usePaymentMutations();
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const payments = data?.payments || [];

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button variant="accent" onClick={() => setModalOpen(true)}>
            <Plus size={16} /> {t("add")}
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6 max-w-2xl">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard label={t("received")} value={formatMoney(data?.totals?.total || 0, currency)} icon={Wallet} accent />
            <StatCard label={t("thisMonth")} value={formatMoney(data?.totals?.this_month || 0, currency)} icon={CreditCard} />
          </>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
      ) : payments.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title={t("empty")}
          description={t("description")}
          action={<Button variant="accent" onClick={() => setModalOpen(true)}><Plus size={16} /> {t("add")}</Button>}
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_1.4fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-[var(--border)] text-[11px] uppercase tracking-wider text-[var(--ink-muted)] font-semibold">
            <span>{t("date")}</span>
            <span>{t("invoiceClient")}</span>
            <span>{t("method")}</span>
            <span className="text-right">{t("amount")}</span>
            <span></span>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {payments.map((p) => (
              <div key={p.id} className="group grid grid-cols-2 md:grid-cols-[1fr_1.4fr_1fr_1fr_auto] gap-x-4 gap-y-1 px-5 py-4 items-center">
                <div className="text-sm text-[var(--ink-muted)] tabular">{formatDate(p.paid_on)}</div>
                <div className="order-3 md:order-none col-span-2 md:col-span-1 min-w-0">
                  <div className="text-sm font-semibold text-[var(--ink)] tabular truncate">{p.invoice_number}</div>
                  <div className="text-xs text-[var(--ink-muted)] truncate">{p.client_name || ti("noClient")}</div>
                </div>
                <div className="hidden md:block">
                  {p.method ? <Badge tone="neutral">{p.method}</Badge> : <span className="text-xs text-[var(--ink-muted)]">{tc("emDash")}</span>}
                </div>
                <div className="text-sm font-semibold text-[var(--success)] tabular text-right">
                  {formatMoney(p.amount, p.invoice_currency || currency)}
                </div>
                <button
                  type="button"
                  onClick={() => setPendingDelete(p.id)}
                  className="justify-self-end h-7 w-7 rounded-full flex items-center justify-center text-[var(--ink-muted)] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--surface-2)] hover:text-[var(--danger)]"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <RecordPaymentModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => { if (!o) setPendingDelete(null); }}
        title={t("deleteTitle")}
        description={t("deleteBody")}
        confirmLabel={tc("delete")}
        cancelLabel={tc("cancel")}
        danger
        onConfirm={async () => {
          if (pendingDelete) await remove.mutateAsync(pendingDelete);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

function RecordPaymentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation("payments");
  const { t: tc } = useTranslation("common");
  const { t: ti } = useTranslation("invoices");
  const { data: invoices } = useInvoices();
  const { create } = usePaymentMutations();
  const [form, setForm] = useState({ invoiceId: "", amount: "", method: "Bank transfer", paid_on: "", notes: "" });
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const options = useMemo(
    () => (invoices || []).filter((i) => i.effective_status !== "paid").concat((invoices || []).filter((i) => i.effective_status === "paid")),
    [invoices],
  );

  useEffect(() => {
    if (open) {
      setForm({ invoiceId: "", amount: "", method: "Bank transfer", paid_on: new Date().toISOString().slice(0, 10), notes: "" });
      setErr("");
    }
  }, [open]);

  function pickInvoice(id: string) {
    const inv = (invoices || []).find((i) => i.id === id);
    setForm((f) => ({ ...f, invoiceId: id, amount: inv ? String(inv.total) : f.amount }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.invoiceId) return setErr(t("selectInvoice"));
    if (!(Number(form.amount) > 0)) return setErr(t("amountRequired"));
    setSaving(true);
    setErr("");
    try {
      await create.mutateAsync({ ...form, amount: Number(form.amount) });
      analytics.track("payment_recorded");
      onClose();
    } catch (ex) {
      setErr(errorMessage(ex, t("saveFailed")));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-[var(--ink)]/30 backdrop-blur-sm" onClick={onClose} />
          <motion.form
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[480px] rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-hover p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-semibold tracking-tight">{t("recordTitle")}</h3>
              <button type="button" onClick={onClose} className="h-8 w-8 rounded-full flex items-center justify-center text-[var(--ink-muted)] hover:bg-[var(--surface-2)]"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <Field label={`${t("invoice")} *`}>
                <Combobox
                  value={form.invoiceId}
                  onValueChange={pickInvoice}
                  placeholder={t("selectInvoice")}
                  searchPlaceholder={t("selectInvoice")}
                  emptyMessage={tc("noResults")}
                  items={options.map((i) => ({
                    value: i.id,
                    label: `${i.invoice_number} · ${i.client_name || ti("noClient")}`,
                    hint: `${formatMoney(i.total, i.currency)} · ${tc(`status.${i.effective_status}`)}`,
                    group: i.effective_status === "paid" ? tc("status.paid") : undefined,
                    keywords: `${i.client_name || ""} ${i.invoice_number}`,
                  }))}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label={`${t("amount")} *`}>
                  <Input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className="tabular" placeholder="0.00" />
                </Field>
                <Field label={t("date")}>
                  <Input type="date" value={form.paid_on} onChange={(e) => setForm((f) => ({ ...f, paid_on: e.target.value }))} />
                </Field>
              </div>
              <Field label={t("method")}>
                <Select value={form.method} onValueChange={(v) => setForm((f) => ({ ...f, method: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{t(`methods.${m.key}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t("notes")}>
                <Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder={t("notesPlaceholder")} />
              </Field>
            </div>
            {err && <p className="text-sm text-[var(--danger)] mt-3">{err}</p>}
            <div className="flex items-center justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={onClose}>{tc("cancel")}</Button>
              <Button type="submit" variant="accent" disabled={saving}>
                {saving && <Loader2 size={14} className="animate-spin" />}
                {t("add")}
              </Button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-[var(--ink-muted)] mb-1.5">{label}</span>
      {children}
    </label>
  );
}
