"use client";

import Link from "next/link";
import type { ArchivedLoadFallbackCopy } from "@/lib/full/archivedDiagnosticLoadUx";

type Props = {
  copy: ArchivedLoadFallbackCopy;
  archiveId?: string;
  errorDetail?: string;
};

export function ArchivedDiagnosticLoadFallback({
  copy,
  archiveId,
  errorDetail,
}: Props) {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#F8FAFC] px-6 py-10">
      <div className="max-w-md space-y-5 rounded-2xl border border-[#E8EEF3] bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-bold text-[#0B2E59]">{copy.title}</h1>
        <p className="text-sm leading-relaxed text-[#243647]">{copy.body}</p>
        {copy.showArchiveId && archiveId ? (
          <p className="text-xs text-[#6B7A8C]">
            Referencia:{" "}
            <code className="rounded bg-[#F8FAFC] px-1.5 py-0.5 font-mono text-[11px]">
              {archiveId}
            </code>
            {errorDetail ? (
              <span className="mt-1 block text-[10px] text-[#9AA8B8]">{errorDetail}</span>
            ) : null}
          </p>
        ) : null}
        <div className="flex flex-col gap-2 pt-1">
          <Link
            href="/perfil"
            className="vu-focus rounded-xl bg-[#0B2E59] px-5 py-3 text-sm font-semibold text-white"
          >
            Volver al perfil
          </Link>
          <Link
            href="/comenzar"
            className="vu-focus rounded-xl border border-[#1A9BB0]/40 px-5 py-3 text-sm font-semibold text-[#0B2E59]"
          >
            Ir al diagnóstico
          </Link>
          <Link
            href="/plaza"
            className="vu-focus rounded-xl border border-[#E8EEF3] px-5 py-3 text-sm font-semibold text-[#1A9BB0]"
          >
            Ir a la plaza
          </Link>
        </div>
        <p className="text-[11px] text-[#6B7A8C]">
          Si tenés un respaldo en JSON, también podés{" "}
          <Link href="/full/result/recuperar" className="font-semibold text-[#1A9BB0] underline">
            importar tu lectura
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
