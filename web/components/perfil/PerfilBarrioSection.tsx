"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PerfilSection } from "@/components/perfil/PerfilSection";
import { fetchCommunityActivities, fetchCommunityMessages } from "@/lib/community/communityClient";
import { getFoundingMemberArchiveId } from "@/lib/learning/foundationalMember";
import type { UserProfileClientView } from "@/lib/users/userProfileTypes";

function resolveDiagnosticArchiveId(profile: UserProfileClientView): string {
  const fromProfile = profile.diagnosticArchiveId?.trim() ?? "";
  if (fromProfile) return fromProfile;
  return getFoundingMemberArchiveId()?.trim() ?? "";
}

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

  return (
    <PerfilSection title="Tu barrio" hint="Conexión con el ecosistema — sin red social">
      <ul className="space-y-2">
        <li>
          {diagnosticArchiveId ? (
            <Link
              href={`/full/result/archivo/${encodeURIComponent(diagnosticArchiveId)}`}
              className="vu-focus flex min-h-[44px] items-center justify-between rounded-2xl bg-[#F8FAFC] px-3 py-2.5 ring-1 ring-[#E8EEF3] hover:bg-[#E6F6FA]"
            >
              <span className="text-sm font-semibold text-[#0B2E59]">Ver mi diagnóstico</span>
              <span className="text-[11px] text-[#1A9BB0]">Archivo</span>
            </Link>
          ) : (
            <Link
              href="/comenzar"
              className="vu-focus flex min-h-[44px] items-center justify-between rounded-2xl bg-[#0B2E59] px-3 py-2.5 text-white hover:bg-[#0a274f]"
            >
              <span className="text-sm font-semibold">Iniciar lectura vocacional</span>
              <span className="text-[11px] text-white/80">Diagnóstico</span>
            </Link>
          )}
        </li>
        <li>
          <Link
            href="/actividad"
            className="vu-focus flex min-h-[44px] items-center justify-between rounded-2xl bg-[#F8FAFC] px-3 py-2.5 ring-1 ring-[#E8EEF3] hover:bg-[#E6F6FA]"
          >
            <span className="text-sm font-semibold text-[#0B2E59]">Actividad</span>
            <span className="text-[11px] text-[#6B7A8C]">
              {activityCount > 0 ? `${activityCount} movimientos` : "Sin movimientos aún"}
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/mensajes"
            className="vu-focus flex min-h-[44px] items-center justify-between rounded-2xl bg-[#F8FAFC] px-3 py-2.5 ring-1 ring-[#E8EEF3] hover:bg-[#E6F6FA]"
          >
            <span className="text-sm font-semibold text-[#0B2E59]">Mensajes</span>
            <span className="text-[11px] text-[#6B7A8C]">
              {unreadCount > 0 ? `${unreadCount} sin leer` : "Bandeja del equipo"}
            </span>
          </Link>
        </li>
        {hasSeed ? (
          <li>
            <Link
              href="/proyectos"
              className="vu-focus flex min-h-[44px] items-center justify-between rounded-2xl bg-[#F4F9E0] px-3 py-2.5 ring-1 ring-[#C6D92D]/40 hover:bg-[#eef5d0]"
            >
              <span className="text-sm font-semibold text-[#0B2E59]">Proyecto sembrado</span>
              <span className="text-[11px] text-[#6B7A8C]">Ver estado</span>
            </Link>
          </li>
        ) : (
          <li>
            <Link
              href="/proyectos/sembrar"
              className="vu-focus flex min-h-[44px] items-center justify-between rounded-2xl bg-[#0B2E59] px-3 py-2.5 text-white"
            >
              <span className="text-sm font-semibold">Sembrar un proyecto</span>
            </Link>
          </li>
        )}
        <li>
          <Link
            href="/plaza"
            className="vu-focus flex min-h-[44px] items-center justify-center rounded-2xl border border-[#1A9BB0]/30 px-3 py-2.5 text-sm font-semibold text-[#1A9BB0]"
          >
            Volver a la plaza
          </Link>
        </li>
      </ul>
    </PerfilSection>
  );
}
