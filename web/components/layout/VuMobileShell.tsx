"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavId = "plaza" | "mensajes" | "actividad" | "perfil";

function VuLogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="24" cy="24" r="22" fill="#0B2E59" />
      <path d="M16 28 L24 14 L32 28 Z" fill="#1A9BB0" />
      <path d="M20 28 L24 20 L28 28 Z" fill="#C6D92D" />
    </svg>
  );
}

export function VuTopBar({
  showProgress,
  progressStep = 2,
  progressTotal = 3,
  progressLabel = "Temáticas",
}: {
  showProgress?: boolean;
  progressStep?: number;
  progressTotal?: number;
  progressLabel?: string;
}) {
  const pct = Math.round((progressStep / progressTotal) * 100);

  return (
    <header className="shrink-0 px-5 pt-6 pb-3 bg-[#F8FAFC]">
      <div className="flex items-center justify-center gap-2">
        <VuLogoMark size={36} />
        <div className="text-left">
          <p className="text-sm font-bold text-[#0B2E59] leading-tight">VocationUp</p>
          <p className="text-[10px] text-[#6B7A8C]">by Second Chance</p>
        </div>
      </div>
      {showProgress ? (
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-[11px] font-medium text-[#6B7A8C]">
            <span>
              Paso {progressStep} de {progressTotal}
            </span>
            <span>{progressLabel}</span>
          </div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-[#E8EEF3]"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-[#1A9BB0] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function VuBottomNav({ active = "plaza" }: { active?: NavId }) {
  const pathname = usePathname();

  const items: { id: NavId; label: string; href: string; icon: ReactNode }[] = [
    {
      id: "plaza",
      label: "Plaza",
      href: "/plaza",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V11z" />
        </svg>
      ),
    },
    {
      id: "mensajes",
      label: "Mensajes",
      href: "/mensajes",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
      ),
    },
    {
      id: "actividad",
      label: "Actividad",
      href: "/actividad",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      ),
    },
    {
      id: "perfil",
      label: "Perfil",
      href: "/perfil",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="4" />
          <path d="M5 20c0-4 3-6 7-6s7 2 7 6" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      className="shrink-0 border-t border-[#E8EEF3] bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2"
      aria-label="Navegación principal"
    >
      <div className="mx-auto flex max-w-lg items-end justify-between">
        {items.slice(0, 2).map((item) => {
          const isActive =
            active === item.id ||
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`) ||
            (item.id === "plaza" && pathname.startsWith("/plaza"));
          return (
            <Link
              key={item.id}
              href={item.href}
              className={[
                "vu-focus flex min-h-[48px] min-w-[64px] flex-col items-center justify-center gap-0.5 rounded-xl px-2 text-[10px] font-semibold",
                isActive ? "text-[#C6D92D]" : "text-[#6B7A8C]",
              ].join(" ")}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}

        <Link
          href="/activacion"
          className="vu-focus -mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_4px_16px_rgba(15,42,70,0.12)] ring-2 ring-[#E8EEF3]"
          aria-label="Elegir cómo empezar en el barrio"
          title="Activación"
        >
          <VuLogoMark size={44} />
        </Link>

        {items.slice(2).map((item) => {
          const isActive =
            active === item.id ||
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`) ||
            (item.id === "perfil" && pathname.startsWith("/perfil"));
          return (
            <Link
              key={item.id}
              href={item.href}
              className={[
                "vu-focus flex min-h-[48px] min-w-[64px] flex-col items-center justify-center gap-0.5 rounded-xl px-2 text-[10px] font-semibold",
                isActive ? "text-[#C6D92D]" : "text-[#6B7A8C]",
              ].join(" ")}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function VuMobileShell({
  children,
  showProgress,
  progressStep,
  progressTotal,
  progressLabel,
  navActive,
}: {
  children: ReactNode;
  showProgress?: boolean;
  progressStep?: number;
  progressTotal?: number;
  progressLabel?: string;
  navActive?: NavId;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col font-[family-name:var(--font-inter)] bg-[#F8FAFC] text-[#243647]">
      <VuTopBar
        showProgress={showProgress}
        progressStep={progressStep}
        progressTotal={progressTotal}
        progressLabel={progressLabel}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <VuBottomNav active={navActive} />
    </div>
  );
}
