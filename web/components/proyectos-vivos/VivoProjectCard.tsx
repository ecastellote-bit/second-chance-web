"use client";

import Image from "next/image";
import Link from "next/link";
import {
  PROJECT_STATUS_LABEL,
  type ProjectStatus,
  type VivoProject,
  type VivoProjectRole,
} from "@/lib/projects-vivos/projectTypes";

const STATUS_CLASS: Record<ProjectStatus, string> = {
  buscando_miembros: "bg-[#E8F6EA] text-[#1B5E20]",
  en_curso: "bg-[#E3F2FD] text-[#0B2E59]",
  completado: "bg-[#F1F5F9] text-[#64748B]",
  pausado: "bg-[#FFF7ED] text-[#9A3412]",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex min-h-[32px] items-center rounded-full px-3 text-sm font-semibold ${STATUS_CLASS[status]}`}
    >
      {PROJECT_STATUS_LABEL[status]}
    </span>
  );
}

type CardProps = {
  project: VivoProject;
  openRoles?: VivoProjectRole[];
};

export function VivoProjectCard({ project, openRoles = [] }: CardProps) {
  const rolesLabel = openRoles
    .filter((r) => !r.filled)
    .slice(0, 3)
    .map((r) => r.title)
    .join(" · ");

  return (
    <article className="overflow-hidden rounded-2xl border border-[#E8EEF3] bg-white shadow-[0_4px_16px_rgba(15,42,70,0.06)]">
      <div className="relative aspect-[16/9] w-full bg-[#DFF4F7]">
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-[#1A9BB0]">
            Proyecto vivo
          </div>
        )}
        <div className="absolute left-3 top-3">
          <ProjectStatusBadge status={project.status} />
        </div>
      </div>

      <div className="space-y-3 p-4">
        <h3 className="text-xl font-semibold text-[#0B2E59]">{project.title}</h3>
        <p className="line-clamp-2 text-base leading-relaxed text-[#6B7A8C]">
          {project.description}
        </p>

        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-[#1A9BB0]">
            {project.creatorImage ? (
              <Image
                src={project.creatorImage}
                alt=""
                fill
                className="object-cover"
                sizes="32px"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                {project.creatorName.slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          <p className="truncate text-sm text-[#243647]">{project.creatorName}</p>
        </div>

        {rolesLabel ? (
          <p className="text-sm text-[#1A9BB0]">
            Busca: {rolesLabel}
          </p>
        ) : null}

        <Link
          href={`/proyectos/vivos/${project.slug}`}
          className="vu-focus inline-flex min-h-[48px] w-full items-center justify-center rounded-[10px] bg-[#0B2E59] px-4 text-base font-semibold text-white"
        >
          Ver proyecto
        </Link>
      </div>
    </article>
  );
}
