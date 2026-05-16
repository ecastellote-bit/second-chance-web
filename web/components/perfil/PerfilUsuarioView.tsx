"use client";

import Link from "next/link";
import { CirculosLeftNav } from "@/components/circulos/CirculosLeftNav";
import { VuBottomNav } from "@/components/layout/VuMobileShell";
import { PerfilIdentityHeader } from "@/components/perfil/PerfilIdentityHeader";
import { CaminoProgress, PerfilChips, PerfilSection } from "@/components/perfil/PerfilSection";
import type { PerfilUsuario } from "@/lib/content/perfilCatalog";

export function PerfilUsuarioView({ profile }: { profile: PerfilUsuario }) {
  return (
    <div className="flex min-h-[100dvh] flex-col font-[family-name:var(--font-inter)] bg-[#F8FAFC] text-[#243647] lg:flex-row">
      <CirculosLeftNav />

      <div className="flex min-h-0 flex-1 flex-col">
        <PerfilIdentityHeader profile={profile} />

        <main className="relative z-10 -mt-1 flex-1 overflow-y-auto rounded-t-[28px] bg-[#F8FAFC] shadow-[0_-4px_24px_rgba(11,46,89,0.06)]">
          <div className="mx-auto max-w-lg space-y-4 px-4 py-6 pb-8">
            <PerfilSection title="Mi momento actual">
              <p className="text-[15px] leading-relaxed text-[#6B7A8C]">{profile.momentoActual}</p>
              <div className="mt-4 border-t border-[#E8EEF3] pt-4">
                <CaminoProgress value={profile.caminoProgress} label={profile.caminoLabel} />
              </div>
            </PerfilSection>

            <PerfilSection title="Afinidades principales" hint="Lo que te mueve y te sostiene">
              <PerfilChips items={profile.afinidades} variant="teal" />
            </PerfilSection>

            <PerfilSection title="Estoy buscando" hint="Lo que querés encontrar en el barrio">
              <PerfilChips items={profile.buscando} variant="lime" />
            </PerfilSection>

            <PerfilSection title="Puedo aportar" hint="Lo que ofrecés a otros">
              <PerfilChips items={profile.aportar} variant="navy" />
            </PerfilSection>

            <PerfilSection title="Círculos activos">
              <ul className="space-y-2">
                {profile.circulosActivos.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/circulos/${c.id}`}
                      className="vu-focus flex min-h-[48px] items-center justify-between gap-3 rounded-2xl bg-[#F8FAFC] px-3 py-2.5 ring-1 ring-[#E8EEF3] transition-colors hover:bg-[#E6F6FA]"
                    >
                      <span className="text-sm font-semibold text-[#0B2E59]">{c.title}</span>
                      <span className="text-[11px] text-[#6B7A8C]">
                        {c.online} en línea · {c.members} miembros
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </PerfilSection>

            <PerfilSection title="Proyectos en los que participo">
              <ul className="space-y-2">
                {profile.proyectos.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/proyectos/${p.id}`}
                      className="vu-focus block rounded-2xl bg-[#F8FAFC] px-3 py-3 ring-1 ring-[#E8EEF3] hover:bg-[#E6F6FA]"
                    >
                      <p className="text-sm font-semibold text-[#0B2E59]">{p.title}</p>
                      <p className="mt-0.5 text-xs text-[#6B7A8C]">{p.role}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </PerfilSection>

            <PerfilSection title="Próximo movimiento">
              <div className="rounded-2xl bg-gradient-to-br from-[#0B2E59] to-[#1A9BB0] p-4 text-white">
                <p className="text-sm font-bold">{profile.proximoMovimiento.title}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-white/90">
                  {profile.proximoMovimiento.description}
                </p>
                <Link
                  href={profile.proximoMovimiento.href}
                  className="vu-focus mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#C6D92D] px-5 text-sm font-bold text-[#0B2E59]"
                >
                  {profile.proximoMovimiento.cta}
                </Link>
              </div>
            </PerfilSection>

            <PerfilSection title="Logros / hitos" hint="Movimientos que ya hiciste">
              <ol className="relative space-y-4 border-l-2 border-[#1A9BB0]/30 pl-4">
                {profile.hitos.map((h) => (
                  <li key={h.id} className="relative">
                    <span
                      className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#C6D92D] ring-2 ring-white"
                      aria-hidden
                    />
                    <p className="text-sm font-semibold text-[#0B2E59]">{h.title}</p>
                    <p className="text-xs text-[#6B7A8C]">{h.when}</p>
                  </li>
                ))}
              </ol>
            </PerfilSection>

            <p className="pt-2 text-center text-[11px] leading-relaxed text-[#6B7A8C]">
              Tu perfil cuenta quién sos en el camino — no una lista de cargos.
            </p>
          </div>
        </main>

        <VuBottomNav active="perfil" />
      </div>
    </div>
  );
}
