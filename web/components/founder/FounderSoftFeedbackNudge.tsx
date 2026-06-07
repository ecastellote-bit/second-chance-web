"use client";

import { FUNDADOR_SOFT_FEEDBACK_COPY } from "@/lib/content/fundadorSoftFeedbackCopy";

type Props = {
  visible: boolean;
  onFeedback: () => void;
  onTrySixty: () => void;
  onDismiss: () => void;
};

export function FounderSoftFeedbackNudge({
  visible,
  onFeedback,
  onTrySixty,
  onDismiss,
}: Props) {
  if (!visible) return null;

  return (
    <aside
      className="mt-4 rounded-2xl border border-[#1A9BB0]/30 bg-[#0B2E59]/75 px-4 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.22)] backdrop-blur-sm"
      role="region"
      aria-label="Feedback opcional"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-bold leading-snug text-white">
            {FUNDADOR_SOFT_FEEDBACK_COPY.title}
          </h3>
          <p className="mt-1 text-[12px] leading-relaxed text-white/70">
            {FUNDADOR_SOFT_FEEDBACK_COPY.body}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="vu-focus shrink-0 rounded-lg px-1.5 py-0.5 text-[18px] leading-none text-white/45 hover:text-white/75"
          aria-label={FUNDADOR_SOFT_FEEDBACK_COPY.dismissLabel}
        >
          ×
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onFeedback}
          className="vu-focus min-h-[44px] flex-1 rounded-xl border border-[#1A9BB0]/45 bg-[#1A9BB0]/12 px-3 text-[13px] font-semibold text-[#1A9BB0] active:scale-[0.99]"
        >
          {FUNDADOR_SOFT_FEEDBACK_COPY.feedbackCta}
        </button>
        <button
          type="button"
          onClick={onTrySixty}
          className="vu-focus min-h-[44px] flex-1 rounded-xl bg-[#C6D92D] px-3 text-[13px] font-bold text-[#0B2E59] active:scale-[0.99]"
        >
          {FUNDADOR_SOFT_FEEDBACK_COPY.trySixtyCta}
        </button>
      </div>
    </aside>
  );
}
