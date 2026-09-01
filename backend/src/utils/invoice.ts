import {
	computeTotals,
	effectiveStatus,
	round2,
} from "../../../shared/invoice";

function serializeInvoice(row, items) {
	const num = (v) => (v == null ? 0 : Number(v));
	const base = {
		...row,
		tax_rate: num(row.tax_rate),
		discount: num(row.discount),
		subtotal: num(row.subtotal),
		tax_amount: num(row.tax_amount),
		total: num(row.total),
	};

	base.effective_status = effectiveStatus(base);

	if (items) {
		base.items = items.map((it) => ({
			...it,
			quantity: num(it.quantity),
			rate: num(it.rate),
			amount: num(it.amount),
		}));
	}

	return base;
}

module.exports = { round2, computeTotals, effectiveStatus, serializeInvoice };
