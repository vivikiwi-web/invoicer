import type { DashboardData } from "@shared/types";
import { apiClient } from "./client";

export const dashboardApi = {
	get: () => apiClient.get<DashboardData>("/dashboard").then((r) => r.data),
};
