"use client";

import Link from "next/link";
import { CommunityAdminPostsBlock } from "@/components/community/CommunityAdminPostsBlock";
import { PublicInitialsAvatar } from "@/components/community/PublicInitialsAvatar";
import { ReportContentButton } from "@/components/community/ReportContentButton";
import { VuWarmImage } from "@/components/ui/VuWarmImage";
import { FounderProjectGuidedContributionsPanel } from "@/components/proyectos/FounderProjectGuidedContributionsPanel";
import { FounderProjectSignalsPanel } from "@/components/proyectos/FounderProjectSignalsPanel";
import { ProjectCover } from "@/components/proyectos/ProjectCover";
import { ProjectVoicesBlock } from "@/components/proyectos/ProjectVoicesBlock";
import { PROJECT_WORLDS } from "@/lib/content/projectWorldsCopy";
import {
  founderSeedStatusHint,
  founderSeedStatusLabel,
} from "@/lib/public/founderSeedStatusLabel";
import { resolveProjectCoverSrc } from "@/lib/public/projectSeedMedia";

export type FounderSeedPublicViewModel = {
  seedId: string;
  title: string;
  summary: string;
  status: "published" | "pending_review" | "hidden";
  publicAuthor?: { publicName: string; initials: string };
  coverImageUrl?: string | null;
  coverSrc?: string;
  galleryImageUrls?: string[];
  videoUrl?: string | null;
  videoPosterUrl?: string | null;
};

type Props = {
  seed: FounderSeedPublicViewModel;
};

export function FounderSeedPublicView({ seed }: Props) {
  const isPublished = seed.status === "published";
  const authorName = seed.publicAuthor?.publicName?.trim() || "Integrante fundador";
  const authorInitials = seed.publicAuthor?.initials?.trim() || "IF";
  const coverSrc =
    seed.coverSrc ?? resolveProjectCoverSrc(seed.seedId, seed.coverImageUrl ?? null);
  const gallery = seed.galleryImageUrls ?? [];
  const showVideo = Boolean(seed.videoUrl?.trim() && seed.videoPosterUrl?.trim());
  const worlds = PROJECT_WORLDS.seed;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#F8FAFC] font-[family-name:var(--font-inter)]">
      <ProjectCover src={coverSrc} variant="hero" priority />

      <div className="relative z-10 -mt-6 flex flex-1 flex-col rounded-t-[28px] bg-[#F8FAFC] shadow-[0_-8px_32px_rgba(11,46,89,0.12)]">
        <div className="mx-auto w-full max-w-lg flex-1 px-5 pb-24 pt-6">
          <Link href="/proyectos" className="text-[12px] font-semibold text-[#1A9BB0] underline">
            ← Proyectos del barrio
          </Link>

          <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-[#C6D92D]">
            {isPublished ? worlds.detailEyebrowPublished : worlds.detailEyebrowOwn}
          </p>

          <div className="mt-4 flex items-center gap-3">
            <PublicInitialsAvatar initials={authorInitials} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#0B2E59]">{authorName}</p>
              <p className="text-[12px] text-[#6B7A8C]">Autor del proyecto</p>
            </div>
          </div>

          <h1 className="mt-3 text-2xl font-bold leading-tight text-[#0B2E59]">{seed.title}</h1>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#E6F6FA] px-3 py-1 text-[11px] font-bold text-[#0B2E59]">
              {founderSeedStatusLabel(seed.status)}
            </span>
            {isPublished ? (
              <span className="rounded-full bg-[#F4F9E0] px-3 py-1 text-[11px] font-bold text-[#0B2E59]">
                Mesa abierta a señales
              </span>
            ) : null}
          </div>

          <p className="mt-4 text-[15px] leading-relaxed text-[#243647] whitespace-pre-wrap">
            {seed.summary}
          </p>

          <p className="mt-4 rounded-2xl border border-[#E8EEF3] bg-white px-4 py-3 text-[13px] leading-relaxed text-[#6B7A8C]">
            {founderSeedStatusHint(seed.status)}
          </p>

          <p className="mt-3 rounded-2xl border border-[#1A9BB0]/25 bg-[#E8F7FA] px-4 py-3 text-[13px] leading-relaxed text-[#0B2E59]">
            {worlds.detailHint}
          </p>

          <Link
            href="/proyectos/vivos"
            className="vu-focus mt-4 flex min-h-[48px] items-center justify-between gap-3 rounded-2xl border border-[#1A9BB0]/35 bg-white px-4 py-3 text-[#0B2E59]"
          >
            <span className="min-w-0 text-left">
              <span className="block text-[13px] font-bold">{worlds.bridgeToVivosTitle}</span>
              <span className="mt-0.5 block text-[12px] leading-snug text-[#6B7A8C]">
                {worlds.bridgeToVivosBody}
              </span>
            </span>
            <span className="shrink-0 text-[12px] font-bold text-[#1A9BB0]">
              {worlds.bridgeToVivosCta} →
            </span>
          </Link>

          {gallery.length > 0 ? (
            <section className="mt-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
                Imágenes del proyecto
              </p>
              <ul className="mt-3 grid grid-cols-3 gap-2">
                {gallery.map((src) => (
                  <li
                    key={src}
                    className="relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-[#E8EEF3]"
                  >
                    <VuWarmImage src={src} alt="" fill className="object-cover" sizes="120px" />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {showVideo ? (
            <section className="mt-6 overflow-hidden rounded-2xl ring-1 ring-[#E8EEF3]">
              <div className="relative aspect-video w-full bg-[#0B2E59]">
                <VuWarmImage
                  src={seed.videoPosterUrl!}
                  alt=""
                  fill
                  className="object-cover opacity-90"
                  sizes="100vw"
                />
              </div>
              <a
                href={seed.videoUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="vu-focus block bg-white px-4 py-3 text-center text-sm font-semibold text-[#1A9BB0] underline"
              >
                Ver video del proyecto (enlace externo)
              </a>
            </section>
          ) : null}

          {isPublished ? (
            <>
              <ProjectVoicesBlock projectId={seed.seedId} className="mt-6" />

              <CommunityAdminPostsBlock
                targetType="founder_project"
                targetId={seed.seedId}
                title="Lo que el barrio va contando de este proyecto"
                emptyMessage="Todavía no hay movimientos editoriales publicados acá. Podés dejar una señal o un aporte para que el equipo lo revise."
                className="mt-6"
              />

              <FounderProjectSignalsPanel projectId={seed.seedId} projectTitle={seed.title} />

              <FounderProjectGuidedContributionsPanel
                projectId={seed.seedId}
                projectTitle={seed.title}
                hideVisibleList
              />

              <ReportContentButton
                targetType="founder_project"
                targetId={seed.seedId}
                className="mt-4"
              />
            </>
          ) : null}

          <div className="mt-8 flex flex-col gap-2">
            <Link
              href="/proyectos/vivos"
              className="vu-focus flex min-h-[48px] items-center justify-center rounded-2xl bg-[#0B2E59] text-sm font-bold text-white"
            >
              Explorar Proyectos vivos
            </Link>
            <Link
              href="/proyectos"
              className="vu-focus flex min-h-[48px] items-center justify-center rounded-2xl border border-[#E8EEF3] bg-white text-sm font-semibold text-[#0B2E59]"
            >
              Ver más semillas del barrio
            </Link>
            <Link
              href="/barrio"
              className="vu-focus flex min-h-[48px] items-center justify-center rounded-2xl border border-transparent text-sm font-semibold text-[#1A9BB0] underline"
            >
              Volver al barrio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
