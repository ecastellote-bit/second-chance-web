"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ActivacionCartel } from "@/lib/content/activacionCatalog";
import { setActivationChoice } from "@/lib/activacion/storage";

function VuLogoMark({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="24" cy="24" r="22" fill="#0B2E59" />
      <path d="M16 28 L24 14 L32 28 Z" fill="#1A9BB0" />
      <path d="M20 28 L24 20 L28 28 Z" fill="#C6D92D" />
    </svg>
  );
}

function CartelIcon({ type }: { type: ActivacionCartel["icon"] }) {
  const cls = "h-5 w-5";
  switch (type) {
    case "present":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M8 12h8M12 8v8" />
        </svg>
      );
    case "associate":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="8" r="3" />
          <circle cx="16" cy="9" r="2.5" />
          <path d="M4 20c0-3 2-5 5-5s5 2 5 5" />
        </svg>
      );
    case "jobs":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 7h16v12H4V7zM9 7V5h6v2" />
        </svg>
      );
    case "explore":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4l2 2" />
        </svg>
      );
  }
}

function ActivationCartelCard({
  cartel,
  selected,
  onSelect,
}: {
  cartel: ActivacionCartel;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "vu-focus flex min-h-[120px] w-full flex-col items-start gap-2 rounded-[20px] border-2 bg-white p-4 text-left",
        "shadow-[0_4px_16px_rgba(15,42,70,0.08)] transition-all active:scale-[0.98]",
        selected
          ? "border-[#C6D92D] bg-[#F4F9E0] ring-1 ring-[#C6D92D]/40"
          : "border-[#E8EEF3] hover:border-[#1A9BB0]/40",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-10 w-10 items-center justify-center rounded-xl",
          selected ? "bg-[#C6D92D] text-[#0B2E59]" : "bg-[#E6F6FA] text-[#1A9BB0]",
        ].join(" ")}
      >
        <CartelIcon type={cartel.icon} />
      </span>
      <span className="text-[12px] font-bold leading-snug text-[#0B2E59]">{cartel.label}</span>
      <span className="text-[10px] leading-relaxed text-[#6B7A8C] line-clamp-3">{cartel.description}</span>
    </button>
  );
}

export function ActivationHub({ cartels }: { cartels: ActivacionCartel[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (cartel: ActivacionCartel) => {
    setSelectedId(cartel.id);
    setActivationChoice(cartel.id);
    router.push("/plaza");
  };

  return (
    <div className="px-4 pb-8 max-w-lg mx-auto">
      <div className="relative mx-auto mb-8 flex h-[180px] w-full max-w-[260px] items-center justify-center">
        <div
          className="absolute h-[180px] w-[180px] rounded-full opacity-40 animate-pulse"
          style={{
            background: "radial-gradient(circle, rgba(26,155,176,0.35) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 flex h-[80px] w-[80px] items-center justify-center rounded-full bg-white shadow-[0_8px_32px_rgba(26,155,176,0.25)] ring-4 ring-[#1A9BB0]/20">
          <VuLogoMark size={52} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cartels.map((cartel) => (
          <ActivationCartelCard
            key={cartel.id}
            cartel={cartel}
            selected={selectedId === cartel.id}
            onSelect={() => handleSelect(cartel)}
          />
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-[#6B7A8C] leading-relaxed px-2">
        Última antesala al barrio: después verás tu plaza, las tres puertas y el mapa del ecosistema.
      </p>
    </div>
  );
}
