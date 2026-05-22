"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ActivacionCartel, ActivacionCartelId } from "@/lib/content/activacionCatalog";
import { setActivationChoice } from "@/lib/activacion/storage";
import { trackObservatoryEvent } from "@/lib/observatory/client";
import type { ParsedActivationHint } from "@/lib/tematicas/contextualBridge";

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
  suggested,
  hintReason,
  onSelect,
}: {
  cartel: ActivacionCartel;
  selected: boolean;
  suggested?: boolean;
  hintReason?: string;
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
          : suggested
            ? "border-[#1A9BB0]/50 bg-[#F8FCFD]"
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
      {suggested ? (
        <span className="rounded-full bg-[#C6D92D] px-2 py-0.5 text-[9px] font-bold uppercase text-[#0B2E59]">
          Sugerida
        </span>
      ) : null}
      <span className="text-[12px] font-bold leading-snug text-[#0B2E59]">{cartel.label}</span>
      <span className="text-[10px] leading-relaxed text-[#6B7A8C] line-clamp-3">
        {hintReason ?? cartel.description}
      </span>
    </button>
  );
}

export function ActivationHub({
  cartels,
  activationHints = [],
  suggestedCartelIds = [],
}: {
  cartels: ActivacionCartel[];
  activationHints?: ParsedActivationHint[];
  suggestedCartelIds?: ActivacionCartelId[];
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const hintByCartel = new Map(
    activationHints
      .filter((h) => h.cartelId)
      .map((h) => [h.cartelId as ActivacionCartelId, h.reason]),
  );

  const handleSelect = (cartel: ActivacionCartel) => {
    setSelectedId(cartel.id);
    setActivationChoice(cartel.id);
    trackObservatoryEvent("funnel.activacion_cartel", "funnel", {
      cartelId: cartel.id,
    });
    router.push("/plaza");
  };

  return (
    <div className="px-4 pb-8 max-w-lg mx-auto">
      {activationHints.length > 0 ? (
        <p className="mb-4 rounded-xl border border-[#1A9BB0]/20 bg-[#E6F6FA] px-3 py-2 text-[12px] leading-relaxed text-[#243647]">
          El diagnóstico sugiere por dónde conviene activar tu entrada al barrio.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        {[...cartels]
          .sort((a, b) => {
            const as = suggestedCartelIds.includes(a.id) ? 0 : 1;
            const bs = suggestedCartelIds.includes(b.id) ? 0 : 1;
            return as - bs;
          })
          .map((cartel) => (
            <ActivationCartelCard
              key={cartel.id}
              cartel={cartel}
              selected={selectedId === cartel.id}
              suggested={suggestedCartelIds.includes(cartel.id)}
              hintReason={hintByCartel.get(cartel.id)}
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
