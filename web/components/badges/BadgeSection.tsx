"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { BadgeView } from "@/lib/badges-store/userBadgeTypes";

type Props = {
  userId: string;
  /** Si true, el header dice "Mi progreso"; si false, "Progreso". */
  isOwnProfile?: boolean;
};

export function BadgeSection({ userId, isOwnProfile = true }: Props) {
  const [badges, setBadges] = useState<BadgeView[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId.trim()) {
      setBadges([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/logros?userId=${encodeURIComponent(userId.trim())}`,
      );
      const data = (await res.json()) as {
        ok?: boolean;
        badges?: BadgeView[];
      };
      if (res.ok && data.ok && Array.isArray(data.badges)) {
        setBadges(data.badges);
      } else {
        setBadges([]);
      }
    } catch {
      setBadges([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const earnedCount = badges.filter((b) => b.earned).length;
  const title = isOwnProfile ? "Mi progreso" : "Progreso";

  if (loading) {
    return (
      <section
        className="mt-8 border-t border-[#E8EEF3] pt-6"
        aria-busy="true"
        aria-label={title}
      >
        <p className="text-[17px] font-medium text-[#0B2E59]">{title}</p>
        <p className="mt-1 text-sm text-[#6B7A8C]">Cargando logros…</p>
      </section>
    );
  }

  return (
    <section
      className="mt-8 border-t border-[#E8EEF3] pt-6"
      aria-labelledby="badge-section-title"
    >
      <h2
        id="badge-section-title"
        className="text-[17px] font-medium text-[#0B2E59]"
      >
        {title}
      </h2>
      <p className="mt-1 text-sm text-[#6B7A8C]">
        {earnedCount} de {badges.length || 5} logros
      </p>

      {earnedCount === 0 ? (
        <p className="mt-4 text-base leading-relaxed text-[#6B7A8C]">
          Aún no hay logros. ¡Completá tu diagnóstico para empezar!{" "}
          <Link
            href="/diagnostico"
            className="font-semibold text-[#1A9BB0] underline"
          >
            Ir al diagnóstico
          </Link>
        </p>
      ) : null}

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {badges.map((badge) => (
          <li key={badge.slug}>
            <article
              title={badge.description}
              className={[
                "flex h-full flex-col items-center rounded-[12px] border border-[#E8EEF3] bg-white p-4 text-center",
                badge.earned ? "" : "",
              ].join(" ")}
            >
              <span
                className={[
                  "text-[32px] leading-none",
                  badge.earned ? "" : "opacity-30 grayscale",
                ].join(" ")}
                aria-hidden
              >
                {badge.icon}
              </span>
              <p
                className={[
                  "mt-2 text-sm font-medium",
                  badge.earned ? "text-[#0B2E59]" : "text-[#94A3B8]",
                ].join(" ")}
              >
                {badge.name}
              </p>
              <p
                className={[
                  "mt-1 text-xs leading-snug",
                  badge.earned ? "text-[#6B7A8C]" : "text-[#CBD5E1]",
                ].join(" ")}
              >
                {badge.description}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
