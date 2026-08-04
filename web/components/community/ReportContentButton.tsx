"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { CommunityActionGate } from "@/components/perfil/CommunityActionGate";
import {
  COMMUNITY_REPORT_CONFIRMATION,
  COMMUNITY_REPORT_REASON_OPTIONS,
} from "@/lib/community/communityReportCopy";
import { communityActionClientError } from "@/lib/content/communityActionGateCopy";
import type {
  CommunityReportReason,
  CommunityReportTargetType,
} from "@/lib/learning/communityReports";
import { getCachedUserId } from "@/lib/users/activeUserSession";

type Props = {
  targetType: CommunityReportTargetType;
  targetId: string;
  className?: string;
};

export function ReportContentButton({ targetType, targetId, className = "" }: Props) {
  const pathname = usePathname();
  const returnTo = pathname || "/plaza";
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<CommunityReportReason>("spam");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const userId = getCachedUserId();
    if (!userId) {
      setFeedback(
        "Para reportar necesitamos tu identidad en este dispositivo. Retomá o creá tu perfil.",
      );
      return;
    }
    setSending(true);
    setFeedback("");
    try {
      const res = await fetch("/api/community-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          targetType,
          targetId,
          reason,
          details: details.trim() || undefined,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        confirmation?: string;
      };
      if (!res.ok || !data.ok) {
        const gateMsg = communityActionClientError(data.error);
        setFeedback(
          gateMsg ||
            (data.error === "blob_not_configured"
              ? "No pudimos registrar el reporte en este entorno."
              : "No pudimos enviar el reporte. Probá de nuevo."),
        );
        return;
      }
      setFeedback(data.confirmation ?? COMMUNITY_REPORT_CONFIRMATION);
      setDetails("");
      setOpen(false);
    } finally {
      setSending(false);
    }
  }

  return (
    <CommunityActionGate returnTo={returnTo} density="compact">
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="vu-focus text-[11px] font-semibold text-[#6B7A8C] underline"
      >
        Reportar
      </button>
      {open ? (
        <form
          onSubmit={submit}
          className="mt-2 rounded-xl border border-[#E8EEF3] bg-[#F8FAFC] p-3"
        >
          <p className="text-[11px] font-semibold text-[#0B2E59]">Motivo del reporte</p>
          <fieldset className="mt-2 space-y-1">
            {COMMUNITY_REPORT_REASON_OPTIONS.map((option) => (
              <label
                key={option.reason}
                className="flex cursor-pointer items-center gap-2 text-[12px] text-[#243647]"
              >
                <input
                  type="radio"
                  name={`report-reason-${targetId}`}
                  checked={reason === option.reason}
                  onChange={() => setReason(option.reason)}
                />
                {option.label}
              </label>
            ))}
          </fieldset>
          <label className="mt-2 block text-[11px] text-[#6B7A8C]">
            Podés agregar un detalle breve.
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={2}
              maxLength={400}
              className="vu-focus mt-1 w-full resize-none rounded-lg border border-[#E8EEF3] px-2 py-1.5 text-[12px]"
            />
          </label>
          <div className="mt-2 flex gap-2">
            <button
              type="submit"
              disabled={sending}
              className="rounded-lg bg-[#0B2E59] px-3 py-1.5 text-[11px] font-semibold text-white disabled:opacity-60"
            >
              {sending ? "Enviando…" : "Enviar reporte"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-[#E8EEF3] px-3 py-1.5 text-[11px] font-semibold text-[#6B7A8C]"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : null}
      {feedback ? (
        <p className="mt-2 text-[11px] leading-relaxed text-[#6B7A8C]">{feedback}</p>
      ) : null}
    </div>
    </CommunityActionGate>
  );
}
