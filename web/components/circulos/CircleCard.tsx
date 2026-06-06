"use client";

import { VuWarmImage } from "@/components/ui/VuWarmImage";
import Link from "next/link";
import type { CircleItem } from "@/lib/content/circulosCatalog";
import { COMMUNITY_SEED_BADGE } from "@/lib/content/communitySeedCopy";

export function CircleCard({ circle, compact }: { circle: CircleItem; compact?: boolean }) {
  const badge = circle.seedBadge ?? COMMUNITY_SEED_BADGE;

  return (
    <article
      className={[
        "group flex flex-col overflow-hidden rounded-[24px] bg-white",
        "shadow-[0_4px_16px_rgba(15,42,70,0.08)] transition-shadow hover:shadow-[0_8px_24px_rgba(15,42,70,0.12)]",
        compact ? "max-w-[280px] shrink-0" : "w-full",
      ].join(" ")}
    >
      <div className="relative h-[140px] w-full shrink-0 sm:h-[152px]">
        <VuWarmImage
          src={circle.image}
          fallbackSrc={circle.fallbackImage}
          alt=""
          fill
          className="object-cover"
          sizes={compact ? "280px" : "(max-width: 768px) 100vw, 360px"}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(248,250,252,0.05) 0%, rgba(11,46,89,0.55) 100%)",
          }}
        />
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0B2E59] backdrop-blur-sm">
          {badge}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-[15px] font-bold leading-snug text-[#0B2E59]">{circle.title}</h3>
          <p className="mt-1 text-[13px] leading-relaxed text-[#6B7A8C] line-clamp-2">
            {circle.description}
          </p>
        </div>

        <p className="text-[12px] leading-relaxed text-[#6B7A8C]">
          {circle.isTeamSeed
            ? "Mesa del equipo en formación — marcá interés sin membresía activa todavía."
            : "Espacio semilla para orientarte y marcar interés — sin membresía activa todavía."}
        </p>

        <Link
          href={`/circulos/${circle.id}`}
          className="vu-focus mt-auto flex min-h-[44px] items-center justify-between rounded-2xl bg-[#0B2E59] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#081f3d] group-active:scale-[0.99]"
        >
          {circle.interestCta ?? "Entrar"}
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
