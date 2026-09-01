import type { CompanySettings } from "@shared/types";
import { apiClient } from "./client";

export const settingsApi = {
	get: () =>
		apiClient.get<{ settings: CompanySettings }>("/settings").then((r) => r.data.settings),
	update: (payload: Partial<CompanySettings>) =>
		apiClient
			.patch<{ settings: CompanySettings }>("/settings", payload)
			.then((r) => r.data.settings),
};
