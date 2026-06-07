"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FOUNDER_EXIT_TEXT_MAX,
  FUNDADOR_EXIT_COPY,
  type FounderExitFeedbackOptionId,
} from "@/lib/content/fundadorExitCopy";
import {
  getFounderSessionId,
  trackFounderConversion,
} from "@/lib/founder/founderConversionTelemetry";

type Props = {
  open: boolean;
  onClose: () => void;
  onTrySixty: () => void;
  onLeaveAfterSubmit?: () => void;
};

export function FounderExitModal({ open, onClose, onTrySixty, onLeaveAfterSubmit }: Props) {
  const [selected, setSelected] = useState<FounderExitFeedbackOptionId | null>(null);
  const [freeText, setFreeText] = useState("");
  const [textStarted, setTextStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSelected(null);
      setFreeText("");
      setTextStarted(false);
      setError("");
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmitAndLeave() {
    if (!selected) {
      setError("Elegí una opción antes de enviar.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/founder-exit-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedOption: selected,
          freeText: freeText.trim() || null,
          sessionId: getFounderSessionId(),
          path: "/fundador",
        }),
      });
      const data = (await res.json()) as { ok?: boolean };
      trackFounderConversion("founder.exit_feedback_submitted", {
        selectedOption: selected,
        freeTextLength: freeText.trim().length,
        success: res.ok && data.ok ? 1 : 0,
      });
      if (!res.ok || !data.ok) {
        setError("No pudimos guardar la señal. Podés salir igual.");
        return;
      }
      onLeaveAfterSubmit?.();
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="founder-exit-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#071018]/82 backdrop-blur-sm"
        aria-label="Cerrar"
        onClick={onClose}
      />

      <div className="relative z-10 mx-auto flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] border border-[#1A9BB0]/25 bg-[#0B2E59] shadow-[0_-16px_48px_rgba(0,0,0,0.5)] sm:rounded-[28px] sm:m-4">
        <div className="overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          <h2
            id="founder-exit-title"
            className="text-[1.25rem] font-extrabold leading-tight text-white sm:text-[1.35rem]"
          >
            {FUNDADOR_EXIT_COPY.title}
          </h2>
          <p className="mt-2 text-[13px] text-white/65">{FUNDADOR_EXIT_COPY.subtitle}</p>

          <ul className="mt-4 flex flex-col gap-1.5">
            {FUNDADOR_EXIT_COPY.options.map((option) => {
              const active = selected === option.id;
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(option.id);
                      trackFounderConversion("founder.exit_feedback_selected", {
                        selectedOption: option.id,
                      });
                    }}
                    className={[
                      "vu-focus w-full rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold leading-snug transition-colors",
                      active
                        ? "border border-[#C6D92D]/50 bg-[#C6D92D]/15 text-white"
                        : "border border-white/10 bg-white/5 text-white/88 hover:border-[#1A9BB0]/40",
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>

          <label className="mt-4 block">
            <span className="text-[12px] font-semibold text-white/70">
              {FUNDADOR_EXIT_COPY.freeTextLabel}
            </span>
            <textarea
              value={freeText}
              onChange={(e) => {
                if (!textStarted && e.target.value.length > 0) {
                  setTextStarted(true);
                  trackFounderConversion("founder.exit_feedback_text_started");
                }
                setFreeText(e.target.value);
              }}
              maxLength={FOUNDER_EXIT_TEXT_MAX}
              rows={3}
              placeholder={FUNDADOR_EXIT_COPY.freeTextPlaceholder}
              className="mt-2 w-full resize-none rounded-xl border border-white/12 bg-black/25 px-3 py-2.5 text-[13px] text-white placeholder:text-white/35"
            />
          </label>

          {error ? <p className="mt-2 text-[12px] text-amber-200">{error}</p> : null}

          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmitAndLeave}
              className="vu-focus min-h-[44px] rounded-xl border border-white/20 bg-white/10 px-4 text-[14px] font-semibold text-white disabled:opacity-70"
            >
              {submitting ? "Enviando…" : FUNDADOR_EXIT_COPY.submitAndLeave}
            </button>
            <button
              type="button"
              onClick={() => {
                trackFounderConversion("founder.exit_continue_click", { action: "try_sixty" });
                onTrySixty();
                onClose();
              }}
              className="vu-focus min-h-[44px] rounded-xl bg-[#C6D92D] px-4 text-[14px] font-bold text-[#0B2E59]"
            >
              {FUNDADOR_EXIT_COPY.trySixty}
            </button>
            <Link
              href="/barrio"
              onClick={() => {
                trackFounderConversion("founder.exit_continue_click", { action: "see_projects" });
                onClose();
              }}
              className="vu-focus inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[#1A9BB0]/40 px-4 text-[14px] font-semibold text-[#1A9BB0]"
            >
              {FUNDADOR_EXIT_COPY.seeProjects}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
