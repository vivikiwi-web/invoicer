import type { Client } from "@shared/types";
import { apiClient } from "./client";

export type ClientPayload = Partial<
	Pick<Client, "name" | "email" | "company" | "phone" | "address" | "notes">
>;

export const clientsApi = {
	list: () => apiClient.get<{ clients: Client[] }>("/clients").then((r) => r.data.clients),
	get: (id: string) =>
		apiClient
			.get<{
				client: Client;
				invoices: Array<{
					id: string;
					invoice_number: string;
					status: string;
					issue_date: string;
					due_date: string | null;
					total: number;
					currency: string;
					created_at: string;
				}>;
				stats: { totalBilled: number; outstanding: number; count: number };
			}>(`/clients/${id}`)
			.then((r) => r.data),
	create: (payload: ClientPayload) =>
		apiClient.post<{ client: Client }>("/clients", payload).then((r) => r.data.client),
	update: (id: string, payload: ClientPayload) =>
		apiClient
			.patch<{ client: Client }>(`/clients/${id}`, payload)
			.then((r) => r.data.client),
	remove: (id: string) =>
		apiClient.delete<{ ok: boolean }>(`/clients/${id}`).then((r) => r.data),
};
