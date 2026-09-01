import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Plus, Package, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useItems, useItemMutations } from "@/hooks/useFeatures";
import { useSettings } from "@/hooks/useSettings";
import type { CatalogItem } from "@shared/types";
import { formatMoney, errorMessage } from "@/lib/utils";

export default function Items() {
  const { t } = useTranslation("catalog");
  const { t: tc } = useTranslation("common");
  const { data: items, isLoading } = useItems();
  const { data: settings } = useSettings();
  const currency = settings?.currency || "EUR";
  const [modal, setModal] = useState<Partial<CatalogItem> | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const { remove } = useItemMutations();

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button variant="accent" onClick={() => setModal({})}>
            <Plus size={16} /> {t("add")}
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-3xl" />
          ))}
        </div>
      ) : !items?.length ? (
        <EmptyState
          icon={Package}
          title={t("empty")}
          description={t("emptyDesc")}
          action={
            <Button variant="accent" onClick={() => setModal({})}>
              <Plus size={16} /> {t("add")}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} padding="lg" className="group cursor-pointer" onClick={() => setModal(item)}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-[var(--ink)] truncate">{item.name}</div>
                  {item.description && (
                    <p className="text-xs text-[var(--ink-muted)] mt-1 line-clamp-2">{item.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); setModal(item); }}
                    className="h-7 w-7 rounded-full flex items-center justify-center text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingDelete({ id: item.id, name: item.name });
                    }}
                    className="h-7 w-7 rounded-full flex items-center justify-center text-[var(--ink-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--danger)]"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="font-display text-xl font-semibold tabular text-[var(--accent-strong)]">
                  {formatMoney(item.rate, currency)}
                </span>
                {item.unit && <span className="text-xs text-[var(--ink-muted)]">/ {item.unit}</span>}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ItemModal open={!!modal} item={modal?.id ? modal : null} onClose={() => setModal(null)} />
      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => { if (!o) setPendingDelete(null); }}
        title={t("deleteTitle")}
        description={t("deleteBody", { name: pendingDelete?.name })}
        confirmLabel={tc("delete")}
        cancelLabel={tc("cancel")}
        danger
        onConfirm={async () => {
          if (pendingDelete) await remove.mutateAsync(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

const EMPTY = { name: "", description: "", rate: 0, unit: "" };

function ItemModal({ open, item, onClose }) {
  const { t } = useTranslation("catalog");
  const { t: tc } = useTranslation("common");
  const isEdit = !!item;
  const { create, update } = useItemMutations();
  const [form, setForm] = useState(EMPTY);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(item ? { name: item.name, description: item.description || "", rate: item.rate, unit: item.unit || "" } : EMPTY);
      setErr("");
    }
  }, [open, item]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return setErr(t("nameRequired"));
    setSaving(true);
    setErr("");
    try {
      const payload = { ...form, rate: Number(form.rate) || 0 };
      if (isEdit) await update.mutateAsync({ id: item.id, payload });
      else await create.mutateAsync(payload);
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
            className="relative w-full max-w-[460px] rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-hover p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-semibold tracking-tight">{isEdit ? t("edit") : t("add")}</h3>
              <button type="button" onClick={onClose} className="h-8 w-8 rounded-full flex items-center justify-center text-[var(--ink-muted)] hover:bg-[var(--surface-2)]">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <Field label={`${t("name")} *`}>
                <Input value={form.name} onChange={set("name")} placeholder={t("namePlaceholder")} />
              </Field>
              <Field label={t("descriptionLabel")}>
                <Input value={form.description} onChange={set("description")} placeholder={t("descPlaceholder")} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t("rate")}>
                  <Input type="number" min="0" step="0.01" value={form.rate} onChange={set("rate")} className="tabular" />
                </Field>
                <Field label={t("unit")}>
                  <Input value={form.unit} onChange={set("unit")} placeholder={t("unitPlaceholder")} />
                </Field>
              </div>
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
