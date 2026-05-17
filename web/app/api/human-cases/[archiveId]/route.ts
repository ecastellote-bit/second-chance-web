import { NextResponse } from "next/server";
import {
  appendHumanCaseReviewNote,
  findHumanCompleteCaseById,
  getLatestReviewNoteForCase,
  listHumanLearningExtracts,
  type HumanReviewStatus,
} from "@/lib/learning/humanCaseDepot";

type RouteParams = { params: Promise<{ archiveId: string }> };

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(_req: Request, { params }: RouteParams) {
  const { archiveId } = await params;
  const complete = await findHumanCompleteCaseById(archiveId);

  if (!complete) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const extracts = await listHumanLearningExtracts(500);
  const learningExtract =
    extracts.find((item) => item.archiveId === archiveId) ?? null;
  const reviewNote = await getLatestReviewNoteForCase(archiveId);

  return NextResponse.json({ ok: true, complete, learningExtract, reviewNote });
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { archiveId } = await params;
    const existing = await findHumanCompleteCaseById(archiveId);

    if (!existing) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    const body = (await req.json()) as {
      reviewStatus?: HumanReviewStatus;
      humanVerdict?: {
        expectedPrimaryFamily?: string;
        acceptableFamilies?: string[];
        rivalFamilies?: string[];
        verdict?: string;
        correctionNote?: string;
        shouldBecomeLearnedCase?: boolean;
      };
    };

    const prior = existing.payload.humanReview as Record<string, unknown> | undefined;

    const humanVerdict = {
      expectedPrimaryFamily:
        body.humanVerdict?.expectedPrimaryFamily ??
        clean(prior?.expectedPrimaryFamily) ??
        "",
      acceptableFamilies:
        body.humanVerdict?.acceptableFamilies ??
        (Array.isArray(prior?.acceptableFamilies)
          ? (prior?.acceptableFamilies as string[])
          : []),
      rivalFamilies:
        body.humanVerdict?.rivalFamilies ??
        (Array.isArray(prior?.rivalFamilies)
          ? (prior?.rivalFamilies as string[])
          : []),
      verdict:
        body.humanVerdict?.verdict ??
        body.reviewStatus ??
        "in_discussion",
      correctionNote: body.humanVerdict?.correctionNote ?? clean(prior?.correctionNote) ?? "",
      shouldBecomeLearnedCase:
        body.humanVerdict?.shouldBecomeLearnedCase ??
        prior?.shouldBecomeLearnedCase === true,
    };

    const reviewStatus = (body.reviewStatus ??
      humanVerdict.verdict ??
      "in_discussion") as HumanReviewStatus;

    await appendHumanCaseReviewNote({
      recordType: "human_case_review_note",
      archiveId,
      updatedAt: new Date().toISOString(),
      reviewStatus,
      humanVerdict,
    });

    return NextResponse.json({
      ok: true,
      archiveId,
      reviewStatus,
      note: "Nota de revisión humana guardada (depósito de revisiones).",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "patch_failed",
      },
      { status: 500 },
    );
  }
}
