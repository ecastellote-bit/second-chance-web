"use client";

import { useState } from "react";
import type { FinalReading } from "@/lib/types/result";
import type { DiagnosticTrace } from "@/lib/types/debug";
import { EVALUATION_CASES } from "@/lib/testing/evaluationCases";

type AnalyzeResponse =
  | {
      ok: true;
      data: FinalReading;
      warnings?: string[];
      trace: DiagnosticTrace;
    }
  | {
      ok: false;
      error: string;
      missingFields?: string[];
      warnings?: string[];
      detail?: string;
    };

export default function LabPage() {
  const [selectedCaseId, setSelectedCaseId] = useState(
    EVALUATION_CASES[0]?.id ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const selectedCase =
    EVALUATION_CASES.find((testCase) => testCase.id === selectedCaseId) ?? null;

  const handleRunCase = async () => {
    if (!selectedCase) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/lab-analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedCase.payload),
      });

      const data = (await res.json()) as AnalyzeResponse;
      setResult(data);
    } catch (error) {
      setResult({
        ok: false,
        error: "NETWORK_ERROR",
        detail: String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-neutral-500">
            Internal Lab
          </p>
          <h1 className="text-3xl font-semibold">
            Evaluation harness interno
          </h1>
          <p className="text-sm text-neutral-700">
            Esta pantalla sirve para probar el sistema con casos diversos y
            evitar depender de un solo caso humano.
          </p>
        </div>

        <section className="border rounded-xl p-5 space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Caso de prueba</label>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-white"
            >
              {EVALUATION_CASES.map((testCase) => (
                <option key={testCase.id} value={testCase.id}>
                  {testCase.label}
                </option>
              ))}
            </select>
          </div>

          {selectedCase ? (
            <div className="rounded-lg border border-neutral-200 p-4 space-y-2">
              <p className="text-sm font-medium">Expectativa</p>
              <p className="text-sm text-neutral-700">
                {selectedCase.expectation}
              </p>
            </div>
          ) : null}

          <button
            onClick={handleRunCase}
            disabled={loading || !selectedCase}
            className="px-4 py-2 rounded-md border border-black text-sm disabled:opacity-60"
          >
            {loading ? "Corriendo caso..." : "Correr caso"}
          </button>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <div className="border rounded-xl p-5 space-y-3">
            <h2 className="text-lg font-medium">Entrada resumida</h2>

            {selectedCase ? (
              <div className="space-y-2 text-sm text-neutral-700">
                <p>
                  <strong>Situación actual:</strong>{" "}
                  {selectedCase.payload.currentContext.currentSituation}
                </p>
                <p>
                  <strong>Patrones repetidos:</strong>{" "}
                  {selectedCase.payload.narrative.repeatedWorkPatterns}
                </p>
                <p>
                  <strong>Vida comprimida:</strong>{" "}
                  {selectedCase.payload.narrative.whatFeelsCompressedNow}
                </p>
                <p>
                  <strong>Restricciones:</strong>{" "}
                  {selectedCase.payload.currentContext.restrictions.join(", ")}
                </p>
                <p>
                  <strong>Activos:</strong>{" "}
                  {selectedCase.payload.currentContext.assets.join(", ")}
                </p>
              </div>
            ) : (
              <p className="text-sm text-neutral-700">
                No hay caso seleccionado.
              </p>
            )}
          </div>

          <div className="border rounded-xl p-5 space-y-3">
            <h2 className="text-lg font-medium">Salida del sistema</h2>

            {!result ? (
              <p className="text-sm text-neutral-700">
                Todavía no corriste ningún caso.
              </p>
            ) : result.ok ? (
              <div className="space-y-2 text-sm text-neutral-700">
                <p><strong>resultType:</strong> {result.data.resultType}</p>
                <p><strong>corePattern:</strong> {result.data.corePattern}</p>
                <p><strong>dominantTension:</strong> {result.data.dominantTension}</p>
                <p>
                  <strong>Direcciones:</strong>{" "}
                  {result.data.plausibleDirections.length > 0
                    ? result.data.plausibleDirections
                        .map((direction) => direction.label)
                        .join(", ")
                    : "ninguna"}
                </p>
                <p><strong>Action vectors:</strong> {result.data.actionVectors.length}</p>
                <p><strong>Community routing:</strong> {result.data.communityRouting}</p>
                <p><strong>Diagnóstico:</strong> {result.data.summaryForUser.diagnostico}</p>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-red-800">
                <p><strong>error:</strong> {result.error}</p>
                {result.detail ? <p><strong>detail:</strong> {result.detail}</p> : null}
                {result.missingFields?.length ? (
                  <p><strong>missingFields:</strong> {result.missingFields.join(", ")}</p>
                ) : null}
              </div>
            )}
          </div>

          <div className="border rounded-xl p-5 space-y-3">
            <h2 className="text-lg font-medium">Trace de decisión</h2>

            {!result ? (
              <p className="text-sm text-neutral-700">
                Todavía no hay trace disponible.
              </p>
            ) : result.ok ? (
              <div className="space-y-2 text-sm text-neutral-700">
                <p><strong>signalCount:</strong> {result.trace.signalCount}</p>
                <p><strong>signalKeys:</strong> {result.trace.signalKeys.join(", ") || "ninguna"}</p>
                <p><strong>topProfile:</strong> {result.trace.topProfileLabel ?? "ninguno"}</p>
                <p><strong>topConfidence:</strong> {result.trace.topProfileConfidence ?? "n/a"}</p>
                <p><strong>secondProfile:</strong> {result.trace.secondProfileLabel ?? "ninguno"}</p>
                <p><strong>secondConfidence:</strong> {result.trace.secondProfileConfidence ?? "n/a"}</p>
                <p>
                  <strong>plausibleDirections:</strong>{" "}
                  {result.trace.plausibleDirectionLabels.join(", ") || "ninguna"}
                </p>
                <p><strong>transitionMargin:</strong> {result.trace.transitionMargin}</p>
                <p>
                  <strong>hasCompressionNarrative:</strong>{" "}
                  {String(result.trace.hasCompressionNarrative)}
                </p>
                <p><strong>decisionReason:</strong> {result.trace.decisionReason}</p>
                <p><strong>resultTypePreview:</strong> {result.trace.resultTypePreview}</p>
              </div>
            ) : (
              <p className="text-sm text-neutral-700">
                No hay trace disponible para este error.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}