"use client";

import { FUNDADOR_STICKY_NUDGE } from "@/lib/content/fundadorConversionCopy";

type Props = {
  visible: boolean;
  onPrimary: () => void;
  onSecondary: () => void;
};

export function FounderStickyNudge({ visible, onPrimary, onSecondary }: Props) {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[70] border-t border-[#1A9BB0]/35 bg-[#071018]/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md"
      role="region"
      aria-label="Primera acción"
    >
      <div className="mx-auto max-w-lg">
        <p className="text-center text-[13px] font-semibold leading-snug text-white">
          {FUNDADOR_STICKY_NUDGE.title}{" "}
          <span className="text-[#C6D92D]">{FUNDADOR_STICKY_NUDGE.titleAccent}</span>
        </p>
        <div className="mt-2.5 flex gap-2">
          <button
            type="button"
            onClick={onPrimary}
            className="vu-focus min-h-[44px] flex-1 rounded-xl bg-[#C6D92D] px-3 text-[13px] font-bold text-[#0B2E59] active:scale-[0.99]"
          >
            {FUNDADOR_STICKY_NUDGE.primaryCta}
          </button>
          <button
            type="button"
            onClick={onSecondary}
            className="vu-focus min-h-[44px] flex-1 rounded-xl border border-white/20 bg-white/8 px-3 text-[13px] font-semibold text-white active:scale-[0.99]"
          >
            {FUNDADOR_STICKY_NUDGE.secondaryCta}
          </button>
        </div>
      </div>
    </div>
  );
}
