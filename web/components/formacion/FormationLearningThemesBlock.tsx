"use client";

import { useEffect, useState } from "react";
import {
  COMMUNITY_EXAMPLE_CONVERSATIONS_LABEL,
  FORMATION_THEME_EXAMPLES,
} from "@/lib/content/cooperativeSeedExamples";

type Theme = { themeId: string; excerpt: string };

type Props = { className?: string };

export function FormationLearningThemesBlock({ className = "" }: Props) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromExamples, setFromExamples] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/formation-suggestions/public-themes?limit=6");
        const data = (await res.json()) as { ok?: boolean; themes?: Theme[] };
        if (cancelled) return;
        if (data.ok && Array.isArray(data.themes) && data.themes.length > 0) {
          setThemes(data.themes);
          setFromExamples(false);
        } else {
          setThemes(
            FORMATION_THEME_EXAMPLES.map((t) => ({ themeId: t.id, excerpt: t.excerpt })),
          );
          setFromExamples(true);
        }
      } catch {
        if (!cancelled) {
          setThemes(
            FORMATION_THEME_EXAMPLES.map((t) => ({ themeId: t.id, excerpt: t.excerpt })),
          );
          setFromExamples(true);
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

  return (
    <section
      className={[
        "mb-6 rounded-[24px] border border-[#E8EEF3] bg-[#F8FAFC] p-4",
        className,
      ].join(" ")}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
        Primeras rutas en preparación
      </p>
      <h2 className="mt-1 text-[16px] font-bold text-[#0B2E59]">
        Lo que el barrio quiere aprender
      </h2>
      <p className="mt-2 text-[13px] leading-relaxed text-[#6B7A8C]">
        Temas que empiezan a aparecer entre integrantes — anonimizados, sin datos personales.
        No implica cursos confirmados ni convenios todavía.
      </p>

      {loading ? (
        <p className="mt-4 text-[13px] text-[#6B7A8C]">Cargando temas…</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {themes.map((theme) => (
            <li
              key={theme.themeId}
              className="rounded-xl border border-[#E8EEF3] bg-white px-3 py-2.5 text-[13px] leading-relaxed text-[#243647]"
            >
              <span className="font-semibold text-[#0B2E59]">Tema sugerido: </span>
              {theme.excerpt}
            </li>
          ))}
        </ul>
      )}

      {fromExamples && !loading ? (
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-[#6B7A8C]">
          {COMMUNITY_EXAMPLE_CONVERSATIONS_LABEL}
        </p>
      ) : null}
    </section>
  );
}
