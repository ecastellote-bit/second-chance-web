"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PROFILE_FLOW_COPY } from "@/lib/content/profileFlowCopy";
import { ensureFoundingMemberAccess } from "@/lib/learning/ensureFoundingMemberAccess";
import {
  fetchClientSessionGate,
  isProfileCompleteCached,
} from "@/lib/users/activeUserSession";
import { FounderPreviewBanner } from "@/components/founder/FounderPreviewBanner";
import { isFounderCommunityPreviewActive } from "@/lib/founder/communityPreviewBypass";

/**
 * Bloquea interacción en el barrio hasta tener perfil completo en VocationUp.
 * Distingue: sin identidad local, perfil incompleto, perfil listo.
 * (Email se exige en CommunityActionGate / API de acción, no en este gate de navegación.)
 */
export function UserProfileGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [reason, setReason] = useState<string>("profile_missing");

  const crearHref = `/perfil/crear?redirect=${encodeURIComponent(pathname || "/plaza")}`;
  const continuarHref = `/perfil/continuar?redirect=${encodeURIComponent(pathname || "/plaza")}`;
  const completarHref = `/perfil/editar?redirect=${encodeURIComponent(pathname || "/plaza")}`;

  const recheck = useCallback(async () => {
    if (isFounderCommunityPreviewActive()) {
      setHasProfile(true);
      setReady(true);
      return;
    }

    // Cache local solo como atajo; siempre revalidamos contra servidor.
    if (isProfileCompleteCached()) {
      await ensureFoundingMemberAccess();
    }

    const gate = await fetchClientSessionGate();
    await ensureFoundingMemberAccess();

    // Navegación del barrio: alcanza con perfil completo (email es para acciones de contactabilidad).
    const ok =
      gate.reason === "ready" ||
      gate.reason === "email_missing";

    setHasProfile(ok);
    setReason(gate.reason);
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
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [recheck]);

  if (!ready) {
    return (
      <div className="flex min-h-[40dvh] items-center justify-center text-sm text-[#6B7A8C]">
        Verificando tu perfil…
      </div>
    );
  }

  if (!hasProfile) {
    const copy = PROFILE_FLOW_COPY;
    const isIncomplete = reason === "profile_incomplete";
    const title = isIncomplete
      ? copy.profileIncomplete.title
      : copy.identityMissing.title;
    const body = isIncomplete
      ? copy.profileIncomplete.body
      : copy.identityMissing.body;

    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#F8FAFC] px-6 font-[family-name:var(--font-inter)]">
        <div className="max-w-md space-y-4 rounded-2xl border border-[#E8EEF3] bg-white p-6 text-center shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
            VocationUp
          </p>
          <h1 className="text-xl font-bold text-[#0B2E59]">{title}</h1>
          <p className="text-sm leading-relaxed text-[#6B7A8C]">{body}</p>
          {isIncomplete ? (
            <Link
              href={completarHref}
              className="inline-block w-full rounded-xl bg-[#0B2E59] px-5 py-3 text-sm font-semibold text-white"
            >
              {copy.profileIncomplete.cta}
            </Link>
          ) : (
            <>
              <Link
                href={continuarHref}
                className="inline-block w-full rounded-xl bg-[#0B2E59] px-5 py-3 text-sm font-semibold text-white"
              >
                {copy.identityMissing.ctaResume}
              </Link>
              <Link
                href={crearHref}
                className="inline-block w-full rounded-xl border border-[#E8EEF3] bg-[#F8FAFC] px-5 py-3 text-sm font-semibold text-[#0B2E59]"
              >
                {copy.identityMissing.ctaCreate}
              </Link>
            </>
          )}
          <Link
            href={continuarHref}
            className="inline-block text-sm font-semibold text-[#1A9BB0] underline"
          >
            {copy.gate.ctaSignIn}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <FounderPreviewBanner />
      {children}
    </>
  );
}
