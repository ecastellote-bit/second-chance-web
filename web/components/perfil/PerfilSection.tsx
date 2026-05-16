"use client";

import type { ReactNode } from "react";

export function PerfilSection({
  title,
  children,
  hint,
}: {
  title: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <section className="rounded-[24px] bg-white p-4 shadow-[0_4px_16px_rgba(15,42,70,0.08)] ring-1 ring-[#E8EEF3]/80">
      <div className="mb-3">
        <h2 className="text-sm font-bold text-[#0B2E59]">{title}</h2>
        {hint ? <p className="mt-0.5 text-xs text-[#6B7A8C]">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function PerfilChips({
  items,
  variant = "teal",
}: {
  items: { id: string; label: string }[];
  variant?: "teal" | "lime" | "navy";
}) {
  const styles = {
    teal: "bg-[#E6F6FA] text-[#0B2E59] ring-[#1A9BB0]/25",
    lime: "bg-[#F4F9E0] text-[#0B2E59] ring-[#C6D92D]/40",
    navy: "bg-[#E8EEF8] text-[#0B2E59] ring-[#0B2E59]/15",
  }[variant];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((chip) => (
        <span
          key={chip.id}
          className={[
            "inline-flex min-h-[36px] items-center rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1",
            styles,
          ].join(" ")}
        >
          {chip.label}
        </span>
      ))}
    </div>
  );
}

export function CaminoProgress({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <div
        className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(#1A9BB0 ${value * 3.6}deg, #E8EEF3 0deg)`,
        }}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xs font-bold text-[#0B2E59]">
          {value}%
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold text-[#0B2E59]">{label}</p>
        <p className="text-xs text-[#6B7A8C]">Tu recorrido dentro del barrio</p>
      </div>
    </div>
  );
}
