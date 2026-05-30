"use client";

import Link from "next/link";
import { CommunityRulesBlock } from "@/components/community/CommunityRulesBlock";
import { VuBottomNav } from "@/components/layout/VuMobileShell";

export default function ComunidadReglasPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#F8FAFC] font-[family-name:var(--font-inter)] pb-24">
      <header className="border-b border-[#E8EEF3] px-5 pt-12 pb-4">
        <Link
          href="/plaza"
          className="vu-focus mb-3 inline-flex min-h-[44px] items-center gap-1 text-sm font-semibold text-[#1A9BB0]"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Volver a la plaza
        </Link>
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
          VocationUp · Comunidad
        </p>
        <h1 className="mt-2 text-[1.5rem] font-bold text-[#0B2E59]">Reglas del barrio</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-[#6B7A8C]">
          Movimiento con cuidado: estas reglas aplican a proyectos, círculos, formación y señales
          visibles del barrio fundador.
        </p>
      </header>

      <div className="px-4 pt-4">
        <CommunityRulesBlock variant="full" />
      </div>

      <VuBottomNav active="plaza" />
    </div>
  );
}
