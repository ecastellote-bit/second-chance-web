"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CirculosLeftNav } from "@/components/circulos/CirculosLeftNav";
import { VuBottomNav } from "@/components/layout/VuMobileShell";
import { VuWarmImage } from "@/components/ui/VuWarmImage";
import { FoundingMemberBadge } from "@/components/founder/FoundingMemberBadge";
import { isFounderCommunityPreviewActive } from "@/lib/founder/communityPreviewBypass";
import { ensureFoundingMemberAccess } from "@/lib/learning/ensureFoundingMemberAccess";
import { isFoundingMemberQualified } from "@/lib/learning/foundationalMember";
import { PublicCommunityRecentActivity } from "@/components/community/PublicCommunityRecentActivity";
import { PublicInitialsAvatar } from "@/components/community/PublicInitialsAvatar";
import { MyFounderSeedBanner } from "@/components/proyectos/MyFounderSeedBanner";
import { ProjectCover } from "@/components/proyectos/ProjectCover";
import { CommunityMicroAction } from "@/components/community/CommunityMicroAction";
import { resolveProjectCoverSrc } from "@/lib/public/projectSeedMedia";
import { PROYECTOS_CATALOG, PROYECTOS_HEADER } from "@/lib/content/proyectosCatalog";

type PublicSeedListItem = {
  seedId: string;
  title: string;
  summary: string;
  createdAt: string;
  status: "published";
  publishedAt: string | null;
  statusUpdatedAt: string | null;
  publicAuthor?: { publicName: string; initials: string };
  coverImageUrl?: string | null;
  coverSrc?: string;
};

function formatPublishedHint(seed: PublicSeedListItem): string {
  const iso = seed.publishedAt ?? seed.statusUpdatedAt ?? seed.createdAt;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Publicado hace poco";
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 2) return "Aprobado recientemente";
  if (days <= 10) return "Publicado hace poco";
  return `Publicado ${date.toLocaleDateString("es-AR", { day: "numeric", month: "short" })}`;
}

