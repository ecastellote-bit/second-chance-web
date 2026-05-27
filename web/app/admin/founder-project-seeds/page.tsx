"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { founderSeedStatusLabel } from "@/lib/public/founderSeedStatusLabel";
import type { FounderProjectSeedStatus } from "@/lib/learning/founderProjectSeeds";

type SeedRow = {
  seedId: string;
  title: string;
  summary: string;
  status: FounderProjectSeedStatus;
  userId: string | null;
  cohortBatch: string;
  createdAt: string;
  publishedAt?: string | null;
  statusUpdatedAt?: string | null;
};

type StoreStatus = {
  backend: "blob" | "local_jsonl";
  configured: boolean;
  manifestSeedCount: number;
  blobListCount: number;
};

const STATUS_FILTERS: { id: "" | FounderProjectSeedStatus; label: string }[] = [
  { id: "", label: "Todos" },
  { id: "pending_review", label: "En revisión" },
  { id: "published", label: "Publicados" },
  { id: "hidden", label: "Ocultos" },
];

export default function FounderProjectSeedsAdminPage() {
  const [seeds, setSeeds] = useState<SeedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | FounderProjectSeedStatus>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [store, setStore] = useState<StoreStatus | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/founder-project-seeds/list?${params.toString()}`);
      const data = (await res.json()) as {
        ok: boolean;
        seeds?: SeedRow[];
        store?: StoreStatus;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Error al cargar semillas");
      }

      setSeeds(data.seeds ?? []);
      setStore(data.store ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(seedId: string, status: FounderProjectSeedStatus) {
    setUpdatingId(seedId);
    setError("");
    try {
      const res = await fetch(`/api/admin/founder-project-seeds/${encodeURIComponent(seedId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "No se pudo actualizar");
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al actualizar");
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
              Barrio · P1-B visibilidad
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#0B2E59]">Proyectos fundadores (semillas)</h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7A8C]">
              Solo los proyectos en estado <strong className="font-semibold text-[#243647]">Publicado</strong>{" "}
              aparecen en el listado público del barrio. En revisión y ocultos no se muestran a
              visitantes.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/admin/founder-case-drafts" className="font-semibold text-[#1A9BB0] underline">
              Borradores preservados →
            </Link>
            <Link href="/admin/observatorio" className="font-semibold text-[#1A9BB0] underline">
              Observatorio →
            </Link>
            <Link href="/" className="text-[#6B7A8C] underline">
              ← Inicio
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
                  : "bg-white border border-[#E8EEF3] text-[#6B7A8C]",
              ].join(" ")}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => load()}
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

        {store ? (
          <p className="mb-4 rounded-xl border border-[#E8EEF3] bg-white px-4 py-3 text-[12px] leading-relaxed text-[#6B7A8C]">
            Depósito: <strong className="text-[#243647]">{store.backend}</strong>
            {" · "}índice: {store.manifestSeedCount}
            {" · "}blobs escaneados: {store.blobListCount}
            {typeof window !== "undefined" ? (
              <>
                {" · "}
                <span className="font-mono text-[11px]">{window.location.host}</span>
              </>
            ) : null}
          </p>
        ) : null}

        {loading ? (
          <p className="text-sm text-[#6B7A8C]">Cargando semillas…</p>
        ) : seeds.length === 0 ? (
          <div className="space-y-3 text-sm text-[#6B7A8C]">
            <p>No hay semillas con este filtro en este entorno.</p>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] leading-relaxed text-amber-950">
              <p className="font-semibold">Si en el celular ya ves «Tu semilla recibida»</p>
              <p className="mt-1">
                Abrí este admin en la <strong>misma URL de producción</strong> donde sembraste (no en
                localhost). Cada entorno tiene su propio depósito.
              </p>
              <p className="mt-2">
                Tras el próximo deploy, el índice de semillas se reconstruye solo. Tocá{" "}
                <strong>Actualizar</strong> una vez desplegado.
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {seeds.map((seed) => (
              <li
                key={seed.seedId}
                className="rounded-2xl border border-[#E8EEF3] bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-mono text-[#6B7A8C]">{seed.seedId}</p>
                    <h2 className="mt-1 text-base font-bold text-[#0B2E59]">{seed.title}</h2>
                    <p className="mt-1 text-xs leading-relaxed text-[#6B7A8C] line-clamp-3">
                      {seed.summary}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#E6F6FA] px-3 py-1 text-[11px] font-semibold text-[#0B2E59]">
                    {founderSeedStatusLabel(seed.status)}
                  </span>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-[#6B7A8C] sm:grid-cols-4">
                  <div>
                    <dt className="font-semibold text-[#243647]">Cohorte</dt>
                    <dd>{seed.cohortBatch}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#243647]">Usuario</dt>
                    <dd className="truncate font-mono">{seed.userId ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#243647]">Creado</dt>
                    <dd>{new Date(seed.createdAt).toLocaleString("es-AR")}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#243647]">Publicado</dt>
                    <dd>
                      {seed.publishedAt
                        ? new Date(seed.publishedAt).toLocaleString("es-AR")
                        : "—"}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-wrap gap-2">
                  {seed.status !== "published" ? (
                    <button
                      type="button"
                      disabled={updatingId === seed.seedId}
                      onClick={() => void setStatus(seed.seedId, "published")}
                      className="rounded-xl bg-[#0B2E59] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      Publicar en barrio
                    </button>
                  ) : null}
                  {seed.status !== "hidden" ? (
                    <button
                      type="button"
                      disabled={updatingId === seed.seedId}
                      onClick={() => void setStatus(seed.seedId, "hidden")}
                      className="rounded-xl border border-[#E8EEF3] px-3 py-2 text-xs font-semibold text-[#6B7A8C] disabled:opacity-60"
                    >
                      Ocultar
                    </button>
                  ) : null}
                  {seed.status !== "pending_review" ? (
                    <button
                      type="button"
                      disabled={updatingId === seed.seedId}
                      onClick={() => void setStatus(seed.seedId, "pending_review")}
                      className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 disabled:opacity-60"
                    >
                      Volver a revisión
                    </button>
                  ) : null}
                  <Link
                    href={
                      seed.status === "published"
                        ? `/proyectos/semilla/${seed.seedId}`
                        : seed.userId
                          ? `/proyectos/semilla/${seed.seedId}?userId=${encodeURIComponent(seed.userId)}`
                          : `/proyectos/semilla/${seed.seedId}`
                    }
                    className="rounded-xl border border-[#1A9BB0]/30 px-3 py-2 text-xs font-semibold text-[#1A9BB0]"
                  >
                    Ver ficha
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
