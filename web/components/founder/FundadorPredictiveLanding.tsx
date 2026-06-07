"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { LiveActivityPanel } from "@/components/community/LiveActivityPanel";
import { FounderExitModal } from "@/components/founder/FounderExitModal";
import { FounderMicroGate } from "@/components/founder/FounderMicroGate";
import { FounderStickyNudge } from "@/components/founder/FounderStickyNudge";
import { VuWarmImage } from "@/components/ui/VuWarmImage";
import {
  FUNDADOR_HERO_COPY,
  type FounderMicrogateOptionId,
} from "@/lib/content/fundadorConversionCopy";
import {
  FUNDADOR_BARRIO_HOOKS,
  FUNDADOR_HERO_ASSETS,
} from "@/lib/content/fundadorLandingCopy";
import {
  trackFounderConversion,
  trackFounderConversionOnce,
} from "@/lib/founder/founderConversionTelemetry";
import {
  useFounderExitIntercept,
  useFounderScrollDepth,
} from "@/lib/founder/useFounderLandingEngagement";

type Props = {
  qualified: boolean;
  preview: boolean;
  previewMsg: string | null;
};

function HeroChip({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full border border-[#C6D92D]/35 bg-[#0B2E59]/60 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[#C6D92D] backdrop-blur-sm sm:text-[10px]">
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
  onNavigate,
}: {
  title: string;
  cta: string;
  href: string;
  image: string;
  fallbackImage: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="vu-focus group flex min-w-[10rem] max-w-[11rem] shrink-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0B2E59]/80 shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-sm active:scale-[0.98]"
    >
      <div className="relative h-[5.75rem] w-full overflow-hidden">
        <VuWarmImage
          src={image}
          fallbackSrc={fallbackImage}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="176px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B2E59] via-transparent to-transparent" />
      </div>
      <div className="flex flex-1 flex-col gap-1 px-3 py-2.5">
        <p className="text-[12px] font-bold leading-snug text-white line-clamp-2">{title}</p>
        <span className="text-[11px] font-bold text-[#1A9BB0]">{cta} →</span>
      </div>
    </Link>
  );
}

function ArchitectureStrip() {
  const copy = FUNDADOR_HERO_COPY;
  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#0B2E59]/10 bg-white p-4 shadow-[0_4px_20px_rgba(11,46,89,0.08)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#0B2E59 1px, transparent 1px), linear-gradient(90deg, #0B2E59 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
        aria-hidden
      />
      <p className="relative text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
        {copy.architectureTitle}
      </p>
      <ul className="relative mt-3 flex flex-col gap-2">
        {copy.architectureLines.map((line, i) => (
          <li key={line} className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0B2E59] text-[11px] font-bold text-[#C6D92D]">
              {i + 1}
            </span>
            <span className="text-[13px] font-semibold text-[#0B2E59]">{line}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function FundadorPredictiveLanding({ qualified, preview, previewMsg }: Props) {
  const copy = FUNDADOR_HERO_COPY;
  const router = useRouter();
  const barrioSectionRef = useRef<HTMLElement>(null);

  const [hasRelevantAction, setHasRelevantAction] = useState(false);
  const [microgateOpen, setMicrogateOpen] = useState(false);
  const [microgateStep, setMicrogateStep] = useState<"choose" | "bridge">("choose");
  const [selectedOption, setSelectedOption] = useState<FounderMicrogateOptionId | null>(null);
  const [showSticky, setShowSticky] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);

  const markAction = useCallback(() => {
    setHasRelevantAction(true);
    setShowSticky(false);
    setExitOpen(false);
  }, []);

  const openMicrogate = useCallback(() => {
    setMicrogateOpen(true);
    setMicrogateStep("choose");
    setSelectedOption(null);
    markAction();
    trackFounderConversion("founder.microgate_opened");
  }, [markAction]);

  useFounderScrollDepth(true);

  useFounderExitIntercept({
    enabled: !hasRelevantAction && !exitOpen && !microgateOpen,
    onTrigger: () => setExitOpen(true),
  });

  useEffect(() => {
    if (showSticky && !hasRelevantAction) {
      trackFounderConversionOnce("founder.sticky_nudge_shown");
    }
  }, [showSticky, hasRelevantAction]);

  useEffect(() => {
    if (hasRelevantAction || showSticky) return;
    const timer = window.setTimeout(() => setShowSticky(true), 14000);
    return () => window.clearTimeout(timer);
  }, [hasRelevantAction, showSticky]);

  useEffect(() => {
    if (hasRelevantAction) return;

    function onScroll() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const depth = window.scrollY / max;
      if (depth >= 0.28) setShowSticky(true);

      if (barrioSectionRef.current && !hasRelevantAction) {
        const rect = barrioSectionRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.75) setShowSticky(true);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasRelevantAction]);

  function handleSelectOption(id: FounderMicrogateOptionId) {
    setSelectedOption(id);
    setMicrogateStep("bridge");
    trackFounderConversion("founder.microgate_option_selected", { selectedOption: id });
  }

  function handleCloseMicrogate() {
    setMicrogateOpen(false);
    setMicrogateStep("choose");
  }

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[#071018] font-[family-name:var(--font-inter)] text-[#243647]">
      {/* grid atmosphere */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#1A9BB0 1px, transparent 1px), linear-gradient(90deg, #1A9BB0 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden
      />

      {/* ── HERO INMERSIVO ── */}
      <section className="relative z-10 mx-auto flex min-h-[100dvh] max-w-lg flex-col">
        <div className="absolute inset-0 overflow-hidden">
          <VuWarmImage
            src={FUNDADOR_HERO_ASSETS.src}
            fallbackSrc={FUNDADOR_HERO_ASSETS.fallbackSrc}
            alt=""
            fill
            priority
            className="object-cover scale-105"
            style={{ objectPosition: FUNDADOR_HERO_ASSETS.objectPosition }}
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(7,16,24,0.35) 0%, rgba(11,46,89,0.72) 42%, rgba(7,16,24,0.96) 88%, #071018 100%)",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(26,155,176,0.18),transparent_55%)]" />
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-end px-4 pb-8 pt-10">
          {previewMsg ? (
            <p
              className={[
                "mb-4 rounded-xl px-3 py-2 text-xs leading-relaxed backdrop-blur-sm",
                preview ? "bg-[#F4F9E0]/95 text-[#243647]" : "bg-amber-50/95 text-amber-950",
              ].join(" ")}
            >
              {previewMsg}
            </p>
          ) : null}

          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1A9BB0]">
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 text-[2rem] font-extrabold leading-[1.06] tracking-tight text-white sm:text-[2.25rem]">
            {copy.title}
          </h1>
          <p className="mt-3 max-w-[20rem] text-[15px] font-medium leading-snug text-white/88 sm:text-[16px]">
            {copy.subtitle}
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {copy.trustChips.map((chip) => (
              <HeroChip key={chip} label={chip} />
            ))}
          </div>

          <p className="mt-4 text-[13px] font-medium text-[#C6D92D]/90">{copy.microcopy}</p>

          <div className="mt-5 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                trackFounderConversion("founder.primary_cta_click");
                openMicrogate();
              }}
              className="vu-focus inline-flex min-h-[3.5rem] items-center justify-center rounded-2xl bg-[#C6D92D] px-5 text-[16px] font-extrabold text-[#0B2E59] shadow-[0_8px_32px_rgba(198,217,45,0.4)] active:scale-[0.98]"
            >
              {copy.primaryCta}
            </button>
            <Link
              href="/barrio"
              onClick={() => {
                trackFounderConversion("founder.secondary_cta_click");
                markAction();
              }}
              className="vu-focus inline-flex min-h-[3rem] items-center justify-center rounded-2xl border-2 border-white/25 bg-white/8 px-5 text-[14px] font-semibold text-white backdrop-blur-sm active:scale-[0.98]"
            >
              {copy.secondaryCta}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Barrio + vida ── */}
      <section
        ref={barrioSectionRef}
        className="relative z-10 mx-auto max-w-lg px-4 pb-6 pt-2"
      >
        <div className="mb-4">
          <ArchitectureStrip />
        </div>

        <h2 className="text-[15px] font-bold text-white/95">{copy.barrioSectionTitle}</h2>
        <div className="-mx-4 mt-3 flex gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FUNDADOR_BARRIO_HOOKS.map((hook) => (
            <BarrioHookCard key={hook.id} {...hook} onNavigate={markAction} />
          ))}
        </div>

        <p className="mb-2 mt-5 text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
          {copy.activitySectionTitle}
        </p>
        <LiveActivityPanel variant="full" />
      </section>

      <footer className="relative z-10 mx-auto max-w-lg border-t border-white/8 px-4 py-8 pb-28">
        <div className="flex flex-col items-center gap-2 text-center">
          {!qualified && !preview ? (
            <Link
              href="/full/result"
              onClick={markAction}
              className="text-[13px] font-medium text-white/50 underline underline-offset-2 hover:text-white/75"
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
            <Link href="/lab/prelaunch" className="text-[11px] text-white/30 underline">
              Checklist pre-lanzamiento (interno)
            </Link>
          ) : null}
        </div>
      </footer>

      <FounderMicroGate
        open={microgateOpen}
        step={microgateStep}
        selectedId={selectedOption}
        onClose={handleCloseMicrogate}
        onSelectOption={handleSelectOption}
        onContinueReading={() => {
          trackFounderConversion("founder.microgate_continue_click", {
            selectedOption: selectedOption ?? "unknown",
          });
          markAction();
        }}
        onSecondaryBarrio={() => {
          trackFounderConversion("founder.microgate_secondary_click", {
            selectedOption: selectedOption ?? "unknown",
          });
          markAction();
        }}
      />

      <FounderStickyNudge
        visible={showSticky && !hasRelevantAction && !microgateOpen}
        onPrimary={() => {
          trackFounderConversion("founder.sticky_nudge_click", { action: "primary" });
          openMicrogate();
        }}
        onSecondary={() => {
          trackFounderConversion("founder.sticky_nudge_click", { action: "secondary" });
          markAction();
          router.push("/barrio");
        }}
      />

      <FounderExitModal
        open={exitOpen && !hasRelevantAction}
        onClose={() => setExitOpen(false)}
        onTrySixty={openMicrogate}
      />
    </main>
  );
}
