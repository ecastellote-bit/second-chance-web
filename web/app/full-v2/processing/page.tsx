"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFullAnswers } from "../fullAnswersContext";
import type { FollowupOrchestratorResult } from "@/lib/engines/followupOrchestrator";
import type { FinalReading } from "@/lib/types/result";
import { persistContextualFromFinalReading } from "@/lib/tematicas/persistContextualOnAnalyze";

type GuidedThemePayload = {
  id: string;
  shortLabel: string;
  userFacingText: string;
  layer?: string;
  score: number;
  activationPaths: string[];
};

type AnalyzeResponse =
  | {
      ok: true;
      data: FinalReading;
      warnings?: string[];
      followup?: FollowupOrchestratorResult | null;
      guidedThemes?: GuidedThemePayload[];
    }
  | {
      ok: false;
      error: string;
      missingFields?: string[];
      warnings?: string[];
      detail?: string;
    };

export default function FullProcessingPage() {
  const router = useRouter();
  const {
    buildUserIntake,
    setAnalysis,
    setFollowup,
    clearFollowup,
    isHydrated,
  } = useFullAnswers();

  const [errorMessage, setErrorMessage] = useState("");
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!isHydrated || hasStarted.current) return;

    hasStarted.current = true;

    const run = async () => {
      try {
        const payload = buildUserIntake();

        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = (await res.json()) as AnalyzeResponse;

        if (!result.ok) {
          const missing = result.missingFields?.length
            ? ` Faltan: ${result.missingFields.join(", ")}`
            : "";
          setErrorMessage(`No se pudo generar la lectura.${missing}`);
          return;
        }

        const dataWithThemes = {
          ...result.data,
          _guidedThemes: result.guidedThemes ?? [],
        } as FinalReading;
        setAnalysis(dataWithThemes, result.warnings ?? []);
        persistContextualFromFinalReading(dataWithThemes);

        if (result.followup?.shouldAskFollowup && result.followup.pack) {
          setFollowup(result.followup);
          router.replace("/full-v2/followup");
          return;
        }

        clearFollowup();
        router.replace("/full-v2/result");
      } catch (error) {
        setErrorMessage(`Error de red o de análisis: ${String(error)}`);
      }
    };

    run();
  }, [buildUserIntake, clearFollowup, isHydrated, router, setAnalysis, setFollowup]);

  return (
    <main className="min-h-screen bg-white text-black px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-wide text-neutral-500">
            Preparando tu lectura
          </p>
          <h1 className="text-3xl font-semibold">
            Estamos preparando tu lectura
          </h1>
          <p className="text-sm text-neutral-700">
            Ordenamos las señales principales de tu historia y conectamos tus respuestas
            con posibles caminos.
          </p>
        </div>

        {errorMessage ? (
          <div className="rounded-xl border border-red-300 bg-red-50 p-5 space-y-3">
            <p className="text-sm text-red-800">{errorMessage}</p>
            <button
              onClick={() => router.push("/full-v2/step-5")}
              className="px-4 py-2 rounded-md border border-red-400 text-sm"
            >
              Volver a revisión
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-neutral-200 p-6 space-y-4">
            <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-black animate-pulse" />
            </div>
            <ul className="space-y-2 text-sm text-neutral-700">
              <li>• normalizando contexto actual</li>
              <li>• leyendo señales autobiográficas</li>
              <li>• estimando margen de transición</li>
              <li>• generando vectores de acción plausibles</li>
              <li>• verificando si hace falta una ronda extra de clarificación</li>
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}