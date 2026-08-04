"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatRelativeConversationDate } from "@/lib/messaging/formatMessageTime";
import type { VuConversationSummary } from "@/lib/messaging/messageTypes";
import { getCachedUserId } from "@/lib/users/activeUserSession";

function ConversationSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-4 rounded-2xl border border-[#E8EEF3] bg-white p-4">
      <div className="h-10 w-10 rounded-full bg-[#E8EEF3]" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 rounded bg-[#E8EEF3]" />
        <div className="h-3 w-2/3 rounded bg-[#F1F5F9]" />
      </div>
    </div>
  );
}

type DirectMessagesInboxProps = {
  hideTitle?: boolean;
  onTotalUnreadChange?: (count: number) => void;
};

export function DirectMessagesInbox({
  hideTitle = false,
  onTotalUnreadChange,
}: DirectMessagesInboxProps = {}) {
  const [conversations, setConversations] = useState<VuConversationSummary[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadConversations = useCallback(async () => {
    const userId = getCachedUserId();
    if (!userId) {
      setLoading(false);
      setError("");
      setConversations([]);
      setTotalUnread(0);
      onTotalUnreadChange?.(0);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/messages/conversations?userId=${encodeURIComponent(userId)}`,
      );
      const data = (await res.json()) as {
        ok?: boolean;
        conversations?: VuConversationSummary[];
        totalUnread?: number;
        error?: string;
      };

      if (!res.ok || !data.ok || !data.conversations) {
        throw new Error(
          data.error === "user_id_required"
            ? "Retomá tu perfil en este dispositivo para ver conversaciones."
            : data.error ?? "No se pudieron cargar las conversaciones",
        );
      }

      const unread = data.totalUnread ?? 0;
      setConversations(data.conversations);
      setTotalUnread(unread);
      onTotalUnreadChange?.(unread);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Hubo un problema al cargar tus mensajes. Intentá de nuevo en unos minutos.",
      );
    } finally {
      setLoading(false);
    }
  }, [onTotalUnreadChange]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  return (
    <section aria-labelledby={hideTitle ? undefined : "direct-messages-title"}>
      {!hideTitle ? (
        <div className="flex items-center gap-3">
          <h2 id="direct-messages-title" className="text-2xl font-bold text-[#0B2E59]">
            Conversaciones
          </h2>
          {totalUnread > 0 ? (
            <span className="inline-flex min-h-[32px] items-center rounded-full bg-[#C6D92D] px-3 text-sm font-bold text-[#0B2E59]">
              {totalUnread} nuevo{totalUnread === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <ConversationSkeleton key={`conv-skeleton-${index}`} />
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
          <p className="text-base text-[#243647]">{error}</p>
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="mt-4"
            onClick={() => void loadConversations()}
          >
            Reintentar
          </Button>
        </div>
      ) : null}

      {!loading && !error && conversations.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-[#E8EEF3] bg-[#F8FAFC] p-8 text-center">
          <p className="text-lg leading-relaxed text-[#243647]">
            Todavía no tenés mensajes. Cuando contactes a alguien desde el directorio o un
            perfil público, la conversación aparece acá.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/community/conectar_con_otros"
              className="vu-focus inline-flex min-h-[48px] items-center rounded-2xl bg-[#0B2E59] px-6 text-base font-bold text-white"
            >
              Ir al directorio Connect
            </Link>
            <Link
              href="/comunidad"
              className="vu-focus inline-flex min-h-[48px] items-center rounded-2xl border border-[#E8EEF3] bg-white px-6 text-base font-semibold text-[#0B2E59]"
            >
              Ver la comunidad
            </Link>
          </div>
        </div>
      ) : null}

      {!loading && !error && conversations.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {conversations.map((conversation) => {
            const href = conversation.otherUserSlug
              ? `/mensajes/${conversation.otherUserSlug}`
              : `/mensajes/thread?userId=${encodeURIComponent(conversation.otherUserId)}`;

            return (
              <li key={`${conversation.participantA}-${conversation.participantB}`}>
                <Link
                  href={href}
                  className={[
                    "vu-focus flex items-center gap-4 rounded-2xl border p-4 transition",
                    conversation.unreadCount > 0
                      ? "border-[#1A9BB0]/30 bg-[#FFFBEB] shadow-sm"
                      : "border-[#E8EEF3] bg-white",
                  ].join(" ")}
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#1A9BB0]">
                    {conversation.otherUserAvatar ? (
                      <Image
                        src={conversation.otherUserAvatar}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                        {conversation.otherUserName.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-base font-semibold text-[#0B2E59]">
                        {conversation.otherUserName}
                      </p>
                      <span className="shrink-0 text-sm text-[#6B7A8C]">
                        {formatRelativeConversationDate(conversation.lastMessageAt)}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-[#6B7A8C]">
                      {conversation.lastMessagePreview}
                    </p>
                  </div>

                  {conversation.unreadCount > 0 ? (
                    <span className="shrink-0 rounded-full bg-[#C6D92D] px-2.5 py-1 text-xs font-bold text-[#0B2E59]">
                      {conversation.unreadCount}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
