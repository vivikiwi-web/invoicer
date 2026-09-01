import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Invoice, InvoiceInput, InvoiceStatus } from "@shared/types";
import { invoicesApi } from "@/api/invoices";

export const invoicesKey = (params?: Record<string, string | undefined>) =>
  ["invoices", params || {}] as const;
export const invoiceKey = (id: string) => ["invoice", id] as const;

export function useInvoices(params?: Record<string, string | undefined>) {
  return useQuery({
    queryKey: invoicesKey(params),
    queryFn: () => invoicesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: invoiceKey(id || ""),
    queryFn: () => invoicesApi.get(id ?? ""),
    enabled: !!id,
  });
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["invoices"] });
  qc.invalidateQueries({ queryKey: ["dashboard"] });
  qc.invalidateQueries({ queryKey: ["clients"] });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: InvoiceInput) => invoicesApi.create(payload),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: InvoiceInput }) =>
      invoicesApi.update(id, payload),
    onSuccess: (inv: Invoice) => {
      invalidateAll(qc);
      if (inv?.id) qc.invalidateQueries({ queryKey: invoiceKey(inv.id) });
    },
  });
}

export function useSetInvoiceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: InvoiceStatus }) =>
      invoicesApi.setStatus(id, status),
    onSuccess: (inv: Invoice) => {
      invalidateAll(qc);
      if (inv?.id) qc.invalidateQueries({ queryKey: invoiceKey(inv.id) });
    },
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invoicesApi.remove(id),
    onSuccess: () => invalidateAll(qc),
  });
}
