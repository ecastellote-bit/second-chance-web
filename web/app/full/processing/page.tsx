"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { VuAtmosphereBand } from "@/components/ui/VuAtmosphereBand";
import { FULL_FLOW_COPY } from "@/lib/content/fullFlowCopy";
import {
  activateFullFlowPreservation,
} from "@/lib/learning/founderCaseDraftClient";
import {
  downloadFounderCaseBackup,
  humanizeAnalysisError,
  PRESERVATION_SAVE_BLOCKED_MESSAGE,
  POST_ANALYSIS_SAVE_REQUIRED_MESSAGE,
  saveSubmittedBeforeAnalysis,
  syncAnalysisFailedServer,
  syncAnalysisStarted,
  syncAnalysisSucceededServer,
  syncSubmittedBeforeAnalysisServer,
} from "@/lib/learning/founderCasePreservation";
import { fetchWithTimeout, FetchTimeoutError } from "@/lib/utils/fetchWithTimeout";
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

type FailureMode = "preservation" | "analysis" | "preservation_post";

type ProcessingPhase =
  | "preserving_submission"
  | "analyzing"
  | "preserving_result"
  | "navigating";

const ANALYZE_TIMEOUT_MS = 120_000;

export default function FullProcessingPage() {
  const router = useRouter();
  const copy = FULL_FLOW_COPY.processing;
  const {
    state,
    analysis,
    followup,
    buildUserIntake,
    setAnalysis,
    setFollowup,
    clearFollowup,
    isHydrated,
  } = useFullAnswers();

  const [errorMessage, setErrorMessage] = useState("");
  const [failureMode, setFailureMode] = useState<FailureMode | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<ProcessingPhase>("preserving_submission");
  const hasStarted = useRef(false);

  const runAnalysis = useCallback(async () => {
    activateFullFlowPreservation();
    setErrorMessage("");
    setFailureMode(null);
    setIsRunning(true);
    setPhase("preserving_submission");

    const rawAnswers = { state, analysis, followup };
    const builtUserIntake = buildUserIntake();

    try {
      saveSubmittedBeforeAnalysis({ rawAnswers, builtUserIntake });

      const preservation = await syncSubmittedBeforeAnalysisServer({
        rawAnswers,
        builtUserIntake,
      });

      if (!preservation.ok) {
        setFailureMode("preservation");
        setErrorMessage(PRESERVATION_SAVE_BLOCKED_MESSAGE);
        return;
      }

      setPhase("analyzing");
      void syncAnalysisStarted({ rawAnswers, builtUserIntake });

      const res = await fetchWithTimeout(
        "/api/analyze",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(builtUserIntake),
        },
        ANALYZE_TIMEOUT_MS,
      );

      const result = (await res.json()) as AnalyzeResponse;

      if (!result.ok) {
        const humanError = humanizeAnalysisError(
          result.error,
          result.missingFields,
        );
        await syncAnalysisFailedServer({
          rawAnswers,
          builtUserIntake,
          errorSummary: humanError,
          stage: "analyze",
        });
        setFailureMode("analysis");
        setErrorMessage(humanError);
        return;
      }

      const dataWithThemes = {
        ...result.data,
        _guidedThemes: result.guidedThemes ?? [],
      } as FinalReading;

      setAnalysis(dataWithThemes, result.warnings ?? []);
      persistContextualFromFinalReading(dataWithThemes);

      setPhase("preserving_result");

      const postPreserve = await syncAnalysisSucceededServer({
        rawAnswers,
        builtUserIntake,
        analysisResult: dataWithThemes,
      });

      if (!postPreserve.ok) {
        setFailureMode("preservation_post");
        setErrorMessage(POST_ANALYSIS_SAVE_REQUIRED_MESSAGE);
        return;
      }

      setPhase("navigating");

      if (result.followup?.shouldAskFollowup && result.followup.pack) {
        setFollowup(result.followup);
        router.replace("/full/followup");
        return;
      }

      clearFollowup();
      router.replace("/full/result");
    } catch (error) {
      const humanError =
        error instanceof FetchTimeoutError
          ? "La lectura tardó más de lo esperado. Podés reintentar: tus respuestas no se borraron."
          : humanizeAnalysisError(
              error instanceof Error ? error.message : String(error),
            );

      await syncAnalysisFailedServer({
        rawAnswers,
        builtUserIntake,
        errorSummary: humanError,
        stage: error instanceof FetchTimeoutError ? "timeout" : "network",
      });
      setFailureMode("analysis");
      setErrorMessage(humanError);
    } finally {
      setIsRunning(false);
    }
  }, [
    analysis,
    buildUserIntake,
    clearFollowup,
    followup,
    router,
    setAnalysis,
    setFollowup,
    state,
  ]);

  const retryPreservationOnly = useCallback(async () => {
    activateFullFlowPreservation();
    setIsRunning(true);
    setErrorMessage("");

    const rawAnswers = { state, analysis, followup };
    const builtUserIntake = buildUserIntake();

    try {
      if (failureMode === "preservation_post" && analysis.result) {
        setPhase("preserving_result");
        const post = await syncAnalysisSucceededServer({
          rawAnswers,
          builtUserIntake,
          analysisResult: analysis.result,
        });
        if (post.ok) {
          setPhase("navigating");
          router.replace("/full/result");
          return;
        }
        setErrorMessage(POST_ANALYSIS_SAVE_REQUIRED_MESSAGE);
        return;
      }

      setPhase("preserving_submission");
      const preservation = await syncSubmittedBeforeAnalysisServer({
        rawAnswers,
        builtUserIntake,
      });

      if (!preservation.ok) {
        setFailureMode("preservation");
        setErrorMessage(PRESERVATION_SAVE_BLOCKED_MESSAGE);
        return;
      }

      hasStarted.current = false;
      await runAnalysis();
    } finally {
      setIsRunning(false);
    }
  }, [analysis, analysis.result, buildUserIntake, failureMode, followup, router, runAnalysis, state]);

  useEffect(() => {
    if (!isHydrated || hasStarted.current) return;

    hasStarted.current = true;
    void runAnalysis();
  }, [isHydrated, runAnalysis]);

  const phaseLabel: Record<ProcessingPhase, string> = {
    preserving_submission: "Confirmando que tus respuestas quedaron preservadas…",
    analyzing: "Generando tu lectura inicial…",
    preserving_result: "Registrando el resultado para el equipo…",
    navigating: "Preparando tu devolución…",
  };

  const recoveryCopy =
    failureMode === "preservation" || failureMode === "preservation_post"
      ? failureMode === "preservation_post"
        ? copy.preservationPostAnalyze
        : copy.preservation
      : copy.recovery;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F8FAFC] text-[#243647] px-6 py-10 font-[family-name:var(--font-inter)]">
      <VuAtmosphereBand preset="fullProcessing" />
      <div className="relative z-10 mx-auto max-w-3xl space-y-8">
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
            {copy.eyebrow}
          </p>
          <h1 className="text-[1.75rem] font-bold leading-tight text-[#0B2E59]">
            {copy.title}
          </h1>
          <p className="text-[15px] leading-relaxed text-[#6B7A8C]">
            {copy.description}
          </p>
        </div>

        {!errorMessage ? (
          <div
            className="rounded-2xl border-2 border-amber-400 bg-amber-100 px-5 py-4 text-center shadow-[0_4px_16px_rgba(180,83,9,0.15)]"
            role="status"
          >
            <p className="text-xl sm:text-2xl font-bold leading-snug text-amber-900">
              {copy.waitNotice}
            </p>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-amber-950">
                {recoveryCopy.title}
              </p>
              <p className="text-sm text-amber-900">{errorMessage}</p>
              {"hint" in recoveryCopy ? (
                <p className="text-xs text-amber-800">{recoveryCopy.hint}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  if (
                    failureMode === "preservation" ||
                    failureMode === "preservation_post"
                  ) {
                    void retryPreservationOnly();
                    return;
                  }
                  hasStarted.current = false;
                  void runAnalysis();
                }}
                disabled={isRunning}
                className="rounded-xl bg-[#0B2E59] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {"retry" in recoveryCopy ? recoveryCopy.retry : copy.recovery.retry}
              </button>
              <button
                type="button"
                onClick={() => downloadFounderCaseBackup()}
                className="rounded-xl border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-950"
              >
                {"download" in recoveryCopy
                  ? recoveryCopy.download
                  : copy.recovery.download}
              </button>
              <button
                type="button"
                onClick={() => router.push("/full/step-5")}
                className="rounded-xl border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-950"
              >
                {"backToQuestionnaire" in recoveryCopy
                  ? recoveryCopy.backToQuestionnaire
                  : copy.recovery.backToQuestionnaire}
              </button>
              {failureMode === "analysis" ? (
                <button
                  type="button"
                  onClick={() => router.push("/full/result/recuperar")}
                  className="rounded-xl border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-950"
                >
                  {copy.recovery.recoverLater}
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#E8EEF3] bg-white p-6 space-y-4 shadow-[0_4px_16px_rgba(15,42,70,0.06)]">
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#E8EEF3]">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-[#1A9BB0]" />
            </div>
            <p className="text-sm font-medium text-[#0B2E59]">{phaseLabel[phase]}</p>
            <ul className="space-y-2 text-sm text-[#6B7A8C]">
              {copy.progressItems.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
            <p className="text-xs text-[#6B7A8C]">
              Si supera los dos minutos, mostraremos opciones para reintentar sin perder tus
              respuestas.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
