"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { VuAtmosphereBand } from "@/components/ui/VuAtmosphereBand";
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
          router.replace("/full/followup");
          return;
        }

        clearFollowup();
        router.replace("/full/result");
      } catch (error) {
        setErrorMessage(`Error de red o de análisis: ${String(error)}`);
      }
    };

    run();
  }, [buildUserIntake, clearFollowup, isHydrated, router, setAnalysis, setFollowup]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F8FAFC] text-[#243647] px-6 py-10 font-[family-name:var(--font-inter)]">
      <VuAtmosphereBand preset="fullProcessing" />
      <div className="relative z-10 mx-auto max-w-3xl space-y-8">
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
            Procesando
          </p>
          <h1 className="text-[1.75rem] font-bold leading-tight text-[#0B2E59]">
            Ordenando señales y restricciones
          </h1>
          <p className="text-[15px] leading-relaxed text-[#6B7A8C]">
            Estamos generando una lectura inicial a partir de tu historia y tu situación actual.
          </p>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 space-y-3">
            <p className="text-sm text-red-800">{errorMessage}</p>
            <button
              type="button"
              onClick={() => router.push("/full/step-5")}
              className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-900"
            >
              Volver a revisión
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#E8EEF3] bg-white p-6 space-y-4 shadow-[0_4px_16px_rgba(15,42,70,0.06)]">
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#E8EEF3]">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-[#1A9BB0]" />
            </div>
            <ul className="space-y-2 text-sm text-[#6B7A8C]">
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
