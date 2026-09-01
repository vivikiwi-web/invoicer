import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Download,
  Loader2,
  Send,
  CheckCircle2,
  Undo2,
  Sparkles,
  Copy,
  Check,
  Mail,
} from "lucide-react";
import type { ReminderTone } from "@shared/types";
import { errorMessage } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button, buttonVariants } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { DetailSkeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { InvoiceDocument } from "@/components/invoice/InvoiceDocument";
import {
  useInvoice,
  useSetInvoiceStatus,
  useDeleteInvoice,
} from "@/hooks/useInvoices";
import { useSettings } from "@/hooks/useSettings";
import { aiApi } from "@/api/ai";
import { formatMoney, formatDate, cn } from "@/lib/utils";
import i18n from "@/i18n";
import { analytics } from "@/lib/analytics";

export default function InvoiceDetail() {
  const { t } = useTranslation("invoices");
  const { t: tc } = useTranslation("common");
  const { id } = useParams();
  const nav = useNavigate();
  const { data: invoice, isLoading, error } = useInvoice(id);
  const { data: settings } = useSettings();
  const setStatus = useSetInvoiceStatus();
  const del = useDeleteInvoice();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) {
    return <DetailSkeleton />;
  }
  if (error || !invoice) {
    return <EmptyState icon={Mail} title={t("notFound")} description={t("notFoundBody")} />;
  }

  const st = invoice.effective_status;
  const isPaid = invoice.status === "paid";

  const current = invoice;

  return (
    <div className="max-w-[1100px]">
      {/* header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => nav("/invoices")}
            className="h-9 w-9 rounded-full flex items-center justify-center border border-[var(--border)] bg-[var(--surface)] text-[var(--ink-muted)] hover:text-[var(--ink)] shadow-card"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                {invoice.invoice_number}
              </h2>
              <StatusBadge status={st} />
            </div>
            <p className="text-sm text-[var(--ink-muted)]">
              {invoice.client_name || t("noClient")} · {formatMoney(invoice.total, invoice.currency)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <PDFDownloadLink
            document={<InvoiceDocument invoice={invoice} settings={settings} />}
            fileName={`${invoice.invoice_number}.pdf`}
          >
            {({ loading }) => (
              <span
                className={buttonVariants({ variant: "outline", size: "md" })}
                onClick={() => analytics.track("invoice_pdf_downloaded")}
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                {t("pdfDownload")}
              </span>
            )}
          </PDFDownloadLink>
          <Button variant="outline" onClick={() => nav(`/invoices/${id}/edit`)}>
            <Pencil size={15} /> {tc("edit")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setConfirmDelete(true)}
            className="text-[var(--danger)] hover:bg-[var(--danger)]/10"
          >
            <Trash2 size={15} />
          </Button>
        </div>
      </div>

      {/* status controls */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-xs text-[var(--ink-muted)] mr-1">{t("markAs")}:</span>
        <StatusButton
          active={invoice.status === "draft"}
          onClick={() => setStatus.mutate({ id: invoice.id, status: "draft" })}
          icon={Undo2}
          label={tc("status.draft")}
        />
        <StatusButton
          active={invoice.status === "sent"}
          onClick={() => setStatus.mutate({ id: invoice.id, status: "sent" })}
          icon={Send}
          label={tc("status.sent")}
        />
        <StatusButton
          active={isPaid}
          onClick={() => setStatus.mutate({ id: invoice.id, status: "paid" })}
          icon={CheckCircle2}
          label={tc("status.paid")}
          tone="success"
        />
        {setStatus.isPending && <Loader2 size={14} className="animate-spin text-[var(--ink-muted)]" />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Invoice preview */}
        <div className="lg:col-span-2">
          <InvoicePreview invoice={invoice} settings={settings} />
        </div>

        {/* Side: reminder + client */}
        <div className="space-y-5">
          {!isPaid && id && <PaymentReminderCard invoiceId={id} />}
          <ClientCard invoice={invoice} />
        </div>
      </div>
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={t("deleteTitle")}
        description={t("deleteBody", { number: current.invoice_number })}
        confirmLabel={tc("delete")}
        cancelLabel={tc("cancel")}
        danger
        onConfirm={async () => {
          await del.mutateAsync(current.id);
          nav("/invoices");
        }}
      />
    </div>
  );
}

function StatusButton({
  active,
  onClick,
  icon: Icon,
  label,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  tone?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold border transition-colors",
        active
          ? tone === "success"
            ? "bg-[var(--success)]/12 text-[var(--success)] border-transparent"
            : "bg-[var(--ink)] text-[var(--bg)] border-transparent"
          : "bg-[var(--surface)] text-[var(--ink-muted)] border-[var(--border)] hover:text-[var(--ink)]"
      )}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}

