"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CIRCULOS_CATALOG,
  SUGERIDOS_IDS,
  type CircleItem,
} from "@/lib/content/circulosCatalog";
import { COMMUNITY_SEED_BADGE } from "@/lib/content/communitySeedCopy";
import { fetchUserCircleIds } from "@/lib/community/userCircleSignals";

function MiniCircleRow({ circle }: { circle: CircleItem }) {
  return (
    <Link
      href={`/circulos/${circle.id}`}
      className="vu-focus flex min-h-[44px] items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-[#F8FAFC]"
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0B2E59]/10 text-[11px] font-bold text-[#0B2E59]"
        aria-hidden
      >
        ○
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-[#0B2E59]">{circle.title}</span>
        <span className="text-[11px] text-[#6B7A8C]">{COMMUNITY_SEED_BADGE}</span>
      </span>
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 shrink-0 text-[#6B7A8C]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}

function PanelSection({
  title,
  hint,
  children,
  className = "",
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={[
        "rounded-[24px] border border-[#E8EEF3] bg-white p-4 shadow-[0_4px_16px_rgba(15,42,70,0.06)]",
        className,
      ].join(" ")}
    >
      <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B7A8C]">{title}</h2>
      {hint ? (
        <p className="mt-1 text-[12px] leading-relaxed text-[#6B7A8C]">{hint}</p>
      ) : null}
      <div className="mt-3 space-y-1">{children}</div>
    </section>
  );
}

function MisCirculosPanel({ variant }: { variant: "sidebar" | "inline" }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void fetchUserCircleIds().then((ids) => {
      setSavedIds(ids);
      setReady(true);
    });
  }, []);

  const byId = useMemo(
    () => Object.fromEntries(CIRCULOS_CATALOG.map((c) => [c.id, c])),
    [],
  );
  const misCirculos = savedIds
    .map((id) => byId[id])
    .filter(Boolean) as CircleItem[];

  const wrapperClass =
    variant === "sidebar"
      ? "hidden xl:flex xl:w-[280px] xl:shrink-0 xl:flex-col xl:gap-4 xl:py-6 xl:pr-6"
      : "flex flex-col gap-4";

  const sugeridos = SUGERIDOS_IDS.map((id) => byId[id]).filter(Boolean) as CircleItem[];

  return (
    <aside className={wrapperClass} aria-label="Tus círculos y espacios para explorar">
      <PanelSection
        title="Círculos que marcaste"
        hint="Según tu actividad — guardado, interés o aviso"
      >
        {!ready ? (
          <p className="text-[13px] text-[#6B7A8C]">Cargando…</p>
        ) : misCirculos.length > 0 ? (
          misCirculos.map((c) => <MiniCircleRow key={c.id} circle={c} />)
        ) : (
          <div className="space-y-3">
            <p className="text-[13px] leading-relaxed text-[#6B7A8C]">
              Todavía no guardaste círculos. Podés marcar interés al entrar a un espacio semilla.
            </p>
            <Link
              href="/circulos"
              className="vu-focus inline-flex min-h-[40px] items-center text-[13px] font-semibold text-[#1A9BB0] underline"
            >
              Explorar círculos
            </Link>
          </div>
        )}
      </PanelSection>

      <PanelSection
        title="Espacios para explorar"
        hint="Puertas semilla del barrio — no implican membresía activa"
      >
        {sugeridos.map((c) => (
          <MiniCircleRow key={c.id} circle={c} />
        ))}
      </PanelSection>
    </aside>
  );
}

export function CirculosRightPanel({ variant = "sidebar" }: { variant?: "sidebar" | "inline" }) {
  return <MisCirculosPanel variant={variant} />;
}

/** Carrusel horizontal en móvil */
export function CirculosMobileStrip({
  title,
  hint,
  ids,
  emptyMessage,
  emptyCtaHref,
  emptyCtaLabel,
}: {
  title: string;
  hint?: string;
  ids: string[];
  emptyMessage?: string;
  emptyCtaHref?: string;
  emptyCtaLabel?: string;
}) {
  const byId = Object.fromEntries(CIRCULOS_CATALOG.map((c) => [c.id, c]));
  const items = ids.map((id) => byId[id]).filter(Boolean) as CircleItem[];

  return (
    <section className="mb-6">
      <h2 className="mb-1 px-1 text-xs font-bold uppercase tracking-wider text-[#6B7A8C]">
        {title}
      </h2>
      {hint ? (
        <p className="mb-3 px-1 text-[12px] leading-relaxed text-[#6B7A8C]">{hint}</p>
      ) : null}
      {items.length === 0 && emptyMessage ? (
        <div className="rounded-[20px] border border-[#E8EEF3] bg-white px-4 py-4">
          <p className="text-[13px] leading-relaxed text-[#6B7A8C]">{emptyMessage}</p>
          {emptyCtaHref && emptyCtaLabel ? (
            <Link
              href={emptyCtaHref}
              className="vu-focus mt-3 inline-block text-[13px] font-semibold text-[#1A9BB0] underline"
            >
              {emptyCtaLabel}
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory">
          {items.map((circle) => (
            <div key={circle.id} className="snap-start">
              <Link
                href={`/circulos/${circle.id}`}
                className="vu-focus flex w-[200px] flex-col gap-2 rounded-[20px] border border-[#E8EEF3] bg-white p-3 shadow-[0_4px_16px_rgba(15,42,70,0.06)]"
              >
                <p className="text-sm font-bold text-[#0B2E59] line-clamp-2">{circle.title}</p>
                <p className="text-[11px] text-[#6B7A8C]">{COMMUNITY_SEED_BADGE}</p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function CirculosMisCirculosMobile() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void fetchUserCircleIds().then((ids) => {
      setSavedIds(ids);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <CirculosMobileStrip
        title="Círculos que marcaste"
        hint="Según tu actividad"
        ids={[]}
      />
    );
  }

  return (
    <CirculosMobileStrip
      title="Círculos que marcaste"
      hint="Según tu actividad — guardado, interés o aviso"
      ids={savedIds}
      emptyMessage="Todavía no guardaste círculos. Entrá a un espacio y marcá interés."
      emptyCtaHref="/circulos"
      emptyCtaLabel="Explorar círculos"
    />
  );
}
