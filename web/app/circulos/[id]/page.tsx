"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CIRCLE_STATUS_BADGE,
  NeighborhoodActivityDetail,
} from "@/components/neighborhood/NeighborhoodActivityDetail";
import { CIRCULOS_CATALOG } from "@/lib/content/circulosCatalog";

export default function CirculoDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const circle = CIRCULOS_CATALOG.find((c) => c.id === id);

  if (!circle) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-[#F8FAFC] px-6 text-center">
        <p className="text-lg font-semibold text-[#0B2E59]">No encontramos este círculo</p>
        <Link href="/circulos" className="vu-focus text-[#1A9BB0] font-semibold underline">
          Ver todos los círculos
        </Link>
      </main>
    );
  }

  return (
    <NeighborhoodActivityDetail
      backHref="/circulos"
      backLabel="Círculos"
      image={circle.image}
      title={circle.title}
      meta={`${circle.members} personas · ${circle.online} en línea ahora`}
      badge={CIRCLE_STATUS_BADGE[circle.status]}
      footer={
        <>
          <Link
            href="/plaza"
            className="vu-focus inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-[#0B2E59] px-6 text-sm font-semibold text-white"
          >
            Volver a la plaza
          </Link>
          <Link
            href="/circulos"
            className="vu-focus inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-[#E8EEF3] bg-white px-6 text-sm font-semibold text-[#0B2E59]"
          >
            Ver otros círculos
          </Link>
        </>
      }
    >
      <p>{circle.description}</p>
      <p className="mt-4">
        El espacio interior de este círculo se abre en la próxima etapa. Por ahora podés explorar
        los demás desde la plaza.
      </p>
    </NeighborhoodActivityDetail>
  );
}
