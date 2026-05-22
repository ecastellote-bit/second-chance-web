"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FOUNDER_FLOW_COPY } from "@/lib/content/founderFlowCopy";
import { isFounderCommunityPreviewActive } from "@/lib/founder/communityPreviewBypass";
import { isFoundingMemberQualified } from "@/lib/learning/foundationalMember";

export function FoundingMemberGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [qualified, setQualified] = useState(false);

  useEffect(() => {
    setQualified(
      isFoundingMemberQualified() || isFounderCommunityPreviewActive(),
    );
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-[40dvh] items-center justify-center text-sm text-[#6B7A8C]">
        Verificando acceso fundador…
      </div>
    );
  }

  if (!qualified) {
    const copy = FOUNDER_FLOW_COPY.gate;
    return (
      <main className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#F8FAFC] px-6">
        <div className="max-w-md space-y-4 rounded-2xl border border-[#E8EEF3] bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold text-[#0B2E59]">{copy.title}</h1>
          <p className="text-sm leading-relaxed text-[#6B7A8C]">{copy.body}</p>
          <Link
            href="/fundador"
            className="inline-block rounded-xl bg-[#0B2E59] px-5 py-3 text-sm font-semibold text-white"
          >
            {copy.cta}
          </Link>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
