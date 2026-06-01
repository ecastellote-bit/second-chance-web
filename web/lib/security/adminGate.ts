import type { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "vu_admin_session";
const BASIC_REALM = "VocationUp Admin";

export function getAdminSecret(): string | undefined {
  const secret = process.env.ADMIN_SECRET?.trim();
  return secret || undefined;
}

export function isProductionNodeEnv(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Production without ADMIN_SECRET: admin/lab must stay closed. */
export function isAdminGateMisconfigured(): boolean {
  return isProductionNodeEnv() && !getAdminSecret();
}

export function isProtectedAdminOrLabPath(pathname: string): boolean {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/api/admin/") ||
    pathname === "/lab" ||
    pathname.startsWith("/lab/")
  );
}

export function shouldEnforceAdminGate(pathname: string): boolean {
  if (!isProtectedAdminOrLabPath(pathname)) return false;
  if (!isProductionNodeEnv()) return false;
  return true;
}

function readBasicAuthPassword(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return null;
  try {
    const decoded = atob(header.slice(6));
    const colon = decoded.indexOf(":");
    if (colon < 0) return decoded.trim() || null;
    return decoded.slice(colon + 1).trim() || null;
  } catch {
    return null;
  }
}

export function isAuthorizedAdminRequest(request: NextRequest): boolean {
  const secret = getAdminSecret();
  if (!secret) return false;

  if (request.cookies.get(ADMIN_COOKIE_NAME)?.value === secret) return true;
  if (request.headers.get("x-vu-admin-secret") === secret) return true;
  if (request.nextUrl.searchParams.get("vu_admin_key") === secret) return true;

  const basicPassword = readBasicAuthPassword(request);
  if (basicPassword === secret) return true;

  return false;
}

export function adminUnauthorizedHeaders(isApi: boolean): HeadersInit {
  const headers: Record<string, string> = {
    "X-Robots-Tag": "noindex, nofollow",
  };
  if (isApi) {
    headers["Content-Type"] = "application/json; charset=utf-8";
  } else {
    headers["WWW-Authenticate"] = `Basic realm="${BASIC_REALM}", charset="UTF-8"`;
  }
  return headers;
}

export function adminMisconfiguredHeaders(isApi: boolean): HeadersInit {
  return {
    "Content-Type": isApi ? "application/json; charset=utf-8" : "text/plain; charset=utf-8",
    "X-Robots-Tag": "noindex, nofollow",
    "Cache-Control": "no-store",
  };
}
