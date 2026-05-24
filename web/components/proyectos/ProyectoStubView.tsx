"use client";

import Link from "next/link";
import { CommunityMicroAction } from "@/components/community/CommunityMicroAction";
import { NeighborhoodActivityDetail } from "@/components/neighborhood/NeighborhoodActivityDetail";
import type { ProyectoListItem } from "@/lib/content/proyectosCatalog";
import { COMMUNITY_SEED_BADGE, COMMUNITY_SEED_INTERIOR_BODY } from "@/lib/content/communitySeedCopy";

export function ProyectoStubView({ project }: { project: ProyectoListItem }) {
  return (
    <NeighborhoodActivityDetail
      backHref="/proyectos"
      backLabel="Proyectos"
      image={project.image}
      title={project.title}
      meta={COMMUNITY_SEED_BADGE}
      badge={{ label: project.label, bg: "rgba(198,217,45,0.35)", text: "#0B2E59" }}
      footer={
        <div className="flex w-full max-w-md flex-col gap-2">
          <CommunityMicroAction
            kind="project"
            projectId={project.id}
            projectTitle={project.title}
            mode="interest"
            variant="primary"
            label="Me interesa una idea así"
            registeredLabel="Interés registrado"
          />
          <CommunityMicroAction
            kind="project"
            projectId={project.id}
            projectTitle={project.title}
            mode="observe"
            label="Quiero observar algo parecido"
            registeredLabel="Observación registrada"
          />
          <Link
            href="/proyectos"
            className="vu-focus inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-[#E8EEF3] bg-white px-6 text-sm font-semibold text-[#0B2E59]"
          >
            Ver otros proyectos
          </Link>
        </div>
      }
    >
      <p>{project.summary}</p>
      <p className="mt-4">{COMMUNITY_SEED_INTERIOR_BODY}</p>
    </NeighborhoodActivityDetail>
  );
}
