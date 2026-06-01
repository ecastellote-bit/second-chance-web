"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CommunityActionGate } from "@/components/perfil/CommunityActionGate";
import {
  GUIDED_CONTRIBUTION_CONFIRMATION,
  GUIDED_CONTRIBUTION_KIND_OPTIONS,
  GUIDED_CONTRIBUTION_VISIBLE_PREFIX,
} from "@/lib/community/guidedContributionCopy";
import { communityActionClientError } from "@/lib/content/communityActionGateCopy";
import type { FounderProjectGuidedContributionKind } from "@/lib/learning/founderProjectGuidedContributions";
import { ReportContentButton } from "@/components/community/ReportContentButton";
import { getOrCreateUserId } from "@/lib/users/activeUserSession";

type VisibleContribution = {
  contributionId: string;
  kind: FounderProjectGuidedContributionKind;
  text: string;
  createdAt: string;
};

type Props = {
  projectId: string;
  projectTitle: string;
  /** When ProjectVoicesBlock shows published contributions above. */
  hideVisibleList?: boolean;
};

export function FounderProjectGuidedContributionsPanel({
  projectId,
  projectTitle,
  hideVisibleList = false,
}: Props) {
  const pathname = usePathname();
  const returnTo =
    pathname || `/proyectos/semilla/${encodeURIComponent(projectId)}`;
  const [kind, setKind] = useState<FounderProjectGuidedContributionKind>("valuable_part");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [visible, setVisible] = useState<VisibleContribution[]>([]);
  const [loadingVisible, setLoadingVisible] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadVisible() {
      setLoadingVisible(true);
      try {
        const res = await fetch(
          `/api/founder-project-contributions?projectId=${encodeURIComponent(projectId)}`,
        );
        const data = (await res.json()) as {
          ok?: boolean;
          contributions?: VisibleContribution[];
        };
        if (!cancelled && data.ok && Array.isArray(data.contributions)) {
          setVisible(data.contributions);
        }
      } finally {
        if (!cancelled) setLoadingVisible(false);
      }
    }
    loadVisible();
    return () => {
      cancelled = true;
    };
  }, [projectId, feedback]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setFeedback("");
    try {
      const res = await fetch("/api/founder-project-contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: getOrCreateUserId(),
          projectId,
          projectTitle,
          kind,
          text,
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
              ? "No pudimos guardar tu aporte en este entorno. Probá desde la URL principal de producción."
              : data.error === "contribution_text_invalid" ||
                  data.error === "contribution_text_too_short"
                ? "Escribí una idea concreta (mínimo 20 caracteres), sin enlaces externos."
                : "No pudimos guardar el aporte ahora. Probá de nuevo."),
        );
        return;
      }
      setText("");
      setFeedback(data.confirmation ?? GUIDED_CONTRIBUTION_CONFIRMATION);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mt-6 space-y-6">
      <CommunityActionGate returnTo={returnTo}>
      <div id="guided-contributions" className="scroll-mt-4 rounded-2xl border border-[#E8EEF3] bg-white p-4">
        <h2 className="text-lg font-bold text-[#0B2E59]">
          Sumá un aporte para que este proyecto avance
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-[#6B7A8C]">
          Podés dejar una idea concreta. Los aportes se revisan antes de mostrarse públicamente.
        </p>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <fieldset className="space-y-2">
            {GUIDED_CONTRIBUTION_KIND_OPTIONS.map((option) => (
              <label
                key={option.kind}
                className={[
                  "flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2 text-[13px]",
                  kind === option.kind
                    ? "border-[#C6D92D] bg-[#F4F9E0]"
                    : "border-[#E8EEF3] bg-[#F8FAFC]",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="contributionKind"
                  value={option.kind}
                  checked={kind === option.kind}
                  onChange={() => setKind(option.kind)}
                  className="mt-0.5"
                />
                <span className="text-[#0B2E59]">{option.label}</span>
              </label>
            ))}
          </fieldset>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            maxLength={1200}
            placeholder="Escribí una idea concreta. No hace falta que sea perfecta. Evitá datos personales, venta o enlaces externos."
            className="vu-focus w-full resize-none rounded-xl border border-[#E8EEF3] px-3 py-3 text-sm leading-relaxed text-[#243647]"
          />
          <button
            type="submit"
            disabled={sending}
            className="vu-focus min-h-[44px] w-full rounded-xl bg-[#0B2E59] text-sm font-semibold text-white disabled:opacity-70"
          >
            {sending ? "Enviando…" : "Enviar aporte"}
          </button>
        </form>
        {feedback ? (
          <p className="mt-3 text-[12px] leading-relaxed text-[#6B7A8C]">{feedback}</p>
        ) : null}
        <p className="mt-3 rounded-xl border border-[#E8EEF3] bg-[#F8FAFC] px-3 py-2 text-[12px] leading-relaxed text-[#6B7A8C]">
          Los aportes no se publican automáticamente. El equipo revisa primero para cuidar el
          barrio.
        </p>
      </div>
      </CommunityActionGate>

      {hideVisibleList ? null : (
        <div className="rounded-2xl border border-[#E8EEF3] bg-white p-4">
          <h3 className="text-[15px] font-bold text-[#0B2E59]">Algunos aportes recibidos</h3>
          {loadingVisible ? (
            <p className="mt-2 text-[13px] text-[#6B7A8C]">Cargando aportes publicados…</p>
          ) : visible.length === 0 ? (
            <p className="mt-2 text-[13px] leading-relaxed text-[#6B7A8C]">
              Todavía no hay aportes publicados. Podés dejar uno para revisión.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {visible.map((item) => (
                <li
                  key={item.contributionId}
                  className="rounded-xl border border-[#E8EEF3] bg-[#F8FAFC] px-3 py-2.5 text-[13px] leading-relaxed text-[#243647]"
                >
                  <span className="font-semibold text-[#0B2E59]">
                    {GUIDED_CONTRIBUTION_VISIBLE_PREFIX[item.kind]}
                  </span>{" "}
                  {item.text}
                  <ReportContentButton
                    targetType="project_guided_contribution"
                    targetId={item.contributionId}
                    className="mt-2"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
