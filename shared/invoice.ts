import type { EffectiveStatus, InvoiceStatus } from "./types";

export interface TotalsItemInput {
	description?: string;
	quantity?: number;
	rate?: number;
	position?: number;
}

export interface ComputedLineItem {
	description: string;
	quantity: number;
	rate: number;
	amount: number;
	position: number;
}

export interface InvoiceTotals {
	items: ComputedLineItem[];
	subtotal: number;
	discount: number;
	taxAmount: number;
	total: number;
}

export function round2(n: number): number {
	return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

/**
 * Canonical invoice math. Discount is a flat amount (not a percent).
 * Tax is a percent of (subtotal - discount). Totals are rounded to 2 decimals.
 */
export function computeTotals(
	items: TotalsItemInput[] | null | undefined,
	taxRate = 0,
	discount = 0,
): InvoiceTotals {
	const normItems = (items || []).map((it, i) => {
		const quantity = Number(it.quantity) || 0;
		const rate = Number(it.rate) || 0;
		return {
			description: (it.description || "").toString(),
			quantity,
			rate,
			amount: round2(quantity * rate),
			position: it.position ?? i,
		};
	});

	const subtotal = round2(normItems.reduce((sum, it) => sum + it.amount, 0));
	const disc = Math.min(round2(Number(discount) || 0), subtotal);
	const taxableBase = round2(subtotal - disc);
	const taxAmount = round2((taxableBase * (Number(taxRate) || 0)) / 100);
	const total = round2(taxableBase + taxAmount);

	return { items: normItems, subtotal, discount: disc, taxAmount, total };
}

export function effectiveStatus(invoice: {
	status: InvoiceStatus | string;
	due_date?: string | Date | null;
}): EffectiveStatus {
	if (invoice.status === "paid") return "paid";
	if (invoice.status === "sent" && invoice.due_date) {
		const due = new Date(invoice.due_date);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		if (due < today) return "overdue";
	}
	if (invoice.status === "draft" || invoice.status === "sent") {
		return invoice.status;
	}
	return "draft";
}
