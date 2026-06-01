"use client";

import Link from "next/link";
import { DEEP_READING } from "@/lib/content/neighborhoodMicrocopy";

const HREF = "/full?founder=1";

/** Unifica barrio + diagnóstico profundo sin romper el tono neighborhood */
export function DeepReadingPlazaLink() {
  return (
    <Link
      href={HREF}
      className="vu-focus mt-3 inline-flex max-w-[320px] items-center gap-1 text-[13px] font-semibold text-[#C6D92D] underline decoration-[#C6D92D]/50 underline-offset-2 hover:decoration-[#C6D92D]"
      style={{ textShadow: "0 1px 8px rgba(0,0,0,0.55)" }}
    >
      {DEEP_READING.plazaLinkLabel}
    </Link>
  );
}

export function DeepReadingCard() {
  return (
    <section
      className="mx-4 mb-6 rounded-[24px] border border-[#E8EEF3] bg-[#DFF4F7] px-4 py-4 shadow-[0_4px_16px_rgba(15,42,70,0.06)]"
      aria-label="Lectura guiada vocacional"
    >
      <h2 className="text-sm font-bold text-[#0B2E59]">{DEEP_READING.cardTitle}</h2>
      <p className="mt-2 text-[13px] leading-relaxed text-[#6B7A8C]">{DEEP_READING.cardBody}</p>
      <Link
        href={HREF}
        className="vu-focus mt-4 inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-[#0B2E59] px-5 text-sm font-bold text-white"
      >
        {DEEP_READING.cardCta}
      </Link>
    </section>
  );
}
