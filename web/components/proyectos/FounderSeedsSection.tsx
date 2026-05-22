"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getFoundationalCohortBatch } from "@/lib/learning/foundationalCohort";
import type { FounderProjectSeed } from "@/lib/learning/founderProjectSeeds";

export function FounderSeedsSection() {
  const [seeds, setSeeds] = useState<FounderProjectSeed[]>([]);

  useEffect(() => {
    const cohort = getFoundationalCohortBatch();
    fetch(`/api/founder-projects?cohortBatch=${encodeURIComponent(cohort)}`)
      .then((r) => r.json())
      .then((data: { seeds?: FounderProjectSeed[] }) => {
        setSeeds(data.seeds ?? []);
      })
      .catch(() => setSeeds([]));
  }, []);

  if (seeds.length === 0) return null;

  return (
    <section className="mb-6 space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#C6D92D]">
          Proyectos fundadores
        </p>
        <p className="text-[13px] text-[#6B7A8C]">
          Semillas con visibilidad prioritaria en la ola fundacional
        </p>
      </div>
      <ul className="space-y-3">
        {seeds.map((seed) => (
          <li key={seed.seedId}>
            <Link
              href={`/proyectos/semilla/${seed.seedId}`}
              className="vu-focus block rounded-[20px] border-2 border-[#C6D92D]/60 bg-[#F4F9E0] p-4 shadow-sm"
            >
              <span className="text-[10px] font-bold uppercase text-[#0B2E59]">
                Fundador · 6 meses destacado
              </span>
              <h2 className="mt-1 text-base font-bold text-[#0B2E59]">{seed.title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-[#243647] line-clamp-2">
                {seed.summary}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
