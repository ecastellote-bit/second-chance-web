"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { LiveActivityPanel } from "@/components/community/LiveActivityPanel";
import { FounderExitDebugOverlay } from "@/components/founder/FounderExitDebugOverlay";
import { FounderExitModal } from "@/components/founder/FounderExitModal";
import { FounderMicroGate } from "@/components/founder/FounderMicroGate";
import { FounderSoftFeedbackNudge } from "@/components/founder/FounderSoftFeedbackNudge";
import { FounderStoryRotator } from "@/components/founder/FounderStoryRotator";
import { VuWarmImage } from "@/components/ui/VuWarmImage";
import type { FounderMicrogateOptionId } from "@/lib/content/fundadorConversionCopy";
import {
  FUNDADOR_V2_ALREADY_READING,
  FUNDADOR_V2_CTAS,
  FUNDADOR_V2_ECOSYSTEM,
  FUNDADOR_V2_EMOTIONAL,
  FUNDADOR_V2_GUARANTEES,
  FUNDADOR_V2_HERO,
  FUNDADOR_V2_STORIES,
  FUNDADOR_V2_STORIES_SECTION,
} from "@/lib/content/fundadorLandingV2Copy";
import {
  trackFounderConversion,
  trackFounderConversionOnce,
} from "@/lib/founder/founderConversionTelemetry";
import {
  markSoftFeedbackNudgeDoneThisSession,
  useFounderSoftFeedbackNudge,
  type SoftFeedbackNudgeReason,
} from "@/lib/founder/useFounderSoftFeedbackNudge";
import {
  type FounderExitTrigger,
  isFounderExitModalShownThisSession,
  markFounderExitModalShownThisSession,
  useFounderExitIntercept,
  useFounderScrollDepth,
} from "@/lib/founder/useFounderLandingEngagement";

type Props = {
  qualified: boolean;
  preview: boolean;
  previewMsg: string | null;
  debugFounderExit?: boolean;
};

function CtaChevron() {
  return (
    <span className="ml-auto text-[18px] font-normal leading-none opacity-80" aria-hidden>
      ›
    </span>
  );
}

function EcosystemDoor({
  title,
  href,
  image,
  fallbackImage,
  onNavigate,
}: {
  title: string;
  href: string;
  image: string;
  fallbackImage: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="vu-focus group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0B2E59]/70 shadow-[0_6px_20px_rgba(0,0,0,0.22)] active:scale-[0.99]"
    >
      <div className="relative h-[5.25rem] w-full overflow-hidden sm:h-[5.75rem]">
        <VuWarmImage
          src={image}
          fallbackSrc={fallbackImage}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width:640px) 44vw, 220px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071018]/85 via-transparent to-transparent" />
      </div>
      <div className="flex flex-1 items-center px-3 py-3">
        <p className="text-[13px] font-bold leading-snug text-white">{title}</p>
      </div>
    </Link>
  );
}

