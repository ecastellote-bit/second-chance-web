"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DEFAULT_FOUNDATIONAL_COHORT, getFoundationalCohortBatch } from "@/lib/learning/foundationalCohort";

type HumanCaseRow = {
  archiveId: string;
  createdAt: string;
  payload?: {
    clientMeta?: { cohortBatch?: string };
    humanReview?: { verdict?: string };
  };
  storagePolicy: { reviewStatus: string };
  classification: {
    displayedMainDirection: string | null;
    primaryFamily: string | null;
  };
};

type FounderSeed = {
  seedId: string;
  archiveId: string | null;
  title: string;
  createdAt: string;
};

export default function FoundationalCohortLabPage() {
  const cohort = getFoundationalCohortBatch();
  const [cases, setCases] = useState<HumanCaseRow[]>([]);
  const [seeds, setSeeds] = useState<FounderSeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [durableOk, setDurableOk] = useState<boolean | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statusRes, casesRes, seedsRes] = await Promise.all([
        fetch("/api/human-cases/status"),
        fetch(`/api/human-cases?cohortBatch=${encodeURIComponent(cohort)}&limit=100`),
        fetch(`/api/founder-projects?cohortBatch=${encodeURIComponent(cohort)}`),
      ]);

      const statusData = await statusRes.json();
      const casesData = await casesRes.json();
      const seedsData = await seedsRes.json();

      if (statusData.ok) setDurableOk(Boolean(statusData.durable?.configured));

      if (!casesData.ok) throw new Error(casesData.error ?? "cases_failed");
      setCases(casesData.cases ?? []);
      if (seedsData.ok) setSeeds(seedsData.seeds ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [cohort]);

  useEffect(() => {
    load();
  }, [load]);

  const pending = cases.filter(
    (c) => c.storagePolicy.reviewStatus === "pending_human_review",
  ).length;

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6 font-[family-name:var(--font-inter)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-[#1A9BB0]">Lab · Ola fundacional</p>
          <h1 className="text-2xl font-bold text-[#0B2E59]">Batch {cohort}</h1>
          <p className="mt-2 text-sm text-[#6B7A8C]">
            Solo casos con diagnóstico archivado (cuestionario + sentencia). Temáticas y Comunidad
            no cuentan para el depot.
          </p>
        </div>
        <div className="flex gap-3 text-sm font-semibold">
          <Link href="/lab" className="text-[#1A9BB0] underline">
            ← Lab
          </Link>
          <Link href="/admin/casos-humanos" className="text-[#1A9BB0] underline">
            Casos humanos
          </Link>
        </div>
      </div>

      <div
        className={[
          "rounded-xl border px-4 py-3 text-sm",
          durableOk ? "border-[#C6D92D]/50 bg-[#F4F9E0]" : "border-amber-300 bg-amber-50",
        ].join(" ")}
      >
        <p className="font-semibold text-[#0B2E59]">
          Blob durable: {durableOk === null ? "…" : durableOk ? "activo" : "no configurado"}
        </p>
        <p className="mt-1 text-xs text-[#6B7A8C]">
          Export: <code className="text-[11px]">npm run cohort:export</code>
          {cohort !== DEFAULT_FOUNDATIONAL_COHORT && ` -- ${cohort}`}
        </p>
        <p className="mt-1 text-xs">
          Checklist:{" "}
          <code className="text-[11px]">web/docs/foundational-invitation-checklist.md</code>
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Casos", value: cases.length },
          { label: "Pendientes revisión", value: pending },
          { label: "Proyectos sembrados", value: seeds.length },
          { label: "Cohort default", value: DEFAULT_FOUNDATIONAL_COHORT },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-[#E8EEF3] bg-white p-4 text-center"
          >
            <p className="text-2xl font-bold text-[#0B2E59]">{s.value}</p>
            <p className="text-[11px] text-[#6B7A8C]">{s.label}</p>
          </div>
        ))}
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#0B2E59]">Casos del batch</h2>
        {loading ? (
          <p className="text-sm text-[#6B7A8C]">Cargando…</p>
        ) : cases.length === 0 ? (
          <p className="text-sm text-[#6B7A8C]">Aún no hay casos con este cohortBatch.</p>
        ) : (
          <ul className="space-y-2">
            {cases.map((c) => (
              <li
                key={c.archiveId}
                className="rounded-lg border border-[#E8EEF3] bg-white px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <code className="text-xs font-mono text-[#0B2E59]">{c.archiveId}</code>
                  <span className="text-[11px] text-[#6B7A8C]">
                    {new Date(c.createdAt).toLocaleString("es-AR")}
                  </span>
                </div>
                <p className="mt-1 text-[#243647]">
                  {c.classification.displayedMainDirection ?? "—"} ·{" "}
                  <span className="text-[#6B7A8C]">{c.storagePolicy.reviewStatus}</span>
                </p>
                <Link
                  href={`/admin/casos-humanos`}
                  className="mt-1 inline-block text-[12px] font-semibold text-[#1A9BB0] underline"
                >
                  Revisar en admin
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#0B2E59]">Proyectos sembrados</h2>
        {seeds.length === 0 ? (
          <p className="text-sm text-[#6B7A8C]">Ningún proyecto sembrado aún.</p>
        ) : (
          <ul className="space-y-2">
            {seeds.map((s) => (
              <li
                key={s.seedId}
                className="rounded-lg border border-[#E8EEF3] bg-white px-4 py-3 text-sm"
              >
                <p className="font-semibold text-[#0B2E59]">{s.title}</p>
                <p className="text-[11px] text-[#6B7A8C]">
                  {s.seedId} · {s.archiveId ?? "sin archiveId"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button
        type="button"
        onClick={() => load()}
        className="rounded-lg border border-[#0B2E59]/20 px-4 py-2 text-sm font-semibold text-[#0B2E59]"
      >
        Actualizar
      </button>
    </main>
  );
}
