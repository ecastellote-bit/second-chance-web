"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ActivacionAction } from "@/lib/content/activacionCatalog";

function VuLogoMark({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="24" cy="24" r="22" fill="#0B2E59" />
      <path d="M16 28 L24 14 L32 28 Z" fill="#1A9BB0" />
      <path d="M20 28 L24 20 L28 28 Z" fill="#C6D92D" />
    </svg>
  );
}

function ActionIcon({ type }: { type: ActivacionAction["icon"] }) {
  const cls = "h-5 w-5";
  switch (type) {
    case "project":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 7h5l2-3h4l2 3h5v12H3V7z" />
          <path d="M3 12h18" />
        </svg>
      );
    case "create":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "learn":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19h16M6 16V8l6-4 6 4v8" />
        </svg>
      );
    case "connect":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="8" r="3" />
          <circle cx="16" cy="9" r="2.5" />
          <path d="M4 20c0-3 2-5 5-5s5 2 5 5" />
        </svg>
      );
    case "explore":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4l2 2" />
        </svg>
      );
    case "opportunities":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3 7h7l-5.5 4 2 7-6.5-4-6.5 4 2-7L9 9h7l3-7z" />
        </svg>
      );
  }
}

function ActivationActionCard({
  action,
  selected,
  onSelect,
}: {
  action: ActivacionAction;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "vu-focus flex min-h-[88px] w-full flex-col items-start gap-2 rounded-[18px] border-2 bg-white p-4 text-left",
        "shadow-[0_4px_16px_rgba(15,42,70,0.08)] transition-all active:scale-[0.98]",
        selected
          ? "border-[#C6D92D] bg-[#F4F9E0] ring-1 ring-[#C6D92D]/40"
          : "border-[#E7EEF5] hover:border-[#1A9BB0]/40",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-10 w-10 items-center justify-center rounded-xl",
          selected ? "bg-[#C6D92D] text-[#0B2E59]" : "bg-[#E6F6FA] text-[#1A9BB0]",
        ].join(" ")}
      >
        <ActionIcon type={action.icon} />
      </span>
      <span className="text-[13px] font-bold leading-snug text-[#0B2E59]">{action.label}</span>
      <span className="text-[11px] leading-relaxed text-[#6B7280]">{action.description}</span>
    </button>
  );
}

export function ActivationHub({ actions }: { actions: ActivacionAction[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (action: ActivacionAction) => {
    setSelectedId(action.id);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("vu_activation_choice", action.id);
    }
    router.push(action.route);
  };

  return (
    <div className="px-4 pb-8 max-w-lg mx-auto">
      {/* Central hub — glowing rings */}
      <div className="relative mx-auto mb-8 flex h-[200px] w-full max-w-[280px] items-center justify-center">
        <div
          className="absolute h-[200px] w-[200px] rounded-full opacity-40 animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(26,155,176,0.35) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute h-[168px] w-[168px] rounded-full border-2 border-[#1A9BB0]/30"
          style={{ animation: "pulse 3s ease-in-out infinite" }}
        />
        <div
          className="absolute h-[140px] w-[140px] rounded-full border-2 border-[#C6D92D]/40"
          style={{ animation: "pulse 3s ease-in-out infinite 0.5s" }}
        />
        <div className="relative z-10 flex h-[88px] w-[88px] items-center justify-center rounded-full bg-white shadow-[0_8px_32px_rgba(26,155,176,0.25)] ring-4 ring-[#1A9BB0]/20">
          <VuLogoMark size={56} />
        </div>
      </div>

      {/* Action cards — 2 column grid */}
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <ActivationActionCard
            key={action.id}
            action={action}
            selected={selectedId === action.id}
            onSelect={() => handleSelect(action)}
          />
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-[#9CA3AF] leading-relaxed px-2">
        Un punto de decisión tranquilo dentro del ecosistema VocationUp — energía con calma.
      </p>
    </div>
  );
}
