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
import {
  uploadProfileMedia,
  withTimeout,
} from "@/lib/users/uploadProfileMediaClient";
import { ProfilePhotosEditor } from "@/components/perfil/ProfilePhotosEditor";

function mediaUploadError(
  kind: "cover" | "avatar",
  code: string | undefined,
): string {
  if (code === "image_too_large") {
    return kind === "cover"
      ? "La portada supera 3 MB."
      : "La foto supera 3 MB. Elegí otra más liviana.";
  }
  if (code === "image_invalid_type") {
    return "Formato no válido. Usá JPG o PNG (si el celu guardó HEIC, exportá como JPG).";
  }
  if (code?.startsWith("blob_not_configured")) {
    return "El almacenamiento del sitio aún no está listo. Probá en unos minutos o avisá al equipo.";
  }
  if (code?.endsWith("_upload_timeout")) {
    return kind === "cover"
      ? "La portada tardó demasiado en subir."
      : "La foto tardó demasiado en subir. Probá con otra imagen o mejor señal.";
  }
  if (code === "image_empty") {
    return "La imagen llegó vacía. Elegí la foto otra vez.";
  }
  if (code === "image_load_failed") {
    return "No pudimos leer esa imagen. Probá otra de la galería o sacá una foto nueva con la cámara.";
  }
  if (code?.includes("upload_failed")) {
    return kind === "cover"
      ? "No se pudo guardar la portada. Probá con JPG más liviana."
      : "No se pudo guardar la foto en el servidor. Probá con JPG o PNG (máx. 3 MB).";
  }
  return kind === "cover"
    ? "No se pudo guardar la portada."
    : "Elegí una foto de perfil (JPG o PNG) y esperá a ver «Foto lista» antes de continuar.";
}

function errorCodeFromThrown(err: unknown): string | undefined {
  if (!(err instanceof Error)) return undefined;
  const msg = err.message;
  const head = msg.includes(":") ? msg.split(":")[0] : msg;
  if (head.includes("upload_failed")) return head;
  return head;
}

function profileSaveError(code: string | undefined): string {
  if (code?.startsWith("blob_not_configured")) {
    return "El almacenamiento del sitio aún no está listo. Probá en unos minutos o avisá al equipo.";
  }
  if (code === "profile_save_timeout") {
    return "Guardar el perfil tardó demasiado. Revisá la conexión e intentá de nuevo.";
  }
  if (code === "profile_incomplete") {
    return "Completá todos los campos obligatorios del perfil.";
  }
  return code ?? "No se pudo guardar el perfil";
}

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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!avatarFile) return;

    let cancelled = false;
    const file = avatarFile;
    const userId = getOrCreateUserId();

    setAvatarUploading(true);
    setAvatarError("");

    uploadProfileMedia("avatar", userId, file)
      .then((url) => {
        if (cancelled) return;
        setAvatarUrl(url);
        setAvatarFile(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setAvatarError(mediaUploadError("avatar", errorCodeFromThrown(err)));
      })
      .finally(() => {
        if (!cancelled) setAvatarUploading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [avatarFile]);

  useEffect(() => {
    if (!coverFile) return;

    let cancelled = false;
    const file = coverFile;
    const userId = getOrCreateUserId();

    setCoverUploading(true);

    uploadProfileMedia("cover", userId, file)
      .then((url) => {
        if (cancelled) return;
        setCoverUrl(url);
        setCoverFile(null);
      })
      .catch(() => {
        // Portada opcional: el preview local alcanza; se reintenta al guardar si hace falta.
      })
      .finally(() => {
        if (!cancelled) setCoverUploading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [coverFile]);

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
    setAvatarUrl(profile.avatarUrl);
    setCoverUrl(profile.coverUrl ?? null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const userId = getOrCreateUserId();

    try {
      if (avatarUploading) {
        setError("Esperá unos segundos: la foto de perfil se está subiendo.");
        return;
      }

      let resolvedAvatarUrl = avatarUrl?.trim() || null;
      let resolvedCoverUrl = coverUrl?.trim() || null;

      if (!resolvedAvatarUrl && avatarFile) {
        try {
          resolvedAvatarUrl = await uploadProfileMedia("avatar", userId, avatarFile);
          setAvatarUrl(resolvedAvatarUrl);
          setAvatarFile(null);
        } catch (err) {
          throw new Error(mediaUploadError("avatar", errorCodeFromThrown(err)));
        }
      }

      if (!resolvedCoverUrl && coverFile) {
        try {
          resolvedCoverUrl = await uploadProfileMedia("cover", userId, coverFile);
          setCoverUrl(resolvedCoverUrl);
          setCoverFile(null);
        } catch (err) {
          setError(
            `${mediaUploadError("cover", errorCodeFromThrown(err))} Podés crear el perfil igual; después editás la portada.`,
          );
        }
      }

      if (!resolvedAvatarUrl) {
        setAvatarError(
          avatarError ||
            "Falta la foto de perfil. Tocá el círculo de la foto, elegí JPG o PNG y esperá «Foto lista».",
        );
        return;
      }

      const res = await withTimeout(
        fetch("/api/user-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            displayName,
            headline,
            momentoActual,
            country: country.trim() || undefined,
            buscando: parseChipInput(buscandoRaw),
            aportar: parseChipInput(aportarRaw),
            avatarUrl: resolvedAvatarUrl,
            coverUrl: resolvedCoverUrl,
            diagnosticArchiveId: getFoundingMemberArchiveId(),
            cohortBatch: getFoundationalCohortBatch(),
          }),
        }),
        30_000,
        "profile_save_timeout",
      );

      const data = (await res.json()) as {
        ok?: boolean;
        profile?: VuUserProfileRecord;
        error?: string;
      };
      if (!data.ok || !data.profile) {
        throw new Error(profileSaveError(data.error));
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
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#F8FAFC] px-5 py-10 pb-16 font-[family-name:var(--font-inter)]">
      <div className="relative z-10 mx-auto max-w-lg space-y-6">
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

        <ProfilePhotosEditor
          displayName={displayName}
          existingAvatarUrl={avatarUrl}
          existingCoverUrl={coverUrl}
          avatarFile={avatarFile}
          coverFile={coverFile}
          onAvatarChange={setAvatarFile}
          onCoverChange={setCoverFile}
          avatarError={avatarError}
          avatarUploading={avatarUploading}
          avatarReady={Boolean(avatarUrl?.trim()) && !avatarUploading}
          coverUploading={coverUploading}
        />

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
            disabled={saving || avatarUploading || !avatarUrl?.trim()}
            className="w-full rounded-xl bg-[#0B2E59] py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving
              ? "Guardando…"
              : avatarUploading
                ? "Subiendo foto…"
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
