import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CatalogItem, Expense } from "@shared/types";
import { itemsApi, expensesApi, paymentsApi, reportsApi } from "@/api/features";

export const itemsKey = ["items"] as const;
export function useItems() {
  return useQuery({ queryKey: itemsKey, queryFn: () => itemsApi.list() });
}
export function useItemMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: itemsKey });
  return {
    create: useMutation({ mutationFn: itemsApi.create, onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: Partial<CatalogItem> }) =>
        itemsApi.update(id, payload),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: itemsApi.remove, onSuccess: invalidate }),
  };
}

export const expensesKey = (params?: Record<string, string>) =>
  ["expenses", params || {}] as const;
export function useExpenses(params?: Record<string, string>) {
  return useQuery({
    queryKey: expensesKey(params),
    queryFn: () => expensesApi.list(params),
  });
}
export function useExpenseMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["expenses"] });
    qc.invalidateQueries({ queryKey: ["reports"] });
  };
  return {
    create: useMutation({ mutationFn: expensesApi.create, onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, payload }: { id: string; payload: Partial<Expense> }) =>
        expensesApi.update(id, payload),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: expensesApi.remove, onSuccess: invalidate }),
  };
}

export const paymentsKey = ["payments"] as const;
export function usePayments() {
  return useQuery({ queryKey: paymentsKey, queryFn: () => paymentsApi.list() });
}
export function usePaymentMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: paymentsKey });
    qc.invalidateQueries({ queryKey: ["invoices"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["reports"] });
  };
  return {
    create: useMutation({ mutationFn: paymentsApi.create, onSuccess: invalidate }),
    remove: useMutation({ mutationFn: paymentsApi.remove, onSuccess: invalidate }),
  };
}

export const reportsKey = ["reports"] as const;
export function useReports() {
  return useQuery({ queryKey: reportsKey, queryFn: () => reportsApi.get() });
}
