"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { COMMUNITY_ACTION_GATE_COPY } from "@/lib/content/communityActionGateCopy";
import { isFounderCommunityPreviewActive } from "@/lib/founder/communityPreviewBypass";
import {
  fetchCommunityContact,
  fetchUserProfile,
  getOrCreateUserId,
} from "@/lib/users/activeUserSession";
import { isUserProfileComplete } from "@/lib/users/userProfileTypes";

type Props = {
  children: React.ReactNode;
  /** Ruta a la que volver desde el gate (p. ej. ficha de proyecto) */
  returnTo?: string;
  /** inline: tarjeta dentro de la página; page: pantalla centrada */
  mode?: "inline" | "page";
};

export function CommunityActionGate({
  children,
  returnTo,
  mode = "inline",
}: Props) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const backHref = returnTo ?? pathname ?? "/plaza";
  const crearHref = `/perfil/crear?redirect=${encodeURIComponent(backHref)}`;

  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (isFounderCommunityPreviewActive()) {
        if (!cancelled) {
          setAllowed(true);
          setReady(true);
        }
        return;
      }

      const userId = getOrCreateUserId();
      const [profile, contact] = await Promise.all([
        fetchUserProfile(userId),
        fetchCommunityContact(userId),
      ]);

      if (!cancelled) {
        setAllowed(
          Boolean(profile && isUserProfileComplete(profile) && contact.hasEmail),
        );
        setReady(true);
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
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

  if (!allowed) {
    const copy = COMMUNITY_ACTION_GATE_COPY;
    const card = (
      <div className="space-y-3 text-center">
        <h2 className="text-base font-bold text-[#0B2E59]">{copy.title}</h2>
        <p className="text-sm leading-relaxed text-[#6B7A8C]">{copy.body}</p>
        <div className="flex flex-col gap-2 pt-1">
          <Link
            href={crearHref}
            className="inline-block w-full rounded-xl bg-[#0B2E59] px-5 py-3 text-sm font-semibold text-white"
          >
            {copy.ctaComplete}
          </Link>
          <Link
            href={backHref}
            className="inline-block text-sm font-semibold text-[#1A9BB0] underline"
          >
            {copy.ctaBack}
          </Link>
        </div>
      </div>
    );

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

  return <>{children}</>;
}
