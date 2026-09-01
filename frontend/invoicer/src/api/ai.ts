import type { ReceiptParseResult, ReminderTone } from "@shared/types";
import { apiClient } from "./client";

export const aiApi = {
	receiptParse: (file: File) => {
		const form = new FormData();
		form.append("file", file);
		return apiClient
			.post<{ result: ReceiptParseResult }>("/ai/receipt-parse", form, {
				headers: { "Content-Type": "multipart/form-data" },
			})
			.then((r) => r.data.result);
	},
	businessSummary: () =>
		apiClient
			.post<{ summary: string; data: Record<string, unknown> }>("/ai/business-summary")
			.then((r) => r.data),
	paymentReminder: (invoiceId: string, tone: ReminderTone) =>
		apiClient
			.post<{
				draft: { subject: string; body: string };
				meta: { daysOverdue: number; to: string };
			}>("/ai/payment-reminder", { invoiceId, tone })
			.then((r) => r.data),
	writeNote: (payload: {
		kind?: "description" | "terms";
		prompt?: string;
		items?: Array<{ description?: string; quantity?: number; rate?: number }>;
		client?: { name?: string };
	}) => apiClient.post<{ text: string }>("/ai/write-note", payload).then((r) => r.data.text),
};
