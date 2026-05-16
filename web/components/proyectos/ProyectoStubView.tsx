"use client";

import Link from "next/link";
import { NeighborhoodActivityDetail } from "@/components/neighborhood/NeighborhoodActivityDetail";
import type { ProyectoListItem } from "@/lib/content/proyectosCatalog";

export function ProyectoStubView({ project }: { project: ProyectoListItem }) {
  return (
    <NeighborhoodActivityDetail
      backHref="/proyectos"
      backLabel="Proyectos"
      image={project.image}
      title={project.title}
      meta={`${project.participants} personas sumadas`}
      badge={{ label: project.label, bg: "rgba(198,217,45,0.35)", text: "#0B2E59" }}
      footer={
        <>
          <Link
            href="/proyectos/manos-que-transforman"
            className="vu-focus inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-[#C6D92D] px-6 text-sm font-bold text-[#0B2E59]"
          >
            Me interesa sumarme
          </Link>
          <Link
            href="/proyectos"
            className="vu-focus inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-[#E8EEF3] bg-white px-6 text-sm font-semibold text-[#0B2E59]"
          >
            Ver otros proyectos
          </Link>
        </>
      }
    >
      <p>{project.summary}</p>
      <p className="mt-4">
        Este proyecto se abre en la próxima etapa del MVP humano. Por ahora podés sumarte al taller
        vecinal destacado.
      </p>
    </NeighborhoodActivityDetail>
  );
}
