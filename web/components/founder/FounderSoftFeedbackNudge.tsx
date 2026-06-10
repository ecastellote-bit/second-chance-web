"use client";

import { FUNDADOR_SOFT_FEEDBACK_COPY } from "@/lib/content/fundadorSoftFeedbackCopy";

type Props = {
  visible: boolean;
  onFeedback: () => void;
  onTrySixty: () => void;
  onDismiss: () => void;
  variant?: "inline" | "footer";
};

export function FounderSoftFeedbackNudge({
  visible,
  onFeedback,
  onTrySixty,
  onDismiss,
  variant = "inline",
}: Props) {
  if (!visible) return null;

  const isFooter = variant === "footer";

  return (
    <aside
      className={[
        "rounded-2xl border px-4 py-3.5 backdrop-blur-sm",
        isFooter
          ? "border-white/10 bg-[#0B2E59]/45 shadow-[0_4px_16px_rgba(0,0,0,0.14)]"
          : "mt-4 border-[#1A9BB0]/30 bg-[#0B2E59]/75 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.22)]",
      ].join(" ")}
      role="region"
      aria-label="Feedback opcional"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3
            className={[
              "font-semibold leading-snug text-white/90",
              isFooter ? "text-[13px]" : "text-[14px] font-bold",
            ].join(" ")}
          >
            {FUNDADOR_SOFT_FEEDBACK_COPY.title}
          </h3>
          <p
            className={[
              "mt-1 leading-relaxed",
              isFooter ? "text-[11px] text-white/55" : "text-[12px] text-white/70",
            ].join(" ")}
          >
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

      <div className={`flex flex-col gap-2 sm:flex-row ${isFooter ? "mt-2.5" : "mt-3"}`}>
        <button
          type="button"
          onClick={onFeedback}
          className={[
            "vu-focus min-h-[44px] flex-1 rounded-xl border px-3 font-semibold active:scale-[0.99]",
            isFooter
              ? "border-white/14 bg-white/5 text-[12px] text-white/80"
              : "border-[#1A9BB0]/45 bg-[#1A9BB0]/12 text-[13px] text-[#1A9BB0]",
          ].join(" ")}
        >
          {FUNDADOR_SOFT_FEEDBACK_COPY.feedbackCta}
        </button>
        <button
          type="button"
          onClick={onTrySixty}
          className={[
            "vu-focus min-h-[44px] flex-1 rounded-xl px-3 active:scale-[0.99]",
            isFooter
              ? "border border-white/12 bg-transparent text-[12px] font-medium text-white/65"
              : "bg-[#C6D92D] text-[13px] font-bold text-[#0B2E59]",
          ].join(" ")}
        >
          {FUNDADOR_SOFT_FEEDBACK_COPY.trySixtyCta}
        </button>
      </div>
    </aside>
  );
}
