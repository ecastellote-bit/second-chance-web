"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { VuMobileShell } from "@/components/layout/VuMobileShell";
import { ThemeImageCard } from "@/components/tematicas/ThemeImageCard";
import { DEEP_READING } from "@/lib/content/neighborhoodMicrocopy";
import { TEMATICAS_CATALOG, TEMATICAS_HEADER } from "@/lib/content/tematicasCatalog";

export default function TematicasPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("vu_selected_tematica", id);
    }
    router.push("/activacion");
  };

  return (
    <VuMobileShell showProgress progressStep={2} progressTotal={3} navActive="plaza">
      <div className="px-4 pb-6 pt-1 max-w-lg mx-auto">
        <div className="mb-5 px-1">
          <h1 className="text-[1.65rem] font-bold tracking-tight text-[#0B2E59]">
            {TEMATICAS_HEADER.title}
          </h1>
          <p className="mt-1.5 text-[15px] leading-relaxed text-[#6B7A8C]">
            {TEMATICAS_HEADER.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {TEMATICAS_CATALOG.map((card) => (
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
