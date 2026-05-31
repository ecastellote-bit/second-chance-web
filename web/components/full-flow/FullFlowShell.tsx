"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { FULL_FLOW_COPY } from "@/lib/content/fullFlowCopy";
import {
  FULL_FLOW_PROGRESS_TRAIL,
  FULL_FLOW_SHELL_COPY,
  FULL_FLOW_STATIONS,
  type FullFlowStationId,
} from "@/lib/content/fullFlowStations";
import {
  fullFlowHintClass,
  fullFlowInputClass,
  fullFlowLabelClass,
  fullFlowSelectClass,
  fullFlowTextareaClass,
} from "./fullFlowStyles";

type ShellVariant = "intro" | "station" | "processing" | "clarification" | "result" | "themes";

type FullFlowShellProps = {
  children: ReactNode;
  variant?: ShellVariant;
  station?: FullFlowStationId;
  maxWidth?: "md" | "lg" | "xl";
  showPreservationNote?: boolean;
  className?: string;
};

function FullFlowShellInner({
  children,
  variant = "station",
  station,
  maxWidth = "md",
  showPreservationNote = false,
  className = "",
}: FullFlowShellProps) {
  const searchParams = useSearchParams();
  const isFounder = searchParams.get("founder") === "1";
  const readingTitle = isFounder
    ? FULL_FLOW_SHELL_COPY.readingTitle
    : FULL_FLOW_SHELL_COPY.readingTitleAlt;

  const maxW =
    maxWidth === "xl" ? "max-w-6xl" : maxWidth === "lg" ? "max-w-3xl" : "max-w-2xl";

  return (
    <main
      className={[
        "min-h-[100dvh] bg-[#F8FAFC] font-[family-name:var(--font-inter)] text-[#243647]",
        variant === "result" ? "pb-24" : "pb-12",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none fixed inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1A9BB0] via-[#C6D92D] to-[#0B2E59] opacity-80" />

      <div className={`mx-auto px-5 py-8 sm:px-6 sm:py-10 ${maxW}`}>
        <header className="mb-6 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
            {FULL_FLOW_SHELL_COPY.brandEyebrow} · {readingTitle}
          </p>
          {variant === "station" && station ? (
            <FullFlowProgress station={station} />
          ) : null}
        </header>

        {children}

        {showPreservationNote ? (
          <p className="mt-8 text-center text-[11px] leading-relaxed text-[#6B7A8C]">
            {FULL_FLOW_SHELL_COPY.preservationNote}
          </p>
        ) : null}
      </div>
    </main>
  );
}

export function FullFlowShell(props: FullFlowShellProps) {
  return (
    <Suspense
      fallback={
        <main className="min-h-[100dvh] bg-[#F8FAFC] px-6 py-10">
          <div className="mx-auto max-w-2xl animate-pulse space-y-4">
            <div className="h-3 w-32 rounded bg-[#E8EEF3]" />
            <div className="h-24 rounded-2xl bg-[#E8EEF3]" />
          </div>
        </main>
      }
    >
      <FullFlowShellInner {...props} />
    </Suspense>
  );
}

export function FullFlowProgress({ station }: { station: FullFlowStationId }) {
  const meta = FULL_FLOW_STATIONS[station];
  const activeIndex = meta.trailIndex;

  return (
    <div className="space-y-3 pt-1">
      <p className="text-[12px] font-semibold text-[#6B7A8C]">
        Estación {station} de 5 · {meta.stationTitle}
      </p>

      <div
        className="hidden items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#6B7A8C] sm:flex"
        aria-hidden
      >
        {FULL_FLOW_PROGRESS_TRAIL.map((label, index) => (
          <span key={label} className="flex items-center gap-1">
            <span
              className={
                index <= activeIndex ? "text-[#1A9BB0]" : "text-[#CBD5E1]"
              }
            >
              {label}
            </span>
            {index < FULL_FLOW_PROGRESS_TRAIL.length - 1 ? (
              <span className="text-[#CBD5E1]">─</span>
            ) : null}
          </span>
        ))}
      </div>

      <div
        className="h-1.5 overflow-hidden rounded-full bg-[#E8EEF3]"
        role="progressbar"
        aria-valuenow={station}
        aria-valuemin={1}
        aria-valuemax={5}
        aria-label={`Estación ${station} de 5`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#1A9BB0] to-[#C6D92D] transition-all duration-500"
          style={{ width: `${(station / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}

type StepCopySlice = {
  subtitle: string;
  containment?: string;
};

const STEP_COPY: Record<FullFlowStationId, StepCopySlice> = {
  1: FULL_FLOW_COPY.step1,
  2: FULL_FLOW_COPY.step2,
  3: FULL_FLOW_COPY.step3,
  4: FULL_FLOW_COPY.step4,
  5: FULL_FLOW_COPY.step5,
};

export function FullFlowStationHeader({ station }: { station: FullFlowStationId }) {
  const meta = FULL_FLOW_STATIONS[station];
  const copy = STEP_COPY[station];

  return (
    <div className="mb-5 space-y-2">
      <h1 className="text-[1.5rem] font-bold leading-tight tracking-tight text-[#0B2E59] sm:text-[1.65rem]">
        {meta.stationTitle}
      </h1>
      <p className="text-[15px] leading-relaxed text-[#6B7A8C]">{copy.subtitle}</p>
      {copy.containment ? (
        <p className="rounded-xl border border-[#C6D92D]/35 bg-[#F4F9E0]/80 px-4 py-3 text-[13px] leading-relaxed text-[#243647]">
          {copy.containment}
        </p>
      ) : null}
    </div>
  );
}

export function FullFlowStepCard({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-[22px] border border-[#E8EEF3] bg-white p-5 shadow-[0_8px_28px_rgba(15,42,70,0.06)] sm:p-6">
      {children}
    </section>
  );
}

export function FullFlowField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className={fullFlowLabelClass}>{label}</span>
      {hint ? <span className={fullFlowHintClass}>{hint}</span> : null}
      {children}
    </label>
  );
}

export function FullFlowErrorBox({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 space-y-2">
      <p className="text-sm font-semibold text-red-900">{title}</p>
      <ul className="space-y-1 text-sm text-red-800">
        {items.map((error) => (
          <li key={error}>• {error}</li>
        ))}
      </ul>
    </div>
  );
}

export function FullFlowActions({
  backLabel,
  nextLabel,
  onBack,
  onNext,
  nextDisabled,
}: {
  backLabel: string;
  nextLabel: string;
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={onBack}
        className="vu-focus order-2 min-h-[48px] rounded-xl border border-[#E8EEF3] bg-white px-5 py-3 text-sm font-semibold text-[#0B2E59] sm:order-1"
      >
        {backLabel}
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="vu-focus order-1 min-h-[48px] flex-1 rounded-xl bg-[#0B2E59] px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(11,46,89,0.18)] hover:bg-[#0a274f] disabled:opacity-50 sm:order-2"
      >
        {nextLabel}
      </button>
    </div>
  );
}

export function FullFlowIntroCard({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-[22px] border border-[#E8EEF3] bg-white p-5 shadow-[0_8px_28px_rgba(15,42,70,0.06)] sm:p-6">
      {children}
    </section>
  );
}

export function FullFlowPrimaryLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  const cls =
    variant === "primary"
      ? "bg-[#0B2E59] text-white shadow-[0_4px_16px_rgba(11,46,89,0.18)]"
      : "border border-[#0B2E59]/25 bg-white text-[#0B2E59]";
  return (
    <Link
      href={href}
      className={`vu-focus inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold ${cls}`}
    >
      {children}
    </Link>
  );
}

export function FullFlowInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={[fullFlowInputClass, props.className].filter(Boolean).join(" ")} />;
}

export function FullFlowTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={[fullFlowTextareaClass, props.className].filter(Boolean).join(" ")}
    />
  );
}

export function FullFlowSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={[fullFlowSelectClass, props.className].filter(Boolean).join(" ")}
    />
  );
}

export { fullFlowHintClass, fullFlowLabelClass };
