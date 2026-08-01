"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BarrioNotificationHeader } from "@/components/notifications/NotificationBell";
import { Button } from "@/components/ui/Button";
import { getCachedUserId } from "@/lib/users/activeUserSession";
import {
  IN_APP_NOTIFICATION_ICON,
  type InAppNotification,
} from "@/lib/in-app-notifications/inAppNotificationTypes";

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Ayer";
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });
}

export function NotificacionesInboxView() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (cursor?: string | null, append = false) => {
    const id = getCachedUserId();
    if (!id) {
      router.replace("/perfil/crear?redirect=%2Fnotificaciones");
      return;
    }
    setUserId(id);
    if (!append) setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("userId", id);
      params.set("limit", "20");
      if (cursor) params.set("cursor", cursor);
      const res = await fetch(`/api/notificaciones?${params.toString()}`);
      const data = (await res.json()) as {
        ok?: boolean;
        notifications?: InAppNotification[];
        unreadCount?: number;
        nextCursor?: string | null;
        error?: string;
      };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Error");
      setItems((prev) =>
        append ? [...prev, ...(data.notifications ?? [])] : data.notifications ?? [],
      );
      setUnreadCount(data.unreadCount ?? 0);
      setNextCursor(data.nextCursor ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load(null, false);
  }, [load]);

  async function markAll() {
    if (!userId) return;
    await fetch("/api/notificaciones/leer-todas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    await load(null, false);
  }

  async function markOne(item: InAppNotification) {
    if (!userId) return;
    if (!item.read) {
      await fetch(`/api/notificaciones/${encodeURIComponent(item.id)}/leer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
    }
    router.push(item.data.url || "/notificaciones");
  }

  async function removeOne(item: InAppNotification) {
    if (!userId) return;
    await fetch(`/api/notificaciones/${encodeURIComponent(item.id)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setItems((prev) => prev.filter((n) => n.id !== item.id));
  }

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC]">
      <BarrioNotificationHeader />
      <div className="mx-auto max-w-2xl px-4 pb-16 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[1.75rem] font-bold text-[#0B2E59]">Notificaciones</h1>
          {unreadCount > 0 ? (
            <Button type="button" variant="secondary" size="lg" onClick={() => void markAll()}>
              Marcar todas como leídas
            </Button>
          ) : null}
        </div>

        {loading ? (
          <p className="mt-8 text-base text-[#6B7A8C]">Cargando…</p>
        ) : null}
        {error ? <p className="mt-8 text-base text-red-600">{error}</p> : null}

        {!loading && !error && items.length === 0 ? (
          <div className="mt-8 rounded-[12px] border border-[#E8EEF3] bg-white p-8 text-center">
            <p className="text-lg text-[#243647]">
              No tenés notificaciones. ¡Interactuá con la comunidad!
            </p>
            <Link
              href="/comunidad"
              className="vu-focus mt-4 inline-flex min-h-[48px] items-center text-base font-semibold text-[#1A9BB0] underline"
            >
              Ir a la Comunidad
            </Link>
          </div>
        ) : null}

        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className={[
                "rounded-[12px] border border-[#E8EEF3] bg-white p-4",
                item.read ? "" : "border-l-[3px] border-l-[#1A9BB0] bg-[#F8FAFC]",
              ].join(" ")}
            >
              <div className="flex gap-3">
                <span className="text-2xl" aria-hidden>
                  {IN_APP_NOTIFICATION_ICON[item.type]}
                </span>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    className="vu-focus w-full text-left"
                    onClick={() => void markOne(item)}
                  >
                    <p className="text-base font-semibold text-[#0B2E59]">{item.title}</p>
                    <p className="mt-1 text-base text-[#6B7A8C]">{item.body}</p>
                    <p className="mt-2 text-xs text-[#94A3B8]">
                      {relativeTime(item.createdAt)}
                    </p>
                  </button>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!item.read ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="lg"
                        onClick={() => void markOne(item)}
                      >
                        Abrir
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      size="lg"
                      onClick={() => void removeOne(item)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {nextCursor ? (
          <div className="mt-6 flex justify-center">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => void load(nextCursor, true)}
            >
              Cargar más
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
