"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { VuMobileShell } from "@/components/layout/VuMobileShell";
import { fetchCommunityMessages } from "@/lib/community/communityClient";
import type { CommunityMessage } from "@/lib/community/types";
import { MENSAJES_COPY } from "@/lib/content/communityInboxCopy";

function MessageCard({ item }: { item: CommunityMessage }) {
  return (
    <article
      className={[
        "rounded-2xl border bg-white p-4 shadow-[0_4px_16px_rgba(15,42,70,0.06)]",
        item.status === "unread"
          ? "border-[#1A9BB0]/35 ring-1 ring-[#1A9BB0]/15"
          : "border-[#E8EEF3]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-[#6B7A8C]">
          {item.from}
        </p>
        {item.status === "unread" ? (
          <span className="rounded-full bg-[#C6D92D] px-2 py-0.5 text-[9px] font-bold text-[#0B2E59]">
            Nuevo
          </span>
        ) : null}
      </div>
      <h2 className="mt-1 text-[15px] font-bold text-[#0B2E59]">{item.subject}</h2>
      <p className="mt-2 text-[13px] leading-relaxed text-[#6B7A8C]">{item.body}</p>
      {item.ctaLabel && item.ctaHref ? (
        <Link
          href={item.ctaHref}
          className="vu-focus mt-3 inline-flex min-h-[40px] items-center text-sm font-semibold text-[#1A9BB0] underline"
        >
          {item.ctaLabel}
        </Link>
      ) : null}
    </article>
  );
}

export function MensajesView() {
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchCommunityMessages().then((items) => {
      if (!cancelled) {
        setMessages(items);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <VuMobileShell navActive="mensajes">
      <div className="px-4 pb-8 pt-2 max-w-lg mx-auto">
        <h1 className="text-[1.65rem] font-bold tracking-tight text-[#0B2E59]">
          {MENSAJES_COPY.title}
        </h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-[#6B7A8C]">
          {MENSAJES_COPY.subtitle}
        </p>

        {loading ? (
          <p className="mt-8 text-sm text-[#6B7A8C]">Cargando mensajes…</p>
        ) : messages.length > 0 ? (
          <div className="mt-6 space-y-3">
            {messages.map((item) => (
              <MessageCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-[#E8EEF3] bg-white p-6 text-center">
            <p className="text-sm font-semibold text-[#0B2E59]">{MENSAJES_COPY.emptyTitle}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-[#6B7A8C]">
              {MENSAJES_COPY.emptyBody}
            </p>
            <Link
              href="/proyectos/sembrar"
              className="vu-focus mt-5 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#0B2E59] px-5 text-sm font-semibold text-white"
            >
              Sembrar un proyecto
            </Link>
          </div>
        )}
      </div>
    </VuMobileShell>
  );
}
