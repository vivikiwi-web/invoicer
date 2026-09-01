import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { useCreateClient, useUpdateClient } from "@/hooks/useClients";
import { errorMessage } from "@/lib/utils";
import { analytics } from "@/lib/analytics";
import type { Client, DocumentLanguage } from "@shared/types";

const EMPTY = {
  name: "",
  email: "",
  company: "",
  phone: "",
  address: "",
  notes: "",
  document_language: "" as "" | DocumentLanguage,
};

export function ClientFormModal({
  open,
  onClose,
  client,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  client?: Client | null;
  onCreated?: (client: Client) => void;
}) {
  const { t } = useTranslation("clients");
  const { t: tc } = useTranslation("common");
  const isEdit = !!client;
  const create = useCreateClient();
  const update = useUpdateClient();
  const [form, setForm] = useState(EMPTY);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        client
          ? {
              name: client.name || "",
              email: client.email || "",
              company: client.company || "",
              phone: client.phone || "",
              address: client.address || "",
              notes: client.notes || "",
              document_language: client.document_language || "",
            }
          : EMPTY,
      );
      setErr("");
    }
  }, [open, client]);

  const set =
    (k: keyof typeof EMPTY) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setErr(t("nameRequired"));
      return;
    }
    setSaving(true);
    setErr("");
    const payload = {
      ...form,
      document_language: form.document_language || null,
    };
    try {
      if (isEdit && client?.id) {
        await update.mutateAsync({ id: client.id, payload });
        onClose();
      } else {
        const created = await create.mutateAsync(payload);
        analytics.track("client_created");
        onCreated?.(created);
        onClose();
      }
    } catch (ex) {
      setErr(errorMessage(ex, t("saveFailed")));
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-[var(--ink)]/30 backdrop-blur-sm" onClick={onClose} />
          <motion.form
            role="dialog"
            aria-modal="true"
            aria-labelledby="client-form-title"
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[520px] rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-hover p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 id="client-form-title" className="font-display text-lg font-semibold tracking-tight">
                {isEdit ? t("edit") : t("add")}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full flex items-center justify-center text-[var(--ink-muted)] hover:bg-[var(--surface-2)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <Field label={`${t("name")} *`}>
                <Input value={form.name} onChange={set("name")} placeholder="UAB Pavyzdys" />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={t("email")}>
                  <Input type="email" value={form.email} onChange={set("email")} placeholder="billing@acme.com" />
                </Field>
                <Field label={t("company")}>
                  <Input value={form.company} onChange={set("company")} />
                </Field>
              </div>
              <Field label={t("phone")}>
                <Input value={form.phone} onChange={set("phone")} />
              </Field>
              <Field label={t("address")}>
                <Input value={form.address} onChange={set("address")} />
              </Field>
              <Field label={tc("documentLanguage.label")}>
                <Select
                  value={form.document_language || "inherit"}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      document_language: v === "inherit" ? "" : (v as DocumentLanguage),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inherit">{tc("documentLanguage.inherit")}</SelectItem>
                    <SelectItem value="lt">{tc("documentLanguage.lt")}</SelectItem>
                    <SelectItem value="en">{tc("documentLanguage.en")}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t("notes")}>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={set("notes")}
                  placeholder={t("notesPlaceholder")}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] outline-none resize-y focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/15"
                />
              </Field>
            </div>

            {err && <p className="text-sm text-[var(--danger)] mt-3">{err}</p>}

            <div className="flex items-center justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                {tc("cancel")}
              </Button>
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
