"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  EVENT_LABEL_BADGE,
  NeighborhoodActivityDetail,
} from "@/components/neighborhood/NeighborhoodActivityDetail";
import { CommunityMicroAction } from "@/components/community/CommunityMicroAction";
import { getEventById } from "@/lib/content/eventosCatalog";
import { COMMUNITY_SEED_INTERIOR_BODY } from "@/lib/content/communitySeedCopy";

export default function EventoDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const event = getEventById(id);

  if (!event) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-[#F8FAFC] px-6 text-center">
        <p className="text-lg font-semibold text-[#0B2E59]">No encontramos este evento</p>
        <Link href="/eventos" className="vu-focus font-semibold text-[#1A9BB0] underline">
          Ver calendario del barrio
        </Link>
      </main>
    );
  }

  const meta = event.isTentative
    ? `${event.modalityLabel} · ${event.duration ?? "90 minutos"}`
    : `${event.date} · ${event.modalityLabel}`;

  return (
    <NeighborhoodActivityDetail
      backHref="/eventos"
      backLabel="Eventos"
      image={event.image}
      fallbackImage={event.fallbackImage}
      title={event.title}
      meta={meta}
      badge={EVENT_LABEL_BADGE[event.label] ?? {
        label: event.label,
        bg: "rgba(26,155,176,0.2)",
        text: "#0B2E59",
      }}
      footer={
        <div className="flex w-full max-w-md flex-col gap-2">
          <CommunityMicroAction
            kind="formation_or_event"
            targetId={event.id}
            targetTitle={event.title}
            targetKind="event"
            variant="primary"
            label={event.cta}
          />
          {!event.isTentative ? (
            <>
              <CommunityMicroAction
                kind="formation_or_event"
                targetId={event.id}
                targetTitle={event.title}
                targetKind="event"
                notifySimilar
              />
              <CommunityMicroAction
                kind="formation_or_event"
                targetId={event.id}
                targetTitle={event.title}
                targetKind="event"
                savedRoute
              />
            </>
          ) : null}
          <Link
            href="/eventos"
            className="vu-focus inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-[#0B2E59] px-6 text-sm font-semibold text-white"
          >
            Volver al calendario
          </Link>
        </div>
      }
    >
      {event.isTentative ? (
        <>
          <p className="mb-4 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-[13px] leading-relaxed text-amber-950">
            {event.tentativeDisclaimer}
          </p>
          {event.city ? (
            <p className="mb-2 text-[14px] text-[#243647]">
              <strong>Ciudad:</strong> {event.city}
            </p>
          ) : null}
          {event.zone ? (
            <p className="mb-2 text-[14px] text-[#243647]">
              <strong>Zona sugerida:</strong> {event.zone}
            </p>
          ) : null}
          <p className="mb-2 text-[14px] text-[#243647]">
            <strong>Fecha visible:</strong> {event.date}
          </p>
          {event.entryNote ? (
            <p className="mb-4 text-[14px] text-[#243647]">
              <strong>Entrada:</strong> {event.entryNote}
            </p>
          ) : null}
        </>
      ) : event.description ? (
        <p className="mb-4 text-[15px] leading-relaxed text-[#243647]">{event.description}</p>
      ) : null}
      <p>{COMMUNITY_SEED_INTERIOR_BODY}</p>
    </NeighborhoodActivityDetail>
  );
}
