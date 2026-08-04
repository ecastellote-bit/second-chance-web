"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { resolveActivityCta } from "@/lib/community/activityCta";
import { fetchCommunityActivities } from "@/lib/community/communityClient";
import type { CommunityActivityItem } from "@/lib/community/types";
import { ALIVE_LINKS } from "@/lib/content/aliveLinks";
import { getFoundationalCohortBatch } from "@/lib/learning/foundationalCohort";
import type { FounderProjectSeed } from "@/lib/learning/founderProjectSeeds";
import { getCachedUserId } from "@/lib/users/activeUserSession";

type Props = {
  /** Versión más baja para panel bajo el mapa (plaza inicial). */
  compact?: boolean;
};

export function PlazaLivingPanel({ compact = false }: Props = {}) {
  const [activities, setActivities] = useState<CommunityActivityItem[]>([]);
  const [mySeeds, setMySeeds] = useState<FounderProjectSeed[]>([]);
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const userId = getCachedUserId();
    setHasSession(Boolean(userId));

    async function load() {
      if (!userId) {
        if (!cancelled) setReady(true);
        return;
      }

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

  const cardPad = compact ? "px-3 py-2.5" : "px-4 py-3";
  const sectionGap = compact ? "space-y-2" : "space-y-3";

  return (
    <section className={`mb-2 ${sectionGap}`}>
      <div className={`rounded-xl border border-[#1A9BB0]/25 bg-[#E6F6FA] ${cardPad}`}>
        <p className="text-[10px] font-bold uppercase tracking-wide text-[#0B2E59]">
          Centro del barrio
        </p>
        <p className={`mt-0.5 text-[12px] leading-relaxed text-[#243647] ${compact ? "line-clamp-2" : ""}`}>
          Acá orientamos tus próximos pasos — no es un feed de novedades.
        </p>
      </div>

      {hasSeeded ? (
        <div className={`rounded-xl border border-[#C6D92D]/45 bg-[#F4F9E0] ${cardPad}`}>
          <p className="text-sm font-semibold text-[#0B2E59]">Tu proyecto ya quedó sembrado</p>
          <p className="mt-1 text-[13px] leading-relaxed text-[#243647]">
            Podés revisar su estado o mirar espacios relacionados. La revisión de la ola
            fundadora es cuidada — no hay publicación automática inmediata.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {mySeeds[0] ? (
              <Link
                href={`/proyectos/semilla/${mySeeds[0]!.seedId}`}
                className="vu-focus rounded-xl bg-[#0B2E59] px-3 py-2 text-xs font-semibold text-white"
              >
                Ver mi semilla
              </Link>
            ) : (
              <Link
                href={ALIVE_LINKS.actividad.href}
                className="vu-focus rounded-xl bg-[#0B2E59] px-3 py-2 text-xs font-semibold text-white"
              >
                {ALIVE_LINKS.actividad.label}
              </Link>
            )}
            <Link
              href={ALIVE_LINKS.proyectos.href}
              className="vu-focus rounded-xl border border-[#0B2E59]/20 px-3 py-2 text-xs font-semibold text-[#0B2E59]"
            >
              {ALIVE_LINKS.proyectos.label}
            </Link>
          </div>
        </div>
      ) : null}

      {latest ? (
        <div className={`rounded-xl border border-[#E8EEF3] bg-white shadow-sm ${cardPad}`}>
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
        <div className={`rounded-xl border border-[#E8EEF3] bg-white ${cardPad}`}>
          <p className="text-sm font-semibold text-[#0B2E59]">
            {hasSession ? "Todavía no hay movimientos" : "Explorá el barrio sin apuro"}
          </p>
          <p className="mt-1 text-[12px] text-[#6B7A8C]">
            {hasSession
              ? "Elegí un camino, dejá una señal o publicá en la comunidad — y lo vas a ver acá."
              : "Podés mirar mesas y el directorio. Cuando retomes o crees tu perfil, se activan actividad y mensajes."}
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link
              href={ALIVE_LINKS.activacion.href}
              className="vu-focus inline-flex text-xs font-semibold text-[#1A9BB0] underline"
            >
              {ALIVE_LINKS.activacion.label}
            </Link>
            <Link
              href={ALIVE_LINKS.barrio.href}
              className="vu-focus inline-flex text-xs font-semibold text-[#1A9BB0] underline"
            >
              {ALIVE_LINKS.barrio.label}
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        <Link
          href={ALIVE_LINKS.actividad.href}
          className="vu-focus rounded-xl border border-[#E8EEF3] bg-white px-2 py-2.5 text-[11px] font-semibold text-[#0B2E59]"
        >
          Actividad
        </Link>
        <Link
          href={ALIVE_LINKS.mensajes.href}
          className="vu-focus rounded-xl border border-[#E8EEF3] bg-white px-2 py-2.5 text-[11px] font-semibold text-[#0B2E59]"
        >
          Mensajes
        </Link>
        <Link
          href={ALIVE_LINKS.comunidad.href}
          className="vu-focus rounded-xl border border-[#E8EEF3] bg-white px-2 py-2.5 text-[11px] font-semibold text-[#0B2E59]"
        >
          Comunidad
        </Link>
        <Link
          href={ALIVE_LINKS.connect.href}
          className="vu-focus rounded-xl border border-[#E8EEF3] bg-white px-2 py-2.5 text-[11px] font-semibold text-[#0B2E59]"
        >
          Connect
        </Link>
      </div>
    </section>
  );
}
