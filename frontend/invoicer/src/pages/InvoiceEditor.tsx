import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  Loader2,
  Sparkles,
  ScanLine,
  X,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Combobox } from "@/components/ui/Combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { InvoiceEditorSkeleton } from "@/components/ui/Skeleton";
import { ClientFormModal } from "@/components/clients/ClientFormModal";
import { useClients } from "@/hooks/useClients";
import { useSettings } from "@/hooks/useSettings";
import { useItems } from "@/hooks/useFeatures";
import {
  useInvoice,
  useCreateInvoice,
  useUpdateInvoice,
} from "@/hooks/useInvoices";
import { aiApi } from "@/api/ai";
import { CURRENCIES, formatMoney, toDateInput, cn, errorMessage } from "@/lib/utils";
import { analytics } from "@/lib/analytics";
import { computeTotals } from "@shared/invoice";
import {
  isInvoiceStatus,
  type CatalogItem,
  type DocumentLanguage,
  type InvoiceStatus,
  type ReceiptParseResult,
} from "@shared/types";

const blankItem = () => ({ description: "", quantity: 1, rate: 0 });

type EditorItem = { description: string; quantity: number; rate: number };
interface EditorForm {
  client_id: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  currency: string;
  tax_rate: number;
  discount: number;
  notes: string;
  terms: string;
  document_language: DocumentLanguage;
  items: EditorItem[];
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function plusDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function InvoiceEditor() {
  const { t } = useTranslation("invoices");
  const { t: tc } = useTranslation("common");
  const { id } = useParams();
  const isEdit = !!id;
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectClient = searchParams.get("client") || "";

  const { data: clients } = useClients();
  const { data: settings } = useSettings();
  const { data: existing, isLoading: loadingInvoice } = useInvoice(id);
  const create = useCreateInvoice();
  const update = useUpdateInvoice();

  const [form, setForm] = useState<EditorForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [clientModal, setClientModal] = useState(false);
  const [langTouched, setLangTouched] = useState(false);

  useEffect(() => {
    if (isEdit) {
      if (existing && !form) {
        setForm({
          client_id: existing.client_id || "",
          status: existing.status,
          issue_date: toDateInput(existing.issue_date) || todayISO(),
          due_date: toDateInput(existing.due_date) || "",
          currency: existing.currency,
          tax_rate: Number(existing.tax_rate) || 0,
          discount: Number(existing.discount) || 0,
          notes: existing.notes || "",
          terms: existing.terms || "",
          document_language: existing.document_language === "en" ? "en" : "lt",
          items: existing.items?.length
            ? existing.items.map((it) => ({
                description: it.description,
                quantity: Number(it.quantity),
                rate: Number(it.rate),
              }))
            : [blankItem()],
        });
        setLangTouched(true);
      }
    } else if (!form && settings) {
      const client = (clients || []).find((c) => c.id === preselectClient);
      const docLang: DocumentLanguage =
        client?.document_language || settings.default_document_language || "lt";
      setForm({
        client_id: preselectClient,
        status: "draft",
        issue_date: todayISO(),
        due_date: plusDays(30),
        currency: settings.currency || "EUR",
        tax_rate: Number(settings.tax_rate) || 0,
        discount: 0,
        notes: "",
        terms: t("defaultTerms"),
        document_language: docLang,
        items: [blankItem()],
      });
    }
  }, [isEdit, existing, settings, form, preselectClient, clients, t]);

  const totals = useMemo(() => {
    if (!form) return { subtotal: 0, discount: 0, taxAmount: 0, total: 0 };
    return computeTotals(form.items, Number(form.tax_rate) || 0, Number(form.discount) || 0);
  }, [form]);

  if (!form || (isEdit && loadingInvoice)) {
    return <InvoiceEditorSkeleton />;
  }

  const set = (patch: Partial<EditorForm>) =>
    setForm((f) => (f ? { ...f, ...patch } : f));
  const setItem = (i: number, patch: Partial<EditorItem>) =>
    setForm((f) =>
      f
        ? {
            ...f,
            items: f.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)),
          }
        : f,
    );
  const addItem = () =>
    setForm((f) => (f ? { ...f, items: [...f.items, blankItem()] } : f));
  const addCatalogItem = (it: CatalogItem) =>
    setForm((f) => {
      if (!f) return f;
      const line = { description: it.name, quantity: 1, rate: Number(it.rate) || 0 };
      const items = [...f.items];
      const blankIdx = items.findIndex((x) => !x.description.trim() && !Number(x.rate));
      if (blankIdx >= 0) items[blankIdx] = line;
      else items.push(line);
      return { ...f, items };
    });
  const removeItem = (i: number) =>
    setForm((f) => {
      if (!f) return f;
      const next = f.items.filter((_, idx) => idx !== i);
      return { ...f, items: next.length ? next : [blankItem()] };
    });

  function onClientChange(clientId: string) {
    const client = (clients || []).find((c) => c.id === clientId);
    const patch: Partial<EditorForm> = { client_id: clientId };
    if (!langTouched) {
      patch.document_language =
        client?.document_language || settings?.default_document_language || "lt";
    }
    set(patch);
  }

  async function onSave(overrideStatus?: InvoiceStatus) {
    if (!form) return;
    setErr("");
    const payload = {
      ...form,
      status: overrideStatus || form.status,
      client_id: form.client_id || null,
      tax_rate: Number(form.tax_rate) || 0,
      discount: Number(form.discount) || 0,
      due_date: form.due_date || undefined,
      issue_date: form.issue_date || undefined,
      items: form.items
        .filter((it) => it.description.trim() || Number(it.rate) > 0)
        .map((it) => ({
          description: it.description,
          quantity: Number(it.quantity) || 0,
          rate: Number(it.rate) || 0,
        })),
    };
    setSaving(true);
    try {
      const inv =
        isEdit && id
          ? await update.mutateAsync({ id, payload })
          : await create.mutateAsync(payload);
      if (!isEdit) analytics.track("invoice_created");
      nav(`/invoices/${inv.id}`);
    } catch (e) {
      setErr(errorMessage(e, t("saveFailed")));
    } finally {
      setSaving(false);
    }
  }

  const symbol = CURRENCIES.find((c) => c.code === form.currency)?.symbol || "€";
  const clientItems = (clients || []).map((c) => ({
    value: c.id,
    label: c.name,
    keywords: `${c.company} ${c.email}`,
    hint: [c.company, c.email].filter(Boolean).join(" · "),
  }));

  return (
    <div className="max-w-[1100px]">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => nav(-1)}
            className="h-9 w-9 rounded-full flex items-center justify-center border border-[var(--border)] bg-[var(--surface)] text-[var(--ink-muted)] hover:text-[var(--ink)] shadow-card"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              {isEdit ? t("edit") : t("new")}
            </h2>
            <p className="text-sm text-[var(--ink-muted)]">
              {isEdit ? existing?.invoice_number : t("numberAssigned")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => onSave("draft")} disabled={saving}>
            {tc("actions.saveDraft")}
          </Button>
          <Button variant="accent" onClick={() => onSave()} disabled={saving}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {tc("save")}
          </Button>
        </div>
      </div>

      {err && (
        <div className="mb-4 text-sm text-[var(--danger)] bg-[var(--danger)]/10 rounded-2xl px-4 py-3">
          {err}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card padding="lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={t("client")}>
                <Combobox
                  value={form.client_id}
                  onValueChange={onClientChange}
                  items={[{ value: "", label: t("noClient") }, ...clientItems]}
                  placeholder={t("noClient")}
                  searchPlaceholder={t("searchPlaceholder")}
                  emptyMessage={tc("noResults")}
                  footer={
                    <button
                      type="button"
                      onClick={() => setClientModal(true)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[var(--accent-strong)] hover:bg-[var(--surface-2)]"
                    >
                      <Plus size={14} /> {t("createClient")}
                    </button>
                  }
                />
              </Field>
              <Field label={t("status")}>
                <Select
                  value={form.status}
                  onValueChange={(v) => {
                    if (isInvoiceStatus(v)) set({ status: v });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{tc("status.draft")}</SelectItem>
                    <SelectItem value="sent">{tc("status.sent")}</SelectItem>
                    <SelectItem value="paid">{tc("status.paid")}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t("issueDate")}>
                <Input
                  type="date"
                  value={form.issue_date}
                  onChange={(e) => set({ issue_date: e.target.value })}
                />
              </Field>
              <Field label={t("dueDate")}>
                <Input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => set({ due_date: e.target.value })}
                />
              </Field>
              <Field label={tc("documentLanguage.label")}>
                <Select
                  value={form.document_language}
                  onValueChange={(v) => {
                    setLangTouched(true);
                    if (v === "lt" || v === "en") set({ document_language: v });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lt">{tc("documentLanguage.lt")}</SelectItem>
                    <SelectItem value="en">{tc("documentLanguage.en")}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
              <CardTitle>{t("lineItems")}</CardTitle>
              <div className="flex items-center gap-2">
                <CatalogPicker onPick={addCatalogItem} currency={form.currency} />
                <ReceiptScanButton
                  onParsed={(res) => {
                    set({
                      items: res.lineItems?.length
                        ? res.lineItems.map((li) => ({
                            description: li.description || res.vendor || "Item",
                            quantity: Number(li.quantity) || 1,
                            rate: Number(li.rate) || 0,
                          }))
                        : [
                            {
                              description: res.vendor || "Expense",
                              quantity: 1,
                              rate: Number(res.total) || 0,
                            },
                          ],
                      notes: res.notes || form.notes,
                    });
                  }}
                />
              </div>
            </div>

            <div className="hidden sm:grid grid-cols-[1fr_80px_110px_110px_32px] gap-3 px-1 pb-2 text-[11px] uppercase tracking-wider text-[var(--ink-muted)] font-semibold">
              <span>{t("descriptionCol")}</span>
              <span className="text-right">{t("qty")}</span>
              <span className="text-right">{t("rate")}</span>
              <span className="text-right">{t("amount")}</span>
              <span></span>
            </div>

            <div className="space-y-2">
              {form.items.map((it, i) => (
                <div
                  key={i}
                  className="grid grid-cols-2 sm:grid-cols-[1fr_80px_110px_110px_32px] gap-3 items-center"
                >
                  <Input
                    className="col-span-2 sm:col-span-1 rounded-xl"
                    placeholder={t("itemPlaceholder")}
                    value={it.description}
                    onChange={(e) => setItem(i, { description: e.target.value })}
                  />
                  <Input
                    className="rounded-xl text-right tabular"
                    type="number"
                    min="0"
                    step="1"
                    value={it.quantity}
                    onChange={(e) => setItem(i, { quantity: Number(e.target.value) })}
                  />
                  <Input
                    className="rounded-xl text-right tabular"
                    type="number"
                    min="0"
                    step="0.01"
                    value={it.rate}
                    onChange={(e) => setItem(i, { rate: Number(e.target.value) })}
                  />
                  <div className="text-right text-sm font-semibold tabular text-[var(--ink)] pr-1">
                    {formatMoney((Number(it.quantity) || 0) * (Number(it.rate) || 0), form.currency)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="h-8 w-8 rounded-full flex items-center justify-center text-[var(--ink-muted)] hover:text-[var(--danger)] hover:bg-[var(--surface-2)] justify-self-end"
                    title={t("removeLine")}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <Button variant="ghost" size="sm" className="mt-3" onClick={addItem}>
              <Plus size={14} /> {t("addLine")}
            </Button>
          </Card>

          <Card padding="lg" className="space-y-4">
            <NoteField
              label={t("notes")}
              value={form.notes}
              onChange={(v) => set({ notes: v })}
              placeholder={t("notesPlaceholder")}
              aiKind="description"
              documentLanguage={form.document_language}
              aiContext={{ items: form.items, client: clientById(clients, form.client_id) }}
            />
            <NoteField
              label={t("terms")}
              value={form.terms}
              onChange={(v) => set({ terms: v })}
              placeholder={t("termsPlaceholder")}
              aiKind="terms"
              documentLanguage={form.document_language}
              aiContext={{ items: form.items }}
            />
          </Card>
        </div>

        <div className="space-y-5">
          <Card padding="lg" className="lg:sticky lg:top-4">
            <CardTitle className="mb-4">{t("summary")}</CardTitle>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Field label={tc("currency")}>
                <Select value={form.currency} onValueChange={(v) => set({ currency: v })}>
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
              </Field>
              <Field label={t("taxPercent")}>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.tax_rate}
                  onChange={(e) => set({ tax_rate: Number(e.target.value) })}
                  className="tabular"
                />
              </Field>
            </div>
            <Field label={`${t("discount")} (${symbol})`} className="mb-4">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.discount}
                onChange={(e) => set({ discount: Number(e.target.value) })}
                className="tabular"
              />
            </Field>

            <div className="space-y-2 pt-4 border-t border-[var(--border)] text-sm">
              <Row label={t("subtotal")} value={formatMoney(totals.subtotal, form.currency)} />
              {(totals.discount ?? 0) > 0 && (
                <Row label={t("discount")} value={`− ${formatMoney(totals.discount ?? 0, form.currency)}`} />
              )}
              <Row
                label={`${t("tax")} (${Number(form.tax_rate) || 0}%)`}
                value={formatMoney(totals.taxAmount, form.currency)}
              />
              <div className="flex items-center justify-between pt-3 mt-1 border-t border-[var(--border)]">
                <span className="font-display font-semibold">{t("total")}</span>
                <span className="font-display text-xl font-semibold tabular text-[var(--accent-strong)]">
                  {formatMoney(totals.total, form.currency)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <ClientFormModal
        open={clientModal}
        onClose={() => setClientModal(false)}
        onCreated={(client) => {
          set({ client_id: client.id });
          if (!langTouched && client.document_language) {
            set({ document_language: client.document_language });
          }
        }}
      />
    </div>
  );
}

function clientById(clients, id) {
  return (clients || []).find((c) => c.id === id) || null;
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="block text-xs font-medium text-[var(--ink-muted)] mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--ink-muted)]">{label}</span>
      <span className="tabular text-[var(--ink)]">{value}</span>
    </div>
  );
}

function NoteField({ label, value, onChange, placeholder, aiKind, aiContext, documentLanguage }) {
  const { t } = useTranslation("invoices");
  const [loading, setLoading] = useState(false);
  async function writeWithAI() {
    setLoading(true);
    try {
      const text = await aiApi.writeNote({
        kind: aiKind,
        prompt: value?.trim() || undefined,
        items: (aiContext?.items || [])
          .filter((it) => it.description)
          .map((it) => ({
            description: it.description,
            quantity: it.quantity,
            rate: it.rate,
          })),
        client: aiContext?.client ? { name: aiContext.client.name } : undefined,
        document_language: documentLanguage,
      });
      onChange(text);
      analytics.track("ai_action_used", { kind: aiKind === "terms" ? "invoice_terms" : "invoice_notes" });
    } catch {
      /* keep field intact */
    } finally {
      setLoading(false);
    }
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-[var(--ink-muted)]">{label}</span>
        <button
          type="button"
          onClick={writeWithAI}
          disabled={loading}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--accent-strong)] hover:underline disabled:opacity-50"
        >
          {loading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
          {t("writeWithAi")}
        </button>
      </div>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] outline-none resize-y focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/15"
      />
    </div>
  );
}

function CatalogPicker({ onPick, currency }: { onPick: (item: CatalogItem) => void; currency: string }) {
  const { t } = useTranslation("invoices");
  const { t: tc } = useTranslation("common");
  const { data: items, isLoading } = useItems();
  const [value, setValue] = useState("");

  if (!items?.length && !isLoading) return null;

  return (
    <div className="w-56">
      <Combobox
        value={value}
        onValueChange={(id) => {
          const item = (items || []).find((it) => it.id === id);
          if (item) onPick(item);
          setValue("");
        }}
        items={(items || []).map((it) => ({
          value: it.id,
          label: it.name,
          hint: formatMoney(it.rate, currency),
        }))}
        placeholder={t("fromCatalog")}
        searchPlaceholder={t("fromCatalog")}
        emptyMessage={tc("noResults")}
        isLoading={isLoading}
      />
    </div>
  );
}

function ReceiptScanButton({ onParsed }: { onParsed: (res: ReceiptParseResult) => void }) {
  const { t } = useTranslation("invoices");
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErr("");
    setLoading(true);
    try {
      const res = await aiApi.receiptParse(file);
      analytics.track("receipt_scanned");
      analytics.track("ai_action_used", { kind: "receipt_scan" });
      onParsed(res);
    } catch (ex) {
      setErr(errorMessage(ex, t("receiptFailed")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {err && (
        <span className="text-[11px] text-[var(--danger)] flex items-center gap-1">
          {err}
          <button type="button" onClick={() => setErr("")}>
            <X size={11} />
          </button>
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={onFile}
      />
      <Button variant="soft" size="sm" onClick={() => inputRef.current?.click()} disabled={loading}>
        {loading ? <Loader2 size={13} className="animate-spin" /> : <ScanLine size={13} />}
        {t("scanReceipt")}
      </Button>
    </div>
  );
}
