"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { GUIDED_CONTRIBUTION_KIND_OPTIONS } from "@/lib/community/guidedContributionCopy";
import type {
  FounderProjectGuidedContributionKind,
  FounderProjectGuidedContributionStatus,
} from "@/lib/learning/founderProjectGuidedContributions";

type ContributionRow = {
  contributionId: string;
  projectId: string;
  projectTitle: string;
  actorUserId: string;
  kind: FounderProjectGuidedContributionKind;
  text: string;
  status: FounderProjectGuidedContributionStatus;
  createdAt: string;
  updatedAt?: string;
};

const STATUS_FILTERS: { id: "" | FounderProjectGuidedContributionStatus; label: string }[] = [
  { id: "", label: "Todos" },
  { id: "pending_review", label: "En revisión" },
  { id: "visible", label: "Visibles" },
  { id: "hidden", label: "Ocultos" },
  { id: "flagged", label: "Flaggeados" },
  { id: "archived", label: "Archivados" },
];

const KIND_LABEL = Object.fromEntries(
  GUIDED_CONTRIBUTION_KIND_OPTIONS.map((o) => [o.kind, o.label]),
) as Record<FounderProjectGuidedContributionKind, string>;

export default function FounderProjectContributionsAdminPage() {
  const [items, setItems] = useState<ContributionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | FounderProjectGuidedContributionStatus>(
    "pending_review",
  );
  const [projectFilter, setProjectFilter] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "400" });
      if (statusFilter) params.set("status", statusFilter);
      if (projectFilter.trim()) params.set("projectId", projectFilter.trim());
      const res = await fetch(
        `/api/admin/founder-project-contributions/list?${params.toString()}`,
      );
      const data = (await res.json()) as {
        ok?: boolean;
        contributions?: ContributionRow[];
        error?: string;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? data.error ?? "Error al cargar aportes");
      }
      setItems(data.contributions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, projectFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(
    contributionId: string,
    status: "visible" | "hidden" | "flagged" | "archived",
  ) {
    setUpdatingId(contributionId);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/founder-project-contributions/${encodeURIComponent(contributionId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
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
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
              Proyectos fundadores · P1-D3
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#0B2E59]">Aportes guiados</h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7A8C]">
              Revisión antes de visibilidad pública. Sin contacto al proponente ni conversación.
            </p>
          </div>
          <Link
            href="/admin/founder-project-seeds"
            className="text-sm font-semibold text-[#1A9BB0] underline"
          >
            Proyectos fundadores →
          </Link>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            placeholder="Filtrar por projectId"
            className="rounded-xl border border-[#E8EEF3] px-3 py-2 text-xs"
          />
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
            No hay aportes con este filtro.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li
                key={item.contributionId}
                className="rounded-xl border border-[#E8EEF3] bg-white p-4 text-sm"
              >
                <p className="font-bold text-[#0B2E59]">
                  {item.projectTitle}{" "}
                  <span className="font-normal text-[#6B7A8C]">({item.projectId})</span>
                </p>
                <p className="mt-1 text-[#6B7A8C]">
                  {KIND_LABEL[item.kind]} · {item.status} ·{" "}
                  {new Date(item.createdAt).toLocaleString("es-AR")}
                </p>
                <p className="mt-2 rounded-lg bg-[#F8FAFC] px-3 py-2 text-[#243647]">{item.text}</p>
                <p className="mt-2 font-mono text-xs text-[#6B7A8C]">actor: {item.actorUserId}</p>
                <Link
                  href={`/proyectos/semilla/${encodeURIComponent(item.projectId)}`}
                  className="mt-2 inline-block text-xs font-semibold text-[#1A9BB0] underline"
                >
                  Ver ficha del proyecto →
                </Link>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.status !== "visible" ? (
                    <button
                      type="button"
                      disabled={updatingId === item.contributionId}
                      onClick={() => updateStatus(item.contributionId, "visible")}
                      className="rounded-lg bg-[#C6D92D] px-3 py-1.5 text-xs font-bold text-[#0B2E59] disabled:opacity-60"
                    >
                      Publicar
                    </button>
                  ) : null}
                  {item.status !== "hidden" ? (
                    <button
                      type="button"
                      disabled={updatingId === item.contributionId}
                      onClick={() => updateStatus(item.contributionId, "hidden")}
                      className="rounded-lg border border-[#E8EEF3] px-3 py-1.5 text-xs font-semibold text-[#6B7A8C] disabled:opacity-60"
                    >
                      Ocultar
                    </button>
                  ) : null}
                  {item.status !== "flagged" ? (
                    <button
                      type="button"
                      disabled={updatingId === item.contributionId}
                      onClick={() => updateStatus(item.contributionId, "flagged")}
                      className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-900 disabled:opacity-60"
                    >
                      Flagear
                    </button>
                  ) : null}
                  {item.status !== "archived" ? (
                    <button
                      type="button"
                      disabled={updatingId === item.contributionId}
                      onClick={() => updateStatus(item.contributionId, "archived")}
                      className="rounded-lg border border-[#E8EEF3] px-3 py-1.5 text-xs font-semibold text-[#6B7A8C] disabled:opacity-60"
                    >
                      Archivar
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
