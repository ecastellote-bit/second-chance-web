"use client";

import { useEffect, useState } from "react";
import {
  CIRCLES_VOICE_EXAMPLES,
  COMMUNITY_EXAMPLE_CONVERSATIONS_LABEL,
} from "@/lib/content/cooperativeSeedExamples";
import { CooperativeExampleVoices } from "@/components/community/CooperativeExampleVoices";

type VisibleIdea = { signalId: string; publicText: string };

type Props = { className?: string };

export function CirclesVisibleIdeasPreview({ className = "" }: Props) {
  const [ideas, setIdeas] = useState<VisibleIdea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/circle-visible-ideas?limit=6");
        const data = (await res.json()) as { ok?: boolean; ideas?: VisibleIdea[] };
        if (!cancelled && data.ok && Array.isArray(data.ideas)) {
          setIdeas(data.ideas);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <p className={["text-[13px] text-[#6B7A8C]", className].join(" ")}>
        Cargando voces de los círculos…
      </p>
    );
  }

  if (ideas.length === 0) {
    return (
      <CooperativeExampleVoices
        className={className}
        title="Conversaciones posibles en los círculos"
        intro="Así podría empezar a sonar un espacio cuando lleguen ideas curadas y revisadas — sin chat libre ni contacto automático."
        examples={CIRCLES_VOICE_EXAMPLES}
      />
    );
  }

  return (
    <section
      className={[
        "rounded-[24px] border border-[#E8EEF3] bg-white p-4 shadow-[0_4px_16px_rgba(15,42,70,0.04)]",
        className,
      ].join(" ")}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
        Voces del barrio
      </p>
      <h2 className="mt-1 text-[16px] font-bold text-[#0B2E59]">
        Ideas que empiezan a circular
      </h2>
      <p className="mt-2 text-[13px] leading-relaxed text-[#6B7A8C]">
        Textos curados por el equipo a partir de señales reales — no son chats en vivo.
      </p>
      <ul className="mt-4 flex flex-col gap-2.5">
        {ideas.map((idea) => (
          <li
            key={idea.signalId}
            className="rounded-xl border border-[#E8EEF3] bg-[#F8FAFC] px-3 py-2.5 text-[13px] leading-relaxed text-[#243647]"
          >
            {idea.publicText}
          </li>
        ))}
      </ul>
    </section>
  );
}
