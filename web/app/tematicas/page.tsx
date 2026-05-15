"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { VuMobileShell } from "@/components/layout/VuMobileShell";
import { ThemeImageCard } from "@/components/tematicas/ThemeImageCard";
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
          <p className="mt-1.5 text-[15px] leading-relaxed text-[#4B5563]">
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

        <p className="mt-6 text-center text-xs text-[#9CA3AF] px-4 leading-relaxed">
          Cada tarjeta es un camino vivo dentro del barrio VocationUp — no una categoría fría.
        </p>
      </div>
    </VuMobileShell>
  );
}
