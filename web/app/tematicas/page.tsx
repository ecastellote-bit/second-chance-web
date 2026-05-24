"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { VuMobileShell } from "@/components/layout/VuMobileShell";
import { MvpPioneerBanner } from "@/components/mvp/MvpPioneerBanner";
import { ThemeImageCard } from "@/components/tematicas/ThemeImageCard";
import { DEEP_READING } from "@/lib/content/neighborhoodMicrocopy";
import { TEMATICAS_CATALOG, TEMATICAS_HEADER } from "@/lib/content/tematicasCatalog";
import {
  loadContextualBridge,
  orderTematicasWithContextualHints,
} from "@/lib/tematicas/contextualBridge";
import { trackObservatoryEvent } from "@/lib/observatory/client";

export default function TematicasPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [contextReady, setContextReady] = useState(false);

  const contextual = useMemo(() => {
    if (!contextReady) {
      return orderTematicasWithContextualHints(TEMATICAS_CATALOG, null);
    }
    return orderTematicasWithContextualHints(TEMATICAS_CATALOG, loadContextualBridge());
  }, [contextReady]);

  useEffect(() => {
    setContextReady(true);
  }, []);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("vu_selected_tematica", id);
    }
    trackObservatoryEvent("funnel.tematica_selected", "funnel", {
      tematicaId: id,
      fromDiagnostic: contextual.hasDiagnosticContext,
    });
    router.push("/activacion");
  };

  return (
    <VuMobileShell showProgress progressStep={2} progressTotal={3} navActive="plaza">
      <div className="px-4 pb-6 pt-1 max-w-lg mx-auto">
        <MvpPioneerBanner />
        <div className="mb-5 px-1">
          <h1 className="text-[1.65rem] font-bold tracking-tight text-[#0B2E59]">
            {TEMATICAS_HEADER.title}
          </h1>
          <p className="mt-1.5 text-[15px] leading-relaxed text-[#6B7A8C]">
            {contextual.hasDiagnosticContext
              ? "Según tu diagnóstico, estas temáticas encajan primero. Elegí la que más se parezca a tu momento."
              : TEMATICAS_HEADER.subtitle}
          </p>
        </div>

        {contextual.hasDiagnosticContext ? (
          <section className="mb-4 rounded-2xl border border-[#1A9BB0]/25 bg-[#E6F6FA] px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#0B2E59]">
              Fruto de tu etapa diagnóstica
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-[#243647]">
              Según tu diagnóstico, estas lecturas encajan primero con lo que contaste.
              Podés elegir otra si no resuena — nos ayuda a afinar.
            </p>
            {contextual.cautions[0] ? (
              <p className="mt-2 text-[12px] italic leading-relaxed text-[#6B7A8C]">
                {contextual.cautions[0]}
              </p>
            ) : null}
          </section>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          {contextual.cards.map((card) => (
            <ThemeImageCard
              key={card.id}
              card={card}
              selected={selectedId === card.id}
              onSelect={handleSelect}
            />
          ))}
        </div>

        <p className="mt-5 text-center text-xs text-[#6B7A8C] px-4 leading-relaxed">
          <span className="block">{DEEP_READING.tematicasHint}</span>
          <Link
            href="/full/step-1"
            className="vu-focus mt-1 inline-block font-semibold text-[#1A9BB0] underline-offset-2 hover:underline"
          >
            {DEEP_READING.tematicasLink}
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-[#6B7A8C] px-4 leading-relaxed">
          Cada tarjeta es un camino vivo dentro del barrio VocationUp — no una categoría fría.
        </p>
      </div>
    </VuMobileShell>
  );
}
