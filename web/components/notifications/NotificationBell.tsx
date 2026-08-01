"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
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
  return `Hace ${days} días`;
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    const id = getCachedUserId();
    setUserId(id);
    if (!id) {
      setItems([]);
      setUnreadCount(0);
      return;
    }
    try {
      const res = await fetch(
        `/api/notificaciones?userId=${encodeURIComponent(id)}&limit=5`,
      );
      const data = (await res.json()) as {
        ok?: boolean;
        notifications?: InAppNotification[];
        unreadCount?: number;
      };
      if (res.ok && data.ok) {
        setItems(data.notifications ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch {
      // silencioso
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 45000);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  async function openItem(item: InAppNotification) {
    if (!userId) return;
    if (!item.read) {
      await fetch(`/api/notificaciones/${encodeURIComponent(item.id)}/leer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      }).catch(() => {});
    }
    setOpen(false);
    router.push(item.data.url || "/notificaciones");
    void load();
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          void load();
        }}
        className="vu-focus relative inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl text-[#0B2E59]"
        aria-label="Notificaciones"
        aria-expanded={open}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 sm:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 z-50 mt-2 w-[min(100vw-1.5rem,360px)] max-h-[400px] overflow-y-auto rounded-[12px] border border-[#E8EEF3] bg-white p-3 shadow-[0_12px_32px_rgba(11,46,89,0.16)] sm:w-[360px]">
            <div className="mb-3 flex items-center justify-between gap-2 px-1">
              <p className="text-base font-semibold text-[#0B2E59]">Notificaciones</p>
              <Link
                href="/notificaciones"
                className="text-sm font-semibold text-[#1A9BB0] underline"
                onClick={() => setOpen(false)}
              >
                Ver todas
              </Link>
            </div>

            {items.length === 0 ? (
              <p className="px-2 py-6 text-center text-base text-[#6B7A8C]">
                No tenés notificaciones nuevas
              </p>
            ) : (
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => void openItem(item)}
                      className={[
                        "vu-focus w-full rounded-xl px-3 py-3 text-left",
                        item.read ? "bg-transparent" : "border-l-[3px] border-[#1A9BB0] bg-[#F8FAFC]",
                      ].join(" ")}
                    >
                      <div className="flex gap-2">
                        <span className="text-lg" aria-hidden>
                          {IN_APP_NOTIFICATION_ICON[item.type]}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-semibold text-[#0B2E59]">
                            {item.title}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-sm text-[#6B7A8C]">
                            {item.body}
                          </p>
                          <p className="mt-1 text-xs text-[#94A3B8]">
                            {relativeTime(item.createdAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

/** Header top-right de páginas del barrio. */
export function BarrioNotificationHeader() {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-end bg-[#F8FAFC]/95 px-4 py-2 backdrop-blur">
      <NotificationBell />
    </div>
  );
}
