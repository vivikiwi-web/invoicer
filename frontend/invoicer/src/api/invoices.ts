import type { Invoice, InvoiceInput, InvoiceStatus } from "@shared/types";
import { apiClient } from "./client";

export const invoicesApi = {
	list: (params: Record<string, string | undefined> = {}) =>
		apiClient
			.get<{ invoices: Invoice[] }>("/invoices", { params })
			.then((r) => r.data.invoices),
	get: (id: string) =>
		apiClient.get<{ invoice: Invoice }>(`/invoices/${id}`).then((r) => r.data.invoice),
	create: (payload: InvoiceInput) =>
		apiClient.post<{ invoice: Invoice }>("/invoices", payload).then((r) => r.data.invoice),
	update: (id: string, payload: InvoiceInput) =>
		apiClient
			.patch<{ invoice: Invoice }>(`/invoices/${id}`, payload)
			.then((r) => r.data.invoice),
	setStatus: (id: string, status: InvoiceStatus) =>
		apiClient
			.patch<{ invoice: Invoice }>(`/invoices/${id}/status`, { status })
			.then((r) => r.data.invoice),
	remove: (id: string) =>
		apiClient.delete<{ ok: boolean }>(`/invoices/${id}`).then((r) => r.data),
};
