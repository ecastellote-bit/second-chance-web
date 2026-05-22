"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { VuAtmosphereBand } from "@/components/ui/VuAtmosphereBand";
import { FULL_FLOW_COPY } from "@/lib/content/fullFlowCopy";
import { FOUNDER_FLOW_COPY } from "@/lib/content/founderFlowCopy";

function FullFlowIntroContent() {
  const searchParams = useSearchParams();
  const isFounder = searchParams.get("founder") === "1";
  const copy = isFounder ? FOUNDER_FLOW_COPY.fullIntro : FULL_FLOW_COPY.intro;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F8FAFC] text-[#243647] px-6 py-10 font-[family-name:var(--font-inter)]">
      <VuAtmosphereBand preset="fullIntro" />
      <div className="relative z-10 mx-auto max-w-3xl space-y-8">
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
            {copy.eyebrow}
          </p>
          <h1 className="text-[1.75rem] font-bold leading-tight text-[#0B2E59]">{copy.title}</h1>
          <p className="text-[15px] leading-relaxed text-[#6B7A8C]">{copy.description}</p>
        </div>

        <div className="rounded-2xl border border-[#E8EEF3] bg-white p-5 space-y-3 shadow-[0_4px_16px_rgba(15,42,70,0.06)]">
          <h2 className="text-lg font-semibold text-[#0B2E59]">Qué vas a hacer acá</h2>
          <ul className="space-y-2 text-sm text-[#6B7A8C]">
            {copy.bullets.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/full/step-1"
            className="inline-flex justify-center rounded-xl bg-[#0B2E59] px-5 py-3 text-sm font-semibold text-white"
          >
            {copy.primaryCta}
          </Link>
          <Link
            href={isFounder ? "/fundador" : "/"}
            className="inline-flex justify-center rounded-xl border border-[#0B2E59]/25 px-5 py-3 text-sm font-semibold text-[#0B2E59]"
          >
            {copy.secondaryCta}
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function FullFlowIntroPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#F8FAFC] px-6 py-10" />}>
      <FullFlowIntroContent />
    </Suspense>
  );
}
