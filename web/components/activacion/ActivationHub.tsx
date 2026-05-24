"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { setActivationChoice } from "@/lib/activacion/storage";
import {
  OFFICIAL_ACTIVATION_PATHS,
  type OfficialActivationPath,
  type OfficialActivationPathIcon,
} from "@/lib/content/officialActivationPaths";
import { postCommunityEvent } from "@/lib/community/communityClient";
import { trackObservatoryEvent } from "@/lib/observatory/client";
import type { ParsedActivationHint } from "@/lib/tematicas/contextualBridge";
import type { OfficialActivationPathId } from "@/lib/content/officialActivationPaths";

function PathIcon({ type }: { type: OfficialActivationPathIcon }) {
  const cls = "h-5 w-5";
  switch (type) {
    case "people":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="8" r="3" />
          <circle cx="16" cy="9" r="2.5" />
          <path d="M4 20c0-3 2-5 5-5s5 2 5 5" />
        </svg>
      );
    case "book":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16v14H4V6zM8 6V4h8v2" />
        </svg>
      );
    case "rocket":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3l2 7h7l-5.5 4 2 7-5.5-4-5.5 4 2-7L5 10h7l2-7z" />
        </svg>
      );
    case "puzzle":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 8h3V5h5v3h3v5h-3v5h-5v-3H8V8z" />
        </svg>
      );
    case "compass":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4l2 2" />
        </svg>
      );
  }
}

function ActivationPathCard({
  path,
  selected,
  suggested,
  hintReason,
  onSelect,
}: {
  path: OfficialActivationPath;
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
        <PathIcon type={path.icon} />
      </span>
      {suggested ? (
        <span className="rounded-full bg-[#C6D92D] px-2 py-0.5 text-[9px] font-bold uppercase text-[#0B2E59]">
          Sugerido
        </span>
      ) : null}
      <span className="text-[12px] font-bold leading-snug text-[#0B2E59]">{path.label}</span>
      <span className="text-[10px] leading-relaxed text-[#6B7A8C] line-clamp-3">
        {hintReason ?? path.description}
      </span>
    </button>
  );
}

export function ActivationHub({
  activationHints = [],
  suggestedPathIds = [],
}: {
  activationHints?: ParsedActivationHint[];
  suggestedPathIds?: OfficialActivationPathId[];
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const hintByPath = new Map(
    activationHints
      .filter((h) => h.pathId)
      .map((h) => [h.pathId as OfficialActivationPathId, h.reason]),
  );

  const handleSelect = (path: OfficialActivationPath) => {
    setSelectedId(path.id);
    setActivationChoice(path.id);
    trackObservatoryEvent("funnel.activacion_cartel", "funnel", {
      cartelId: path.id,
      activationPathId: path.id,
    });
    void postCommunityEvent({
      event: "activation_selected",
      pathId: path.id,
      pathLabel: path.label,
    });
    const nextHref =
      path.id === "armar_mi_propio_proyecto" ? "/proyectos/sembrar" : "/plaza";
    router.push(nextHref);
  };

  return (
    <div className="px-4 pb-8 max-w-lg mx-auto">
      {activationHints.length > 0 ? (
        <p className="mb-4 rounded-xl border border-[#1A9BB0]/20 bg-[#E6F6FA] px-3 py-2 text-[12px] leading-relaxed text-[#243647]">
          El diagnóstico sugiere por dónde conviene activar tu entrada al barrio.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[...OFFICIAL_ACTIVATION_PATHS]
          .sort((a, b) => {
            const as = suggestedPathIds.includes(a.id) ? 0 : 1;
            const bs = suggestedPathIds.includes(b.id) ? 0 : 1;
            return as - bs;
          })
          .map((path) => (
            <ActivationPathCard
              key={path.id}
              path={path}
              selected={selectedId === path.id}
              suggested={suggestedPathIds.includes(path.id)}
              hintReason={hintByPath.get(path.id)}
              onSelect={() => handleSelect(path)}
            />
          ))}
      </div>

      <p className="mt-6 text-center text-xs text-[#6B7A8C] leading-relaxed px-2">
        Elegí uno de los cinco caminos oficiales. Después verás tu plaza, las tres puertas y el mapa
        del ecosistema.
      </p>
    </div>
  );
}
