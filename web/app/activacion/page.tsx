"use client";

import { ActivationHub } from "@/components/activacion/ActivationHub";
import { MvpPioneerBanner } from "@/components/mvp/MvpPioneerBanner";
import { DeepReadingCard } from "@/components/neighborhood/DeepReadingCTA";
import { VuMobileShell } from "@/components/layout/VuMobileShell";
import { VuAtmosphereBand } from "@/components/ui/VuAtmosphereBand";
import { ACTIVACION_HEADER } from "@/lib/content/activacionCatalog";
import {
  getActivacionSuggestions,
  loadContextualBridge,
} from "@/lib/tematicas/contextualBridge";
import { useEffect, useState } from "react";

export default function ActivacionPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const review = ready ? loadContextualBridge() : null;
  const { hints, suggestedPathIds } = getActivacionSuggestions(review);

  return (
    <VuMobileShell
      showProgress
      progressStep={3}
      progressTotal={3}
      progressLabel="Activación"
      navActive="plaza"
    >
      <div className="pt-1">
        <div className="relative mb-4 min-h-[220px] overflow-hidden">
          <VuAtmosphereBand preset="activacion" />
          <div className="relative z-10 space-y-3 px-5 pt-2 pb-3">
            <MvpPioneerBanner />
            <div>
              <h1 className="text-[1.65rem] font-bold tracking-tight text-[#0B2E59]">
                {ACTIVACION_HEADER.title}
              </h1>
              <p className="mt-1.5 text-[15px] leading-relaxed text-[#6B7A8C]">
                {hints.length > 0
                  ? "Según tu diagnóstico, estos caminos encajan primero. Elegí cómo entrar al barrio."
                  : "Elegí uno de los cinco caminos oficiales para entrar al barrio. Después podés usar las tres puertas."}
              </p>
            </div>
          </div>
        </div>
        <ActivationHub activationHints={hints} suggestedPathIds={suggestedPathIds} />
        <DeepReadingCard />
      </div>
    </VuMobileShell>
  );
}
