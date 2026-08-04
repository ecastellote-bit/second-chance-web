"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { VuMobileShell } from "@/components/layout/VuMobileShell";
import { resolveMessageCta } from "@/lib/community/activityCta";
import { fetchCommunityMessages } from "@/lib/community/communityClient";
import type { CommunityMessage } from "@/lib/community/types";
import { MENSAJES_COPY } from "@/lib/content/communityInboxCopy";

function MessageCard({ item }: { item: CommunityMessage }) {
  const cta = resolveMessageCta(item);

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
      {cta ? (
        <Link
          href={cta.href}
          className="vu-focus mt-3 inline-flex min-h-[40px] items-center text-sm font-semibold text-[#1A9BB0] underline"
        >
          {cta.label}
        </Link>
      ) : null}
    </article>
  );
}

export function MensajesView({ embedded = false }: { embedded?: boolean }) {
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

  const content = (
    <div className={embedded ? "" : "px-4 pb-8 pt-2 max-w-lg mx-auto"}>
      {!embedded ? (
        <>
          <h1 className="text-[1.65rem] font-bold tracking-tight text-[#0B2E59]">
            {MENSAJES_COPY.title}
          </h1>
          <p className="mt-1.5 text-[15px] leading-relaxed text-[#6B7A8C]">
            {MENSAJES_COPY.subtitle}
          </p>
        </>
      ) : null}

      {loading ? (
        <p className={embedded ? "mt-2 text-sm text-[#6B7A8C]" : "mt-8 text-sm text-[#6B7A8C]"}>
          Cargando avisos…
        </p>
      ) : messages.length > 0 ? (
        <div className={embedded ? "mt-3 space-y-3" : "mt-6 space-y-3"}>
          {messages.map((item) => (
            <MessageCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className={embedded ? "mt-3 rounded-2xl border border-[#E8EEF3] bg-white p-5 text-center" : "mt-8 rounded-2xl border border-[#E8EEF3] bg-white p-6 text-center"}>
          <p className="text-sm font-semibold text-[#0B2E59]">{MENSAJES_COPY.emptyTitle}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-[#6B7A8C]">
            {MENSAJES_COPY.emptyBody}
          </p>
          <div
            className={
              embedded
                ? "mt-4 flex flex-col gap-2"
                : "mt-5 flex flex-col gap-2"
            }
          >
            {MENSAJES_COPY.emptyHints.map((hint) => (
              <Link
                key={hint.href}
                href={hint.href}
                className="vu-focus rounded-xl border border-[#0B2E59]/15 px-4 py-3 text-sm font-semibold text-[#0B2E59]"
              >
                {hint.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (embedded) return content;

  return <VuMobileShell navActive="mensajes">{content}</VuMobileShell>;
}
