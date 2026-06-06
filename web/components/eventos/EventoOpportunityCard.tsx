"use client";

import Link from "next/link";
import { CommunityMicroAction } from "@/components/community/CommunityMicroAction";
import { VuWarmImage } from "@/components/ui/VuWarmImage";
import type { OpportunityEvent } from "@/lib/content/eventosCatalog";

const LABEL_COLORS: Record<string, { bg: string; text: string }> = {
  Taller: { bg: "rgba(26,155,176,0.2)", text: "#0B2E59" },
  Charla: { bg: "rgba(26,155,176,0.2)", text: "#0B2E59" },
  Networking: { bg: "rgba(198,217,45,0.35)", text: "#0B2E59" },
  Voluntariado: { bg: "rgba(26,155,176,0.15)", text: "#0B2E59" },
  Ilustración: { bg: "rgba(11,46,89,0.08)", text: "#6B7A8C" },
  "Convocatoria semilla": { bg: "rgba(26,155,176,0.2)", text: "#0B2E59" },
  "Primer encuentro tentativo": { bg: "rgba(198,217,45,0.35)", text: "#0B2E59" },
};

function seedFootnote(event: OpportunityEvent): string {
  if (event.isTentative && event.tentativeDisclaimer) {
    return event.tentativeDisclaimer;
  }
  if (event.isTeamSeed && event.description) {
    return event.description;
  }
  if (event.isTeamSeed) {
    return "Convocatoria semilla del equipo — marcá interés sin cupo ni confirmación fingida.";
  }
  return "Ilustración del barrio · ejemplo para orientarte";
}

export function EventoOpportunityCard({ event }: { event: OpportunityEvent }) {
  const labelStyle = LABEL_COLORS[event.label] ?? LABEL_COLORS.Taller;

  return (
    <article className="group flex flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_4px_16px_rgba(15,42,70,0.08)] transition-shadow hover:shadow-[0_8px_24px_rgba(15,42,70,0.12)]">
      <div className="relative h-[148px] w-full shrink-0">
        <VuWarmImage
          src={event.image}
          fallbackSrc={event.fallbackImage}
          alt=""
          fill
          className="object-cover"
          sizes="360px"
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, transparent 40%, rgba(11,46,89,0.5) 100%)",
          }}
        />
        <span
          className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
          style={{ backgroundColor: labelStyle.bg, color: labelStyle.text }}
        >
          {event.label}
        </span>
        <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#0B2E59] shadow-sm">
          {event.dateShort}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="text-[15px] font-bold leading-snug text-[#0B2E59]">{event.title}</h3>

        <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#6B7A8C]">
          <span className="inline-flex items-center gap-1 font-medium text-[#6B7A8C]">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="5" width="16" height="14" rx="2" />
              <path d="M8 3v4M16 3v4M4 11h16" />
            </svg>
            {event.date}
          </span>
          <span className="text-[#CBD5E1]">·</span>
          <span className="font-semibold text-[#1A9BB0]">{event.modalityLabel}</span>
        </div>

        {event.city ? (
          <p className="text-[12px] text-[#6B7A8C]">
            {event.city}
            {event.zone ? ` · ${event.zone}` : ""}
          </p>
        ) : null}

        <p className="text-[12px] leading-relaxed text-[#6B7A8C]">{seedFootnote(event)}</p>

        <div className="mt-auto space-y-2">
          <CommunityMicroAction
            kind="formation_or_event"
            targetId={event.id}
            targetTitle={event.title}
            targetKind="event"
            variant="primary"
            label={event.isTentative ? "Quiero recibir aviso" : undefined}
          />
          <Link
            href={`/eventos/${event.id}`}
            className="vu-focus flex min-h-[40px] items-center justify-center gap-2 text-sm font-semibold text-[#1A9BB0] underline"
          >
            {event.cta}
          </Link>
        </div>
      </div>
    </article>
  );
}
