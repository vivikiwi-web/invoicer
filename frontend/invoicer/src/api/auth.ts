import type { Locale, User } from "@shared/types";
import { apiClient } from "./client";

export interface AuthCredentials {
	email: string;
	password: string;
}

export interface RegisterPayload extends AuthCredentials {
	name: string;
	companyName?: string;
	address?: string;
	locale?: Locale;
}

export const authApi = {
	register: (payload: RegisterPayload) =>
		apiClient.post<{ user: User }>("/auth/register", payload).then((r) => r.data),
	login: (payload: AuthCredentials) =>
		apiClient.post<{ user: User }>("/auth/login", payload).then((r) => r.data),
	logout: () => apiClient.post<{ ok: boolean }>("/auth/logout").then((r) => r.data),
	me: () => apiClient.get<{ user: User }>("/auth/me").then((r) => r.data),
	updateProfile: (payload: { name?: string; locale?: Locale }) =>
		apiClient.patch<{ user: User }>("/auth/profile", payload).then((r) => r.data),
	changePassword: (payload: { currentPassword: string; newPassword: string }) =>
		apiClient.patch<{ ok: boolean }>("/auth/password", payload).then((r) => r.data),
};
