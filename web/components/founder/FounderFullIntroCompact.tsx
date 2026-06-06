"use client";

import Link from "next/link";
import { FullFlowPrimaryLink, FullFlowShell } from "@/components/full-flow/FullFlowShell";
import { FOUNDER_FLOW_COPY } from "@/lib/content/founderFlowCopy";
import { trackObservatoryEvent } from "@/lib/observatory/client";

const copy = FOUNDER_FLOW_COPY.fullIntroCompact;

function TrustChip({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full border border-[#1A9BB0]/25 bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#0B2E59]">
      {label}
    </span>
  );
}

export function FounderFullIntroCompact() {
  const startHref = "/full/step-1?founder=1";

  return (
    <FullFlowShell variant="intro" maxWidth="lg" className="relative">
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">{copy.eyebrow}</p>
          <h1 className="text-[1.65rem] font-bold leading-tight text-[#0B2E59]">{copy.title}</h1>
          <p className="text-[15px] leading-snug text-[#6B7A8C]">{copy.subtitle}</p>
        </div>

        <FullFlowPrimaryLink
          href={startHref}
          onClick={() =>
            trackObservatoryEvent("barrio.start_reading_click", "campaign", {
              actionId: "full-intro-comenzar",
              href: startHref,
              path: "/full",
            })
          }
        >
          {copy.primaryCta}
        </FullFlowPrimaryLink>

        <div className="flex flex-wrap gap-1.5">
          {copy.trustChips.map((chip) => (
            <TrustChip key={chip} label={chip} />
          ))}
        </div>

        <p className="text-center text-[12px] font-medium text-[#6B7A8C]">{copy.microcopy}</p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {copy.steps.map((step) => (
            <div
              key={step.title}
              className="rounded-2xl border border-[#E8EEF3] bg-white px-3 py-3 text-center shadow-sm"
            >
              <p className="text-[13px] font-bold text-[#0B2E59]">{step.title}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-[#6B7A8C]">{step.line}</p>
            </div>
          ))}
        </div>

        <Link
          href="/fundador"
          className="vu-focus block text-center text-[13px] font-semibold text-[#6B7A8C] underline underline-offset-2"
        >
          {copy.secondaryCta}
        </Link>
      </div>
    </FullFlowShell>
  );
}
