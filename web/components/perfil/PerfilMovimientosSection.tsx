"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PerfilSection } from "@/components/perfil/PerfilSection";
import { fetchCommunityActivities } from "@/lib/community/communityClient";
import type { CommunityActivityItem } from "@/lib/community/types";
import { CIRCULOS_CATALOG } from "@/lib/content/circulosCatalog";
import type { VuUserProfileRecord } from "@/lib/users/userProfileTypes";

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "Reciente";
  }
}

function buildNextStep(
  activities: CommunityActivityItem[],
  hasDiagnostic: boolean,
): { title: string; description: string; cta: string; href: string } {
  const hasActivation = activities.some((a) => a.type === "activation_selected");
  const hasSeed = activities.some((a) => a.type === "project_seeded");
  const hasCircle = activities.some((a) => a.type === "circle_saved");

  if (!hasActivation) {
    return {
      title: "Elegí cómo empezar",
      description:
        "La activación ordena tu primer movimiento en el barrio: proyecto, círculo, formación u observación.",
      cta: "Ir a activación",
      href: "/activacion",
    };
  }

  if (!hasSeed) {
    return {
      title: "Sembrá un proyecto",
      description:
        "Si tenés una idea concreta, podés dejarla como semilla de la ola fundadora.",
      cta: "Sembrar proyecto",
      href: "/proyectos/sembrar",
    };
  }

  if (!hasCircle) {
    return {
      title: "Explorá círculos",
      description:
        "Marcá interés en un espacio semilla para volver cuando quieras.",
      cta: "Ver círculos",
      href: "/circulos",
    };
  }

  if (!hasDiagnostic) {
    return {
      title: "Completá tu lectura",
      description: "El diagnóstico ayuda a orientar temáticas y tu plaza.",
      cta: "Invitación fundadora",
      href: "/fundador",
    };
  }

  return {
    title: "Seguí en la plaza",
    description: "Tu barrio ya tiene movimientos. Revisá actividad o volvé a la plaza.",
    cta: "Ir a la plaza",
    href: "/plaza",
  };
}

