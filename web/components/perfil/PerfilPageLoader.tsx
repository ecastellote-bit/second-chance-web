"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PerfilUsuarioView } from "@/components/perfil/PerfilUsuarioView";
import {
  fetchUserProfile,
  getOrCreateUserId,
} from "@/lib/users/activeUserSession";
import { userProfileToPerfilView } from "@/lib/users/profileToPerfilView";
import {
  isUserProfileComplete,
  type VuUserProfileRecord,
} from "@/lib/users/userProfileTypes";

export function PerfilPageLoader() {
  const router = useRouter();
  const [profile, setProfile] = useState<VuUserProfileRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchUserProfile(getOrCreateUserId()).then((p) => {
      if (cancelled) return;
      if (!isUserProfileComplete(p)) {
        router.replace("/perfil/crear");
        return;
      }
      setProfile(p);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[#F8FAFC] text-sm text-[#6B7A8C]">
        Cargando tu perfil…
      </main>
    );
  }

  if (!profile) return null;

  return (
    <>
      <div className="fixed right-4 top-[max(1rem,env(safe-area-inset-top))] z-40 lg:right-8">
        <Link
          href="/perfil/editar"
          className="rounded-full bg-white/95 px-4 py-2 text-[12px] font-bold text-[#0B2E59] shadow-md ring-1 ring-[#E8EEF3]"
        >
          Editar perfil
        </Link>
      </div>
      <PerfilUsuarioView profile={userProfileToPerfilView(profile)} />
    </>
  );
}
