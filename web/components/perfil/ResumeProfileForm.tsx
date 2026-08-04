"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { PROFILE_FLOW_COPY } from "@/lib/content/profileFlowCopy";
import {
  getEmailHint,
  resumeSessionByEmail,
} from "@/lib/users/activeUserSession";

type Props = {
  /** Destino tras retomar con éxito */
  redirectTo?: string;
};

export function ResumeProfileForm({ redirectTo = "/perfil" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromQuery = searchParams.get("redirect")?.trim();
  const safeRedirect =
    (fromQuery && fromQuery.startsWith("/") ? fromQuery : null) || redirectTo;

  const copy = PROFILE_FLOW_COPY.continuar;
  const [email, setEmail] = useState(() => getEmailHint());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await resumeSessionByEmail(email);
    if (!result.ok) {
      if (result.error === "profile_not_found") {
        setError(copy.notFound);
      } else if (result.error === "profile_incomplete") {
        setError(copy.incomplete);
      } else if (result.error === "email_invalid") {
        setError(copy.invalid);
      } else {
        setError("No pudimos retomar el perfil ahora. Probá de nuevo.");
      }
      setLoading(false);
      return;
    }

    router.replace(safeRedirect);
  }

  return (
    <main className="min-h-[100dvh] bg-[#F8FAFC] px-5 py-10 font-[family-name:var(--font-inter)]">
      <div className="mx-auto max-w-lg space-y-6">
        <Link href="/perfil" className="text-[12px] font-semibold text-[#1A9BB0] underline">
          ← Perfil
        </Link>

        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
            {copy.eyebrow}
          </p>
          <h1 className="text-[1.5rem] font-bold text-[#0B2E59]">{copy.title}</h1>
          <p className="text-[15px] leading-relaxed text-[#6B7A8C]">{copy.subtitle}</p>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="space-y-4 rounded-2xl border border-[#E8EEF3] bg-white p-5 shadow-sm"
        >
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[#243647]">{copy.emailLabel}</span>
            <input
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="min-h-[48px] w-full rounded-xl border border-[#E8EEF3] px-4 text-base text-[#243647]"
            />
          </label>

          {error ? (
            <p className="rounded-xl bg-[#FEF2F2] px-3 py-2 text-sm text-[#DC2626]" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="vu-focus min-h-[48px] w-full rounded-xl bg-[#0B2E59] px-4 text-sm font-semibold text-white disabled:opacity-70"
          >
            {loading ? "Buscando…" : copy.submit}
          </button>
        </form>

        <p className="text-center text-sm text-[#6B7A8C]">
          <Link
            href={`/perfil/crear?redirect=${encodeURIComponent(safeRedirect)}`}
            className="font-semibold text-[#1A9BB0] underline"
          >
            {copy.createLink}
          </Link>
        </p>
      </div>
    </main>
  );
}
