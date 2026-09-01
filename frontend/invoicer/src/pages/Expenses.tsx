import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Plus,
  Receipt,
  ScanLine,
  Trash2,
  Pencil,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatCard } from "@/components/dashboard/StatCard";
import { useExpenses, useExpenseMutations } from "@/hooks/useFeatures";
import type { Expense } from "@shared/types";
import { aiApi } from "@/api/ai";
import { formatMoney, formatDate, toDateInput, cn, errorMessage } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { StatCardSkeleton } from "@/components/ui/Skeleton";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/hooks/useSettings";
import { analytics } from "@/lib/analytics";
import { CURRENCY_CODES } from "@shared/types";

export default function Expenses() {
  const { t } = useTranslation("expenses");
  const { t: tc } = useTranslation("common");
  const { data: settings } = useSettings();
  const currency = settings?.currency || "EUR";
  const [category, setCategory] = useState("all");
  const { data, isLoading } = useExpenses({ category });
  const { remove } = useExpenseMutations();
  const [modal, setModal] = useState<Partial<Expense> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanErr, setScanErr] = useState("");

  const expenses = data?.expenses || [];
  const categories = data?.categories || [];

  async function onScan(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setScanErr("");
    setScanning(true);
    try {
      const res = await aiApi.receiptParse(file);
      setModal({
        vendor: res.vendor || "",
        category: res.category || "General",
        expense_date: res.date || "",
        amount: res.total || res.subtotal || 0,
        notes: res.notes || (res.lineItems?.[0]?.description ?? ""),
      });
      analytics.track("receipt_scanned");
      analytics.track("ai_action_used", { kind: "receipt_scan" });
    } catch (ex) {
      setScanErr(errorMessage(ex, t("scanFailed")));
    } finally {
      setScanning(false);
    }
  }

  async function onDelete(e, exp) {
    e.stopPropagation();
    setPendingDelete(exp.id);
  }

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={onScan} />
            <Button variant="soft" onClick={() => fileRef.current?.click()} disabled={scanning}>
              {scanning ? <Loader2 size={15} className="animate-spin" /> : <ScanLine size={15} />}
              {t("scan")}
            </Button>
            <Button variant="accent" onClick={() => setModal({})}>
              <Plus size={16} /> {t("add")}
            </Button>
          </div>
        }
      />

      {scanErr && (
        <div className="mb-4 text-sm text-[var(--danger)] bg-[var(--danger)]/10 rounded-2xl px-4 py-3 flex items-center gap-2">
          <Sparkles size={14} /> {scanErr}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6 max-w-2xl">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard label={t("total")} value={formatMoney(data?.totals?.total || 0, currency)} icon={Receipt} />
            <StatCard label={t("thisMonth")} value={formatMoney(data?.totals?.thisMonth || 0, currency)} icon={Receipt} accent />
          </>
        )}
      </div>

      {categories.length > 0 && (
        <div className="flex items-center gap-1 p-1 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-card w-fit mb-5 flex-wrap">
          {["all", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "h-8 px-4 rounded-full text-xs font-semibold transition-colors capitalize",
                category === c ? "bg-[var(--ink)] text-[var(--bg)]" : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
              )}
            >
              {c === "all" ? t("all") : t(`categories.${c}`, { defaultValue: c })}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
        </div>
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={category !== "all" ? t("emptyCategory") : t("empty")}
          description={t("emptyDesc")}
          action={
            <Button variant="accent" onClick={() => setModal({})}>
              <Plus size={16} /> {t("add")}
            </Button>
          }
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="hidden md:grid grid-cols-[1.4fr_1fr_1fr_0.8fr_auto] gap-4 px-5 py-3 border-b border-[var(--border)] text-[11px] uppercase tracking-wider text-[var(--ink-muted)] font-semibold">
            <span>{t("vendor")}</span><span>{t("category")}</span><span>{t("date")}</span><span className="text-right">{t("amount")}</span><span></span>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                onClick={() => setModal(exp)}
                className="group grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_0.8fr_auto] gap-x-4 gap-y-1 px-5 py-4 cursor-pointer hover:bg-[var(--surface-2)] transition-colors items-center"
              >
                <div className="font-medium text-sm text-[var(--ink)] truncate">{exp.vendor || "—"}</div>
                <div className="order-3 md:order-none col-span-2 md:col-span-1">
                  <Badge tone="neutral" className="capitalize">{exp.category}</Badge>
                </div>
                <div className="hidden md:block text-sm text-[var(--ink-muted)] tabular">{formatDate(exp.expense_date)}</div>
                <div className="text-sm font-semibold text-[var(--ink)] tabular text-right">{formatMoney(exp.amount, exp.currency)}</div>
                <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); setModal(exp); }} className="h-7 w-7 rounded-full flex items-center justify-center text-[var(--ink-muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"><Pencil size={13} /></button>
                  <button onClick={(e) => onDelete(e, exp)} className="h-7 w-7 rounded-full flex items-center justify-center text-[var(--ink-muted)] hover:bg-[var(--surface)] hover:text-[var(--danger)]"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <ExpenseModal open={!!modal} expense={modal} onClose={() => setModal(null)} />
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

