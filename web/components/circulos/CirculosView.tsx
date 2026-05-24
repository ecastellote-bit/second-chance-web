"use client";

import Link from "next/link";
import { CircleCard } from "@/components/circulos/CircleCard";
import { CirculosLeftNav } from "@/components/circulos/CirculosLeftNav";
import {
  CirculosMisCirculosMobile,
  CirculosMobileStrip,
  CirculosRightPanel,
} from "@/components/circulos/CirculosRightPanel";
import { VuBottomNav } from "@/components/layout/VuMobileShell";
import { CIRCULOS_CATALOG, CIRCULOS_HEADER, SUGERIDOS_IDS } from "@/lib/content/circulosCatalog";
import { COMMUNITY_SEED_FOOTNOTE } from "@/lib/content/communitySeedCopy";

export function CirculosView() {
  return (
    <div className="flex min-h-[100dvh] flex-col font-[family-name:var(--font-inter)] bg-[#F8FAFC] text-[#243647] lg:flex-row">
      <CirculosLeftNav activeId="circulos" />

      <div className="flex min-h-0 flex-1 flex-col lg:min-h-[100dvh]">
        {/* Barra superior móvil */}
        <header className="shrink-0 border-b border-[#E8EEF3] bg-[#F8FAFC] px-4 py-4 lg:hidden">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
            <Link
              href="/plaza"
              className="vu-focus flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#0B2E59]"
              aria-label="Volver a la plaza"
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
            <div className="mx-auto w-full max-w-3xl px-4 py-5 pb-8 lg:max-w-none lg:px-8 lg:py-8">
              <div className="mb-6 max-w-2xl">
                <p className="mb-1 hidden text-xs font-semibold uppercase tracking-wider text-[#1A9BB0] lg:block">
                  Comunidad · Barrio VocationUp
                </p>
                <h1 className="text-[1.65rem] font-bold tracking-tight text-[#0B2E59] lg:text-[1.85rem]">
                  {CIRCULOS_HEADER.title}
                </h1>
                <p className="mt-2 text-[15px] leading-relaxed text-[#6B7A8C]">
                  {CIRCULOS_HEADER.subtitle}
                </p>
                <p className="mt-3 rounded-xl border border-[#E8EEF3] bg-white px-4 py-3 text-[13px] leading-relaxed text-[#6B7A8C]">
                  {COMMUNITY_SEED_FOOTNOTE}
                </p>
              </div>

              {/* Paneles laterales en móvil: tiras horizontales */}
              <div className="xl:hidden">
                <CirculosMisCirculosMobile />
                <CirculosMobileStrip
                  title="Espacios para explorar"
                  hint="Puertas semilla — podés marcar interés al entrar"
                  ids={SUGERIDOS_IDS}
                />
              </div>

              <p className="mb-4 hidden text-sm text-[#6B7A8C] lg:block">
                Círculos cuidados de avance — no grupos masivos. Elegí dónde quedarte un rato.
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                {CIRCULOS_CATALOG.map((circle) => (
                  <CircleCard key={circle.id} circle={circle} />
                ))}
              </div>

              <p className="mt-8 text-center text-xs leading-relaxed text-[#6B7A8C] lg:text-left">
                Cada círculo es un espacio pequeño o mediano, con encuentros y ritmo propio.
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
