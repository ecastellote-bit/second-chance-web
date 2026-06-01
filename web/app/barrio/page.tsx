"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NEIGHBORHOOD_JOURNEY } from "@/lib/content/neighborhoodJourney";
import { FoundingMemberBadge } from "@/components/founder/FoundingMemberBadge";
import { VuBottomNav } from "@/components/layout/VuMobileShell";
import { DIAGNOSIS_FIRST_COPY } from "@/lib/content/diagnosisFirstCopy";
import { isFounderCommunityPreviewActive } from "@/lib/founder/communityPreviewBypass";
import { isFoundingMemberQualified } from "@/lib/learning/foundationalMember";

const PHASE_LABEL: Record<string, string> = {
  diagnostic: "Diagnóstico",
  purgatory: "Temáticas y activación",
  plaza: "Plaza y activación",
  doors: "Puertas",
  deep: "Profundización",
};

export default function BarrioMapPage() {
  const [qualified, setQualified] = useState(false);

  useEffect(() => {
    setQualified(
      isFoundingMemberQualified() || isFounderCommunityPreviewActive(),
    );
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#F8FAFC] font-[family-name:var(--font-inter)] pb-24">
      <header className="px-5 pt-12 pb-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
          VocationUp · Second Chance
        </p>
        <h1 className="mt-2 text-[1.6rem] font-bold text-[#0B2E59]">Mapa del barrio</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-[#6B7A8C]">
          {DIAGNOSIS_FIRST_COPY.barrioMapNote}
        </p>
      </header>

      <div className="px-4 space-y-4">
        <FoundingMemberBadge />
        {!qualified && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            {DIAGNOSIS_FIRST_COPY.bannerBody}{" "}
            <Link href="/full?founder=1" className="font-semibold underline">
              {DIAGNOSIS_FIRST_COPY.primaryCta}
            </Link>
          </p>
        )}
      </div>

      <ol className="mt-2 flex flex-col gap-2 px-4">
        {NEIGHBORHOOD_JOURNEY.map((path) => {
          const locked = path.requiresFoundingMember && !qualified;
          return (
            <li key={path.id}>
              {locked ? (
                <div className="rounded-[20px] border border-dashed border-[#CBD5E1] bg-white/60 p-4 opacity-80">
                  <p className="text-[10px] font-bold uppercase text-[#6B7A8C]">
                    {PHASE_LABEL[path.phase] ?? path.phase} · requiere diagnóstico
                  </p>
                  <p className="mt-1 text-[14px] font-bold text-[#0B2E59]">{path.title}</p>
                  <p className="text-[13px] text-[#6B7A8C]">{path.description}</p>
                </div>
              ) : (
                <Link
                  href={path.route}
                  className="vu-focus block rounded-[20px] border border-[#E8EEF3] bg-white p-4 shadow-sm"
                >
                  <p className="text-[10px] font-bold uppercase text-[#1A9BB0]">
                    {PHASE_LABEL[path.phase] ?? path.phase}
                  </p>
                  <p className="mt-1 text-[14px] font-bold text-[#0B2E59]">{path.title}</p>
                  <p className="text-[13px] text-[#6B7A8C]">{path.description}</p>
                  <span className="mt-2 inline-block text-[12px] font-semibold text-[#1A9BB0]">
                    Ir →
                  </span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      <VuBottomNav active="plaza" />
    </div>
  );
}
