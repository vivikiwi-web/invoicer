import axios, { type AxiosError } from "axios";
import type { ApiErrorShape } from "@shared/types";

export const apiClient = axios.create({
	baseURL: "/api",
	withCredentials: true,
	headers: { "Content-Type": "application/json" },
});

const AUTH_PROBE = ["/auth/me", "/auth/login", "/auth/register"];

function isAuthProbe(url = "") {
	return AUTH_PROBE.some((path) => url.includes(path));
}

apiClient.interceptors.response.use(
	(res) => res,
	(err: AxiosError<{ error?: { message?: string; details?: unknown } }>) => {
		const status = err.response?.status;
		const url = err.config?.url || "";

		if (
			status === 401 &&
			!isAuthProbe(url) &&
			typeof window !== "undefined" &&
			!window.location.pathname.startsWith("/login")
		) {
			window.location.assign("/login");
		}

		const payload: ApiErrorShape = {
			status,
			message:
				err.response?.data?.error?.message ||
				err.message ||
				"Request failed",
			details: err.response?.data?.error?.details,
		};
		return Promise.reject(payload);
	},
);
