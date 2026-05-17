"use client";

import { useEffect, useState } from "react";
import {
  downloadHumanCaseBackup,
  persistHumanCaseFromBrowserWithRetry,
} from "@/lib/learning/persistHumanCaseFromBrowser";

type GateState = "archiving" | "confirmed" | "failed";

export function HumanCaseArchiveGate({
  archivePayload,
  children,
}: {
  archivePayload: unknown;
  children: (ctx: { archiveId: string }) => React.ReactNode;
}) {
  const [state, setState] = useState<GateState>("archiving");
  const [archiveId, setArchiveId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setState("archiving");
      const result = await persistHumanCaseFromBrowserWithRetry(archivePayload);

      if (cancelled) return;

      setAttempts(result.attempts);
      setArchiveId(result.archiveId);

      if (result.persisted) {
        setState("confirmed");
      } else {
        setState("failed");
      }
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

  if (state === "failed" || !archiveId) {
    return (
      <main className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#F8FAFC] px-6">
        <div className="max-w-md space-y-4 rounded-2xl border border-amber-300 bg-amber-50 p-6">
          <h1 className="text-lg font-bold text-[#0B2E59]">
            No pudimos confirmar el guardado en el servidor
          </h1>
          <p className="text-sm leading-relaxed text-[#243647]">
            Tu lectura está lista, pero el registro durable falló tras {attempts} intentos.
            Descargá esta copia y compartila con el facilitador. ID local:{" "}
            <code className="text-xs">{archiveId}</code>
          </p>
          <button
            type="button"
            onClick={() =>
              downloadHumanCaseBackup(archivePayload, archiveId ?? "sin_id")
            }
            className="w-full rounded-xl bg-[#0B2E59] px-4 py-3 text-sm font-semibold text-white"
          >
            Descargar copia de seguridad (.json)
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full rounded-xl border border-[#0B2E59]/30 px-4 py-3 text-sm font-semibold text-[#0B2E59]"
          >
            Reintentar guardado
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl border border-[#C6D92D]/50 bg-[#F4F9E0] px-4 py-3"
        role="status"
      >
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#0B2E59]">
          Caso registrado para el equipo
        </p>
        <p className="mt-1 text-sm text-[#243647]">
          Tu aporte quedó guardado. ID:{" "}
          <span className="font-mono font-semibold text-[#0B2E59]">{archiveId}</span>
        </p>
        <p className="mt-1 text-[12px] text-[#6B7A8C]">
          Gracias por entrenar el sistema. Revisaremos tu caso antes de usarlo como
          aprendizaje validado.
        </p>
      </div>
      {children({ archiveId })}
    </div>
  );
}
