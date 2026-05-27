"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { resolveActivityCta } from "@/lib/community/activityCta";
import { fetchCommunityActivities } from "@/lib/community/communityClient";
import type { CommunityActivityItem } from "@/lib/community/types";
import { getFoundationalCohortBatch } from "@/lib/learning/foundationalCohort";
import type { FounderProjectSeed } from "@/lib/learning/founderProjectSeeds";
import { getOrCreateUserId } from "@/lib/users/activeUserSession";

export function PlazaLivingPanel() {
  const [activities, setActivities] = useState<CommunityActivityItem[]>([]);
  const [mySeeds, setMySeeds] = useState<FounderProjectSeed[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const userId = getOrCreateUserId();

    async function load() {
      const [acts, seedsRes] = await Promise.all([
        fetchCommunityActivities(),
        fetch(
          `/api/founder-projects?cohortBatch=${encodeURIComponent(getFoundationalCohortBatch())}&userId=${encodeURIComponent(userId)}`,
        )
          .then((r) => r.json())
          .catch(() => ({ seeds: [] as FounderProjectSeed[] })),
      ]);

      if (cancelled) return;

      setActivities(acts);
      const seeds = (seedsRes as { seeds?: FounderProjectSeed[] }).seeds ?? [];
      setMySeeds(seeds.filter((s) => s.userId === userId));
      setReady(true);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const latest = activities[0];
  const latestCta = latest ? resolveActivityCta(latest) : null;
  const hasSeeded = useMemo(
    () =>
      mySeeds.length > 0 ||
      activities.some((a) => a.type === "project_seeded"),
    [activities, mySeeds],
  );

  if (!ready) return null;

  return (
    <section className="mb-4 space-y-3">
      <div className="rounded-2xl border border-[#1A9BB0]/25 bg-[#E6F6FA] px-4 py-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#0B2E59]">
          Centro del barrio
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-[#243647]">
          Acá orientamos tus próximos pasos según lo que ya hiciste — no es un feed de novedades.
        </p>
      </div>

      {hasSeeded ? (
        <div className="rounded-2xl border border-[#C6D92D]/45 bg-[#F4F9E0] px-4 py-3">
          <p className="text-sm font-semibold text-[#0B2E59]">Tu proyecto ya quedó sembrado</p>
          <p className="mt-1 text-[13px] leading-relaxed text-[#243647]">
            Podés revisar su estado en Actividad o mirar espacios relacionados. La revisión de la
            ola fundadora es cuidada — no hay publicación automática inmediata.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/actividad"
              className="vu-focus rounded-xl bg-[#0B2E59] px-3 py-2 text-xs font-semibold text-white"
            >
              Ver actividad
            </Link>
            {mySeeds[0] ? (
              <Link
                href={`/proyectos/semilla/${mySeeds[0]!.seedId}`}
                className="vu-focus rounded-xl border border-[#0B2E59]/20 px-3 py-2 text-xs font-semibold text-[#0B2E59]"
              >
                Ver mi semilla
              </Link>
            ) : (
              <Link
                href="/proyectos"
                className="vu-focus rounded-xl border border-[#0B2E59]/20 px-3 py-2 text-xs font-semibold text-[#0B2E59]"
              >
                Ver proyectos
              </Link>
            )}
          </div>
        </div>
      ) : null}

      {latest ? (
        <div className="rounded-2xl border border-[#E8EEF3] bg-white px-4 py-3 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#6B7A8C]">
            Último movimiento
          </p>
          <p className="mt-1 text-sm font-semibold text-[#0B2E59]">{latest.title}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-[#6B7A8C] line-clamp-2">
            {latest.body}
          </p>
          {latestCta ? (
            <Link
              href={latestCta.href}
              className="vu-focus mt-2 inline-flex text-xs font-semibold text-[#1A9BB0] underline"
            >
              {latestCta.label}
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#E8EEF3] bg-white px-4 py-3">
          <p className="text-sm font-semibold text-[#0B2E59]">Todavía no hay movimientos</p>
          <p className="mt-1 text-[12px] text-[#6B7A8C]">
            Elegí un camino en activación, sembrá un proyecto o marcá interés en un espacio.
          </p>
          <Link
            href="/activacion"
            className="vu-focus mt-2 inline-flex text-xs font-semibold text-[#1A9BB0] underline"
          >
            Elegir cómo empezar
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-center">
        <Link
          href="/actividad"
          className="vu-focus rounded-xl border border-[#E8EEF3] bg-white px-2 py-2.5 text-[11px] font-semibold text-[#0B2E59]"
        >
          Actividad
        </Link>
        <Link
          href="/mensajes"
          className="vu-focus rounded-xl border border-[#E8EEF3] bg-white px-2 py-2.5 text-[11px] font-semibold text-[#0B2E59]"
        >
          Mensajes
        </Link>
      </div>
    </section>
  );
}
