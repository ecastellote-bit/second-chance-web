"use client";

import { useRouter } from "next/navigation";
import { useFullAnswers } from "../fullAnswersContext";

export default function FullStep5Page() {
  const router = useRouter();
  const { state, clearAnalysis, isHydrated } = useFullAnswers();

  const handleContinue = () => {
    clearAnalysis();
    router.push("/full/processing");
  };

  return (
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <p className="text-sm text-neutral-500">Paso 5 de 5</p>
          <h1 className="text-2xl font-semibold">Revisión final y envío</h1>
          <p className="text-sm text-neutral-700">
            No estamos buscando una respuesta perfecta. Estamos buscando suficiente evidencia para una lectura seria.
          </p>
        </div>

        {!isHydrated ? (
          <div className="rounded-xl border border-neutral-200 p-5 text-sm text-neutral-700">
            Recuperando tu progreso...
          </div>
        ) : (
          <div className="border border-neutral-200 rounded-xl p-5 space-y-4 text-sm">
            <div>
              <p className="font-medium">Situación actual</p>
              <p className="text-neutral-700">{state.currentContext.currentSituation || "Vacío"}</p>
            </div>

            <div>
              <p className="font-medium">Infancia / memoria inicial</p>
              <p className="text-neutral-700">{state.narrative.childhoodMemories || "Vacío"}</p>
            </div>

            <div>
              <p className="font-medium">Fascinaciones</p>
              <p className="text-neutral-700">{state.narrative.earlyFascinations || "Vacío"}</p>
            </div>

            <div>
              <p className="font-medium">Patrones repetidos</p>
              <p className="text-neutral-700">{state.narrative.repeatedWorkPatterns || "Vacío"}</p>
            </div>

            <div>
              <p className="font-medium">Vida comprimida hoy</p>
              <p className="text-neutral-700">{state.narrative.whatFeelsCompressedNow || "Vacío"}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/full/step-4")}
            className="px-4 py-2 rounded-md border border-neutral-300 text-sm"
          >
            Volver
          </button>

          <button
            onClick={handleContinue}
            disabled={!isHydrated}
            className="px-4 py-2 rounded-md border border-black text-sm disabled:opacity-60"
          >
            Generar lectura inicial
          </button>
        </div>
      </div>
    </main>
  );
}