"use client";

import { adminFetch } from "@/lib/admin/adminFetch";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  NOTIFICATION_EVENT_ADMIN_COPY,
  NOTIFICATION_EVENT_STATUS_LABEL,
  NOTIFICATION_EVENT_TYPE_LABEL,
  NOTIFICATION_SKIP_REASON_LABEL,
} from "@/lib/learning/notificationEventCopy";
import type {
  NotificationEventStatus,
  NotificationEventType,
  NotificationSkipReason,
} from "@/lib/learning/notificationEvents";

type EventRow = {
  notificationId: string;
  userId: string;
  email: string | null;
  type: NotificationEventType;
  title: string;
  body: string;
  targetType: string;
  targetId: string;
  status: NotificationEventStatus;
  skipReason: NotificationSkipReason | null;
  dedupeKey: string;
  error: string | null;
  createdAt: string;
  updatedAt: string;
};

const STATUS_FILTERS: { id: "" | NotificationEventStatus; label: string }[] = [
  { id: "", label: "Todos" },
  { id: "pending", label: NOTIFICATION_EVENT_STATUS_LABEL.pending },
  { id: "sent", label: NOTIFICATION_EVENT_STATUS_LABEL.sent },
  { id: "skipped", label: NOTIFICATION_EVENT_STATUS_LABEL.skipped },
  { id: "failed", label: NOTIFICATION_EVENT_STATUS_LABEL.failed },
];

