"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { COMMUNITY_ACTION_GATE_COPY } from "@/lib/content/communityActionGateCopy";
import { PROFILE_FLOW_COPY } from "@/lib/content/profileFlowCopy";
import { isFounderCommunityPreviewActive } from "@/lib/founder/communityPreviewBypass";
import {
  bindLocalSession,
  fetchClientSessionGate,
  type ClientSessionGate,
} from "@/lib/users/activeUserSession";
import type { SessionGateReason } from "@/lib/users/sessionGate";

type Props = {
  children: React.ReactNode;
  /** Ruta a la que volver desde el gate (p. ej. ficha de proyecto) */
  returnTo?: string;
  /** inline: tarjeta dentro de la página; page: pantalla centrada */
  mode?: "inline" | "page";
  /** Aviso humano opcional antes del copy del gate (p. ej. sembrar proyecto) */
  gateHint?: string;
  /**
   * compact: muro corto para microacciones en listados (Serie 4).
   * No oculta el resto de la página: solo reemplaza el bloque de acción.
   */
  density?: "default" | "compact";
};

function shellCard(
  mode: "inline" | "page",
  card: React.ReactNode,
) {
  if (mode === "page") {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#F8FAFC] px-6 font-[family-name:var(--font-inter)]">
        <div className="max-w-md rounded-2xl border border-[#E8EEF3] bg-white p-6 shadow-sm">
          {card}
        </div>
      </main>
    );
  }
  return (
    <div className="rounded-2xl border border-[#E8EEF3] bg-white p-5 shadow-sm">
      {card}
    </div>
  );
}

