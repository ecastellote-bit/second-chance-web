"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { UserProfileGate } from "@/components/perfil/UserProfileGate";
import {
  EVENT_LABEL_BADGE,
  NeighborhoodActivityDetail,
} from "@/components/neighborhood/NeighborhoodActivityDetail";
import { EVENTOS_CATALOG } from "@/lib/content/eventosCatalog";

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
        <Link
          href="/eventos"
          className="vu-focus inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-[#0B2E59] px-6 text-sm font-semibold text-white"
        >
          Volver al calendario
        </Link>
      }
    >
      <p>
        El detalle completo y la inscripción se abren en la próxima etapa. Por ahora podés explorar
        el calendario del barrio.
      </p>
    </NeighborhoodActivityDetail>
    </UserProfileGate>
  );
}
