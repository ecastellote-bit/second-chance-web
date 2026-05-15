"use client";

import { useCallback, useEffect, useState } from "react";

type ReviewCase = {
  caseId: string;
  queuedAt: string;
  status: "pending" | "resolved" | "dismissed";
  triggerResult: {
    shouldEscalate: boolean;
    urgency: "low" | "medium" | "high";
    reasons: string[];
    userMessage?: string;
    internalSummary?: string;
  };
  diagnosticSnapshot: {
    resultType?: string;
    primaryFamily?: string;
    topFamilies?: Array<{ id: string; score: number }>;
    semanticConfidence?: number;
  };
  userInputSummary?: string;
};

type QueueResponse = {
  ok: boolean;
  cases: ReviewCase[];
  total: number;
  pending: number;
};

function urgencyBadge(urgency: string) {
  const styles: Record<string, string> = {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-amber-100 text-amber-800 border-amber-200",
    low: "bg-blue-100 text-blue-800 border-blue-200",
  };

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full border ${styles[urgency] ?? styles.low}`}
    >
      {urgency.toUpperCase()}
    </span>
  );
}

function formatDate(isoDate: string) {
  try {
    return new Date(isoDate).toLocaleString("es-AR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoDate;
  }
}

export default function ReviewsDashboard() {
  const [cases, setCases] = useState<ReviewCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0 });
  const [expandedCase, setExpandedCase] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/human-review-queue");
      const data: QueueResponse = await res.json();
      if (data.ok) {
        setCases(data.cases);
        setStats({ total: data.total, pending: data.pending });
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  return (
    <main className="min-h-screen bg-neutral-50 text-black px-6 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Revisión humana</h1>
            <p className="text-sm text-neutral-600">
              Casos flaggeados por el sistema que necesitan revisión manual.
            </p>
          </div>
          <button
            onClick={fetchCases}
            disabled={loading}
            className="px-4 py-2 border border-neutral-300 rounded-lg text-sm hover:bg-white disabled:opacity-50"
          >
            {loading ? "Cargando..." : "Actualizar"}
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-semibold">{stats.pending}</p>
            <p className="text-xs text-neutral-500">Pendientes</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-semibold">{stats.total}</p>
            <p className="text-xs text-neutral-500">Total histórico</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-semibold">
              {stats.total - stats.pending}
            </p>
            <p className="text-xs text-neutral-500">Resueltos</p>
          </div>
        </div>

        {/* CASE LIST */}
        {cases.length === 0 && !loading && (
          <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center">
            <p className="text-neutral-500">
              No hay casos pendientes de revisión.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {cases.map((reviewCase) => (
            <div
              key={reviewCase.caseId ?? reviewCase.queuedAt}
              className="bg-white border border-neutral-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedCase(
                    expandedCase === reviewCase.caseId ? null : reviewCase.caseId,
                  )
                }
                className="w-full text-left p-5 flex justify-between items-center hover:bg-neutral-50"
              >
                <div className="flex items-center gap-4">
                  {urgencyBadge(reviewCase.triggerResult.urgency)}
                  <div>
                    <p className="font-medium text-sm">
                      {reviewCase.diagnosticSnapshot?.primaryFamily
                        ?.replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase()) ??
                        "Caso sin familia"}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {reviewCase.diagnosticSnapshot?.resultType ?? "unknown"} — 
                      {formatDate(reviewCase.queuedAt)}
                    </p>
                  </div>
                </div>
                <span className="text-neutral-400 text-sm">
                  {expandedCase === reviewCase.caseId ? "▲" : "▼"}
                </span>
              </button>

              {expandedCase === reviewCase.caseId && (
                <div className="border-t border-neutral-100 p-5 space-y-4">
                  {/* Reasons */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-neutral-500 uppercase">
                      Razones del escalado
                    </p>
                    <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
                      {reviewCase.triggerResult.reasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Internal summary */}
                  {reviewCase.triggerResult.internalSummary && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-neutral-500 uppercase">
                        Resumen interno
                      </p>
                      <p className="text-sm text-neutral-700 leading-6">
                        {reviewCase.triggerResult.internalSummary}
                      </p>
                    </div>
                  )}

                  {/* Diagnostic snapshot */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-neutral-500 uppercase">
                      Snapshot diagnóstico
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-neutral-500">Resultado</p>
                        <p className="font-medium">
                          {reviewCase.diagnosticSnapshot?.resultType ?? "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Familia principal</p>
                        <p className="font-medium">
                          {reviewCase.diagnosticSnapshot?.primaryFamily?.replace(
                            /_/g,
                            " ",
                          ) ?? "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Confianza semántica</p>
                        <p className="font-medium">
                          {reviewCase.diagnosticSnapshot?.semanticConfidence != null
                            ? `${Math.round(reviewCase.diagnosticSnapshot.semanticConfidence * 100)}%`
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Top families */}
                  {reviewCase.diagnosticSnapshot?.topFamilies &&
                    reviewCase.diagnosticSnapshot.topFamilies.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-neutral-500 uppercase">
                          Familias top
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {reviewCase.diagnosticSnapshot.topFamilies
                            .slice(0, 5)
                            .map((f, i) => (
                              <span
                                key={i}
                                className="text-xs bg-neutral-100 border border-neutral-200 px-2 py-1 rounded"
                              >
                                {f.id?.replace(/_/g, " ")}:{" "}
                                {Math.round(f.score * 100)}%
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                  {/* User message */}
                  {reviewCase.triggerResult.userMessage && (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 space-y-1">
                      <p className="text-xs font-medium text-neutral-500 uppercase">
                        Mensaje para el usuario
                      </p>
                      <p className="text-sm text-neutral-700 leading-6">
                        {reviewCase.triggerResult.userMessage}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={async () => {
                        await fetch("/api/human-review-queue/resolve", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            caseId: reviewCase.caseId,
                            resolution: "resolved",
                          }),
                        });
                        fetchCases();
                      }}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
                    >
                      Resolver
                    </button>
                    <button
                      onClick={async () => {
                        await fetch("/api/human-review-queue/resolve", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            caseId: reviewCase.caseId,
                            resolution: "dismissed",
                          }),
                        });
                        fetchCases();
                      }}
                      className="px-4 py-2 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50"
                    >
                      Descartar
                    </button>
                    <button
                      onClick={async () => {
                        await fetch("/api/human-review-queue/resolve", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            caseId: reviewCase.caseId,
                            resolution: "resolved",
                            convertToLearnedCase: true,
                          }),
                        });
                        fetchCases();
                      }}
                      className="px-4 py-2 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50"
                    >
                      Convertir en learnedCase
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
