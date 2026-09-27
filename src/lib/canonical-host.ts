import { useEffect } from "react";

/**
 * Forces the app onto its canonical host (e.g. app.tdvx.site). If the page is
 * loaded on any other production hostname — a bare *.vercel.app URL, or a
 * sibling subdomain like login.tdvx.site — the browser is redirected to the
 * same path on VITE_CANONICAL_HOST. Localhost/dev is never redirected, and the
 * guard is a no-op when VITE_CANONICAL_HOST is unset.
 */
export function useCanonicalHost() {
  useEffect(() => {
    const canonical = (import.meta.env.VITE_CANONICAL_HOST as string | undefined)?.trim();
    if (!canonical) return;

    const { hostname, protocol, pathname, search, hash } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") return;
    if (hostname === canonical) return;

    window.location.replace(`${protocol}//${canonical}${pathname}${search}${hash}`);
  }, []);
}
