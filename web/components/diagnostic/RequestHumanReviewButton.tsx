"use client";

import { useState } from "react";
import { getDiagnosticCaseSource } from "@/lib/learning/founderCaseDraftClient";
import { getPreservationIdentity } from "@/lib/learning/founderCasePreservation";

type Props = {
  archiveId?: string;
  caseId?: string;
  diagnosticRunId?: string;
  draftServerConfirmed?: boolean;
  className?: string;
};

export function RequestHumanReviewButton({
  archiveId,
  caseId: caseIdProp,
  diagnosticRunId: diagnosticRunIdProp,
  draftServerConfirmed = false,
  className = "",
}: Props) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );

  const identity = getPreservationIdentity();
  const caseId = caseIdProp ?? identity.caseId;
  const diagnosticRunId = diagnosticRunIdProp ?? identity.diagnosticRunId;
  const canRequest = draftServerConfirmed || Boolean(archiveId && !archiveId.startsWith("local_"));

  async function handleClick() {
    if (state === "loading" || state === "done" || !canRequest) return;

    setState("loading");
    try {
      if (archiveId && !archiveId.startsWith("local_") && !archiveId.startsWith("case_")) {
        const res = await fetch(
          `/api/human-cases/${encodeURIComponent(archiveId)}/request-review`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              note: "Usuario solicitó revisión humana desde la pantalla de resultado.",
            }),
          },
        );
        const data = (await res.json()) as { ok?: boolean };
        if (res.ok && data.ok) {
          setState("done");
          return;
        }
      }

      const res = await fetch("/api/founder-case-drafts/request-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          archiveId: archiveId?.startsWith("local_") ? undefined : archiveId,
          caseId,
          diagnosticRunId,
          source: getDiagnosticCaseSource(),
          status: "pending_review",
          note: "Usuario solicitó revisión humana desde la pantalla de resultado.",
        }),
      });

      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !data.ok) throw new Error("request_failed");
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (!canRequest) {
    return (
      <div className={`space-y-2 ${className}`}>
        <p className="mx-auto max-w-xl text-center text-sm leading-relaxed text-amber-800">
          Primero necesitamos guardar tu caso con seguridad antes de pedir revisión humana.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={state === "loading" || state === "done"}
        className="w-full rounded-xl border-2 border-[#0B2E59] bg-white px-5 py-4 text-base font-bold text-[#0B2E59] transition hover:bg-[#F4F9E0] disabled:opacity-70 sm:w-auto sm:min-w-[280px]"
      >
        {state === "loading"
          ? "Enviando solicitud…"
          : state === "done"
            ? "Revisión humana solicitada"
            : "Pedir revisión humana del equipo"}
      </button>
      {state === "idle" ? (
        <p className="mx-auto max-w-xl text-center text-sm leading-relaxed text-neutral-600">
          Tu caso quedó registrado para revisión interna. Con este botón le avisamos al
          equipo que querés una mirada humana sobre tu lectura.
        </p>
      ) : null}
      {state === "done" ? (
        <p className="text-center text-sm font-medium text-[#0B2E59]">
          Gracias. Revisaremos tu diagnóstico antes de usarlo como aprendizaje validado.
        </p>
      ) : null}
      {state === "error" ? (
        <p className="text-center text-sm text-red-700">
          No pudimos registrar la solicitud ahora. Reintentá en unos minutos.
        </p>
      ) : null}
    </div>
  );
}
