"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FounderPreviewBanner } from "@/components/founder/FounderPreviewBanner";
import { VuBottomNav } from "@/components/layout/VuMobileShell";
import { founderSeedStatusLabel } from "@/lib/public/founderSeedStatusLabel";
import type { FounderProjectSeed } from "@/lib/learning/founderProjectSeeds";

export default function FounderSeedPage() {
  const params = useParams();
  const seedId = typeof params.seedId === "string" ? params.seedId : "";
  const [seed, setSeed] = useState<FounderProjectSeed | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/founder-projects?limit=200")
      .then((r) => r.json())
      .then((data: { seeds?: FounderProjectSeed[] }) => {
        const found = data.seeds?.find((s) => s.seedId === seedId) ?? null;
        setSeed(found);
      })
      .finally(() => setLoading(false));
  }, [seedId]);

  if (loading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[#F8FAFC] text-sm text-[#6B7A8C]">
        Cargando…
      </main>
    );
  }

  if (!seed) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-[#F8FAFC] px-6">
        <p className="font-semibold text-[#0B2E59]">Semilla no encontrada</p>
        <Link href="/proyectos" className="text-[#1A9BB0] underline">
          Volver a proyectos
        </Link>
      </main>
    );
  }

  const statusLabel = founderSeedStatusLabel(seed.status);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#F8FAFC] font-[family-name:var(--font-inter)]">
      <FounderPreviewBanner />
      <main className="flex-1 px-5 py-8 pb-24">
        <Link href="/proyectos" className="text-[12px] font-semibold text-[#1A9BB0] underline">
          ← Proyectos
        </Link>
        <p className="mt-6 text-[10px] font-bold uppercase tracking-wider text-[#C6D92D]">
          Tu proyecto · ola fundadora
        </p>
        <h1 className="mt-2 text-2xl font-bold text-[#0B2E59]">{seed.title}</h1>
        <p className="mt-3 inline-flex rounded-full bg-[#E6F6FA] px-3 py-1 text-[12px] font-semibold text-[#0B2E59]">
          {statusLabel}
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-[#243647] whitespace-pre-wrap">
          {seed.summary}
        </p>
        <p className="mt-6 rounded-2xl border border-[#E8EEF3] bg-white px-4 py-3 text-[13px] leading-relaxed text-[#6B7A8C]">
          Esta semilla quedó guardada para la ola fundadora. En esta etapa cuidamos la
          visibilidad de los proyectos para que el barrio crezca con sentido.
        </p>

        <div className="mt-8 flex flex-col gap-2">
          <Link
            href="/actividad"
            className="vu-focus flex min-h-[48px] items-center justify-center rounded-2xl bg-[#0B2E59] text-sm font-bold text-white"
          >
            Ver actividad
          </Link>
          <Link
            href="/mensajes"
            className="vu-focus flex min-h-[48px] items-center justify-center rounded-2xl border border-[#1A9BB0]/40 bg-white text-sm font-semibold text-[#0B2E59]"
          >
            Ver mensajes
          </Link>
          <Link
            href="/proyectos"
            className="vu-focus flex min-h-[48px] items-center justify-center rounded-2xl border border-[#E8EEF3] bg-white text-sm font-semibold text-[#6B7A8C]"
          >
            Volver a proyectos
          </Link>
          <Link
            href="/plaza"
            className="vu-focus flex min-h-[48px] items-center justify-center text-sm font-semibold text-[#1A9BB0] underline"
          >
            Ir a la plaza
          </Link>
        </div>
      </main>
      <VuBottomNav active="plaza" />
    </div>
  );
}