export function CommunityActionGate({
  children,
  returnTo,
  mode = "inline",
  gateHint,
  density = "default",
}: Props) {
  const compact = density === "compact";
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [gate, setGate] = useState<ClientSessionGate | null>(null);
  const [emailDraft, setEmailDraft] = useState("");
  const [consent, setConsent] = useState(true);
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState("");

  const backHref = returnTo ?? pathname ?? "/plaza";
  const crearHref = `/perfil/crear?redirect=${encodeURIComponent(backHref)}`;
  const continuarHref = `/perfil/continuar?redirect=${encodeURIComponent(backHref)}`;
  const completarHref = `/perfil/editar?redirect=${encodeURIComponent(backHref)}`;

  const recheck = useCallback(async () => {
    if (isFounderCommunityPreviewActive()) {
      setGate({
        reason: "ready",
        allowed: true,
        profile: null,
        hasEmail: true,
        userId: null,
      });
      setReady(true);
      return;
    }

    const next = await fetchClientSessionGate();
    setGate(next);
    setReady(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await recheck();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [recheck]);

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") void recheck();
    }
    function onFocus() {
      void recheck();
    }
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, [recheck]);

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!gate?.userId) return;
    setEmailSaving(true);
    setEmailError("");
    try {
      const res = await fetch("/api/user-profile/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: gate.userId,
          email: emailDraft.trim(),
          notificationConsent: consent,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        profile?: Parameters<typeof bindLocalSession>[0];
        error?: string;
      };
      if (!res.ok || !data.ok || !data.profile) {
        setEmailError(
          data.error === "email_invalid"
            ? "Revisá el email: tiene que tener un formato válido."
            : "No pudimos guardar el email. Probá de nuevo.",
        );
        return;
      }
      bindLocalSession(data.profile);
      await recheck();
    } finally {
      setEmailSaving(false);
    }
  }

  if (!ready || !gate) {
    const checking = (
      <p className="text-sm text-[#6B7A8C]">{COMMUNITY_ACTION_GATE_COPY.checking}</p>
    );
    if (mode === "page") {
      return (
        <div className="flex min-h-[40dvh] items-center justify-center">{checking}</div>
      );
    }
    return <div className="rounded-2xl border border-[#E8EEF3] bg-white p-4">{checking}</div>;
  }

  if (gate.allowed) {
    return <>{children}</>;
  }

  const reason: SessionGateReason = gate.reason;
  const copyGate = PROFILE_FLOW_COPY;

  let card: React.ReactNode;

  if (reason === "email_missing") {
    card = compact ? (
      <div className="space-y-2 text-left">
        {gateHint ? (
          <p className="text-[12px] leading-relaxed text-[#6B7A8C]">{gateHint}</p>
        ) : null}
        <p className="text-[13px] font-semibold text-[#0B2E59]">
          {copyGate.emailMissing.title}
        </p>
        <form onSubmit={(e) => void submitEmail(e)} className="space-y-2">
          <input
            type="email"
            required
            autoComplete="email"
            value={emailDraft}
            onChange={(e) => setEmailDraft(e.target.value)}
            placeholder="tu@email.com"
            className="min-h-[40px] w-full rounded-xl border border-[#E8EEF3] px-3 text-[13px]"
          />
          {emailError ? (
            <p className="text-[12px] text-[#DC2626]" role="alert">
              {emailError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={emailSaving}
            className="vu-focus min-h-[40px] w-full rounded-xl bg-[#0B2E59] px-3 text-[12px] font-semibold text-white disabled:opacity-70"
          >
            {emailSaving ? "Guardando…" : copyGate.emailMissing.submit}
          </button>
        </form>
      </div>
    ) : (
      <div className="space-y-3 text-center">
        {gateHint ? (
          <p className="rounded-xl border border-[#C6D92D]/35 bg-[#F4F9E0] px-4 py-3 text-[13px] leading-relaxed text-[#243647]">
            {gateHint}
          </p>
        ) : null}
        <h2 className="text-base font-bold text-[#0B2E59]">
          {copyGate.emailMissing.title}
        </h2>
        <p className="text-sm leading-relaxed text-[#6B7A8C]">
          {copyGate.emailMissing.body}
        </p>
        <form onSubmit={(e) => void submitEmail(e)} className="space-y-3 pt-1 text-left">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#243647]">
              {copyGate.emailMissing.fieldLabel}
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              placeholder="tu@email.com"
              className="min-h-[48px] w-full rounded-xl border border-[#E8EEF3] px-4 text-sm"
            />
          </label>
          <label className="flex items-start gap-3 text-left text-sm text-[#243647]">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[#0B2E59]"
            />
            <span>{copyGate.emailMissing.consent}</span>
          </label>
          {emailError ? (
            <p className="text-sm text-[#DC2626]" role="alert">
              {emailError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={emailSaving}
            className="inline-block w-full rounded-xl bg-[#0B2E59] px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
          >
            {emailSaving ? "Guardando…" : copyGate.emailMissing.submit}
          </button>
        </form>
        <Link
          href={backHref}
          className="inline-block text-sm font-semibold text-[#1A9BB0] underline"
        >
          {COMMUNITY_ACTION_GATE_COPY.ctaBack}
        </Link>
      </div>
    );
  } else if (reason === "profile_incomplete") {
    card = compact ? (
      <div className="space-y-2 text-left">
        {gateHint ? (
          <p className="text-[12px] leading-relaxed text-[#6B7A8C]">{gateHint}</p>
        ) : null}
        <p className="text-[13px] font-semibold text-[#0B2E59]">
          {copyGate.profileIncomplete.title}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={completarHref}
            className="vu-focus inline-flex min-h-[40px] items-center rounded-xl bg-[#0B2E59] px-3 text-[12px] font-semibold text-white"
          >
            {copyGate.profileIncomplete.cta}
          </Link>
          <Link
            href={continuarHref}
            className="vu-focus inline-flex min-h-[40px] items-center rounded-xl border border-[#E8EEF3] px-3 text-[12px] font-semibold text-[#1A9BB0]"
          >
            {copyGate.identityMissing.ctaResume}
          </Link>
        </div>
      </div>
    ) : (
      <div className="space-y-3 text-center">
        {gateHint ? (
          <p className="rounded-xl border border-[#C6D92D]/35 bg-[#F4F9E0] px-4 py-3 text-[13px] leading-relaxed text-[#243647]">
            {gateHint}
          </p>
        ) : null}
        <h2 className="text-base font-bold text-[#0B2E59]">
          {copyGate.profileIncomplete.title}
        </h2>
        <p className="text-sm leading-relaxed text-[#6B7A8C]">
          {copyGate.profileIncomplete.body}
        </p>
        <div className="flex flex-col gap-2 pt-1">
          <Link
            href={completarHref}
            className="inline-block w-full rounded-xl bg-[#0B2E59] px-5 py-3 text-sm font-semibold text-white"
          >
            {copyGate.profileIncomplete.cta}
          </Link>
          <Link
            href={continuarHref}
            className="inline-block text-sm font-semibold text-[#1A9BB0] underline"
          >
            {copyGate.identityMissing.ctaResume}
          </Link>
          <Link
            href={backHref}
            className="inline-block text-sm font-semibold text-[#1A9BB0] underline"
          >
            {COMMUNITY_ACTION_GATE_COPY.ctaBack}
          </Link>
        </div>
      </div>
    );
  } else {
    // no_local_identity | profile_missing
    card = compact ? (
      <div className="space-y-2 text-left">
        {gateHint ? (
          <p className="text-[12px] leading-relaxed text-[#6B7A8C]">{gateHint}</p>
        ) : (
          <p className="text-[12px] leading-relaxed text-[#6B7A8C]">
            {copyGate.identityMissingCompact.body}
          </p>
        )}
        <p className="text-[13px] font-semibold text-[#0B2E59]">
          {copyGate.identityMissingCompact.title}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={continuarHref}
            className="vu-focus inline-flex min-h-[40px] items-center rounded-xl bg-[#0B2E59] px-3 text-[12px] font-semibold text-white"
          >
            {copyGate.identityMissingCompact.ctaResume}
          </Link>
          <Link
            href={crearHref}
            className="vu-focus inline-flex min-h-[40px] items-center rounded-xl border border-[#E8EEF3] bg-[#F8FAFC] px-3 text-[12px] font-semibold text-[#0B2E59]"
          >
            {copyGate.identityMissingCompact.ctaCreate}
          </Link>
        </div>
      </div>
    ) : (
      <div className="space-y-3 text-center">
        {gateHint ? (
          <p className="rounded-xl border border-[#C6D92D]/35 bg-[#F4F9E0] px-4 py-3 text-[13px] leading-relaxed text-[#243647]">
            {gateHint}
          </p>
        ) : null}
        <h2 className="text-base font-bold text-[#0B2E59]">
          {copyGate.identityMissing.title}
        </h2>
        <p className="text-sm leading-relaxed text-[#6B7A8C]">
          {copyGate.identityMissing.body}
        </p>
        <div className="flex flex-col gap-2 pt-1">
          <Link
            href={continuarHref}
            className="inline-block w-full rounded-xl bg-[#0B2E59] px-5 py-3 text-sm font-semibold text-white"
          >
            {copyGate.identityMissing.ctaResume}
          </Link>
          <Link
            href={crearHref}
            className="inline-block w-full rounded-xl border border-[#E8EEF3] bg-[#F8FAFC] px-5 py-3 text-sm font-semibold text-[#0B2E59]"
          >
            {copyGate.identityMissing.ctaCreate}
          </Link>
          <Link
            href={backHref}
            className="inline-block text-sm font-semibold text-[#1A9BB0] underline"
          >
            {COMMUNITY_ACTION_GATE_COPY.ctaBack}
          </Link>
        </div>
      </div>
    );
  }

  if (compact && mode === "inline") {
    return (
      <div className="rounded-xl border border-[#E8EEF3] bg-[#F8FAFC] p-3">{card}</div>
    );
  }

  return shellCard(mode, card);
}
