import { NextResponse } from "next/server";
import { runAnalysisPipeline } from "@/lib/engines/analysisPipeline";
import { extractSemanticSignals } from "@/lib/engines/semanticExtractor";
import { findSemanticallySimilarCases } from "@/lib/engines/semanticSimilarityEngine";
import { generateSemanticFollowup } from "@/lib/engines/semanticFollowupGenerator";
import { selectGuidedThemes } from "@/lib/engines/guidedThemeSelector";
import {
  evaluateHumanReviewTrigger,
  buildHumanReviewPayload,
} from "@/lib/engines/humanReviewTrigger";
import {
  applyNarrativeJudgeToDiagnosticReading,
  getDiagnosticJudgesStatus,
} from "@/lib/engines/diagnosticJudgeIntegration";
import { applyDiagnosticPresentationLayer } from "@/lib/engines/diagnosticPresentationIntegration";
import { normalizeUserIntake } from "@/lib/engines/intakeEngine";
import { findSimilarLearnedCases, buildLearningSignal } from "@/lib/engines/similarCaseEngine";
import type { UserIntake } from "@/lib/types/intake";
import type { FollowupRound, AmbiguityType } from "@/lib/types/followup";
import type { ProfileFamilyScore } from "@/lib/types/profileFamilies";

type ClarificationMetaPayload = {
  roundsCompleted?: number;
  requestedRound?: FollowupRound;
  lockedAmbiguityType?: AmbiguityType | null;
};

type AnalyzeRouteInput = Partial<UserIntake> & {
  clarificationMeta?: ClarificationMetaPayload;
  userEmail?: string;
};

