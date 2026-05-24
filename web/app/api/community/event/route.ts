import { NextResponse } from "next/server";
import {
  recordActivationSelected,
  recordCircleInterest,
  recordFormationOrEventInterest,
  recordProjectInterest,
} from "@/lib/community/communityRecords";
import {
  getOfficialActivationPath,
  isOfficialActivationPathId,
} from "@/lib/content/officialActivationPaths";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    const archiveId =
      typeof body.archiveId === "string" ? body.archiveId.trim() : null;
    const event = typeof body.event === "string" ? body.event : "";

    if (!userId || !event) {
      return NextResponse.json(
        { ok: false, error: "invalid_event_payload" },
        { status: 400 },
      );
    }

    switch (event) {
      case "activation_selected": {
        const pathId = typeof body.pathId === "string" ? body.pathId : "";
        const pathLabel =
          typeof body.pathLabel === "string"
            ? body.pathLabel
            : getOfficialActivationPath(pathId)?.label ?? pathId;
        if (!isOfficialActivationPathId(pathId)) {
          return NextResponse.json({ ok: false, error: "invalid_path" }, { status: 400 });
        }
        await recordActivationSelected({
          userId,
          archiveId,
          pathId,
          pathLabel,
        });
        break;
      }
      case "circle_interest": {
        const circleId = typeof body.circleId === "string" ? body.circleId : "";
        const circleTitle =
          typeof body.circleTitle === "string" ? body.circleTitle : circleId;
        const mode =
          body.mode === "saved"
            ? "saved"
            : body.mode === "notify"
              ? "notify"
              : "interested";
        if (!circleId) {
          return NextResponse.json({ ok: false, error: "circle_id_required" }, { status: 400 });
        }
        await recordCircleInterest({ userId, archiveId, circleId, circleTitle, mode });
        break;
      }
      case "project_interest": {
        const projectId = typeof body.projectId === "string" ? body.projectId : "";
        const projectTitle =
          typeof body.projectTitle === "string" ? body.projectTitle : projectId;
        const mode =
          body.mode === "observe" || body.mode === "join" ? body.mode : "interest";
        if (!projectId) {
          return NextResponse.json(
            { ok: false, error: "project_id_required" },
            { status: 400 },
          );
        }
        await recordProjectInterest({
          userId,
          archiveId,
          projectId,
          projectTitle,
          mode,
        });
        break;
      }
      case "formation_or_event_interest": {
        const targetId = typeof body.targetId === "string" ? body.targetId : "";
        const targetTitle =
          typeof body.targetTitle === "string" ? body.targetTitle : targetId;
        const targetKind = body.targetKind === "formation" ? "formation" : "event";
        const notifySimilar = body.notifySimilar === true;
        const savedRoute = body.savedRoute === true;
        if (!targetId) {
          return NextResponse.json(
            { ok: false, error: "target_id_required" },
            { status: 400 },
          );
        }
        await recordFormationOrEventInterest({
          userId,
          archiveId,
          targetId,
          targetTitle,
          targetKind,
          notifySimilar,
          savedRoute,
        });
        break;
      }
      default:
        return NextResponse.json({ ok: false, error: "unknown_event" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "event_failed",
      },
      { status: 500 },
    );
  }
}
