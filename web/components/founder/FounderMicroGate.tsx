"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  FUNDADOR_MICROGATE,
  type FounderMicrogateOptionId,
} from "@/lib/content/fundadorConversionCopy";

type Step = "choose" | "bridge";

type Props = {
  open: boolean;
  step: Step;
  selectedId: FounderMicrogateOptionId | null;
  onClose: () => void;
  onSelectOption: (id: FounderMicrogateOptionId) => void;
  onContinueReading: () => void;
  onSecondaryBarrio: () => void;
};

export function FounderMicroGate({
  open,
  step,
  selectedId,
  onClose,
  onSelectOption,
  onContinueReading,
  onSecondaryBarrio,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const selectedLabel =
    FUNDADOR_MICROGATE.options.find((o) => o.id === selectedId)?.label ?? null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="founder-microgate-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#071018]/75 backdrop-blur-sm"
        aria-label="Cerrar"
        onClick={onClose}
      />

      <div className="relative z-10 mx-auto flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] border border-[#1A9BB0]/30 bg-[#0B2E59] shadow-[0_-12px_48px_rgba(0,0,0,0.45)] sm:rounded-[28px] sm:m-4">
        <div className="h-1 w-full shrink-0 overflow-hidden bg-[#071018]">
          <div className="h-full w-1/3 animate-pulse bg-gradient-to-r from-transparent via-[#C6D92D]/80 to-transparent" />
        </div>

        <div className="overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          {step === "choose" ? (
            <>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#C6D92D]">
                Tu lectura inicial · primer paso
              </p>
              <h2
                id="founder-microgate-title"
                className="mt-2 text-[1.35rem] font-extrabold leading-tight text-white sm:text-[1.5rem]"
              >
                {FUNDADOR_MICROGATE.title}
              </h2>
              <p className="mt-2 text-[13px] text-white/65">{FUNDADOR_MICROGATE.subtitle}</p>

              <ul className="mt-4 flex flex-col gap-2">
                {FUNDADOR_MICROGATE.options.map((option) => (
                  <li key={option.id}>
                    <button
                      type="button"
                      onClick={() => onSelectOption(option.id)}
                      className="vu-focus w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3.5 text-left text-[14px] font-semibold leading-snug text-white transition-colors hover:border-[#1A9BB0]/50 hover:bg-[#1A9BB0]/12 active:scale-[0.99]"
                    >
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#1A9BB0]">
                {selectedLabel}
              </p>
              <h2 className="mt-2 text-[1.35rem] font-extrabold leading-tight text-white sm:text-[1.5rem]">
                {FUNDADOR_MICROGATE.bridgeTitle}
              </h2>
              <p className="mt-1 text-[1.2rem] font-bold leading-tight text-[#C6D92D] sm:text-[1.35rem]">
                {FUNDADOR_MICROGATE.bridgeTitleAccent}
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-white/65">
                {FUNDADOR_MICROGATE.bridgeSupport}
              </p>

              <div className="mt-5 flex flex-col gap-2">
                <Link
                  href="/full?founder=1"
                  onClick={onContinueReading}
                  className="vu-focus inline-flex min-h-[3.25rem] items-center justify-center rounded-2xl bg-[#C6D92D] px-5 text-[15px] font-bold text-[#0B2E59] shadow-[0_6px_24px_rgba(198,217,45,0.35)] active:scale-[0.99]"
                >
                  {FUNDADOR_MICROGATE.primaryCta}
                </Link>
                <Link
                  href="/barrio"
                  onClick={onSecondaryBarrio}
                  className="vu-focus inline-flex min-h-[3rem] items-center justify-center rounded-2xl border border-white/20 bg-white/8 px-5 text-[14px] font-semibold text-white active:scale-[0.99]"
                >
                  {FUNDADOR_MICROGATE.secondaryCta}
                </Link>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={onClose}
            className="vu-focus mt-4 w-full py-2 text-center text-[12px] font-medium text-white/45 underline-offset-2 hover:text-white/70 hover:underline"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
