"use client";

import Link from "next/link";
import { CooperativeExampleVoices } from "@/components/community/CooperativeExampleVoices";
import { NeighborhoodHero } from "@/components/community/NeighborhoodHero";
import { PublicCommunityRecentActivity } from "@/components/community/PublicCommunityRecentActivity";
import { FoundingMemberBadge } from "@/components/founder/FoundingMemberBadge";
import { VuBottomNav } from "@/components/layout/VuMobileShell";
import { CONECTAR_VOICE_EXAMPLES } from "@/lib/content/cooperativeSeedExamples";
import { COMMUNITY_DOOR_HUBS } from "@/lib/content/neighborhoodJourney";

const COOPERATIVE_BLOCKS = [
  {
    id: "sumar",
    title: "Quiero sumarme a una idea",
    body: "Explorá proyectos publicados y dejá una señal de interés — sin contacto directo automático.",
    href: "/proyectos",
    cta: "Ver proyectos del barrio",
  },
  {
    id: "aportar",
    title: "Puedo aportar algo",
    body: "Los aportes guiados se revisan antes de mostrarse. Podés sumar una idea concreta a un proyecto.",
    href: "/proyectos",
    cta: "Acercarte a una mesa",
  },
  {
    id: "mesa",
    title: "Busco una mesa para empezar",
    body: "Los círculos son espacios temáticos pequeños para conversar con ritmo y cuidado.",
    href: "/circulos",
    cta: "Explorar círculos",
  },
  {
    id: "inquietud",
    title: "Quiero encontrar personas con una inquietud parecida",
    body: "Marcá interés en un círculo o dejá una idea para revisión del equipo.",
    href: "/circulos",
    cta: "Ver círculos del barrio",
  },
] as const;

export function ConectarConOtrosView() {
  const hub = COMMUNITY_DOOR_HUBS.conectar_con_otros;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#F8FAFC] font-[family-name:var(--font-inter)] pb-24">
      <div className="px-4 pt-10">
        <Link
          href="/plaza"
          className="text-[12px] font-semibold text-[#1A9BB0] underline"
        >
          ← Volver a la plaza
        </Link>

        <NeighborhoodHero
          className="mt-4"
          eyebrow="Puerta del barrio · cooperación"
          title={hub.title}
          subtitle="Conectar no es networking vacío: es acercarte a otros para impulsar ideas, sumar manos y abrir mesas comunes — sin pedir permiso al mundo externo."
          imageSrc="/vu/puerta-conectar-otros.png"
        />

        <FoundingMemberBadge />
      </div>

      <div className="mt-4 px-4">
        <PublicCommunityRecentActivity className="mb-6" limit={5} surface="connection" />

        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[#6B7A8C]">
          Formas de sumarte
        </p>
        <ul className="flex flex-col gap-3">
          {COOPERATIVE_BLOCKS.map((block) => (
            <li key={block.id}>
              <Link
                href={block.href}
                className="vu-focus block rounded-[20px] border border-[#E8EEF3] bg-white p-4 shadow-[0_4px_16px_rgba(15,42,70,0.06)]"
              >
                <p className="text-[14px] font-bold text-[#0B2E59]">{block.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-[#6B7A8C]">{block.body}</p>
                <span className="mt-2 inline-block text-[12px] font-semibold text-[#1A9BB0]">
                  {block.cta} →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <CooperativeExampleVoices
          className="mt-6"
          title="Voces cooperativas del barrio"
          intro="Ejemplos de tono — no son mensajes privados ni chats en vivo. El equipo modera antes de mostrar señales reales."
          examples={CONECTAR_VOICE_EXAMPLES}
        />

        <div className="mt-6 rounded-2xl border border-[#1A9BB0]/25 bg-[#E6F6FA] p-4">
          <p className="text-[13px] font-semibold text-[#0B2E59]">También podés</p>
          <ul className="mt-2 space-y-2 text-[13px] text-[#6B7A8C]">
            {hub.links.map((link) => (
              <li key={link.route}>
                <Link href={link.route} className="vu-focus font-semibold text-[#1A9BB0] underline">
                  {link.label}
                </Link>
                <span className="block text-[12px]">{link.description}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/activacion"
          className="vu-focus mt-6 flex min-h-[48px] items-center justify-center rounded-2xl bg-[#0B2E59] text-sm font-bold text-white"
        >
          Elegir un camino de activación
        </Link>
      </div>

      <VuBottomNav active="plaza" />
    </div>
  );
}