const TYPE_FILTERS: { id: "" | NotificationEventType; label: string }[] = [
  { id: "", label: "Todos los tipos" },
  ...(
    Object.entries(NOTIFICATION_EVENT_TYPE_LABEL) as [NotificationEventType, string][]
  ).map(([id, label]) => ({ id, label })),
];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-AR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function NotificationEventsAdminPage() {
  const copy = NOTIFICATION_EVENT_ADMIN_COPY;
  const [items, setItems] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | NotificationEventStatus>("");
  const [typeFilter, setTypeFilter] = useState<"" | NotificationEventType>("");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "400" });
      if (statusFilter) params.set("status", statusFilter);
      if (typeFilter) params.set("type", typeFilter);
      if (userIdFilter.trim()) params.set("userId", userIdFilter.trim());
      const res = await adminFetch(`/api/admin/notification-events/list?${params.toString()}`);
      const data = (await res.json()) as {
        ok?: boolean;
        events?: EventRow[];
        error?: string;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? data.error ?? "Error al cargar eventos");
      }
      setItems(data.events ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, userIdFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(
    notificationId: string,
    status: NotificationEventStatus,
    errorNote?: string,
  ) {
    setUpdatingId(notificationId);
    setError("");
    try {
      const res = await adminFetch(
        `/api/admin/notification-events/${encodeURIComponent(notificationId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            error: errorNote ?? null,
          }),
        },
      );
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "No se pudo actualizar");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-8 font-[family-name:var(--font-inter)]">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
            Admin · Comunidad
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[#0B2E59]">{copy.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6B7A8C]">{copy.subcopy}</p>
          <p className="mt-2 text-xs text-[#6B7A8C]">{copy.manualStatusNote}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/admin/founder-project-seeds" className="font-semibold text-[#1A9BB0] underline">
              Proyectos sembrados
            </Link>
            <Link
              href="/admin/founder-project-signals"
              className="font-semibold text-[#1A9BB0] underline"
            >
              Señales de proyecto
            </Link>
            <Link href="/admin/formation-suggestions" className="font-semibold text-[#1A9BB0] underline">
              Sugerencias formación
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-[#E8EEF3] bg-white p-4">
          <label className="text-sm">
            <span className="font-semibold text-[#0B2E59]">Estado</span>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "" | NotificationEventStatus)
              }
              className="mt-1 block rounded-lg border border-[#E8EEF3] px-3 py-2 text-sm"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f.id || "all"} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-semibold text-[#0B2E59]">Tipo</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as "" | NotificationEventType)}
              className="mt-1 block rounded-lg border border-[#E8EEF3] px-3 py-2 text-sm"
            >
              {TYPE_FILTERS.map((f) => (
                <option key={f.id || "all"} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-[200px] flex-1 text-sm">
            <span className="font-semibold text-[#0B2E59]">userId</span>
            <input
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              placeholder="vu_…"
              className="mt-1 w-full rounded-lg border border-[#E8EEF3] px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-xl bg-[#0B2E59] px-4 py-2 text-sm font-semibold text-white"
          >
            Filtrar
          </button>
        </div>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {loading ? (
          <p className="text-sm text-[#6B7A8C]">Cargando eventos…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-[#6B7A8C]">No hay eventos con estos filtros.</p>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => (
              <li
                key={item.notificationId}
                className="rounded-2xl border border-[#E8EEF3] bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-[#6B7A8C]">{formatDate(item.createdAt)}</p>
                    <p className="mt-1 text-sm font-bold text-[#0B2E59]">
                      {NOTIFICATION_EVENT_TYPE_LABEL[item.type]}
                    </p>
                    <p className="text-sm font-semibold text-[#243647]">{item.title}</p>
                  </div>
                  <span className="rounded-full bg-[#E6F6FA] px-3 py-1 text-xs font-semibold text-[#0B2E59]">
                    {NOTIFICATION_EVENT_STATUS_LABEL[item.status]}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#6B7A8C]">{item.body}</p>
                <dl className="mt-3 grid gap-1 text-xs text-[#6B7A8C] sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold text-[#0B2E59]">userId</dt>
                    <dd className="break-all">{item.userId}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#0B2E59]">email (admin)</dt>
                    <dd>{item.email ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#0B2E59]">target</dt>
                    <dd>
                      {item.targetType} · {item.targetId}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#0B2E59]">dedupeKey</dt>
                    <dd className="break-all">{item.dedupeKey}</dd>
                  </div>
                  {item.skipReason ? (
                    <div>
                      <dt className="font-semibold text-[#0B2E59]">skipReason</dt>
                      <dd>
                        {NOTIFICATION_SKIP_REASON_LABEL[item.skipReason] ?? item.skipReason}
                      </dd>
                    </div>
                  ) : null}
                  {item.error ? (
                    <div>
                      <dt className="font-semibold text-[#0B2E59]">error</dt>
                      <dd>{item.error}</dd>
                    </div>
                  ) : null}
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.status !== "sent" ? (
                    <button
                      type="button"
                      disabled={updatingId === item.notificationId}
                      onClick={() => void updateStatus(item.notificationId, "sent")}
                      className="rounded-lg bg-[#0B2E59] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      {copy.actions.markSent}
                    </button>
                  ) : null}
                  {item.status !== "skipped" ? (
                    <button
                      type="button"
                      disabled={updatingId === item.notificationId}
                      onClick={() => void updateStatus(item.notificationId, "skipped")}
                      className="rounded-lg border border-[#E8EEF3] px-3 py-1.5 text-xs font-semibold text-[#6B7A8C] disabled:opacity-60"
                    >
                      {copy.actions.markSkipped}
                    </button>
                  ) : null}
                  {item.status !== "failed" ? (
                    <button
                      type="button"
                      disabled={updatingId === item.notificationId}
                      onClick={() =>
                        void updateStatus(
                          item.notificationId,
                          "failed",
                          "Marcado manualmente con error (sin envío real)",
                        )
                      }
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-800 disabled:opacity-60"
                    >
                      {copy.actions.markFailed}
                    </button>
                  ) : null}
                  {item.status !== "pending" ? (
                    <button
                      type="button"
                      disabled={updatingId === item.notificationId}
                      onClick={() => void updateStatus(item.notificationId, "pending")}
                      className="rounded-lg border border-[#1A9BB0]/40 px-3 py-1.5 text-xs font-semibold text-[#1A9BB0] disabled:opacity-60"
                    >
                      {copy.actions.markPending}
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
