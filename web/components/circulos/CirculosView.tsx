"use client";

import Link from "next/link";
import { CircleCard } from "@/components/circulos/CircleCard";
import { CirculosLeftNav } from "@/components/circulos/CirculosLeftNav";
import { CirculosMobileStrip, CirculosRightPanel } from "@/components/circulos/CirculosRightPanel";
import { VuBottomNav } from "@/components/layout/VuMobileShell";
import { QuickInterestCapture } from "@/components/community/QuickInterestCapture";
import { CIRCULOS_CATALOG, CIRCULOS_HEADER, SUGERIDOS_IDS } from "@/lib/content/circulosCatalog";
import { CIRCULOS_INTEREST } from "@/lib/content/surfaceInterestCopy";

export function CirculosView() {
  const teamCircles = CIRCULOS_CATALOG.filter((c) => c.isTeamSeed);
  const otherCircles = CIRCULOS_CATALOG.filter((c) => !c.isTeamSeed);
  const previewCircles = teamCircles.slice(0, 2);
  const moreCircles = [...teamCircles.slice(2), ...otherCircles];

  return (
    <div className="flex min-h-[100dvh] flex-col font-[family-name:var(--font-inter)] bg-[#F8FAFC] text-[#243647] lg:flex-row">
      <CirculosLeftNav activeId="circulos" />

      <div className="flex min-h-0 flex-1 flex-col lg:min-h-[100dvh]">
        <header className="shrink-0 border-b border-[#E8EEF3] bg-[#F8FAFC] px-4 py-4 lg:hidden">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
            <Link
              href="/barrio"
              className="vu-focus flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#0B2E59]"
              aria-label="Volver al barrio"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>
            <p className="text-sm font-bold text-[#0B2E59]">Círculos</p>
            <span className="w-11" aria-hidden />
          </div>
        </header>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <main className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-3xl px-4 py-4 pb-8 lg:max-w-none lg:px-8 lg:py-6">
              <header className="mb-4 max-w-2xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
                  Comunidad · Barrio
                </p>
                <h1 className="mt-1 text-[1.5rem] font-bold text-[#0B2E59]">{CIRCULOS_HEADER.title}</h1>
                <p className="mt-1 text-[14px] leading-snug text-[#6B7A8C]">{CIRCULOS_HEADER.subtitle}</p>
              </header>

              <div className="xl:hidden mb-4">
                <CirculosMobileStrip
                  title="Sugeridos"
                  hint="Mesas semilla — marcá interés al entrar"
                  ids={SUGERIDOS_IDS}
                />
              </div>

              {previewCircles.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                  {previewCircles.map((circle) => (
                    <CircleCard key={circle.id} circle={circle} />
                  ))}
                </div>
              ) : null}

              <QuickInterestCapture {...CIRCULOS_INTEREST} className="my-6" />

              {moreCircles.length > 0 ? (
                <>
                  <p className="mb-3 mt-2 text-[11px] font-bold uppercase tracking-wider text-[#6B7A8C]">
                    Más espacios del barrio
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                    {moreCircles.map((circle) => (
                      <CircleCard key={circle.id} circle={circle} />
                    ))}
                  </div>
                </>
              ) : null}

              <p className="mt-6 text-center text-[12px] text-[#6B7A8C] lg:text-left">
                Mesas semilla — sin membresía masiva ni contadores fingidos.
              </p>
            </div>
          </main>

          <CirculosRightPanel variant="sidebar" />
        </div>

        <div className="lg:hidden">
          <VuBottomNav active="plaza" />
        </div>
      </div>
    </div>
  );
}
