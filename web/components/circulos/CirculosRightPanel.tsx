"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  CIRCULOS_CATALOG,
  MIS_CIRCULOS_IDS,
  SUGERIDOS_IDS,
  type CircleItem,
} from "@/lib/content/circulosCatalog";

function MiniCircleRow({ circle }: { circle: CircleItem }) {
  return (
    <Link
      href={`/circulos/${circle.id}`}
      className="vu-focus flex min-h-[44px] items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-[#F8FAFC]"
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
        style={{
          background: `linear-gradient(135deg, #1A9BB0 0%, #0B2E59 100%)`,
        }}
        aria-hidden
      >
        {circle.avatars[0]?.slice(0, 2) ?? "VU"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-[#0B2E59]">{circle.title}</span>
        <span className="text-[11px] text-[#6B7A8C]">
          {circle.online} en línea · {circle.members} miembros
        </span>
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
  children,
  className = "",
}: {
  title: string;
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
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#6B7A8C]">{title}</h2>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

export function CirculosRightPanel({ variant = "sidebar" }: { variant?: "sidebar" | "inline" }) {
  const byId = Object.fromEntries(CIRCULOS_CATALOG.map((c) => [c.id, c]));
  const misCirculos = MIS_CIRCULOS_IDS.map((id) => byId[id]).filter(Boolean) as CircleItem[];
  const sugeridos = SUGERIDOS_IDS.map((id) => byId[id]).filter(Boolean) as CircleItem[];

  const wrapperClass =
    variant === "sidebar"
      ? "hidden xl:flex xl:w-[280px] xl:shrink-0 xl:flex-col xl:gap-4 xl:py-6 xl:pr-6"
      : "flex flex-col gap-4";

  return (
    <aside className={wrapperClass} aria-label="Tus círculos y sugerencias">
      <PanelSection title="Mis círculos">
        {misCirculos.map((c) => (
          <MiniCircleRow key={c.id} circle={c} />
        ))}
      </PanelSection>
      <PanelSection title="Sugeridos para vos">
        {sugeridos.map((c) => (
          <MiniCircleRow key={c.id} circle={c} />
        ))}
      </PanelSection>
    </aside>
  );
}

/** Carrusel horizontal en móvil */
export function CirculosMobileStrip({ title, ids }: { title: string; ids: string[] }) {
  const byId = Object.fromEntries(CIRCULOS_CATALOG.map((c) => [c.id, c]));
  const items = ids.map((id) => byId[id]).filter(Boolean) as CircleItem[];

  return (
    <section className="mb-6">
      <h2 className="mb-3 px-1 text-xs font-bold uppercase tracking-wider text-[#6B7A8C]">
        {title}
      </h2>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory">
        {items.map((circle) => (
          <div key={circle.id} className="snap-start">
            <Link
              href={`/circulos/${circle.id}`}
              className="vu-focus flex w-[200px] flex-col gap-2 rounded-[20px] border border-[#E8EEF3] bg-white p-3 shadow-[0_4px_16px_rgba(15,42,70,0.06)]"
            >
              <p className="text-sm font-bold text-[#0B2E59] line-clamp-2">{circle.title}</p>
              <p className="text-[11px] text-[#6B7A8C]">
                {circle.online} en línea · {circle.members} miembros
              </p>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
