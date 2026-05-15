"use client";

import { ActivationHub } from "@/components/activacion/ActivationHub";
import { VuMobileShell } from "@/components/layout/VuMobileShell";
import { ACTIVACION_ACTIONS, ACTIVACION_HEADER } from "@/lib/content/activacionCatalog";

export default function ActivacionPage() {
  return (
    <VuMobileShell
      showProgress
      progressStep={3}
      progressTotal={3}
      progressLabel="Activación"
      navActive="plaza"
    >
      <div className="pt-1">
        <div className="mb-4 px-5">
          <h1 className="text-[1.65rem] font-bold tracking-tight text-[#0B2E59]">
            {ACTIVACION_HEADER.title}
          </h1>
          <p className="mt-1.5 text-[15px] leading-relaxed text-[#4B5563]">
            {ACTIVACION_HEADER.subtitle}
          </p>
        </div>
        <ActivationHub actions={ACTIVACION_ACTIONS} />
      </div>
    </VuMobileShell>
  );
}
