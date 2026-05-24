export type HumanCaseImportPayload = {
  archiveVersion?: string;
  createdAt?: string;
  source?: string;
  sourceInput?: unknown;
  currentResult?: Record<string, unknown>;
  humanReview?: Record<string, unknown>;
  clientMeta?: Record<string, unknown>;
};

function clean(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Acepta export de backup, payload de archivo o formato de import manual. */
export function normalizeHumanCaseImport(raw: unknown): {
  archiveId: string;
  payload: HumanCaseImportPayload;
} {
  if (!isRecord(raw)) {
    throw new Error("invalid_import_json");
  }

  const archiveId =
    clean(raw.forceArchiveId) ??
    clean(raw.archiveId) ??
    clean(isRecord(raw.clientMeta) ? raw.clientMeta.archiveId : null) ??
    `import_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  const nestedPayload = isRecord(raw.payload) ? raw.payload : null;

  const sourceInput =
    raw.sourceInput ??
    nestedPayload?.sourceInput ??
    (isRecord(raw.fullAnswersContext)
      ? { fullAnswersContext: raw.fullAnswersContext }
      : undefined);

  const currentResult =
    (isRecord(raw.currentResult) ? raw.currentResult : null) ??
    (isRecord(nestedPayload?.currentResult) ? nestedPayload.currentResult : null) ??
    undefined;

  if (!currentResult) {
    throw new Error("current_result_required");
  }

  const humanReview =
    (isRecord(raw.humanReview) ? raw.humanReview : null) ??
    (isRecord(nestedPayload?.humanReview) ? nestedPayload.humanReview : null) ?? {
      verdict: "pending_human_review",
      expectedPrimaryFamily: "",
      acceptableFamilies: [],
      rivalFamilies: [],
      correctionNote: "",
      shouldBecomeLearnedCase: false,
    };

  const payload: HumanCaseImportPayload = {
    archiveVersion:
      clean(raw.archiveVersion) ??
      clean(nestedPayload?.archiveVersion) ??
      "human_case_depot_v1",
    createdAt:
      clean(raw.createdAt) ??
      clean(raw.exportedAt) ??
      clean(nestedPayload?.createdAt) ??
      new Date().toISOString(),
    source:
      clean(raw.source) ??
      clean(nestedPayload?.source) ??
      "manual_human_import_v1",
    sourceInput,
    currentResult,
    humanReview,
    clientMeta: isRecord(raw.clientMeta)
      ? raw.clientMeta
      : isRecord(nestedPayload?.clientMeta)
        ? nestedPayload.clientMeta
        : { importedAt: new Date().toISOString(), recoveredBackup: true },
  };

  return { archiveId, payload };
}
