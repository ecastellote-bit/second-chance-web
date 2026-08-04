"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PerfilSection } from "@/components/perfil/PerfilSection";
import { fetchCommunityActivities, fetchCommunityMessages } from "@/lib/community/communityClient";
import { ALIVE_LINKS } from "@/lib/content/aliveLinks";
import { getFoundingMemberArchiveId } from "@/lib/learning/foundationalMember";
import type { UserProfileClientView } from "@/lib/users/userProfileTypes";

function resolveDiagnosticArchiveId(profile: UserProfileClientView): string {
  const fromProfile = profile.diagnosticArchiveId?.trim() ?? "";
  if (fromProfile) return fromProfile;
  return getFoundingMemberArchiveId()?.trim() ?? "";
}

type BarrioLink = {
  href: string;
  label: string;
  hint: string;
  tone?: "default" | "seed" | "primary";
};

export function PerfilBarrioSection({ profile }: { profile: UserProfileClientView }) {
  const diagnosticArchiveId = resolveDiagnosticArchiveId(profile);
  const [activityCount, setActivityCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasSeed, setHasSeed] = useState(false);

  useEffect(() => {
    void Promise.all([fetchCommunityActivities(), fetchCommunityMessages()]).then(
      ([acts, msgs]) => {
        setActivityCount(acts.length);
        setUnreadCount(msgs.filter((m) => m.status === "unread").length);
        setHasSeed(acts.some((a) => a.type === "project_seeded"));
      },
    );
  }, []);

  const links: BarrioLink[] = [
    diagnosticArchiveId
      ? {
          href: `/full/result/archivo/${encodeURIComponent(diagnosticArchiveId)}`,
          label: "Ver mi diagnóstico",
          hint: "Archivo",
        }
      : {
          href: "/comenzar",
          label: "Iniciar lectura vocacional",
          hint: "Diagnóstico",
          tone: "primary",
        },
    {
      href: ALIVE_LINKS.actividad.href,
      label: "Actividad",
      hint: activityCount > 0 ? `${activityCount} movimientos` : "Sin movimientos aún",
    },
    {
      href: ALIVE_LINKS.mensajes.href,
      label: "Mensajes",
      hint: unreadCount > 0 ? `${unreadCount} avisos sin leer` : "Directos y avisos",
    },
    {
      href: ALIVE_LINKS.notificaciones.href,
      label: "Notificaciones",
      hint: "In-app del barrio",
    },
    {
      href: ALIVE_LINKS.comunidad.href,
      label: "Comunidad",
      hint: "Publicaciones del barrio",
    },
    {
      href: ALIVE_LINKS.connect.href,
      label: "Directorio Connect",
      hint: "Personas y contacto",
    },
    {
      href: ALIVE_LINKS.vivos.href,
      label: "Proyectos vivos",
      hint: "Colaborativos abiertos",
    },
    hasSeed
      ? {
          href: ALIVE_LINKS.proyectos.href,
          label: "Proyecto sembrado",
          hint: "Ver semilla",
          tone: "seed",
        }
      : {
          href: ALIVE_LINKS.sembrar.href,
          label: "Sembrar un proyecto",
          hint: "Ola fundadora",
          tone: "primary",
        },
    {
      href: ALIVE_LINKS.barrio.href,
      label: "Mapa del barrio",
      hint: "Todos los caminos",
    },
  ];

  return (
    <PerfilSection title="Tu barrio" hint="Conexión con el ecosistema — sin red social">
      <ul className="space-y-2">
        {links.map((item) => (
          <li key={`${item.href}-${item.label}`}>
            <Link
              href={item.href}
              className={[
                "vu-focus flex min-h-[44px] items-center justify-between rounded-2xl px-3 py-2.5",
                item.tone === "primary"
                  ? "bg-[#0B2E59] text-white hover:bg-[#0a274f]"
                  : item.tone === "seed"
                    ? "bg-[#F4F9E0] ring-1 ring-[#C6D92D]/40 hover:bg-[#eef5d0]"
                    : "bg-[#F8FAFC] ring-1 ring-[#E8EEF3] hover:bg-[#E6F6FA]",
              ].join(" ")}
            >
              <span
                className={[
                  "text-sm font-semibold",
                  item.tone === "primary" ? "text-white" : "text-[#0B2E59]",
                ].join(" ")}
              >
                {item.label}
              </span>
              <span
                className={[
                  "text-[11px]",
                  item.tone === "primary" ? "text-white/80" : "text-[#6B7A8C]",
                ].join(" ")}
              >
                {item.hint}
              </span>
            </Link>
          </li>
        ))}
        <li>
          <Link
            href={ALIVE_LINKS.plaza.href}
            className="vu-focus flex min-h-[44px] items-center justify-center rounded-2xl border border-[#1A9BB0]/30 px-3 py-2.5 text-sm font-semibold text-[#1A9BB0]"
          >
            Volver a la plaza
          </Link>
        </li>
      </ul>
    </PerfilSection>
  );
}
