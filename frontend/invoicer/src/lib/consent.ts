export const CONSENT_VERSION = 1;
export const CONSENT_COOKIE = "invoicer_consent";
export const CONSENT_STORAGE_KEY = "invoicer_consent";
const MAX_AGE_DAYS = 180;

export interface ConsentState {
  version: number;
  necessary: true;
  analytics: boolean;
  updatedAt: string;
}

export function defaultConsent(): ConsentState {
  return {
    version: CONSENT_VERSION,
    necessary: true,
    analytics: false,
    updatedAt: new Date().toISOString(),
  };
}

export function parseConsent(raw: string | null | undefined): ConsentState | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as ConsentState;
    if (data.version !== CONSENT_VERSION) return null;
    if (typeof data.analytics !== "boolean") return null;
    return {
      version: CONSENT_VERSION,
      necessary: true,
      analytics: data.analytics,
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function readConsent(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const fromLs = parseConsent(localStorage.getItem(CONSENT_STORAGE_KEY));
  if (fromLs) return fromLs;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  if (!match) return null;
  return parseConsent(decodeURIComponent(match[1]));
}

export function writeConsent(state: ConsentState) {
  const payload = JSON.stringify(state);
  localStorage.setItem(CONSENT_STORAGE_KEY, payload);
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(payload)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}
