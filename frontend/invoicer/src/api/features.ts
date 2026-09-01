import type { CatalogItem, Expense, Payment, ReportsData } from "@shared/types";
import { apiClient } from "./client";

export const itemsApi = {
	list: () =>
		apiClient.get<{ items: CatalogItem[] }>("/items").then((r) => r.data.items),
	create: (payload: Partial<CatalogItem>) =>
		apiClient.post<{ item: CatalogItem }>("/items", payload).then((r) => r.data.item),
	update: (id: string, payload: Partial<CatalogItem>) =>
		apiClient
			.patch<{ item: CatalogItem }>(`/items/${id}`, payload)
			.then((r) => r.data.item),
	remove: (id: string) =>
		apiClient.delete<{ ok: boolean }>(`/items/${id}`).then((r) => r.data),
};

export const expensesApi = {
	list: (params: Record<string, string> = {}) =>
		apiClient
			.get<{
				expenses: Expense[];
				totals: { total: number; thisMonth: number };
				categories: string[];
			}>("/expenses", { params })
			.then((r) => r.data),
	create: (payload: Partial<Expense>) =>
		apiClient.post<{ expense: Expense }>("/expenses", payload).then((r) => r.data.expense),
	update: (id: string, payload: Partial<Expense>) =>
		apiClient
			.patch<{ expense: Expense }>(`/expenses/${id}`, payload)
			.then((r) => r.data.expense),
	remove: (id: string) =>
		apiClient.delete<{ ok: boolean }>(`/expenses/${id}`).then((r) => r.data),
};

export const paymentsApi = {
	list: () =>
		apiClient
			.get<{
				payments: Payment[];
				totals: { total: number; this_month: number };
			}>("/payments")
			.then((r) => r.data),
	create: (payload: {
		invoiceId: string;
		amount: number;
		method?: string;
		paid_on?: string;
		notes?: string;
	}) =>
		apiClient.post<{ payment: Payment }>("/payments", payload).then((r) => r.data.payment),
	remove: (id: string) =>
		apiClient.delete<{ ok: boolean }>(`/payments/${id}`).then((r) => r.data),
};

export const reportsApi = {
	get: () => apiClient.get<ReportsData>("/reports").then((r) => r.data),
};