function extractNarrativeText(body: AnalyzeRouteInput): string {
  const parts: string[] = [];
  const narrative = body.narrative;

  if (narrative && typeof narrative === "object") {
    for (const value of Object.values(narrative)) {
      if (typeof value === "string" && value.trim().length > 0) {
        parts.push(value.trim());
      }
    }
  }

  return parts.join(" ");
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "analyze",
    message: "API route is alive",
    judges: getDiagnosticJudgesStatus(),
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AnalyzeRouteInput;

    const narrativeText = extractNarrativeText(body);

    const [semanticSignals, semanticSimilarity] = await Promise.all([
      extractSemanticSignals(narrativeText),
      findSemanticallySimilarCases(narrativeText),
    ]);

    const result = runAnalysisPipeline({
      ...body,
      _semanticSignals: semanticSignals,
      _semanticSimilarity: semanticSimilarity,
    });

    let dataForResponse = result.ok ? result.data : null;
    let narrativeCoherenceMeta: {
      status: "ok" | "skipped" | "error" | "disabled";
      latencyMs?: number;
      review?: import("@/lib/types/narrativeCoherence").NarrativeCoherenceReview | null;
      error?: string;
      leversApplied?: boolean;
    } | null = null;

    if (result.ok) {
      const intake = normalizeUserIntake(body);
      const familyScores = Array.isArray(result.data.familyScores)
        ? (result.data.familyScores as ProfileFamilyScore[])
        : undefined;

      const narrativeIntegration = await applyNarrativeJudgeToDiagnosticReading({
        intake,
        reading: result.data,
        familyScores,
      });

      dataForResponse = narrativeIntegration.reading;
      narrativeCoherenceMeta = {
        status: narrativeIntegration.meta.status,
        latencyMs: narrativeIntegration.meta.latencyMs,
        review: narrativeIntegration.meta.review,
        error: narrativeIntegration.meta.error,
        leversApplied: narrativeIntegration.meta.leversApplied,
      };
    }

    const semanticFollowup = await generateSemanticFollowup(semanticSignals);

    if (!result.ok) {
      const learningSignal = buildLearningSignal(
        findSimilarLearnedCases(narrativeText),
      );

      const reviewTrigger = evaluateHumanReviewTrigger({
        resultType: "insufficient_evidence",
        topFamilies: [],
        semanticSignals,
        learningSignal,
      });

      if (reviewTrigger.shouldEscalate) {
        const payload = buildHumanReviewPayload({
          triggerResult: reviewTrigger,
          userEmail: body.userEmail,
          narrativeText,
          resultType: "insufficient_evidence",
          corePattern: null,
          topFamilies: [],
          overallConfidence: 0,
          semanticSignals,
          learningSignal,
        });

        fetch(new URL("/api/human-review-queue", req.url), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => {});
      }

      return NextResponse.json(
        {
          ok: false,
          error: "INSUFFICIENT_INPUT",
          missingFields: result.missingFields,
          warnings: result.warnings,
          humanReview: reviewTrigger.shouldEscalate
            ? { escalated: true, urgency: reviewTrigger.urgency, userMessage: reviewTrigger.userMessage }
            : null,
          judges: getDiagnosticJudgesStatus(),
          _semantic: semanticSignals.ok ? { status: "ok", latencyMs: semanticSignals.latencyMs } : { status: "fallback", error: semanticSignals.error },
        },
        { status: 400 },
      );
    }

    const topFamilies = Array.isArray(result.data.familyScores)
      ? (result.data.familyScores as ProfileFamilyScore[]).slice(0, 5).map((f) => ({
          id: f.id ?? (f as { familyId?: string }).familyId ?? "",
          score: typeof f.score === "number" ? f.score : 0,
        }))
      : [];

    const learningSignal = buildLearningSignal(
      findSimilarLearnedCases(narrativeText),
      result.data.corePattern,
    );

    const reviewTrigger = evaluateHumanReviewTrigger({
      resultType: dataForResponse?.resultType ?? result.data.resultType,
      topFamilies,
      semanticSignals,
      learningSignal,
    });

    if (reviewTrigger.shouldEscalate) {
      const payload = buildHumanReviewPayload({
        triggerResult: reviewTrigger,
        userEmail: body.userEmail,
        narrativeText,
        resultType: dataForResponse?.resultType ?? result.data.resultType,
        corePattern: dataForResponse?.corePattern ?? result.data.corePattern,
        topFamilies,
        overallConfidence: topFamilies[0]?.score ?? 0,
        semanticSignals,
        learningSignal,
      });

      fetch(new URL("/api/human-review-queue", req.url), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }

    const guidedThemes = selectGuidedThemes(dataForResponse ?? result.data, 5);

    const intakeForPresentation = normalizeUserIntake(body);
    const readingWithPresentation = applyDiagnosticPresentationLayer({
      reading: dataForResponse ?? result.data,
      guidedThemes: guidedThemes.map((g) => ({
        shortLabel: g.theme.shortLabel,
      })),
      intake: intakeForPresentation,
    });

    return NextResponse.json({
      ok: true,
      data: readingWithPresentation,
      warnings: result.warnings,
      followup: result.followup,
      guidedThemes: guidedThemes.map((g) => ({
        id: g.theme.id,
        shortLabel: g.theme.shortLabel,
        userFacingText: g.theme.userFacingText,
        layer: g.theme.themeLayer,
        score: g.score,
        activationPaths: g.theme.suggestedActivationPaths,
      })),
      semanticFollowup: semanticFollowup.shouldAsk ? semanticFollowup : null,
      narrativeCoherence: narrativeCoherenceMeta,
      judges: getDiagnosticJudgesStatus(),
      humanReview: reviewTrigger.shouldEscalate
        ? {
            escalated: true,
            urgency: reviewTrigger.urgency,
            reasons: reviewTrigger.reasons,
            userMessage: reviewTrigger.userMessage,
          }
        : null,
      _semantic: {
        extraction: {
          status: semanticSignals.ok ? "ok" : "fallback",
          latencyMs: semanticSignals.latencyMs,
          signalsDetected: semanticSignals.affinitySignals.length,
          confidence: semanticSignals.extractionConfidence,
          error: semanticSignals.error,
        },
        similarity: {
          status: semanticSimilarity.ok ? "ok" : "fallback",
          latencyMs: semanticSimilarity.latencyMs,
          matchesFound: semanticSimilarity.matches.length,
          topMatch: semanticSimilarity.matches[0] ?? null,
          error: semanticSimilarity.error,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_REQUEST",
        detail: String(error),
      },
      { status: 400 },
    );
  }
}