export function PerfilMovimientosSection({
  profileRecord,
}: {
  profileRecord: VuUserProfileRecord;
}) {
  const [activities, setActivities] = useState<CommunityActivityItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void fetchCommunityActivities().then((items) => {
      setActivities(items);
      setReady(true);
    });
  }, []);

  const circleById = useMemo(
    () => Object.fromEntries(CIRCULOS_CATALOG.map((c) => [c.id, c])),
    [],
  );

  const savedCircles = useMemo(() => {
    const ids = new Set<string>();
    const rows: { id: string; title: string; href: string }[] = [];

    for (const activity of activities) {
      if (activity.type !== "circle_saved") continue;
      const id =
        activity.meta?.circleId ??
        activity.ctaHref?.match(/^\/circulos\/([^/?#]+)/)?.[1];
      if (!id || ids.has(id)) continue;
      ids.add(id);
      const catalog = circleById[id];
      rows.push({
        id,
        title: catalog?.title ?? activity.title,
        href: `/circulos/${encodeURIComponent(id)}`,
      });
    }
    return rows;
  }, [activities, circleById]);

  const seededProjects = useMemo(
    () =>
      activities
        .filter((a) => a.type === "project_seeded")
        .map((a) => ({
          id: a.meta?.seedId ?? a.dedupeKey?.replace("project_seeded:", "") ?? a.id,
          title:
            (a.meta?.title ?? a.title.replace("Sembraste un proyecto", "").trim()) ||
            "Tu proyecto",
          href: a.ctaHref ?? "/proyectos",
          when: formatWhen(a.createdAt),
        })),
    [activities],
  );

  const hitos = useMemo(
    () =>
      [...activities]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 8)
        .map((a) => ({
          id: a.id,
          title: a.title,
          when: formatWhen(a.createdAt),
        })),
    [activities],
  );

  const nextStep = buildNextStep(
    activities,
    Boolean(profileRecord.diagnosticArchiveId),
  );

  const hasAnyMovement = activities.length > 0;

  return (
    <>
      {savedCircles.length > 0 ? (
        <PerfilSection title="Círculos que marcaste" hint="Según tu actividad en el barrio">
          <ul className="space-y-2">
            {savedCircles.map((c) => (
              <li key={c.id}>
                <Link
                  href={c.href}
                  className="vu-focus flex min-h-[48px] items-center justify-between gap-3 rounded-2xl bg-[#F8FAFC] px-3 py-2.5 ring-1 ring-[#E8EEF3] hover:bg-[#E6F6FA]"
                >
                  <span className="text-sm font-semibold text-[#0B2E59]">{c.title}</span>
                  <span className="text-[11px] text-[#6B7A8C]">Espacio semilla</span>
                </Link>
              </li>
            ))}
          </ul>
        </PerfilSection>
      ) : null}

      {seededProjects.length > 0 ? (
        <PerfilSection title="Proyectos sembrados">
          <ul className="space-y-2">
            {seededProjects.map((p) => (
              <li key={p.id}>
                <Link
                  href={p.href}
                  className="vu-focus block rounded-2xl bg-[#F4F9E0] px-3 py-3 ring-1 ring-[#C6D92D]/40 hover:bg-[#eef5d0]"
                >
                  <p className="text-sm font-semibold text-[#0B2E59]">{p.title}</p>
                  <p className="mt-0.5 text-xs text-[#6B7A8C]">{p.when} · ver estado</p>
                </Link>
              </li>
            ))}
          </ul>
        </PerfilSection>
      ) : null}

      <PerfilSection title="Próximo movimiento">
        <div className="rounded-2xl bg-gradient-to-br from-[#0B2E59] to-[#1A9BB0] p-4 text-white">
          <p className="text-sm font-bold">{nextStep.title}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-white/90">
            {nextStep.description}
          </p>
          <Link
            href={nextStep.href}
            className="vu-focus mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#C6D92D] px-5 text-sm font-bold text-[#0B2E59]"
          >
            {nextStep.cta}
          </Link>
        </div>
      </PerfilSection>

      {ready && hitos.length > 0 ? (
        <PerfilSection title="Tus movimientos" hint="Registrados en Actividad">
          <ol className="relative space-y-4 border-l-2 border-[#1A9BB0]/30 pl-4">
            {hitos.map((h) => (
              <li key={h.id} className="relative">
                <span
                  className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#C6D92D] ring-2 ring-white"
                  aria-hidden
                />
                <p className="text-sm font-semibold text-[#0B2E59]">{h.title}</p>
                <p className="text-xs text-[#6B7A8C]">{h.when}</p>
              </li>
            ))}
          </ol>
          <Link
            href="/actividad"
            className="vu-focus mt-4 inline-block text-[13px] font-semibold text-[#1A9BB0] underline"
          >
            Ver toda mi actividad
          </Link>
        </PerfilSection>
      ) : ready && !hasAnyMovement ? (
        <PerfilSection title="Todavía sin movimientos">
          <p className="text-[14px] leading-relaxed text-[#6B7A8C]">
            Cuando guardes interés, elijas activación o sembres un proyecto, lo vas a ver acá y en
            Actividad.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/activacion"
              className="vu-focus flex min-h-[44px] items-center justify-center rounded-xl bg-[#0B2E59] text-sm font-semibold text-white"
            >
              Empezar por una activación
            </Link>
            <Link
              href="/plaza"
              className="vu-focus flex min-h-[44px] items-center justify-center rounded-xl border border-[#1A9BB0]/30 text-sm font-semibold text-[#1A9BB0]"
            >
              Explorar la plaza
            </Link>
          </div>
        </PerfilSection>
      ) : null}
    </>
  );
}
