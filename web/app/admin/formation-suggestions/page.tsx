"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type FormationSuggestionStatus = "new" | "reviewed" | "archived";

type SuggestionRow = {
  suggestionId: string;
  userId: string;
  archiveId?: string | null;
  source: "formation_page" | "activation_path";
  text: string;
  createdAt: string;
  status: FormationSuggestionStatus;
};

const STATUS_FILTERS: { id: "" | FormationSuggestionStatus; label: string }[] = [
  { id: "", label: "Todas" },
  { id: "new", label: "Nuevas" },
  { id: "reviewed", label: "Revisadas" },
  { id: "archived", label: "Archivadas" },
];

export default function FormationSuggestionsAdminPage() {
  const [items, setItems] = useState<SuggestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | FormationSuggestionStatus>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "300" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/formation-suggestions/list?${params.toString()}`);
      const data = (await res.json()) as {
        ok?: boolean;
        suggestions?: SuggestionRow[];
        error?: string;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? data.error ?? "Error al cargar sugerencias");
      }
      setItems(data.suggestions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(suggestionId: string, status: "reviewed" | "archived") {
    setUpdatingId(suggestionId);
    setError("");
    try {
      const res = await fetch(`/api/admin/formation-suggestions/${encodeURIComponent(suggestionId)}`, {
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
              Formación fundadora · P1-C2
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#0B2E59]">
              Sugerencias de formación
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7A8C]">
              Señales reales de necesidad formativa. No implica inscripción ni reserva de cupo.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/admin/founder-project-signals" className="font-semibold text-[#1A9BB0] underline">
              Señales de proyectos →
            </Link>
            <Link href="/admin/circle-signals" className="font-semibold text-[#1A9BB0] underline">
              Señales de círculos →
            </Link>
            <Link href="/formacion" className="font-semibold text-[#1A9BB0] underline">
              Ver pantalla pública →
            </Link>
          </div>
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
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-full border border-[#E8EEF3] bg-white px-3 py-1.5 text-xs font-semibold text-[#6B7A8C]"
          >
            Actualizar
          </button>
        </div>

        {error ? (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="text-sm text-[#6B7A8C]">Cargando sugerencias…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-[#6B7A8C]">No hay sugerencias para este filtro.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.suggestionId} className="rounded-2xl border border-[#E8EEF3] bg-white p-4">
                <p className="text-[10px] font-mono text-[#6B7A8C]">{item.suggestionId}</p>
                <p className="mt-1 text-xs text-[#6B7A8C]">
                  {new Date(item.createdAt).toLocaleString("es-AR")} · {item.source} · estado:{" "}
                  {item.status}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#243647]">{item.text}</p>
                <p className="mt-2 text-xs text-[#6B7A8C]">
                  userId: <span className="font-mono">{item.userId}</span>
                  {item.archiveId ? (
                    <>
                      {" · "}archiveId: <span className="font-mono">{item.archiveId}</span>
                    </>
                  ) : null}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.status !== "reviewed" ? (
                    <button
                      type="button"
                      disabled={updatingId === item.suggestionId}
                      onClick={() => void updateStatus(item.suggestionId, "reviewed")}
                      className="rounded-xl bg-[#0B2E59] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      Marcar revisada
                    </button>
                  ) : null}
                  {item.status !== "archived" ? (
                    <button
                      type="button"
                      disabled={updatingId === item.suggestionId}
                      onClick={() => void updateStatus(item.suggestionId, "archived")}
                      className="rounded-xl border border-[#E8EEF3] px-3 py-2 text-xs font-semibold text-[#6B7A8C] disabled:opacity-60"
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
