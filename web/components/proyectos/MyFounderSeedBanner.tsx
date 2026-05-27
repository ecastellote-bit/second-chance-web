"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getFoundationalCohortBatch } from "@/lib/learning/foundationalCohort";
import type { FounderProjectSeed } from "@/lib/learning/founderProjectSeeds";
import {
  founderSeedStatusHint,
  founderSeedStatusLabel,
} from "@/lib/public/founderSeedStatusLabel";
import { getOrCreateUserId } from "@/lib/users/activeUserSession";

export function MyFounderSeedBanner() {
  const [seeds, setSeeds] = useState<FounderProjectSeed[]>([]);

  useEffect(() => {
    const userId = getOrCreateUserId();
    if (!userId) return;

    const cohort = getFoundationalCohortBatch();
    fetch(
      `/api/founder-projects?cohortBatch=${encodeURIComponent(cohort)}&userId=${encodeURIComponent(userId)}`,
    )
      .then((r) => r.json())
      .then((data: { seeds?: FounderProjectSeed[] }) => {
        setSeeds(data.seeds ?? []);
      })
      .catch(() => setSeeds([]));
  }, []);

  if (seeds.length === 0) return null;

  const latest = seeds[0]!;
  const statusLabel = founderSeedStatusLabel(latest.status);
  const statusHint = founderSeedStatusHint(latest.status);

  return (
    <section className="mb-4 rounded-2xl border border-[#C6D92D]/50 bg-[#F4F9E0] px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#0B2E59]">
        Tu semilla recibida
      </p>
      <p className="mt-1 text-sm font-semibold text-[#0B2E59]">{latest.title}</p>
      <p className="mt-1 text-[12px] font-semibold text-[#1A9BB0]">Estado: {statusLabel}</p>
      <p className="mt-1 text-[12px] leading-relaxed text-[#243647]">{statusHint}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={`/proyectos/semilla/${latest.seedId}`}
          className="vu-focus rounded-xl bg-[#0B2E59] px-3 py-2 text-xs font-semibold text-white"
        >
          Ver mi semilla
        </Link>
        <Link
          href="/actividad"
          className="vu-focus rounded-xl border border-[#0B2E59]/25 px-3 py-2 text-xs font-semibold text-[#0B2E59]"
        >
          Ver actividad
        </Link>
      </div>
    </section>
  );
}
