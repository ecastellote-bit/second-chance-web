import { NextResponse } from "next/server";
import { listProjectsFiltered } from "@/lib/projects-vivos/projectStore";
import type { ProjectStatus } from "@/lib/projects-vivos/projectTypes";
import { createProjectWithRoles } from "@/lib/projects-vivos/projectStore";
import {
  mapProjectError,
  missingUserIdResponse,
  requireCommunityUser,
  requireUserId,
} from "@/lib/projects-vivos/apiHelpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const familiaVocacional = url.searchParams.get("familiaVocacional") ?? "";
    const city = url.searchParams.get("city") ?? "";
    const status = (url.searchParams.get("status") ?? "") as ProjectStatus | "";
    const q = url.searchParams.get("q") ?? url.searchParams.get("search") ?? "";
    const limit = Number(url.searchParams.get("limit") ?? "24");
    const offset = Number(url.searchParams.get("offset") ?? "0");

    const { projects, total } = await listProjectsFiltered({
      familiaVocacional,
      city,
      status: status || "",
      q,
      limit: Number.isFinite(limit) ? limit : 24,
      offset: Number.isFinite(offset) ? offset : 0,
    });

    return NextResponse.json({
      ok: true,
      projects,
      total,
      limit: Number.isFinite(limit) ? limit : 24,
      offset: Number.isFinite(offset) ? offset : 0,
    });
  } catch (error) {
    return mapProjectError(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      userId?: string;
      title?: string;
      description?: string;
      familiaVocacional?: string;
      familiaVocacionalId?: string;
      city?: string;
      coverImage?: string | null;
      roles?: Array<{
        title?: string;
        description?: string;
        skillsNeeded?: string[];
      }>;
    };

    const userId = requireUserId(body.userId);
    if (!userId) return missingUserIdResponse();

    const denied = await requireCommunityUser(userId);
    if (denied) return denied;

    const project = await createProjectWithRoles({
      userId,
      title: body.title ?? "",
      description: body.description ?? "",
      familiaVocacional: body.familiaVocacional ?? "",
      familiaVocacionalId: body.familiaVocacionalId ?? "",
      city: body.city ?? "",
      coverImage: body.coverImage ?? null,
      roles: (body.roles ?? []).map((role) => ({
        title: role.title ?? "",
        description: role.description ?? "",
        skillsNeeded: Array.isArray(role.skillsNeeded) ? role.skillsNeeded : [],
      })),
    });

    return NextResponse.json({ ok: true, project }, { status: 201 });
  } catch (error) {
    return mapProjectError(error);
  }
}
