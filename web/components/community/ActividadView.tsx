"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { VuMobileShell } from "@/components/layout/VuMobileShell";
import { fetchCommunityActivities } from "@/lib/community/communityClient";
import type { CommunityActivityItem } from "@/lib/community/types";
import { ACTIVIDAD_COPY } from "@/lib/content/communityInboxCopy";

function ActivityCard({ item }: { item: CommunityActivityItem }) {
  return (
    <article className="rounded-2xl border border-[#E8EEF3] bg-white p-4 shadow-[0_4px_16px_rgba(15,42,70,0.06)]">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#1A9BB0]">
        {new Date(item.createdAt).toLocaleDateString("es-AR", {
          day: "numeric",
          month: "short",
        })}
      </p>
      <h2 className="mt-1 text-[15px] font-bold text-[#0B2E59]">{item.title}</h2>
      <p className="mt-2 text-[13px] leading-relaxed text-[#6B7A8C]">{item.body}</p>
      {item.ctaLabel && item.ctaHref ? (
        <Link
          href={item.ctaHref}
          className="vu-focus mt-3 inline-flex min-h-[40px] items-center text-sm font-semibold text-[#1A9BB0] underline"
        >
          {item.ctaLabel}
        </Link>
      ) : null}
    </article>
  );
}

export function ActividadView() {
  const [activities, setActivities] = useState<CommunityActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchCommunityActivities().then((items) => {
      if (!cancelled) {
        setActivities(items);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <VuMobileShell navActive="actividad">
      <div className="px-4 pb-8 pt-2 max-w-lg mx-auto">
        <h1 className="text-[1.65rem] font-bold tracking-tight text-[#0B2E59]">
          {ACTIVIDAD_COPY.title}
        </h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-[#6B7A8C]">
          {ACTIVIDAD_COPY.subtitle}
        </p>

        {loading ? (
          <p className="mt-8 text-sm text-[#6B7A8C]">Cargando tu actividad…</p>
        ) : activities.length > 0 ? (
          <div className="mt-6 space-y-3">
            {activities.map((item) => (
              <ActivityCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-[#E8EEF3] bg-white p-6 text-center">
            <p className="text-sm font-semibold text-[#0B2E59]">{ACTIVIDAD_COPY.emptyTitle}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-[#6B7A8C]">
              {ACTIVIDAD_COPY.emptyBody}
            </p>
            <div className="mt-5 flex flex-col gap-2">
              {ACTIVIDAD_COPY.emptyHints.map((hint) => (
                <Link
                  key={hint.href}
                  href={hint.href}
                  className="vu-focus rounded-xl border border-[#0B2E59]/15 px-4 py-3 text-sm font-semibold text-[#0B2E59]"
                >
                  {hint.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </VuMobileShell>
  );
}
