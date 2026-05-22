"use client";

import Link from "next/link";
import { VuBottomNav } from "@/components/layout/VuMobileShell";
import type { CommunityDoorId } from "@/lib/content/activacionCatalog";
import { COMMUNITY_DOOR_HUBS } from "@/lib/content/neighborhoodJourney";
import { FoundingMemberBadge } from "@/components/founder/FoundingMemberBadge";
import { UserProfileGate } from "@/components/perfil/UserProfileGate";

export function CommunityDoorHub({ doorId }: { doorId: CommunityDoorId }) {
  const hub = COMMUNITY_DOOR_HUBS[doorId];

  return (
    <UserProfileGate>
    <div className="flex min-h-[100dvh] flex-col bg-[#F8FAFC] font-[family-name:var(--font-inter)] pb-24">
      <header className="px-5 pt-12 pb-4">
        <Link
          href="/plaza"
          className="text-[12px] font-semibold text-[#1A9BB0] underline"
        >
          ← Volver a la plaza
        </Link>
        <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
          Puerta del barrio
        </p>
        <h1 className="mt-2 text-[1.6rem] font-bold leading-tight text-[#0B2E59]">
          {hub.title}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[#6B7A8C]">{hub.intro}</p>
      </header>

      <div className="px-4">
        <FoundingMemberBadge />
      </div>

      <ul className="mt-4 flex flex-col gap-3 px-4">
        {hub.links.map((link) => (
          <li key={link.route}>
            <Link
              href={link.route}
              className="vu-focus block rounded-[20px] border border-[#E8EEF3] bg-white p-4 shadow-[0_4px_16px_rgba(15,42,70,0.06)]"
            >
              <p className="text-[14px] font-bold text-[#0B2E59]">{link.label}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-[#6B7A8C]">
                {link.description}
              </p>
              <span className="mt-2 inline-block text-[12px] font-semibold text-[#1A9BB0]">
                Ir →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mx-4 mt-6 rounded-2xl border border-dashed border-[#CBD5E1] bg-white/80 p-4">
        <p className="text-[13px] font-semibold text-[#0B2E59]">Mapa completo del barrio</p>
        <Link href="/barrio" className="mt-2 inline-block text-[13px] font-semibold text-[#1A9BB0] underline">
          Ver todos los caminos
        </Link>
      </div>

      <VuBottomNav active="plaza" />
    </div>
    </UserProfileGate>
  );
}
