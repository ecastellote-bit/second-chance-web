"use client";

import { useEffect, useState } from "react";
import { setActiveHumanArchiveId } from "@/lib/learning/activeHumanArchive";
import { grantFoundingMember } from "@/lib/learning/foundationalMember";
import {
  getPreservationIdentity,
  syncFounderCaseArchivedServer,
} from "@/lib/learning/founderCasePreservation";
import type { PreservationLevel } from "@/lib/learning/founderCasePreservation";
import type { ArchiveVerificationStatus } from "@/lib/learning/persistHumanCaseFromBrowser";
import {
  downloadHumanCaseBackup,
  persistHumanCaseFromBrowserWithRetry,
} from "@/lib/learning/persistHumanCaseFromBrowser";

type GateState =
  | "archiving"
  | "confirmed"
  | "pending_verification"
  | "minimal_received"
  | "draft_only"
  | "failed";

export type ArchiveGateContext = {
  archiveId: string;
  serverPersisted: boolean;
  preservationLevel: PreservationLevel;
  caseId: string;
  diagnosticRunId: string;
  canProceedToThemes: boolean;
  verificationStatus: ArchiveVerificationStatus;
};

export function HumanCaseArchiveGate({
  archivePayload,
  children,
}: {
  archivePayload: unknown;
  children: (ctx: ArchiveGateContext) => React.ReactNode;
}) {
  const [state, setState] = useState<GateState>("archiving");
  const [archiveId, setArchiveId] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] =
    useState<ArchiveVerificationStatus>("none");
  const [showReading, setShowReading] = useState(false);
  const [preservationLevel, setPreservationLevel] =
    useState<PreservationLevel>("local_only");
  const [caseId, setCaseId] = useState("");
  const [diagnosticRunId, setDiagnosticRunId] = useState("");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setState("archiving");
      const identity = getPreservationIdentity();
      setCaseId(identity.caseId);
      setDiagnosticRunId(identity.diagnosticRunId);

      const result = await persistHumanCaseFromBrowserWithRetry(archivePayload);

      if (cancelled) return;

      setArchiveId(result.archiveId);
      setVerificationStatus(result.verificationStatus);

      if (result.persisted && result.archiveLevel === "full") {
        setPreservationLevel("full");
        setActiveHumanArchiveId(result.archiveId);
        grantFoundingMember(result.archiveId);
        void syncFounderCaseArchivedServer(result.archiveId);

        if (result.verificationStatus === "verified") {
          setState("confirmed");
        } else {
          setState("pending_verification");
        }
        return;
      }

      if (
        result.archiveLevel === "minimal" &&
        result.persisted &&
        result.draftServerConfirmed
      ) {
        setPreservationLevel("draft");
        setActiveHumanArchiveId(result.archiveId);
        grantFoundingMember(result.archiveId);
        void syncFounderCaseArchivedServer(result.archiveId);
        setState("minimal_received");
        return;
      }

      if (result.draftServerConfirmed) {
        setPreservationLevel("draft");
        setArchiveId(identity.caseId);
        setState("draft_only");
        return;
      }

      setPreservationLevel("local_only");
      setState("failed");
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [archivePayload]);

  if (state === "archiving") {
    return (
      <main className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#F8FAFC] px-6 text-center">
        <div className="max-w-md space-y-4">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-[#1A9BB0]/20 ring-4 ring-[#1A9BB0]/30" />
          <h1 className="text-xl font-bold text-[#0B2E59]">
            Guardando tu caso para VocationUp
          </h1>
          <p className="text-sm leading-relaxed text-[#6B7A8C]">
            Estamos registrando tu diagnóstico de forma segura para revisión del equipo.
            No cierres esta pantalla.
          </p>
        </div>
      </main>
    );
  }

  if (state === "failed" && !showReading) {
    return (
      <main className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#F8FAFC] px-6">
        <div className="max-w-md space-y-4 rounded-2xl border border-amber-300 bg-amber-50 p-6">
          <h1 className="text-lg font-bold text-[#0B2E59]">
            No pudimos confirmar el guardado seguro
          </h1>
          <p className="text-sm leading-relaxed text-[#243647]">
            No pudimos confirmar el guardado seguro. Reintentá o descargá el respaldo.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full rounded-xl bg-[#0B2E59] px-4 py-3 text-sm font-semibold text-white"
          >
            Reintentar guardado
          </button>
          <button
            type="button"
            onClick={() =>
              downloadHumanCaseBackup(archivePayload, caseId || "respaldo")
            }
            className="w-full rounded-xl border border-[#0B2E59]/30 px-4 py-3 text-sm font-semibold text-[#0B2E59]"
          >
            Descargar copia de seguridad (.json)
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-full rounded-xl border border-[#0B2E59]/20 px-4 py-3 text-sm font-semibold text-[#6B7A8C]"
          >
            Volver al cuestionario
          </button>
        </div>
      </main>
    );
  }

  const serverPersisted =
    state === "confirmed" ||
    state === "pending_verification" ||
    state === "minimal_received";

  const canProceedToThemes =
    preservationLevel === "full" || preservationLevel === "draft";

  const themesHref =
    preservationLevel === "full" &&
    archiveId &&
    !archiveId.startsWith("case_")
      ? `/full/themes?archiveId=${encodeURIComponent(archiveId)}`
      : `/full/themes?caseId=${encodeURIComponent(caseId)}&diagnosticRunId=${encodeURIComponent(diagnosticRunId)}`;

  const perfilHref = `/perfil/crear?redirect=${encodeURIComponent(themesHref)}`;

  return (
    <div className="space-y-6">
      {state === "confirmed" ? (
        <div
          className="rounded-2xl border border-[#C6D92D]/50 bg-[#F4F9E0] px-4 py-3"
          role="status"
        >
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#0B2E59]">
            Tu caso quedó registrado
          </p>
          <p className="mt-1 text-sm text-[#243647]">
            Gracias por entrenar el sistema. Revisaremos tu caso antes de usarlo como
            aprendizaje validado.
          </p>
          <a
            href={perfilHref}
            className="mt-3 inline-block text-[13px] font-semibold text-[#1A9BB0] underline"
          >
            Crear tu perfil en VocationUp (obligatorio para el barrio) →
          </a>
        </div>
      ) : state === "pending_verification" ? (
        <div
          className="rounded-2xl border border-[#C6D92D]/40 bg-[#F4F9E0] px-4 py-3"
          role="status"
        >
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#0B2E59]">
            Caso recibido · verificación en curso
          </p>
          <p className="mt-1 text-sm text-[#243647]">
            Tu caso fue recibido. La verificación final puede demorar unos instantes,
            pero el equipo ya puede ubicarlo.
          </p>
          {archiveId && !archiveId.startsWith("case_") ? (
            <p className="mt-2 font-mono text-[11px] text-[#6B7A8C]">{archiveId}</p>
          ) : null}
        </div>
      ) : state === "minimal_received" ? (
        <div
          className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
          role="status"
        >
          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-900">
            Lectura preservada · archivo final pendiente
          </p>
          <p className="mt-1 text-sm text-[#243647]">
            Tu lectura quedó preservada. Todavía estamos completando el archivo final,
            pero el equipo puede ubicar tu caso.
          </p>
          {archiveId ? (
            <p className="mt-2 font-mono text-[11px] text-[#6B7A8C]">{archiveId}</p>
          ) : null}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 text-[13px] font-semibold text-[#0B2E59] underline"
          >
            Reintentar archivo final
          </button>
        </div>
      ) : state === "draft_only" ? (
        <div
          className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
          role="status"
        >
          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-900">
            Lectura preservada como borrador seguro
          </p>
          <p className="mt-1 text-sm text-[#243647]">
            Tu lectura quedó preservada como borrador seguro. Todavía no pudimos
            completar el archivo final.
          </p>
          <p className="mt-2 font-mono text-[11px] text-[#6B7A8C]">
            {caseId} · {diagnosticRunId}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 text-[13px] font-semibold text-[#0B2E59] underline"
          >
            Reintentar archivo final
          </button>
        </div>
      ) : (
        <div
          className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3"
          role="status"
        >
          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-900">
            Lectura disponible · guardado pendiente
          </p>
          <p className="mt-1 text-sm text-[#243647]">
            Mostramos tu devolución. Descargá la copia JSON o reintentá el guardado.
          </p>
        </div>
      )}
      {children({
        archiveId: archiveId!,
        serverPersisted,
        preservationLevel,
        caseId,
        diagnosticRunId,
        canProceedToThemes,
        verificationStatus,
      })}
    </div>
  );
}
