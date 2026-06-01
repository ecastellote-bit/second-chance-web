import { NextResponse } from "next/server";
import { isValidCommunityPlainText } from "@/lib/community/sanitizeCommunityText";
import { GUIDED_CONTRIBUTION_CONFIRMATION } from "@/lib/community/guidedContributionCopy";
import {
  GuidedContributionStoreError,
  createFounderProjectGuidedContribution,
  getGuidedContributionStoreMeta,
  listFounderProjectGuidedContributions,
  type FounderProjectGuidedContributionKind,
} from "@/lib/learning/founderProjectGuidedContributions";
import { readFounderProjectSeed } from "@/lib/learning/founderProjectSeeds";
import { toPublicAuthorIdentity } from "@/lib/public/publicAuthor";
import { findUserProfileById } from "@/lib/users/userProfileStore";
import {
  checkCommunityActionAllowed,
  communityActionDeniedResponse,
} from "@/lib/users/assertCommunityActionAllowed";

export const dynamic = "force-dynamic";

const VALID_KINDS: FounderProjectGuidedContributionKind[] = [
  "valuable_part",
  "first_step",
  "risk",
  "possible_contribution",
  "similar_reference",
];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId")?.trim();
    if (!projectId) {
      return NextResponse.json({ ok: false, error: "projectId_required" }, { status: 400 });
    }

    const seed = await readFounderProjectSeed(projectId);
    if (!seed || seed.status !== "published") {
      return NextResponse.json({ ok: false, error: "project_not_visible" }, { status: 404 });
    }

    const contributions = await listFounderProjectGuidedContributions({
      projectId,
      status: "visible",
      limit: 50,
    });

    const publicContributions = await Promise.all(
      contributions.map(async (item) => {
        const profile = await findUserProfileById(item.actorUserId);
        const publicAuthor = toPublicAuthorIdentity(
          profile
            ? {
                displayName: profile.displayName,
                email: profile.email,
              }
            : undefined,
        );
        const { actorUserId: _actor, ...publicFields } = item;
        return { ...publicFields, publicAuthor };
      }),
    );

    return NextResponse.json({
      ok: true,
      contributions: publicContributions,
      total: publicContributions.length,
    });
  } catch (error) {
    if (error instanceof GuidedContributionStoreError) {
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

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      userId?: string;
      projectId?: string;
      projectTitle?: string;
      kind?: string;
      text?: string;
    };

    const actorUserId = typeof body.userId === "string" ? body.userId.trim() : "";
    const projectId = typeof body.projectId === "string" ? body.projectId.trim() : "";
    const projectTitle =
      typeof body.projectTitle === "string" && body.projectTitle.trim()
        ? body.projectTitle.trim()
        : projectId;
    const kind = body.kind as FounderProjectGuidedContributionKind;
    const text = typeof body.text === "string" ? body.text : "";

    if (!actorUserId || !projectId || !VALID_KINDS.includes(kind)) {
      return NextResponse.json(
        { ok: false, error: "invalid_contribution_payload" },
        { status: 400 },
      );
    }

    const access = await checkCommunityActionAllowed(actorUserId);
    if (!access.allowed) {
      return communityActionDeniedResponse(access.error);
    }

    if (!isValidCommunityPlainText(text)) {
      return NextResponse.json(
        { ok: false, error: "contribution_text_invalid" },
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

    const contribution = await createFounderProjectGuidedContribution({
      projectId,
      projectTitle: seed.title || projectTitle,
      actorUserId,
      kind,
      text,
    });

    return NextResponse.json({
      ok: true,
      contributionId: contribution.contributionId,
      status: contribution.status,
      confirmation: GUIDED_CONTRIBUTION_CONFIRMATION,
      store: getGuidedContributionStoreMeta(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "contribution_text_too_short") {
      return NextResponse.json({ ok: false, error: "contribution_text_too_short" }, { status: 400 });
    }
    if (error instanceof GuidedContributionStoreError) {
      return NextResponse.json(
        { ok: false, error: error.code, message: error.message },
        { status: error.code === "blob_not_configured" ? 503 : 500 },
      );
    }
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "create_failed" },
      { status: 500 },
    );
  }
}
