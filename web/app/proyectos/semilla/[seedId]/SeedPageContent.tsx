"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FounderPreviewBanner } from "@/components/founder/FounderPreviewBanner";
import { VuBottomNav } from "@/components/layout/VuMobileShell";
import {
  FounderSeedPublicView,
  type FounderSeedPublicViewModel,
} from "@/components/proyectos/FounderSeedPublicView";
import { FounderProjectGuidedContributionsPanel } from "@/components/proyectos/FounderProjectGuidedContributionsPanel";
import { FounderProjectSignalsPanel } from "@/components/proyectos/FounderProjectSignalsPanel";
import {
  founderSeedStatusHint,
  founderSeedStatusLabel,
} from "@/lib/public/founderSeedStatusLabel";
import type { FounderProjectSeed } from "@/lib/learning/founderProjectSeeds";
import { getOrCreateUserId } from "@/lib/users/activeUserSession";

type PublicSeedPayload = FounderSeedPublicViewModel;

function isPublicPublishedSeed(
  seed: FounderProjectSeed | PublicSeedPayload,
): seed is PublicSeedPayload {
  return seed.status === "published" && "coverSrc" in seed;
}

type Props = {
  seedId: string;
  userIdFromUrl?: string;
};

export default function SeedPageContent({ seedId, userIdFromUrl }: Props) {
  const [seed, setSeed] = useState<FounderProjectSeed | PublicSeedPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [notVisible, setNotVisible] = useState(false);

  useEffect(() => {
    const queryUserId = userIdFromUrl;
    const userId = queryUserId || getOrCreateUserId();
    const qs = userId ? `?userId=${encodeURIComponent(userId)}` : "";
    setLoading(true);
    setNotVisible(false);

    fetch(`/api/founder-projects/${encodeURIComponent(seedId)}${qs}`)
      .then(async (r) => {
        const data = (await r.json()) as {
          ok?: boolean;
          seed?: FounderProjectSeed | PublicSeedPayload;
          error?: string;
        };
        if (!r.ok || !data.ok || !data.seed) {
          if (data.error === "seed_not_visible") setNotVisible(true);
          setSeed(null);
          return;
        }
        setSeed(data.seed);
      })
      .catch(() => setSeed(null))
      .finally(() => setLoading(false));
  }, [seedId, userIdFromUrl]);

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
        <p className="font-semibold text-[#0B2E59]">
          {notVisible
            ? "Este proyecto todavía no está visible en el barrio"
            : "Semilla no encontrada"}
        </p>
        <p className="max-w-sm text-center text-sm leading-relaxed text-[#6B7A8C]">
          {notVisible
            ? "Solo el equipo fundador y quien sembró el proyecto pueden verlo mientras está en revisión u oculto."
            : "Revisá el enlace o volvé al listado de proyectos."}
        </p>
        <Link href="/proyectos" className="text-[#1A9BB0] underline">
          Volver a proyectos
        </Link>
      </main>
    );
  }

  if (isPublicPublishedSeed(seed)) {
    return (
      <div className="flex min-h-[100dvh] flex-col">
        <FounderPreviewBanner />
        <FounderSeedPublicView seed={seed} />
        <VuBottomNav active="plaza" />
      </div>
    );
  }

  const statusLabel = founderSeedStatusLabel(seed.status);
  const statusHint = founderSeedStatusHint(seed.status);

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
          {statusHint}
        </p>
        <FounderProjectSignalsPanel projectId={seed.seedId} projectTitle={seed.title} />
        <FounderProjectGuidedContributionsPanel
          projectId={seed.seedId}
          projectTitle={seed.title}
        />
        <Link
          href="/proyectos"
          className="vu-focus mt-8 flex min-h-[48px] items-center justify-center rounded-2xl border border-[#E8EEF3] bg-white text-sm font-semibold text-[#6B7A8C]"
        >
          Volver a proyectos
        </Link>
      </main>
      <VuBottomNav active="plaza" />
    </div>
  );
}