function InvoicePreview({ invoice, settings }) {
  const t = i18n.getFixedT(invoice.document_language || "en", "pdf");
  const s = settings || {};
  const currency = invoice.currency;
  return (
    <Card padding="lg">
      <div className="flex items-start justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          {s.logo_url ? (
            <img src={s.logo_url} alt="" className="h-12 w-12 object-contain mb-2 rounded" />
          ) : null}
          <div className="font-display text-lg font-semibold text-[var(--ink)]">
            {s.company_name || t("yourCompany")}
          </div>
          {s.address && <div className="text-xs text-[var(--ink-muted)] max-w-[220px]">{s.address}</div>}
          {s.email && <div className="text-xs text-[var(--ink-muted)]">{s.email}</div>}
        </div>
        <div className="text-right">
          <div className="font-display text-2xl font-bold tracking-wide text-[var(--accent-strong)]">
            {t("invoice")}
          </div>
          <div className="text-sm text-[var(--ink-muted)] mt-1 tabular">{invoice.invoice_number}</div>
        </div>
      </div>

      <div className="flex items-start justify-between gap-4 py-6">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--ink-muted)] font-semibold mb-1">
            {t("billTo")}
          </div>
          <div className="text-sm font-semibold text-[var(--ink)]">{invoice.client_name || "—"}</div>
          {invoice.client_company && <div className="text-xs text-[var(--ink-muted)]">{invoice.client_company}</div>}
          {invoice.client_email && <div className="text-xs text-[var(--ink-muted)]">{invoice.client_email}</div>}
        </div>
        <div className="text-right text-sm space-y-1">
          <MetaLine label={t("issued")} value={formatDate(invoice.issue_date, undefined, invoice.document_language)} />
          <MetaLine label={t("due")} value={formatDate(invoice.due_date, undefined, invoice.document_language)} />
        </div>
      </div>

      {/* items */}
      <div className="grid grid-cols-[1fr_60px_90px_90px] gap-3 pb-2 border-b border-[var(--ink)] text-[10px] uppercase tracking-wider text-[var(--ink-muted)] font-semibold">
        <span>{t("description")}</span>
        <span className="text-right">{t("qty")}</span>
        <span className="text-right">{t("rate")}</span>
        <span className="text-right">{t("amount")}</span>
      </div>
      {(invoice.items || []).map((it, i) => (
        <div key={i} className="grid grid-cols-[1fr_60px_90px_90px] gap-3 py-2.5 border-b border-[var(--border)] text-sm">
          <span className="text-[var(--ink)]">{it.description || "—"}</span>
          <span className="text-right tabular text-[var(--ink-muted)]">{Number(it.quantity)}</span>
          <span className="text-right tabular text-[var(--ink-muted)]">{formatMoney(it.rate, currency)}</span>
          <span className="text-right tabular text-[var(--ink)] font-medium">{formatMoney(it.amount, currency)}</span>
        </div>
      ))}

      {/* totals */}
      <div className="ml-auto w-full max-w-[260px] mt-5 space-y-2 text-sm">
        <TotalLine label={t("subtotal")} value={formatMoney(invoice.subtotal, currency, invoice.document_language)} />
        {Number(invoice.discount) > 0 && (
          <TotalLine label={t("discount")} value={`− ${formatMoney(invoice.discount, currency, invoice.document_language)}`} />
        )}
        <TotalLine label={t("tax", { rate: Number(invoice.tax_rate) })} value={formatMoney(invoice.tax_amount, currency, invoice.document_language)} />
        <div className="flex items-center justify-between pt-3 border-t border-[var(--ink)]">
          <span className="font-display font-semibold">{t("total")}</span>
          <span className="font-display text-xl font-semibold tabular text-[var(--accent-strong)]">
            {formatMoney(invoice.total, currency)}
          </span>
        </div>
      </div>

      {(invoice.notes || invoice.terms) && (
        <div className="mt-8 pt-5 border-t border-[var(--border)] space-y-3">
          {invoice.notes && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--ink-muted)] font-semibold mb-1">{t("notes")}</div>
              <p className="text-sm text-[var(--ink)]">{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--ink-muted)] font-semibold mb-1">{t("terms")}</div>
              <p className="text-sm text-[var(--ink)]">{invoice.terms}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function MetaLine({ label, value }) {
  return (
    <div className="flex items-center justify-end gap-3">
      <span className="text-[10px] uppercase tracking-wider text-[var(--ink-muted)] font-semibold">{label}</span>
      <span className="tabular text-[var(--ink)] w-24 text-right">{value}</span>
    </div>
  );
}

