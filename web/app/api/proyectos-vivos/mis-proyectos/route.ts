import { NextResponse } from "next/server";
import { listMisProyectos } from "@/lib/projects-vivos/projectStore";
import {
  mapProjectError,
  missingUserIdResponse,
  requireUserId,
} from "@/lib/projects-vivos/apiHelpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const userId = requireUserId(new URL(req.url).searchParams.get("userId"));
    if (!userId) return missingUserIdResponse();

    const data = await listMisProyectos(userId);
    return NextResponse.json({ ok: true, ...data });
  } catch (error) {
    return mapProjectError(error);
  }
}
