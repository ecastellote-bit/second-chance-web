"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DirectMessagesInbox } from "@/components/messaging/DirectMessagesInbox";
import { VuMobileShell } from "@/components/layout/VuMobileShell";
import { BarrioNotificationHeader } from "@/components/notifications/NotificationBell";
import { SessionContinueLinks } from "@/components/perfil/SessionContinueLinks";
import { MensajesView } from "@/components/community/MensajesView";
import {
  fetchClientSessionGate,
  getCachedUserId,
} from "@/lib/users/activeUserSession";

function CommunityMessagesSection() {
  return (
    <section className="mt-10 border-t border-[#E8EEF3] pt-8" aria-labelledby="barrio-messages-title">
      <h2 id="barrio-messages-title" className="text-xl font-bold text-[#0B2E59]">
        Avisos del barrio
      </h2>
      <p className="mt-2 text-base text-[#6B7A8C]">
        Notificaciones y señales del equipo — distintas de tus conversaciones directas.
      </p>
      <div className="mt-4">
        <MensajesView embedded />
      </div>
    </section>
  );
}

export function MessagesHubView() {
  const [totalUnread, setTotalUnread] = useState(0);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [canUseInbox, setCanUseInbox] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const gate = await fetchClientSessionGate();
      if (cancelled) return;
      // Lectura de inbox: basta con identidad local + perfil usable (incluye email_missing).
      const ok =
        Boolean(gate.userId || getCachedUserId()) &&
        (gate.allowed ||
          gate.reason === "email_missing" ||
          gate.reason === "profile_incomplete");
      setCanUseInbox(ok);
      setSessionChecked(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <VuMobileShell navActive="mensajes">
      <BarrioNotificationHeader />
      <div className="mx-auto max-w-2xl px-4 pb-8 pt-2">
        <Link
          href="/community/conectar_con_otros"
          className="text-sm font-semibold text-[#1A9BB0] underline"
        >
          ← Directorio Connect
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-[1.85rem] font-bold tracking-tight text-[#0B2E59]">
            Mis mensajes
          </h1>
          {canUseInbox && totalUnread > 0 ? (
            <span className="inline-flex min-h-[32px] items-center rounded-full bg-[#C6D92D] px-3 text-sm font-bold text-[#0B2E59]">
              {totalUnread} nuevo{totalUnread === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-base leading-relaxed text-[#6B7A8C]">
          Tus conversaciones directas con otras personas del barrio.
        </p>

        {!sessionChecked ? (
          <p className="mt-6 text-base text-[#6B7A8C]">Comprobando tu sesión…</p>
        ) : null}

        {sessionChecked && !canUseInbox ? (
          <div className="mt-6 space-y-4">
            <SessionContinueLinks
              returnTo="/mensajes"
              title="Para ver tus mensajes, necesitamos tu perfil"
              body="Si ya tenés perfil, retomaló con el email de este o otro dispositivo. Si es la primera vez, crealo — después volvés acá."
            />
            <Link
              href="/community/conectar_con_otros"
              className="vu-focus inline-flex min-h-[48px] items-center text-base font-semibold text-[#1A9BB0] underline"
            >
              Mientras tanto, explorá el directorio Connect
            </Link>
          </div>
        ) : null}

        {sessionChecked && canUseInbox ? (
          <>
            <div className="mt-6">
              <DirectMessagesInbox hideTitle onTotalUnreadChange={setTotalUnread} />
            </div>
            <CommunityMessagesSection />
          </>
        ) : null}
      </div>
    </VuMobileShell>
  );
}
