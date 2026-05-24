"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { UserProfileGate } from "@/components/perfil/UserProfileGate";
import {
  EVENT_LABEL_BADGE,
  NeighborhoodActivityDetail,
} from "@/components/neighborhood/NeighborhoodActivityDetail";
import { CommunityMicroAction } from "@/components/community/CommunityMicroAction";
import { EVENTOS_CATALOG } from "@/lib/content/eventosCatalog";
import { COMMUNITY_SEED_INTERIOR_BODY } from "@/lib/content/communitySeedCopy";

export default function EventoDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const event = EVENTOS_CATALOG.find((e) => e.id === id);

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

  return (
    <UserProfileGate>
    <NeighborhoodActivityDetail
      backHref="/eventos"
      backLabel="Eventos"
      image={event.image}
      title={event.title}
      meta={`${event.date} · ${event.modalityLabel}`}
      badge={EVENT_LABEL_BADGE[event.label]}
      footer={
        <div className="flex w-full max-w-md flex-col gap-2">
          <CommunityMicroAction
            kind="formation_or_event"
            targetId={event.id}
            targetTitle={event.title}
            targetKind="event"
            variant="primary"
          />
          <CommunityMicroAction
            kind="formation_or_event"
            targetId={event.id}
            targetTitle={event.title}
            targetKind="event"
            notifySimilar
          />
          <Link
            href="/eventos"
            className="vu-focus inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-[#0B2E59] px-6 text-sm font-semibold text-white"
          >
            Volver al calendario
          </Link>
        </div>
      }
    >
      <p>{COMMUNITY_SEED_INTERIOR_BODY}</p>
    </NeighborhoodActivityDetail>
    </UserProfileGate>
  );
}
