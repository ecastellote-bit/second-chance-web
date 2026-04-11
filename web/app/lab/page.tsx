"use client";

import { useMemo, useState } from "react";
import { EVALUATION_CASES } from "@/lib/testing/evaluationCases";

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
  functionalSubtype?: string;
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
  trace?: unknown;
  diagnosticTrace?: unknown;
  debugTrace?: unknown;
  debug?: {
    trace?: unknown;
  };
};

type AnalyzeResponse =
  | {
      ok: true;
      data: AnalyzeSuccess;
      trace?: unknown;
      warnings?: string[];
    }
  | {
      ok: false;
      error: string;
      detail?: string;
      missingFields?: string[];
      warnings?: string[];
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

export default function LabPage() {
  const [selectedCaseId, setSelectedCaseId] = useState(
    EVALUATION_CASES[0]?.id ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const selectedCase = useMemo(
    () =>
      EVALUATION_CASES.find((testCase) => testCase.id === selectedCaseId) ?? null,
    [selectedCaseId],
  );

  const normalizedPayload = useMemo(
    () => (selectedCase ? normalizePayload(selectedCase.payload) : null),
    [selectedCase],
  );

  const handleRunCase = async () => {
    if (!selectedCase || !normalizedPayload) return;

    setLoading(true);

    try {
      const response = await fetch("/api/lab-analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caseId: selectedCase.id,
          intake: normalizedPayload,
          payload: normalizedPayload,
        }),
      });

      const json = (await response.json()) as AnalyzeResponse;
      setResult(json);
    } catch (error) {
      setResult({
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
            onChange={(event) => setSelectedCaseId(event.target.value)}
          >
            {EVALUATION_CASES.map((testCase) => (
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
                  {finalDiagnostic.functionalSubtype}
                </p>
              ) : null}
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

          <section className="rounded-2xl border p-5 space-y-3">
            <h2 className="text-lg font-medium">JSON de finalDiagnostic</h2>
            <pre className="whitespace-pre-wrap break-words text-xs text-neutral-700 font-sans">
              {formatUnknown(finalDiagnostic)}
            </pre>
          </section>
        </>
      ) : null}
    </main>
  );
}