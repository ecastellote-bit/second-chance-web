"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { initialsFromName } from "@/lib/users/userProfileTypes";

const DEFAULT_COVER_PREVIEW = "/vu/llegada-silenciosa-patio.jpeg";

type Props = {
  displayName: string;
  existingAvatarUrl?: string | null;
  existingCoverUrl?: string | null;
  avatarFile: File | null;
  coverFile: File | null;
  onAvatarChange: (file: File | null) => void;
  onCoverChange: (file: File | null) => void;
  avatarError?: string;
};

export function ProfilePhotosEditor({
  displayName,
  existingAvatarUrl,
  existingCoverUrl,
  avatarFile,
  coverFile,
  onAvatarChange,
  onCoverChange,
  avatarError,
}: Props) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreview(null);
      return;
    }
    const url = URL.createObjectURL(coverFile);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  const avatarShow = avatarPreview ?? existingAvatarUrl ?? null;
  const coverShow = coverPreview ?? existingCoverUrl ?? DEFAULT_COVER_PREVIEW;
  const initials = initialsFromName(displayName || "?");

  return (
    <div className="overflow-hidden rounded-[28px] border border-[#E8EEF3] shadow-[0_8px_32px_rgba(11,46,89,0.1)]">
      <div className="relative flex min-h-[280px] flex-col bg-[#0B2E59]">
        <button
          type="button"
          onClick={() => coverInputRef.current?.click()}
          className="vu-focus relative block min-h-[168px] w-full flex-[7] overflow-hidden"
          aria-label="Elegir foto de portada"
        >
          <Image
            src={coverShow}
            alt=""
            fill
            unoptimized
            className="object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(11,46,89,0.05) 0%, transparent 50%, rgba(11,46,89,0.3) 75%, rgba(11,46,89,0.8) 100%)",
            }}
          />
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold text-[#0B2E59] shadow-sm">
            Cambiar portada
          </span>
        </button>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => onCoverChange(e.target.files?.[0] ?? null)}
        />

        <div className="relative min-h-[120px] flex-[3] bg-[#0B2E59] px-5 pb-5">
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="vu-focus absolute left-1/2 top-0 z-10 h-[120px] w-[120px] -translate-x-1/2 -translate-y-[68%] sm:h-[128px] sm:w-[128px] sm:-translate-y-[70%]"
            aria-label="Elegir foto de perfil"
          >
            <span
              className="pointer-events-none absolute -inset-3 rounded-full opacity-80 blur-xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(198,217,45,0.4) 0%, rgba(26,155,176,0.3) 55%, transparent 70%)",
              }}
            />
            <span className="relative block h-full w-full overflow-hidden rounded-full bg-[#1A9BB0] ring-[5px] ring-[#F8FAFC] shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
              {avatarShow ? (
                <Image
                  src={avatarShow}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover object-[center_20%]"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-white">
                  {initials}
                </span>
              )}
            </span>
            <span className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-[#C6D92D] text-[11px] font-bold text-[#0B2E59] shadow-md ring-2 ring-white">
              +
            </span>
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            required={!existingAvatarUrl}
            onChange={(e) => onAvatarChange(e.target.files?.[0] ?? null)}
          />

          <p className="relative z-20 pt-[66px] text-center text-[1.35rem] font-extrabold tracking-tight text-white sm:pt-[70px] sm:text-[1.5rem]">
            {displayName.trim() || "Tu nombre"}
          </p>
          <p className="mt-1 text-center text-[11px] font-medium uppercase tracking-wider text-[#C6D92D]">
            Vista previa del perfil
          </p>
        </div>
      </div>

      <div className="space-y-2 bg-white px-4 py-4">
        <p className="text-sm font-semibold text-[#0B2E59]">
          Foto de perfil <span className="text-[#DC2626]">*</span> y portada (opcional)
        </p>
        <p className="text-[12px] leading-relaxed text-[#6B7A8C]">
          La portada es independiente del rostro: un paisaje del barrio, tu espacio de trabajo o
          una escena que te represente. La foto de perfil sigue siendo obligatoria por seguridad.
          JPG, PNG o WebP · hasta 3 MB cada una.
        </p>
        {avatarError ? <p className="text-sm text-red-700">{avatarError}</p> : null}
      </div>
    </div>
  );
}
