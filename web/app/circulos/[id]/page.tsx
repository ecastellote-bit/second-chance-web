"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CIRCLE_STATUS_BADGE,
  NeighborhoodActivityDetail,
} from "@/components/neighborhood/NeighborhoodActivityDetail";
import { CircleVisibleIdeasBlock } from "@/components/circulos/CircleVisibleIdeasBlock";
import { CommunityAdminPostsBlock } from "@/components/community/CommunityAdminPostsBlock";
import { ReportContentButton } from "@/components/community/ReportContentButton";
import { CircleSignalsPanel } from "@/components/circulos/CircleSignalsPanel";
import { CIRCULOS_CATALOG } from "@/lib/content/circulosCatalog";
import { COMMUNITY_SEED_INTERIOR_BODY } from "@/lib/content/communitySeedCopy";

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
      fallbackImage={circle.fallbackImage}
      title={circle.title}
      meta={
        circle.isTeamSeed
          ? `${circle.seedBadge ?? "Mesa en formación"} · equipo VocationUp`
          : "Mesa temática en formación · espacio semilla"
      }
      badge={CIRCLE_STATUS_BADGE[circle.status]}
      footer={
        <div className="flex w-full max-w-md flex-col gap-2">
          <CircleSignalsPanel circleId={circle.id} circleTitle={circle.title} />
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
        </div>
      }
    >
      <p className="mb-4 text-[15px] leading-relaxed text-[#243647]">
        {circle.description}
      </p>
      <p className="mb-4 rounded-2xl border border-[#E8EEF3] bg-[#F8FAFC] px-4 py-3 text-[13px] leading-relaxed text-[#6B7A8C]">
        Una mesa temática donde el barrio puede acercarse con señales guiadas — sin chat libre ni
        contacto automático entre personas.
      </p>
      <CircleVisibleIdeasBlock circleId={circle.id} className="mb-4" />
      <CommunityAdminPostsBlock
        targetType="circle"
        targetId={circle.id}
        title="Lo que el barrio va contando de este círculo"
        emptyMessage="Este círculo está en etapa inicial. Podés dejar una señal o una idea para revisión."
        className="mb-4"
      />
      <p className="text-[13px] leading-relaxed text-[#6B7A8C]">{COMMUNITY_SEED_INTERIOR_BODY}</p>
      <ReportContentButton targetType="circle" targetId={circle.id} className="mt-4" />
    </NeighborhoodActivityDetail>
  );
}
