"use client";

import Link from "next/link";
import { useState } from "react";
import { PublicProfileCard } from "@/components/profile/PublicProfileCard";
import {
  canAppearInDirectory,
  clientViewToProfileRecord,
} from "@/lib/users/profileClientHelpers";
import type { UserProfileClientView } from "@/lib/users/userProfileTypes";

type Props = {
  profile: UserProfileClientView;
};

export function PerfilPreviewMode({ profile }: Props) {
  const slug = profile.slug?.trim();
  const isPrivate = profile.visibleEnDirectorio !== true;

  if (!slug) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#F8FAFC] px-6 pt-24 text-center font-[family-name:var(--font-inter)]">
        <p className="max-w-md text-lg leading-relaxed text-[#6B7A8C]">
          Guardá tu perfil para generar tu enlace público. El slug se crea automáticamente al
          guardar.
        </p>
        <Link
          href="/perfil/editar"
          className="mt-8 inline-flex min-h-[48px] items-center rounded-2xl bg-[#0B2E59] px-6 text-base font-bold text-white"
        >
          Ir a editar perfil
        </Link>
      </main>
    );
  }

  if (!canAppearInDirectory(profile)) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#F8FAFC] px-6 pt-24 text-center font-[family-name:var(--font-inter)]">
        <p className="max-w-md text-lg leading-relaxed text-[#6B7A8C]">
          Completá tu nombre, foto y headline para previsualizar tu tarjeta pública.
        </p>
        <Link
          href="/perfil/editar"
          className="mt-8 inline-flex min-h-[48px] items-center rounded-2xl bg-[#0B2E59] px-6 text-base font-bold text-white"
        >
          Completar perfil
        </Link>
      </main>
    );
  }

  return (
    <div>
      {isPrivate ? (
        <div
          className="mb-4 rounded-2xl border border-[#C6D92D]/40 bg-[#FFFBEB] px-5 py-4 text-center text-base leading-relaxed text-[#0B2E59]"
          role="status"
        >
          Tu perfil es privado. Activá la visibilidad para que otros puedan encontrarte en el
          directorio.
        </div>
      ) : null}
      <PublicProfileCard profile={clientViewToProfileRecord(profile)} />
    </div>
  );
}
