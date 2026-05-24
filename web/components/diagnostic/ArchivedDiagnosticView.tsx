"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  PersonalizedDiagnosticDeliverable,
  type PresentationForView,
} from "@/components/diagnostic/PersonalizedDiagnosticDeliverable";
import { RequestHumanReviewButton } from "@/components/diagnostic/RequestHumanReviewButton";
import { setActiveHumanArchiveId } from "@/lib/learning/activeHumanArchive";
import { grantFoundingMember } from "@/lib/learning/foundationalMember";

type Props = {
  archiveId: string;
};

export function ArchivedDiagnosticView({ archiveId }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [presentation, setPresentation] = useState<PresentationForView | null>(null);
  const [headline, setHeadline] = useState("Tu lectura");

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
              currentResult?: {
                personalizedPresentation?: PresentationForView;
                displayedMainDirection?: string;
                corePattern?: string;
              };
            };
          };
          error?: string;
        };

        if (!res.ok || !data.ok || !data.complete?.payload?.currentResult) {
          throw new Error(data.error ?? "not_found");
        }

        const cr = data.complete.payload.currentResult;
        const pres = cr.personalizedPresentation ?? null;
        const hasPresentation = Boolean(
          pres?.lecturaCentral?.sentenciaRevelacion?.trim() ||
            pres?.lecturaCentral?.resumen?.trim(),
        );

        if (!hasPresentation) {
          throw new Error("presentation_missing");
        }

        if (cancelled) return;

        setPresentation(pres);
        setHeadline(
          cr.displayedMainDirection?.trim() ||
            cr.corePattern?.trim() ||
            "Tu lectura",
        );
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
  }, [archiveId]);

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
          <p className="text-sm text-[#6B7A8C]">
            Si tenés el archivo .json, importalo desde recuperar caso.
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

        <div className="max-w-4xl space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
            Resultado de tu lectura
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0B2E59] sm:text-3xl">
            {headline}
          </h1>
        </div>

        <PersonalizedDiagnosticDeliverable presentation={presentation} />

        <div className="rounded-2xl border border-[#E8EEF3] bg-[#F8FAFC] px-4 py-8 sm:px-8 space-y-6 text-center">
          <RequestHumanReviewButton archiveId={archiveId} className="flex flex-col items-center" />
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/perfil/crear?redirect=/full/themes"
              className="rounded-xl bg-black px-8 py-3 text-sm font-medium text-white"
            >
              Crear perfil y continuar
            </Link>
            <Link
              href="/full/themes"
              className="rounded-xl border border-black/20 px-8 py-3 text-sm font-medium text-[#0B2E59]"
            >
              Elegir temática
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
