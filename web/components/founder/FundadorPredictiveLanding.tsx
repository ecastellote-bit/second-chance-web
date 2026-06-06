"use client";

import Link from "next/link";
import {
  FUNDADOR_BARRIO_HOOKS,
  FUNDADOR_HERO_ASSETS,
  FUNDADOR_LANDING_COPY,
} from "@/lib/content/fundadorLandingCopy";
import { VuWarmImage } from "@/components/ui/VuWarmImage";

type Props = {
  qualified: boolean;
  preview: boolean;
  previewMsg: string | null;
};

function TrustChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#1A9BB0]/25 bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#0B2E59] shadow-sm">
      {label}
    </span>
  );
}

function BarrioHookCard({
  title,
  cta,
  href,
  image,
  fallbackImage,
}: {
  title: string;
  cta: string;
  href: string;
  image: string;
  fallbackImage: string;
}) {
  return (
    <Link
      href={href}
      className="vu-focus group flex min-w-[9.5rem] max-w-[10.5rem] shrink-0 flex-col overflow-hidden rounded-2xl border border-[#E8EEF3] bg-white shadow-[0_4px_16px_rgba(15,42,70,0.06)] active:scale-[0.98]"
    >
      <div className="relative h-[5.5rem] w-full overflow-hidden bg-[#E8EEF3]">
        <VuWarmImage
          src={image}
          fallbackSrc={fallbackImage}
          alt=""
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="168px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B2E59]/50 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col gap-1 px-3 py-2.5">
        <p className="text-[12px] font-semibold leading-snug text-[#0B2E59] line-clamp-2">{title}</p>
        <span className="text-[11px] font-bold text-[#1A9BB0]">{cta} →</span>
      </div>
    </Link>
  );
}

export function FundadorPredictiveLanding({ qualified, preview, previewMsg }: Props) {
  const copy = FUNDADOR_LANDING_COPY;

  return (
    <main className="min-h-[100dvh] bg-[#F8FAFC] font-[family-name:var(--font-inter)] text-[#243647]">
      {/* ── Hero: primer viewport (deja asomar el barrio) ── */}
      <section className="relative mx-auto flex min-h-[92dvh] max-w-lg flex-col">
        <div className="absolute inset-0 overflow-hidden">
          <VuWarmImage
            src={FUNDADOR_HERO_ASSETS.src}
            fallbackSrc={FUNDADOR_HERO_ASSETS.fallbackSrc}
            alt=""
            fill
            priority
            className="object-cover"
            style={{ objectPosition: FUNDADOR_HERO_ASSETS.objectPosition }}
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(11,46,89,0.55) 0%, rgba(11,46,89,0.25) 38%, rgba(248,250,252,0.92) 72%, #F8FAFC 100%)",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-end px-4 pb-3 pt-8">
          {previewMsg ? (
            <p
              className={[
                "mb-3 rounded-xl px-3 py-2 text-xs leading-relaxed",
                preview ? "bg-[#F4F9E0]/95 text-[#243647]" : "bg-amber-50/95 text-amber-950",
              ].join(" ")}
            >
              {previewMsg}
            </p>
          ) : null}

          <div className="rounded-[28px] border border-white/60 bg-white/95 p-5 shadow-[0_12px_40px_rgba(11,46,89,0.14)] backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#1A9BB0]">
              {copy.eyebrow}
            </p>
            <h1 className="mt-2 text-[1.65rem] font-extrabold leading-[1.12] tracking-tight text-[#0B2E59] sm:text-[1.85rem]">
              {copy.title}
            </h1>
            <p className="mt-2 text-[14px] leading-snug text-[#6B7A8C]">{copy.subtitle}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {copy.trustChips.map((chip) => (
                <TrustChip key={chip} label={chip} />
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              <Link
                href="/full?founder=1"
                className="vu-focus inline-flex min-h-[3.25rem] items-center justify-center rounded-2xl bg-[#0B2E59] px-5 text-[15px] font-bold text-white shadow-[0_6px_20px_rgba(11,46,89,0.28)] active:scale-[0.99]"
              >
                {copy.primaryCta}
              </Link>
              <Link
                href="/plaza"
                className="vu-focus inline-flex min-h-[3rem] items-center justify-center rounded-2xl border-2 border-[#0B2E59]/15 bg-white px-5 text-[14px] font-semibold text-[#0B2E59] active:scale-[0.99]"
              >
                {copy.secondaryCta}
              </Link>
            </div>

            <p className="mt-3 text-center text-[12px] font-semibold leading-relaxed text-[#243647]">
              {copy.microcopy}
            </p>
          </div>
        </div>
      </section>

      {/* ── Barrio hooks ── */}
      <section className="relative z-10 mx-auto -mt-1 max-w-lg px-4 pb-8 pt-0">
        <h2 className="text-base font-bold text-[#0B2E59]">{copy.barrioSectionTitle}</h2>
        <div className="-mx-4 mt-3 flex gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FUNDADOR_BARRIO_HOOKS.map((hook) => (
            <BarrioHookCard key={hook.id} {...hook} />
          ))}
        </div>
        <p className="mt-4 text-[13px] leading-relaxed text-[#6B7A8C]">{copy.narrativeLine}</p>
      </section>

      {/* ── Pie mínimo ── */}
      <footer className="mx-auto max-w-lg border-t border-[#E8EEF3] px-4 py-6">
        <div className="flex flex-col items-center gap-2 text-center">
          {!qualified && !preview ? (
            <Link
              href="/full/result"
              className="text-[13px] font-medium text-[#6B7A8C] underline underline-offset-2"
            >
              {copy.alreadyHaveReadingCta}
            </Link>
          ) : null}
          {preview ? (
            <Link
              href="/barrio"
              className="text-[13px] font-semibold text-[#1A9BB0] underline underline-offset-2"
            >
              Explorar el barrio (modo exploración)
            </Link>
          ) : null}
          {process.env.NODE_ENV !== "production" ? (
            <Link href="/lab/prelaunch" className="text-[11px] text-[#9AA8B8] underline">
              Checklist pre-lanzamiento (interno)
            </Link>
          ) : null}
        </div>
      </footer>
    </main>
  );
}
