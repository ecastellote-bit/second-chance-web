"use client";

import { useMemo, useState } from "react";
import {
  selectGuidedThemes,
  type GuidedThemeSuggestion,
} from "@/lib/engines/guidedThemeSelector";
import type { FunctionalSubtype } from "@/lib/types/finalDiagnostic";
import type { NegativeEvidenceReview } from "@/lib/types/negativeEvidenceJudge";
import { HUMAN_LANGUAGE_CASES } from "@/lib/testing/humanLanguageCases";
import { runBiasMonitor } from "@/lib/engines/learnedCasesBiasMonitor";

type DirectionItem =
  | string
  | {
      label?: string;
      ecosystem?: string;
    };

type GenericBlock = {
  title?: string;
  headline?: string;
  summary?: string;
  description?: string;
  rationale?: string;
  transitionMode?: string;
  severity?: string;
  subtype?: string;
  bullets?: string[];
  items?: string[];
  microActions?: string[];
  firstMoves?: string[];
  signals?: string[];
  evidenceKeys?: string[];
  warnings?: string[];
};

type FinalDiagnosticPayload = {
  severity?: string;
  functionalSubtype?: FunctionalSubtype;
  profileSnapshot?: {
    id?: string;
    label?: string;
    summary?: string;
    confidence?: number;
  };
  valueGeneration?: GenericBlock;
  currentMisalignment?: GenericBlock;
  bestWorkContexts?: GenericBlock;
  misreadRisk?: GenericBlock;
  transitionRecommendation?: GenericBlock;
  nextMove?: GenericBlock;
};

type AffinityScore = {
  id: string;
  score: number;
  confidence: number;
  status: "expressed" | "latent" | "buried" | "blocked" | "compensatory";
  evidenceCount: number;
  evidenceSources: Array<"intake" | "cvme" | "followup" | "behavioral_note">;
  rationale: string[];
};

type ProfileFamilyScore = {
  id?: string;
  familyId?: string;
  label: string;
  summary: string;
  score: number;
  confidence: number;
  matchedCoreAffinities: string[];
  matchedSupportingAffinities: string[];
  tensionHits: string[];
  dominantAffinityIds?: string[];
  subtypeCandidates: string[];
  misreadAs: string[];
  rationale: string[];
};

type EvidenceFragment = {
  id: string;
  source: "intake" | "cvme" | "followup" | "behavioral_note";
  text: string;
  tags?: string[];
  valence?: "positive" | "negative" | "ambivalent";
  temporalWeight?: "childhood" | "past" | "recent" | "current";
  intensity?: 1 | 2 | 3;
  repetition?: number;
  externalRecognition?: boolean;
  sacrificedFor?: boolean;
};

type AnalyzeSuccess = {
  resultType?: string;
  corePattern?: string;
  dominantTension?: string;
  plausibleDirections?: DirectionItem[];
  actionVectors?: unknown[];
  communityRouting?: string;
  summaryForUser?: {
    diagnostico?: string;
    hilo_conductor?: string;
    tensiones?: string;
    direccion?: string;
    action?: string;
    camino_minimo?: string;
    cierre?: string;
  };
  finalDiagnostic?: FinalDiagnosticPayload;
  evidence?: EvidenceFragment[];
  affinityScores?: AffinityScore[];
  familyScores?: ProfileFamilyScore[];
  topAffinities?: AffinityScore[];
  buriedCapacities?: AffinityScore[];
  likelyContributionModes?: string[];
  likelyFlourishingConditions?: string[];
  trace?: unknown;
  negativeEvidenceReview?: NegativeEvidenceReview;
  discardJudgeReview?: NegativeEvidenceReview;
  diagnosticTrace?: unknown;
  debugTrace?: unknown;
  debug?: {
    trace?: unknown;
  };
};

type AffinityBridgePayload = {
  evidence?: EvidenceFragment[];
  affinityScores?: AffinityScore[];
  familyScores?: ProfileFamilyScore[];
  topAffinities?: AffinityScore[];
  buriedCapacities?: AffinityScore[];
  likelyContributionModes?: string[];
  likelyFlourishingConditions?: string[];
};

type FollowupQuestion = {
  id: string;
  round: 2 | 3;
  ambiguityType: string;
  kind: "open_text" | "contrast_choice" | "forced_choice" | "micro_narrative";
  prompt: string;
  helpText?: string;
};

type FollowupPack = {
  ambiguityType: string;
  round: 2 | 3;
  title: string;
  objective: string;
  questions: FollowupQuestion[];
};

type FollowupResult = {
  shouldAskFollowup: boolean;
  shouldForceAdjudication?: boolean;
  round: 2 | 3 | null;
  ambiguityType: string | null;
  pack: FollowupPack | null;
  status?: string;
  reason: string;
};

type AnalyzeResponse =
  | {
      ok: true;
      data: AnalyzeSuccess;
      trace?: unknown;
      warnings?: string[];
      followup?: FollowupResult | null;
      affinityBridge?: AffinityBridgePayload;
      familyScores?: ProfileFamilyScore[];
      evidence?: EvidenceFragment[];
      affinityScores?: AffinityScore[];
      topAffinities?: AffinityScore[];
      buriedCapacities?: AffinityScore[];
      likelyContributionModes?: string[];
      likelyFlourishingConditions?: string[];
    }
  | {
      ok: false;
      error: string;
      detail?: string;
      missingFields?: string[];
      warnings?: string[];
      affinityBridge?: AffinityBridgePayload;
      familyScores?: ProfileFamilyScore[];
      evidence?: EvidenceFragment[];
      affinityScores?: AffinityScore[];
      topAffinities?: AffinityScore[];
      buriedCapacities?: AffinityScore[];
      likelyContributionModes?: string[];
      likelyFlourishingConditions?: string[];
    };

function directionLabel(direction: DirectionItem): string {
  if (typeof direction === "string") return direction;
  return direction.label ?? direction.ecosystem ?? "sin etiqueta";
}

