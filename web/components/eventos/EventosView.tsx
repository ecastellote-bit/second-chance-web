"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { QuickInterestCapture } from "@/components/community/QuickInterestCapture";
import { EVENTOS_INTEREST } from "@/lib/content/surfaceInterestCopy";
import { CirculosLeftNav } from "@/components/circulos/CirculosLeftNav";
import { EventoOpportunityCard } from "@/components/eventos/EventoOpportunityCard";
import { EventosUpcomingStrip } from "@/components/eventos/EventosUpcomingStrip";
import { VuBottomNav } from "@/components/layout/VuMobileShell";
import {
  EVENT_FILTERS,
  EVENTOS_HEADER,
  filterEvents,
  type EventFilterId,
} from "@/lib/content/eventosCatalog";

export function EventosView() {
  const [activeFilter, setActiveFilter] = useState<EventFilterId>("todas");
  const events = useMemo(() => filterEvents(activeFilter), [activeFilter]);

  return (
    <div className="flex min-h-[100dvh] flex-col font-[family-name:var(--font-inter)] bg-[#F8FAFC] text-[#243647] lg:flex-row">
      <CirculosLeftNav activeId="eventos" />

      <div className="flex min-h-0 flex-1 flex-col">
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
            <p className="text-sm font-bold text-[#0B2E59]">Eventos</p>
            <span className="w-11" aria-hidden />
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 py-5 pb-6 lg:px-8 lg:py-8">
            <header className="mb-4 max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
                Calendario del barrio
              </p>
              <h1 className="mt-1 text-[1.5rem] font-bold text-[#0B2E59]">{EVENTOS_HEADER.title}</h1>
              <p className="mt-1 text-[14px] leading-snug text-[#6B7A8C]">{EVENTOS_HEADER.subtitle}</p>
            </header>

            <QuickInterestCapture {...EVENTOS_INTEREST} className="mb-6" />

            <div
              className="mb-6 flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory"
              role="tablist"
              aria-label="Filtrar eventos"
            >
              {EVENT_FILTERS.map((f) => {
                const active = activeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveFilter(f.id)}
                    className={[
                      "vu-focus snap-start shrink-0 min-h-[44px] rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                      active
                        ? "bg-[#0B2E59] text-white shadow-[0_4px_12px_rgba(11,46,89,0.2)]"
                        : "bg-white text-[#6B7A8C] ring-1 ring-[#E8EEF3] hover:bg-[#E6F6FA]",
                    ].join(" ")}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            {events.length === 0 ? (
              <p className="rounded-[24px] bg-white px-6 py-10 text-center text-sm text-[#6B7A8C] shadow-[0_4px_16px_rgba(15,42,70,0.06)]">
                Por ahora no hay eventos con este filtro. Probá otra categoría del barrio.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {events.map((event) => (
                  <EventoOpportunityCard key={event.id} event={event} />
                ))}
              </div>
            )}

            <p className="mt-8 text-center text-xs leading-relaxed text-[#6B7A8C] lg:text-left">
              Un calendario de vecinos — no una agenda corporativa.
            </p>
          </div>
        </main>

        <EventosUpcomingStrip />

        <div className="lg:hidden">
          <VuBottomNav active="plaza" />
        </div>
      </div>
    </div>
  );
}
