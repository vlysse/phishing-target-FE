import { useEffect } from "react";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

const APP_HOST = (import.meta.env.VITE_CANONICAL_HOST as string | undefined)?.trim();
const LOGIN_HOST = (import.meta.env.VITE_LOGIN_HOST as string | undefined)?.trim();

function isLocalHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

/**
 * Send the browser to the login subdomain (e.g. login.tdvx.site). Returns true
 * if a redirect was issued, false if it was a no-op (localhost, already there,
 * or VITE_LOGIN_HOST unset) — so callers can fall back to in-app routing.
 */
export function goToLoginHost(): boolean {
  if (!LOGIN_HOST) return false;
  const { hostname, protocol } = window.location;
  if (isLocalHost(hostname) || hostname === LOGIN_HOST) return false;
  window.location.replace(`${protocol}//${LOGIN_HOST}/`);
  return true;
}

/** Send the browser to the app (canonical) subdomain, preserving the path. */
export function goToAppHost(): boolean {
  if (!APP_HOST) return false;
  const { hostname, protocol, pathname, search, hash } = window.location;
  if (isLocalHost(hostname) || hostname === APP_HOST) return false;
  window.location.replace(`${protocol}//${APP_HOST}${pathname}${search}${hash}`);
  return true;
}

/**
 * RootGate guard: once the user is authenticated, make sure they're on the app
 * subdomain. No-op on localhost or when already there.
 */
export function useCanonicalHost(status: AuthStatus) {
  useEffect(() => {
    if (status === "authenticated") goToAppHost();
  }, [status]);
}

/**
 * App-scaffold guard: when the user is not logged in, bounce them to the login
 * subdomain. It reacts to `status`, so logging out (JWT cleared →
 * unauthenticated) triggers the same redirect. No-op while auth is still
 * loading, on localhost, or when already on the login host — so the login +
 * MFA flow (which runs on that host while unauthenticated) isn't disrupted.
 */
export function useRequireLoginHost(status: AuthStatus) {
  useEffect(() => {
    if (status === "unauthenticated") goToLoginHost();
  }, [status]);
}
