"use client";

import { VuWarmImage } from "@/components/ui/VuWarmImage";
import Link from "next/link";
import {
  CIRCLE_STATUS_LABEL,
  type CircleItem,
  type CircleStatus,
} from "@/lib/content/circulosCatalog";

const STATUS_STYLE: Record<
  CircleStatus,
  { bg: string; text: string; dot?: string }
> = {
  activo: { bg: "rgba(26,155,176,0.18)", text: "#0B2E59" },
  nuevo: { bg: "rgba(198,217,45,0.35)", text: "#0B2E59" },
  muy_activo: { bg: "rgba(26,155,176,0.28)", text: "#0B2E59", dot: "#1A9BB0" },
  proximo_encuentro: { bg: "rgba(11,46,89,0.12)", text: "#0B2E59", dot: "#C6D92D" },
};

const AVATAR_COLORS = ["#1A9BB0", "#0B2E59", "#C6D92D", "#6B7A8C"];

function StatusPill({ status }: { status: CircleStatus }) {
  const style = STATUS_STYLE[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {style.dot ? (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{
            backgroundColor: style.dot,
            boxShadow: status === "muy_activo" ? `0 0 6px ${style.dot}` : undefined,
          }}
        />
      ) : null}
      {CIRCLE_STATUS_LABEL[status]}
    </span>
  );
}

function MemberAvatars({ initials }: { initials: string[] }) {
  return (
    <div className="flex -space-x-2">
      {initials.slice(0, 4).map((init, i) => (
        <span
          key={`${init}-${i}`}
          className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white"
          style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
          aria-hidden
        >
          {init}
        </span>
      ))}
    </div>
  );
}

export function CircleCard({ circle, compact }: { circle: CircleItem; compact?: boolean }) {
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
        <div className="absolute left-3 top-3">
          <StatusPill status={circle.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-[15px] font-bold leading-snug text-[#0B2E59]">{circle.title}</h3>
          <p className="mt-1 text-[13px] leading-relaxed text-[#6B7A8C] line-clamp-2">
            {circle.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <MemberAvatars initials={circle.avatars} />
          <p className="text-right text-[11px] leading-tight text-[#6B7A8C]">
            <span className="font-semibold text-[#0B2E59]">{circle.members}</span> miembros
            <br />
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1A9BB0]" aria-hidden />
              {circle.online} en línea
            </span>
          </p>
        </div>

        <Link
          href={`/circulos/${circle.id}`}
          className="vu-focus mt-auto flex min-h-[44px] items-center justify-between rounded-2xl bg-[#0B2E59] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#081f3d] group-active:scale-[0.99]"
        >
          Entrar
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
