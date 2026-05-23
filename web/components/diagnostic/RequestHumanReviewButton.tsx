"use client";

import { useState } from "react";

type Props = {
  archiveId: string;
  className?: string;
};

export function RequestHumanReviewButton({ archiveId, className = "" }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );

  async function handleClick() {
    if (state === "loading" || state === "done") return;

    setState("loading");
    try {
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
      if (!res.ok || !data.ok) throw new Error("request_failed");
      setState("done");
    } catch {
      setState("error");
    }
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
          Tu caso ya está guardado. Con este botón le avisamos al equipo que querés
          una mirada humana sobre tu lectura.
        </p>
      ) : null}
      {state === "done" ? (
        <p className="text-center text-sm font-medium text-[#0B2E59]">
          Gracias. Revisaremos tu diagnóstico antes de usarlo como aprendizaje
          validado.
        </p>
      ) : null}
      {state === "error" ? (
        <p className="text-center text-sm text-red-700">
          No pudimos registrar la solicitud. Tu caso igual quedó guardado — avisá
          al facilitador con tu ID:{" "}
          <span className="font-mono font-semibold">{archiveId}</span>
        </p>
      ) : null}
    </div>
  );
}
