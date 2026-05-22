"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PROFILE_FLOW_COPY } from "@/lib/content/profileFlowCopy";
import {
  fetchUserProfile,
  getOrCreateUserId,
  isProfileCompleteCached,
} from "@/lib/users/activeUserSession";
import { isUserProfileComplete } from "@/lib/users/userProfileTypes";

/**
 * Bloquea interacción en el barrio hasta tener perfil completo en VocationUp.
 */
export function UserProfileGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const crearHref = `/perfil/crear?redirect=${encodeURIComponent(pathname || "/plaza")}`;

  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (isProfileCompleteCached()) {
        if (!cancelled) {
          setHasProfile(true);
          setReady(true);
        }
        return;
      }

      const profile = await fetchUserProfile(getOrCreateUserId());
      if (!cancelled) {
        setHasProfile(isUserProfileComplete(profile));
        setReady(true);
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-[40dvh] items-center justify-center text-sm text-[#6B7A8C]">
        Verificando tu perfil…
      </div>
    );
  }

  if (!hasProfile) {
    const copy = PROFILE_FLOW_COPY.gate;
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#F8FAFC] px-6 font-[family-name:var(--font-inter)]">
        <div className="max-w-md space-y-4 rounded-2xl border border-[#E8EEF3] bg-white p-6 text-center shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
            VocationUp
          </p>
          <h1 className="text-xl font-bold text-[#0B2E59]">{copy.title}</h1>
          <p className="text-sm leading-relaxed text-[#6B7A8C]">{copy.body}</p>
          <Link
            href={crearHref}
            className="inline-block w-full rounded-xl bg-[#0B2E59] px-5 py-3 text-sm font-semibold text-white"
          >
            {copy.ctaCreate}
          </Link>
          <Link
            href="/perfil"
            className="inline-block text-sm font-semibold text-[#1A9BB0] underline"
          >
            {copy.ctaSignIn}
          </Link>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
