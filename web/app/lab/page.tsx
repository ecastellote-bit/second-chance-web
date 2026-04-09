"use client";

import { useMemo, useState } from "react";
import { EVALUATION_CASES } from "@/lib/testing/evaluationCases";

type DirectionItem =
  | string
  | {
      label?: string;
      ecosystem?: string;
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
  };
  trace?: unknown;
};

type AnalyzeResponse =
  | {
      ok: true;
      data: AnalyzeSuccess;
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
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(", ");
  }

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
            payload.narrative.repeatedWorkPatterns ??
            payload.repeatedPatterns ??
            "",
          naturalSocialRoles: payload.narrative.naturalSocialRoles ?? "",
          lossesOrRenunciations:
            payload.narrative.lossesOrRenunciations ?? "",
          whatFeelsCompressedNow:
            payload.narrative.whatFeelsCompressedNow ??
            payload.compressedLife ??
            "",
          additionalContext: payload.narrative.additionalContext ?? "",
        },
        currentContext: {
          currentSituation:
            payload.currentContext.currentSituation ??
            payload.currentSituation ??
            "",
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
          payload.childhoodMemories ??
          payload.earlyFascinations ??
          "",
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

export default function LabPage() {
  const [selectedCaseId, setSelectedCaseId] = useState(
    EVALUATION_CASES[0]?.id ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const selectedCase = useMemo(
    () =>
      EVALUATION_CASES.find((testCase) => testCase.id === selectedCaseId) ??
      null,
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

          {result && result.ok && result.trace ? (
        <pre className="whitespace-pre-wrap break-words text-xs text-neutral-700 font-sans">
              {formatUnknown(result.trace)}
            </pre>
          ) : (
            <p className="text-sm text-neutral-700">
              Todavía no hay trace disponible.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}