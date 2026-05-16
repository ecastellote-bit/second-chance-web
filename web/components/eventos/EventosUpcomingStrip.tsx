"use client";

import Link from "next/link";
import { UPCOMING_STRIP } from "@/lib/content/eventosCatalog";

export function EventosUpcomingStrip() {
  return (
    <section
      className="shrink-0 border-t border-[#E8EEF3] bg-white px-4 py-4 lg:px-8"
      aria-label="Próximos eventos"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#6B7A8C]">
          Próximos en el barrio
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory">
          {UPCOMING_STRIP.map((item) => (
            <Link
              key={item.id}
              href={`/eventos/${item.id}`}
              className="vu-focus snap-start flex min-w-[200px] max-w-[240px] flex-col gap-1 rounded-[20px] border border-[#E8EEF3] bg-[#F8FAFC] px-4 py-3 transition-colors hover:border-[#1A9BB0]/40 hover:bg-[#E6F6FA]/50"
            >
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#1A9BB0]">
                {item.label} · {item.dateShort}
              </span>
              <span className="text-sm font-semibold leading-snug text-[#0B2E59] line-clamp-2">
                {item.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
