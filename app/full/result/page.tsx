"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFullAnswers } from "../fullAnswersContext";

export default function FullResultPage() {
  const { answers } = useFullAnswers();
  const clean = (s: string) => s.replace(/\s+/g, " ").trim();

  type AnalysisResult = {
    signals: string[];
    patterns: string[];
    tensions: string[];
    hypothesis: string[];
    exploration: string[];
  };

  const hasAnyAnswers = useMemo(
    () =>
      [answers.q1, answers.q2, answers.q3, answers.q4, answers.q5].some(
        (v) => (v ?? "").trim().length > 0
      ),
    [answers]
  );

  const startedRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (startedRef.current) return;
    if (!hasAnyAnswers) return;

    startedRef.current = true;
    setLoading(true);
    setError(null);

    async function run() {
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers })
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Request failed (${res.status})`);
        }

        const data = (await res.json()) as AnalysisResult;
        setAnalysis({
          signals: Array.isArray(data.signals) ? data.signals : [],
          patterns: Array.isArray(data.patterns) ? data.patterns : [],
          tensions: Array.isArray(data.tensions) ? data.tensions : [],
          hypothesis: Array.isArray(data.hypothesis) ? data.hypothesis : [],
          exploration: Array.isArray(data.exploration) ? data.exploration : []
        });
      } catch (e: any) {
        setError(String(e?.message ?? e));
      } finally {
        setLoading(false);
      }
    }

    void run();
  }, [answers, hasAnyAnswers]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-3xl leading-tight font-semibold text-slate-900 sm:text-4xl">
          Primer diagnóstico
        </h1>

        {!hasAnyAnswers ? (
          <div className="mt-10 text-left text-slate-600">No hay respuestas para analizar.</div>
        ) : loading ? (
          <div className="mt-10 text-left text-slate-600">
            Procesando...
          </div>
        ) : error ? (
          <div className="mt-10 text-left text-slate-700">
            No se pudo analizar. Reintenta. ({clean(error)})
          </div>
        ) : (
          <div className="mt-10 space-y-7 text-left">
            <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-base font-semibold text-slate-900">Señales que aparecen</h2>
              <ul className="list-disc space-y-2 pl-5 text-slate-700">
                {(analysis?.signals ?? []).map((s, idx) => (
                  <li key={`${idx}-${s}`}>{clean(s)}</li>
                ))}
              </ul>
            </section>

            <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-base font-semibold text-slate-900">Patrones detectados</h2>
              <ul className="list-disc space-y-2 pl-5 text-slate-700">
                {(analysis?.patterns ?? []).map((p, idx) => (
                  <li key={`${idx}-${p}`}>{clean(p)}</li>
                ))}
              </ul>
            </section>

            <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-base font-semibold text-slate-900">Tensiones</h2>
              <ul className="list-disc space-y-2 pl-5 text-slate-700">
                {(analysis?.tensions ?? []).map((t, idx) => (
                  <li key={`${idx}-${t}`}>{clean(t)}</li>
                ))}
              </ul>
            </section>

            <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-base font-semibold text-slate-900">Hipótesis de alineación</h2>
              <ul className="list-disc space-y-2 pl-5 text-slate-700">
                {(analysis?.hypothesis ?? []).map((h, idx) => (
                  <li key={`${idx}-${h}`}>{clean(h)}</li>
                ))}
              </ul>
            </section>

            <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-base font-semibold text-slate-900">Líneas de exploración</h2>
              <ul className="list-disc space-y-2 pl-5 text-slate-700">
                {(analysis?.exploration ?? []).map((e, idx) => (
                  <li key={`${idx}-${e}`}>{clean(e)}</li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

