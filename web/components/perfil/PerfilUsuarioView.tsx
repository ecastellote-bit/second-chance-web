"use client";

import Link from "next/link";
import { CirculosLeftNav } from "@/components/circulos/CirculosLeftNav";
import { VuBottomNav } from "@/components/layout/VuMobileShell";
import { PerfilIdentityHeader } from "@/components/perfil/PerfilIdentityHeader";
import { PerfilBarrioSection } from "@/components/perfil/PerfilBarrioSection";
import { PerfilMovimientosSection } from "@/components/perfil/PerfilMovimientosSection";
import { CaminoProgress, PerfilChips, PerfilSection } from "@/components/perfil/PerfilSection";
import type { PerfilUsuario } from "@/lib/content/perfilCatalog";
import type { UserProfileClientView } from "@/lib/users/userProfileTypes";

export function PerfilUsuarioView({
  profile,
  profileRecord,
}: {
  profile: PerfilUsuario;
  profileRecord: UserProfileClientView;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col font-[family-name:var(--font-inter)] bg-[#F8FAFC] text-[#243647] lg:flex-row">
      <CirculosLeftNav />

      <div className="flex min-h-0 flex-1 flex-col">
        <PerfilIdentityHeader profile={profile} />

        <main className="relative z-[1] mt-2 flex-1 overflow-y-auto rounded-t-[28px] bg-[#F8FAFC] shadow-[0_2px_12px_rgba(11,46,89,0.06)]">
          <div className="mx-auto max-w-lg space-y-4 px-4 pt-7 pb-8">
            <PerfilBarrioSection profile={profileRecord} />

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

            <PerfilMovimientosSection profileRecord={profileRecord} />

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
