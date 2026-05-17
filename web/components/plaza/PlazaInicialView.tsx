"use client";

import { VuWarmImage } from "@/components/ui/VuWarmImage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VuBottomNav } from "@/components/layout/VuMobileShell";
import { DeepReadingPlazaLink } from "@/components/neighborhood/DeepReadingCTA";
import {
  PLAZA_HEADER,
  PLAZA_HUB,
  PLAZA_IMAGE,
  PLAZA_PATHS,
  type PlazaPath,
} from "@/lib/content/plazaPaths";

const ACCENT = {
  teal: { ring: "#1A9BB0", fill: "#1A9BB0", glow: "rgba(26,155,176,0.5)" },
  lime: { ring: "#C6D92D", fill: "#C6D92D", glow: "rgba(198,217,45,0.55)" },
  navy: { ring: "#0B2E59", fill: "#0B2E59", glow: "rgba(11,46,89,0.5)" },
};

function PathIcon({ id }: { id: string }) {
  const cls = "h-3.5 w-3.5";
  switch (id) {
    case "circulos":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="9" cy="8" r="3" />
          <path d="M4 20c0-3 2-5 5-5" />
        </svg>
      );
    case "proyectos":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M3 7h5l2-3h4l2 3h5v12H3V7z" />
        </svg>
      );
    case "formacion":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M4 19h16M6 16V8l6-4 6 4v8" />
        </svg>
      );
    case "oportunidades":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2l2 7h7l-5.5 4 2 7L12 17l-5.5 4 2-7L3 9h7l2-7z" />
        </svg>
      );
    case "conectar":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M8 12h8M12 8v8" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    case "eventos":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M8 3v4M16 3v4M4 11h16" />
        </svg>
      );
    default:
      return null;
  }
}

function PlazaPathNode({ path, onNavigate }: { path: PlazaPath; onNavigate: (route: string) => void }) {
  const colors = ACCENT[path.accent];
  const iconColor = path.accent === "lime" ? "#0B2E59" : "#FFFFFF";

  return (
    <button
      type="button"
      onClick={() => onNavigate(path.route)}
      className="vu-focus absolute z-20 flex flex-col items-center gap-1.5 -translate-x-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px]"
      style={{ left: `${path.x}%`, top: `${path.y}%` }}
      aria-label={path.label}
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-full border-2 shadow-lg ring-2 ring-white/30"
        style={{
          backgroundColor: colors.fill,
          borderColor: colors.ring,
          color: iconColor,
          boxShadow: `0 0 12px ${colors.glow}`,
        }}
      >
        <PathIcon id={path.id} />
      </span>
      <span
        className="max-w-[88px] rounded-full px-2.5 py-1 text-center text-[11px] font-bold leading-tight text-white shadow-md"
        style={{
          textShadow: "0 1px 4px rgba(0,0,0,0.8)",
          background: "rgba(11, 46, 89, 0.72)",
          backdropFilter: "blur(6px)",
        }}
      >
        {path.label}
      </span>
    </button>
  );
}

function PlazaPathLines() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="lineTeal" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1A9BB0" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#1A9BB0" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#C6D92D" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      {PLAZA_PATHS.map((path) => (
        <line
          key={path.id}
          x1={PLAZA_HUB.x}
          y1={PLAZA_HUB.y}
          x2={path.x}
          y2={path.y}
          stroke="url(#lineTeal)"
          strokeWidth="0.35"
          strokeLinecap="round"
          strokeDasharray="1.2 0.8"
          opacity="0.85"
        />
      ))}
      <circle cx={PLAZA_HUB.x} cy={PLAZA_HUB.y} r="1.2" fill="#C6D92D" opacity="0.9" />
      <circle cx={PLAZA_HUB.x} cy={PLAZA_HUB.y} r="2.4" fill="none" stroke="#1A9BB0" strokeWidth="0.2" opacity="0.5" />
    </svg>
  );
}

type PlazaInicialViewProps = {
  showEntradaLink?: boolean;
  onOpenEntrada?: () => void;
};

export function PlazaInicialView({ showEntradaLink, onOpenEntrada }: PlazaInicialViewProps = {}) {
  const router = useRouter();

  return (
    <div className="flex min-h-[100dvh] flex-col font-[family-name:var(--font-inter)] bg-[#0B2E59]">
      {/* Plaza — full bleed */}
      <div className="relative flex-1 min-h-0">
        <VuWarmImage
          src={PLAZA_IMAGE}
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Velo suave — deja ver la foto, no taparla de azul */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(180deg, rgba(11,46,89,0.38) 0%, rgba(11,46,89,0.08) 32%, rgba(11,46,89,0.05) 58%, rgba(11,46,89,0.28) 100%)",
          }}
        />

        {/* Header — floating on image */}
        <header className="absolute left-0 right-0 top-0 z-30 px-5 pt-12 pb-4 safe-top">
          <div className="flex items-center justify-between gap-2 mb-3">
            <Link
              href="/onboarding"
              className="vu-focus text-[10px] font-semibold uppercase tracking-wider text-[#C6D92D]"
            >
              VocationUp
            </Link>
            <span className="flex items-center gap-1.5 rounded-full bg-[#0B2E59]/80 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C6D92D] animate-pulse" aria-hidden />
              Comunidad activa
            </span>
          </div>
          <h1
            className="text-[1.6rem] font-bold leading-tight tracking-tight text-white"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
          >
            {PLAZA_HEADER.title}
          </h1>
          <p
            className="mt-2 max-w-[320px] text-[14px] leading-relaxed text-white/95"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}
          >
            {PLAZA_HEADER.subtitle}
          </p>
          <DeepReadingPlazaLink />
          {showEntradaLink && onOpenEntrada ? (
            <button
              type="button"
              onClick={onOpenEntrada}
              className="vu-focus mt-3 inline-flex min-h-[40px] items-center rounded-full bg-white/15 px-4 text-[12px] font-semibold text-white backdrop-blur-sm"
            >
              ← Volver a mi plaza de entrada
            </button>
          ) : null}
        </header>

        <PlazaPathLines />

        {PLAZA_PATHS.map((path) => (
          <PlazaPathNode key={path.id} path={path} onNavigate={(route) => router.push(route)} />
        ))}
      </div>

      <VuBottomNav active="plaza" />
    </div>
  );
}
