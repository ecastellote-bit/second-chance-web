import { NextResponse } from "next/server";
import {
  FounderProjectSignalStoreError,
  type FounderProjectSignalStatus,
  type FounderProjectSignalType,
  getFounderProjectSignalStoreMeta,
  listFounderProjectSignals,
} from "@/lib/learning/founderProjectSignals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set<FounderProjectSignalStatus>([
  "active",
  "withdrawn",
  "updated",
  "reviewed",
  "flagged",
]);

const VALID_TYPES = new Set<FounderProjectSignalType>([
  "project_follow_close",
  "project_interest",
  "project_possible_contribution",
  "project_join_exploration",
]);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId")?.trim() || undefined;
    const actorUserId = url.searchParams.get("actorUserId")?.trim() || undefined;
    const statusParam = url.searchParams.get("status")?.trim();
    const typeParam = url.searchParams.get("signalType")?.trim();
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 300), 2000);

    const status =
      statusParam && VALID_STATUSES.has(statusParam as FounderProjectSignalStatus)
        ? (statusParam as FounderProjectSignalStatus)
        : undefined;
    const signalType =
      typeParam && VALID_TYPES.has(typeParam as FounderProjectSignalType)
        ? (typeParam as FounderProjectSignalType)
        : undefined;

    const signals = await listFounderProjectSignals({
      projectId,
      actorUserId,
      status,
      signalType,
      limit,
    });

    const byProject = new Map<
      string,
      {
        projectId: string;
        projectTitle: string;
        projectStatus: "published";
        totals: Record<FounderProjectSignalType, number>;
      }
    >();

    for (const signal of signals) {
      const current = byProject.get(signal.projectId) ?? {
        projectId: signal.projectId,
        projectTitle: signal.projectTitle,
        projectStatus: "published" as const,
        totals: {
          project_follow_close: 0,
          project_interest: 0,
          project_possible_contribution: 0,
          project_join_exploration: 0,
        },
      };
      current.totals[signal.signalType] += 1;
      byProject.set(signal.projectId, current);
    }

    return NextResponse.json({
      ok: true,
      total: signals.length,
      signals,
      summaryByProject: [...byProject.values()],
      store: getFounderProjectSignalStoreMeta(),
    });
  } catch (error) {
    if (error instanceof FounderProjectSignalStoreError) {
      return NextResponse.json(
        { ok: false, error: error.code, message: error.message },
        { status: error.code === "blob_not_configured" ? 503 : 500 },
      );
    }
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "list_failed" },
      { status: 500 },
    );
  }
}
