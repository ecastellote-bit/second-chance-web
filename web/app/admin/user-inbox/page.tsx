"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { adminFetch } from "@/lib/admin/adminFetch";
import type { UserInboxStatusCounts } from "@/lib/admin/userInboxCounts";
import { matchesUserInboxFilter, type UserInboxListFilter } from "@/lib/admin/userInboxCounts";
import {
  EXIT_TRIGGER_LABEL,
  SURFACE_TYPE_LABEL,
} from "@/lib/admin/userInboxLabels";
import {
  USER_INBOX_ACTION_STATUSES,
  userInboxStatusLabel,
  type UserInboxActionStatus,
  type UserInboxItemKind,
} from "@/lib/admin/userInboxTypes";
import type { FounderExitFeedbackRecord } from "@/lib/learning/founderExitFeedback";
import type { SurfaceInterestLead } from "@/lib/learning/surfaceInterestLeads";

type StoreMeta = {
  backend: string;
  durable: boolean;
  blobConfigured?: boolean;
  requiresBlob?: boolean;
};

type InboxResponse = {
  ok?: boolean;
  surfaceLeads?: SurfaceInterestLead[];
  exitFeedback?: FounderExitFeedbackRecord[];
  totals?: { surfaceLeads: number; exitFeedback: number };
  counts?: UserInboxStatusCounts;
  stores?: {
    surfaceInterest?: StoreMeta;
    exitFeedback?: StoreMeta;
  };
  error?: string;
  message?: string;
};

const FILTER_OPTIONS: { id: UserInboxListFilter; label: string }[] = [
  { id: "active", label: "Activos" },
  { id: "new", label: "Nuevos" },
  { id: "needs_reply", label: "Para responder" },
  { id: "reviewed", label: "Revisados" },
  { id: "archived", label: "Archivados" },
  { id: "hidden", label: "Ocultos" },
  { id: "all", label: "Todos" },
];

const ACTION_BUTTONS: { status: UserInboxActionStatus; label: string; variant: string }[] = [
  { status: "reviewed", label: "Revisado", variant: "border-[#E8EEF3] bg-white text-[#0B2E59]" },
  {
    status: "needs_reply",
    label: "Para responder",
    variant: "border-[#C6D92D]/50 bg-[#F4F9E0] text-[#0B2E59]",
  },
  { status: "archived", label: "Archivar", variant: "border-[#E8EEF3] bg-[#F8FAFC] text-[#6B7A8C]" },
  { status: "hidden", label: "Ocultar", variant: "border-[#E8EEF3] bg-[#F8FAFC] text-[#9AA8B8]" },
];

function statusBadgeClass(status: string): string {
  if (status === "needs_reply") return "bg-[#F4F9E0] text-[#0B2E59]";
  if (status === "new") return "bg-red-50 text-red-800";
  if (status === "archived" || status === "hidden") return "bg-[#F8FAFC] text-[#9AA8B8]";
  return "bg-[#F8FAFC] text-[#6B7A8C]";
}

function SignalActions({
  kind,
  itemId,
  currentStatus,
  busy,
  onAction,
}: {
  kind: UserInboxItemKind;
  itemId: string;
  currentStatus: string;
  busy: boolean;
  onAction: (kind: UserInboxItemKind, itemId: string, status: UserInboxActionStatus) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {ACTION_BUTTONS.map((action) => {
        const active = currentStatus === action.status;
        return (
          <button
            key={action.status}
            type="button"
            disabled={busy || active}
            onClick={() => onAction(kind, itemId, action.status)}
            className={[
              "vu-focus min-h-[36px] rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold disabled:opacity-55",
              action.variant,
              active ? "ring-1 ring-[#0B2E59]/25" : "",
            ].join(" ")}
          >
            {action.label}
          </button>
        );
      })}
    </div>
  );
}