const CATEGORIES = ["General", "Software", "Hosting", "Meals", "Travel", "Office", "Marketing", "Equipment", "Other"];

function ExpenseModal({ open, expense, onClose }) {
  const { t } = useTranslation("expenses");
  const { t: tc } = useTranslation("common");
  const { data: settings } = useSettings();
  const isEdit = !!expense?.id;
  const { create, update } = useExpenseMutations();
  const [form, setForm] = useState<{
    vendor: string;
    category: string;
    expense_date: string;
    amount: number | string;
    currency: string;
    notes: string;
  } | null>(null);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        vendor: expense?.vendor || "",
        category: expense?.category || "General",
        expense_date: toDateInput(expense?.expense_date) || new Date().toISOString().slice(0, 10),
        amount: expense?.amount ?? 0,
        currency: expense?.currency || settings?.currency || "EUR",
        notes: expense?.notes || "",
      });
      setErr("");
    }
  }, [open, expense, settings]);

  if (!form) return null;
  const set =
    (k: "vendor" | "category" | "expense_date" | "amount" | "currency" | "notes") =>
    (e: { target: { value: string } }) =>
      setForm((f) => (f ? { ...f, [k]: e.target.value } : f));

  async function onSubmit(e) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setErr("");
    try {
      const payload = { ...form, amount: Number(form.amount) || 0 };
      if (isEdit && expense?.id) await update.mutateAsync({ id: expense.id, payload });
      else {
        await create.mutateAsync(payload);
        analytics.track("expense_created");
      }
      onClose();
    } catch (ex) {
      setErr(errorMessage(ex, t("saveFailed")));
    } finally {
      setSaving(false);
    }
  }

  const prefilled = open && !isEdit && (form.vendor || Number(form.amount) > 0);

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
              <h3 className="font-display text-lg font-semibold tracking-tight">{isEdit ? t("edit") : t("add")}</h3>
              <button type="button" onClick={onClose} className="h-8 w-8 rounded-full flex items-center justify-center text-[var(--ink-muted)] hover:bg-[var(--surface-2)]"><X size={16} /></button>
            </div>
            {prefilled && (
              <div className="mb-4 flex items-center gap-2 text-xs font-medium text-[var(--accent-strong)] bg-[var(--accent-soft)] rounded-xl px-3 py-2">
                <Sparkles size={13} /> {t("prefilled")}
              </div>
            )}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label={t("vendor")}><Input value={form.vendor} onChange={set("vendor")} placeholder={t("vendorPlaceholder")} /></Field>
                <Field label={t("amount")}>
                  <Input type="number" min="0" step="0.01" value={form.amount} onChange={set("amount")} className="tabular" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t("category")}>
                  <Select value={form.category} onValueChange={(v) => setForm((f) => (f ? { ...f, category: v } : f))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...new Set([form.category, ...CATEGORIES])].map((c) => (
                        <SelectItem key={c} value={c}>{t(`categories.${c}`, { defaultValue: c })}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label={t("date")}><Input type="date" value={form.expense_date} onChange={set("expense_date")} /></Field>
              </div>
              <Field label={tc("currency")}>
                <Select value={form.currency} onValueChange={(v) => setForm((f) => (f ? { ...f, currency: v } : f))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_CODES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t("notes")}>
                <Input value={form.notes} onChange={set("notes")} placeholder={t("notesPlaceholder")} />
              </Field>
            </div>
            {err && <p className="text-sm text-[var(--danger)] mt-3">{err}</p>}
            <div className="flex items-center justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={onClose}>{tc("cancel")}</Button>
              <Button type="submit" variant="accent" disabled={saving}>
                {saving && <Loader2 size={14} className="animate-spin" />}
                {isEdit ? tc("save") : t("add")}
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
