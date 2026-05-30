"use client";

import { useEffect, useState } from "react";

type VisibleIdea = {
  signalId: string;
  publicText: string;
};

type Props = {
  circleId: string;
  className?: string;
};

export function CircleVisibleIdeasBlock({ circleId, className = "" }: Props) {
  const [ideas, setIdeas] = useState<VisibleIdea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/circle-visible-ideas?circleId=${encodeURIComponent(circleId)}`,
        );
        const data = (await res.json()) as { ok?: boolean; ideas?: VisibleIdea[] };
        if (!cancelled && data.ok && Array.isArray(data.ideas)) {
          setIdeas(data.ideas);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [circleId]);

  return (
    <section
      className={[
        "rounded-2xl border border-[#E8EEF3] bg-white p-4",
        className,
      ].join(" ")}
    >
      <h2 className="text-[15px] font-bold text-[#0B2E59]">
        Ideas que están apareciendo en este círculo
      </h2>
      {loading ? (
        <p className="mt-2 text-[13px] text-[#6B7A8C]">Cargando ideas publicadas…</p>
      ) : ideas.length === 0 ? (
        <p className="mt-2 text-[13px] leading-relaxed text-[#6B7A8C]">
          Todavía no hay ideas publicadas. Podés dejar una para revisión del equipo.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {ideas.map((idea) => (
            <li
              key={idea.signalId}
              className="rounded-xl border border-[#E8EEF3] bg-[#F8FAFC] px-3 py-2.5 text-[13px] leading-relaxed text-[#243647]"
            >
              <span className="font-semibold text-[#0B2E59]">Una idea recibida: </span>
              {idea.publicText}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
