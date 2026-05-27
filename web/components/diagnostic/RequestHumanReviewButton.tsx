"use client";

import { useState } from "react";
import { getDiagnosticCaseSource } from "@/lib/learning/founderCaseDraftClient";
import { getPreservationIdentity } from "@/lib/learning/founderCasePreservation";

type ReviewErrorCode =
  | "draft_not_found"
  | "not_preserved"
  | "archive_not_found"
  | "write_failed"
  | "invalid_payload"
  | "request_failed"
  | "review_request_failed"
  | "unknown";

type Props = {
  archiveId?: string;
  caseId?: string;
  diagnosticRunId?: string;
  draftServerConfirmed?: boolean;
  className?: string;
};

function mapReviewErrorMessage(code: ReviewErrorCode): string {
  switch (code) {
    case "draft_not_found":
      return "No encontramos todavía el registro seguro de este caso. Reintentá guardar antes de pedir revisión.";
    case "not_preserved":
      return "Primero necesitamos guardar tu caso con seguridad antes de pedir revisión humana.";
    case "archive_not_found":
      return "No encontramos el archivo de tu caso en el servidor. Reintentá guardar antes de pedir revisión.";
    case "write_failed":
    case "review_request_failed":
      return "No pudimos registrar la solicitud ahora. Tu caso sigue preservado; podés reintentar en unos minutos.";
    case "invalid_payload":
      return "Faltan datos para ubicar tu caso. Reintentá desde la pantalla de resultado.";
    default:
      return "No pudimos registrar la solicitud ahora. Tu caso sigue preservado; podés reintentar en unos minutos.";
  }
}

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
  const [errorCode, setErrorCode] = useState<ReviewErrorCode | null>(null);

  const identity = getPreservationIdentity();
  const caseId = caseIdProp ?? identity.caseId;
  const diagnosticRunId = diagnosticRunIdProp ?? identity.diagnosticRunId;
  const canRequest =
    draftServerConfirmed || Boolean(archiveId && !archiveId.startsWith("local_"));

  async function handleClick() {
    if (state === "loading" || state === "done" || !canRequest) return;

    setState("loading");
    setErrorCode(null);

    try {
      if (
        archiveId &&
        !archiveId.startsWith("local_") &&
        !archiveId.startsWith("case_")
      ) {
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
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (res.ok && data.ok) {
          setState("done");
          return;
        }
        const code = (data.error ?? "request_failed") as ReviewErrorCode;
        if (res.status === 404) {
          setErrorCode("archive_not_found");
        } else if (code === "write_failed" || code === "review_request_failed") {
          setErrorCode("write_failed");
        } else {
          setErrorCode(code);
        }
        setState("error");
        return;
      }

      const res = await fetch("/api/founder-case-drafts/request-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          archiveId: archiveId?.startsWith("local_") ? undefined : archiveId,
          caseId,
          diagnosticRunId,
          source: getDiagnosticCaseSource(),
          note: "Usuario solicitó revisión humana desde la pantalla de resultado.",
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
      };

      if (res.ok && data.ok) {
        setState("done");
        return;
      }

      const rawError = data.error ?? "request_failed";
      const code: ReviewErrorCode =
        rawError === "case_identity_required"
          ? "invalid_payload"
          : (rawError as ReviewErrorCode);
      setErrorCode(code);
      setState("error");
    } catch {
      setErrorCode("write_failed");
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
          Solicitud registrada. El equipo podrá revisar este caso.
        </p>
      ) : null}
      {state === "error" ? (
        <p className="text-center text-sm text-red-700">
          {mapReviewErrorMessage(errorCode ?? "unknown")}
        </p>
      ) : null}
    </div>
  );
}