export default function UserInboxAdminPage() {
  const [surfaceLeads, setSurfaceLeads] = useState<SurfaceInterestLead[]>([]);
  const [exitFeedback, setExitFeedback] = useState<FounderExitFeedbackRecord[]>([]);
  const [counts, setCounts] = useState<UserInboxStatusCounts | null>(null);
  const [stores, setStores] = useState<InboxResponse["stores"]>(undefined);
  const [filter, setFilter] = useState<UserInboxListFilter>("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminFetch("/api/admin/user-inbox/list?limit=500");
      const data = (await res.json()) as InboxResponse;
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? data.error ?? "No se pudo cargar el inbox");
      }
      setSurfaceLeads(data.surfaceLeads ?? []);
      setExitFeedback(data.exitFeedback ?? []);
      setCounts(data.counts ?? null);
      setStores(data.stores ?? undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredLeads = useMemo(
    () => surfaceLeads.filter((lead) => matchesUserInboxFilter(lead.status, filter)),
    [surfaceLeads, filter],
  );

  const filteredFeedback = useMemo(
    () => exitFeedback.filter((item) => matchesUserInboxFilter(item.status, filter)),
    [exitFeedback, filter],
  );

  async function applyAction(
    kind: UserInboxItemKind,
    itemId: string,
    adminStatus: UserInboxActionStatus,
  ) {
    setBusyKey(`${kind}:${itemId}`);
    setError("");
    try {
      const res = await adminFetch("/api/admin/user-inbox/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, itemId, adminStatus }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "No se pudo actualizar el estado");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setBusyKey(null);
    }
  }

  const blobWarning =
    stores?.surfaceInterest?.requiresBlob && !stores.surfaceInterest.blobConfigured;

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-8 font-[family-name:var(--font-inter)]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
              Operación fundadora
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#0B2E59]">Señales recibidas de usuarios</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6B7A8C]">
              Intereses con email y feedback de salida. Gestioná estados operativos — el contenido
              original del usuario se conserva intacto.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/admin" className="font-semibold text-[#1A9BB0] underline">
              ← Tablero principal
            </Link>
            <button
              type="button"
              onClick={() => void load()}
              className="text-left font-semibold text-[#0B2E59] underline"
            >
              Actualizar
            </button>
          </div>
        </div>

        {counts ? (
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {[
              { label: "Pendientes", value: counts.attention, accent: "#DC2626" },
              { label: "Nuevos", value: counts.new, accent: "#0B2E59" },
              { label: "Para responder", value: counts.needsReply, accent: "#C6D92D" },
              { label: "Archivados", value: counts.archived, accent: "#6B7A8C" },
              { label: "Ocultos", value: counts.hidden, accent: "#9AA8B8" },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-[#E8EEF3] bg-white px-3 py-2.5 shadow-sm"
              >
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#6B7A8C]">
                  {card.label}
                </p>
                <p className="mt-0.5 text-xl font-extrabold tabular-nums" style={{ color: card.accent }}>
                  {card.value}
                </p>
              </div>
            ))}
            </div>
            {counts.attention === 0 && (filteredLeads.length > 0 || filteredFeedback.length > 0) ? (
              <p className="mt-2 text-[11px] text-[#6B7A8C]">
                Los registros visibles en Activos ya están revisados o atendidos. Nuevos/Pendientes
                suben cuando entra una señal con estado <strong>nuevo</strong>.
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mb-4 flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFilter(option.id)}
              className={[
                "vu-focus rounded-full px-3 py-1.5 text-xs font-semibold",
                filter === option.id
                  ? "bg-[#0B2E59] text-white"
                  : "border border-[#E8EEF3] bg-white text-[#6B7A8C]",
              ].join(" ")}
            >
              {option.label}
            </button>
          ))}
        </div>

        {blobWarning ? (
          <div className="mb-4 rounded-2xl border-2 border-red-300 bg-red-50 px-4 py-4 text-sm text-red-950">
            <p className="font-bold">Blob no configurado en este entorno</p>
            <p className="mt-1">
              En Vercel producción hace falta <code className="text-xs">BLOB_READ_WRITE_TOKEN</code>.
            </p>
          </div>
        ) : null}

        {error ? (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="text-sm text-[#6B7A8C]">Cargando señales…</p>
        ) : (
          <div className="space-y-10">
            <section>
              <h2 className="text-lg font-bold text-[#0B2E59]">
                Intereses con email ({filteredLeads.length}
                {filter !== "all" ? ` / ${surfaceLeads.length}` : ""})
              </h2>
              {filteredLeads.length === 0 ? (
                <p className="mt-4 text-sm text-[#6B7A8C]">No hay intereses en esta vista.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {filteredLeads.map((lead) => (
                    <li
                      key={lead.leadId}
                      className="rounded-2xl border border-[#E8EEF3] bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-[10px] font-mono text-[#6B7A8C]">{lead.leadId}</p>
                        <span
                          className={[
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            statusBadgeClass(lead.status),
                          ].join(" ")}
                        >
                          {userInboxStatusLabel(lead.status)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#6B7A8C]">
                        {new Date(lead.createdAt).toLocaleString("es-AR")} ·{" "}
                        {SURFACE_TYPE_LABEL[lead.surfaceType] ?? lead.surfaceType}
                        {lead.path ? ` · ${lead.path}` : ""}
                        {lead.actionMode ? ` · modo: ${lead.actionMode}` : ""}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[#0B2E59]">{lead.email}</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#243647]">
                        {lead.text}
                      </p>
                      <SignalActions
                        kind="surface_interest"
                        itemId={lead.leadId}
                        currentStatus={lead.status}
                        busy={busyKey === `surface_interest:${lead.leadId}`}
                        onAction={applyAction}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#0B2E59]">
                Feedback de salida /fundador ({filteredFeedback.length}
                {filter !== "all" ? ` / ${exitFeedback.length}` : ""})
              </h2>
              {filteredFeedback.length === 0 ? (
                <p className="mt-4 text-sm text-[#6B7A8C]">No hay feedback en esta vista.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {filteredFeedback.map((item) => (
                    <li
                      key={item.feedbackId}
                      className="rounded-2xl border border-[#E8EEF3] bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-[10px] font-mono text-[#6B7A8C]">{item.feedbackId}</p>
                        <span
                          className={[
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            statusBadgeClass(item.status),
                          ].join(" ")}
                        >
                          {userInboxStatusLabel(item.status)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#6B7A8C]">
                        {new Date(item.createdAt).toLocaleString("es-AR")} ·{" "}
                        {EXIT_TRIGGER_LABEL[item.exitTrigger ?? ""] ??
                          item.exitTrigger ??
                          "sin trigger"}{" "}
                        · {item.submitMode}
                        {item.path ? ` · ${item.path}` : ""}
                      </p>
                      {item.selectedOption ? (
                        <p className="mt-2 text-xs font-semibold text-[#0B2E59]">
                          Opción: {item.selectedOption}
                        </p>
                      ) : null}
                      {item.freeText?.trim() ? (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#243647]">
                          {item.freeText}
                        </p>
                      ) : (
                        <p className="mt-2 text-xs text-[#9AA8B8]">Sin texto libre</p>
                      )}
                      <SignalActions
                        kind="exit_feedback"
                        itemId={item.feedbackId}
                        currentStatus={item.status}
                        busy={busyKey === `exit_feedback:${item.feedbackId}`}
                        onAction={applyAction}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}

        <p className="mt-8 text-[11px] text-[#9AA8B8]">
          Estados permitidos: {USER_INBOX_ACTION_STATUSES.map(userInboxStatusLabel).join(" · ")}
        </p>
      </div>
    </main>
  );
}
