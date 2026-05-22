"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PROFILE_FLOW_COPY } from "@/lib/content/profileFlowCopy";
import { getFoundationalCohortBatch } from "@/lib/learning/foundationalCohort";
import { getFoundingMemberArchiveId } from "@/lib/learning/foundationalMember";
import {
  fetchUserProfile,
  getOrCreateUserId,
  markProfileComplete,
} from "@/lib/users/activeUserSession";
import { parseChipInput, type VuUserProfileRecord } from "@/lib/users/userProfileTypes";

type Props = {
  mode: "create" | "edit";
  redirectTo?: string;
};

export function PerfilForm({ mode, redirectTo = "/perfil" }: Props) {
  const router = useRouter();
  const copy = PROFILE_FLOW_COPY.crear;

  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [momentoActual, setMomentoActual] = useState("");
  const [country, setCountry] = useState("");
  const [buscandoRaw, setBuscandoRaw] = useState("");
  const [aportarRaw, setAportarRaw] = useState("");
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode !== "edit") return;

    fetchUserProfile(getOrCreateUserId()).then((profile) => {
      if (profile) hydrate(profile);
      setLoading(false);
    });
  }, [mode]);

  function hydrate(profile: VuUserProfileRecord) {
    setDisplayName(profile.displayName);
    setHeadline(profile.headline);
    setMomentoActual(profile.momentoActual);
    setCountry(profile.country ?? "");
    setBuscandoRaw(profile.buscando.join(", "));
    setAportarRaw(profile.aportar.join(", "));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/user-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: getOrCreateUserId(),
          displayName,
          headline,
          momentoActual,
          country: country.trim() || undefined,
          buscando: parseChipInput(buscandoRaw),
          aportar: parseChipInput(aportarRaw),
          diagnosticArchiveId: getFoundingMemberArchiveId(),
          cohortBatch: getFoundationalCohortBatch(),
        }),
      });

      const data = await res.json();
      if (!data.ok || !data.profile) {
        throw new Error(data.error ?? "No se pudo guardar el perfil");
      }

      markProfileComplete(data.profile);
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[#F8FAFC] text-sm text-[#6B7A8C]">
        Cargando perfil…
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[#F8FAFC] px-5 py-10 pb-16 font-[family-name:var(--font-inter)]">
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

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-[#E8EEF3] bg-white p-5 shadow-sm">
          <Field
            label={PROFILE_FLOW_COPY.fields.displayName}
            value={displayName}
            onChange={setDisplayName}
            required
            minLength={2}
          />
          <Field
            label={PROFILE_FLOW_COPY.fields.headline}
            value={headline}
            onChange={setHeadline}
            required
            minLength={10}
            placeholder={PROFILE_FLOW_COPY.hints.headline}
          />
          <Field
            label={PROFILE_FLOW_COPY.fields.momentoActual}
            value={momentoActual}
            onChange={setMomentoActual}
            required
            minLength={20}
            multiline
            placeholder={PROFILE_FLOW_COPY.hints.momentoActual}
          />
          <Field
            label={PROFILE_FLOW_COPY.fields.country}
            value={country}
            onChange={setCountry}
          />
          <Field
            label={PROFILE_FLOW_COPY.fields.buscando}
            value={buscandoRaw}
            onChange={setBuscandoRaw}
            required
            placeholder={PROFILE_FLOW_COPY.hints.buscando}
          />
          <Field
            label={PROFILE_FLOW_COPY.fields.aportar}
            value={aportarRaw}
            onChange={setAportarRaw}
            required
            placeholder={PROFILE_FLOW_COPY.hints.aportar}
          />

          {error && <p className="text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-[#0B2E59] py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving
              ? "Guardando…"
              : mode === "create"
                ? copy.submitCreate
                : copy.submitEdit}
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  minLength,
  multiline,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
  multiline?: boolean;
  placeholder?: string;
}) {
  const className =
    "mt-1 w-full rounded-xl border border-[#E8EEF3] px-4 py-3 text-sm text-[#243647]";

  return (
    <div>
      <label className="text-sm font-semibold text-[#0B2E59]">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
          rows={4}
          placeholder={placeholder}
          className={className}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
          placeholder={placeholder}
          className={className}
        />
      )}
    </div>
  );
}
