"use client";

import { useEffect, useState } from "react";
import { COMMUNITY_EXAMPLE_CONVERSATIONS_LABEL } from "@/lib/content/communitySeedCopy";
import { PROJECT_VOICES_SEED_EXAMPLES } from "@/lib/content/projectVoicesSeedExamples";
import { GUIDED_CONTRIBUTION_VISIBLE_PREFIX } from "@/lib/community/guidedContributionCopy";
import type { FounderProjectGuidedContributionKind } from "@/lib/learning/founderProjectGuidedContributions";

type VisibleContribution = {
  contributionId: string;
  kind: FounderProjectGuidedContributionKind;
  text: string;
};

type Props = {
  projectId: string;
  className?: string;
};

function VoiceBubble({
  author,
  body,
  initials,
  accent,
}: {
  author: string;
  body: string;
  initials: string;
  accent: string;
}) {
  return (
    <article className="flex gap-3">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ backgroundColor: accent }}
        aria-hidden
      >
        {initials}
      </span>
      <div className="min-w-0 flex-1 rounded-[20px] rounded-tl-md border border-[#E8EEF3] bg-white px-4 py-3 shadow-[0_2px_12px_rgba(15,42,70,0.06)]">
        <p className="text-sm font-bold text-[#0B2E59]">{author}</p>
        <p className="mt-1 text-[14px] leading-relaxed text-[#6B7A8C]">{body}</p>
      </div>
    </article>
  );
}

export function ProjectVoicesBlock({ projectId, className = "" }: Props) {
  const [visible, setVisible] = useState<VisibleContribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
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
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const hasReal = visible.length > 0;
  const examples = PROJECT_VOICES_SEED_EXAMPLES;

  return (
    <section
      className={[
        "rounded-[24px] border border-[#E8EEF3] bg-[#F8FAFC] p-4 shadow-[0_4px_16px_rgba(15,42,70,0.04)]",
        className,
      ].join(" ")}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
        Cooperación en siembra
      </p>
      <h2 className="mt-1 text-[17px] font-bold text-[#0B2E59]">Voces del barrio</h2>
      <p className="mt-2 text-[13px] leading-relaxed text-[#6B7A8C]">
        {hasReal
          ? "Aportes revisados que ya pueden inspirar a otras personas a acercarse — sin chat libre ni contacto automático."
          : "Así podría empezar a sonar esta mesa cuando lleguen los primeros aportes moderados."}
      </p>

      {loading ? (
        <p className="mt-4 text-[13px] text-[#6B7A8C]">Cargando voces…</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {hasReal
            ? visible.map((item) => (
                <li key={item.contributionId}>
                  <VoiceBubble
                    author="Integrante del barrio"
                    initials="IB"
                    accent="#1A9BB0"
                    body={`${GUIDED_CONTRIBUTION_VISIBLE_PREFIX[item.kind]} ${item.text}`}
                  />
                </li>
              ))
            : examples.map((ex) => (
                <li key={ex.id}>
                  <VoiceBubble
                    author={ex.author}
                    body={ex.body}
                    initials={ex.initials}
                    accent={ex.accent}
                  />
                </li>
              ))}
        </ul>
      )}

      {!hasReal && !loading ? (
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-[#6B7A8C]">
          {COMMUNITY_EXAMPLE_CONVERSATIONS_LABEL}
        </p>
      ) : null}
    </section>
  );
}
