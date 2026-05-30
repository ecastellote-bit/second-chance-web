"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { COMMUNITY_REPORT_REASON_OPTIONS } from "@/lib/community/communityReportCopy";
import type {
  CommunityReportReason,
  CommunityReportStatus,
  CommunityReportTargetType,
} from "@/lib/learning/communityReports";

type ReportRow = {
  reportId: string;
  targetType: CommunityReportTargetType;
  targetId: string;
  reporterUserId: string;
  reason: CommunityReportReason;
  details?: string;
  status: CommunityReportStatus;
  createdAt: string;
  updatedAt?: string;
};

const STATUS_FILTERS: { id: "" | CommunityReportStatus; label: string }[] = [
  { id: "", label: "Todos" },
  { id: "new", label: "Nuevos" },
  { id: "reviewed", label: "Revisados" },
  { id: "dismissed", label: "Descartados" },
  { id: "action_taken", label: "Acción tomada" },
];

const TARGET_LABEL: Record<CommunityReportTargetType, string> = {
  founder_project: "Proyecto fundador",
  project_guided_contribution: "Aporte guiado",
  circle: "Círculo",
  formation_opportunity: "Formación / oportunidad",
};

const REASON_LABEL = Object.fromEntries(
  COMMUNITY_REPORT_REASON_OPTIONS.map((o) => [o.reason, o.label]),
) as Record<CommunityReportReason, string>;

export default function CommunityReportsAdminPage() {
  const [items, setItems] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | CommunityReportStatus>("new");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "400" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/community-reports/list?${params.toString()}`);
      const data = (await res.json()) as {
        ok?: boolean;
        reports?: ReportRow[];
        error?: string;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? data.error ?? "Error al cargar reportes");
      }
      setItems(data.reports ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(
    reportId: string,
    status: "reviewed" | "dismissed" | "action_taken",
  ) {
    setUpdatingId(reportId);
    setError("");
    try {
      const res = await fetch(`/api/admin/community-reports/${encodeURIComponent(reportId)}`, {
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
              Moderación · P1-D4
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#0B2E59]">Reportes de contenido</h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7A8C]">
              Registro para revisión del equipo. No oculta contenido automáticamente.
            </p>
          </div>
          <Link
            href="/admin/founder-project-contributions"
            className="text-sm font-semibold text-[#1A9BB0] underline"
          >
            Aportes guiados →
          </Link>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((item) => (
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
        ) : items.length === 0 ? (
          <p className="rounded-xl border border-[#E8EEF3] bg-white p-6 text-sm text-[#6B7A8C]">
            No hay reportes con este filtro.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li
                key={item.reportId}
                className="rounded-xl border border-[#E8EEF3] bg-white p-4 text-sm"
              >
                <p className="font-bold text-[#0B2E59]">
                  {TARGET_LABEL[item.targetType]} · {item.targetId}
                </p>
                <p className="mt-1 text-[#6B7A8C]">
                  {REASON_LABEL[item.reason]} · {item.status} ·{" "}
                  {new Date(item.createdAt).toLocaleString("es-AR")}
                </p>
                {item.details ? (
                  <p className="mt-2 rounded-lg bg-[#F8FAFC] px-3 py-2 text-[#243647]">
                    {item.details}
                  </p>
                ) : null}
                <p className="mt-2 font-mono text-xs text-[#6B7A8C]">
                  reporter: {item.reporterUserId}
                </p>
                {item.status === "new" || item.status === "reviewed" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.status === "new" ? (
                      <button
                        type="button"
                        disabled={updatingId === item.reportId}
                        onClick={() => updateStatus(item.reportId, "reviewed")}
                        className="rounded-lg bg-[#0B2E59] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        Marcar revisado
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={updatingId === item.reportId}
                      onClick={() => updateStatus(item.reportId, "dismissed")}
                      className="rounded-lg border border-[#E8EEF3] px-3 py-1.5 text-xs font-semibold text-[#6B7A8C] disabled:opacity-60"
                    >
                      Descartar
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === item.reportId}
                      onClick={() => updateStatus(item.reportId, "action_taken")}
                      className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-900 disabled:opacity-60"
                    >
                      Marcar acción tomada
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
