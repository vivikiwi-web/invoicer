import type { User } from "../../shared/types";

declare global {
	namespace Express {
		interface Request {
			user?: User & { token_version?: number };
		}
	}
}

export {};
