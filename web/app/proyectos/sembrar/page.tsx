"use client";

import Link from "next/link";
import { useState } from "react";
import { FoundingMemberGate } from "@/components/founder/FoundingMemberGate";
import { UserProfileGate } from "@/components/perfil/UserProfileGate";
import { FOUNDER_FLOW_COPY } from "@/lib/content/founderFlowCopy";
import { getFoundingMemberArchiveId } from "@/lib/learning/foundationalMember";
import { getOrCreateUserId } from "@/lib/users/activeUserSession";
import { getFoundationalCohortBatch } from "@/lib/learning/foundationalCohort";
import { VuBottomNav } from "@/components/layout/VuMobileShell";

function SembrarForm() {
  const copy = FOUNDER_FLOW_COPY.sembrar;
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/founder-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          archiveId: getFoundingMemberArchiveId(),
          userId: getOrCreateUserId(),
          title,
          summary,
          cohortBatch: getFoundationalCohortBatch(),
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Error al sembrar");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <main className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#F8FAFC] px-6 pb-24">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-bold text-[#0B2E59]">{copy.successTitle}</h1>
          <p className="text-sm leading-relaxed text-[#6B7A8C]">{copy.successBody}</p>
          <Link
            href="/proyectos"
            className="inline-block rounded-xl bg-[#0B2E59] px-5 py-3 text-sm font-semibold text-white"
          >
            Ver mesa de proyectos
          </Link>
          <Link href="/plaza" className="block text-sm font-semibold text-[#1A9BB0] underline">
            Volver a la plaza
          </Link>
        </div>
        <VuBottomNav active="plaza" />
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[#F8FAFC] px-5 py-10 pb-24 font-[family-name:var(--font-inter)]">
      <Link href="/proyectos" className="text-[12px] font-semibold text-[#1A9BB0] underline">
        ← Proyectos
      </Link>
      <p className="mt-6 text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
        {copy.eyebrow}
      </p>
      <h1 className="mt-2 text-[1.5rem] font-bold text-[#0B2E59]">{copy.title}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-[#6B7A8C]">{copy.subtitle}</p>
      <p className="mt-4 rounded-xl border border-[#C6D92D]/40 bg-[#F4F9E0] px-4 py-3 text-[13px] text-[#243647]">
        {copy.visibilityNote}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 max-w-lg">
        <div>
          <label className="text-sm font-semibold text-[#0B2E59]">Nombre del proyecto</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={3}
            className="mt-1 w-full rounded-xl border border-[#E8EEF3] px-4 py-3 text-sm"
            placeholder="Ej: Taller de oficios en mi barrio"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-[#0B2E59]">
            ¿Qué sembrás en la Comunidad?
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
            minLength={20}
            rows={6}
            className="mt-1 w-full rounded-xl border border-[#E8EEF3] px-4 py-3 text-sm leading-relaxed"
            placeholder="Contá en pocas líneas qué hacés, a quién sumás y qué visibilidad necesitás."
          />
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#0B2E59] py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {loading ? "Sembrando…" : copy.submitCta}
        </button>
      </form>
      <VuBottomNav active="plaza" />
    </main>
  );
}

export default function SembrarProyectoPage() {
  return (
    <UserProfileGate>
      <FoundingMemberGate>
        <SembrarForm />
      </FoundingMemberGate>
    </UserProfileGate>
  );
}
