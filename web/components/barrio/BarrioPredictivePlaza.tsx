"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  BARRIO_ACTION_CARDS,
  BARRIO_LIVE_PREVIEWS,
  BARRIO_PREDICTIVE_COPY,
  BARRIO_TRUST_CHIPS,
} from "@/lib/content/barrioPredictiveCopy";
import { VuBottomNav } from "@/components/layout/VuMobileShell";
import { VuWarmImage } from "@/components/ui/VuWarmImage";
import { trackObservatoryEvent, trackObservatoryEventOnce } from "@/lib/observatory/client";

const copy = BARRIO_PREDICTIVE_COPY;

function TrustChip({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="vu-focus inline-flex rounded-full border border-[#1A9BB0]/25 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0B2E59] active:scale-[0.98]"
    >
      {label}
    </Link>
  );
}

function ActionCard({
  card,
  onNavigate,
}: {
  card: (typeof BARRIO_ACTION_CARDS)[number];
  onNavigate: (actionId: string, href: string) => void;
}) {
  return (
    <Link
      href={card.href}
      onClick={() => onNavigate(card.id, card.href)}
      className="vu-focus group flex gap-3 overflow-hidden rounded-2xl border border-[#E8EEF3] bg-white p-3 shadow-[0_4px_14px_rgba(15,42,70,0.06)] active:scale-[0.99]"
    >
      <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-[#E8EEF3]">
        <VuWarmImage
          src={card.image}
          fallbackSrc={card.fallbackImage}
          alt=""
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="72px"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <p className="text-[14px] font-bold leading-snug text-[#0B2E59]">{card.title}</p>
        <p className="text-[12px] leading-snug text-[#6B7A8C] line-clamp-2">{card.line}</p>
        <span className="text-[12px] font-bold text-[#1A9BB0]">{card.cta} →</span>
      </div>
    </Link>
  );
}

function LivePreviewCard({
  item,
  onNavigate,
}: {
  item: (typeof BARRIO_LIVE_PREVIEWS)[number];
  onNavigate: (actionId: string, href: string) => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={() => onNavigate(`preview-${item.id}`, item.href)}
      className="vu-focus group flex w-[10.5rem] shrink-0 flex-col overflow-hidden rounded-2xl border border-[#E8EEF3] bg-white shadow-[0_4px_14px_rgba(15,42,70,0.06)] active:scale-[0.99]"
    >
      <div className="relative h-[5.25rem] w-full overflow-hidden bg-[#E8EEF3]">
        <VuWarmImage
          src={item.image}
          fallbackSrc={item.fallbackImage}
          alt=""
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="168px"
        />
        <span className="absolute left-2 top-2 max-w-[90%] truncate rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#0B2E59]">
          {item.badge}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <p className="text-[11px] font-semibold leading-snug text-[#0B2E59] line-clamp-3">{item.title}</p>
        <span className="text-[11px] font-bold text-[#1A9BB0]">Ver →</span>
      </div>
    </Link>
  );
}

export function BarrioPredictivePlaza() {
  useEffect(() => {
    trackObservatoryEventOnce("funnel.barrio_view", "campaign");
  }, []);

  function trackAction(actionId: string, href: string) {
    trackObservatoryEvent("barrio.action_card_click", "campaign", {
      actionId,
      href,
      path: "/barrio",
    });
    if (actionId === "lectura" || href.includes("/full")) {
      trackObservatoryEvent("barrio.start_reading_click", "campaign", {
        actionId,
        href,
        path: "/barrio",
      });
    }
  }

  function trackReadingCta(href: string) {
    trackObservatoryEvent("barrio.start_reading_click", "campaign", {
      actionId: "hero-primary",
      href,
      path: "/barrio",
    });
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#F8FAFC] font-[family-name:var(--font-inter)] pb-24">
      <header className="px-4 pb-3 pt-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#1A9BB0]">{copy.eyebrow}</p>
        <h1 className="mt-1.5 text-[1.5rem] font-extrabold leading-tight text-[#0B2E59]">{copy.title}</h1>
        <p className="mt-1.5 text-[14px] leading-snug text-[#6B7A8C]">{copy.subtitle}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {BARRIO_TRUST_CHIPS.map((chip) => (
            <TrustChip key={chip.label} label={chip.label} href={chip.href} />
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/full?founder=1"
            onClick={() => trackReadingCta("/full?founder=1")}
            className="vu-focus inline-flex min-h-[3rem] flex-1 items-center justify-center rounded-2xl bg-[#0B2E59] px-4 text-[14px] font-bold text-white shadow-[0_4px_16px_rgba(11,46,89,0.2)]"
          >
            {copy.primaryCta}
          </Link>
          <a
            href="#acciones-barrio"
            className="vu-focus inline-flex min-h-[3rem] flex-1 items-center justify-center rounded-2xl border-2 border-[#0B2E59]/12 bg-white px-4 text-[14px] font-semibold text-[#0B2E59]"
          >
            {copy.secondaryCta}
          </a>
        </div>
      </header>

      <section id="acciones-barrio" className="scroll-mt-4 px-4 pb-4">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {BARRIO_ACTION_CARDS.map((card) => (
            <ActionCard key={card.id} card={card} onNavigate={trackAction} />
          ))}
        </div>
      </section>

      <section className="px-4 pb-6">
        <h2 className="text-base font-bold text-[#0B2E59]">{copy.liveSectionTitle}</h2>
        <div className="-mx-4 mt-3 flex gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {BARRIO_LIVE_PREVIEWS.map((item) => (
            <LivePreviewCard key={item.id} item={item} onNavigate={trackAction} />
          ))}
        </div>
      </section>

      <VuBottomNav active="plaza" />
    </div>
  );
}
