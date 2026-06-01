"use client";

import { adminFetch } from "@/lib/admin/adminFetch";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  CIRCLE_SIGNAL_ADMIN_MODERATION_HELP,
  CIRCLE_SIGNAL_STATUS_FILTER,
  CIRCLE_SIGNAL_STATUS_LABEL,
  CIRCLE_SIGNAL_TYPE_LABEL,
} from "@/lib/community/circleSignalAdminCopy";
import type {
  CircleIdeaPublicStatus,
  CircleSignalStatus,
  CircleSignalType,
} from "@/lib/learning/circleSignals";

type SignalRow = {
  signalId: string;
  circleId: string;
  circleTitle: string;
  actorUserId: string;
  signalType: CircleSignalType;
  note?: string;
  status: CircleSignalStatus;
  publicStatus?: CircleIdeaPublicStatus;
  publicText?: string;
  createdAt: string;
  updatedAt?: string;
};

export default function CircleSignalsAdminPage() {
  const [signals, setSignals] = useState<SignalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | CircleSignalStatus>("active");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [publicTextDraft, setPublicTextDraft] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "400" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await adminFetch(`/api/admin/circle-signals/list?${params.toString()}`);
      const data = (await res.json()) as {
        ok?: boolean;
        signals?: SignalRow[];
        error?: string;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? data.error ?? "Error al cargar señales");
      }
      setSignals(data.signals ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function approveVisibility(signalId: string) {
    setUpdatingId(signalId);
    setError("");
    try {
      const res = await adminFetch(`/api/admin/circle-signals/${encodeURIComponent(signalId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve_visibility",
          publicText: publicTextDraft,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(
          data.error === "circle_idea_public_text_invalid"
            ? "El texto público debe tener al menos 20 caracteres."
            : (data.error ?? "No se pudo aprobar"),
        );
      }
      setApprovingId(null);
      setPublicTextDraft("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al aprobar");
    } finally {
      setUpdatingId(null);
    }
  }

  async function hideVisibility(signalId: string) {
    setUpdatingId(signalId);
    setError("");
    try {
      const res = await adminFetch(`/api/admin/circle-signals/${encodeURIComponent(signalId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "hide_visibility" }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "No se pudo ocultar");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al ocultar");
    } finally {
      setUpdatingId(null);
    }
  }

  async function updateStatus(signalId: string, status: "reviewed" | "flagged" | "archived") {
    setUpdatingId(signalId);
    setError("");
    try {
      const res = await adminFetch(`/api/admin/circle-signals/${encodeURIComponent(signalId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
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
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
              Círculos fundadores · P1-E2
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#0B2E59]">Señales de círculos</h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7A8C]">
              Interés, movimiento, acceso e ideas — sin contacto directo automático. Ninguna acción
              de esta bandeja publica contenido en el barrio por sí sola.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/admin/founder-project-signals" className="font-semibold text-[#1A9BB0] underline">
              Señales de proyectos →
            </Link>
            <Link href="/circulos" className="font-semibold text-[#1A9BB0] underline">
              Ver círculos públicos →
            </Link>
          </div>
        </div>

        <section className="mb-4 rounded-xl border border-[#E8EEF3] bg-white p-4 text-sm">
          <p className="font-bold text-[#0B2E59]">Qué hace cada acción</p>
          <ul className="mt-2 space-y-2 text-[#6B7A8C]">
            {CIRCLE_SIGNAL_ADMIN_MODERATION_HELP.map((item) => (
              <li key={item.action}>
                <span className="font-semibold text-[#243647]">{item.action}:</span> {item.meaning}
              </li>
            ))}
          </ul>
        </section>

        <div className="mb-4 flex flex-wrap gap-2">
          {CIRCLE_SIGNAL_STATUS_FILTER.map((item) => (
            <button
              key={item.id || "all"}
              type="button"
              onClick={() => setStatusFilter(item.id)}
              className={[
                "rounded-full px-3 py-1.5 text-xs font-semibold",
                statusFilter === item.id
                  ? "bg-[#0B2E59] text-white"
                  : "border border-[#E8EEF3] bg-white text-[#6B7A8C]",
              ].join(" ")}
            >
              {item.label}
            </button>
          ))}
        </div>

        {error ? (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="text-sm text-[#6B7A8C]">Cargando…</p>
        ) : signals.length === 0 ? (
          <p className="rounded-xl border border-[#E8EEF3] bg-white p-6 text-sm text-[#6B7A8C]">
            No hay señales con este filtro.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {signals.map((signal) => (
              <li
                key={signal.signalId}
                className="rounded-xl border border-[#E8EEF3] bg-white p-4 text-sm"
              >
                <p className="font-bold text-[#0B2E59]">
                  {signal.circleTitle}{" "}
                  <span className="font-normal text-[#6B7A8C]">({signal.circleId})</span>
                </p>
                <p className="mt-1 text-[#6B7A8C]">
                  {CIRCLE_SIGNAL_TYPE_LABEL[signal.signalType]} ·{" "}
                  {CIRCLE_SIGNAL_STATUS_LABEL[signal.status] ?? signal.status} ·{" "}
                  {new Date(signal.createdAt).toLocaleString("es-AR")}
                </p>
                {signal.note ? (
                  <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[#243647]">
                    <span className="text-[10px] font-bold uppercase text-amber-800">
                      Nota interna (no pública)
                    </span>
                    <br />
                    {signal.note}
                  </p>
                ) : null}
                {signal.publicStatus === "visible" && signal.publicText ? (
                  <p className="mt-2 rounded-lg bg-[#E6F6FA] px-3 py-2 text-[#243647]">
                    <span className="text-[10px] font-bold uppercase text-[#1A9BB0]">
                      Texto público curado
                    </span>
                    <br />
                    {signal.publicText}
                  </p>
                ) : null}
                <p className="mt-2 font-mono text-xs text-[#6B7A8C]">actor: {signal.actorUserId}</p>
                {signal.signalType === "circle_idea" && approvingId === signal.signalId ? (
                  <div className="mt-3 space-y-2 rounded-lg border border-[#C6D92D] bg-[#F4F9E0] p-3">
                    <p className="text-xs font-semibold text-[#0B2E59]">
                      Texto público (curado, anónimo, mín. 20 caracteres)
                    </p>
                    <textarea
                      value={publicTextDraft}
                      onChange={(e) => setPublicTextDraft(e.target.value)}
                      rows={4}
                      maxLength={800}
                      className="w-full resize-none rounded-lg border border-[#E8EEF3] px-2 py-2 text-sm"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={updatingId === signal.signalId}
                        onClick={() => approveVisibility(signal.signalId)}
                        className="rounded-lg bg-[#C6D92D] px-3 py-1.5 text-xs font-bold text-[#0B2E59] disabled:opacity-60"
                      >
                        Publicar idea curada
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setApprovingId(null);
                          setPublicTextDraft("");
                        }}
                        className="rounded-lg border border-[#E8EEF3] px-3 py-1.5 text-xs font-semibold text-[#6B7A8C]"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {signal.signalType === "circle_idea" && signal.publicStatus !== "visible" ? (
                    <button
                      type="button"
                      disabled={updatingId === signal.signalId}
                      onClick={() => {
                        setApprovingId(signal.signalId);
                        setPublicTextDraft(signal.publicText ?? signal.note ?? "");
                      }}
                      className="rounded-lg border border-[#C6D92D] bg-[#F4F9E0] px-3 py-1.5 text-xs font-bold text-[#0B2E59] disabled:opacity-60"
                    >
                      Aprobar visibilidad
                    </button>
                  ) : null}
                  {signal.signalType === "circle_idea" && signal.publicStatus === "visible" ? (
                    <button
                      type="button"
                      disabled={updatingId === signal.signalId}
                      onClick={() => hideVisibility(signal.signalId)}
                      className="rounded-lg border border-[#E8EEF3] px-3 py-1.5 text-xs font-semibold text-[#6B7A8C] disabled:opacity-60"
                    >
                      Ocultar visibilidad
                    </button>
                  ) : null}
                  {signal.status === "active" ? (
                    <>
                      <button
                        type="button"
                        disabled={updatingId === signal.signalId}
                        onClick={() => updateStatus(signal.signalId, "reviewed")}
                        className="rounded-lg bg-[#0B2E59] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        Vista por el equipo
                      </button>
                      <button
                        type="button"
                        disabled={updatingId === signal.signalId}
                        onClick={() => updateStatus(signal.signalId, "flagged")}
                        className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-900 disabled:opacity-60"
                      >
                        Marcar alerta
                      </button>
                      <button
                        type="button"
                        disabled={updatingId === signal.signalId}
                        onClick={() => updateStatus(signal.signalId, "archived")}
                        className="rounded-lg border border-[#E8EEF3] px-3 py-1.5 text-xs font-semibold text-[#6B7A8C] disabled:opacity-60"
                      >
                        Cerrar
                      </button>
                    </>
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
