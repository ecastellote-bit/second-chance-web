"use client";

import { VuWarmImage } from "@/components/ui/VuWarmImage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VuBottomNav } from "@/components/layout/VuMobileShell";
import { PlazaDiagnosisPrompt } from "@/components/founder/DiagnosisFirstBanner";
import { LiveActivityPanel } from "@/components/community/LiveActivityPanel";
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
      {/* Mapa primero: entradas visibles sin carteles encima */}
      <div className="relative h-[min(56vh,480px)] min-h-[300px] shrink-0 w-full">
        <VuWarmImage
          src={PLAZA_IMAGE}
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(180deg, rgba(11,46,89,0.42) 0%, rgba(11,46,89,0.06) 38%, rgba(11,46,89,0.04) 70%, rgba(11,46,89,0.2) 100%)",
          }}
        />

        <header className="absolute left-0 right-0 top-0 z-30 px-4 pt-10 pb-2 safe-top sm:px-5 sm:pt-12">
          <div className="mb-2 flex items-center justify-between gap-2">
            <Link
              href="/onboarding"
              className="vu-focus text-[10px] font-semibold uppercase tracking-wider text-[#C6D92D]"
            >
              VocationUp
            </Link>
            <span className="flex items-center gap-1.5 rounded-full bg-[#0B2E59]/80 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C6D92D] animate-pulse" aria-hidden />
              Barrio en siembra
            </span>
          </div>
          <h1
            className="text-[1.35rem] font-bold leading-tight tracking-tight text-white sm:text-[1.6rem]"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
          >
            {PLAZA_HEADER.title}
          </h1>
          <p
            className="mt-1.5 line-clamp-2 max-w-[300px] text-[13px] leading-snug text-white/95 sm:mt-2 sm:max-w-[320px] sm:text-[14px] sm:leading-relaxed"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}
          >
            {PLAZA_HEADER.subtitle}
          </p>
          <div className="mt-1.5 hidden sm:block">
            <PlazaDiagnosisPrompt />
          </div>
          {showEntradaLink && onOpenEntrada ? (
            <button
              type="button"
              onClick={onOpenEntrada}
              className="vu-focus mt-2 inline-flex min-h-[40px] items-center rounded-full bg-white/15 px-4 text-[12px] font-semibold text-white backdrop-blur-sm"
            >
              ← Volver a mi plaza de entrada
            </button>
          ) : null}
        </header>

        <p className="pointer-events-none absolute bottom-3 left-0 right-0 z-20 px-4 text-center text-[11px] font-semibold text-white/90 sm:hidden">
          Tocá un punto del mapa para explorar el barrio
        </p>

        <PlazaPathLines />

        {PLAZA_PATHS.map((path) => (
          <PlazaPathNode key={path.id} path={path} onNavigate={(route) => router.push(route)} />
        ))}
      </div>

      {/* Orientación debajo del mapa — no tapa entradas */}
      <div className="min-h-0 flex-1 overflow-y-auto border-t border-[#1A9BB0]/20 bg-[#0B2E59]">
        <div className="px-4 py-3 pb-24 sm:px-5">
          <div className="mb-3 sm:hidden">
            <PlazaDiagnosisPrompt />
          </div>
          <LiveActivityPanel variant="compact" />
        </div>
      </div>

      <VuBottomNav active="plaza" />
    </div>
  );
}
