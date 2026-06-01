"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ActivityItem = {
  activityId: string;
  kind: string;
  text: string;
  occurredAt: string;
};

type Props = {
  limit?: number;
  className?: string;
  showRulesLink?: boolean;
  /** Contextual copy and API filter — use on /proyectos instead of generic barrio block. */
  surface?: "barrio" | "projects";
};

export function PublicCommunityRecentActivity({
  limit = 8,
  className = "",
  showRulesLink = true,
  surface = "barrio",
}: Props) {
  const [title, setTitle] = useState(
    surface === "projects" ? "Lo que empieza a moverse en esta mesa" : "Movimiento reciente del barrio",
  );
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [emptyMessage, setEmptyMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: String(limit) });
        if (surface === "projects") params.set("surface", "projects");
        const res = await fetch(`/api/community/public-activity?${params.toString()}`);
        const data = (await res.json()) as {
          ok?: boolean;
          title?: string;
          items?: ActivityItem[];
          emptyMessage?: string;
        };
        if (cancelled) return;
        if (data.ok) {
          setTitle(data.title ?? "Movimiento reciente del barrio");
          setItems(Array.isArray(data.items) ? data.items : []);
          setEmptyMessage(data.emptyMessage ?? "");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [limit, surface]);

  return (
    <section
      className={[
        "rounded-[20px] border border-[#E8EEF3] bg-white p-4 shadow-[0_4px_16px_rgba(15,42,70,0.06)]",
        className,
      ].join(" ")}
      aria-busy={loading}
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#1A9BB0]">
        {surface === "projects" ? "Movimiento en proyectos" : "Barrio en movimiento"}
      </p>
      <h2 className="mt-1 text-[15px] font-bold text-[#0B2E59]">{title}</h2>

      {loading ? (
        <p className="mt-3 text-[13px] leading-relaxed text-[#6B7A8C]">Cargando movimiento reciente…</p>
      ) : items.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-2.5">
          {items.map((item) => (
            <li
              key={item.activityId}
              className="rounded-xl border border-[#E8EEF3] bg-[#F8FAFC] px-3 py-2.5 text-[13px] leading-relaxed text-[#243647]"
            >
              {item.text}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[13px] leading-relaxed text-[#6B7A8C]">{emptyMessage}</p>
      )}

      {showRulesLink ? (
        <p className="mt-3 text-[12px] text-[#6B7A8C]">
          <Link href="/comunidad/reglas" className="vu-focus font-semibold text-[#1A9BB0] underline">
            Reglas simples del barrio
          </Link>
        </p>
      ) : null}
    </section>
  );
}
