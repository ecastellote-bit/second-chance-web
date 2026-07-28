"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DirectoryProfileCard,
  DirectoryProfileCardSkeleton,
} from "@/components/community/DirectoryProfileCard";
import { DirectoryPagination } from "@/components/community/DirectoryPagination";
import { Button } from "@/components/ui/Button";
import type { DirectoryProfileEntry } from "@/lib/users/directoryProfile";
import type { ProfileFamilyId } from "@/lib/types/profileFamilies";

const PAGE_SIZE = 24;
const SEARCH_DEBOUNCE_MS = 400;

type DirectoryFiltersResponse = {
  ok: boolean;
  filters?: {
    familiaVocacional: Array<{ id: ProfileFamilyId; label: string }>;
    country: string[];
    buscando: string[];
  };
};

type DirectoryListResponse = {
  ok: boolean;
  profiles?: DirectoryProfileEntry[];
  total?: number;
  limit?: number;
  offset?: number;
  error?: string;
};

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-[#6B7A8C]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  );
}

function EmptyDirectoryIllustration() {
  return (
    <div
      className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#DFF4F7] text-2xl"
      aria-hidden
    >
      🤝
    </div>
  );
}

const selectClassName =
  "min-h-[48px] w-full rounded-xl border border-[#E8EEF3] bg-white px-4 text-base text-[#243647]";

export function ConnectDirectoryGallery() {
  const [filterOptions, setFilterOptions] = useState<
    DirectoryFiltersResponse["filters"] | null
  >(null);
  const [filtersLoading, setFiltersLoading] = useState(true);

  const [familia, setFamilia] = useState("");
  const [country, setCountry] = useState("");
  const [buscando, setBuscando] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [offset, setOffset] = useState(0);

  const [profiles, setProfiles] = useState<DirectoryProfileEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFilters = useCallback(async () => {
    setFiltersLoading(true);
    try {
      const res = await fetch("/api/community/directory/filters");
      const data = (await res.json()) as DirectoryFiltersResponse;
      if (!data.ok || !data.filters) {
        throw new Error("No se pudieron cargar los filtros");
      }
      setFilterOptions(data.filters);
    } catch {
      setFilterOptions({ familiaVocacional: [], country: [], buscando: [] });
    } finally {
      setFiltersLoading(false);
    }
  }, []);

  const loadDirectory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(offset));
      if (familia) params.set("familia", familia);
      if (country) params.set("country", country);
      if (buscando) params.set("buscando", buscando);
      if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());

      const res = await fetch(`/api/community/directory?${params.toString()}`);
      const data = (await res.json()) as DirectoryListResponse;

      if (!res.ok || !data.ok || !data.profiles) {
        throw new Error(data.error ?? "directory_load_failed");
      }

      setProfiles(data.profiles);
      setTotal(data.total ?? data.profiles.length);
    } catch {
      setProfiles([]);
      setTotal(0);
      setError("Hubo un problema al cargar el directorio. Intentá de nuevo en unos minutos.");
    } finally {
      setLoading(false);
    }
  }, [offset, familia, country, buscando, debouncedQuery]);

  useEffect(() => {
    void loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(queryInput);
      setOffset(0);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [queryInput]);

  useEffect(() => {
    void loadDirectory();
  }, [loadDirectory]);

  const showingFrom = total === 0 ? 0 : offset + 1;
  const showingTo = Math.min(offset + profiles.length, total);

  const hasActiveFilters = useMemo(
    () => Boolean(familia || country || buscando || debouncedQuery.trim()),
    [familia, country, buscando, debouncedQuery],
  );

  function clearFilters() {
    setFamilia("");
    setCountry("");
    setBuscando("");
    setQueryInput("");
    setDebouncedQuery("");
    setOffset(0);
  }

  return (
    <section
      className="mt-8 rounded-[28px] border border-[#E8EEF3] bg-white p-5 shadow-vu-soft sm:p-6 lg:p-8"
      aria-labelledby="connect-directory-title"
    >
      <header className="space-y-2">
        <h2 id="connect-directory-title" className="text-2xl font-bold text-[#0B2E59] sm:text-3xl">
          Directorio VocationUp Connect
        </h2>
        <p className="text-base leading-relaxed text-[#6B7A8C] sm:text-lg">
          Encontrá personas que comparten tu camino vocacional.
        </p>
      </header>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="sr-only">Buscar por nombre, vocación o palabra clave</span>
          <span className="relative flex items-center">
            <span className="pointer-events-none absolute left-4">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={queryInput}
              onChange={(event) => setQueryInput(event.target.value)}
              placeholder="Buscar por nombre, vocación o palabra clave..."
              className="min-h-[48px] w-full rounded-xl border border-[#E8EEF3] bg-[#F8FAFC] py-3 pl-12 pr-4 text-base text-[#243647]"
            />
          </span>
        </label>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[#0B2E59]">Familia vocacional</span>
            <select
              value={familia}
              onChange={(event) => {
                setFamilia(event.target.value);
                setOffset(0);
              }}
              disabled={filtersLoading}
              className={selectClassName}
            >
              <option value="">Todas las familias</option>
              {filterOptions?.familiaVocacional.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[#0B2E59]">País</span>
            <select
              value={country}
              onChange={(event) => {
                setCountry(event.target.value);
                setOffset(0);
              }}
              disabled={filtersLoading}
              className={selectClassName}
            >
              <option value="">Todos los países</option>
              {filterOptions?.country.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[#0B2E59]">Buscando</span>
            <select
              value={buscando}
              onChange={(event) => {
                setBuscando(event.target.value);
                setOffset(0);
              }}
              disabled={filtersLoading}
              className={selectClassName}
            >
              <option value="">Cualquier interés</option>
              {filterOptions?.buscando.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              fullWidth
              disabled={!hasActiveFilters}
              onClick={clearFilters}
              className="border border-[#E8EEF3]"
            >
              Limpiar filtros
            </Button>
          </div>
        </div>

        <p className="text-base text-[#243647]" aria-live="polite">
          {loading
            ? "Cargando perfiles…"
            : `Mostrando ${showingFrom}-${showingTo} de ${total} perfiles`}
        </p>
      </div>

      {error ? (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-base leading-relaxed text-[#243647]">{error}</p>
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="mt-4"
            onClick={() => void loadDirectory()}
          >
            Reintentar
          </Button>
        </div>
      ) : null}

      {!error && loading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <DirectoryProfileCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      ) : null}

      {!error && !loading && profiles.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[#E8EEF3] bg-[#F8FAFC] px-6 py-10 text-center">
          <EmptyDirectoryIllustration />
          <p className="mt-4 text-lg leading-relaxed text-[#243647]">
            Todavía no hay perfiles que coincidan con tu búsqueda. Probá con otros filtros o
            volvé más tarde.
          </p>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="mt-6"
              onClick={clearFilters}
            >
              Limpiar filtros
            </Button>
          ) : null}
        </div>
      ) : null}

      {!error && !loading && profiles.length > 0 ? (
        <>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <DirectoryProfileCard key={profile.slug} profile={profile} />
            ))}
          </div>

          <div className="mt-8">
            <DirectoryPagination
              total={total}
              limit={PAGE_SIZE}
              offset={offset}
              onPageChange={setOffset}
            />
          </div>
        </>
      ) : null}
    </section>
  );
}
