import { NextResponse } from "next/server";
import { FounderProjectSeedStoreError } from "./founderProjectSeeds";

export function founderProjectSeedErrorResponse(
  error: unknown,
  fallback = "seed_operation_failed",
): NextResponse {
  if (error instanceof FounderProjectSeedStoreError) {
    return NextResponse.json(
      {
        ok: false,
        error: error.code,
        message: error.message,
      },
      { status: error.code === "blob_not_configured" ? 503 : 500 },
    );
  }

  return NextResponse.json(
    {
      ok: false,
      error: error instanceof Error ? error.message : fallback,
    },
    { status: 500 },
  );
}
