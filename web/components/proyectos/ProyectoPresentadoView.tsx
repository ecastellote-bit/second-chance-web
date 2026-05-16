"use client";

import { VuWarmImage } from "@/components/ui/VuWarmImage";
import Link from "next/link";
import { useState } from "react";
import { VuBottomNav } from "@/components/layout/VuMobileShell";
import type { PresentedProject } from "@/lib/content/proyectoPresentadoCatalog";

function ModalityIcon({ modality }: { modality: PresentedProject["modality"] }) {
  const cls = "h-4 w-4";
  if (modality === "online") {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="14" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </svg>
    );
  }
  if (modality === "hibrido") {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8M12 8v8" />
      </svg>
    );
  }
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2C8 6 4 8 4 13a8 8 0 1016 0c0-5-4-7-8-11z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function CommentBubble({
  author,
  body,
  initials,
  accent,
}: {
  author: string;
  body: string;
  initials: string;
  accent: string;
}) {
  return (
    <article className="flex gap-3">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ backgroundColor: accent }}
        aria-hidden
      >
        {initials}
      </span>
      <div className="min-w-0 flex-1 rounded-[20px] rounded-tl-md bg-white/95 px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <p className="text-sm font-bold text-[#0B2E59]">{author}</p>
        <p className="mt-1 text-[14px] leading-relaxed text-[#6B7A8C]">{body}</p>
      </div>
    </article>
  );
}

export function ProyectoPresentadoView({ project }: { project: PresentedProject }) {
  const [joined, setJoined] = useState(false);

  return (
    <div className="flex min-h-[100dvh] flex-col font-[family-name:var(--font-inter)] bg-[#0B2E59] text-white">
      <header className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Link
          href="/plaza"
          className="vu-focus flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[#0B2E59]/50 text-white backdrop-blur-sm"
          aria-label="Volver a la plaza"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <span className="rounded-full bg-[#C6D92D] px-3 py-1 text-[11px] font-bold text-[#0B2E59]">
          {project.badge}
        </span>
      </header>

      <div className="relative h-[min(42vh,320px)] w-full shrink-0">
        <VuWarmImage
          src={project.image}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(11,46,89,0.15) 0%, rgba(11,46,89,0.35) 50%, rgba(11,46,89,0.85) 100%)",
          }}
        />
      </div>

      <main className="relative z-10 -mt-6 flex-1 overflow-y-auto rounded-t-[28px] bg-[#0B2E59] px-4 pb-6">
        <div className="mx-auto max-w-lg">
          <p className="text-xs font-bold uppercase tracking-wider text-[#1A9BB0]">
            {project.screenTitle}
          </p>
          <h1 className="mt-2 text-[1.5rem] font-bold leading-tight tracking-tight text-white">
            {project.title}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[#CBD5E1]">{project.description}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1A9BB0]/25 px-3 py-1.5 text-xs font-semibold text-[#E6F6FA]">
              <ModalityIcon modality={project.modality} />
              {project.modalityLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#E8EEF3]">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C8 6 4 8 4 13a8 8 0 1016 0c0-5-4-7-8-11z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              {project.location}
            </span>
          </div>

          <div className="mt-5 rounded-[24px] bg-white/8 p-4 ring-1 ring-white/10">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Creado por
            </p>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A9BB0] text-sm font-bold text-white">
                {project.creator.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-base font-bold text-white">
                  {project.creator.name}
                  {project.creator.verified ? (
                    <span
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#C6D92D] text-[#0B2E59]"
                      title="Impulsor verificado en el barrio"
                      aria-label="Verificado"
                    >
                      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
                        <path d="M9 16.2l-4.2-4.2 1.4-1.4 2.8 2.8 6.6-6.6 1.4 1.4z" />
                      </svg>
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-[#94A3B8]">{project.creator.role}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-[20px] bg-white/8 px-4 py-3 ring-1 ring-white/10">
              <p className="text-2xl font-bold text-[#C6D92D]">{project.interestedCount}</p>
              <p className="text-xs font-medium text-[#94A3B8]">Interesados</p>
            </div>
            <div className="rounded-[20px] bg-white/8 px-4 py-3 ring-1 ring-white/10">
              <p className="text-2xl font-bold text-[#1A9BB0]">{project.commentCount}</p>
              <p className="text-xs font-medium text-[#94A3B8]">Comentarios</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#1A9BB0]/40 bg-[#1A9BB0]/15 px-3 py-1 text-xs font-semibold text-[#E6F6FA]"
              >
                {tag}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setJoined(true)}
            className={[
              "vu-focus mt-6 flex w-full min-h-[52px] items-center justify-center gap-2 rounded-2xl text-base font-bold transition-transform active:scale-[0.99]",
              joined
                ? "bg-white/15 text-[#C6D92D] ring-2 ring-[#C6D92D]"
                : "bg-[#C6D92D] text-[#0B2E59] shadow-[0_4px_20px_rgba(198,217,45,0.35)]",
            ].join(" ")}
          >
            {joined ? "¡Gracias! Te avisamos cuando arranque" : "Me interesa sumarme"}
          </button>

          <section className="mt-10" aria-labelledby="conversacion-proyecto">
            <h2
              id="conversacion-proyecto"
              className="mb-1 text-sm font-bold text-white"
            >
              Quienes ya se sumaron
            </h2>
            <p className="mb-5 text-xs text-[#94A3B8]">
              Interés real — no likes sueltos. Así se arma el taller.
            </p>
            <div className="space-y-4">
              {project.comments.map((c) => (
                <CommentBubble
                  key={c.id}
                  author={c.author}
                  body={c.body}
                  initials={c.initials}
                  accent={c.accent}
                />
              ))}
            </div>
          </section>

          <p className="mt-8 pb-4 text-center text-[11px] text-[#64748B]">
            Presentar un proyecto es abrir una mesa en el barrio, no publicar un anuncio.
          </p>
        </div>
      </main>

      <div className="shrink-0 bg-[#F8FAFC]">
        <VuBottomNav active="plaza" />
      </div>
    </div>
  );
}
