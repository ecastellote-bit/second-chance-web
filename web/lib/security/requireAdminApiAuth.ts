import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  adminMisconfiguredHeaders,
  adminUnauthorizedHeaders,
  isAdminGateMisconfigured,
  isAuthorizedAdminRequest,
  isProductionNodeEnv,
} from "@/lib/security/adminGate";

/**
 * Gate for sensitive admin-read APIs outside `/api/admin/*` (not covered by middleware).
 * Matches production-only enforcement used by middleware for `/admin` and `/api/admin`.
 */
export function requireAdminApiAuth(request: NextRequest): NextResponse | null {
  if (!isProductionNodeEnv()) {
    return null;
  }

  if (isAdminGateMisconfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "admin_gate_misconfigured",
        message:
          "ADMIN_SECRET no está configurado en producción. Configuralo en Vercel antes de usar el admin.",
      },
      { status: 503, headers: adminMisconfiguredHeaders(true) },
    );
  }

  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json(
      {
        ok: false,
        error: "admin_unauthorized",
        message: "Credencial de administración requerida.",
      },
      { status: 401, headers: adminUnauthorizedHeaders(true) },
    );
  }

  return null;
}
