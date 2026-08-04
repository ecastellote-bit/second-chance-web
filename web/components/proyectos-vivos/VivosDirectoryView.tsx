"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { VivoProjectCard } from "@/components/proyectos-vivos/VivoProjectCard";
import { Button } from "@/components/ui/Button";
import { PROFILE_FAMILIES } from "@/lib/registries/profileFamilies";
import type { ProjectStatus, VivoProject } from "@/lib/projects-vivos/projectTypes";
import { PROJECT_WORLDS } from "@/lib/content/projectWorldsCopy";
import { TEAM_FOUNDER_PROJECTS } from "@/lib/content/teamFounderSeeds";

const PAGE_SIZE = 12;
const SEED_TEASERS = TEAM_FOUNDER_PROJECTS.slice(0, 3);

type ListResponse = {
  ok?: boolean;
  projects?: VivoProject[];
  total?: number;
  error?: string;
};

export function VivosDirectoryView() {
  const [familia, setFamilia] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "">("buscando_miembros");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [projects, setProjects] = useState<VivoProject[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
      setOffset(0);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [query]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(offset));
      if (familia) params.set("familiaVocacional", familia);
      if (city.trim()) params.set("city", city.trim());
      if (status) params.set("status", status);
      if (debouncedQuery) params.set("q", debouncedQuery);

      const res = await fetch(`/api/proyectos-vivos?${params.toString()}`);
      const data = (await res.json()) as ListResponse;
      if (!res.ok || !data.ok || !data.projects) {
        throw new Error(data.error ?? "No se pudieron cargar los proyectos");
      }
      setProjects((prev) => (offset === 0 ? data.projects! : [...prev, ...data.projects!]));
      setTotal(data.total ?? data.projects.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, [familia, city, status, debouncedQuery, offset]);

  useEffect(() => {
    void load();
  }, [load]);

  const canLoadMore = useMemo(
    () => projects.length < total,
    [projects.length, total],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[1.85rem] font-bold tracking-tight text-[#0B2E59]">
            {PROJECT_WORLDS.vivo.directoryTitle}
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-[#6B7A8C]">
            {PROJECT_WORLDS.vivo.directorySubtitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/proyectos/vivos/nuevo"
            className="vu-focus inline-flex min-h-[48px] items-center rounded-[10px] bg-[#0B2E59] px-5 text-base font-semibold text-white"
          >
            Crear mi proyecto
          </Link>
          <Link
            href="/proyectos/vivos/mis-proyectos"
            className="vu-focus inline-flex min-h-[48px] items-center rounded-[10px] border border-[#E8EEF3] bg-white px-5 text-base font-semibold text-[#0B2E59]"
          >
            Mis proyectos
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="sticky top-0 z-10 space-y-3 rounded-2xl border border-[#E8EEF3] bg-white/95 p-4 backdrop-blur">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por título o descripción"
              className="min-h-[48px] w-full rounded-xl border border-[#E8EEF3] px-4 text-base"
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <select
                value={familia}
                onChange={(event) => {
                  setFamilia(event.target.value);
                  setOffset(0);
                }}
                className="min-h-[48px] rounded-xl border border-[#E8EEF3] bg-white px-3 text-base"
              >
                <option value="">Todas las familias</option>
                {PROFILE_FAMILIES.map((family) => (
                  <option key={family.id} value={family.id}>
                    {family.label}
                  </option>
                ))}
              </select>
              <input
                value={city}
                onChange={(event) => {
                  setCity(event.target.value);
                  setOffset(0);
                }}
                placeholder="Ciudad"
                className="min-h-[48px] rounded-xl border border-[#E8EEF3] px-4 text-base"
              />
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["buscando_miembros", "Buscando"],
                    ["en_curso", "En curso"],
                    ["", "Todos"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setStatus(value);
                      setOffset(0);
                    }}
                    className={[
                      "vu-focus min-h-[48px] rounded-xl px-3 text-sm font-semibold",
                      status === value
                        ? "bg-[#0B2E59] text-white"
                        : "border border-[#E8EEF3] bg-white text-[#243647]",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
              <p className="text-base text-[#243647]">{error}</p>
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="mt-4"
                onClick={() => void load()}
              >
                Reintentar
              </Button>
            </div>
          ) : null}

          {!error && !loading && projects.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-[#E8EEF3] bg-[#F8FAFC] p-8 text-center">
              <p className="text-lg text-[#243647]">
                Aún no hay proyectos vivos en esta búsqueda.
              </p>
              <p className="mt-2 text-base leading-relaxed text-[#6B7A8C]">
                Podés crear el tuyo o mirar las semillas del barrio mientras el directorio se llena.
              </p>
              <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/proyectos/vivos/nuevo"
                  className="vu-focus inline-flex min-h-[48px] items-center rounded-[10px] bg-[#0B2E59] px-6 text-base font-semibold text-white"
                >
                  Crear mi proyecto
                </Link>
                <Link
                  href="/proyectos"
                  className="vu-focus inline-flex min-h-[48px] items-center rounded-[10px] border border-[#E8EEF3] bg-white px-6 text-base font-semibold text-[#0B2E59]"
                >
                  Ver semillas
                </Link>
              </div>
            </div>
          ) : null}

          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <VivoProjectCard key={project.id} project={project} />
            ))}
          </div>

          {loading ? (
            <p className="mt-6 text-center text-base text-[#6B7A8C]">Cargando proyectos…</p>
          ) : null}

          {!loading && canLoadMore ? (
            <div className="mt-8 flex justify-center">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => setOffset((prev) => prev + PAGE_SIZE)}
              >
                Cargar más
              </Button>
            </div>
          ) : null}
        </div>

        <aside className="h-fit space-y-4">
          <div className="rounded-2xl border border-[#E8EEF3] bg-white p-5">
            <h2 className="text-lg font-semibold text-[#0B2E59]">
              {PROJECT_WORLDS.vivo.bridgeToSeedsTitle}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-[#6B7A8C]">
              {PROJECT_WORLDS.vivo.bridgeToSeedsBody}
            </p>
            <ul className="mt-4 space-y-2">
              {SEED_TEASERS.map((seed) => (
                <li key={seed.id}>
                  <Link
                    href={`/proyectos/${seed.id}`}
                    className="vu-focus block rounded-xl border border-[#E8EEF3] bg-[#F8FAFC] px-3 py-2.5 text-[13px] font-semibold text-[#0B2E59] transition-colors hover:border-[#1A9BB0]/40"
                  >
                    {seed.title}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/proyectos"
              className="vu-focus mt-4 inline-flex min-h-[48px] items-center text-base font-semibold text-[#1A9BB0] underline"
            >
              {PROJECT_WORLDS.vivo.bridgeToSeedsCta} →
            </Link>
          </div>

          <div className="rounded-2xl border border-[#1A9BB0]/30 bg-[#E8F7FA] p-5">
            <h2 className="text-lg font-semibold text-[#0B2E59]">Comunidad</h2>
            <p className="mt-2 text-base leading-relaxed text-[#6B7A8C]">
              Contá qué estás construyendo y etiquetá un círculo del barrio.
            </p>
            <Link
              href="/comunidad"
              className="vu-focus mt-4 inline-flex min-h-[48px] items-center text-base font-semibold text-[#1A9BB0] underline"
            >
              Únite a la conversación →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
