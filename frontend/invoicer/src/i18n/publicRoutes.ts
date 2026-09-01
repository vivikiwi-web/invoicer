import type { Locale } from "@shared/types";

export type PublicPageId =
  | "home"
  | "pricing"
  | "privacy"
  | "cookies"
  | "terms"
  | "billing"
  | "refund";

export const PUBLIC_PATHS: Record<PublicPageId, Record<Locale, string>> = {
  home: { lt: "/", en: "/en" },
  pricing: { lt: "/kainos", en: "/en/pricing" },
  privacy: { lt: "/privatumo-politika", en: "/en/privacy-policy" },
  cookies: { lt: "/slapuku-politika", en: "/en/cookie-policy" },
  terms: { lt: "/naudojimosi-taisykles", en: "/en/terms" },
  billing: { lt: "/apmokejimo-salygos", en: "/en/billing" },
  refund: { lt: "/grazinimo-politika", en: "/en/refund-policy" },
};

const PATH_TO_PAGE = new Map<string, PublicPageId>();
for (const [id, paths] of Object.entries(PUBLIC_PATHS) as Array<
  [PublicPageId, Record<Locale, string>]
>) {
  PATH_TO_PAGE.set(paths.lt, id);
  PATH_TO_PAGE.set(paths.en, id);
}

export function localeFromPublicPath(pathname: string): Locale | null {
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  if (PATH_TO_PAGE.has(pathname) || pathname === "/") return "lt";
  return null;
}

export function publicPageFromPath(pathname: string): PublicPageId | null {
  return PATH_TO_PAGE.get(pathname) ?? null;
}

export function siblingPublicPath(pathname: string, locale: Locale): string | null {
  const id = publicPageFromPath(pathname);
  if (!id) return null;
  return PUBLIC_PATHS[id][locale];
}

export function canonicalUrl(origin: string, pathname: string) {
  const path = pathname === "/" ? "" : pathname;
  return `${origin.replace(/\/$/, "")}${path || "/"}`;
}