function TotalLine({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--ink-muted)]">{label}</span>
      <span className="tabular text-[var(--ink)]">{value}</span>
    </div>
  );
}

function ClientCard({ invoice }) {
  const { t } = useTranslation("invoices");
  const { t: tcl } = useTranslation("clients");
  if (!invoice.client_id) return null;
  return (
    <Card padding="lg">
      <CardTitle className="mb-3">{tcl("title")}</CardTitle>
      <Link
        to={`/clients/${invoice.client_id}`}
        className="flex items-center gap-3 group"
      >
        <div className="h-10 w-10 rounded-full bg-[var(--accent-soft)] text-[var(--accent-strong)] flex items-center justify-center font-semibold">
          {invoice.client_name?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[var(--ink)] group-hover:text-[var(--accent-strong)] truncate">
            {invoice.client_name}
          </div>
          <div className="text-xs text-[var(--ink-muted)] truncate">
            {invoice.client_email || invoice.client_company || t("viewProfile")}
          </div>
        </div>
      </Link>
    </Card>
  );
}

function PaymentReminderCard({ invoiceId }: { invoiceId: string }) {
  const { t } = useTranslation("invoices");
  const [tone, setTone] = useState<ReminderTone>("friendly");
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  const TONES: { key: ReminderTone; label: string }[] = [
    { key: "friendly", label: t("reminderTone.friendly") },
    { key: "firm", label: t("reminderTone.firm") },
    { key: "final", label: t("reminderTone.final") },
  ];

  async function generate() {
    setLoading(true);
    setErr("");
    try {
      const res = await aiApi.paymentReminder(invoiceId, tone);
      setDraft(res.draft);
      analytics.track("ai_action_used", { kind: "payment_reminder" });
    } catch (e) {
      setErr(errorMessage(e, t("saveFailed")));
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    if (!draft) return;
    const text = `Subject: ${draft.subject}\n\n${draft.body}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card padding="lg">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-8 w-8 rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)] flex items-center justify-center">
          <Sparkles size={15} />
        </div>
        <CardTitle>{t("reminderTitle")}</CardTitle>
      </div>
      <p className="text-xs text-[var(--ink-muted)] mb-3">
        {t("reminderBody")}
      </p>

      <div className="flex items-center gap-1 p-1 rounded-full bg-[var(--surface-2)] mb-3">
        {TONES.map((t) => (
          <button
            key={t.key}
            onClick={() => setTone(t.key)}
            className={cn(
              "flex-1 h-7 rounded-full text-[11px] font-semibold transition-colors",
              tone === t.key ? "bg-[var(--surface)] text-[var(--ink)] shadow-card" : "text-[var(--ink-muted)]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Button variant="accent" size="sm" className="w-full" onClick={generate} disabled={loading}>
        {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
        {draft ? t("regenerate", { ns: "dashboard" }) : t("generateDraft")}
      </Button>

      {err && <p className="text-xs text-[var(--danger)] mt-3">{err}</p>}

      {draft && (
        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="text-xs font-semibold text-[var(--ink)] truncate">{draft.subject}</div>
            <button
              onClick={copy}
              className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--accent-strong)]"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? t("copied") : t("copyReminder")}
            </button>
          </div>
          <p className="text-[13px] leading-relaxed text-[var(--ink)] whitespace-pre-wrap">{draft.body}</p>
        </div>
      )}
    </Card>
  );
}
