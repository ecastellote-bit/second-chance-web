import { NextResponse } from "next/server";
import {
  recordActivationSelected,
  recordCircleInterest,
  recordFormationOrEventInterest,
  recordProjectInterest,
  recordProjectSignal,
} from "@/lib/community/communityRecords";
import {
  getOfficialActivationPath,
  isOfficialActivationPathId,
} from "@/lib/content/officialActivationPaths";
import {
  FounderProjectSeedStoreError,
  readFounderProjectSeed,
} from "@/lib/learning/founderProjectSeeds";
import {
  FounderProjectSignalStoreError,
  upsertFounderProjectSignal,
} from "@/lib/learning/founderProjectSignals";
import { notifyProjectSignalReceived } from "@/lib/learning/notificationEventIntegrations";
import {
  checkCommunityActionAllowed,
  communityActionDeniedResponse,
} from "@/lib/users/assertCommunityActionAllowed";

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

    const access = await checkCommunityActionAllowed(userId);
    if (!access.allowed) {
      return communityActionDeniedResponse(access.error);
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
      case "founder_project_signal": {
        const projectId = typeof body.projectId === "string" ? body.projectId.trim() : "";
        const projectTitle =
          typeof body.projectTitle === "string" ? body.projectTitle.trim() : "";
        const signalType =
          body.signalType === "project_follow_close" ||
          body.signalType === "project_interest" ||
          body.signalType === "project_possible_contribution" ||
          body.signalType === "project_join_exploration"
            ? body.signalType
            : "";
        const source =
          body.source === "projects_list" || body.source === "activation"
            ? body.source
            : "project_page";
        const capabilities =
          Array.isArray(body.capabilities) && signalType === "project_possible_contribution"
            ? body.capabilities.filter((item): item is string => typeof item === "string")
            : [];

        if (!projectId || !projectTitle || !signalType) {
          return NextResponse.json(
            { ok: false, error: "invalid_project_signal_payload" },
            { status: 400 },
          );
        }

        const seed = await readFounderProjectSeed(projectId);
        if (!seed) {
          return NextResponse.json({ ok: false, error: "project_not_found" }, { status: 404 });
        }
        if (seed.status !== "published") {
          return NextResponse.json(
            { ok: false, error: "project_not_published" },
            { status: 400 },
          );
        }

        const persisted = await upsertFounderProjectSignal({
          projectId,
          projectTitle,
          actorUserId: userId,
          signalType,
          capabilities,
          source,
        });

        await recordProjectSignal({
          userId,
          archiveId,
          projectId,
          projectTitle,
          signalType,
          capabilities,
        });

        void notifyProjectSignalReceived({
          seed,
          signalId: persisted.signal.signalId,
          actorUserId: userId,
        });

        return NextResponse.json({
          ok: true,
          signal: persisted.signal,
          deduped: persisted.deduped,
          updated: persisted.updated,
        });
      }
      default:
        return NextResponse.json({ ok: false, error: "unknown_event" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof FounderProjectSeedStoreError) {
      return NextResponse.json(
        { ok: false, error: error.code, message: error.message },
        { status: error.code === "blob_not_configured" ? 503 : 500 },
      );
    }
    if (error instanceof FounderProjectSignalStoreError) {
      return NextResponse.json(
        { ok: false, error: error.code, message: error.message },
        { status: error.code === "blob_not_configured" ? 503 : 500 },
      );
    }
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "event_failed",
      },
      { status: 500 },
    );
  }
}
