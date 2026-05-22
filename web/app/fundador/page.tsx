"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { VuHeroImage } from "@/components/ui/VuHeroImage";
import { FOUNDER_FLOW_COPY } from "@/lib/content/founderFlowCopy";
import {
  activateFounderCommunityPreview,
  isFounderCommunityPreviewActive,
} from "@/lib/founder/communityPreviewBypass";
import { isFoundingMemberQualified } from "@/lib/learning/foundationalMember";
import { NEIGHBORHOOD_JOURNEY } from "@/lib/content/neighborhoodJourney";

function FundadorPageContent() {
  const copy = FOUNDER_FLOW_COPY.landing;
  const searchParams = useSearchParams();
  const [qualified, setQualified] = useState(false);
  const [preview, setPreview] = useState(false);
  const [previewMsg, setPreviewMsg] = useState<string | null>(null);

  useEffect(() => {
    setQualified(isFoundingMemberQualified());
    setPreview(isFounderCommunityPreviewActive());

    const token = searchParams.get("preview-comunidad")?.trim();
    if (token) {
      if (activateFounderCommunityPreview(token)) {
        setPreview(true);
        setPreviewMsg("Modo exploración activado. Podés recorrer el barrio sin cuestionario.");
      } else {
        setPreviewMsg(
          "Clave incorrecta o falta NEXT_PUBLIC_VU_FOUNDER_PREVIEW_KEY en .env.local",
        );
      }
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#243647] px-6 py-8 pb-12 font-[family-name:var(--font-inter)]">
      <div className="mx-auto max-w-2xl space-y-8">
        <VuHeroImage preset="fundador" className="mb-2" />

        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
            {copy.eyebrow}
          </p>
          <h1 className="text-[1.85rem] font-bold leading-tight text-[#0B2E59]">
            {copy.title}
          </h1>
          <p className="text-[15px] leading-relaxed text-[#6B7A8C]">{copy.description}</p>
        </div>

        {previewMsg && (
          <p
            className={[
              "rounded-xl px-4 py-3 text-sm",
              preview ? "bg-[#F4F9E0] text-[#243647]" : "bg-amber-50 text-amber-950",
            ].join(" ")}
          >
            {previewMsg}
          </p>
        )}

        {preview && (
          <Link
            href="/barrio"
            className="flex justify-center rounded-xl bg-[#1A9BB0] px-5 py-3 text-sm font-bold text-white"
          >
            Explorar la Comunidad ahora (modo fundador)
          </Link>
        )}

        <div className="rounded-2xl border border-[#C6D92D]/40 bg-[#F4F9E0] p-5 space-y-2">
          <p className="text-[12px] font-bold uppercase tracking-wide text-[#0B2E59]">
            Tu oferta fundadora
          </p>
          <ul className="space-y-2 text-[14px] leading-relaxed text-[#243647]">
            {copy.offerBullets.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>

        <p className="text-sm leading-relaxed text-[#6B7A8C] border-l-4 border-[#1A9BB0] pl-4">
          {copy.requirement}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/full?founder=1"
            className="inline-flex justify-center rounded-xl bg-[#0B2E59] px-5 py-3 text-sm font-semibold text-white"
          >
            {copy.primaryCta}
          </Link>
          {qualified || preview ? (
            <Link
              href="/plaza"
              className="inline-flex justify-center rounded-xl border border-[#0B2E59]/30 px-5 py-3 text-sm font-semibold text-[#0B2E59]"
            >
              {copy.secondaryCta}
            </Link>
          ) : (
            <Link
              href="/full/result"
              className="inline-flex justify-center rounded-xl border border-[#0B2E59]/30 px-5 py-3 text-sm font-semibold text-[#0B2E59]"
            >
              Ir a mi diagnóstico
            </Link>
          )}
        </div>

        <p className="text-[12px] text-[#6B7A8C]">
          Pre-lanzamiento:{" "}
          <Link href="/lab/prelaunch" className="font-semibold text-[#1A9BB0] underline">
            checklist técnico (1)
          </Link>
        </p>

        <section className="space-y-3 pt-4">
          <h2 className="text-lg font-bold text-[#0B2E59]">Recorrido del barrio</h2>
          <ol className="space-y-2">
            {NEIGHBORHOOD_JOURNEY.slice(0, 8).map((path, i) => (
              <li
                key={path.id}
                className="flex gap-3 rounded-xl border border-[#E8EEF3] bg-white px-4 py-3 text-sm"
              >
                <span className="font-bold text-[#1A9BB0]">{i + 1}</span>
                <div>
                  <p className="font-semibold text-[#0B2E59]">{path.title}</p>
                  <p className="text-[#6B7A8C]">{path.description}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link href="/barrio" className="text-sm font-semibold text-[#1A9BB0] underline">
            Ver mapa completo del barrio →
          </Link>
        </section>
      </div>
    </main>
  );
}

export default function FundadorPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#F8FAFC]" />}>
      <FundadorPageContent />
    </Suspense>
  );
}
