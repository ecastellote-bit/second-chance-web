"use client";

import Link from "next/link";
import { useState } from "react";
import { runModerationQuickAction } from "@/lib/admin/unifiedModeration/clientActions";
import { KIND_LABEL } from "@/lib/admin/unifiedModeration/labels";
import type { ModerationInboxItem, ModerationQuickAction } from "@/lib/admin/unifiedModeration/types";

function actionClass(variant?: ModerationQuickAction["variant"]): string {
  const base =
    "vu-focus min-h-[40px] rounded-xl px-3 py-2 text-xs font-semibold disabled:opacity-50";
  switch (variant) {
    case "primary":
      return `${base} bg-[#0B2E59] text-white`;
    case "lime":
      return `${base} bg-[#C6D92D] text-[#0B2E59]`;
    case "danger":
      return `${base} border border-red-200 bg-red-50 text-red-900`;
    default:
      return `${base} border border-[#E8EEF3] bg-white text-[#0B2E59]`;
  }
}

export function AdminEntityCard({
  item,
  onActionDone,
}: {
  item: ModerationInboxItem;
  onActionDone: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [publicText, setPublicText] = useState(item.meta?.draftText ?? "");
  const [showApprove, setShowApprove] = useState(false);

  async function run(action: ModerationQuickAction) {
    if (action.requiresPanel) {
      window.location.href = item.panelHref;
      return;
    }
    if (action.needsPublicText && !showApprove) {
      setShowApprove(true);
      return;
    }
    setBusy(action.id);
    setError("");
    try {
      await runModerationQuickAction(item, action, { publicText });
      onActionDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  const dateLabel = new Date(item.createdAt).toLocaleString("es-AR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article
      className={[
        "rounded-[20px] border bg-white p-4 shadow-[0_4px_16px_rgba(15,42,70,0.06)]",
        item.risk === "report"
          ? "border-red-200"
          : item.risk === "flagged"
            ? "border-amber-200"
            : "border-[#E8EEF3]",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#1A9BB0]">
            {KIND_LABEL[item.kind] ?? item.kind}
          </p>
          <h3 className="mt-0.5 text-[15px] font-bold leading-snug text-[#0B2E59]">{item.title}</h3>
        </div>
        <span className="rounded-full bg-[#F8FAFC] px-2.5 py-1 text-[10px] font-semibold text-[#6B7A8C]">
          {item.statusLabel}
        </span>
      </div>

      <p className="mt-2 text-[13px] leading-relaxed text-[#6B7A8C]">{item.excerpt}</p>
      <p className="mt-1 text-[11px] text-[#9AA8B8]">{dateLabel}</p>

      {item.relatedHref ? (
        <Link
          href={item.relatedHref}
          className="vu-focus mt-2 inline-block text-[12px] font-semibold text-[#1A9BB0] underline"
        >
          Ver en el barrio →
        </Link>
      ) : null}

      {showApprove ? (
        <div className="mt-3 space-y-2 rounded-xl border border-[#C6D92D]/40 bg-[#F4F9E0] p-3">
          <p className="text-xs font-semibold text-[#0B2E59]">
            Texto público curado (mín. 20 caracteres, anónimo)
          </p>
          <textarea
            value={publicText}
            onChange={(e) => setPublicText(e.target.value)}
            rows={3}
            maxLength={800}
            className="w-full resize-y rounded-xl border border-[#E8EEF3] px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() => {
                const action = item.actions.find((a) => a.needsPublicText);
                if (action) void run(action);
              }}
              className={actionClass("lime")}
            >
              Confirmar publicación
            </button>
            <button
              type="button"
              onClick={() => setShowApprove(false)}
              className={actionClass("secondary")}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {item.actions
          .filter((a) => !a.needsPublicText || !showApprove)
          .map((action) => (
            <button
              key={action.id}
              type="button"
              disabled={Boolean(busy)}
              onClick={() => void run(action)}
              className={actionClass(action.variant)}
            >
              {busy === action.id ? "…" : action.label}
            </button>
          ))}
        <Link
          href={item.panelHref}
          className="vu-focus min-h-[40px] rounded-xl border border-dashed border-[#1A9BB0]/40 px-3 py-2 text-xs font-semibold text-[#1A9BB0]"
        >
          Panel completo
        </Link>
      </div>
    </article>
  );
}
