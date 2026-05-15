"use client";

import Image from "next/image";
import type { TematicaCard } from "@/lib/content/tematicasCatalog";

function ThemeIcon({ id }: { id: string }) {
  const className = "h-[18px] w-[18px]";
  switch (id) {
    case "reordenar_camino":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );
    case "escribir_crear":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 20h4l10-10-4-4L4 16v4zM14 6l4 4" />
        </svg>
      );
    case "aprender_nuevo":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19h16M6 16V8l6-4 6 4v8" />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3l2 7h7l-5.5 4 2 7L12 17l-5.5 4 2-7L3 10h7l2-7z" />
        </svg>
      );
  }
}

export function ThemeImageCard({
  card,
  onSelect,
  selected,
}: {
  card: TematicaCard;
  onSelect: (id: string) => void;
  selected?: boolean;
}) {
  const iconColor = card.accent === "#C6D92D" ? "#0B2E59" : "#FFFFFF";

  return (
    <button
      type="button"
      onClick={() => onSelect(card.id)}
      className={[
        "vu-focus relative w-full overflow-hidden rounded-[20px] text-left min-h-[168px]",
        "shadow-[0_4px_16px_rgba(15,42,70,0.08)] transition-transform active:scale-[0.98]",
        selected ? "ring-2 ring-[#1A9BB0] ring-offset-2 ring-offset-[#F8FAFC]" : "",
      ].join(" ")}
    >
      <div className="relative aspect-[4/5] w-full">
        <Image
          src={card.image}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 200px"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(11,46,89,0.15) 0%, rgba(11,46,89,0.25) 40%, rgba(15,30,50,0.82) 100%)",
          }}
        />
        <span
          className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl shadow-md"
          style={{ backgroundColor: card.accent, color: iconColor }}
        >
          <ThemeIcon id={card.id} />
        </span>
        {card.badge ? (
          <span className="absolute right-3 top-3 rounded-full bg-[#C6D92D] px-2 py-0.5 text-[10px] font-bold text-[#0B2E59]">
            {card.badge}
          </span>
        ) : null}
        <p className="absolute bottom-0 left-0 right-0 p-3.5 text-[13px] font-bold leading-snug text-white">
          {card.title}
        </p>
      </div>
    </button>
  );
}
