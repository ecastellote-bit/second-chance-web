"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  PersonalizedDiagnosticDeliverable,
  type PresentationForView,
} from "@/components/diagnostic/PersonalizedDiagnosticDeliverable";
import { RequestHumanReviewButton } from "@/components/diagnostic/RequestHumanReviewButton";
import { useFullAnswers } from "@/app/full/fullAnswersContext";
import { archivedCurrentResultToFinalReading } from "@/lib/full/restoreArchivedCaseToSession";
import { setActiveHumanArchiveId } from "@/lib/learning/activeHumanArchive";
import { grantFoundingMember } from "@/lib/learning/foundationalMember";

type LearningReadiness = {
  hasSourceInput?: boolean;
  hasNarrativeIntake?: boolean;
  hasNarrativeCoherenceReview?: boolean;
  hasExperienceDistillation?: boolean;
  hasLearningTrace?: boolean;
  hasGuidedThemes?: boolean;
  hasLearningExtract?: boolean;
  readyForHumanCalibration?: boolean;
};

type Props = {
  archiveId: string;
};

export function ArchivedDiagnosticView({ archiveId }: Props) {
  const { setAnalysis, isHydrated } = useFullAnswers();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [presentation, setPresentation] = useState<PresentationForView | null>(null);
  const [headline, setHeadline] = useState("Tu lectura");
  const [learning, setLearning] = useState<LearningReadiness | null>(null);
  const [currentResult, setCurrentResult] = useState<Record<string, unknown> | null>(null);

  const themesHref = `/full/themes?archiveId=${encodeURIComponent(archiveId)}`;
  const plazaHref = `/plaza`;
  const perfilHref = `/perfil/crear?redirect=${encodeURIComponent(themesHref)}`;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `/api/human-cases/${encodeURIComponent(archiveId)}`,
        );
        const data = (await res.json()) as {
          ok?: boolean;
          complete?: {
            payload?: {
              currentResult?: Record<string, unknown>;
            };
          };
          learningReadiness?: LearningReadiness;
          error?: string;
        };

        if (!res.ok || !data.ok || !data.complete?.payload?.currentResult) {
          throw new Error(data.error ?? "not_found");
        }

        const cr = data.complete.payload.currentResult;
        const pres = cr.personalizedPresentation as PresentationForView | undefined;
        const hasPresentation = Boolean(
          pres?.lecturaCentral?.sentenciaRevelacion?.trim() ||
            pres?.lecturaCentral?.resumen?.trim(),
        );

        if (!hasPresentation) {
          throw new Error("presentation_missing");
        }

        if (cancelled) return;

        setPresentation(pres ?? null);
        setHeadline(
          (typeof cr.displayedMainDirection === "string"
            ? cr.displayedMainDirection
            : "") ||
            (typeof cr.corePattern === "string" ? cr.corePattern : "") ||
            "Tu lectura",
        );
        setLearning(data.learningReadiness ?? null);
        setCurrentResult(cr);
        setActiveHumanArchiveId(archiveId);
        grantFoundingMember(archiveId);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "load_failed");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [archiveId, setAnalysis]);

  useEffect(() => {
    if (!isHydrated || !currentResult) return;
    setAnalysis(archivedCurrentResultToFinalReading(currentResult));
  }, [isHydrated, currentResult, setAnalysis]);

  if (loading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[#F8FAFC] px-6 text-center text-sm text-[#6B7A8C]">
        Cargando tu lectura archivada…
      </main>
    );
  }

  if (error || !presentation) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#F8FAFC] px-6">
        <div className="max-w-md space-y-4 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-center">
          <h1 className="text-lg font-bold text-[#0B2E59]">
            No encontramos este caso en el servidor
          </h1>
          <p className="text-sm text-[#243647]">
            ID: <code className="font-mono text-xs">{archiveId}</code>
            {error ? ` · ${error}` : null}
          </p>
          <Link
            href="/full/result/recuperar"
            className="inline-block rounded-xl bg-[#0B2E59] px-5 py-3 text-sm font-semibold text-white"
          >
            Importar mi .json
          </Link>
        </div>
      </main>
    );
  }

  const learningOk =
    learning?.hasSourceInput &&
    learning?.hasNarrativeCoherenceReview &&
    learning?.hasExperienceDistillation;

  return (
    <main className="min-h-[100dvh] bg-white px-4 py-8 pb-24 text-black sm:px-6 md:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="rounded-2xl border border-[#C6D92D]/50 bg-[#F4F9E0] px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#0B2E59]">
            Lectura recuperada
          </p>
          <p className="mt-1 text-sm text-[#243647]">
            Caso <span className="font-mono font-semibold">{archiveId}</span>
          </p>
        </div>

        {learning && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              learningOk
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >
            {learningOk ? (
              <p>
                Tu caso quedó archivado con cuestionario, Juez de Coherencia Narrativa y
                capas de aprendizaje para calibrar los jueces del sistema.
              </p>
            ) : (
              <p>
                Lectura visible. Algunas capas de aprendizaje pueden estar incompletas en
                este backup; el equipo puede completarlas en revisión humana.
              </p>
            )}
          </div>
        )}

        <div className="max-w-4xl space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
            Resultado de tu lectura
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0B2E59] sm:text-3xl">
            {headline}
          </h1>
        </div>

        <PersonalizedDiagnosticDeliverable
          presentation={presentation}
          navigation={{ themesHref, plazaHref }}
        />

        <div className="rounded-2xl border border-[#E8EEF3] bg-[#F8FAFC] px-4 py-8 sm:px-8 space-y-6 text-center">
          <RequestHumanReviewButton archiveId={archiveId} className="flex flex-col items-center" />
          <p className="text-xs text-[#6B7A8C] max-w-md mx-auto">
            Para el barrio necesitás perfil en VocationUp. Si ya lo tenés, podés ir directo a
            temáticas o a la plaza.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={perfilHref}
              className="rounded-xl bg-black px-8 py-3 text-sm font-medium text-white"
            >
              Crear perfil y continuar
            </Link>
            <Link
              href={themesHref}
              className="rounded-xl border border-black/20 px-8 py-3 text-sm font-medium text-[#0B2E59]"
            >
              Elegir temática
            </Link>
            <Link
              href={plazaHref}
              className="rounded-xl border border-[#1A9BB0]/40 px-8 py-3 text-sm font-medium text-[#0B2E59]"
            >
              Ir al barrio
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
