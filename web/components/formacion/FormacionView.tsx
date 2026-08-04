"use client";

import Link from "next/link";
import { useMemo } from "react";
import { QuickInterestCapture } from "@/components/community/QuickInterestCapture";
import { CirculosLeftNav } from "@/components/circulos/CirculosLeftNav";
import { EventoOpportunityCard } from "@/components/eventos/EventoOpportunityCard";
import { VuBottomNav } from "@/components/layout/VuMobileShell";
import { VuWarmImage } from "@/components/ui/VuWarmImage";
import { EVENTOS_CATALOG } from "@/lib/content/eventosCatalog";
import {
  FORMACION_INTEREST,
  FORMACION_PREDICTIVE,
  FORMACION_ROUTE_CARDS,
} from "@/lib/content/surfaceInterestCopy";

const FORMACION_FILTER = new Set(["talleres", "charlas"]);

function RouteCard({
  title,
  line,
  image,
  fallback,
  href,
}: {
  title: string;
  line: string;
  image: string;
  fallback: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="vu-focus group flex gap-3 overflow-hidden rounded-2xl border border-[#E8EEF3] bg-white p-3 shadow-[0_4px_14px_rgba(15,42,70,0.06)] transition-transform active:scale-[0.99]"
    >
      <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-[#E8EEF3]">
        <VuWarmImage
          src={image}
          fallbackSrc={fallback}
          alt=""
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="72px"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        <p className="text-[14px] font-bold leading-snug text-[#0B2E59]">{title}</p>
        <p className="text-[12px] leading-snug text-[#6B7A8C] line-clamp-2">{line}</p>
      </div>
    </Link>
  );
}

export function FormacionView() {
  const routes = useMemo(
    () => EVENTOS_CATALOG.filter((e) => e.categories.some((c) => FORMACION_FILTER.has(c))),
    [],
  );
  const copy = FORMACION_PREDICTIVE;

  return (
    <div className="flex min-h-[100dvh] flex-col font-[family-name:var(--font-inter)] bg-[#F8FAFC] text-[#243647] lg:flex-row">
      <CirculosLeftNav activeId="formacion" />

      <div className="flex min-h-0 flex-1 flex-col">
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
            <p className="text-sm font-bold text-[#0B2E59]">Formación</p>
            <span className="w-11" aria-hidden />
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 py-4 pb-8 lg:max-w-4xl lg:px-8 lg:py-6">
            {/* Hero compacto */}
            <section className="relative mb-4 overflow-hidden rounded-[28px]">
              <div className="relative h-[9.5rem] w-full sm:h-[11rem]">
                <VuWarmImage
                  src={copy.heroImage}
                  fallbackSrc={copy.heroFallback}
                  alt=""
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 720px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B2E59]/75 via-[#0B2E59]/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#C6D92D]">
                    {copy.eyebrow}
                  </p>
                  <h1 className="mt-1 text-[1.5rem] font-bold leading-tight text-white sm:text-[1.65rem]">
                    {copy.title}
                  </h1>
                  <p className="mt-1 max-w-md text-[13px] leading-snug text-white/90">{copy.subtitle}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {copy.chips.map((chip) => (
                      <a
                        key={chip}
                        href="#interes-formacion"
                        className="inline-flex rounded-full border border-[#1A9BB0]/25 bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0B2E59]"
                      >
                        {chip}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Bloque principal — acción inmediata */}
            <div id="interes-formacion" className="scroll-mt-4">
              <QuickInterestCapture {...FORMACION_INTEREST} className="mb-6" />
            </div>

            {/* Tarjetas predictivas */}
            <p
              id="primeras-rutas"
              className="mb-3 scroll-mt-4 text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]"
            >
              {copy.routesTitle}
            </p>
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {FORMACION_ROUTE_CARDS.map((card) => (
                <RouteCard key={card.id} {...card} />
              ))}
            </div>

            {/* Rutas semilla del catálogo */}
            {routes.length > 0 ? (
              <>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7A8C]">
                  Talleres y charlas semilla
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {routes.map((event) => (
                    <EventoOpportunityCard key={event.id} event={event} />
                  ))}
                </div>
              </>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/eventos"
                className="vu-focus text-sm font-semibold text-[#1A9BB0] underline"
              >
                Ver todos los eventos →
              </Link>
              <Link
                href="/barrio"
                className="vu-focus text-sm font-semibold text-[#6B7A8C] underline"
              >
                Volver al barrio
              </Link>
            </div>
          </div>
        </main>

        <VuBottomNav active="plaza" />
      </div>
    </div>
  );
}
