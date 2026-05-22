"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Check = {
  id: string;
  label: string;
  ok: boolean;
  hint?: string;
  value?: string;
};

type PrelaunchStatus = {
  ok: boolean;
  readyForPioneers: boolean;
  checks: Check[];
  durable: { configured: boolean; required: boolean };
};

export default function PrelaunchLabPage() {
  const [data, setData] = useState<PrelaunchStatus | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/prelaunch/status");
      const json = (await res.json()) as PrelaunchStatus;
      if (!json.ok) throw new Error("status_failed");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6 font-[family-name:var(--font-inter)]">
      <div>
        <Link href="/lab" className="text-sm font-semibold text-[#1A9BB0] underline">
          ← Lab
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-[#0B2E59]">Pre-lanzamiento (1)</h1>
        <p className="mt-2 text-sm text-[#6B7A8C]">
          Verificación técnica antes de invitar a los 30–40 pioneros.
        </p>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {data && (
        <>
          <div
            className={[
              "rounded-xl border px-4 py-3 text-sm font-semibold",
              data.readyForPioneers
                ? "border-[#C6D92D]/50 bg-[#F4F9E0] text-[#0B2E59]"
                : "border-amber-300 bg-amber-50 text-amber-950",
            ].join(" ")}
          >
            {data.readyForPioneers
              ? "Listo para pioneros (Blob configurado)"
              : "Falta configurar Blob en este entorno"}
          </div>

          <ul className="space-y-2">
            {data.checks.map((c) => (
              <li
                key={c.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-[#E8EEF3] bg-white px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-mono text-xs text-[#0B2E59]">{c.label}</p>
                  <p className="text-[#6B7A8C]">{c.hint}</p>
                  {c.value ? (
                    <p className="mt-1 text-xs text-[#1A9BB0]">{c.value}</p>
                  ) : null}
                </div>
                <span className={c.ok ? "text-green-700" : "text-amber-700"}>
                  {c.ok ? "OK" : "—"}
                </span>
              </li>
            ))}
          </ul>

          <section className="rounded-xl border border-[#E8EEF3] bg-white p-4 text-sm space-y-2">
            <p className="font-bold text-[#0B2E59]">Smoke test manual</p>
            <ol className="list-decimal list-inside space-y-1 text-[#6B7A8C]">
              <li>
                <a href="/fundador" className="text-[#1A9BB0] underline">
                  /fundador
                </a>{" "}
                → cuestionario → resultado con ID verde
              </li>
              <li>
                <a href="/perfil/crear" className="text-[#1A9BB0] underline">
                  /perfil/crear
                </a>
              </li>
              <li>
                <a href="/lab/foundational-cohort" className="text-[#1A9BB0] underline">
                  /lab/foundational-cohort
                </a>
              </li>
            </ol>
          </section>
        </>
      )}

      <button
        type="button"
        onClick={load}
        className="rounded-lg border border-[#0B2E59]/20 px-4 py-2 text-sm font-semibold"
      >
        Actualizar
      </button>
    </main>
  );
}
