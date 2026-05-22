"use client";

import { useRouter } from "next/navigation";
import { useFullAnswers } from "../fullAnswersContext";
import { FULL_FLOW_COPY_V2 } from "@/lib/content/fullFlowCopyV2";

export default function FullFlowV2ResultPage() {
  const router = useRouter();
  const { analysis, resetFlow } = useFullAnswers();
  const copy = FULL_FLOW_COPY_V2.result;
  const reading = analysis.result;

  if (!reading) {
    return (
      <main className="min-h-screen bg-white text-black px-6 py-10">
        <div className="max-w-3xl mx-auto space-y-4">
          <p className="text-sm text-neutral-700">
            No hay lectura cargada. Completá el cuestionario v2 primero.
          </p>
          <button
            type="button"
            onClick={() => router.push("/full-v2")}
            className="px-4 py-2 rounded-md border border-black text-sm"
          >
            {copy.buttons.backToIntro}
          </button>
        </div>
      </main>
    );
  }

  const summary = reading.summaryForUser;
  const directions =
    reading.plausibleDirections?.length > 0
      ? reading.plausibleDirections.map((d) => d.label).join(" · ")
      : copy.fallbacks.noDirections;
  const vectors =
    reading.actionVectors?.length > 0
      ? reading.actionVectors.map((v) => v.label).join(" · ")
      : copy.fallbacks.noActionVectors;

  return (
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-neutral-500">
            {copy.eyebrow}
          </p>
          <h1 className="text-2xl font-semibold">Lectura inicial</h1>
          <p className="text-sm text-neutral-600">
            Vista resumida para probar el cuestionario v2. El motor es el mismo
            que en /full.
          </p>
        </div>

        <section className="border border-neutral-200 rounded-xl p-5 space-y-4 text-sm">
          <div>
            <h2 className="font-medium">{copy.sections.dominantTension}</h2>
            <p className="text-neutral-700 mt-1">
              {reading.dominantTension || summary?.tensiones || "—"}
            </p>
          </div>
          <div>
            <h2 className="font-medium">{copy.sections.hiloConductor}</h2>
            <p className="text-neutral-700 mt-1 whitespace-pre-wrap">
              {summary?.hilo_conductor || reading.corePattern || "—"}
            </p>
          </div>
          <div>
            <h2 className="font-medium">{copy.sections.plausibleDirections}</h2>
            <p className="text-neutral-700 mt-1">{directions}</p>
          </div>
          <div>
            <h2 className="font-medium">{copy.sections.actionVectors}</h2>
            <p className="text-neutral-700 mt-1">{vectors}</p>
          </div>
          <div>
            <h2 className="font-medium">{copy.sections.caminoMinimo}</h2>
            <p className="text-neutral-700 mt-1 whitespace-pre-wrap">
              {summary?.camino_minimo || "—"}
            </p>
          </div>
          {summary?.diagnostico ? (
            <div>
              <h2 className="font-medium">Diagnóstico</h2>
              <p className="text-neutral-700 mt-1 whitespace-pre-wrap">
                {summary.diagnostico}
              </p>
            </div>
          ) : null}
        </section>

        {analysis.warnings.length > 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-medium mb-2">Advertencias</p>
            <ul className="space-y-1">
              {analysis.warnings.map((w) => (
                <li key={w}>• {w}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              resetFlow();
              router.push("/full-v2/step-1");
            }}
            className="px-4 py-2 rounded-md border border-neutral-300 text-sm"
          >
            {copy.buttons.reentry}
          </button>
          <button
            type="button"
            onClick={() => router.push("/full-v2")}
            className="px-4 py-2 rounded-md border border-black text-sm"
          >
            {copy.buttons.backToIntro}
          </button>
        </div>
      </div>
    </main>
  );
}