export function FundadorCommunityLanding({
  qualified,
  preview,
  previewMsg,
  debugFounderExit = false,
}: Props) {
  const router = useRouter();
  const emotionalRef = useRef<HTMLElement>(null);
  const footerNudgeRef = useRef<HTMLDivElement>(null);

  const [hasRelevantAction, setHasRelevantAction] = useState(false);
  const [microgateOpen, setMicrogateOpen] = useState(false);
  const [microgateStep, setMicrogateStep] = useState<"choose" | "bridge">("choose");
  const [selectedOption, setSelectedOption] = useState<FounderMicrogateOptionId | null>(null);
  const [showSoftFeedback, setShowSoftFeedback] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [exitTrigger, setExitTrigger] = useState<FounderExitTrigger>("unknown_exit_attempt");
  const fundadorGuardUrlRef = useRef("/fundador");

  useEffect(() => {
    fundadorGuardUrlRef.current = `${window.location.pathname}${window.location.search}`;
  }, []);

  const markAction = useCallback(() => {
    setHasRelevantAction(true);
    setShowSoftFeedback(false);
    setExitOpen(false);
  }, []);

  const handleAutoExitTrigger = useCallback(
    (trigger: FounderExitTrigger) => {
      if (hasRelevantAction) return;
      if (isFounderExitModalShownThisSession()) return;
      markFounderExitModalShownThisSession();
      setExitTrigger(trigger);
      setExitOpen(true);
      trackFounderConversion("founder.exit_modal_shown", { exitTrigger: trigger });
    },
    [hasRelevantAction],
  );

  const openExitFromSoftNudge = useCallback(() => {
    setShowSoftFeedback(false);
    setExitTrigger("soft_feedback_nudge");
    setExitOpen(true);
    trackFounderConversion("founder.soft_feedback_nudge_click", { action: "feedback" });
    trackFounderConversion("founder.exit_feedback_modal_shown", {
      exitTrigger: "soft_feedback_nudge",
    });
  }, []);

  const handleSoftNudgeEligible = useCallback((reason: SoftFeedbackNudgeReason) => {
    markSoftFeedbackNudgeDoneThisSession();
    setShowSoftFeedback(true);
    trackFounderConversionOnce("founder.soft_feedback_nudge_shown", { reason });
  }, []);

  const openMicrogate = useCallback(() => {
    setMicrogateOpen(true);
    setMicrogateStep("choose");
    setSelectedOption(null);
    markAction();
    trackFounderConversion("founder.microgate_opened");
  }, [markAction]);

  const getShouldIntercept = useCallback(
    () => !hasRelevantAction && !exitOpen && !microgateOpen,
    [hasRelevantAction, exitOpen, microgateOpen],
  );

  const restoreFundadorRoute = useCallback(() => {
    router.replace(fundadorGuardUrlRef.current);
  }, [router]);

  useFounderScrollDepth(true);

  const exitDebugSnapshot = useFounderExitIntercept({
    getShouldIntercept,
    onTrigger: handleAutoExitTrigger,
    onRestoreRoute: restoreFundadorRoute,
    debug: debugFounderExit,
    debugHasRelevantAction: hasRelevantAction,
  });

  useFounderSoftFeedbackNudge({
    enabled: !hasRelevantAction && !showSoftFeedback && !exitOpen && !microgateOpen,
    barrioSectionRef: footerNudgeRef,
    activityBlockRef: footerNudgeRef,
    onEligible: handleSoftNudgeEligible,
    showAfterMs: 35_000,
    scrollDepthThreshold: 0.9,
  });

  function scrollToEmotional() {
    emotionalRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleSelectOption(id: FounderMicrogateOptionId) {
    setSelectedOption(id);
    setMicrogateStep("bridge");
    markAction();
    trackFounderConversion("founder.microgate_option_selected", { selectedOption: id });
  }

  return (
    <main className="relative overflow-x-hidden bg-[#071018] font-[family-name:var(--font-inter)] text-white">
      {/* ── HERO ── */}
      <section className="relative mx-auto min-h-[92dvh] max-w-lg">
        <div className="absolute inset-0 overflow-hidden">
          <VuWarmImage
            src={FUNDADOR_V2_HERO.image}
            fallbackSrc={FUNDADOR_V2_HERO.fallbackImage}
            alt=""
            fill
            priority
            className="object-cover brightness-[1.04] contrast-[1.02]"
            style={{ objectPosition: FUNDADOR_V2_HERO.objectPosition }}
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(7,16,24,0.25) 0%, rgba(7,16,24,0.55) 45%, rgba(7,16,24,0.92) 78%, #071018 100%)",
            }}
          />
        </div>

        <div className="relative z-10 flex min-h-[92dvh] flex-col px-4 pb-6 pt-8">
          <p
            className="text-[13px] font-bold tracking-[0.04em] text-white sm:text-[14px]"
            style={{ textShadow: "0 1px 12px rgba(7,16,24,0.55)" }}
          >
            VocationUp{" "}
            <span className="font-semibold text-[#C6D92D]/95">by Second Chance</span>
          </p>

          {previewMsg ? (
            <p className="mt-3 rounded-xl bg-amber-50/95 px-3 py-2 text-xs leading-relaxed text-amber-950">
              {previewMsg}
            </p>
          ) : null}

          <div className="mt-auto pb-2">
            <h1
              className="max-w-[18rem] text-[1.85rem] font-bold leading-[1.08] tracking-tight text-white sm:text-[2rem]"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              {FUNDADOR_V2_HERO.title}
            </h1>
            <p
              className="mt-3 max-w-[19rem] text-[16px] font-medium leading-snug text-white/92"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              {FUNDADOR_V2_HERO.subtitle}
            </p>
            <p className="mt-3 max-w-[20rem] text-[14px] leading-relaxed text-white/78">
              {FUNDADOR_V2_HERO.microcopy}
            </p>
            <p className="mt-3 max-w-[20rem] text-[13px] leading-relaxed text-white/72">
              {FUNDADOR_V2_HERO.gratuityLine}
            </p>

            <div className="mt-5 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  trackFounderConversion("founder.primary_cta_click", { cta: "start_path" });
                  scrollToEmotional();
                }}
                className="vu-focus inline-flex min-h-[3.25rem] w-full items-center rounded-2xl bg-[#C6D92D] px-4 text-left text-[15px] font-bold text-[#0B2E59] shadow-[0_8px_28px_rgba(198,217,45,0.35)] active:scale-[0.99]"
              >
                {FUNDADOR_V2_CTAS.primary.label}
                <CtaChevron />
              </button>

              <Link
                href={FUNDADOR_V2_CTAS.reading.href}
                onClick={() => {
                  trackFounderConversion("founder.secondary_cta_click", { cta: "reading" });
                  markAction();
                }}
                className="vu-focus inline-flex min-h-[3.25rem] w-full items-center rounded-2xl border-2 border-white/30 bg-white/10 px-4 text-left text-[15px] font-semibold text-white backdrop-blur-sm active:scale-[0.99]"
              >
                {FUNDADOR_V2_CTAS.reading.label}
                <CtaChevron />
              </Link>

              <Link
                href={FUNDADOR_V2_CTAS.explore.href}
                onClick={() => {
                  trackFounderConversion("founder.secondary_cta_click", { cta: "explore" });
                  markAction();
                }}
                className="vu-focus inline-flex min-h-[3.25rem] w-full items-center rounded-2xl border border-[#1A9BB0]/45 bg-[#1A9BB0]/12 px-4 text-left text-[15px] font-semibold text-[#1A9BB0] active:scale-[0.99]"
              >
                {FUNDADOR_V2_CTAS.explore.label}
                <CtaChevron />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Microelección emocional ── */}
      <section
        id="por-donde-empezar"
        ref={emotionalRef}
        className="scroll-mt-4 px-4 py-7"
      >
        <div className="mx-auto max-w-lg">
          <h2 className="text-[17px] font-bold leading-snug text-white">
            {FUNDADOR_V2_EMOTIONAL.title}
          </h2>
          <ul className="mt-4 flex flex-col gap-2.5">
            {FUNDADOR_V2_EMOTIONAL.options.map((option) => (
              <li key={option.id}>
                <Link
                  href={option.href}
                  onClick={() => {
                    trackFounderConversion("founder.primary_cta_click", {
                      emotionalOption: option.id,
                    });
                    markAction();
                  }}
                  className="vu-focus flex min-h-[3rem] w-full items-center rounded-2xl border border-white/14 bg-[#0B2E59]/55 px-4 py-3 text-left text-[14px] font-semibold leading-snug text-white/95 active:scale-[0.99]"
                >
                  {option.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Historias semilla rotativas ── */}
      <FounderStoryRotator
        stories={FUNDADOR_V2_STORIES}
        title={FUNDADOR_V2_STORIES_SECTION.title}
      />

      {/* ── Puertas del ecosistema ── */}
      <section className="px-4 py-5">
        <div className="mx-auto max-w-lg">
          <h2 className="text-[17px] font-bold text-white">{FUNDADOR_V2_ECOSYSTEM.title}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {FUNDADOR_V2_ECOSYSTEM.doors.map((door) => (
              <EcosystemDoor
                key={door.id}
                title={door.title}
                href={door.href}
                image={door.image}
                fallbackImage={door.fallbackImage}
                onNavigate={() => {
                  trackFounderConversion("founder.secondary_cta_click", { door: door.id });
                  markAction();
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Actividad fundadora ── */}
      <section className="px-4 py-5">
        <div className="mx-auto max-w-lg">
          <LiveActivityPanel variant="full" showTimestamps={false} />
        </div>
      </section>

      {/* ── Salida amable + garantías discretas ── */}
      <footer className="mx-auto max-w-lg border-t border-white/8 px-4 py-6 pb-10">
        <div ref={footerNudgeRef} className="mx-auto max-w-lg">
          <FounderSoftFeedbackNudge
            variant="footer"
            visible={showSoftFeedback && !hasRelevantAction && !microgateOpen}
            onFeedback={openExitFromSoftNudge}
            onTrySixty={() => {
              trackFounderConversion("founder.soft_feedback_nudge_click", { action: "plaza" });
              markAction();
              setShowSoftFeedback(false);
              router.push("/plaza");
            }}
            onDismiss={() => {
              setShowSoftFeedback(false);
              trackFounderConversion("founder.soft_feedback_nudge_dismissed");
            }}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-normal text-white/38">
          {FUNDADOR_V2_GUARANTEES.map((item, index) => (
            <span key={item.id} className="flex items-center gap-4">
              {index > 0 ? <span className="hidden text-white/25 sm:inline">|</span> : null}
              {item.label}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-center gap-2 text-center">
          {!qualified && !preview ? (
            <Link
              href={FUNDADOR_V2_ALREADY_READING.href}
              onClick={markAction}
              className="text-[13px] font-medium text-white/45 underline underline-offset-2 hover:text-white/70"
            >
              {FUNDADOR_V2_ALREADY_READING.label}
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
        </div>
      </footer>

      <FounderMicroGate
        open={microgateOpen}
        step={microgateStep}
        selectedId={selectedOption}
        onClose={() => {
          setMicrogateOpen(false);
          setMicrogateStep("choose");
        }}
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

      <FounderExitModal
        open={exitOpen && !hasRelevantAction}
        exitTrigger={exitTrigger}
        onClose={() => setExitOpen(false)}
        onTrySixty={openMicrogate}
        onMarkAction={markAction}
        onLeaveAfterSubmit={() => {
          if (typeof window === "undefined") return;
          if (exitTrigger === "browser_back" || exitTrigger === "desktop_exit_intent") {
            window.history.back();
          }
        }}
      />

      {debugFounderExit ? <FounderExitDebugOverlay snapshot={exitDebugSnapshot} /> : null}
    </main>
  );
}
