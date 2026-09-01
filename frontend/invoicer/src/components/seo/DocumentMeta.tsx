import { useEffect } from "react";
import type { Locale } from "@shared/types";
import { PUBLIC_PATHS, type PublicPageId } from "@/i18n/publicRoutes";

export function DocumentMeta({
  title,
  description,
  locale,
  page,
}: {
  title: string;
  description: string;
  locale: Locale;
  page: PublicPageId;
}) {
  useEffect(() => {
    document.title = title;
    document.documentElement.lang = locale;

    const origin = window.location.origin;
    const ltPath = PUBLIC_PATHS[page].lt;
    const enPath = PUBLIC_PATHS[page].en;
    const canonicalPath = PUBLIC_PATHS[page][locale];

    setLink("canonical", origin + (canonicalPath === "/" ? "/" : canonicalPath));
    setAlt("lt", origin + (ltPath === "/" ? "/" : ltPath));
    setAlt("en", origin + enPath);
    setAlt("x-default", origin + (ltPath === "/" ? "/" : ltPath));

    setMeta("description", description);
  }, [title, description, locale, page]);

  return null;
}

function setMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setAlt(hreflang: string, href: string) {
  let el = document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "alternate");
    el.setAttribute("hreflang", hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}
