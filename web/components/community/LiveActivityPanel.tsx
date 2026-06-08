"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  createLiveActivityFeed,
  LIVE_ACTIVITY_COPY,
  nextLiveActivityTickMs,
  type LiveActivityRow,
} from "@/lib/content/liveActivityMock";

type Variant = "full" | "compact";

type Props = {
  variant?: Variant;
  className?: string;
  /** Oculta timestamps tipo "hace 1 min" — útil en /fundador para evitar falsa precisión. */
  showTimestamps?: boolean;
};

function BlinkDot() {
  return (
    <span
      className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#C6D92D] shadow-[0_0_8px_rgba(198,217,45,0.9)]"
      style={{ animation: "liveActivityPulse 1.4s ease-in-out infinite" }}
      aria-hidden
    />
  );
}

function ActivityRowView({
  row,
  actionLabel,
  compact,
  entering,
  showTimestamps = true,
}: {
  row: LiveActivityRow;
  actionLabel: string;
  compact: boolean;
  entering?: boolean;
  showTimestamps?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center gap-2 border-b border-white/8 py-2 font-mono text-[11px] leading-tight text-white/90 transition-all duration-500 sm:text-[12px]",
        compact ? "py-1.5" : "py-2",
        entering ? "animate-[liveActivityRowIn_0.45s_ease-out]" : "",
      ].join(" ")}
    >
      <span className="shrink-0 text-[#1A9BB0]" aria-hidden>
        ▸
      </span>
      <span className="shrink-0 text-[#C6D92D]/90">{actionLabel}</span>
      <span className="shrink-0 font-semibold text-white">{row.initials}</span>
      {showTimestamps ? (
        <span className="hidden min-w-0 truncate text-white/55 sm:inline">{row.when}</span>
      ) : null}
      <span className="min-w-0 flex-1 truncate text-right text-[#1A9BB0]/85">
        {showTimestamps ? "— " : ""}
        {row.location}
      </span>
    </div>
  );
}

export function LiveActivityPanel({
  variant = "full",
  className = "",
  showTimestamps = true,
}: Props) {
  const compact = variant === "compact";
  const visibleCount = compact ? 2 : 3;
  const copy = compact ? LIVE_ACTIVITY_COPY.compact : LIVE_ACTIVITY_COPY.full;

  const feedRef = useRef<ReturnType<typeof createLiveActivityFeed> | null>(null);
  if (!feedRef.current) {
    feedRef.current = createLiveActivityFeed();
  }

  const [rows, setRows] = useState<LiveActivityRow[]>(() =>
    feedRef.current!.take(visibleCount),
  );
  const [enteringId, setEnteringId] = useState<string | null>(null);

  const panelHeight = compact ? "min-h-0" : "min-h-[13.5rem]";

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    function scheduleNext() {
      timeoutId = setTimeout(() => {
        if (cancelled) return;
        const nextRow = feedRef.current!.next();
        setEnteringId(nextRow.id);
        setRows((prev) => [...prev.slice(1), nextRow]);
        scheduleNext();
      }, nextLiveActivityTickMs());
    }

    scheduleNext();
    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [visibleCount]);

  useEffect(() => {
    if (!enteringId) return;
    const t = setTimeout(() => setEnteringId(null), 500);
    return () => clearTimeout(t);
  }, [enteringId]);

  const scanDots = useMemo(() => [0, 1, 2], []);

  return (
    <>
      <style jsx global>{`
        @keyframes liveActivityPulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.45;
            transform: scale(0.85);
          }
        }
        @keyframes liveActivityRowIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes liveActivityCursor {
          0%,
          49% {
            opacity: 1;
          }
          50%,
          100% {
            opacity: 0;
          }
        }
        @keyframes liveActivityScan {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>

      <section
        className={[
          "overflow-hidden rounded-2xl border border-[#1A9BB0]/35 bg-[#071018] shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
          compact ? "rounded-xl" : "rounded-2xl",
          panelHeight,
          className,
        ].join(" ")}
        aria-label={copy.title}
      >
        {/* scan line */}
        <div className="relative h-0.5 overflow-hidden bg-[#0B2E59]/80">
          <div
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#1A9BB0]/70 to-transparent"
            style={{ animation: "liveActivityScan 3.2s linear infinite" }}
            aria-hidden
          />
        </div>

        <div className={compact ? "px-3 py-2.5" : "px-4 py-3.5 sm:px-5 sm:py-4"}>
          {/* header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <BlinkDot />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#C6D92D]">
                  {LIVE_ACTIVITY_COPY.badge}
                </span>
                {!compact ? (
                  <span className="hidden text-[10px] text-white/40 sm:inline">·</span>
                ) : null}
                {!compact ? (
                  <span className="hidden text-[10px] text-white/50 sm:inline">{copy.scanLabel}</span>
                ) : null}
              </div>
              <h2
                className={[
                  "mt-1 font-bold tracking-tight text-white",
                  compact ? "text-[13px]" : "text-[15px] sm:text-base",
                ].join(" ")}
              >
                {copy.title}
              </h2>
              <p
                className={[
                  "mt-0.5 text-white/55",
                  compact ? "text-[11px] line-clamp-1" : "text-[12px] sm:text-[13px]",
                ].join(" ")}
              >
                {copy.subtitle}
              </p>
            </div>
            <div className="flex shrink-0 gap-1 pt-1" aria-hidden>
              {scanDots.map((i) => (
                <span
                  key={i}
                  className="h-1 w-1 rounded-full bg-[#1A9BB0]/60"
                  style={{ animation: `liveActivityPulse ${1.2 + i * 0.3}s ease-in-out infinite` }}
                />
              ))}
            </div>
          </div>

          {/* rows */}
          <div
            className={[
              "mt-2 overflow-hidden rounded-lg border border-white/6 bg-black/35",
              compact ? "px-2" : "px-3",
            ].join(" ")}
          >
            {rows.map((row) => (
              <ActivityRowView
                key={row.id}
                row={row}
                actionLabel={copy.actionLabel}
                compact={compact}
                entering={row.id === enteringId}
                showTimestamps={showTimestamps}
              />
            ))}
          </div>

          {/* footer */}
          <div
            className={[
              "mt-2 flex items-center justify-between gap-2",
              compact ? "text-[10px]" : "text-[11px]",
            ].join(" ")}
          >
            <span className="text-white/45">{copy.footer}</span>
            <span className="flex items-center gap-1 font-mono text-[#1A9BB0]/80">
              <span style={{ animation: "liveActivityCursor 1s step-end infinite" }}>_</span>
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
