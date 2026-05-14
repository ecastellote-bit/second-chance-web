import { NextResponse } from "next/server";
import { runAnalysisPipeline } from "@/lib/engines/analysisPipeline";
import { normalizeUserIntake } from "@/lib/engines/intakeEngine";
import { runAffinityPipelineBridge } from "@/lib/engines/affinityPipelineBridge";
import { extractSemanticSignals } from "@/lib/engines/semanticExtractor";
import { findSemanticallySimilarCases } from "@/lib/engines/semanticSimilarityEngine";
import { generateSemanticFollowup } from "@/lib/engines/semanticFollowupGenerator";
import type { UserIntake } from "@/lib/types/intake";

function resolveRawInput(body: unknown): Partial<UserIntake> {
  if (!body || typeof body !== "object") {
    return {};
  }

  const candidate = body as {
    payload?: Partial<UserIntake>;
    intake?: Partial<UserIntake>;
  };

  return candidate.payload ?? candidate.intake ?? (body as Partial<UserIntake>);
}

function extractTextForSemantic(input: Partial<UserIntake>): string {
  const parts: string[] = [];
  const narrative = input.narrative;

  if (narrative && typeof narrative === "object") {
    for (const value of Object.values(narrative)) {
      if (typeof value === "string" && value.trim().length > 0) {
        parts.push(value.trim());
      }
    }
  }

  return parts.join(" ");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawInput = resolveRawInput(body);

    const narrativeText = extractTextForSemantic(rawInput);

    const [semanticSignals, semanticSimilarity] = await Promise.all([
      extractSemanticSignals(narrativeText),
      findSemanticallySimilarCases(narrativeText),
    ]);

    const intake = normalizeUserIntake(rawInput);
    const pipeline = runAnalysisPipeline({
      ...rawInput,
      _semanticSignals: semanticSignals,
      _semanticSimilarity: semanticSimilarity,
    });
    const affinityBridge = runAffinityPipelineBridge({
      intake,
      semanticSignals,
    });

    const semanticFollowup = await generateSemanticFollowup(semanticSignals);

    if (!pipeline.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "INSUFFICIENT_INPUT",
          missingFields: pipeline.missingFields,
          warnings: pipeline.warnings,
          affinityBridge,
          familyScores: affinityBridge.familyScores,
          evidence: affinityBridge.evidence,
          affinityScores: affinityBridge.affinityScores,
          topAffinities: affinityBridge.topAffinities,
          buriedCapacities: affinityBridge.buriedCapacities,
          likelyContributionModes: affinityBridge.likelyContributionModes,
          likelyFlourishingConditions:
            affinityBridge.likelyFlourishingConditions,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      data: pipeline.data,
      warnings: pipeline.warnings,
      followup: pipeline.followup,
      semanticFollowup: semanticFollowup.shouldAsk ? semanticFollowup : null,

      affinityBridge,
      familyScores: affinityBridge.familyScores,
      evidence: affinityBridge.evidence,
      affinityScores: affinityBridge.affinityScores,
      topAffinities: affinityBridge.topAffinities,
      buriedCapacities: affinityBridge.buriedCapacities,
      likelyContributionModes: affinityBridge.likelyContributionModes,
      likelyFlourishingConditions:
        affinityBridge.likelyFlourishingConditions,

      _semantic: {
        extraction: {
          status: semanticSignals.ok ? "ok" : "fallback",
          latencyMs: semanticSignals.latencyMs,
          signalsDetected: semanticSignals.affinitySignals.length,
          confidence: semanticSignals.extractionConfidence,
          signals: semanticSignals.affinitySignals,
          narrativeFlags: semanticSignals.narrativeFlags,
          error: semanticSignals.error,
        },
        similarity: {
          status: semanticSimilarity.ok ? "ok" : "fallback",
          latencyMs: semanticSimilarity.latencyMs,
          matchesFound: semanticSimilarity.matches.length,
          matches: semanticSimilarity.matches,
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