export function ProyectosListView() {
  const [canSembrar, setCanSembrar] = useState(false);
  const [publishedSeeds, setPublishedSeeds] = useState<PublicSeedListItem[]>([]);
  const [loadingSeeds, setLoadingSeeds] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (isFounderCommunityPreviewActive()) {
        if (!cancelled) setCanSembrar(true);
        return;
      }
      const ok =
        isFoundingMemberQualified() || (await ensureFoundingMemberAccess());
      if (!cancelled) setCanSembrar(ok);
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingSeeds(true);

    fetch(`/api/founder-projects?visibility=public&limit=200`)
      .then((r) => r.json())
      .then((data: { seeds?: PublicSeedListItem[] }) => {
        if (cancelled) return;
        setPublishedSeeds(Array.isArray(data.seeds) ? data.seeds : []);
      })
      .catch(() => {
        if (!cancelled) setPublishedSeeds([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSeeds(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col font-[family-name:var(--font-inter)] bg-[#F8FAFC] text-[#243647] lg:flex-row">
      <CirculosLeftNav activeId="proyectos" />

      <div className="flex min-h-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-[#E8EEF3] bg-[#F8FAFC] px-4 py-4 lg:hidden">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
            <Link
              href="/plaza"
              className="vu-focus flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#0B2E59]"
              aria-label="Volver a la plaza"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>
            <p className="text-sm font-bold text-[#0B2E59]">Proyectos</p>
            <span className="w-11" aria-hidden />
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 py-5 pb-8 lg:max-w-4xl lg:px-8 lg:py-8">
            <div className="mb-6 max-w-2xl">
              <p className="mb-1 hidden text-xs font-semibold uppercase tracking-wider text-[#1A9BB0] lg:block">
                Mesa del barrio
              </p>
              <h1 className="text-[1.65rem] font-bold tracking-tight text-[#0B2E59] lg:text-[1.85rem]">
                {PROYECTOS_HEADER.title}
              </h1>
              <p className="mt-2 text-[15px] leading-relaxed text-[#6B7A8C]">
                {PROYECTOS_HEADER.subtitle}
              </p>
            </div>

            <FoundingMemberBadge />

            <MyFounderSeedBanner />

            <PublicCommunityRecentActivity className="mb-6" limit={6} surface="projects" />

            <section className="mb-6 rounded-[28px] bg-white p-5 shadow-[0_4px_16px_rgba(15,42,70,0.06)] ring-1 ring-[#E8EEF3]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
                    Proyectos publicados
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#6B7A8C]">
                    Estos proyectos fueron presentados por integrantes y revisados antes de aparecer
                    públicamente. Mostrar interés no implica compromiso ni contacto directo automático.
                  </p>
                </div>
                <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-[22px] bg-[#F8FAFC] sm:h-24 sm:w-44">
                  <VuWarmImage
                    src="/vu/proyecto-manos-transforman.png"
                    alt=""
                    fill
                    className="object-cover"
                    sizes="176px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/40 to-transparent" />
                </div>
              </div>

              {loadingSeeds ? (
                <p className="mt-4 text-sm text-[#6B7A8C]">Cargando proyectos del barrio…</p>
              ) : publishedSeeds.length === 0 ? (
                <div className="mt-4 rounded-[24px] border border-[#E8EEF3] bg-[#F8FAFC] p-5">
                  <p className="text-sm font-semibold text-[#0B2E59]">
                    Todavía no hay proyectos publicados.
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#6B7A8C]">
                    El equipo está revisando las primeras semillas. Podés volver más tarde o sembrar tu
                    proyecto si sos fundador.
                  </p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Link
                      href={canSembrar ? "/proyectos/sembrar" : "/fundador"}
                      className="vu-focus flex min-h-[48px] items-center justify-center rounded-2xl bg-[#0B2E59] px-4 text-sm font-bold text-white"
                    >
                      {canSembrar ? "Sembrar un proyecto" : "Ser fundador y sembrar"}
                    </Link>
                    <Link
                      href="/plaza"
                      className="vu-focus flex min-h-[48px] items-center justify-center rounded-2xl border border-[#1A9BB0]/40 bg-white px-4 text-sm font-semibold text-[#0B2E59]"
                    >
                      Volver a la plaza
                    </Link>
                  </div>
                </div>
              ) : (
                <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {publishedSeeds.map((seed) => {
                    const initials = seed.publicAuthor?.initials?.trim() || "IF";
                    const author = seed.publicAuthor?.publicName?.trim() || "Integrante fundador";
                    const coverSrc =
                      seed.coverSrc ??
                      resolveProjectCoverSrc(seed.seedId, seed.coverImageUrl ?? null);
                    return (
                      <li key={seed.seedId}>
                        <article className="overflow-hidden rounded-[24px] bg-white shadow-[0_4px_16px_rgba(15,42,70,0.08)] ring-1 ring-[#E8EEF3] transition-shadow hover:shadow-[0_8px_24px_rgba(15,42,70,0.12)]">
                          <Link
                            href={`/proyectos/semilla/${encodeURIComponent(seed.seedId)}`}
                            className="vu-focus block"
                          >
                            <ProjectCover src={coverSrc} variant="card" />
                            <div className="p-4">
                              <div className="flex flex-wrap gap-2">
                                <span className="rounded-full bg-[#E6F6FA] px-2.5 py-1 text-[10px] font-bold text-[#0B2E59]">
                                  Publicado
                                </span>
                                <span className="rounded-full bg-[#F4F9E0] px-2.5 py-1 text-[10px] font-bold text-[#0B2E59]">
                                  Ola fundadora
                                </span>
                              </div>
                              <div className="mt-3 flex items-start gap-3">
                                <PublicInitialsAvatar initials={initials} />
                                <div className="min-w-0 flex-1">
                                  <p className="text-[13px] font-bold text-[#0B2E59]">{author}</p>
                                  <p className="text-[11px] font-semibold text-[#6B7A8C]">
                                    {formatPublishedHint(seed)}
                                  </p>
                                </div>
                              </div>
                              <h2 className="mt-3 text-[15px] font-bold leading-snug text-[#0B2E59]">
                                {seed.title}
                              </h2>
                              <p className="mt-1 text-[13px] leading-relaxed text-[#6B7A8C] line-clamp-3">
                                {seed.summary}
                              </p>
                              <span className="vu-focus mt-4 flex min-h-[44px] items-center justify-center rounded-2xl bg-[#0B2E59] px-4 text-sm font-bold text-white">
                                Ver proyecto
                              </span>
                            </div>
                          </Link>
                          <div className="border-t border-[#E8EEF3] px-4 pb-4 pt-2">
                            <CommunityMicroAction
                              kind="project"
                              projectId={seed.seedId}
                              projectTitle={seed.title}
                              mode="interest"
                              label="Me interesa una idea así"
                              variant="primary"
                            />
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <Link
              href={canSembrar ? "/proyectos/sembrar" : "/fundador"}
              className="vu-focus mb-3 flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#0B2E59] px-4 text-sm font-bold text-white shadow-[0_4px_16px_rgba(15,42,70,0.12)]"
            >
              {canSembrar ? "Sembrar mi proyecto (fundador)" : "Ser fundador y sembrar"}
            </Link>

            <Link
              href="/proyectos/manos-que-transforman"
              className="vu-focus mb-6 flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-[#0B2E59]/20 px-4 text-sm font-semibold text-[#0B2E59]"
            >
              Ver proyecto destacado del barrio
            </Link>

            <section className="mt-6">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7A8C]">
                Ejemplos (ilustraciones del barrio)
              </p>
              <div className="space-y-4">
                {PROYECTOS_CATALOG.map((p) => (
                  <Link
                    key={p.id}
                    href={`/proyectos/${p.id}`}
                    className="vu-focus flex overflow-hidden rounded-[24px] bg-white shadow-[0_4px_16px_rgba(15,42,70,0.08)] ring-1 ring-[#E8EEF3] transition-shadow hover:shadow-[0_8px_24px_rgba(15,42,70,0.12)]"
                  >
                    <div className="relative h-28 w-28 shrink-0 sm:h-32 sm:w-36">
                      <VuWarmImage src={p.image} alt="" fill className="object-cover" sizes="144px" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-4">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-[#1A9BB0]">
                        {p.label}
                      </span>
                      <h2 className="text-sm font-bold leading-snug text-[#0B2E59]">{p.title}</h2>
                      <p className="text-xs leading-relaxed text-[#6B7A8C] line-clamp-2">{p.summary}</p>
                      <p className="mt-1 text-[11px] font-medium text-[#6B7A8C]">
                        Espacio semilla · explorar ejemplo →
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </main>

        <VuBottomNav active="plaza" />
      </div>
    </div>
  );
}