function formatUnknown(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (value == null) {
    return "n/a";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function extractTrace(result: AnalyzeResponse | null): unknown {
  if (!result || !result.ok) return null;

  return (
    result.data.trace ??
    result.data.diagnosticTrace ??
    result.data.debugTrace ??
    result.data.debug?.trace ??
    result.trace ??
    null
  );
}

function resolveFamilyScoreId(family: ProfileFamilyScore): string {
  return family.familyId ?? family.id ?? "unknown_family";
}

function getAffinityDebug(result: AnalyzeResponse | null) {
  const empty = {
    evidence: [] as EvidenceFragment[],
    affinityScores: [] as AffinityScore[],
    familyScores: [] as ProfileFamilyScore[],
    topAffinities: [] as AffinityScore[],
    buriedCapacities: [] as AffinityScore[],
    likelyContributionModes: [] as string[],
    likelyFlourishingConditions: [] as string[],
  };

  if (!result) return empty;

  const bridge = result.affinityBridge ?? {};
  const data = result.ok ? result.data : null;

  return {
    evidence:
      result.evidence ?? data?.evidence ?? bridge.evidence ?? empty.evidence,
    affinityScores:
      result.affinityScores ??
      data?.affinityScores ??
      bridge.affinityScores ??
      empty.affinityScores,
    familyScores:
      result.familyScores ??
      data?.familyScores ??
      bridge.familyScores ??
      empty.familyScores,
    topAffinities:
      result.topAffinities ??
      data?.topAffinities ??
      bridge.topAffinities ??
      empty.topAffinities,
    buriedCapacities:
      result.buriedCapacities ??
      data?.buriedCapacities ??
      bridge.buriedCapacities ??
      empty.buriedCapacities,
    likelyContributionModes:
      result.likelyContributionModes ??
      data?.likelyContributionModes ??
      bridge.likelyContributionModes ??
      empty.likelyContributionModes,
    likelyFlourishingConditions:
      result.likelyFlourishingConditions ??
      data?.likelyFlourishingConditions ??
      bridge.likelyFlourishingConditions ??
      empty.likelyFlourishingConditions,
  };
}

function normalizePayload(payload: any) {
  if (!payload) return null;

  const toArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }

    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  };

  if (payload.narrative && payload.currentContext) {
    return {
      profile: {
        age: payload.profile?.age ?? 42,
        country: payload.profile?.country ?? "Argentina",
        language: payload.profile?.language ?? "es",
        employmentStatus: payload.profile?.employmentStatus ?? "employed",
        educationLevel: payload.profile?.educationLevel ?? "tertiary",
      },
      narrative: {
        childhoodMemories:
          payload.narrative.childhoodMemories ??
          payload.narrative.earlyFascinations ??
          "",
        earlyFascinations: payload.narrative.earlyFascinations ?? "",
        meaningfulSchoolSubjects:
          payload.narrative.meaningfulSchoolSubjects ?? "",
        repeatedWorkPatterns:
          payload.narrative.repeatedWorkPatterns ?? payload.repeatedPatterns ?? "",
        naturalSocialRoles: payload.narrative.naturalSocialRoles ?? "",
        lossesOrRenunciations: payload.narrative.lossesOrRenunciations ?? "",
        whatFeelsCompressedNow:
          payload.narrative.whatFeelsCompressedNow ?? payload.compressedLife ?? "",
        additionalContext: payload.narrative.additionalContext ?? "",
      },
      currentContext: {
        currentSituation:
          payload.currentContext.currentSituation ?? payload.currentSituation ?? "",
        transitionGoal: payload.currentContext?.transitionGoal ?? "",
        restrictions: toArray(
          payload.currentContext.restrictions ?? payload.restrictions,
        ),
        assets: toArray(payload.currentContext.assets ?? payload.assets),
      },
    };
  }

  return {
    profile: {
      age: payload.profile?.age ?? 42,
      country: payload.profile?.country ?? "Argentina",
      language: payload.profile?.language ?? "es",
      employmentStatus: payload.profile?.employmentStatus ?? "employed",
      educationLevel: payload.profile?.educationLevel ?? "tertiary",
    },
    narrative: {
      childhoodMemories:
        payload.childhoodMemories ?? payload.earlyFascinations ?? "",
      earlyFascinations: payload.earlyFascinations ?? "",
      meaningfulSchoolSubjects: payload.meaningfulSchoolSubjects ?? "",
      repeatedWorkPatterns: payload.repeatedPatterns ?? "",
      naturalSocialRoles: payload.naturalSocialRoles ?? "",
      lossesOrRenunciations: payload.lossesOrRenunciations ?? "",
      whatFeelsCompressedNow: payload.compressedLife ?? "",
      additionalContext: payload.additionalContext ?? "",
    },
    currentContext: {
      currentSituation: payload.currentSituation ?? "",
      restrictions: toArray(payload.restrictions),
      assets: toArray(payload.assets),
    },
  };
}

function extractList(block?: GenericBlock | null): string[] {
  if (!block) return [];

  const candidateArrays = [
    block.bullets,
    block.items,
    block.microActions,
    block.firstMoves,
    block.signals,
    block.evidenceKeys,
    block.warnings,
  ];

  for (const candidate of candidateArrays) {
    if (Array.isArray(candidate) && candidate.length > 0) {
      return candidate.map((item) => String(item));
    }
  }

  return [];
}

function renderStatusLabel(status: AffinityScore["status"]): string {
  switch (status) {
    case "expressed":
      return "expresada";
    case "latent":
      return "latente";
    case "buried":
      return "enterrada";
    case "blocked":
      return "bloqueada";
    case "compensatory":
      return "compensatoria";
    default:
      return status;
  }
}

