import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  adminMisconfiguredHeaders,
  adminUnauthorizedHeaders,
  getAdminSecret,
  isAdminGateMisconfigured,
  isAuthorizedAdminRequest,
  shouldEnforceAdminGate,
} from "@/lib/security/adminGate";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!shouldEnforceAdminGate(pathname)) {
    return NextResponse.next();
  }

  const isApi = pathname.startsWith("/api/admin/");

  if (isAdminGateMisconfigured()) {
    const body = isApi
      ? JSON.stringify({
          ok: false,
          error: "admin_gate_misconfigured",
          message:
            "ADMIN_SECRET no está configurado en producción. Configuralo en Vercel antes de usar el admin.",
        })
      : "VocationUp admin no disponible: falta ADMIN_SECRET en el entorno de producción.";
    return new NextResponse(body, {
      status: 503,
      headers: adminMisconfiguredHeaders(isApi),
    });
  }

  const secret = getAdminSecret()!;

  if (request.nextUrl.searchParams.get("vu_admin_key") === secret) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("vu_admin_key");
    const redirect = NextResponse.redirect(url);
    redirect.cookies.set(ADMIN_COOKIE_NAME, secret, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    redirect.headers.set("X-Robots-Tag", "noindex, nofollow");
    return redirect;
  }

  if (isAuthorizedAdminRequest(request)) {
    const response = NextResponse.next();
    if (!request.cookies.get(ADMIN_COOKIE_NAME)?.value) {
      response.cookies.set(ADMIN_COOKIE_NAME, secret, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  const body = isApi
    ? JSON.stringify({
        ok: false,
        error: "admin_unauthorized",
        message: "Credencial de administración requerida.",
      })
    : "Acceso restringido. Usá usuario cualquiera y tu ADMIN_SECRET como contraseña (Basic Auth), o abrí /admin?vu_admin_key=TU_SECRET una vez.";

  return new NextResponse(body, {
    status: 401,
    headers: adminUnauthorizedHeaders(isApi),
  });
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*", "/lab", "/lab/:path*"],
};
