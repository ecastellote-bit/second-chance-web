"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { VuWarmImage } from "@/components/ui/VuWarmImage";

export type ActivityBadge = {
  label: string;
  bg: string;
  text: string;
};

type Props = {
  backHref: string;
  backLabel: string;
  image: string;
  fallbackImage?: string;
  title: string;
  meta?: string;
  badge?: ActivityBadge;
  children: ReactNode;
  footer: ReactNode;
};

/**
 * Detalle de actividad del barrio: misma foto que la tarjeta + contenido debajo.
 * Evita pantallas “en blanco” antes de la próxima etapa del MVP.
 */
export function NeighborhoodActivityDetail({
  backHref,
  backLabel,
  image,
  fallbackImage,
  title,
  meta,
  badge,
  children,
  footer,
}: Props) {
  return (
    <main className="flex min-h-[100dvh] flex-col bg-[#0B2E59] font-[family-name:var(--font-inter)]">
      <div className="relative h-[min(42vh,300px)] w-full shrink-0 overflow-hidden">
        <VuWarmImage
          src={image}
          fallbackSrc={fallbackImage}
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
              "linear-gradient(180deg, rgba(11,46,89,0.35) 0%, rgba(11,46,89,0.15) 40%, rgba(11,46,89,0.75) 100%)",
          }}
        />

        <div className="absolute left-0 right-0 top-0 z-20 px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <Link
            href={backHref}
            className="vu-focus inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#0B2E59]/40 px-3 text-sm font-semibold text-white backdrop-blur-sm"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {backLabel}
          </Link>
        </div>

        {badge ? (
          <span
            className="absolute bottom-20 left-4 z-10 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide shadow-sm"
            style={{ backgroundColor: badge.bg, color: badge.text }}
          >
            {badge.label}
          </span>
        ) : null}
      </div>

      <div className="relative z-10 -mt-6 flex flex-1 flex-col rounded-t-[28px] bg-[#F8FAFC] shadow-[0_-8px_32px_rgba(11,46,89,0.12)]">
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 pb-10 pt-8">
          <h1 className="text-2xl font-bold leading-snug tracking-tight text-[#0B2E59]">{title}</h1>
          {meta ? (
            <p className="mt-2 text-sm font-medium text-[#6B7A8C]">{meta}</p>
          ) : null}
          <div className="mt-6 text-[15px] leading-relaxed text-[#6B7A8C]">{children}</div>
          <div className="mt-8 flex flex-col gap-3">{footer}</div>
        </div>
      </div>
    </main>
  );
}

export const EVENT_LABEL_BADGE: Record<string, ActivityBadge> = {
  Taller: { label: "Taller", bg: "rgba(26,155,176,0.2)", text: "#0B2E59" },
  Charla: { label: "Charla", bg: "rgba(11,46,89,0.1)", text: "#0B2E59" },
  Networking: { label: "Networking", bg: "rgba(198,217,45,0.35)", text: "#0B2E59" },
  Voluntariado: { label: "Voluntariado", bg: "rgba(26,155,176,0.15)", text: "#0B2E59" },
  Ilustración: { label: "Ilustración", bg: "rgba(11,46,89,0.08)", text: "#6B7A8C" },
  "Convocatoria semilla": { label: "Convocatoria semilla", bg: "rgba(26,155,176,0.2)", text: "#0B2E59" },
  "Primer encuentro tentativo": {
    label: "Primer encuentro tentativo",
    bg: "rgba(198,217,45,0.35)",
    text: "#0B2E59",
  },
  "Propuesta inicial del equipo": {
    label: "Propuesta inicial del equipo",
    bg: "rgba(26,155,176,0.2)",
    text: "#0B2E59",
  },
};

export const CIRCLE_STATUS_BADGE: Record<string, ActivityBadge> = {
  activo: { label: "Activo", bg: "rgba(26,155,176,0.2)", text: "#0B2E59" },
  nuevo: { label: "Nuevo", bg: "rgba(198,217,45,0.35)", text: "#0B2E59" },
  muy_activo: { label: "Muy activo", bg: "rgba(198,217,45,0.5)", text: "#0B2E59" },
  proximo_encuentro: { label: "Próximo encuentro", bg: "rgba(11,46,89,0.12)", text: "#0B2E59" },
};
