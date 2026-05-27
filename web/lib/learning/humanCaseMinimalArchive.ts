import { putHumanCaseBundle } from "./humanCaseDurableStore";
import {
  buildHumanCompleteCaseRecord,
  buildHumanLearningExtract,
  type HumanCasePayload,
} from "./humanCaseDepot";
import { upsertFounderCaseDraft } from "./founderCaseDraftStore";
import type { DiagnosticCaseSource } from "./founderCaseDraftTypes";

export type MinimalArchiveInput = {
  caseId: string;
  diagnosticRunId: string;
  source: DiagnosticCaseSource;
  questionnaireVersion: string;
  summary: {
    resultType?: string | null;
    corePattern?: string | null;
    primaryDirectionLabel?: string | null;
    hasPersonalizedPresentation?: boolean;
    hasAnalysisResultFullInDraft?: boolean;
  };
};

export function buildMinimalArchiveId(caseId: string): string {
  const slug = caseId.replace(/^case_/, "").slice(0, 24);
  return `min_${slug}`;
}

export async function persistMinimalHumanCaseArchive(
  input: MinimalArchiveInput,
): Promise<{
  archiveId: string;
  persisted: boolean;
  verified: boolean;
  verificationStatus: "verified" | "pending";
}> {
  const archiveId = buildMinimalArchiveId(input.caseId);
  const createdAt = new Date().toISOString();

  const payload: HumanCasePayload = {
    archiveVersion: "human_case_depot_v1",
    createdAt,
    source: "browser_human_case_minimal_v1",
    sourceInput: {
      pointer: {
        draftStore: "founder-case-drafts",
        caseId: input.caseId,
        diagnosticRunId: input.diagnosticRunId,
      },
      founderCaseIdentity: {
        caseId: input.caseId,
        diagnosticRunId: input.diagnosticRunId,
      },
    },
    currentResult: {
      resultType: input.summary.resultType ?? null,
      corePattern: input.summary.corePattern ?? null,
      displayedMainDirection: input.summary.primaryDirectionLabel ?? null,
      archiveStatus: "archived_minimal",
      hasPersonalizedPresentation: input.summary.hasPersonalizedPresentation ?? false,
      hasAnalysisResultFullInDraft: input.summary.hasAnalysisResultFullInDraft ?? true,
    },
    humanReview: {
      verdict: "pending_human_review",
      expectedPrimaryFamily: "",
      acceptableFamilies: [],
      rivalFamilies: [],
      correctionNote: "",
      shouldBecomeLearnedCase: false,
    },
    clientMeta: {
      caseId: input.caseId,
      diagnosticRunId: input.diagnosticRunId,
      source: input.source,
      questionnaireVersion: input.questionnaireVersion,
      phase: "archived_minimal",
    },
  };

  const complete = buildHumanCompleteCaseRecord(payload, {
    source: payload.source,
    forceArchiveId: archiveId,
  });
  const extract = buildHumanLearningExtract(complete);

  const result = await putHumanCaseBundle({ complete, extract });

  const { getFounderCaseDraft } = await import("./founderCaseDraftStore");
  const draft = await getFounderCaseDraft(input.caseId, input.diagnosticRunId);

  await upsertFounderCaseDraft({
    caseId: input.caseId,
    diagnosticRunId: input.diagnosticRunId,
    status: "archived_minimal",
    rawAnswers: draft?.rawAnswers ?? {},
    builtUserIntake: draft?.builtUserIntake,
    analysisResultFull: draft?.analysisResultFull,
    analysisResultSummary: draft?.analysisResultSummary,
    archiveId: result.archiveId,
    learningDisposition: "needs_review",
    source: input.source,
  });

  return {
    archiveId: result.archiveId,
    persisted: true,
    verified: result.verified,
    verificationStatus: result.verificationStatus,
  };
}
