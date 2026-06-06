"use client";

import Link from "next/link";
import { CommunityMicroAction } from "@/components/community/CommunityMicroAction";
import { NeighborhoodActivityDetail } from "@/components/neighborhood/NeighborhoodActivityDetail";
import { VuWarmImage } from "@/components/ui/VuWarmImage";
import type { ProyectoListItem } from "@/lib/content/proyectosCatalog";
import { COMMUNITY_SEED_BADGE, COMMUNITY_SEED_INTERIOR_BODY } from "@/lib/content/communitySeedCopy";

export function ProyectoStubView({ project }: { project: ProyectoListItem }) {
  const isTeam = project.isTeamSeed === true;
  const meta = isTeam ? (project.label || "Convocatoria semilla") : COMMUNITY_SEED_BADGE;
  const interestLabel = project.cta ?? "Me interesa una idea así";

  return (
    <NeighborhoodActivityDetail
      backHref="/proyectos"
      backLabel="Proyectos"
      image={project.image}
      fallbackImage={project.fallbackImage}
      title={project.title}
      meta={meta}
      badge={
        isTeam
          ? { label: project.category ?? "Equipo fundador", bg: "rgba(26,155,176,0.2)", text: "#0B2E59" }
          : { label: project.label, bg: "rgba(198,217,45,0.35)", text: "#0B2E59" }
      }
      footer={
        <div className="flex w-full max-w-md flex-col gap-2">
          <CommunityMicroAction
            kind="project"
            projectId={project.id}
            projectTitle={project.title}
            mode="interest"
            variant="primary"
            label={interestLabel}
            registeredLabel="Interés registrado"
          />
          {!isTeam ? (
            <CommunityMicroAction
              kind="project"
              projectId={project.id}
              projectTitle={project.title}
              mode="observe"
              label="Quiero observar algo parecido"
              registeredLabel="Observación registrada"
            />
          ) : null}
          <Link
            href="/proyectos"
            className="vu-focus inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-[#E8EEF3] bg-white px-6 text-sm font-semibold text-[#0B2E59]"
          >
            Ver otros proyectos
          </Link>
        </div>
      }
    >
      {isTeam && project.author ? (
        <p className="mb-3 text-[13px] font-semibold text-[#1A9BB0]">
          {project.author} · propuesta inicial del equipo
        </p>
      ) : null}
      <p>{project.description ?? project.summary}</p>
      {isTeam && project.needs?.length ? (
        <div className="mt-4 rounded-2xl border border-[#E8EEF3] bg-[#F8FAFC] px-4 py-3">
          <p className="text-[12px] font-bold uppercase tracking-wide text-[#0B2E59]">
            Necesita
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-[#6B7A8C]">
            {project.needs.join(", ")}.
          </p>
        </div>
      ) : null}
      <p className="mt-4">{COMMUNITY_SEED_INTERIOR_BODY}</p>
    </NeighborhoodActivityDetail>
  );
}

export function TeamProjectCard({ project }: { project: ProyectoListItem }) {
  return (
    <article className="overflow-hidden rounded-[24px] bg-white shadow-[0_4px_16px_rgba(15,42,70,0.08)] ring-1 ring-[#E8EEF3] transition-shadow hover:shadow-[0_8px_24px_rgba(15,42,70,0.12)]">
      <Link href={`/proyectos/${project.id}`} className="vu-focus block">
        <div className="relative h-36 w-full sm:h-40">
          <VuWarmImage
            src={project.image}
            fallbackSrc={project.fallbackImage}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 360px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B2E59]/55 to-transparent" />
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0B2E59]">
            {project.label}
          </span>
        </div>
        <div className="p-4">
          <p className="text-[11px] font-semibold text-[#1A9BB0]">{project.author}</p>
          <h2 className="mt-1 text-[15px] font-bold leading-snug text-[#0B2E59]">{project.title}</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-[#6B7A8C] line-clamp-3">{project.summary}</p>
          <span className="vu-focus mt-4 flex min-h-[44px] items-center justify-center rounded-2xl bg-[#0B2E59] px-4 text-sm font-bold text-white">
            {project.cta ?? "Ver convocatoria"}
          </span>
        </div>
      </Link>
      <div className="border-t border-[#E8EEF3] px-4 pb-4 pt-2">
        <CommunityMicroAction
          kind="project"
          projectId={project.id}
          projectTitle={project.title}
          mode="interest"
          label={project.cta ?? "Me interesa participar"}
          variant="primary"
        />
      </div>
    </article>
  );
}
