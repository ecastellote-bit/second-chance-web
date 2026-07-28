"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DirectMessagesInbox } from "@/components/messaging/DirectMessagesInbox";
import { VuMobileShell } from "@/components/layout/VuMobileShell";
import { getCachedUserId } from "@/lib/users/activeUserSession";
import { MensajesView } from "@/components/community/MensajesView";

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
  const router = useRouter();
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (!getCachedUserId()) {
      router.replace("/perfil/crear?redirect=%2Fmensajes");
    }
  }, [router]);

  return (
    <VuMobileShell navActive="mensajes">
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
          {totalUnread > 0 ? (
            <span className="inline-flex min-h-[32px] items-center rounded-full bg-[#C6D92D] px-3 text-sm font-bold text-[#0B2E59]">
              {totalUnread} nuevo{totalUnread === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-base leading-relaxed text-[#6B7A8C]">
          Tus conversaciones directas con otras personas del barrio.
        </p>

        <div className="mt-6">
          <DirectMessagesInbox hideTitle onTotalUnreadChange={setTotalUnread} />
        </div>

        <CommunityMessagesSection />
      </div>
    </VuMobileShell>
  );
}
