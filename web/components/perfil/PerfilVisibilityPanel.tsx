"use client";

import { useState } from "react";
import {
  canAppearInDirectory,
  resolvePublicProfileUrl,
  saveUserProfileFromClient,
} from "@/lib/users/profileClientHelpers";
import type { UserProfileClientView } from "@/lib/users/userProfileTypes";

type Props = {
  profile: UserProfileClientView;
  onProfileUpdated: (profile: UserProfileClientView) => void;
};

export function PerfilVisibilityPanel({ profile, onProfileUpdated }: Props) {
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const directoryReady = canAppearInDirectory(profile);
  const isVisible = profile.visibleEnDirectorio === true;
  const slug = profile.slug?.trim();
  const publicUrl = slug && isVisible ? resolvePublicProfileUrl(slug) : null;

  async function handleVisibilityChange(nextVisible: boolean) {
    if (!directoryReady && nextVisible) return;

    setSaving(true);
    setError("");
    setSaveOk(false);

    try {
      const updated = await saveUserProfileFromClient(profile, {
        visibleEnDirectorio: nextVisible,
      });
      onProfileUpdated(updated);
      setSaveOk(true);
      window.setTimeout(() => setSaveOk(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleCopyUrl() {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setError("No pudimos copiar el enlace. Seleccionalo manualmente.");
    }
  }

  return (
    <section
      className="mx-auto max-w-[800px] rounded-2xl border border-[#E8EEF3] bg-white p-5 shadow-sm"
      aria-labelledby="perfil-visibility-title"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h2
            id="perfil-visibility-title"
            className="text-lg font-semibold text-[#0B2E59]"
          >
            Aparecer en el Directorio VocationUp
          </h2>
          <p className="mt-1 text-base leading-relaxed text-[#6B7A8C]">
            Permití que otros miembros me encuentren por mi vocación y me contacten.
          </p>
          {!directoryReady ? (
            <p className="mt-3 text-base font-medium text-[#D97706]">
              Completá tu nombre, foto y headline para aparecer en el directorio.
            </p>
          ) : null}
        </div>

        <label className="flex min-h-[48px] cursor-pointer items-center gap-3 self-start sm:shrink-0">
          <span className="sr-only">Hacer mi perfil público en el directorio</span>
          <input
            type="checkbox"
            role="switch"
            aria-checked={isVisible}
            checked={isVisible}
            disabled={!directoryReady || saving}
            onChange={(event) => void handleVisibilityChange(event.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className={[
              "relative inline-flex h-8 w-14 shrink-0 rounded-full transition-colors",
              "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#1A9BB0]",
              isVisible ? "bg-[#1A9BB0]" : "bg-[#CBD5E1]",
              !directoryReady || saving ? "opacity-50" : "",
            ].join(" ")}
          >
            <span
              className={[
                "absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform",
                isVisible ? "translate-x-6" : "translate-x-0",
                saving ? "opacity-70" : "",
              ].join(" ")}
            />
          </span>
          <span className="min-w-[4.5rem] text-base font-semibold text-[#243647]">
            {saving ? "Guardando…" : isVisible ? "Público" : "Privado"}
          </span>
        </label>
      </div>

      {saveOk ? (
        <p className="mt-3 text-base font-medium text-[#059669]" role="status">
          Visibilidad actualizada.
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 text-base font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {publicUrl ? (
        <div className="mt-5 space-y-3 border-t border-[#E8EEF3] pt-5">
          <p className="text-base font-semibold text-[#0B2E59]">Tu perfil público</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="min-h-[48px] flex-1 rounded-xl border border-[#E8EEF3] bg-[#F8FAFC] px-4 text-base text-[#243647]"
              aria-label="URL pública de tu perfil"
            />
            <button
              type="button"
              onClick={() => void handleCopyUrl()}
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[#0B2E59] px-5 text-base font-bold text-white transition hover:bg-[#081f3d]"
            >
              {copied ? "¡Copiado!" : "Copiar enlace"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