function BlockCard({
  title,
  block,
}: {
  title: string;
  block?: GenericBlock | null;
}) {
  if (!block) return null;

  const list = extractList(block);

  return (
    <div className="rounded-2xl border p-5 space-y-3">
      <h3 className="text-base font-medium">{title}</h3>

      {block.title ? (
        <p className="text-sm text-neutral-900">
          <strong>Título:</strong> {block.title}
        </p>
      ) : null}

      {block.headline ? (
        <p className="text-sm text-neutral-900">
          <strong>Headline:</strong> {block.headline}
        </p>
      ) : null}

      {block.summary ? (
        <p className="text-sm text-neutral-700">{block.summary}</p>
      ) : null}

      {block.description ? (
        <p className="text-sm text-neutral-700">{block.description}</p>
      ) : null}

      {block.rationale ? (
        <p className="text-sm text-neutral-700">
          <strong>Rationale:</strong> {block.rationale}
        </p>
      ) : null}

      {block.transitionMode ? (
        <p className="text-sm text-neutral-900">
          <strong>Transition mode:</strong> {block.transitionMode}
        </p>
      ) : null}

      {block.severity ? (
        <p className="text-sm text-neutral-900">
          <strong>Severity:</strong> {block.severity}
        </p>
      ) : null}

      {block.subtype ? (
        <p className="text-sm text-neutral-900">
          <strong>Subtype:</strong> {block.subtype}
        </p>
      ) : null}

      {list.length > 0 ? (
        <div className="space-y-1">
          <p className="text-sm font-medium">Items</p>
          <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
            {list.map((item, index) => (
              <li key={`${title}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function AffinityCard({ affinity }: { affinity: AffinityScore }) {
  return (
    <div className="rounded-2xl border p-4 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{affinity.id}</p>
          <p className="text-xs text-neutral-500">
            {renderStatusLabel(affinity.status)}
          </p>
        </div>
        <div className="text-right text-xs text-neutral-600">
          <p>score: {affinity.score.toFixed(2)}</p>
          <p>conf: {affinity.confidence.toFixed(2)}</p>
        </div>
      </div>

      <p className="text-xs text-neutral-600">
        evidencias: {affinity.evidenceCount} · fuentes:{" "}
        {affinity.evidenceSources.join(", ")}
      </p>

      {affinity.rationale?.length ? (
        <ul className="list-disc pl-5 text-xs text-neutral-700 space-y-1">
          {affinity.rationale.slice(0, 2).map((item, index) => (
            <li key={`${affinity.id}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function LabPage() {
  const [selectedCaseId, setSelectedCaseId] = useState(
    HUMAN_LANGUAGE_CASES[0]?.id ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [originalResult, setOriginalResult] = useState<AnalyzeResponse | null>(null);
  const [enrichedResult, setEnrichedResult] = useState<AnalyzeResponse | null>(null);
  const [manualRound2Answer, setManualRound2Answer] = useState("");
  const [manualRound3Answer, setManualRound3Answer] = useState("");
  const [lastManualRoundSubmitted, setLastManualRoundSubmitted] = useState<2 | 3 | null>(
    null,
  );
  const [manualCompletionFields, setManualCompletionFields] = useState<string[]>([]);

  const selectedCase = useMemo(
    () =>
      HUMAN_LANGUAGE_CASES.find((testCase) => testCase.id === selectedCaseId) ?? null,
    [selectedCaseId],
  );

  const normalizedPayload = useMemo(
    () => (selectedCase ? normalizePayload(selectedCase.payload) : null),
    [selectedCase],
  );

  const result = enrichedResult ?? originalResult;
  const followup = result && result.ok ? (result.followup ?? null) : null;

  const handleRunCase = async () => {
    if (!selectedCase || !normalizedPayload) return;

    setLoading(true);

    try {
      const response = await fetch("/api/lab-analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(normalizedPayload),
      });

      const json = (await response.json()) as AnalyzeResponse;
      setOriginalResult(json);
      setEnrichedResult(null);
      setManualRound2Answer("");
      setManualRound3Answer("");
      setLastManualRoundSubmitted(null);
      setManualCompletionFields([]);
    } catch (error) {
      setOriginalResult({
        ok: false,
        error: "request_failed",
        detail:
          error instanceof Error ? error.message : "Error desconocido en fetch",
      });
      setEnrichedResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleManualFollowupSubmit = async (round: 2 | 3) => {
    if (!selectedCase || !normalizedPayload || !followup) return;

    const answer = round === 2 ? manualRound2Answer.trim() : manualRound3Answer.trim();
    if (!answer) return;

    const marker = round === 2 ? "[MANUAL_SEED_COMPLETION_R2]" : "[MANUAL_SEED_COMPLETION_R3]";

    const body = {
      ...normalizedPayload,
      narrative: {
        ...normalizedPayload.narrative,
        additionalContext: [
          normalizedPayload.narrative.additionalContext ?? "",
          `${marker}\n${answer}`,
        ]
          .filter(Boolean)
          .join("\n\n"),
      },
      originalSeedId: selectedCase.id,
      manualFollowupRound: round,
      source: "manual_seed_completion",
      clarificationMeta:
        round === 2
          ? {
              roundsCompleted: 0,
              requestedRound: 2,
              lockedAmbiguityType: followup.ambiguityType,
            }
          : {
              roundsCompleted: 1,
              requestedRound: 3,
              lockedAmbiguityType: followup.ambiguityType,
            },
    };

    setLoading(true);
    try {
      const response = await fetch("/api/lab-analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const json = (await response.json()) as AnalyzeResponse;
      setEnrichedResult(json);
      setLastManualRoundSubmitted(round);
      setManualCompletionFields([
        `originalSeedId: ${selectedCase.id}`,
        `manualFollowupRound: ${round}`,
        `clarificationMeta: ${JSON.stringify(body.clarificationMeta)}`,
        `manualAnswer: ${answer}`,
      ]);
    } catch (error) {
      setEnrichedResult({
        ok: false,
        error: "request_failed",
        detail:
          error instanceof Error ? error.message : "Error desconocido en fetch",
      });
    } finally {
      setLoading(false);
    }
  };

  const directions =
    result && result.ok
      ? (result.data.plausibleDirections ?? []).map(directionLabel)
      : [];

  const actionVectorCount =
    result && result.ok && Array.isArray(result.data.actionVectors)
      ? result.data.actionVectors.length
      : 0;

  const resolvedTrace = extractTrace(result);
  const finalDiagnostic = result && result.ok ? result.data.finalDiagnostic : null;
  const profileSnapshot = finalDiagnostic?.profileSnapshot ?? null;
  const affinityDebug = getAffinityDebug(result);
  const negativeEvidenceReview =
    result && result.ok
      ? result.data.negativeEvidenceReview ?? result.data.discardJudgeReview ?? null
      : null;

  const topAffinities = affinityDebug.topAffinities;
  const buriedCapacities = affinityDebug.buriedCapacities;
  const likelyContributionModes = affinityDebug.likelyContributionModes;
  const likelyFlourishingConditions = affinityDebug.likelyFlourishingConditions;
  const evidence = affinityDebug.evidence;
  const affinityScores = affinityDebug.affinityScores;
  const familyScores = affinityDebug.familyScores;

  const latestDiagnosticForThemes = useMemo(() => {
    if (enrichedResult?.ok && enrichedResult.data) return enrichedResult.data;
    if (originalResult?.ok && originalResult.data) return originalResult.data;
    return null;
  }, [enrichedResult, originalResult]);

  const guidedThemeSuggestions: GuidedThemeSuggestion[] = useMemo(
    () =>
      latestDiagnosticForThemes ? selectGuidedThemes(latestDiagnosticForThemes, 5) : [],
    [latestDiagnosticForThemes],
  );

  return (
    <main className="mx-auto max-w-7xl p-6 space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
          Internal lab
        </p>
        <h1 className="text-3xl font-semibold">Evaluation harness interno</h1>
        <p className="text-sm text-neutral-600">
          Esta pantalla sirve para probar el sistema con casos diversos y evitar
          depender de un solo caso humano.
        </p>
      </div>

      <section className="rounded-2xl border p-5 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Caso de prueba</label>
          <select
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={selectedCaseId}
            onChange={(event) => {
              setSelectedCaseId(event.target.value);
              setOriginalResult(null);
              setEnrichedResult(null);
              setManualRound2Answer("");
              setManualRound3Answer("");
              setLastManualRoundSubmitted(null);
              setManualCompletionFields([]);
            }}
          >
            {HUMAN_LANGUAGE_CASES.map((testCase) => (
              <option key={testCase.id} value={testCase.id}>
                {testCase.label}
              </option>
            ))}
          </select>
        </div>

        {selectedCase ? (
          <div className="rounded-lg border p-4 space-y-2">
            <p className="text-sm font-medium">Expectativa</p>
            <p className="text-sm text-neutral-700">{selectedCase.expectation}</p>
          </div>
        ) : null}

        <button
          onClick={handleRunCase}
          disabled={loading || !selectedCase}
          className="rounded-md border border-black px-4 py-2 text-sm disabled:opacity-50"
        >
          {loading ? "Corriendo caso..." : "Correr caso"}
        </button>

        {originalResult && originalResult.ok ? (
          <div className="rounded-lg border p-4 space-y-2 text-sm text-neutral-700">
            <p>
              <strong>Resultado original:</strong>{" "}
              {originalResult.data.resultType ?? "n/a"}
            </p>
            {enrichedResult && enrichedResult.ok ? (
              <p>
                <strong>Resultado enriquecido:</strong>{" "}
                {enrichedResult.data.resultType ?? "n/a"}
              </p>
            ) : null}
          </div>
        ) : null}

        {followup &&
        result &&
        result.ok &&
        result.data.resultType === "insufficient_evidence" ? (
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="text-sm font-medium">Follow-up disponible</h3>
            <p className="text-sm text-neutral-700">
              <strong>round:</strong> {followup.round ?? "n/a"}
            </p>
            <p className="text-sm text-neutral-700">
              <strong>ambiguityType:</strong> {followup.ambiguityType ?? "n/a"}
            </p>
            <p className="text-sm text-neutral-700">
              <strong>reason:</strong> {followup.reason}
            </p>
            {followup.pack?.questions?.length ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Preguntas sugeridas</p>
                <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
                  {followup.pack.questions.map((question) => (
                    <li key={question.id}>
                      {question.prompt}
                      {question.helpText ? ` — ${question.helpText}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {followup.round === 2 ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Respuesta manual de ronda 2
                </label>
                <textarea
                  className="w-full rounded-md border px-3 py-2 text-sm min-h-24"
                  value={manualRound2Answer}
                  onChange={(event) => setManualRound2Answer(event.target.value)}
                  placeholder="Escribí acá la respuesta manual del fundador para ronda 2..."
                />
                <button
                  onClick={() => handleManualFollowupSubmit(2)}
                  disabled={loading || manualRound2Answer.trim().length === 0}
                  className="rounded-md border border-black px-4 py-2 text-sm disabled:opacity-50"
                >
                  Enviar respuesta manual R2
                </button>
              </div>
            ) : null}

            {followup.round === 3 ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Respuesta manual de ronda 3
                </label>
                <textarea
                  className="w-full rounded-md border px-3 py-2 text-sm min-h-24"
                  value={manualRound3Answer}
                  onChange={(event) => setManualRound3Answer(event.target.value)}
                  placeholder="Escribí acá la respuesta manual del fundador para ronda 3..."
                />
                <button
                  onClick={() => handleManualFollowupSubmit(3)}
                  disabled={loading || manualRound3Answer.trim().length === 0}
                  className="rounded-md border border-black px-4 py-2 text-sm disabled:opacity-50"
                >
                  Enviar respuesta manual R3
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {manualCompletionFields.length > 0 ? (
          <div className="rounded-lg border p-4 space-y-2">
            <p className="text-sm font-medium">Campos completados manualmente</p>
            <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
              {manualCompletionFields.map((field, index) => (
                <li key={`manual-field-${index}`}>{field}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {enrichedResult && enrichedResult.ok ? (
          <div className="rounded-lg border p-4 space-y-2 text-sm">
            <p className="font-medium">Señal de promoción</p>
            {enrichedResult.data.resultType === "clear_direction" ? (
              (() => {
                const trace = extractTrace(enrichedResult) as any;
                const verdict = trace?.finalAdjudication?.verdict;
                const isFrontier = verdict === "open_frontier_or_review";
                return (
                  <p className="text-neutral-700">
                    {isFrontier ? "Frontier support" : "Promover a learnedCases"}
                  </p>
                );
              })()
            ) : enrichedResult.data.resultType === "insufficient_evidence" &&
              lastManualRoundSubmitted === 3 ? (
              <p className="text-neutral-700">Seed refinado</p>
            ) : (
              <p className="text-neutral-700">Sin señal de promoción todavía</p>
            )}
          </div>
        ) : null}
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border p-5 space-y-3">
          <h2 className="text-lg font-medium">Entrada resumida</h2>

          {normalizedPayload ? (
            <div className="space-y-2 text-sm text-neutral-700">
              <p>
                <strong>Situación actual:</strong>{" "}
                {normalizedPayload.currentContext.currentSituation ?? ""}
              </p>

              <p>
                <strong>Patrones repetidos:</strong>{" "}
                {normalizedPayload.narrative.repeatedWorkPatterns ?? ""}
              </p>

              <p>
                <strong>Vida comprimida:</strong>{" "}
                {normalizedPayload.narrative.whatFeelsCompressedNow ?? ""}
              </p>

              <p>
                <strong>Restricciones:</strong>{" "}
                {normalizedPayload.currentContext.restrictions?.join(", ") ?? ""}
              </p>

              <p>
                <strong>Activos:</strong>{" "}
                {normalizedPayload.currentContext.assets?.join(", ") ?? ""}
              </p>
            </div>
          ) : (
            <p className="text-sm text-neutral-700">No hay caso seleccionado.</p>
          )}
        </div>

        <div className="rounded-2xl border p-5 space-y-3">
          <h2 className="text-lg font-medium">Salida del sistema</h2>

          {!result ? (
            <p className="text-sm text-neutral-700">
              Todavía no corriste ningún caso.
            </p>
          ) : result.ok ? (
            <div className="space-y-2 text-sm text-neutral-700">
              <p>
                <strong>resultType:</strong> {result.data.resultType ?? "n/a"}
              </p>
              <p>
                <strong>corePattern:</strong> {result.data.corePattern ?? "n/a"}
              </p>
              <p>
                <strong>dominantTension:</strong>{" "}
                {result.data.dominantTension ?? "n/a"}
              </p>
              <p>
                <strong>Direcciones:</strong>{" "}
                {directions.length > 0 ? directions.join(", ") : "ninguna"}
              </p>
              <p>
                <strong>Action vectors:</strong> {actionVectorCount}
              </p>
              <p>
                <strong>Community routing:</strong>{" "}
                {result.data.communityRouting ?? "n/a"}
              </p>
              <p>
                <strong>Diagnóstico:</strong>{" "}
                {result.data.summaryForUser?.diagnostico ?? "n/a"}
              </p>
              {finalDiagnostic?.severity ? (
                <p>
                  <strong>Severity:</strong> {finalDiagnostic.severity}
                </p>
              ) : null}
              {finalDiagnostic?.functionalSubtype ? (
                <p>
                  <strong>Functional subtype:</strong>{" "}
                  {typeof finalDiagnostic.functionalSubtype === "object"
                    ? `${finalDiagnostic.functionalSubtype.label} (${finalDiagnostic.functionalSubtype.id})`
                    : finalDiagnostic.functionalSubtype}
                </p>
              ) : null}
              <p>
                <strong>Top affinities:</strong> {topAffinities.length}
              </p>
              <p>
                <strong>Buried capacities:</strong> {buriedCapacities.length}
              </p>
              <p>
                <strong>Family scores:</strong> {familyScores.length}
              </p>
            </div>
          ) : (
            <div className="space-y-2 text-sm text-red-800">
              <p>
                <strong>error:</strong> {result.error}
              </p>
              {result.detail ? (
                <p>
                  <strong>detail:</strong> {result.detail}
                </p>
              ) : null}
              {result.missingFields?.length ? (
                <p>
                  <strong>missingFields:</strong>{" "}
                  {result.missingFields.join(", ")}
                </p>
              ) : null}
              {result.warnings?.length ? (
                <p>
                  <strong>warnings:</strong> {result.warnings.join(", ")}
                </p>
              ) : null}
            </div>
          )}
        </div>

        <div className="rounded-2xl border p-5 space-y-3">
          <h2 className="text-lg font-medium">Trace de decisión</h2>

          {resolvedTrace ? (
            <pre className="whitespace-pre-wrap break-words text-xs text-neutral-700 font-sans">
              {formatUnknown(resolvedTrace)}
            </pre>
          ) : (
            <p className="text-sm text-neutral-700">
              Todavía no hay trace disponible.
            </p>
          )}
        </div>
      </section>

      {result && result.ok && finalDiagnostic ? (
        <>
          <section className="rounded-2xl border p-5 space-y-3">
            <h2 className="text-xl font-semibold">Diagnóstico final enriquecido</h2>

            {profileSnapshot ? (
              <div className="rounded-xl border p-4 space-y-2 text-sm text-neutral-700">
                <p>
                  <strong>Profile snapshot:</strong>{" "}
                  {profileSnapshot.label ?? "n/a"}
                </p>
                {typeof profileSnapshot.confidence === "number" ? (
                  <p>
                    <strong>Confidence:</strong> {profileSnapshot.confidence}
                  </p>
                ) : null}
                {profileSnapshot.summary ? <p>{profileSnapshot.summary}</p> : null}
              </div>
            ) : null}

            <div className="grid gap-5 lg:grid-cols-2">
              <BlockCard
                title="Cómo genera valor"
                block={finalDiagnostic.valueGeneration}
              />
              <BlockCard
                title="Desalineación actual"
                block={finalDiagnostic.currentMisalignment}
              />
              <BlockCard
                title="Mejores contextos de trabajo"
                block={finalDiagnostic.bestWorkContexts}
              />
              <BlockCard
                title="Riesgo de mala lectura"
                block={finalDiagnostic.misreadRisk}
              />
              <BlockCard
                title="Recomendación de transición"
                block={finalDiagnostic.transitionRecommendation}
              />
              <BlockCard
                title="Próximo movimiento"
                block={finalDiagnostic.nextMove}
              />
            </div>
          </section>

          <section className="rounded-2xl border p-5 space-y-4">
            <h2 className="text-xl font-semibold">Human Affinities bridge</h2>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border p-5 space-y-3">
                <h3 className="text-base font-medium">Top affinities</h3>
                {topAffinities.length > 0 ? (
                  <div className="space-y-3">
                    {topAffinities.map((affinity) => (
                      <AffinityCard key={affinity.id} affinity={affinity} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-700">
                    Todavía no hay afinidades dominantes visibles.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border p-5 space-y-3">
                <h3 className="text-base font-medium">Buried capacities</h3>
                {buriedCapacities.length > 0 ? (
                  <div className="space-y-3">
                    {buriedCapacities.map((affinity) => (
                      <AffinityCard key={affinity.id} affinity={affinity} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-700">
                    Todavía no aparecen capacidades enterradas claras.
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border p-5 space-y-3">
                <h3 className="text-base font-medium">Likely contribution modes</h3>
                {likelyContributionModes.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
                    {likelyContributionModes.map((mode, index) => (
                      <li key={`${mode}-${index}`}>{mode}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-neutral-700">
                    Todavía no hay modos de contribución claros.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border p-5 space-y-3">
                <h3 className="text-base font-medium">
                  Likely flourishing conditions
                </h3>
                {likelyFlourishingConditions.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
                    {likelyFlourishingConditions.map((condition, index) => (
                      <li key={`${condition}-${index}`}>{condition}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-neutral-700">
                    Todavía no hay condiciones de florecimiento claras.
                  </p>
                )}
              </div>
            </div>

            <section className="rounded-2xl border p-5 space-y-3">
              <h3 className="text-base font-medium">Evidence fragments</h3>
              {evidence.length > 0 ? (
                <div className="space-y-3">
                  {evidence.map((fragment) => (
                    <div
                      key={fragment.id}
                      className="rounded-xl border border-neutral-200 p-4 space-y-1"
                    >
                      <p className="text-sm font-medium">{fragment.id}</p>
                      <p className="text-xs text-neutral-500">
                        {fragment.source} · {fragment.temporalWeight ?? "n/a"} ·{" "}
                        {fragment.valence ?? "n/a"} · intensity{" "}
                        {fragment.intensity ?? "n/a"}
                      </p>
                      <p className="text-sm text-neutral-700">{fragment.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-700">
                  Todavía no hay evidence fragments.
                </p>
              )}
            </section>
          </section>

          <section className="rounded-2xl border p-5 space-y-4">
            <h2 className="text-xl font-semibold">Family scores</h2>

            {familyScores.length > 0 ? (
              <div className="space-y-4">
                {familyScores.map((family, index) => {
                  const familyId = resolveFamilyScoreId(family);

                  return (
                    <div
                      key={`${familyId}-${index}`}
                      className="rounded-2xl border p-5 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-base font-medium">
                            #{index + 1} · {family.label}
                          </p>
                          <p className="text-sm text-neutral-600">{familyId}</p>
                        </div>

                        <div className="text-right text-sm text-neutral-700">
                          <p>
                            <strong>score:</strong> {family.score.toFixed(2)}
                          </p>
                          <p>
                            <strong>confidence:</strong>{" "}
                            {family.confidence.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-neutral-700">{family.summary}</p>

                      {family.matchedCoreAffinities.length > 0 ? (
                        <p className="text-sm text-neutral-700">
                          <strong>Core affinities:</strong>{" "}
                          {family.matchedCoreAffinities.join(", ")}
                        </p>
                      ) : null}

                      {family.matchedSupportingAffinities.length > 0 ? (
                        <p className="text-sm text-neutral-700">
                          <strong>Supporting affinities:</strong>{" "}
                          {family.matchedSupportingAffinities.join(", ")}
                        </p>
                      ) : null}

                      {family.tensionHits.length > 0 ? (
                        <p className="text-sm text-neutral-700">
                          <strong>Tension hits:</strong>{" "}
                          {family.tensionHits.join(", ")}
                        </p>
                      ) : null}

                      {family.dominantAffinityIds &&
                      family.dominantAffinityIds.length > 0 ? (
                        <p className="text-sm text-neutral-700">
                          <strong>Dominant affinities:</strong>{" "}
                          {family.dominantAffinityIds.join(", ")}
                        </p>
                      ) : null}

                      {family.subtypeCandidates.length > 0 ? (
                        <p className="text-sm text-neutral-700">
                          <strong>Subtype candidates:</strong>{" "}
                          {family.subtypeCandidates.join(", ")}
                        </p>
                      ) : null}

                      {family.misreadAs.length > 0 ? (
                        <p className="text-sm text-neutral-700">
                          <strong>Misread as:</strong>{" "}
                          {family.misreadAs.join(", ")}
                        </p>
                      ) : null}

                      {family.rationale.length > 0 ? (
                        <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
                          {family.rationale.slice(0, 3).map((item, rationaleIndex) => (
                            <li key={`${familyId}-rationale-${rationaleIndex}`}>
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-neutral-700">
                Todavía no hay family scores visibles.
              </p>
            )}
          </section>

          <section className="rounded-2xl border p-5 space-y-3">
            <h2 className="text-lg font-medium">JSON de finalDiagnostic</h2>
            <pre className="whitespace-pre-wrap break-words text-xs text-neutral-700 font-sans">
              {formatUnknown(finalDiagnostic)}
            </pre>
          </section>

          <section className="rounded-2xl border p-5 space-y-3">
            <h2 className="text-lg font-medium">JSON de affinityScores</h2>
            <pre className="whitespace-pre-wrap break-words text-xs text-neutral-700 font-sans">
              {formatUnknown(affinityScores)}
            </pre>
          </section>

          <section className="rounded-2xl border p-5 space-y-3">
            <h2 className="text-lg font-medium">JSON de familyScores</h2>
            <pre className="whitespace-pre-wrap break-words text-xs text-neutral-700 font-sans">
              {formatUnknown(familyScores)}
            </pre>
          </section>

          <section className="rounded-2xl border p-5 space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">
                Temáticas sugeridas — preview MVP
              </h2>
              <p className="text-sm text-neutral-600 border-l-4 border-amber-300 bg-amber-50/60 pl-3 py-2 rounded-r">
                Estas sugerencias no modifican el diagnóstico, no alteran scores y no
                cambian resultType. Sólo muestran posibles puertas temáticas para la capa
                de selección guiada.
              </p>
            </div>

            {guidedThemeSuggestions.length === 0 ? (
              <p className="text-sm text-neutral-700">
                Todavía no hay Temáticas sugeridas para esta salida.
              </p>
            ) : (
              <div className="space-y-4">
                {guidedThemeSuggestions.map((suggestion, index) => {
                  const theme = suggestion.theme;
                  const reasons = Array.isArray(suggestion.reasons)
                    ? suggestion.reasons
                    : [];
                  const matchedFamilies = Array.isArray(suggestion.matchedFamilies)
                    ? suggestion.matchedFamilies
                    : [];
                  const matchedAffinities = Array.isArray(suggestion.matchedAffinities)
                    ? suggestion.matchedAffinities
                    : [];
                  const activationPaths = Array.isArray(theme?.suggestedActivationPaths)
                    ? theme.suggestedActivationPaths
                    : [];
                  const communityHints = Array.isArray(theme?.communitySpaceHints)
                    ? theme.communitySpaceHints
                    : [];

                  return (
                    <div
                      key={`${theme?.id ?? "theme"}-${index}`}
                      className="rounded-2xl border p-5 space-y-3 text-sm text-neutral-700"
                    >
                      <p className="text-base font-medium text-neutral-900">
                        #{index + 1} · {theme?.shortLabel ?? "sin etiqueta"}
                      </p>
                      <p>
                        <strong>theme.id:</strong> {theme?.id ?? "n/a"}
                      </p>
                      <p>
                        <strong>themeLayer:</strong>{" "}
                        {typeof theme?.themeLayer === "string"
                          ? theme.themeLayer
                          : "n/a"}
                      </p>
                      <p>
                        <strong>selector score:</strong>{" "}
                        {typeof suggestion.score === "number"
                          ? suggestion.score.toFixed(3)
                          : "n/a"}
                      </p>
                      <p>
                        <strong>userFacingText:</strong>{" "}
                        {typeof theme?.userFacingText === "string"
                          ? theme.userFacingText
                          : "n/a"}
                      </p>
                      <p>
                        <strong>recognitionPhrase:</strong>{" "}
                        {typeof theme?.recognitionPhrase === "string"
                          ? theme.recognitionPhrase
                          : "n/a"}
                      </p>
                      <p>
                        <strong>matchedFamilies:</strong>{" "}
                        {matchedFamilies.length > 0 ? matchedFamilies.join(", ") : "—"}
                      </p>
                      <p>
                        <strong>matchedAffinities:</strong>{" "}
                        {matchedAffinities.length > 0
                          ? matchedAffinities.join(", ")
                          : "—"}
                      </p>
                      {reasons.length > 0 ? (
                        <div className="space-y-1">
                          <p className="font-medium text-neutral-900">reasons</p>
                          <ul className="list-disc pl-5 space-y-1">
                            {reasons.map((reason, reasonIndex) => (
                              <li key={`reason-${index}-${reasonIndex}`}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p>
                          <strong>reasons:</strong> —
                        </p>
                      )}
                      {activationPaths.length > 0 ? (
                        <div className="space-y-1">
                          <p className="font-medium text-neutral-900">
                            suggestedActivationPaths
                          </p>
                          <ul className="list-disc pl-5 space-y-1">
                            {activationPaths.map((path, pathIndex) => (
                              <li key={`path-${index}-${pathIndex}`}>{path}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p>
                          <strong>suggestedActivationPaths:</strong> —
                        </p>
                      )}
                      {communityHints.length > 0 ? (
                        <div className="space-y-1">
                          <p className="font-medium text-neutral-900">
                            communitySpaceHints
                          </p>
                          <ul className="list-disc pl-5 space-y-1">
                            {communityHints.map((hint, hintIndex) => (
                              <li key={`hint-${index}-${hintIndex}`}>{hint}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p>
                          <strong>communitySpaceHints:</strong> —
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-2xl border p-5 space-y-4">
            <h2 className="text-lg font-medium">
              Juez de descarte — audit-only / shadow preview
            </h2>

            {!negativeEvidenceReview ? (
              <p className="text-sm text-neutral-700">
                No hay revisión de descarte disponible en esta corrida.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border p-4 text-sm text-neutral-700 space-y-1">
                  <p>
                    <strong>mode:</strong> {negativeEvidenceReview.mode}
                  </p>
                  <p>
                    <strong>wouldChangeTopFamily (gated):</strong>{" "}
                    {String(negativeEvidenceReview.wouldChangeTopFamily)}
                  </p>
                  <p>
                    <strong>wouldAffectRealResult:</strong>{" "}
                    {String(negativeEvidenceReview.wouldAffectRealResult)}
                  </p>
                  <p>
                    <strong>humanReviewSuggested:</strong>{" "}
                    {String(negativeEvidenceReview.humanReviewSuggested)}
                  </p>
                  <p>
                    <strong>frontierPatternNeedsReview:</strong>{" "}
                    {String(negativeEvidenceReview.frontierPatternNeedsReview)}
                  </p>
                  <p>
                    <strong>wouldOpenFrontier:</strong>{" "}
                    {String(negativeEvidenceReview.wouldOpenFrontier)}
                  </p>
                  <p>
                    <strong>wouldCloseFrontier:</strong>{" "}
                    {String(negativeEvidenceReview.wouldCloseFrontier)}
                  </p>
                  <p>
                    <strong>summary:</strong> {negativeEvidenceReview.summary}
                  </p>
                </div>

                <div className="rounded-xl border p-4 space-y-2 text-sm text-neutral-700">
                  <p className="font-medium">Ranking original</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {negativeEvidenceReview.originalRanking.map((item) => (
                      <li key={`original-${item.familyId}`}>
                        #{item.rank} {item.familyId} — score {item.score.toFixed(3)}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border p-4 space-y-2 text-sm text-neutral-700">
                  <p className="font-medium">Ranking sombra (sólo penalizaciones con shouldAffectScoreNow)</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {negativeEvidenceReview.shadowAdjustedRankingPreview.map((item) => (
                      <li key={`shadow-${item.familyId}`}>
                        #{item.shadowRank} {item.familyId} — shadow{" "}
                        {item.shadowScore.toFixed(3)} (orig #{item.originalRank}{" "}
                        {item.originalScore.toFixed(3)})
                      </li>
                    ))}
                  </ul>
                </div>

                {negativeEvidenceReview.evaluatedFamilies.map((finding, index) => (
                  <div
                    key={`${finding.familyId}-${index}`}
                    className="rounded-xl border p-4 space-y-2 text-sm text-neutral-700"
                  >
                    <p>
                      <strong>{finding.familyLabel}</strong> ({finding.familyId})
                    </p>
                    <p>
                      <strong>verdict:</strong> {finding.verdict}
                    </p>
                    <p>
                      <strong>originalRank/originalScore:</strong>{" "}
                      {finding.originalRank ?? "n/a"} /{" "}
                      {typeof finding.originalScore === "number"
                        ? finding.originalScore.toFixed(3)
                        : "n/a"}
                    </p>
                  <p>
                    <strong>suggestedPenalty (audit):</strong>{" "}
                    {finding.suggestedPenalty ?? 0}{" "}
                    <span className="text-neutral-500">
                      | sombra aplicable:{" "}
                      {finding.shouldAffectScoreNow ? (finding.suggestedPenalty ?? 0) : 0}
                    </span>
                  </p>
                    <p>
                      <strong>shouldAffectScoreNow:</strong>{" "}
                      {String(finding.shouldAffectScoreNow)}
                    </p>
                    {finding.reasons.length > 0 ? (
                      <p>
                        <strong>reasons:</strong> {finding.reasons.join(" | ")}
                      </p>
                    ) : null}
                    {finding.supportingEvidence && finding.supportingEvidence.length > 0 ? (
                      <p>
                        <strong>supportingEvidence:</strong>{" "}
                        {finding.supportingEvidence.join(", ")}
                      </p>
                    ) : null}
                    {finding.contradictingEvidence &&
                    finding.contradictingEvidence.length > 0 ? (
                      <p>
                        <strong>contradictingEvidence:</strong>{" "}
                        {finding.contradictingEvidence.join(", ")}
                      </p>
                    ) : null}
                    {finding.riskNotes && finding.riskNotes.length > 0 ? (
                      <p>
                        <strong>riskNotes:</strong> {finding.riskNotes.join(" | ")}
                      </p>
                    ) : null}
                  </div>
                ))}

                <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 space-y-2">
                  <p>
                    El preview no modifica familyScores ni el diagnóstico publicado. El ranking
                    sombra usa sólo penalizaciones con <code className="text-xs">shouldAffectScoreNow</code>{" "}
                    (gates estrictos).
                  </p>
                  {negativeEvidenceReview.warnings.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {negativeEvidenceReview.warnings.map((w, i) => (
                        <li key={`neg-warn-${i}`}>{w}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            )}
          </section>
        </>
      ) : null}

      <BiasMonitorPanel />
    </main>
  );
}

function BiasMonitorPanel() {
  const [open, setOpen] = useState(false);
  const report = useMemo(() => (open ? runBiasMonitor() : null), [open]);

  return (
    <section className="mt-10 border-t border-gray-200 pt-6">
      <button
        onClick={() => setOpen(!open)}
        className="text-sm font-semibold text-indigo-700 hover:text-indigo-900 underline"
      >
        {open ? "▾ Cerrar Monitor de Sesgo" : "▸ Monitor de Sesgo — Learned Cases"}
      </button>

      {open && report && (
        <div className="mt-4 space-y-4 text-sm">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-gray-100 p-3">
              <div className="text-2xl font-bold">{report.totalCases}</div>
              <div className="text-gray-500">Total casos</div>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <div className="text-2xl font-bold text-green-700">{report.activeCases}</div>
              <div className="text-gray-500">Activos (influyen)</div>
            </div>
            <div className="rounded-lg bg-yellow-50 p-3">
              <div className="text-2xl font-bold text-yellow-700">{report.quarantinedCases}</div>
              <div className="text-gray-500">Cuarentena / No influyen</div>
            </div>
          </div>

          {report.alerts.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-800">Alertas</h4>
              {report.alerts.map((alert, i) => (
                <div
                  key={`bias-alert-${i}`}
                  className={`rounded-lg border p-3 ${
                    alert.severity === "critical"
                      ? "border-red-300 bg-red-50 text-red-900"
                      : alert.severity === "warning"
                        ? "border-amber-300 bg-amber-50 text-amber-900"
                        : "border-blue-200 bg-blue-50 text-blue-900"
                  }`}
                >
                  <span className="font-mono text-xs uppercase opacity-60">
                    [{alert.severity}] {alert.category}
                  </span>
                  <p className="mt-1">{alert.message}</p>
                </div>
              ))}
            </div>
          )}

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Distribución por Familia (todas)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="p-1">Familia</th>
                    <th className="p-1 text-center">Primary</th>
                    <th className="p-1 text-center">Acceptable</th>
                    <th className="p-1 text-center">Rival</th>
                    <th className="p-1 text-center">Influencia</th>
                    <th className="p-1 text-center">Quarantine</th>
                  </tr>
                </thead>
                <tbody>
                  {report.familyDistribution.map((d) => (
                    <tr key={d.familyId} className="border-b border-gray-100">
                      <td className="p-1 font-mono">{d.familyId}</td>
                      <td className="p-1 text-center">{d.asPrimary}</td>
                      <td className="p-1 text-center">{d.asAcceptable}</td>
                      <td className="p-1 text-center">{d.asRival}</td>
                      <td className="p-1 text-center font-semibold">{d.activeInfluence}</td>
                      <td className="p-1 text-center text-yellow-600">{d.quarantined || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {report.vocabularyConcentration.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Concentración Léxica (tokens repetidos)</h4>
              <div className="flex flex-wrap gap-2">
                {report.vocabularyConcentration.slice(0, 15).map((v) => (
                  <span
                    key={v.token}
                    className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                      v.isSingleFamilyDominant
                        ? "bg-amber-100 text-amber-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    &ldquo;{v.token}&rdquo; → {v.familiesPushed.join(", ")} ({v.occurrences}x)
                  </span>
                ))}
              </div>
            </div>
          )}

          {report.contaminationFindings.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Contaminación de Lenguaje</h4>
              <div className="space-y-1">
                {report.contaminationFindings.map((f) => (
                  <div key={f.caseId} className="rounded border border-red-200 bg-red-50 p-2 text-xs text-red-800">
                    <span className="font-mono">{f.caseId}</span>
                    <span className="mx-1">→</span>
                    <span>{f.matchedMarkers.join(", ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.hotFamilyShare !== null && (
            <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
              <h4 className="font-semibold text-indigo-800 text-xs mb-1">Hot Families (CB, EG, PC, CS) — vigilancia secundaria</h4>
              <p className="text-xs text-indigo-700">
                Concentran {(report.hotFamilyShare * 100).toFixed(0)}% de la influencia activa.
                {report.hotFamilyShare > 0.7
                  ? " Alerta: posible sobre-calibración hacia esas familias."
                  : " Dentro de rango aceptable."}
              </p>
            </div>
          )}

          <p className="text-xs text-gray-400">
            Generado: {report.timestamp} | Audit-only — no modifica diagnóstico ni scores.
          </p>
        </div>
      )}
    </section>
  );
}