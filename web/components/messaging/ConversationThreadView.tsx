"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatMessageBubbleTime } from "@/lib/messaging/formatMessageTime";
import { MESSAGE_CONTENT_MAX_LENGTH } from "@/lib/messaging/messageTypes";
import type { VuMessage } from "@/lib/messaging/messageTypes";
import { getCachedUserId } from "@/lib/users/activeUserSession";

type OtherProfile = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  slug: string;
};

export function ConversationThreadView({ slug }: { slug: string }) {
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [otherProfile, setOtherProfile] = useState<OtherProfile | null>(null);
  const [messages, setMessages] = useState<VuMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const loadThread = useCallback(async () => {
    const userId = getCachedUserId();
    if (!userId) return;

    setMyUserId(userId);
    setLoading(true);
    setError("");

    try {
      const lookupRes = await fetch(
        `/api/user-profile/lookup?slug=${encodeURIComponent(slug)}`,
      );
      const lookupData = (await lookupRes.json()) as {
        ok?: boolean;
        userId?: string;
        displayName?: string;
        avatarUrl?: string | null;
        slug?: string;
      };

      if (!lookupRes.ok || !lookupData.ok || !lookupData.userId) {
        throw new Error("No encontramos este perfil.");
      }

      const profile: OtherProfile = {
        userId: lookupData.userId,
        displayName: lookupData.displayName ?? "Miembro del barrio",
        avatarUrl: lookupData.avatarUrl ?? null,
        slug: lookupData.slug ?? slug,
      };
      setOtherProfile(profile);

      await fetch("/api/messages/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          readerId: userId,
          senderId: profile.userId,
        }),
      }).catch(() => {});

      const messagesRes = await fetch(
        `/api/messages/conversation?userId=${encodeURIComponent(userId)}&otherUserId=${encodeURIComponent(profile.userId)}&limit=200`,
      );
      const messagesData = (await messagesRes.json()) as {
        ok?: boolean;
        messages?: VuMessage[];
        error?: string;
      };

      if (!messagesRes.ok || !messagesData.ok || !messagesData.messages) {
        throw new Error(messagesData.error ?? "No se pudo cargar la conversación");
      }

      setMessages(messagesData.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la conversación");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void loadThread();
  }, [loadThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    if (!myUserId || !otherProfile) return;

    const trimmed = draft.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: myUserId,
          recipientId: otherProfile.userId,
          content: trimmed,
        }),
      });

      const data = (await res.json()) as { ok?: boolean; message?: VuMessage; error?: string };
      if (!res.ok || !data.ok || !data.message) {
        throw new Error(data.error ?? "No se pudo enviar el mensaje");
      }

      setDraft("");
      setMessages((prev) => [...prev, data.message!]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar el mensaje");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[#F8FAFC] text-base text-[#6B7A8C]">
        Cargando conversación…
      </main>
    );
  }

  if (error && !otherProfile) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#F8FAFC] px-6 text-center">
        <p className="text-lg text-[#243647]">{error}</p>
        <Link
          href="/mensajes"
          className="vu-focus mt-6 inline-flex min-h-[48px] items-center rounded-2xl bg-[#0B2E59] px-6 text-base font-bold text-white"
        >
          Volver a mis mensajes
        </Link>
      </main>
    );
  }

  if (!otherProfile || !myUserId) return null;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#F8FAFC] font-[family-name:var(--font-inter)]">
      <header className="sticky top-0 z-20 border-b border-[#E8EEF3] bg-white px-4 py-4">
        <div className="mx-auto flex max-w-[700px] items-center gap-3">
          <Link
            href="/mensajes"
            className="vu-focus inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl text-[#1A9BB0]"
            aria-label="Volver al inbox"
          >
            ←
          </Link>

          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#1A9BB0]">
            {otherProfile.avatarUrl ? (
              <Image
                src={otherProfile.avatarUrl}
                alt=""
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                {otherProfile.displayName.slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <Link
              href={`/perfil/${otherProfile.slug}`}
              className="vu-focus truncate text-lg font-semibold text-[#0B2E59] underline-offset-2 hover:underline"
            >
              {otherProfile.displayName}
            </Link>
            <p className="text-sm text-[#6B7A8C]">Ver perfil público</p>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[700px] flex-1 flex-col px-4 pb-32 pt-6">
        <div className="flex-1 space-y-4 overflow-y-auto">
          {messages.map((message) => {
            const isMine = message.senderId === myUserId;
            return (
              <div
                key={message.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[85%]">
                  <div
                    className={[
                      "rounded-2xl px-4 py-3 text-base leading-relaxed",
                      isMine
                        ? "bg-amber-100 text-[#243647]"
                        : "bg-slate-100 text-[#243647]",
                    ].join(" ")}
                  >
                    {message.content}
                  </div>
                  <p className="mt-1 text-xs text-[#6B7A8C]">
                    {formatMessageBubbleTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <form
        onSubmit={(event) => void handleSend(event)}
        className="fixed bottom-0 left-0 right-0 border-t border-[#E8EEF3] bg-white px-4 py-4"
      >
        <div className="mx-auto flex max-w-[700px] flex-col gap-2">
          {error ? (
            <p className="text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1">
              <span className="sr-only">Escribir respuesta</span>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={2}
                maxLength={MESSAGE_CONTENT_MAX_LENGTH}
                placeholder="Escribí tu respuesta..."
                className="min-h-[48px] w-full rounded-xl border border-[#E8EEF3] px-4 py-3 text-base text-[#243647]"
              />
            </label>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={sending || !draft.trim()}
              className="sm:min-w-[120px]"
            >
              {sending ? "Enviando..." : "Enviar"}
            </Button>
          </div>
          <p className="text-sm text-[#6B7A8C]">
            {draft.length} / {MESSAGE_CONTENT_MAX_LENGTH}
          </p>
        </div>
      </form>
    </div>
  );
}
