"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import {
  activateFounderWaveSession,
  activateFullFlowPreservation,
} from "@/lib/learning/founderCaseDraftClient";
import { VuAtmosphereBand } from "@/components/ui/VuAtmosphereBand";
import { FULL_FLOW_COPY } from "@/lib/content/fullFlowCopy";
import { FOUNDER_FLOW_COPY } from "@/lib/content/founderFlowCopy";
import {
  FullFlowIntroCard,
  FullFlowPrimaryLink,
  FullFlowShell,
} from "@/components/full-flow/FullFlowShell";
import { trackObservatoryEventOnce } from "@/lib/observatory/client";
import { FounderReadingTrustNotice } from "@/components/founder/FounderReadingTrustNotice";

function FullFlowIntroContent() {
  const searchParams = useSearchParams();
  const isFounder = searchParams.get("founder") === "1";
  const copy = isFounder ? FOUNDER_FLOW_COPY.fullIntro : FULL_FLOW_COPY.intro;

  useEffect(() => {
    activateFullFlowPreservation();
    if (isFounder) activateFounderWaveSession();
    trackObservatoryEventOnce("funnel.full_reading_intro", "campaign", {
      founder: isFounder,
    });
  }, [isFounder]);

  return (
    <FullFlowShell variant="intro" maxWidth="lg" className="relative overflow-hidden">
      <VuAtmosphereBand preset="fullIntro" />
      <div className="relative z-10 space-y-6">
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
            {copy.eyebrow}
          </p>
          <h1 className="text-[1.75rem] font-bold leading-tight text-[#0B2E59] sm:text-[1.85rem]">
            {copy.title}
          </h1>
          <p className="text-[15px] leading-relaxed text-[#6B7A8C]">{copy.description}</p>
        </div>

        <FullFlowIntroCard>
          <h2 className="text-base font-semibold text-[#0B2E59]">Qué vas a hacer en esta lectura</h2>
          <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-[#6B7A8C]">
            {copy.bullets.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-[#C6D92D]" aria-hidden>
                  •
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </FullFlowIntroCard>

        {isFounder ? <FounderReadingTrustNotice prominent /> : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <FullFlowPrimaryLink
            href={isFounder ? "/full/step-1?founder=1" : "/full/step-1"}
          >
            {copy.primaryCta}
          </FullFlowPrimaryLink>
          <FullFlowPrimaryLink
            href={isFounder ? "/fundador" : "/"}
            variant="secondary"
          >
            {copy.secondaryCta}
          </FullFlowPrimaryLink>
        </div>

        <p className="text-center text-[11px] leading-relaxed text-[#6B7A8C]">
          Cinco estaciones · podés pausar y volver cuando quieras
        </p>
      </div>
    </FullFlowShell>
  );
}

export default function FullFlowIntroPage() {
  return (
    <Suspense fallback={<main className="min-h-[100dvh] bg-[#F8FAFC]" />}>
      <FullFlowIntroContent />
    </Suspense>
  );
}
