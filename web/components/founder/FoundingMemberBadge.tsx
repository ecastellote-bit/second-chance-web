"use client";

import Link from "next/link";
import { FOUNDER_FLOW_COPY } from "@/lib/content/founderFlowCopy";
import { isFoundingMemberQualified } from "@/lib/learning/foundationalMember";

export function FoundingMemberBadge() {
  if (!isFoundingMemberQualified()) return null;

  const copy = FOUNDER_FLOW_COPY.memberBadge;

  return (
    <aside
      className="rounded-2xl border border-[#C6D92D]/50 bg-[#F4F9E0] px-4 py-3"
      role="status"
    >
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#0B2E59]">
        {copy.title}
      </p>
      <p className="mt-1 text-[13px] leading-relaxed text-[#243647]">{copy.body}</p>
      <Link
        href="/proyectos/sembrar"
        className="vu-focus mt-2 inline-block text-[12px] font-semibold text-[#1A9BB0] underline"
      >
        Sembrar mi proyecto →
      </Link>
    </aside>
  );
}
