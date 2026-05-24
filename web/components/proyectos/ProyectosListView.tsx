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
import { FounderSeedsSection } from "@/components/proyectos/FounderSeedsSection";
import { MyFounderSeedBanner } from "@/components/proyectos/MyFounderSeedBanner";
import { PROYECTOS_CATALOG, PROYECTOS_HEADER } from "@/lib/content/proyectosCatalog";

export function ProyectosListView() {
  const [canSembrar, setCanSembrar] = useState(false);

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

            <FounderSeedsSection />

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
          </div>
        </main>

        <VuBottomNav active="plaza" />
      </div>
    </div>
  );
}
